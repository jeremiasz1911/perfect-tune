import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PageTransition from '@/components/ui/PageTransition';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/animations';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { verifyPaymentAndMarkInvoice } from "@/lib/db";
import { createNotification } from "@/lib/db";
import { useAuth } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

type Status = 'success' | 'error' | 'pending';

export default function PaymentConfirmationPage() {
  const [ , setLocation] = useLocation();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<Status>('pending');
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [details, setDetails] = useState<{
    amount?: number;
    currency?: string;
    description?: string;
    classId?: string;
  } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invId = params.get('invoiceId');
    setInvoiceId(invId);

    if (!invId) {
      setStatus('error');
      setLoading(false);
      return;
    }

    (async () => {
      try {
        // 1) weryfikacja płatności (mock TPay -> oznaczy invoice jako paid)
        const ok = await verifyPaymentAndMarkInvoice(invId);

        // 2) pobierz dane faktury do wyświetlenia
        const invSnap = await getDoc(doc(db, 'invoices', invId));
        const inv = invSnap.exists() ? invSnap.data() as any : null;

        setDetails(inv ? {
          amount: inv.amount,               // u Ciebie w PLN (number)
          currency: inv.currency || 'PLN',
          classId: inv.classId,
          description: inv.period
            ? 'Opłata miesięczna za zajęcia'
            : 'Opłata za pojedyncze zajęcia'
        } : null);

        if (ok) {
          setStatus('success');

          // (opcjonalnie) notyfikacja
          if (user) {
            await createNotification({
              userId: user.uid,
              title: 'Płatność przyjęta',
              message: `Twoja płatność za fakturę ${invId} została zaksięgowana.`,
              type: 'payment',
              createdAt: new Date().toISOString(),
              read: false
            });
          }
        } else {
          setStatus('error');
        }
      } catch (e) {
        console.error(e);
        setStatus('error');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const handleGoToPayments = () => setLocation('/parent');

  return (
    <PageTransition>
      <div className="container max-w-4xl py-12">
        <motion.div variants={fadeIn('up', 0.5)} initial="hidden" animate="visible" className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Payment Confirmation</h1>
          <p className="text-lg text-neutral-500 mt-2">
            {loading ? 'Verifying payment…' : status === 'success' ? 'Your payment has been processed.' : 'Payment could not be verified.'}
          </p>
        </motion.div>

        <motion.div variants={fadeIn('up', 0.7, 0.1)} initial="hidden" animate="visible">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                {loading ? (
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                ) : status === 'success' ? (
                  <FaCheckCircle className="text-green-500 mr-2" size={24} />
                ) : (
                  <FaTimesCircle className="text-red-500 mr-2" size={24} />
                )}
                {loading ? 'Processing Payment' : status === 'success' ? 'Payment Successful' : 'Payment Failed'}
              </CardTitle>
              <CardDescription>
                {loading
                  ? 'Please wait while we verify your payment.'
                  : status === 'success'
                  ? 'Thank you for your payment.'
                  : 'There was an issue verifying your payment.'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="py-8 flex justify-center">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : status === 'success' && details ? (
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-100 rounded-lg p-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-neutral-500">Invoice ID</p>
                        <p className="font-medium">{invoiceId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-500">Date</p>
                        <p className="font-medium">{new Date().toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-500">Description</p>
                        <p className="font-medium">{details.description}</p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-500">Amount</p>
                        <p className="font-medium text-green-600">
                          {details.amount?.toFixed(2)} {details.currency}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-neutral-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-neutral-600">A confirmation email has been sent to your address.</p>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center">
                  <div className="bg-red-50 border border-red-100 rounded-lg p-6 mb-4">
                    <p className="text-red-600">
                      We couldn't verify your payment. If you believe this is an error, please contact our support team.
                    </p>
                  </div>
                  <p className="text-sm text-neutral-500">Invoice ID: {invoiceId || 'Not available'}</p>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-center">
              <Button onClick={handleGoToPayments}>Go to Payment History</Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  );
}
