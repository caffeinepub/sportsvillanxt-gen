import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBlockSlot, useUnblockSlot } from '../../hooks/useQueries';
import { Ban, Unlock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface BlockSlotsDialogProps {
  date: bigint;
  startHour: bigint;
  isBlocked: boolean;
}

export default function BlockSlotsDialog({ date, startHour, isBlocked }: BlockSlotsDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const blockSlot = useBlockSlot();
  const unblockSlot = useUnblockSlot();

  const handleBlock = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for blocking');
      return;
    }

    try {
      await blockSlot.mutateAsync({
        date,
        startHour,
        reason: reason.trim(),
      });
      toast.success('Slot blocked successfully');
      setOpen(false);
      setReason('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to block slot');
    }
  };

  const handleUnblock = async () => {
    try {
      await unblockSlot.mutateAsync({ date, startHour });
      toast.success('Slot unblocked successfully');
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to unblock slot');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={isBlocked ? 'outline' : 'destructive'} size="sm" className="gap-2">
          {isBlocked ? (
            <>
              <Unlock className="h-4 w-4" />
              Unblock
            </>
          ) : (
            <>
              <Ban className="h-4 w-4" />
              Block
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isBlocked ? 'Unblock Slot' : 'Block Slot'}</DialogTitle>
          <DialogDescription>
            {isBlocked
              ? 'This will make the slot available for booking again.'
              : 'Block this slot for maintenance or offline bookings.'}
          </DialogDescription>
        </DialogHeader>

        {!isBlocked && (
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Maintenance, Private booking"
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          {isBlocked ? (
            <Button
              onClick={handleUnblock}
              disabled={unblockSlot.isPending}
              className="gap-2"
            >
              {unblockSlot.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Unblocking...
                </>
              ) : (
                <>
                  <Unlock className="h-4 w-4" />
                  Unblock Slot
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleBlock}
              disabled={blockSlot.isPending}
              variant="destructive"
              className="gap-2"
            >
              {blockSlot.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Blocking...
                </>
              ) : (
                <>
                  <Ban className="h-4 w-4" />
                  Block Slot
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
