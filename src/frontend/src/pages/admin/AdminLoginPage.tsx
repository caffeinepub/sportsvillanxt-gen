import { useState, useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useIsCallerAdmin, useIsOwnershipClaimable, useClaimOwnership, useResetAndClaimOwnership } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ShieldCheck, ShieldAlert, UserPlus, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLoginPage() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { returnTo?: string };
  
  const { data: isAdmin, isLoading: isAdminLoading, refetch: refetchAdminStatus } = useIsCallerAdmin();
  const { data: isOwnershipClaimable, isLoading: isOwnershipLoading, refetch: refetchOwnershipClaimable } = useIsOwnershipClaimable();
  const claimOwnership = useClaimOwnership();
  const resetAndClaim = useResetAndClaimOwnership();

  const [checkingAccess, setCheckingAccess] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const [resetCode, setResetCode] = useState('');

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  // Check admin status after authentication
  useEffect(() => {
    if (isAuthenticated && !isAdminLoading && !isOwnershipLoading && !accessChecked) {
      setCheckingAccess(true);
      
      // Check if user is admin
      if (isAdmin === true) {
        // User is admin, redirect to admin dashboard
        const returnPath = search.returnTo || '/admin';
        navigate({ to: returnPath });
      } else if (isAdmin === false) {
        // User is not admin, access check complete
        setAccessChecked(true);
        setCheckingAccess(false);
      }
    }
  }, [isAuthenticated, isAdmin, isAdminLoading, isOwnershipLoading, accessChecked, navigate, search.returnTo]);

  const handleLogin = async () => {
    try {
      await login();
      setAccessChecked(false); // Reset to check access after login
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message === 'User is already authenticated') {
        setAccessChecked(false);
        await refetchAdminStatus();
      } else {
        toast.error('Failed to sign in. Please try again.');
      }
    }
  };

  const handleClaimOwnership = async () => {
    try {
      await claimOwnership.mutateAsync();
      toast.success('Ownership claimed successfully!');
      
      // Refetch admin status and redirect
      await refetchAdminStatus();
      const returnPath = search.returnTo || '/admin';
      navigate({ to: returnPath });
    } catch (error: any) {
      console.error('Claim ownership error:', error);
      const errorMessage = error.message || 'Failed to claim ownership';
      toast.error(errorMessage);
      
      // Refetch ownership status in case it changed
      await refetchOwnershipClaimable();
    }
  };

  const handleResetAndClaim = async () => {
    if (!resetCode.trim()) {
      toast.error('Please enter a reset code');
      return;
    }

    try {
      await resetAndClaim.mutateAsync(resetCode);
      toast.success('Ownership reset and claimed successfully! You are now the admin.');
      
      // Refetch admin status and redirect
      await refetchAdminStatus();
      await refetchOwnershipClaimable();
      
      const returnPath = search.returnTo || '/admin';
      navigate({ to: returnPath });
    } catch (error: any) {
      console.error('Reset and claim error:', error);
      const errorMessage = error.message || 'Failed to reset and claim ownership';
      toast.error(errorMessage);
      
      // Don't redirect on error
      // Refetch both statuses in case something changed
      await refetchAdminStatus();
      await refetchOwnershipClaimable();
    }
  };

  // Show loading while checking access
  if (checkingAccess || (isAuthenticated && (isAdminLoading || isOwnershipLoading))) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Checking access...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Not authenticated - show login
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Admin Owner Access</CardTitle>
              <CardDescription>
                This admin dashboard is restricted to the owner only. The owner/admin is <span className="font-semibold text-foreground">sportlogin8@gmail.com</span>.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleLogin} 
                disabled={isLoggingIn}
                className="w-full"
                size="lg"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in with Internet Identity'
                )}
              </Button>
              <div className="mt-4 space-y-2 text-center">
                <p className="text-xs text-muted-foreground">
                  Only the owner can access this area. If you are the owner, sign in with your Internet Identity to continue.
                </p>
                <p className="text-xs text-muted-foreground">
                  Owner contact: <span className="font-medium">sportlogin8@gmail.com</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Authenticated but not admin - check if ownership is claimable
  if (isOwnershipClaimable === true) {
    // Ownership is claimable - show claim UI
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <UserPlus className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Claim Ownership</CardTitle>
              <CardDescription>
                No owner has been set yet. You can claim ownership of this application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleClaimOwnership} 
                disabled={claimOwnership.isPending}
                className="w-full"
                size="lg"
              >
                {claimOwnership.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Claiming...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Claim Ownership
                  </>
                )}
              </Button>
              <p className="mt-4 text-xs text-center text-muted-foreground">
                By claiming ownership, you will become the admin and have full access to the admin dashboard.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Authenticated but not admin and ownership is not claimable - show reset and claim UI
  if (isOwnershipClaimable === false) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto space-y-6">
          <Card className="border-destructive/50">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <ShieldAlert className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-destructive">Access Restricted</CardTitle>
              <CardDescription>
                This admin dashboard is restricted to the owner only. The current owner/admin is <span className="font-semibold text-foreground">sportlogin8@gmail.com</span>.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4 text-sm">
                <p className="font-medium mb-2">Why can't I access this?</p>
                <p className="text-muted-foreground">
                  Only the designated owner can access the admin dashboard. This ensures secure management of bookings, settings, and earnings.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Need access?</p>
                <p className="text-sm text-muted-foreground">
                  Contact the owner at <span className="font-medium text-foreground">sportlogin8@gmail.com</span> to request access or transfer ownership.
                </p>
              </div>
              <Button 
                onClick={() => navigate({ to: '/' })}
                variant="outline"
                className="w-full"
              >
                Return to Booking Page
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <KeyRound className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Reset and Claim Ownership</CardTitle>
              <CardDescription>
                If you have the emergency reset code, you can reset and claim ownership in one step.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resetCode">Emergency Reset Code</Label>
                <Input
                  id="resetCode"
                  type="text"
                  placeholder="Enter reset code"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  disabled={resetAndClaim.isPending}
                />
                <p className="text-xs text-muted-foreground">
                  This code is provided by the system administrator for emergency access recovery.
                </p>
              </div>
              <Button 
                onClick={handleResetAndClaim} 
                disabled={resetAndClaim.isPending || !resetCode.trim()}
                className="w-full"
                size="lg"
              >
                {resetAndClaim.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting and Claiming...
                  </>
                ) : (
                  <>
                    <KeyRound className="mr-2 h-4 w-4" />
                    Reset and Claim Ownership
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Fallback loading state
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
