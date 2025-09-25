import * as functions from "firebase-functions";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import crypto from "crypto";
import PDFDocument from "pdfkit";

// ───────────────────────────────────────────────────────────────────────────────
// Firebase init
// ───────────────────────────────────────────────────────────────────────────────
initializeApp();
const db = getFirestore();
const bucket = getStorage().bucket();

// ───────────────────────────────────────────────────────────────────────────────
// Express
// ───────────────────────────────────────────────────────────────────────────────
const app = express();
app.use(cors({ origin: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Przydatne stałe do URL-i zwrotnych
const PROJECT_ID = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || "";
const REGION = "us-central1";
const PUBLIC_FN_URL = `https://${REGION}-${PROJECT_ID}.cloudfunctions.net/api`;

// ───────────────────────────────────────────────────────────────────────────────
// Narastająca numeracja faktur (YYYY/MM/NNN)
// ───────────────────────────────────────────────────────────────────────────────
async function getNextInvoiceNumber(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  const counterRef = db.collection("meta").doc("invoiceCounter");
  const docSnap = await counterRef.get();

  let seq = 1;
  const prefix = `${year}/${month}`;

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

// ───────────────────────────────────────────────────────────────────────────────
// PDF faktury → Buffer
// ───────────────────────────────────────────────────────────────────────────────
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

    // Sprzedawca
    doc.moveDown(1);
    doc.fontSize(14).text("Sprzedawca", { underline: true });
    doc.fontSize(11).text(seller.name);
    if (seller.address) doc.text(seller.address);
    if (seller.nip) doc.text(`NIP: ${seller.nip}`);

    // Nabywca
    doc.moveDown(1);
    doc.fontSize(14).text("Nabywca", { underline: true });
    doc.fontSize(11).text(buyer.name || buyer.email || "Klient");
    if (buyer.email) doc.text(buyer.email);
    if (buyer.address) doc.text(buyer.address);

    // Pozycje
    doc.moveDown(1.5);
    doc.fontSize(13).text("Pozycje:", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11);

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

// ───────────────────────────────────────────────────────────────────────────────
// Tworzenie dokumentu faktury + upload PDF do Storage
// ───────────────────────────────────────────────────────────────────────────────
async function createInvoiceForPayment(paymentId: string): Promise<string> {
  const payRef = db.collection("payments").doc(paymentId);
  const paySnap = await payRef.get();
  if (!paySnap.exists) throw new Error("Payment not found");
  const p = paySnap.data() as any;

  if (p.invoiceId) return p.invoiceId;

  const number = await getNextInvoiceNumber();
  const issueDate = new Date().toISOString().split("T")[0];

  const seller = {
    name: "MusicAcademy Sp. z o.o.",
    address: "ul. Dźwiękowa 10, 00-001 Warszawa",
    nip: "123-456-78-90",
  };

  const buyer = {
    name: p.parentName || "Rodzic",
    email: p.email || "",
    address: p.parentAddress || "",
  };

  const invDoc = {
    number,
    issueDate,
    paidAt: issueDate,
    status: "paid",
    currency: p.currency || "PLN",
    amountGross: p.amount / 100,
    description: p.description || "Opłata za zajęcia",
    parentId: p.userId,
    childId: p.childId || null,
    classId: p.classId || null,
    paymentId,
    items: [
      {
        name: p.description || "Zajęcia muzyczne",
        qty: 1,
        price: p.amount / 100,
        total: p.amount / 100,
      },
    ],
    seller,
    buyer,
    pdfPath: "",
    pdfUrl: "",
  };

  const invRef = await db.collection("invoices").add(invDoc);
  const invoiceId = invRef.id;

  const buffer = await buildInvoicePdfBuffer({ ...invDoc, id: invoiceId }, seller, buyer);

  const pdfPath = `invoices/${invoiceId}.pdf`;
  const file = bucket.file(pdfPath);
  await file.save(buffer, {
    contentType: "application/pdf",
    resumable: false,
    metadata: { cacheControl: "public, max-age=3600" },
  });

  await invRef.update({ pdfPath /*, pdfUrl*/ });
  await payRef.update({ invoiceId });

  return invoiceId;
}

// ───────────────────────────────────────────────────────────────────────────────
// Tpay config + debug
// ───────────────────────────────────────────────────────────────────────────────
function resolveTpay() {
  const id = (process.env.TPAY_ID || "").trim();
  const secret = (process.env.TPAY_SECRET || "").trim();
  const env = (process.env.TPAY_ENV || "production").toLowerCase();
  const gateway = env === "sandbox" ? "https://secure.sandbox.tpay.com" : "https://secure.tpay.com";
  if (!id || !secret) throw new Error("TPAY not configured");
  return { id, secret, env, gateway };
}

app.get("/tpay/debug", (_req, res) => {
  try {
    const { id, secret, env, gateway } = resolveTpay();
    res.json({
      idUsed: id,
      env,
      gateway,
      secretLen: secret.length,
      secretHexPrefix: Buffer.from(secret, "utf8").toString("hex").slice(0, 12) + "…",
    });
  } catch (e: any) {
    res.status(500).json({ error: String(e?.message || e) });
  }
});

// ───────────────────────────────────────────────────────────────────────────────
// Create payment → zwrot danych do auto-POST na secure.tpay.com
// (MD5 dla "create": id & kwota & crc & secret)
// ───────────────────────────────────────────────────────────────────────────────
app.post("/initiatePayment", async (req, res) => {
  let id: string, secret: string, gateway: string;
  try {
    ({ id, secret, gateway } = resolveTpay());
  } catch (e: any) {
    return res.status(500).json({ error: String(e?.message || e) });
  }

  try {
    let { amount, description, email, returnUrl, successUrl, failureUrl, meta = {} } = req.body || {};

    const amountNum = Number(amount);
    if (!isFinite(amountNum) || amountNum <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const payRef = await db.collection("payments").add({
      status: "initiated",
      amount: Math.round(amountNum * 100), // grosze
      description: description || "Opłata za zajęcia",
      email: String(email || ""),
      meta,
      createdAt: FieldValue.serverTimestamp(),
    });
    const crc = payRef.id;

    const amountText = amountNum.toFixed(2); // "4.00"
    const kwota = amountText;

    // NOWY wymóg Tpay (ampersandy)
    const md5sum = crypto
          .createHash("md5")
          .update(`${id}&${amountText}&${crc}&${secret}`, "utf8")
          .digest("hex");

    // dopnij paymentId do URL-i zwrotnych
    const append = (u: string, k: string, v: string) => {
      try {
        const url = new URL(u);
        url.searchParams.set(k, v);
        return url.toString();
      } catch {
        return u ? u + (u.includes("?") ? "&" : "?") + `${k}=${encodeURIComponent(v)}` : "";
      }
    };
    const return_url = append(String(successUrl || returnUrl || ""), "paymentId", crc);
    const error_url = append(String(failureUrl || returnUrl || ""), "paymentId", crc);

    const form: Record<string, string> = {
      id: String(id),
      // dla świętego spokoju podaj oba klucze kwoty:
      amount: amountText,
      kwota:  amountText,
      description: String(description || "Opłata za zajęcia"),
      opis:        String(description || "Opłata za zajęcia"),
      email: String(email || ""),
      crc,
      md5sum,  // 👈 MUSI BYĆ WARTOŚĆ Z WZORU Z '&'
      result_url: `${PUBLIC_FN_URL}/tpay/webhook`,
      return_url: String(successUrl || returnUrl || ""),
      error_url:  String(failureUrl || returnUrl || ""),
      lang: "pl",
      // accept_tos: "1", // (opcjonalnie – nie zawsze wymagane)
    };

    console.log("[TPAY:init] gateway:", gateway);
    console.log("[TPAY:init] crc:", crc, "kwota:", kwota);
    console.log("[TPAY:init] md5(amp) first8:", md5sum.slice(0, 8));

    return res.json({ gatewayUrl: gateway, form, paymentId: crc });
  } catch (e: any) {
    console.error("/initiatePayment error:", e);
    return res.status(400).send(String(e?.message || e));
  }
});

// ───────────────────────────────────────────────────────────────────────────────
// Webhook (MD5 bez ampersandów: id + tr_id + tr_amount + tr_crc + secret)
// ───────────────────────────────────────────────────────────────────────────────
app.post("/tpay/webhook", async (req, res) => {
  let MID: string, SEC: string;
  try {
    ({ id: MID, secret: SEC } = resolveTpay());
  } catch {
    // Tpay wymaga 200 + "ERROR"
    return res.status(200).send("ERROR");
  }

  const b = req.body || {};
  const { tr_status, tr_id, tr_amount, tr_crc, md5sum, id } = b;

  const expected = crypto
    .createHash("md5")
    .update(`${MID}${tr_id}${tr_amount}${tr_crc}${SEC}`, "utf8")
    .digest("hex");

  // Walidacje
  if (String(id) !== String(MID)) {
    console.error("[TPAY:webhook] merchant mismatch", { got: id, want: MID });
    return res.status(200).send("ERROR");
  }
  if (md5sum !== expected) {
    console.error("[TPAY:webhook] md5 mismatch", {
      got8: String(md5sum).slice(0, 8),
      exp8: expected.slice(0, 8),
      tr_id,
      tr_amount,
      tr_crc,
    });
    return res.status(200).send("ERROR");
  }

  // ACK natychmiast
  res.status(200).send("TRUE");

  // Obróbka w tle
  process.nextTick(async () => {
    try {
      if (tr_status === "TRUE") {
        const payRef = db.collection("payments").doc(String(tr_crc));
        await payRef.set(
          {
            status: "paid",
            tpayId: tr_id,
            tpayAmount: tr_amount,
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

        const snap = await payRef.get();
        if (snap.exists && snap.data()?.amount) {
          await createInvoiceForPayment(String(tr_crc));
        } else {
          console.warn("[TPAY:webhook] payments/<crc> missing or incomplete", tr_crc);
        }
      }
    } catch (e) {
      console.error("[TPAY:webhook] post-ack error:", e);
    }
  });
});

// ───────────────────────────────────────────────────────────────────────────────
// Pomocniczy checker sygnatur (stara vs nowa)
// ───────────────────────────────────────────────────────────────────────────────
app.post("/tpay/check", (req, res) => {
  const { id, secret } = resolveTpay();
  const { amount, crc } = req.body || {};
  const amountText = Number(amount).toFixed(2);

  const concatSignature = crypto
    .createHash("md5")
    .update(`${id}${amountText}${crc}${secret}`, "utf8")
    .digest("hex");

  const ampSignature = crypto
    .createHash("md5")
    .update(`${id}&${amountText}&${crc}&${secret}`, "utf8")
    .digest("hex");

  res.json({
    idUsed: id,
    amountText,
    crc,
    secretLen: secret.length,
    secretHexPrefix: Buffer.from(secret, "utf8").toString("hex").slice(0, 16) + "…",
    concatSignature, // (do weryfikacji webhooka)
    ampSignature, // (do create na secure.tpay.com)
    note: "Używaj ampSignature dla tworzenia transakcji; concatSignature dla weryfikacji webhooka.",
  });
});

// --- ZWRACA STATUS PŁATNOŚCI PO paymentId (czyli CRC) + ew. invoiceId
app.get("/payments/:paymentId", async (req, res) => {
  try {
    const id = String(req.params.paymentId);
    const snap = await db.collection("payments").doc(id).get();
    if (!snap.exists) return res.status(404).json({ error: "payment not found" });
    const p = snap.data() as any;

    res.json({
      id,
      status: p.status || "initiated",
      tpayId: p.tpayId || null,
      tpayAmount: p.tpayAmount || null, // zwykle string "4.00"
      invoiceId: p.invoiceId || null,
      createdAt: p.createdAt || null,
      updatedAt: p.updatedAt || null,
      description: p.description || null,
      email: p.email || null,
    });
  } catch (e:any) {
    console.error("GET /payments/:id", e);
    res.status(500).json({ error: String(e?.message || e) });
  }
});

// --- ZWRACA SZCZEGÓŁY FAKTURY + tymczasowy podpisany URL do PDF
app.get("/invoices/:invoiceId", async (req, res) => {
  try {
    const id = String(req.params.invoiceId);
    const snap = await db.collection("invoices").doc(id).get();
    if (!snap.exists) return res.status(404).json({ error: "invoice not found" });

    const inv = snap.data() as any;
    let pdfUrl = inv.pdfUrl || "";

    if (!pdfUrl && inv.pdfPath) {
      // wygeneruj 10-min signed URL do niepublicznego pliku
      const [signed] = await bucket
        .file(inv.pdfPath)
        .getSignedUrl({
          action: "read",
          expires: Date.now() + 10 * 60 * 1000,
        });
      pdfUrl = signed;
    }

    res.json({
      id,
      number: inv.number,
      status: inv.status,
      issueDate: inv.issueDate,
      paidAt: inv.paidAt || null,
      amountGross: inv.amountGross,
      currency: inv.currency || "PLN",
      description: inv.description || "",
      paymentId: inv.paymentId || null,
      classId: inv.classId || null,
      childId: inv.childId || null,
      seller: inv.seller || null,
      buyer: inv.buyer || null,
      pdfUrl: pdfUrl || null,
    });
  } catch (e:any) {
    console.error("GET /invoices/:id", e);
    res.status(500).json({ error: String(e?.message || e) });
  }
});


// ───────────────────────────────────────────────────────────────────────────────
// Export funkcji HTTPS
// ───────────────────────────────────────────────────────────────────────────────
export const api = functions
  .region("us-central1")
  .runWith({ secrets: ["TPAY_ID", "TPAY_SECRET", "TPAY_ENV"] })
  .https.onRequest(app);
