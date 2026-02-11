import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGetOwners, useAddOwner, useRemoveOwner } from '../../hooks/useQueries';
import { Principal } from '@dfinity/principal';
import { Loader2, UserPlus, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function AdminOwnersCard() {
  const { data: owners, isLoading: ownersLoading } = useGetOwners();
  const addOwner = useAddOwner();
  const removeOwner = useRemoveOwner();

  const [newOwnerInput, setNewOwnerInput] = useState('');
  const [validationError, setValidationError] = useState('');

  const validatePrincipal = (input: string): Principal | null => {
    try {
      const principal = Principal.fromText(input.trim());
      return principal;
    } catch {
      return null;
    }
  };

  const handleAddOwner = async () => {
    setValidationError('');

    if (!newOwnerInput.trim()) {
      setValidationError('Please enter a principal ID');
      return;
    }

    const principal = validatePrincipal(newOwnerInput);
    if (!principal) {
      setValidationError('Invalid principal ID format');
      return;
    }

    try {
      await addOwner.mutateAsync(principal);
      toast.success('Owner added successfully');
      setNewOwnerInput('');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to add owner';
      toast.error(errorMessage);
    }
  };

  const handleRemoveOwner = async (owner: Principal) => {
    try {
      await removeOwner.mutateAsync(owner);
      toast.success('Owner removed successfully');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to remove owner';
      toast.error(errorMessage);
    }
  };

  const canAddOwner = owners && owners.length < 2;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <CardTitle>Admin Owners</CardTitle>
        </div>
        <CardDescription>
          Manage admin owners for this application (maximum 2 owners)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Owners List */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Current Owners ({owners?.length || 0}/2)</Label>
          {ownersLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : owners && owners.length > 0 ? (
            <div className="space-y-2">
              {owners.map((owner) => (
                <div
                  key={owner.toString()}
                  className="flex items-center justify-between rounded-lg border bg-muted/30 p-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono text-foreground break-all">
                      {owner.toString()}
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                        disabled={removeOwner.isPending}
                      >
                        {removeOwner.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Owner</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove this owner? This action cannot be undone.
                          {owners.length === 1 && (
                            <span className="block mt-2 text-destructive font-medium">
                              Warning: You cannot remove the last remaining owner.
                            </span>
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRemoveOwner(owner)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground">No owners configured</p>
            </div>
          )}
        </div>

        {/* Add New Owner */}
        {canAddOwner && (
          <div className="space-y-3 pt-3 border-t">
            <Label htmlFor="newOwner" className="text-sm font-medium">
              Add New Owner
            </Label>
            <div className="space-y-2">
              <Input
                id="newOwner"
                placeholder="Enter principal ID (e.g., xxxxx-xxxxx-xxxxx-xxxxx-xxx)"
                value={newOwnerInput}
                onChange={(e) => {
                  setNewOwnerInput(e.target.value);
                  setValidationError('');
                }}
                disabled={addOwner.isPending}
                className={validationError ? 'border-destructive' : ''}
              />
              {validationError && (
                <p className="text-sm text-destructive">{validationError}</p>
              )}
              <Button
                onClick={handleAddOwner}
                disabled={addOwner.isPending || !newOwnerInput.trim()}
                className="w-full"
              >
                {addOwner.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding Owner...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Owner
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {!canAddOwner && owners && owners.length >= 2 && (
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-sm text-muted-foreground">
              Maximum number of owners (2) reached. Remove an owner to add a new one.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
