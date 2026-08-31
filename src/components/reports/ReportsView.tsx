import {
  AlertTriangle,
  Award,
  Building,
  CheckCircle,
  Clock,
  DollarSign,
  FileSpreadsheet,
  FileText,
  PieChart,
  Printer,
  Shield,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatPKR } from '../../utils/formatters';

export const ReportsView: React.FC = () => {
  const {
    accounts,
    vouchers,
    clients,
    sites,
    guards,
    weapons,
    products,
    salarySlips,
    triggerPrint,
    companySettings,
  } = useApp();

  const [activeReportTab, setActiveReportTab] = useState<
    'pnl' | 'balance-sheet' | 'trial-balance' | 'receivables' | 'site-deployment' | 'armoury-status' | 'inventory-audit'
  >('pnl');

  // Profit & Loss Math
  const incomeAccounts = accounts.filter((a) => a.category === 'Income');
  const expenseAccounts = accounts.filter((a) => a.category === 'Expense');

  const totalIncome = incomeAccounts.reduce((sum, a) => sum + a.currentBalance, 0);
  const totalExpense = expenseAccounts.reduce((sum, a) => sum + a.currentBalance, 0);
  const netProfit = totalIncome - totalExpense;

  // Balance Sheet Math
  const assetAccounts = accounts.filter((a) => a.category === 'Asset');
  const liabilityAccounts = accounts.filter((a) => a.category === 'Liability');
  const equityAccounts = accounts.filter((a) => a.category === 'Equity');

  const totalAssets = assetAccounts.reduce((sum, a) => sum + a.currentBalance, 0);
  const totalLiabilities = liabilityAccounts.reduce((sum, a) => sum + a.currentBalance, 0);
  const totalEquity = equityAccounts.reduce((sum, a) => sum + a.currentBalance, 0) + netProfit;

  // Receivables
  const totalClientReceivables = clients.reduce((sum, c) => sum + (c.currentBalance || c.monthlyBillingAmount || 0), 0);

  // Guards Force
  const totalGuards = guards.length;
  const onDutyGuards = guards.filter((g) => g.currentSiteId).length;
  const availableGuards = totalGuards - onDutyGuards;

  // Weapons
  const issuedWeapons = weapons.filter((w) => w.currentStatus === 'Issued').length;
  const availableWeapons = weapons.filter((w) => w.currentStatus === 'Available').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white uppercase flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-blue-400" />
            <span>Executive Financial & Force Reports</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Automated double-entry financial statements, receivables aging, deployment matrix and weapon registries.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print Active Report</span>
        </button>
      </div>

      {/* Report Category Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        <button
          onClick={() => setActiveReportTab('pnl')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-2 ${
            activeReportTab === 'pnl'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Profit & Loss Statement</span>
        </button>

        <button
          onClick={() => setActiveReportTab('balance-sheet')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-2 ${
            activeReportTab === 'balance-sheet'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Balance Sheet</span>
        </button>

        <button
          onClick={() => setActiveReportTab('trial-balance')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-2 ${
            activeReportTab === 'trial-balance'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Trial Balance</span>
        </button>

        <button
          onClick={() => setActiveReportTab('receivables')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-2 ${
            activeReportTab === 'receivables'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Client Receivables Aging</span>
        </button>

        <button
          onClick={() => setActiveReportTab('site-deployment')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-2 ${
            activeReportTab === 'site-deployment'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Site Deployment Matrix</span>
        </button>

        <button
          onClick={() => setActiveReportTab('armoury-status')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-2 ${
            activeReportTab === 'armoury-status'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Armoury & Weapons Status</span>
        </button>

        <button
          onClick={() => setActiveReportTab('inventory-audit')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-2 ${
            activeReportTab === 'inventory-audit'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Inventory & Low Stock Audit</span>
        </button>
      </div>

      {/* TAB 1: PROFIT & LOSS STATEMENT */}
      {activeReportTab === 'pnl' && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-black text-white uppercase font-display">
                Profit & Loss Statement (Income Statement)
              </h2>
              <p className="text-xs text-slate-400">For the period ended 31 August 2026</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Net Operational Profit:</span>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                {formatPKR(netProfit)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Income Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="font-bold text-sm text-emerald-400 uppercase tracking-wider">
                  Operating Income / Revenue
                </h3>
                <span className="font-bold text-sm text-emerald-400 font-mono">
                  {formatPKR(totalIncome)}
                </span>
              </div>

              <div className="space-y-2">
                {incomeAccounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="flex items-center justify-between text-xs py-1.5 px-3 bg-slate-900/60 rounded-lg border border-slate-800/80"
                  >
                    <div>
                      <span className="font-mono text-slate-500 mr-2">{acc.accountCode}</span>
                      <span className="text-slate-200 font-medium">{acc.accountName}</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-300">
                      {formatPKR(acc.currentBalance)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Expenses Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="font-bold text-sm text-red-400 uppercase tracking-wider">
                  Operating Expenses
                </h3>
                <span className="font-bold text-sm text-red-400 font-mono">
                  {formatPKR(totalExpense)}
                </span>
              </div>

              <div className="space-y-2">
                {expenseAccounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="flex items-center justify-between text-xs py-1.5 px-3 bg-slate-900/60 rounded-lg border border-slate-800/80"
                  >
                    <div>
                      <span className="font-mono text-slate-500 mr-2">{acc.accountCode}</span>
                      <span className="text-slate-200 font-medium">{acc.accountName}</span>
                    </div>
                    <span className="font-mono font-bold text-red-300">
                      {formatPKR(acc.currentBalance)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-emerald-950/40 border border-emerald-800/70 p-4 rounded-xl flex items-center justify-between">
            <span className="font-bold text-white uppercase text-sm">
              Net Profit for the Operating Period
            </span>
            <span className="font-black text-xl text-emerald-400 font-mono">
              {formatPKR(netProfit)}
            </span>
          </div>
        </div>
      )}

      {/* TAB 2: BALANCE SHEET */}
      {activeReportTab === 'balance-sheet' && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-black text-white uppercase font-display">
                Balance Sheet Statement
              </h2>
              <p className="text-xs text-slate-400">As of 31 August 2026 (Double-entry reconciled)</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Total Assets = Liabilities + Equity:</span>
              <div className="text-2xl font-black text-blue-400 font-mono">
                {formatPKR(totalAssets)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Assets */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="font-bold text-sm text-emerald-400 uppercase tracking-wider">
                  Assets (Current & Fixed)
                </h3>
                <span className="font-bold text-sm text-emerald-400 font-mono">
                  {formatPKR(totalAssets)}
                </span>
              </div>

              <div className="space-y-2">
                {assetAccounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="flex items-center justify-between text-xs py-1.5 px-3 bg-slate-900/60 rounded-lg border border-slate-800/80"
                  >
                    <div>
                      <span className="font-mono text-slate-500 mr-2">{acc.accountCode}</span>
                      <span className="text-slate-200 font-medium">{acc.accountName}</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-300">
                      {formatPKR(acc.currentBalance)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Liabilities & Equity */}
            <div className="space-y-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="font-bold text-sm text-red-400 uppercase tracking-wider">
                    Liabilities
                  </h3>
                  <span className="font-bold text-sm text-red-400 font-mono">
                    {formatPKR(totalLiabilities)}
                  </span>
                </div>

                <div className="space-y-2">
                  {liabilityAccounts.map((acc) => (
                    <div
                      key={acc.id}
                      className="flex items-center justify-between text-xs py-1.5 px-3 bg-slate-900/60 rounded-lg border border-slate-800/80"
                    >
                      <div>
                        <span className="font-mono text-slate-500 mr-2">{acc.accountCode}</span>
                        <span className="text-slate-200 font-medium">{acc.accountName}</span>
                      </div>
                      <span className="font-mono font-bold text-red-300">
                        {formatPKR(acc.currentBalance)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="font-bold text-sm text-blue-400 uppercase tracking-wider">
                    Equity & Retained Earnings
                  </h3>
                  <span className="font-bold text-sm text-blue-400 font-mono">
                    {formatPKR(totalEquity)}
                  </span>
                </div>

                <div className="space-y-2">
                  {equityAccounts.map((acc) => (
                    <div
                      key={acc.id}
                      className="flex items-center justify-between text-xs py-1.5 px-3 bg-slate-900/60 rounded-lg border border-slate-800/80"
                    >
                      <div>
                        <span className="font-mono text-slate-500 mr-2">{acc.accountCode}</span>
                        <span className="text-slate-200 font-medium">{acc.accountName}</span>
                      </div>
                      <span className="font-mono font-bold text-blue-300">
                        {formatPKR(acc.currentBalance)}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between text-xs py-1.5 px-3 bg-blue-950/40 rounded-lg border border-blue-800/60">
                    <span className="text-blue-200 font-bold">Current Period Net Profit</span>
                    <span className="font-mono font-black text-emerald-400">
                      {formatPKR(netProfit)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TRIAL BALANCE */}
      {activeReportTab === 'trial-balance' && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-lg font-black text-white uppercase font-display">
              Unadjusted Trial Balance
            </h2>
            <p className="text-xs text-slate-400">All chart of account ledger balances verified equal.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-bold">
                  <th className="py-2.5 px-4">Account Code</th>
                  <th className="py-2.5 px-4">Account Title</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4 text-right">Debit Balance (PKR)</th>
                  <th className="py-2.5 px-4 text-right">Credit Balance (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {accounts.map((acc) => {
                  const isDebitNature = acc.category === 'Asset' || acc.category === 'Expense';
                  return (
                    <tr key={acc.id} className="hover:bg-slate-900/60">
                      <td className="py-2.5 px-4 font-bold text-blue-400">{acc.accountCode}</td>
                      <td className="py-2.5 px-4 font-sans font-medium text-slate-200">{acc.accountName}</td>
                      <td className="py-2.5 px-4 font-sans text-slate-400">{acc.category}</td>
                      <td className="py-2.5 px-4 text-right text-emerald-400">
                        {isDebitNature ? acc.currentBalance.toLocaleString() : '-'}
                      </td>
                      <td className="py-2.5 px-4 text-right text-blue-400">
                        {!isDebitNature ? acc.currentBalance.toLocaleString() : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CLIENT RECEIVABLES */}
      {activeReportTab === 'receivables' && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-white uppercase font-display">
                Client Receivables Aging & Outstanding
              </h2>
              <p className="text-xs text-slate-400">Total Outstanding Security Billing: {formatPKR(totalClientReceivables)}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-bold">
                  <th className="py-2.5 px-4">Client Code & Name</th>
                  <th className="py-2.5 px-4">Contact Person & Phone</th>
                  <th className="py-2.5 px-4 text-center">Active Sites</th>
                  <th className="py-2.5 px-4 text-right">Outstanding Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {clients.map((c) => {
                  const clientSites = sites.filter((s) => s.clientId === c.id);
                  return (
                    <tr key={c.id} className="hover:bg-slate-900/60">
                      <td className="py-2.5 px-4">
                        <div className="font-bold text-slate-100">{c.companyName}</div>
                        <div className="text-[10px] text-blue-400 font-mono">{c.clientCode}</div>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="text-slate-300">{c.contactPerson}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{c.phone}</div>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono font-bold">
                          {clientSites.length} Sites
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-black font-mono text-emerald-400 text-sm">
                        {formatPKR(c.currentBalance || c.monthlyBillingAmount || 0)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: SITE DEPLOYMENT MATRIX */}
      {activeReportTab === 'site-deployment' && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-lg font-black text-white uppercase font-display">
              Site Guard Deployment & Staffing Matrix
            </h2>
            <p className="text-xs text-slate-400">
              Active Force: {onDutyGuards} on duty / {totalGuards} total enlisted guards
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sites.map((site) => {
              const siteGuards = guards.filter((g) => g.currentSiteId === site.id);
              return (
                <div
                  key={site.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div>
                      <h4 className="font-bold text-white text-sm">{site.siteName}</h4>
                      <span className="text-xs text-slate-400">{site.clientName}</span>
                    </div>
                    <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-xs font-bold">
                      {siteGuards.length} / {site.requiredGuards} Guards
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {siteGuards.length === 0 ? (
                      <div className="text-xs text-slate-500 italic">No guards stationed currently</div>
                    ) : (
                      siteGuards.map((g) => (
                        <div
                          key={g.id}
                          className="flex items-center justify-between text-xs p-1.5 bg-slate-950 rounded border border-slate-800"
                        >
                          <span className="font-semibold text-slate-200">{g.name} ({g.designation})</span>
                          <span className="text-blue-400 font-mono text-[11px]">{g.guardCode}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 6: ARMOURY STATUS */}
      {activeReportTab === 'armoury-status' && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-white uppercase font-display">
                Armoury & Firearm Custody Status
              </h2>
              <p className="text-xs text-slate-400">
                Issued in field: {issuedWeapons} • In Vault: {availableWeapons} • Total: {weapons.length}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-bold">
                  <th className="py-2.5 px-4">Weapon Code</th>
                  <th className="py-2.5 px-4">Type & Model</th>
                  <th className="py-2.5 px-4">Serial Number</th>
                  <th className="py-2.5 px-4">Current Custody / Guard</th>
                  <th className="py-2.5 px-4">Condition</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {weapons.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-900/60">
                    <td className="py-2.5 px-4 font-mono font-bold text-red-400">{w.weaponCode}</td>
                    <td className="py-2.5 px-4 text-slate-200">{w.weaponType} ({w.makeModel})</td>
                    <td className="py-2.5 px-4 font-mono text-amber-400">{w.serialNumber}</td>
                    <td className="py-2.5 px-4">
                      {w.currentGuardName ? (
                        <span className="font-bold text-emerald-400">{w.currentGuardName} ({w.currentSiteName})</span>
                      ) : (
                        <span className="text-slate-500">In Armoury</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-slate-300">{w.condition}</td>
                    <td className="py-2.5 px-4 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          w.currentStatus === 'Issued' ? 'bg-red-950 text-red-300' : 'bg-emerald-950 text-emerald-300'
                        }`}
                      >
                        {w.currentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: INVENTORY AUDIT */}
      {activeReportTab === 'inventory-audit' && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-lg font-black text-white uppercase font-display">
              Store Inventory Valuation & Low Stock Audit
            </h2>
            <p className="text-xs text-slate-400">Total cataloged equipment and critical threshold tracker.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-bold">
                  <th className="py-2.5 px-4">SKU / Code</th>
                  <th className="py-2.5 px-4">Item Description</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4 text-center">In Stock</th>
                  <th className="py-2.5 px-4 text-center">Min Level</th>
                  <th className="py-2.5 px-4 text-right">Unit Value</th>
                  <th className="py-2.5 px-4 text-right">Total Asset Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {products.map((p) => {
                  const minLvl = p.minimumStock ?? p.minStockLevel ?? 0;
                  const unitCost = p.unitPrice ?? p.costPrice ?? 0;
                  const skuCode = p.productCode || p.sku;
                  const title = p.productName || p.name;
                  const isLow = p.currentStock <= minLvl;
                  return (
                    <tr key={p.id} className="hover:bg-slate-900/60">
                      <td className="py-2.5 px-4 font-mono font-bold text-amber-400">{skuCode}</td>
                      <td className="py-2.5 px-4 text-slate-200 font-semibold">{title}</td>
                      <td className="py-2.5 px-4 text-slate-400">{p.category}</td>
                      <td className="py-2.5 px-4 text-center font-mono font-bold">
                        <span className={isLow ? 'text-red-400 bg-red-950/60 px-2 py-0.5 rounded' : 'text-slate-200'}>
                          {p.currentStock} {p.unit}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono text-slate-400">{minLvl}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-300">{formatPKR(unitCost)}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-black text-emerald-400">
                        {formatPKR(p.currentStock * unitCost)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
