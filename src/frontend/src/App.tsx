import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter, createRootRoute, createRoute } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import AppLayout from './components/layout/AppLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import CustomerBookingPage from './pages/customer/CustomerBookingPage';
import PaymentPlaceholderPage from './pages/customer/PaymentPlaceholderPage';
import BookingConfirmationPage from './pages/customer/BookingConfirmationPage';
import ReceiptLookupPage from './pages/customer/ReceiptLookupPage';
import RequireAdmin from './components/auth/RequireAdmin';
import AppErrorBoundary from './components/system/AppErrorBoundary';

const queryClient = new QueryClient();

const rootRoute = createRootRoute({
  component: AppLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: CustomerBookingPage,
});

const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/login',
  component: AdminLoginPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: () => (
    <RequireAdmin>
      <AdminDashboardPage />
    </RequireAdmin>
  ),
});

const paymentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment',
  component: PaymentPlaceholderPage,
});

const confirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/confirmation/$bookingId',
  component: BookingConfirmationPage,
});

const receiptLookupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/receipt',
  component: ReceiptLookupPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  adminLoginRoute,
  adminRoute,
  paymentRoute,
  confirmationRoute,
  receiptLookupRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <RouterProvider router={router} />
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}
