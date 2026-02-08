import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGetSlotSettings, useUpdateSlotSettings } from '../../hooks/useQueries';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function SlotSettingsForm() {
  const { data: settings, isLoading } = useGetSlotSettings();
  const updateSettings = useUpdateSlotSettings();

  const [openingTime, setOpeningTime] = useState('6');
  const [closingTime, setClosingTime] = useState('22');
  const [slotDuration, setSlotDuration] = useState('60');

  useEffect(() => {
    if (settings) {
      setOpeningTime(settings.openingTime.toString());
      setClosingTime(settings.closingTime.toString());
      setSlotDuration(settings.slotDuration.toString());
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const opening = parseInt(openingTime);
    const closing = parseInt(closingTime);
    const duration = parseInt(slotDuration);

    if (opening < 0 || opening > 23 || closing < 0 || closing > 24 || opening >= closing) {
      toast.error('Invalid time range. Opening time must be before closing time.');
      return;
    }

    if (duration < 15 || duration > 240) {
      toast.error('Slot duration must be between 15 and 240 minutes.');
      return;
    }

    try {
      await updateSettings.mutateAsync({
        openingTime: BigInt(opening),
        closingTime: BigInt(closing),
        slotDuration: BigInt(duration),
      });
      toast.success('Slot settings updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update settings');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Slot Settings</CardTitle>
        <CardDescription>Configure turf opening hours and slot duration</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="openingTime">Opening Time (Hour, 0-23)</Label>
            <Input
              id="openingTime"
              type="number"
              min="0"
              max="23"
              value={openingTime}
              onChange={(e) => setOpeningTime(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="closingTime">Closing Time (Hour, 1-24)</Label>
            <Input
              id="closingTime"
              type="number"
              min="1"
              max="24"
              value={closingTime}
              onChange={(e) => setClosingTime(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slotDuration">Slot Duration (Minutes)</Label>
            <Input
              id="slotDuration"
              type="number"
              min="15"
              max="240"
              step="15"
              value={slotDuration}
              onChange={(e) => setSlotDuration(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full gap-2" disabled={updateSettings.isPending}>
            {updateSettings.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
