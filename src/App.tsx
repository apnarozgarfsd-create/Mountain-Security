import React, { useState } from 'react';
import { ChartOfAccountsView } from './components/accounting/ChartOfAccountsView';
import { SalarySlipsView } from './components/accounting/SalarySlipsView';
import { VouchersView } from './components/accounting/VouchersView';
import { AttendanceMasterView } from './components/attendance/AttendanceMasterView';
import { ClientsPage } from './components/clients/ClientsPage';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { PrintModal } from './components/common/PrintModal';
import { MainDashboard } from './components/dashboard/MainDashboard';
import { MultiAccountExpenseView } from './components/finance/MultiAccountExpenseView';
import { GuardHistoryView } from './components/guards/GuardHistoryView';
import { GuardsDirectoryView } from './components/guards/GuardsDirectoryView';
import { InventoryProductsView } from './components/inventory/InventoryProductsView';
import { InventoryTransactionsView } from './components/inventory/InventoryTransactionsView';
import { AppLayout } from './components/layout/AppLayout';
import { NativeAppsHub } from './components/native/NativeAppsHub';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { SitesPage } from './components/sites/SitesPage';
import { WeaponAssignmentsView } from './components/weapons/WeaponAssignmentsView';
import { WeaponsMasterView } from './components/weapons/WeaponsMasterView';
import { AppProvider, useApp } from './context/AppContext';

const AppContent: React.FC = () => {
  const { isPrintModalOpen, closePrintModal, activePrintJob, activeTab, setActiveTab, isSearchOpen, setIsSearchOpen } = useApp();

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <MainDashboard onNavigate={handleNavigate} />;
      case 'clients':
      case 'invoices':
        return <ClientsPage />;
      case 'sites':
        return <SitesPage />;
      case 'guards':
        return <GuardsDirectoryView />;
      case 'guard-history':
        return <GuardHistoryView />;
      case 'attendance':
      case 'guard-attendance':
        return <AttendanceMasterView />;
      case 'weapons':
        return <WeaponsMasterView />;
      case 'weapon-assignments':
      case 'weapon-history':
        return <WeaponAssignmentsView />;
      case 'inventory':
      case 'uniform-issues':
        return <InventoryProductsView />;
      case 'inventory-history':
        return <InventoryTransactionsView />;
      case 'multi-account-expense':
      case 'finance':
      case 'cashbook':
        return <MultiAccountExpenseView />;
      case 'salary-slips':
        return <SalarySlipsView />;
      case 'vouchers':
        return <VouchersView />;
      case 'chart-of-accounts':
        return <ChartOfAccountsView />;
      case 'financial-reports':
      case 'reports':
        return <ReportsView />;
      case 'native-apps':
        return <NativeAppsHub />;
      case 'audit-logs':
      case 'settings':
        return <SettingsView />;
      default:
        return <MainDashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <AppLayout>
      {renderActiveView()}

      {/* Global Search & Command Palette (Ctrl+K) */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Reusable Printable Document Gateway */}
      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={closePrintModal}
        printJob={activePrintJob}
      />
    </AppLayout>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
