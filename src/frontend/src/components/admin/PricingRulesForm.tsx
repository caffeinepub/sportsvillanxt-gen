import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGetPricingRules, useUpdatePricingRules } from '../../hooks/useQueries';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function PricingRulesForm() {
  const { data: rules, isLoading } = useGetPricingRules();
  const updateRules = useUpdatePricingRules();

  const [weekdayMorningRate, setWeekdayMorningRate] = useState('300');
  const [weekdayFloodlightRate, setWeekdayFloodlightRate] = useState('400');
  const [weekendMorningRate, setWeekendMorningRate] = useState('400');
  const [weekendFloodlightRate, setWeekendFloodlightRate] = useState('500');
  const [floodlightStartHour, setFloodlightStartHour] = useState('18');

  useEffect(() => {
    if (rules) {
      setWeekdayMorningRate(rules.weekdayMorningRate.toString());
      setWeekdayFloodlightRate(rules.weekdayFloodlightRate.toString());
      setWeekendMorningRate(rules.weekendMorningRate.toString());
      setWeekendFloodlightRate(rules.weekendFloodlightRate.toString());
      setFloodlightStartHour(rules.floodlightStartHour.toString());
    }
  }, [rules]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const floodlightHour = parseInt(floodlightStartHour);
    if (floodlightHour < 0 || floodlightHour > 23) {
      toast.error('Floodlight start hour must be between 0 and 23');
      return;
    }

    try {
      await updateRules.mutateAsync({
        weekdayMorningRate: BigInt(weekdayMorningRate),
        weekdayFloodlightRate: BigInt(weekdayFloodlightRate),
        weekendMorningRate: BigInt(weekendMorningRate),
        weekendFloodlightRate: BigInt(weekendFloodlightRate),
        floodlightStartHour: BigInt(floodlightHour),
      });
      toast.success('Pricing rules updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update pricing rules');
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
        <CardTitle>Pricing Rules</CardTitle>
        <CardDescription>Set rates for different time periods</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weekdayMorning">Weekday Morning Rate (₹)</Label>
              <Input
                id="weekdayMorning"
                type="number"
                min="0"
                value={weekdayMorningRate}
                onChange={(e) => setWeekdayMorningRate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weekdayFloodlight">Weekday Floodlight Rate (₹)</Label>
              <Input
                id="weekdayFloodlight"
                type="number"
                min="0"
                value={weekdayFloodlightRate}
                onChange={(e) => setWeekdayFloodlightRate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weekendMorning">Weekend Morning Rate (₹)</Label>
              <Input
                id="weekendMorning"
                type="number"
                min="0"
                value={weekendMorningRate}
                onChange={(e) => setWeekendMorningRate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weekendFloodlight">Weekend Floodlight Rate (₹)</Label>
              <Input
                id="weekendFloodlight"
                type="number"
                min="0"
                value={weekendFloodlightRate}
                onChange={(e) => setWeekendFloodlightRate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="floodlightStart">Floodlight Start Hour (0-23)</Label>
            <Input
              id="floodlightStart"
              type="number"
              min="0"
              max="23"
              value={floodlightStartHour}
              onChange={(e) => setFloodlightStartHour(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Hour when floodlight pricing begins (e.g., 18 for 6 PM)
            </p>
          </div>

          <Button type="submit" className="w-full gap-2" disabled={updateRules.isPending}>
            {updateRules.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Pricing Rules
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
