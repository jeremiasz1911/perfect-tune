import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import TPayIntegration from '@/components/payments/TPayIntegration';
import { useAuth } from '@/lib/auth';
import { createPayment } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';

interface PaymentProcessorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  description: string;
  itemType: 'class' | 'workshop' | 'materials';
  itemId: string;
  childName?: string;
  onSuccess?: () => void;
}

export function PaymentProcessor({
  open,
  onOpenChange,
  amount,
  description,
  itemType,
  itemId,
  childName,
  onSuccess
}: PaymentProcessorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const handlePaymentSuccess = async (paymentId: string) => {
    if (!user) return;
    
    setProcessing(true);
    setPaymentId(paymentId);
    
    try {
      // Create a record of the payment in our system
      await createPayment({
        userId: user.uid,
        studentName: childName || 'Not specified',
        parentName: user.displayName || user.email || 'Parent',
        amount: amount * 100, // Store in smallest currency unit (groszy)
        date: new Date().toISOString().split('T')[0],
        type: itemType,
        status: 'pending',
        method: 'Tpay',
        currency: 'PLN',
        description,
        itemId,
        paymentId,
        email: user.email
      });
      
      toast({
        title: 'Payment Initiated',
        description: 'You will be redirected to complete your payment.',
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      toast({
        title: 'Error',
        description: 'There was an error recording your payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handlePaymentError = (error: Error) => {
    console.error('Payment error:', error);
    toast({
      title: 'Payment Error',
      description: 'There was an error processing your payment. Please try again.',
      variant: 'destructive',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Payment for {description}</DialogTitle>
          <DialogDescription>
            Please complete the payment using TPay.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <TPayIntegration
            amount={amount}
            description={description}
            email={user?.email || ''}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            disabled={!user || processing}
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PaymentProcessor;