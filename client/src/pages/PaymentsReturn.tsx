import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PayStatus =
  | { step: "checking"; message?: string }
  | { step: "failed"; reason?: string }
  | {
      step: "success";
      paymentId?: string;
      tpayId?: string | null;
      amount?: string | null;
      invoiceId?: string | null;
      invoiceNumber?: string | null;
      pdfUrl?: string | null;
    };

const base = import.meta.env.VITE_API_BASE_URL; // np. https://us-central1-.../api

export default function PaymentsReturn() {
  const [sp] = useSearchParams();
  const invoiceIdParam = sp.get("invoiceId") || "";
  const paymentIdParam = sp.get("paymentId") || "";
  const statusParam = sp.get("status") || ""; // "failed" w razie błędu
  const [state, setState] = useState<PayStatus>({ step: "checking" });

  const pollEvery = 1500; // ms
  const maxTries = 20;    // ok. 30 sekund

  const what = useMemo(() => {
    if (statusParam === "failed") return "failed";
    if (invoiceIdParam) return "byInvoice";
    if (paymentIdParam) return "byPayment";
    return "unknown";
  }, [statusParam, invoiceIdParam, paymentIdParam]);

  useEffect(() => {
    if (what === "failed") {
      setState({ step: "failed", reason: "Płatność nie została zrealizowana." });
      return;
    }
    if (what === "unknown") {
      setState({ step: "failed", reason: "Brakuje identyfikatora płatności lub faktury." });
      return;
    }

    let tries = 0;
    let timer: number;

    const tick = async () => {
      tries++;

      try {
        // 1) jeśli mamy invoiceId w URL – sprawdź od razu fakturę
        if (what === "byInvoice") {
          const r = await fetch(`${base}/invoices/${invoiceIdParam}`);
          if (r.ok) {
            const inv = await r.json();
            setState({
              step: "success",
              paymentId: inv.paymentId || undefined,
              amount: inv.amountGross ? String(inv.amountGross) : null,
              invoiceId: inv.id,
              invoiceNumber: inv.number || null,
              tpayId: undefined,
              pdfUrl: inv.pdfUrl || null,
            });
            return;
          }
          // jeśli 404 – możliwe że faktura jeszcze się tworzy → spróbuj przez payment
          if (paymentIdParam) {
            const r2 = await fetch(`${base}/payments/${paymentIdParam}`);
            if (r2.ok) {
              const p = await r2.json();
              if (p.status === "paid" && p.invoiceId) {
                // dociągnij fakturę
                const r3 = await fetch(`${base}/invoices/${p.invoiceId}`);
                if (r3.ok) {
                  const inv = await r3.json();
                  setState({
                    step: "success",
                    paymentId: p.id,
                    tpayId: p.tpayId || null,
                    amount: p.tpayAmount || null,
                    invoiceId: inv.id,
                    invoiceNumber: inv.number || null,
                    pdfUrl: inv.pdfUrl || null,
                  });
                  return;
                }
              }
            }
          }
        }

        // 2) tylko paymentId → sprawdź status aż będzie paid i będzie invoiceId
        if (what === "byPayment") {
          const r = await fetch(`${base}/payments/${paymentIdParam}`);
          if (r.ok) {
            const p = await r.json();
            if (p.status === "paid") {
              if (p.invoiceId) {
                const r2 = await fetch(`${base}/invoices/${p.invoiceId}`);
                if (r2.ok) {
                  const inv = await r2.json();
                  setState({
                    step: "success",
                    paymentId: p.id,
                    tpayId: p.tpayId || null,
                    amount: p.tpayAmount || null,
                    invoiceId: inv.id,
                    invoiceNumber: inv.number || null,
                    pdfUrl: inv.pdfUrl || null,
                  });
                  return;
                }
              } else {
                // paid, ale faktura jeszcze się generuje – poczekaj chwilę
              }
            }
          }
        }
      } catch (e) {
        // ignorujemy, spróbujemy jeszcze raz
      }

      if (tries < maxTries) {
        timer = window.setTimeout(tick, pollEvery);
      } else {
        setState({
          step: "failed",
          reason:
            "Nie udało się potwierdzić płatności. Jeśli środki zeszły, odśwież stronę za chwilę lub skontaktuj się z nami.",
        });
      }
    };

    tick();
    return () => window.clearTimeout(timer);
  }, [what, base, invoiceIdParam, paymentIdParam]);

  if (state.step === "checking") {
    return (
      <div className="max-w-lg mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Kończymy rozliczenie…</CardTitle>
          </CardHeader>
          <CardContent>Trwa potwierdzanie Twojej płatności. Proszę czekać…</CardContent>
        </Card>
      </div>
    );
  }

  if (state.step === "failed") {
    return (
      <div className="max-w-lg mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Płatność nie powiodła się</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{state.reason || "Wystąpił błąd podczas przetwarzania płatności."}</p>
            <Button onClick={() => (window.location.href = "/")}>Wróć do strony głównej</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // success
  return (
    <div className="max-w-lg mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Dziękujemy! Płatność przyjęta ✅</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {state.invoiceNumber && <p>Numer faktury: <b>{state.invoiceNumber}</b></p>}
          {state.paymentId && <p>Id płatności (CRC): <code>{state.paymentId}</code></p>}
          {state.tpayId && <p>Tpay tr_id: <code>{state.tpayId}</code></p>}
          {state.amount && <p>Kwota: <b>{state.amount}</b></p>}
          {state.pdfUrl ? (
            <Button asChild className="mt-4">
              <a href={state.pdfUrl} target="_blank" rel="noreferrer">Pobierz fakturę PDF</a>
            </Button>
          ) : (
            <p>Generuję link do faktury…</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
