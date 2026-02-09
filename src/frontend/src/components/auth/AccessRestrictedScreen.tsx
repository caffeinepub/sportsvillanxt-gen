import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { ShieldAlert } from 'lucide-react';

export default function AccessRestrictedScreen() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <Card className="border-destructive/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <ShieldAlert className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-destructive">Access Restricted</CardTitle>
            <CardDescription>
              This admin dashboard is owner-only. Only <span className="font-semibold text-foreground">sportlogin8@gmail.com</span> (the owner/admin) can access this area.
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
      </div>
    </div>
  );
}
