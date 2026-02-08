import { useNavigate, useSearch } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, ArrowRight, Info } from 'lucide-react';

export default function PaymentPlaceholderPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/payment' }) as { bookingId?: string };

  const handleContinue = () => {
    if (search.bookingId) {
      navigate({ to: `/confirmation/${search.bookingId}` });
    } else {
      navigate({ to: '/' });
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Payment Integration</CardTitle>
            <CardDescription>Complete your booking payment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Payment integration coming soon!</strong>
                <br />
                This is a placeholder for UPI/Payment Gateway integration. In the production version, 
                you'll be able to pay securely using UPI, credit/debit cards, or other payment methods.
              </AlertDescription>
            </Alert>

            <div className="space-y-3 p-4 rounded-lg bg-muted/50">
              <h3 className="font-semibold">Supported Payment Methods (Coming Soon):</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  UPI (Google Pay, PhonePe, Paytm)
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Credit/Debit Cards
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Net Banking
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Wallets
                </li>
              </ul>
            </div>

            <Button onClick={handleContinue} className="w-full gap-2" size="lg">
              Continue to Confirmation
              <ArrowRight className="h-4 w-4" />
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              For now, you can proceed to view your booking confirmation
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
