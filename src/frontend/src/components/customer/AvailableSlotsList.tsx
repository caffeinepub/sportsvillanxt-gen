import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, IndianRupee } from 'lucide-react';

interface AvailableSlotsListProps {
  availability: bigint[];
  onSlotSelect: (hour: number) => void;
  calculatePrice: (hour: number) => number;
}

export default function AvailableSlotsList({
  availability,
  onSlotSelect,
  calculatePrice,
}: AvailableSlotsListProps) {
  const formatTime = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  if (availability.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No slots available for this date</p>
        <p className="text-sm text-muted-foreground mt-2">
          Please try another date or check back later
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {availability.map((hourBigInt) => {
        const hour = Number(hourBigInt);
        const price = calculatePrice(hour);

        return (
          <div
            key={hour}
            className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">{formatTime(hour)}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <IndianRupee className="h-3 w-3" />
                  <span>{price}</span>
                </div>
              </div>
            </div>

            <Button onClick={() => onSlotSelect(hour)} size="sm">
              Select
            </Button>
          </div>
        );
      })}
    </div>
  );
}
