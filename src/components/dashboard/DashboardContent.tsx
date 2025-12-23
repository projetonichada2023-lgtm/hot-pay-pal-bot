import { Routes, Route } from 'react-router-dom';
import { Client } from '@/hooks/useClient';
import { OverviewPage } from '@/pages/dashboard/OverviewPage';
import { MessagesPage } from '@/pages/dashboard/MessagesPage';
import { ChatsPage } from '@/pages/dashboard/ChatsPage';
import { BotConfigPage } from '@/pages/dashboard/BotConfigPage';
import { SettingsPage } from '@/pages/dashboard/SettingsPage';
import { ProductsPage } from '@/pages/dashboard/ProductsPage';
import { OrdersPage } from '@/pages/dashboard/OrdersPage';
import { CustomersPage } from '@/pages/dashboard/CustomersPage';
import { FunnelPage } from '@/pages/dashboard/FunnelPage';

interface DashboardContentProps {
  client: Client;
}

export const DashboardContent = ({ client }: DashboardContentProps) => {
  return (
    <main className="flex-1 overflow-auto">
      <div className="p-4 md:p-8">
        <Routes>
          <Route path="/" element={<OverviewPage client={client} />} />
          <Route path="/messages" element={<MessagesPage client={client} />} />
          <Route path="/chats" element={<ChatsPage client={client} />} />
          <Route path="/products" element={<ProductsPage client={client} />} />
          <Route path="/funnel" element={<FunnelPage client={client} />} />
          <Route path="/orders" element={<OrdersPage client={client} />} />
          <Route path="/customers" element={<CustomersPage client={client} />} />
          <Route path="/bot-config" element={<BotConfigPage client={client} />} />
          <Route path="/settings" element={<SettingsPage client={client} />} />
        </Routes>
      </div>
    </main>
  );
};
