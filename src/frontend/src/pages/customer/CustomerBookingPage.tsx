import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { useCheckAvailability, useGetSlotSettings, useGetPricingRules } from '../../hooks/useQueries';
import { Loader2 } from 'lucide-react';
import AvailableSlotsList from '../../components/customer/AvailableSlotsList';
import BookingForm from '../../components/customer/BookingForm';
import { format } from 'date-fns';

export default function CustomerBookingPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<{ hour: number; price: number } | null>(null);

  const dateToInt = (date: Date): bigint => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return BigInt(year * 10000 + month * 100 + day);
  };

  const selectedDateInt = selectedDate ? dateToInt(selectedDate) : null;

  const { data: availability, isLoading: availabilityLoading, refetch } = useCheckAvailability(selectedDateInt);
  const { data: settings } = useGetSlotSettings();
  const { data: pricingRules } = useGetPricingRules();

  const calculatePrice = (hour: number): number => {
    if (!pricingRules) return 0;

    // For simplicity, treating all days as weekdays (backend has isWeekend logic)
    const isFloodlight = hour >= Number(pricingRules.floodlightStartHour);
    const rate = isFloodlight
      ? Number(pricingRules.weekdayFloodlightRate)
      : Number(pricingRules.weekdayMorningRate);

    // Assuming 1-hour slots
    return rate;
  };

  const handleSlotSelect = (hour: number) => {
    const price = calculatePrice(hour);
    setSelectedSlot({ hour, price });
  };

  const handleBookingSuccess = () => {
    setSelectedSlot(null);
    refetch();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Book Your Slot</h1>
        <p className="text-muted-foreground">Select a date and time to book your turf</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
        {/* Date Picker */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Date</CardTitle>
            <CardDescription>Choose your preferred date</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Available Slots or Booking Form */}
        <div>
          {!selectedSlot ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  Available Slots
                  {selectedDate && ` - ${format(selectedDate, 'MMMM d, yyyy')}`}
                </CardTitle>
                <CardDescription>Select a time slot to continue</CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedDate ? (
                  <p className="text-center text-muted-foreground py-8">
                    Please select a date to view available slots
                  </p>
                ) : availabilityLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <AvailableSlotsList
                    availability={availability || []}
                    onSlotSelect={handleSlotSelect}
                    calculatePrice={calculatePrice}
                  />
                )}
              </CardContent>
            </Card>
          ) : (
            <BookingForm
              selectedDate={selectedDate!}
              selectedSlot={selectedSlot}
              onBack={() => setSelectedSlot(null)}
              onSuccess={handleBookingSuccess}
            />
          )}
        </div>
      </div>
    </div>
  );
}
