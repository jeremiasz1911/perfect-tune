import * as functions from "firebase-functions";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import crypto from "crypto";
import PDFDocument from "pdfkit";

initializeApp();
const db = getFirestore();
const bucket = getStorage().bucket();

// nad app.post("/initiatePayment") – stałe:
const PROJECT_ID = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || "";
const REGION = "us-central1"; // to samo co w exports.api
const PUBLIC_FN_URL =
  `https://${REGION}-${PROJECT_ID}.cloudfunctions.net/api`;
const app = express();



app.use(cors({ origin: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ===== Pomocnicze: numeracja faktur =====
async function getNextInvoiceNumber(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  const counterRef = db.collection("meta").doc("invoiceCounter");
  const docSnap = await counterRef.get();

  let seq = 1;
  let prefix = `${year}/${month}`;

  if (!docSnap.exists) {
    await counterRef.set({ prefix, seq });
  } else {
    const data = docSnap.data() as any;
    if (data.prefix === prefix) {
      seq = (data.seq || 0) + 1;
      await counterRef.update({ seq });
    } else {
      seq = 1;
      await counterRef.set({ prefix, seq });
    }
  }

  return `${prefix}/${String(seq).padStart(3, "0")}`;
}

// ===== PDF: generator do bufora =====
function buildInvoicePdfBuffer(inv: any, seller: any, buyer: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const chunks: Buffer[] = [];

    doc.on("data", (d) => chunks.push(d));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Nagłówek
    doc.fontSize(18).text("Faktura", { align: "right" });
    doc.moveDown(0.25);
    doc.fontSize(12).text(`Nr: ${inv.number}`, { align: "right" });
    doc.text(`Data wystawienia: ${inv.issueDate}`, { align: "right" });
    if (inv.paidAt) doc.text(`Data opłacenia: ${inv.paidAt}`, { align: "right" });

    doc.moveDown(1);
    doc.fontSize(14).text("Sprzedawca", { underline: true });
    doc.fontSize(11).text(seller.name);
    if (seller.address) doc.text(seller.address);
    if (seller.nip) doc.text(`NIP: ${seller.nip}`);

    doc.moveDown(1);
    doc.fontSize(14).text("Nabywca", { underline: true });
    doc.fontSize(11).text(buyer.name || buyer.email || "Klient");
    if (buyer.email) doc.text(buyer.email);
    if (buyer.address) doc.text(buyer.address);

    doc.moveDown(1.5);
    doc.fontSize(13).text("Pozycje:", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11);

    // Tabela (prosta)
    doc.text("Opis", 40, doc.y, { continued: true, width: 300 });
    doc.text("Ilość", 340, doc.y, { continued: true });
    doc.text("Cena", 400, doc.y, { continued: true });
    doc.text("Wartość", 470, doc.y);
    doc.moveTo(40, doc.y + 2).lineTo(560, doc.y + 2).stroke();

    const items = inv.items || [
      {
        name: inv.description || "Usługa edukacyjna",
        qty: 1,
        price: inv.amountGross,
        total: inv.amountGross,
      },
    ];

    let sum = 0;
    for (const it of items) {
      doc.text(it.name, 40, doc.y + 8, { continued: true, width: 300 });
      doc.text(String(it.qty), 340, doc.y, { continued: true });
      doc.text(`${Number(it.price).toFixed(2)} ${inv.currency}`, 400, doc.y, { continued: true });
      doc.text(`${Number(it.total).toFixed(2)} ${inv.currency}`, 470, doc.y);
      sum += Number(it.total);
    }

    doc.moveDown(1);
    doc.fontSize(12).text(`Razem do zapłaty: ${sum.toFixed(2)} ${inv.currency}`, { align: "right" });
    if (inv.status === "paid") {
      doc.fillColor("green").text("STATUS: OPŁACONA", { align: "right" }).fillColor("black");
    }

    doc.moveDown(2);
    doc.fontSize(9).text("Dziękujemy za terminową płatność.", { align: "center" });

    doc.end();
  });
}

// ===== Tworzenie faktury (dokument + PDF w Storage) =====
async function createInvoiceForPayment(paymentId: string): Promise<string> {
  const payRef = db.collection("payments").doc(paymentId);
  const paySnap = await payRef.get();
  if (!paySnap.exists) throw new Error("Payment not found");

  const p = paySnap.data() as any;

  // Jeśli już ma invoiceId – nic nie rób
  if (p.invoiceId) return p.invoiceId;

  const number = await getNextInvoiceNumber();
  const issueDate = new Date().toISOString().split("T")[0];

  // Sprzedawca (stałe – podmień na dane Twojej szkoły)
  const seller = {
    name: "MusicAcademy Sp. z o.o.",
    address: "ul. Dźwiękowa 10, 00-001 Warszawa",
    nip: "123-456-78-90"
  };

  // Nabywca
  const buyer = {
    name: p.parentName || "Rodzic",
    email: p.email || "",
    address: p.parentAddress || "",
  };

  // Dokument faktury
  const invDoc = {
    number,
    issueDate,
    paidAt: issueDate,
    status: "paid",
    currency: p.currency || "PLN",
    amountGross: (p.amount / 100), // p.amount w groszach
    description: p.description || "Opłata za zajęcia",
    parentId: p.userId,
    childId: p.childId || null,
    classId: p.classId || null,
    paymentId,
    items: [
      {
        name: p.description || "Zajęcia muzyczne",
        qty: 1,
        price: (p.amount / 100),
        total: (p.amount / 100),
      }
    ],
    seller,
    buyer,
    pdfPath: "", // uzupełnimy po uploadzie
    pdfUrl: "",  // jeśli zrobisz publiczny plik
  };

  // Zapisz dokument faktury
  const invRef = await db.collection("invoices").add(invDoc);
  const invoiceId = invRef.id;

  // Zbuduj PDF → Buffer
  const buffer = await buildInvoicePdfBuffer({ ...invDoc, id: invoiceId }, seller, buyer);

  // Upload do Storage
  const pdfPath = `invoices/${invoiceId}.pdf`;
  const file = bucket.file(pdfPath);
  await file.save(buffer, {
    contentType: "application/pdf",
    resumable: false,
    metadata: { cacheControl: "public, max-age=3600" },
  });

  // (opcjonalnie) Upublicznij i daj link publiczny:
  // await file.makePublic();
  // const pdfUrl = `https://storage.googleapis.com/${bucket.name}/${pdfPath}`;

  await invRef.update({ pdfPath /*, pdfUrl*/ });
  await payRef.update({ invoiceId });

  return invoiceId;
}

// === /initiatePayment – bez zmian poza Twoimi logami ===
// w CF /initiatePayment

const TPAY_ID     = process.env.TPAY_ID!;
const TPAY_CRC    = process.env.TPAY_CRC!;      // z panelu Tpay
const TPAY_SECRET = process.env.TPAY_SECRET!;   // Security code
const GATEWAY = process.env.TPAY_ENV === "sandbox"
  ? "https://secure.sandbox.tpay.com"
  : "https://secure.tpay.com";

app.post("/initiatePayment", async (req, res) => {
  const { amount, description, email, returnUrl, successUrl, failureUrl } = req.body;

  const amountText = Number(amount).toFixed(2); // KLUCZOWE: 2 miejsca i kropka
  const md5Input   = `${TPAY_ID}${amountText}${TPAY_CRC}${TPAY_SECRET}`;
  const md5sum     = crypto.createHash("md5").update(md5Input, "utf8").digest("hex");

  const form: Record<string, string> = {
    id: String(TPAY_ID),
    // daj oba aliasy – nie każdy merchant ma ten sam wariant
    amount: amountText,
    kwota: amountText,
    description: String(description || "Opłata za zajęcia"),
    opis: String(description || "Opłata za zajęcia"),
    email: String(email || ""),
    crc: String(TPAY_CRC),
    md5sum,
    return_url: String(successUrl || returnUrl || ""),
    error_url: String(failureUrl || returnUrl || ""),
  };

  console.log("[TPAY] gateway:", GATEWAY);
  console.log("[TPAY] form:", form);
  console.log("[TPAY] md5Input(masked):", `${TPAY_ID}${amountText}${TPAY_CRC}***`);
  console.log("[TPAY] md5sum:", md5sum);

  res.json({ gatewayUrl: GATEWAY, form });
});


// === Webhook Tpay ===
app.post("/tpay/webhook", async (req, res) => {
  try {
    // UWAGA: Tpay wysyła application/x-www-form-urlencoded – masz bodyParser.urlencoded OK
    const b = req.body || {};
    const {
      tr_status,     // "TRUE"
      tr_id,         // identyfikator transakcji w Tpay
      tr_amount,     // "400.00"
      tr_crc,        // = nasze paymentId (ustawione w initiatePayment)
      md5sum,        // podpis Tpay
      id,            // id merchanta (powinno równać się TPAY_ID)
    } = b;

    // 1) weryfikacja podpisu
    const expectedMd5 = crypto
      .createHash("md5")
      .update(`${TPAY_ID}${tr_id}${tr_amount}${tr_crc}${TPAY_SECRET}`, "utf8")
      .digest("hex");

    if (md5sum !== expectedMd5) {
      console.error("[TPAY:webhook] md5 mismatch", { md5sum, expectedMd5, tr_id, tr_amount, tr_crc });
      return res.status(400).send("ERROR");
    }
    if (String(id) !== String(TPAY_ID)) {
      console.error("[TPAY:webhook] merchant id mismatch", { id, TPAY_ID });
      return res.status(400).send("ERROR");
    }

    // 2) zaakceptowana płatność?
    if (tr_status === "TRUE") {
      const payRef = db.collection("payments").doc(String(tr_crc));
      await payRef.set({
        status: "paid",
        tpayId: tr_id,
        tpayAmount: tr_amount,
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });

      // 3) wystaw fakturę (jeśli jej jeszcze nie ma)
      await createInvoiceForPayment(String(tr_crc));
    }

    // Tpay wymaga "TRUE" w body gdy przyjęto webhook
    return res.status(200).send("TRUE");
  } catch (e) {
    console.error(e);
    return res.status(500).send("ERROR");
  }
});


// === Pobranie PDF faktury (stream) ===
app.get("/invoices/:id/pdf", async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const invRef = db.collection("invoices").doc(invoiceId);
    const invSnap = await invRef.get();
    if (!invSnap.exists) return res.status(404).send("Invoice not found");

    const inv = invSnap.data() as any;

    let pdfPath = inv.pdfPath;
    if (!pdfPath) {
      // nie ma PDF-a? – wygeneruj teraz
      const buffer = await buildInvoicePdfBuffer(inv, inv.seller, inv.buyer);
      pdfPath = `invoices/${invoiceId}.pdf`;
      const file = bucket.file(pdfPath);
      await file.save(buffer, { contentType: "application/pdf", resumable: false });
      await invRef.update({ pdfPath });
    }

    const file = bucket.file(pdfPath);
    res.setHeader("Content-Type", "application/pdf");
    file.createReadStream().on("error", (e) => {
      console.error(e);
      res.status(500).end("ERROR");
    }).pipe(res);
  } catch (e) {
    console.error(e);
    res.status(500).send("ERROR");
  }
});

export const api = functions.region("us-central1").https.onRequest(app);
