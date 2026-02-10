import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEmergencyResetOwnership } from '../../hooks/useQueries';
import { Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function EmergencyOwnershipResetCard() {
  const [resetCode, setResetCode] = useState('');
  const emergencyReset = useEmergencyResetOwnership();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetCode.trim()) {
      toast.error('Please enter the emergency reset code');
      return;
    }

    try {
      await emergencyReset.mutateAsync(resetCode);
      toast.success('Ownership has been reset successfully. Ownership is now claimable.');
      setResetCode('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset ownership');
    }
  };

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Emergency Ownership Reset
        </CardTitle>
        <CardDescription>
          Reset ownership to allow a new admin to claim control. This action requires an emergency reset code.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Warning: This will remove the current owner and make ownership claimable by anyone. Use only in emergency situations.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resetCode">Emergency Reset Code</Label>
            <Input
              id="resetCode"
              type="text"
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value)}
              placeholder="Enter emergency reset code"
              disabled={emergencyReset.isPending}
              required
            />
          </div>

          <Button
            type="submit"
            variant="destructive"
            className="w-full gap-2"
            disabled={emergencyReset.isPending || !resetCode.trim()}
          >
            {emergencyReset.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Resetting Ownership...
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4" />
                Reset Ownership
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
