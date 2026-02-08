import { useParams, useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useGetBooking } from '../../hooks/useQueries';
import { Loader2, CheckCircle2, Calendar, Clock, Trophy, Phone, User, IndianRupee, Home } from 'lucide-react';
import { format } from 'date-fns';

export default function BookingConfirmationPage() {
  const { bookingId } = useParams({ from: '/confirmation/$bookingId' });
  const navigate = useNavigate();
  const { data: booking, isLoading, error } = useGetBooking(bookingId);

  const intToDate = (dateInt: bigint): Date => {
    const dateStr = dateInt.toString();
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1;
    const day = parseInt(dateStr.substring(6, 8));
    return new Date(year, month, day);
  };

  const formatTime = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="border-destructive/50">
            <CardHeader className="text-center">
              <CardTitle className="text-destructive">Booking Not Found</CardTitle>
              <CardDescription>
                The booking ID you provided could not be found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate({ to: '/' })} variant="outline" className="w-full">
                Go to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const bookingDate = intToDate(booking.timeSlot.date);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Booking Confirmed!</CardTitle>
            <CardDescription>Your turf has been successfully booked</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Booking ID */}
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm text-muted-foreground mb-1">Booking ID</p>
              <p className="text-2xl font-bold text-primary font-mono">{booking.id}</p>
            </div>

            <Separator />

            {/* Booking Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Booking Details</h3>

              <div className="grid gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">{format(bookingDate, 'MMMM d, yyyy')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-medium">{formatTime(Number(booking.timeSlot.startHour))}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Trophy className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Sport</p>
                    <p className="font-medium">{booking.sport}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{booking.customerName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{booking.phoneNumber}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Payment Summary */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <IndianRupee className="h-5 w-5 text-primary" />
                <span className="font-semibold">Total Amount</span>
              </div>
              <p className="text-2xl font-bold text-primary">₹{booking.price.toString()}</p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button onClick={() => navigate({ to: '/' })} className="w-full gap-2">
                <Home className="h-4 w-4" />
                Back to Home
              </Button>
              <Button
                onClick={() => navigate({ to: '/receipt' })}
                variant="outline"
                className="w-full"
              >
                View Receipt Lookup
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Please save your booking ID for future reference
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
