import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateBooking, useGetSlotSettings } from '../../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import BookingSummary from './BookingSummary';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';

interface BookingFormProps {
  selectedDate: Date;
  selectedSlot: { hour: number; price: number };
  onBack: () => void;
  onSuccess: () => void;
}

export default function BookingForm({ selectedDate, selectedSlot, onBack, onSuccess }: BookingFormProps) {
  const navigate = useNavigate();
  const { identity, login, loginStatus } = useInternetIdentity();
  const createBooking = useCreateBooking();
  const { data: settings } = useGetSlotSettings();

  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [sport, setSport] = useState('');

  const isAuthenticated = !!identity;

  const dateToInt = (date: Date): bigint => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return BigInt(year * 10000 + month * 100 + day);
  };

  const formatTime = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please login to make a booking');
      return;
    }

    if (!customerName.trim() || !phoneNumber.trim() || !sport) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const bookingId = await createBooking.mutateAsync({
        timeSlot: {
          date: dateToInt(selectedDate),
          startHour: BigInt(selectedSlot.hour),
          duration: settings?.slotDuration || BigInt(60),
        },
        customerName: customerName.trim(),
        phoneNumber: phoneNumber.trim(),
        sport,
      });

      toast.success('Booking created successfully!');
      navigate({ to: '/payment', search: { bookingId } });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create booking');
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Booking Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle>Booking Details</CardTitle>
          </div>
          <CardDescription>Fill in your information to complete the booking</CardDescription>
        </CardHeader>
        <CardContent>
          {!isAuthenticated ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                You need to login to make a booking
              </p>
              <Button 
                onClick={login} 
                disabled={loginStatus === 'logging-in'}
                className="w-full"
              >
                {loginStatus === 'logging-in' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'Login to Continue'
                )}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sport">Sport</Label>
                <Select value={sport} onValueChange={setSport} required>
                  <SelectTrigger id="sport">
                    <SelectValue placeholder="Select a sport" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Football">Football</SelectItem>
                    <SelectItem value="Cricket">Cricket</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={createBooking.isPending}>
                {createBooking.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Booking...
                  </>
                ) : (
                  'Proceed to Payment'
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Booking Summary */}
      <BookingSummary
        date={format(selectedDate, 'MMMM d, yyyy')}
        time={formatTime(selectedSlot.hour)}
        price={selectedSlot.price}
        sport={sport || 'Not selected'}
      />
    </div>
  );
}
