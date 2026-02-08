import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { useGetSlotSettings, useGetAllBookings, useGetBlockedSlots } from '../../hooks/useQueries';
import { Loader2, RefreshCw } from 'lucide-react';
import BlockSlotsDialog from './BlockSlotsDialog';
import { format } from 'date-fns';
import type { Booking } from '../../backend';

interface SlotInfo {
  hour: number;
  isBooked: boolean;
  isBlocked: boolean;
  booking?: Booking;
  blockedReason?: string;
}

export default function AdminBookingCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { data: settings, isLoading: settingsLoading } = useGetSlotSettings();
  const { data: bookings, isLoading: bookingsLoading, refetch: refetchBookings } = useGetAllBookings();
  const { data: blockedSlots, isLoading: blockedLoading } = useGetBlockedSlots();

  const isLoading = settingsLoading || bookingsLoading || blockedLoading;

  // Convert date to simple date integer (YYYYMMDD)
  const dateToInt = (date: Date): bigint => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return BigInt(year * 10000 + month * 100 + day);
  };

  const selectedDateInt = dateToInt(selectedDate);

  // Generate all slots for the selected date
  const generateSlots = (): SlotInfo[] => {
    if (!settings) return [];

    const slots: SlotInfo[] = [];
    const opening = Number(settings.openingTime);
    const closing = Number(settings.closingTime);

    for (let hour = opening; hour < closing; hour++) {
      // Check if slot is booked
      const isBooked = bookings?.some(
        (b) => b.timeSlot.date === selectedDateInt && Number(b.timeSlot.startHour) === hour
      ) ?? false;

      // Check if slot is blocked
      const isBlocked = blockedSlots?.some(
        (s) => s.date === selectedDateInt && Number(s.startHour) === hour
      ) ?? false;

      const blockedSlot = blockedSlots?.find(
        (s) => s.date === selectedDateInt && Number(s.startHour) === hour
      );

      const booking = bookings?.find(
        (b) => b.timeSlot.date === selectedDateInt && Number(b.timeSlot.startHour) === hour
      );

      slots.push({
        hour,
        isBooked,
        isBlocked,
        booking,
        blockedReason: blockedSlot?.reason,
      });
    }

    return slots;
  };

  const slots = generateSlots();

  const formatTime = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      {/* Calendar Picker */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Date</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      {/* Slots View */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Bookings for {format(selectedDate, 'MMMM d, yyyy')}</CardTitle>
              <CardDescription>View and manage slot bookings</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchBookings()}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : slots.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No slots configured. Please update slot settings.
            </p>
          ) : (
            <div className="space-y-2">
              {slots.map((slot) => (
                <div
                  key={slot.hour}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="font-medium text-sm w-24">{formatTime(slot.hour)}</div>
                    {slot.isBooked && (
                      <Badge variant="default">Booked</Badge>
                    )}
                    {slot.isBlocked && (
                      <Badge variant="destructive">Blocked</Badge>
                    )}
                    {!slot.isBooked && !slot.isBlocked && (
                      <Badge variant="outline">Available</Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {slot.isBooked && slot.booking && (
                      <div className="text-sm text-muted-foreground">
                        {slot.booking.customerName} • {slot.booking.sport} • ₹{slot.booking.price.toString()}
                      </div>
                    )}
                    {slot.isBlocked && slot.blockedReason && (
                      <div className="text-sm text-muted-foreground">
                        {slot.blockedReason}
                      </div>
                    )}
                    {!slot.isBooked && (
                      <BlockSlotsDialog
                        date={selectedDateInt}
                        startHour={BigInt(slot.hour)}
                        isBlocked={slot.isBlocked}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
