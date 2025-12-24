import { Routes, Route } from "react-router-dom";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminDashboardPage } from "./AdminDashboardPage";
import { AdminClientsPage } from "./AdminClientsPage";
import { AdminSubscriptionsPage } from "./AdminSubscriptionsPage";
import { AdminStatsPage } from "./AdminStatsPage";
import { AdminOrdersPage } from "./AdminOrdersPage";
import { AdminFinancialsPage } from "./AdminFinancialsPage";
import { AdminSettingsPage } from "./AdminSettingsPage";
import { AdminAuditPage } from "./AdminAuditPage";
import { AdminUsersPage } from "./AdminUsersPage";

export const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <Routes>
          <Route path="/" element={<AdminDashboardPage />} />
          <Route path="/clients" element={<AdminClientsPage />} />
          <Route path="/subscriptions" element={<AdminSubscriptionsPage />} />
          <Route path="/stats" element={<AdminStatsPage />} />
          <Route path="/orders" element={<AdminOrdersPage />} />
          <Route path="/financials" element={<AdminFinancialsPage />} />
          <Route path="/settings" element={<AdminSettingsPage />} />
          <Route path="/audit" element={<AdminAuditPage />} />
          <Route path="/users" element={<AdminUsersPage />} />
        </Routes>
      </main>
    </div>
  );
};
