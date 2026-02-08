import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, IndianRupee, Trophy } from 'lucide-react';

interface BookingSummaryProps {
  date: string;
  time: string;
  price: number;
  sport: string;
}

export default function BookingSummary({ date, time, price, sport }: BookingSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Summary</CardTitle>
        <CardDescription>Review your booking details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Date</p>
            <p className="font-medium">{date}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Time</p>
            <p className="font-medium">{time}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Trophy className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Sport</p>
            <p className="font-medium">{sport}</p>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IndianRupee className="h-5 w-5 text-primary" />
            <span className="font-medium">Total Amount</span>
          </div>
          <p className="text-2xl font-bold text-primary">₹{price}</p>
        </div>
      </CardContent>
    </Card>
  );
}
