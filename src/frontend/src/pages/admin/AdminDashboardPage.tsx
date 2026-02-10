import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Calendar, DollarSign } from 'lucide-react';
import SlotSettingsForm from '../../components/admin/SlotSettingsForm';
import PricingRulesForm from '../../components/admin/PricingRulesForm';
import EmergencyOwnershipResetCard from '../../components/admin/EmergencyOwnershipResetCard';
import AdminBookingCalendar from '../../components/admin/AdminBookingCalendar';
import EarningsTracker from '../../components/admin/EarningsTracker';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('calendar');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your turf bookings, settings, and earnings</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="calendar" className="gap-2">
            <Calendar className="h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="earnings" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Earnings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-6">
          <AdminBookingCalendar />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <SlotSettingsForm />
            <PricingRulesForm />
          </div>
          <div className="max-w-2xl">
            <EmergencyOwnershipResetCard />
          </div>
        </TabsContent>

        <TabsContent value="earnings" className="space-y-6">
          <EarningsTracker />
        </TabsContent>
      </Tabs>
    </div>
  );
}
