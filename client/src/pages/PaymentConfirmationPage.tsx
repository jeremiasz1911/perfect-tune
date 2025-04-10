import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { tpay } from '@/lib/db';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/animations';

export default function PaymentConfirmationPage() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [message, setMessage] = useState('Verifying your payment...');

  useEffect(() => {
    const verifyPayment = async () => {
      const params = new URLSearchParams(window.location.search);
      const paymentId = params.get('paymentId');
      
      if (!paymentId) {
        setStatus('error');
        setMessage('No payment ID found in the URL. Unable to verify payment.');
        return;
      }
      
      setPaymentId(paymentId);
      
      try {
        // Wait a moment to allow payment processing
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const response = await tpay.verifyPayment(paymentId);
        
        if (response.success && response.status === 'completed') {
          setStatus('success');
          setMessage('Payment completed successfully! Thank you for your purchase.');
        } else {
          setStatus('error');
          setMessage(response.error || 'Payment verification failed. Please try again or contact support.');
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setStatus('error');
        setMessage('An error occurred while verifying your payment. Please try again or contact support.');
      }
    };
    
    verifyPayment();
  }, []);
  
  const handleGoBack = () => {
    setLocation('/parent');
  };
  
  const handleRetry = async () => {
    if (!paymentId) return;
    
    setStatus('loading');
    setMessage('Verifying your payment...');
    
    try {
      const response = await tpay.verifyPayment(paymentId);
      
      if (response.success && response.status === 'completed') {
        setStatus('success');
        setMessage('Payment completed successfully! Thank you for your purchase.');
      } else {
        setStatus('error');
        setMessage(response.error || 'Payment verification failed. Please try again or contact support.');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      setStatus('error');
      setMessage('An error occurred while verifying your payment. Please try again or contact support.');
    }
  };
  
  return (
    <motion.div 
      className="container mx-auto max-w-md pt-20 px-4"
      initial="hidden"
      animate="show"
      variants={fadeIn("up", 0.5)}
    >
      <Card>
        <CardHeader>
          <CardTitle>Payment Confirmation</CardTitle>
          <CardDescription>Verifying your TPay payment</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6 space-y-6">
          {status === 'loading' && (
            <>
              <div className="flex items-center justify-center p-4 rounded-full bg-blue-50">
                <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
              </div>
              <p className="text-center text-gray-700">{message}</p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="flex items-center justify-center p-4 rounded-full bg-green-50">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-medium text-green-700">Payment Successful!</h3>
                <p className="text-gray-600">{message}</p>
              </div>
              <Button onClick={handleGoBack} className="w-full">
                Return to Dashboard
              </Button>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="flex items-center justify-center p-4 rounded-full bg-red-50">
                <XCircle className="h-12 w-12 text-red-500" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-medium text-red-700">Payment Verification Failed</h3>
                <p className="text-gray-600">{message}</p>
              </div>
              <div className="flex flex-col gap-3 w-full">
                <Button onClick={handleRetry} variant="secondary" className="w-full">
                  Retry Verification
                </Button>
                <Button onClick={handleGoBack} className="w-full">
                  Return to Dashboard
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}