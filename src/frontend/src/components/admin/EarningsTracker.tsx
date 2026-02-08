import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { useGetDailyEarnings, useGetWeeklyEarnings } from '../../hooks/useQueries';
import { Loader2, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function EarningsTracker() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const dateToInt = (date: Date): bigint => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return BigInt(year * 10000 + month * 100 + day);
  };

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });

  const { data: dailyEarnings, isLoading: dailyLoading } = useGetDailyEarnings(dateToInt(selectedDate));
  const { data: weeklyEarnings, isLoading: weeklyLoading } = useGetWeeklyEarnings(
    dateToInt(weekStart),
    dateToInt(weekEnd)
  );

  return (
    <div className="space-y-6">
      {/* Date Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Date</CardTitle>
          <CardDescription>Choose a date to view earnings</CardDescription>
        </CardHeader>
        <CardContent>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start gap-2">
                <CalendarIcon className="h-4 w-4" />
                {format(selectedDate, 'MMMM d, yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
              />
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>

      {/* Earnings Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Daily Earnings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Daily Earnings
            </CardTitle>
            <CardDescription>{format(selectedDate, 'MMMM d, yyyy')}</CardDescription>
          </CardHeader>
          <CardContent>
            {dailyLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : dailyEarnings ? (
              <div className="space-y-4">
                <div>
                  <p className="text-3xl font-bold text-primary">
                    ₹{dailyEarnings.totalRevenue.toString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Total Revenue
                  </p>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-lg font-semibold">
                    {dailyEarnings.bookingCount.toString()} Bookings
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total bookings for the day
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No data available</p>
            )}
          </CardContent>
        </Card>

        {/* Weekly Earnings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Weekly Earnings
            </CardTitle>
            <CardDescription>
              {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {weeklyLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : weeklyEarnings ? (
              <div className="space-y-4">
                <div>
                  <p className="text-3xl font-bold text-primary">
                    ₹{weeklyEarnings.totalRevenue.toString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Total Revenue
                  </p>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-lg font-semibold">
                    {weeklyEarnings.bookingCount.toString()} Bookings
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total bookings for the week
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
