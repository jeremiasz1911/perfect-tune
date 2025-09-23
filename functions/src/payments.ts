// /functions/src/routes/payments.ts (przykładowo)
import * as express from "express";
import * as crypto from "crypto";

const router = express.Router();

// ZAŁÓŻMY, że trzymasz to w configach funkcji:
// firebase functions:config:set tpay.id="12345" tpay.md5="TWÓJ_MD5_SECRET" tpay.result_url="https://.../tpayCallback"
const TPAY_MERCHANT_ID = process.env.TPAY_ID || process.env.tpay_id || "";   // np. 12345
const TPAY_MD5_SECRET  = process.env.TPAY_MD5 || process.env.tpay_md5 || ""; // "Security code (md5)"
const TPAY_RESULT_URL  = process.env.TPAY_RESULT_URL || "https://<YOUR-CF-URL>/tpayCallback";

function formatAmount2dec(a: number | string) {
  const n = Number(a);
  if (!isFinite(n)) throw new Error("Amount is not a number");
  // dokładnie 2 miejsca i kropka jako separator
  return (Math.round(n * 100) / 100).toFixed(2);
}

router.post("/initiatePayment", async (req, res) => {
  try {
    const {
      amount,
      description,
      email,
      studentName,
      parentName,
      userId,
      invoiceId,          // jeżeli masz – użyj go jako crc
      successUrl,         // opcjonalnie z frontu
      failureUrl,         // opcjonalnie z frontu
      returnUrl           // alias – jeśli podajesz tylko jeden
    } = req.body || {};

    if (!TPAY_MERCHANT_ID || !TPAY_MD5_SECRET) {
      return res.status(500).json({ error: "Tpay not configured" });
    }
    if (!amount || !description || !email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const amountStr = formatAmount2dec(amount);
    const crc = (invoiceId || `${userId || "anon"}:${Date.now()}`).toString();

    // *** TO JEST NAJWAŻNIEJSZE: kolejność i dokładna treść łańcucha ***
    // md5sum = md5( merchantId + amount + crc + md5_secret )
    const md5raw = `${TPAY_MERCHANT_ID}${amountStr}${crc}${TPAY_MD5_SECRET}`;
    const md5sum = crypto.createHash("md5").update(md5raw).digest("hex");

    // Pola do secure.tpay.com (Basic)
    const form: Record<string, string> = {
      id: String(TPAY_MERCHANT_ID),
      amount: amountStr,
      description: String(description).slice(0, 255),
      crc, // to samo crc musi wrócić w notyfikacji – wykorzystasz do mapowania
      email: String(email),
      name: String(parentName || studentName || "Klient"),
      language: "pl",
      return_url: successUrl || returnUrl || "https://twojadomena.pl/payments/return?status=ok",
      return_error_url: failureUrl || "https://twojadomena.pl/payments/return?status=failed",
      result_url: TPAY_RESULT_URL, // webhook/notify URL (serwer)
      md5sum, // podpis
      // opcjonalnie:
      // group: "150", // kanał płatności
      // online: "1"
    };

    // Dla debug (NIE loguj całego sekretu):
    console.log("[tpay] amountStr=", amountStr, "crc=", crc);
    console.log("[tpay] md5 string=", {
      merchantId: TPAY_MERCHANT_ID,
      amountStr,
      crc,
      secret_last4: TPAY_MD5_SECRET.slice(-4),
    });

    return res.json({
      gatewayUrl: "https://secure.tpay.com",
      form,
    });
  } catch (err: any) {
    console.error("initiatePayment error:", err);
    return res.status(500).json({ error: err?.message || String(err) });
  }
});

export default router;
