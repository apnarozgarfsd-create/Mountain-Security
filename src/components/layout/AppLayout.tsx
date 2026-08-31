import {
  AlertTriangle,
  Building,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Database,
  Download,
  FileSpreadsheet,
  FileText,
  History,
  Laptop,
  Layers,
  LayoutDashboard,
  Lock,
  LogOut,
  MapPin,
  Menu,
  Moon,
  Package,
  Plus,
  Printer,
  Receipt,
  Search,
  Settings,
  Shield,
  Smartphone,
  Sun,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { RoleAuthModal } from '../auth/RoleAuthModal';
import { SystemLockScreen } from '../auth/SystemLockScreen';
import { MountainLogo } from '../common/MountainLogo';
import { MobileBottomNav } from './MobileBottomNav';
import { WindowsTitleBar } from './WindowsTitleBar';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
  badgeColor?: string;
}

interface NavGroup {
  groupTitle: string;
  items: NavItem[];
}

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    activeTab,
    setActiveTab,
    currentUserRole,
    requestRoleSwitch,
    lockSystem,
    securitySettings,
    setIsSearchOpen,
    companySettings,
    guards,
    weapons,
    products,
    clients,
    sites,
    vouchers,
    salarySlips,
    clientInvoices,
  } = useApp();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const lowStockCount = products.filter((p) => p.currentStock <= p.minimumStock).length;
  const activeGuardsCount = guards.filter((g) => g.status === 'Active').length;
  const issuedWeaponsCount = weapons.filter((w) => w.currentStatus === 'Issued').length;
  const pendingInvoicesCount = clientInvoices.filter((i) => i.status !== 'Paid').length;

  const navGroups: NavGroup[] = [
    {
      groupTitle: 'CORE OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Main Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: 'sites', label: 'Sites & Deployments', icon: <MapPin className="w-4 h-4" />, badge: sites.length },
      ],
    },
    {
      groupTitle: 'PERSONNEL & GUARDS',
      items: [
        { id: 'attendance', label: 'Guard Attendance (حاضری)', icon: <Calendar className="w-4 h-4 text-emerald-400" />, badge: 'Duty Register', badgeColor: 'bg-emerald-900/80 text-emerald-200' },
        { id: 'guards', label: 'Guards Directory', icon: <Users className="w-4 h-4" />, badge: `${activeGuardsCount}/${guards.length}` },
        { id: 'guard-history', label: 'Transfer & Duty History', icon: <History className="w-4 h-4" /> },
      ],
    },
    {
      groupTitle: 'ARMOURY & WEAPONS',
      items: [
        { id: 'weapons', label: 'Weapons Master', icon: <Shield className="w-4 h-4" />, badge: `${issuedWeaponsCount} Issued`, badgeColor: 'bg-red-900/60 text-red-200' },
        { id: 'weapon-assignments', label: 'Weapon Movement Log', icon: <FileText className="w-4 h-4" /> },
      ],
    },
    {
      groupTitle: 'INVENTORY & UNIFORMS',
      items: [
        { id: 'inventory', label: 'Products & Store', icon: <Package className="w-4 h-4" />, badge: lowStockCount > 0 ? `${lowStockCount} Low` : undefined, badgeColor: 'bg-amber-900/60 text-amber-200' },
        { id: 'uniform-issues', label: 'Uniform Issue Register', icon: <Layers className="w-4 h-4" /> },
      ],
    },
    {
      groupTitle: 'CLIENTS & CONTRACTS',
      items: [
        { id: 'clients', label: 'Client Accounts', icon: <Building className="w-4 h-4" />, badge: clients.length },
        { id: 'invoices', label: 'Invoices & Billing', icon: <FileSpreadsheet className="w-4 h-4" />, badge: pendingInvoicesCount > 0 ? `${pendingInvoicesCount} Due` : undefined, badgeColor: 'bg-blue-900/60 text-blue-200' },
      ],
    },
    {
      groupTitle: 'FINANCE & ACCOUNTS',
      items: [
        { id: 'salary-slips', label: 'Salary Slips (MSS Slip)', icon: <FileText className="w-4 h-4 text-emerald-400" />, badge: 'Print' },
        { id: 'vouchers', label: 'Double-Entry Vouchers', icon: <Receipt className="w-4 h-4" />, badge: vouchers.length },
        { id: 'chart-of-accounts', label: 'Chart of Accounts', icon: <Wallet className="w-4 h-4" /> },
        { id: 'financial-reports', label: 'Ledgers & Statements', icon: <TrendingUp className="w-4 h-4" /> },
      ],
    },
    {
      groupTitle: 'SYSTEM & DEPLOYMENT',
      items: [
        { id: 'native-apps', label: 'Android & Windows App', icon: <Smartphone className="w-4 h-4 text-sky-400" />, badge: 'Apps', badgeColor: 'bg-sky-900/80 text-sky-200' },
        { id: 'audit-logs', label: 'System Audit Logs', icon: <History className="w-4 h-4" /> },
        { id: 'settings', label: 'Settings & Company Profile', icon: <Settings className="w-4 h-4" /> },
      ],
    },
  ];

  const roles: UserRole[] = [
    'Super Admin',
    'Accountant',
    'HR Manager',
    'Armoury Officer',
    'Site Supervisor',
    'Viewer',
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* Windows Title Bar / App Bar */}
      <WindowsTitleBar onOpenAppsHub={() => setActiveTab('native-apps')} />

      {/* Top Navigation Bar */}
      <header className="no-print sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 py-2.5 flex items-center justify-between shadow-md">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            aria-label="Toggle Sidebar"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <MountainLogo size="sm" showText={false} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-sm sm:text-base tracking-wider text-white uppercase group-hover:text-blue-400 transition-colors">
                  MOUNTAIN SECURITY SERVICES
                </span>
                <span className="hidden sm:inline-block bg-red-600/90 text-white font-mono text-[10px] font-black px-1.5 py-0.5 rounded">
                  SGMS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-tight -mt-0.5">
                Security Management & Double-Entry Accounting System
              </p>
            </div>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full bg-slate-900/90 hover:bg-slate-800/90 text-slate-400 text-xs px-3.5 py-2 rounded-lg border border-slate-700/70 flex items-center justify-between transition-colors shadow-inner cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search Guards, Weapons, Clients, Sites, Vouchers, Slips...</span>
            </span>
            <kbd className="bg-slate-800 border border-slate-700 text-[10px] px-1.5 py-0.5 rounded text-slate-400 font-mono">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right: Quick Action Buttons & Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Quick Apps Install Header Button */}
          <button
            onClick={() => setActiveTab('native-apps')}
            className="hidden xl:inline-flex items-center gap-1.5 bg-linear-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install App (APK/EXE)</span>
          </button>

          <button
            onClick={() => setActiveTab('salary-slips')}
            className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Slip</span>
          </button>

          <button
            onClick={() => setActiveTab('vouchers')}
            className="hidden sm:inline-flex items-center gap-1.5 bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Voucher</span>
          </button>

          {/* Lock System Button */}
          <button
            onClick={lockSystem}
            title="Lock Session / Workstation"
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 px-2 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Lock</span>
          </button>

          {/* User Role Selector */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span>{currentUserRole}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold text-slate-400 border-b border-slate-800 flex items-center justify-between">
                  <span>Switch Active Role</span>
                  {securitySettings.requirePasswordOnSwitch && (
                    <span className="text-[9px] text-amber-400 font-normal flex items-center gap-0.5">
                      <Lock className="w-2.5 h-2.5" /> PIN Protected
                    </span>
                  )}
                </div>
                {roles.map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      setIsRoleDropdownOpen(false);
                      requestRoleSwitch(role);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-900 cursor-pointer transition-colors ${
                      currentUserRole === role ? 'text-blue-400 font-bold bg-slate-900/50' : 'text-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {securitySettings.requirePasswordOnSwitch && currentUserRole !== role && (
                        <Lock className="w-2.5 h-2.5 text-slate-500" />
                      )}
                      <span>{role}</span>
                    </span>
                    {currentUserRole === role && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container with Sidebar and Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`no-print fixed inset-y-0 left-0 z-30 w-64 bg-slate-950 border-r border-slate-800/80 pt-16 lg:pt-0 transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 overflow-y-auto flex flex-col justify-between ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-3 space-y-4">
            {navGroups.map((group) => (
              <div key={group.groupTitle} className="space-y-1">
                <div className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {group.groupTitle}
                </div>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-sm font-bold'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/70'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          {item.icon}
                          <span>{item.label}</span>
                        </span>
                        {item.badge !== undefined && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                              item.badgeColor || (isActive ? 'bg-blue-800 text-white' : 'bg-slate-800 text-slate-400')
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-slate-900 bg-slate-950/60 text-[11px] text-slate-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span>Faisalabad HQ</span>
            </div>
            <button
              onClick={() => setActiveTab('native-apps')}
              className="font-mono text-[10px] text-sky-400 hover:text-sky-300 font-bold cursor-pointer"
            >
              Android & Win App
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-900/95 p-3 sm:p-5 lg:p-6 pb-20 lg:pb-6 print:p-0 print:bg-white print:overflow-visible">
          {children}
        </main>
      </div>

      {/* Mobile / Android Bottom Navigation Bar */}
      <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Role Switch Password Authentication Modal */}
      <RoleAuthModal />

      {/* Full Workstation Lock Screen */}
      <SystemLockScreen />

      {/* Backdrop for mobile sidebar */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-20 lg:hidden"
        />
      )}
    </div>
  );
};
