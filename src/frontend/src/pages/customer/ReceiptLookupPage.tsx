import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from '@tanstack/react-router';
import { Search, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function ReceiptLookupPage() {
  const navigate = useNavigate();
  const [bookingId, setBookingId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!bookingId.trim()) {
      toast.error('Please enter a booking ID');
      return;
    }

    navigate({ to: `/confirmation/${bookingId.trim()}` });
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/' })}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle>Receipt Lookup</CardTitle>
            </div>
            <CardDescription>Enter your booking ID to view your receipt</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bookingId">Booking ID</Label>
                <Input
                  id="bookingId"
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  placeholder="e.g., BK1"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Enter the booking ID you received after booking
                </p>
              </div>

              <Button type="submit" className="w-full gap-2">
                <Search className="h-4 w-4" />
                View Receipt
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
