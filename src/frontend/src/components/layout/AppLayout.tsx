import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Calendar, LayoutDashboard } from 'lucide-react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import LoginButton from '../auth/LoginButton';

export default function AppLayout() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const { identity } = useInternetIdentity();
  const currentPath = routerState.location.pathname;

  const isAuthenticated = !!identity;
  const isAdminRoute = currentPath.startsWith('/admin');
  const isCustomerRoute = currentPath === '/' || currentPath.startsWith('/payment') || currentPath.startsWith('/confirmation') || currentPath.startsWith('/receipt');

  const handleAdminClick = () => {
    if (isAuthenticated) {
      navigate({ to: '/admin' });
    } else {
      navigate({ to: '/admin/login' });
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div 
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: 'url(/assets/generated/sportsvilla-bg-pattern.dim_1920x1080.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Header */}
      <header className="relative z-10 border-b border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img 
                src="/assets/generated/sportsvilla-logo.dim_512x512.png" 
                alt="SportsVilla NXT GEN" 
                className="h-12 w-12 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-foreground tracking-tight">
                  SPORTSVILLA
                </h1>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  NXT GEN
                </p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-3">
              <Button
                variant={isCustomerRoute ? 'default' : 'outline'}
                size="sm"
                onClick={() => navigate({ to: '/' })}
                className="gap-2"
              >
                <Calendar className="h-4 w-4" />
                Book Now
              </Button>
              <Button
                variant={isAdminRoute ? 'default' : 'outline'}
                size="sm"
                onClick={handleAdminClick}
                className="gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                Admin
              </Button>
              <LoginButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/40 bg-card/30 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            © 2026. Built with love using{' '}
            <a 
              href="https://caffeine.ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
