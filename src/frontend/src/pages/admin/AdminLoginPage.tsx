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
      toast.success('Ownership reset and claimed successfully! You are now an admin owner.');
      
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
                <p className="text-sm text-muted-foreground">Checking access permissions...</p>
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
              <CardTitle>Admin Access</CardTitle>
              <CardDescription>
                Sign in to access the admin dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="w-full"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  'Sign In with Internet Identity'
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                This area is restricted to admin owners only
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Authenticated but not admin - show claim or reset options
  if (isOwnershipClaimable) {
    // Ownership is claimable - show claim button
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
                No admin owners are currently configured. Claim ownership to become an admin.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleClaimOwnership}
                disabled={claimOwnership.isPending}
                className="w-full"
              >
                {claimOwnership.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Claiming Ownership...
                  </>
                ) : (
                  'Claim Ownership'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Ownership already claimed - show access restricted with reset option
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto space-y-4">
        <Card className="border-destructive/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <ShieldAlert className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-destructive">Access Restricted</CardTitle>
            <CardDescription>
              This admin dashboard is restricted to admin owners. If you believe you should have access, please contact an existing admin owner.
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Emergency Reset</CardTitle>
            </div>
            <CardDescription>
              If you have an emergency reset code, you can reset ownership and claim it
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resetCode">Reset Code</Label>
              <Input
                id="resetCode"
                type="text"
                placeholder="Enter reset code"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                disabled={resetAndClaim.isPending}
              />
            </div>
            <Button
              onClick={handleResetAndClaim}
              disabled={resetAndClaim.isPending || !resetCode.trim()}
              variant="destructive"
              className="w-full"
            >
              {resetAndClaim.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                'Reset and Claim Ownership'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
