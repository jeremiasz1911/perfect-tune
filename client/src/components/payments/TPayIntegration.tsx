import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { tpay } from '@/lib/db';

interface TPayIntegrationProps {
  amount: number;
  description: string;
  email: string;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
}

export function TPayIntegration({
  amount,
  description,
  email,
  onSuccess,
  onError,
  disabled = false
}: TPayIntegrationProps) {
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleStartPayment = async () => {
    if (disabled) return;
    
    setLoading(true);
    try {
      // Get the application URL for redirects
      const baseUrl = window.location.origin;
      const returnUrl = `${baseUrl}/payment-confirmation`;
      
      // Create a payment through the Tpay API
      const response = await tpay.createPayment(
        amount * 100, // Convert to cents (groszy)
        description,
        email,
        returnUrl
      );
      
      if (response.success) {
        setPaymentUrl(response.paymentUrl);
        setPaymentId(response.paymentId);
        toast({
          title: "Payment initialized",
          description: "You will be redirected to the payment gateway.",
        });
        if (onSuccess) onSuccess(response.paymentId);
      } else {
        throw new Error("Payment initialization failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: "There was an error initializing the payment.",
        variant: "destructive",
      });
      if (onError) onError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!paymentId) return;
    
    setLoading(true);
    try {
      const response = await tpay.verifyPayment(paymentId);
      
      if (response.success) {
        toast({
          title: "Payment Verified",
          description: `Payment status: ${response.status}`,
        });
        
        if (response.status === "completed") {
          toast({
            title: "Payment Completed",
            description: "Thank you for your payment!",
            variant: "default",
          });
        }
      } else {
        toast({
          title: "Payment Verification Failed",
          description: response.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      toast({
        title: "Verification Error",
        description: "There was an error verifying the payment.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Payment with TPay</CardTitle>
        <CardDescription>Secure payments in Polish Złoty (PLN)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="flex items-center">
              <Input
                id="amount"
                type="text"
                value={`${amount.toFixed(2)} PLN`}
                disabled
                className="bg-muted"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              type="text"
              value={description}
              disabled
              className="bg-muted"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              disabled
              className="bg-muted"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        {!paymentUrl ? (
          <Button 
            onClick={handleStartPayment} 
            className="w-full" 
            disabled={disabled || loading}
          >
            {loading ? "Processing..." : "Pay Now"}
          </Button>
        ) : (
          <>
            <a 
              href={paymentUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button className="w-full">
                Proceed to TPay
              </Button>
            </a>
            <Button
              variant="outline"
              onClick={handleVerifyPayment}
              className="w-full mt-2"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify Payment Status"}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}

export default TPayIntegration;