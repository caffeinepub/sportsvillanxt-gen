import { useState, useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useIsCallerAdmin, useIsOwnershipClaimable, useClaimOwnership, useResetAndClaimOwnership } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
    try {
      await resetAndClaim.mutateAsync();
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
  if (isOwnershipClaimable === false) {
    // Owner already exists, show access restricted with reset and claim option
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
                Only the owner can access the admin dashboard. The owner/admin is <span className="font-semibold text-foreground">sportlogin8@gmail.com</span>.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate({ to: '/' })}
                variant="outline"
                className="w-full"
              >
                Go to Booking Page
              </Button>
              <div className="mt-4 space-y-2 text-center">
                <p className="text-xs text-muted-foreground">
                  If you believe you should have access, please contact the owner.
                </p>
                <p className="text-xs text-muted-foreground">
                  Owner/Admin contact: <span className="font-medium">sportlogin8@gmail.com</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Reset and Claim Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Reset and Claim Ownership</CardTitle>
              </div>
              <CardDescription>
                If you are the rightful owner, you can reset and claim ownership in one step. This will make you the new admin.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg bg-muted p-4 text-sm">
                  <p className="font-medium mb-2">What happens when you reset and claim?</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Ownership will be reset</li>
                    <li>You will immediately become the new admin/owner</li>
                    <li>You will have full access to the admin dashboard</li>
                    <li>This action cannot be undone</li>
                  </ul>
                </div>
                
                <Button 
                  onClick={handleResetAndClaim}
                  disabled={resetAndClaim.isPending}
                  className="w-full"
                  variant="destructive"
                  size="lg"
                >
                  {resetAndClaim.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting and claiming...
                    </>
                  ) : (
                    'Reset and Claim Ownership'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Authenticated, not admin, and ownership is claimable - show claim ownership
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
              No owner has been set for this admin dashboard. You can claim ownership to become the admin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4 text-sm">
                <p className="font-medium mb-2">What happens when you claim ownership?</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>You will become the admin/owner</li>
                  <li>You will have full access to the admin dashboard</li>
                  <li>You can manage bookings, settings, and earnings</li>
                  <li>Only one owner can exist at a time</li>
                </ul>
              </div>
              
              <Button 
                onClick={handleClaimOwnership} 
                disabled={claimOwnership.isPending}
                className="w-full"
                size="lg"
              >
                {claimOwnership.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Claiming ownership...
                  </>
                ) : (
                  'Claim Ownership'
                )}
              </Button>

              <Button 
                onClick={() => navigate({ to: '/' })}
                variant="outline"
                className="w-full"
              >
                Go to Booking Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
