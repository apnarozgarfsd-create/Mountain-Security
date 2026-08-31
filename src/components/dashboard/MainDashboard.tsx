import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Award,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  FileSpreadsheet,
  FileText,
  MapPin,
  Package,
  Plus,
  Printer,
  Receipt,
  Shield,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
  Zap,
} from 'lucide-react';
import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatPKR } from '../../utils/formatters';
import { QuickAttendanceCard } from './QuickAttendanceCard';

export const MainDashboard: React.FC = () => {
  const {
    clients,
    sites,
    guards,
    weapons,
    products,
    vouchers,
    salarySlips,
    clientInvoices,
    accounts,
    setActiveTab,
    triggerPrint,
  } = useApp();

  // Metrics Calculations
  const totalClients = clients.length;
  const activeSites = sites.filter((s) => s.status === 'Active').length;
  const totalGuards = guards.length;
  const guardsOnDuty = guards.filter((g) => g.status === 'Active' && g.currentSiteId).length;
  const availableGuards = guards.filter((g) => g.status === 'Active' && !g.currentSiteId).length;
  const guardsOnLeave = guards.filter((g) => g.status === 'On Leave').length;

  const totalWeapons = weapons.length;
  const issuedWeapons = weapons.filter((w) => w.currentStatus === 'Issued').length;
  const availableWeapons = weapons.filter((w) => w.currentStatus === 'Available').length;
  const weaponsInRepair = weapons.filter((w) => w.currentStatus === 'Under Maintenance').length;

  const totalProducts = products.length;
  const lowStockProducts = products.filter((p) => p.currentStock <= p.minimumStock);

  // Accounting metrics from Chart of Accounts
  const cashAccount = accounts.find((a) => a.accountCode === '1010');
  const bankAccount = accounts.find((a) => a.accountCode === '1020');
  const receivablesAccount = accounts.find((a) => a.accountCode === '1030');

  const cashBalance = cashAccount ? cashAccount.currentBalance : 0;
  const bankBalance = bankAccount ? bankAccount.currentBalance : 0;
  const clientReceivables = receivablesAccount ? receivablesAccount.currentBalance : 0;

  // Income vs Expenses
  const incomeAccounts = accounts.filter((a) => a.category === 'Income');
  const expenseAccounts = accounts.filter((a) => a.category === 'Expense');

  const totalIncome = incomeAccounts.reduce((sum, a) => sum + a.currentBalance, 0);
  const totalExpense = expenseAccounts.reduce((sum, a) => sum + a.currentBalance, 0);
  const netProfit = totalIncome - totalExpense;

  const todayReceipts = vouchers
    .filter((v) => v.voucherType === 'Receipt' && v.status === 'Posted')
    .reduce((sum, v) => sum + v.totalDebit, 0);

  const todayPayments = vouchers
    .filter((v) => v.voucherType === 'Payment' && v.status === 'Posted')
    .reduce((sum, v) => sum + v.totalDebit, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome with Quick Actions */}
      <div className="bg-linear-to-r from-slate-950 via-slate-900 to-blue-950 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-blue-600/5 blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-950/80 border border-red-800/60 text-red-300 text-xs font-bold mb-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Live Operations Monitoring
            </div>
            <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white uppercase">
              Mountain Security Services HQ
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Faisalabad Central Armoury, Guard Deployments, Client Billing & Integrated Double-Entry Accounts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActiveTab('attendance')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer hover:shadow-blue-600/20 hover:-translate-y-0.5"
            >
              <Calendar className="w-4 h-4 text-emerald-300" />
              <span>Guard Attendance (حاضری)</span>
            </button>

            <button
              onClick={() => setActiveTab('salary-slips')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer hover:shadow-emerald-600/20 hover:-translate-y-0.5"
            >
              <FileText className="w-4 h-4" />
              <span>Official Salary Slip</span>
            </button>

            <button
              onClick={() => setActiveTab('vouchers')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-blue-400" />
              <span>Post Voucher</span>
            </button>
          </div>
        </div>
      </div>

      {/* Row 1: High Level Force & Operations Metrics */}
      <div>
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-red-500" />
          <span>Security Force & Deployment Metrics</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
              <span>Clients</span>
              <Building className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-white">{totalClients}</div>
            <div className="text-[11px] text-emerald-400 font-medium mt-1">100% Active Contracts</div>
          </div>

          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
              <span>Active Sites</span>
              <MapPin className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white">{activeSites}</div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Industrial & Commercial</div>
          </div>

          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
              <span>Total Force</span>
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-white">{totalGuards}</div>
            <div className="text-[11px] text-blue-400 font-medium mt-1">
              {guardsOnDuty} on active duty
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
              <span>Armoury Stock</span>
              <Shield className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-2xl font-black text-white">{totalWeapons}</div>
            <div className="text-[11px] text-red-400 font-medium mt-1">
              {issuedWeapons} weapons deployed
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
              <span>Available Guns</span>
              <Award className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">{availableWeapons}</div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">In HQ Armoury</div>
          </div>

          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
              <span>Store Items</span>
              <Package className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white">{totalProducts}</div>
            <div className={`text-[11px] font-medium mt-1 ${lowStockProducts.length > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
              {lowStockProducts.length} low stock alert{lowStockProducts.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Attendance Live Register Card */}
      <QuickAttendanceCard />

      {/* Row 2: Financial & Accounting Master KPIs */}
      <div>
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <Wallet className="w-4 h-4 text-emerald-500" />
          <span>Live Financials & Double-Entry Cash Position</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Cash in Hand */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400">Cash in Hand (Drawer)</span>
              <div className="text-xl font-black text-white mt-1">{formatPKR(cashBalance)}</div>
              <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3 h-3" /> Account 1010 Live
              </span>
            </div>
            <div className="p-2.5 bg-emerald-950/60 border border-emerald-800/50 rounded-lg text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          {/* Meezan Bank Balance */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400">Bank Balance (Meezan Bank)</span>
              <div className="text-xl font-black text-white mt-1">{formatPKR(bankBalance)}</div>
              <span className="text-[11px] text-blue-400 font-medium flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3 h-3" /> Account 1020 Live
              </span>
            </div>
            <div className="p-2.5 bg-blue-950/60 border border-blue-800/50 rounded-lg text-blue-400">
              <Wallet className="w-5 h-5" />
            </div>
          </div>

          {/* Client Receivables */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400">Client Receivables (Due)</span>
              <div className="text-xl font-black text-amber-400 mt-1">{formatPKR(clientReceivables)}</div>
              <span className="text-[11px] text-slate-400 font-medium mt-1">Outstanding Invoices</span>
            </div>
            <div className="p-2.5 bg-amber-950/60 border border-amber-800/50 rounded-lg text-amber-400">
              <Receipt className="w-5 h-5" />
            </div>
          </div>

          {/* Net Profit */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400">Operating Net Profit</span>
              <div className="text-xl font-black text-emerald-400 mt-1">{formatPKR(netProfit)}</div>
              <span className="text-[11px] text-slate-400 font-medium mt-1">
                Income: {formatPKR(totalIncome)} | Exp: {formatPKR(totalExpense)}
              </span>
            </div>
            <div className="p-2.5 bg-purple-950/60 border border-purple-800/50 rounded-lg text-purple-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Active Sites & Guard Deployments Grid + Recent Vouchers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Deployments Table (2 cols) */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-500" />
              <span>Active Client Sites & Deployed Force</span>
            </h3>
            <button
              onClick={() => setActiveTab('sites')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
            >
              View All ({sites.length}) →
            </button>
          </div>

          <div className="overflow-x-auto grow">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <th className="py-2.5 px-3">Site Name & Code</th>
                  <th className="py-2.5 px-3">Client</th>
                  <th className="py-2.5 px-3">Supervisor</th>
                  <th className="py-2.5 px-3 text-center">Required Guards</th>
                  <th className="py-2.5 px-3 text-right">Monthly Billing</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {sites.map((site) => (
                  <tr key={site.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-200">
                      <div>{site.siteName}</div>
                      <span className="text-[10px] text-slate-400 font-mono">{site.siteCode}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">{site.clientName}</td>
                    <td className="py-2.5 px-3 text-slate-400">{site.siteSupervisor || 'Ali Akbar'}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-block bg-blue-950 text-blue-300 px-2 py-0.5 rounded font-mono font-bold">
                        {site.requiredGuards} Guards
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-200">
                      {formatPKR(site.monthlyRate)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                        {site.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Vouchers & Transactions (1 col) */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-blue-500" />
                <span>Recent Double-Entry Vouchers</span>
              </h3>
              <button
                onClick={() => setActiveTab('vouchers')}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
              >
                All Vouchers →
              </button>
            </div>

            <div className="space-y-2.5">
              {vouchers.slice(0, 4).map((vouch) => (
                <div
                  key={vouch.id}
                  onClick={() =>
                    triggerPrint({
                      type: 'voucher',
                      data: vouch,
                      title: `Voucher #${vouch.voucherNo}`,
                    })
                  }
                  className="p-3 bg-slate-900/70 hover:bg-slate-900 border border-slate-800/80 rounded-lg cursor-pointer transition-colors group"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-blue-400 group-hover:text-blue-300 font-mono">
                      {vouch.voucherNo}
                    </span>
                    <span className="font-black text-slate-100">{formatPKR(vouch.totalDebit)}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-1">{vouch.narration}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 font-medium">
                    <span>Type: {vouch.voucherType}</span>
                    <span>{vouch.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-center">
            <button
              onClick={() => setActiveTab('vouchers')}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              + Create New General / Cash Voucher
            </button>
          </div>
        </div>
      </div>

      {/* Row 4: Low Stock Alert Warning Box (If any) */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-900/60 text-amber-300 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-200">
                {lowStockProducts.length} Inventory Product(s) Below Minimum Reorder Level
              </h4>
              <p className="text-xs text-amber-300/80 mt-0.5">
                {lowStockProducts.map((p) => `${p.productName} (${p.currentStock} ${p.unit} remaining)`).join(', ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('inventory')}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Open Store Manager
          </button>
        </div>
      )}
    </div>
  );
};
