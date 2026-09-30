import {
  AlertTriangle,
  Award,
  BookOpen,
  Building,
  CheckCircle,
  Clock,
  DollarSign,
  FileSpreadsheet,
  FileText,
  PieChart,
  Printer,
  Scale,
  Search,
  Shield,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatPKR } from '../../utils/formatters';
import { BalanceType } from '../../types';

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
    openingBalances,
    openingBatches,
    currentFiscalYear,
  } = useApp();

  const [activeReportTab, setActiveReportTab] = useState<
    'pnl' | 'balance-sheet' | 'trial-balance' | 'ledger' | 'receivables' | 'site-deployment' | 'armoury-status' | 'inventory-audit'
  >('pnl');

  const [tbViewMode, setTbViewMode] = useState<'extended' | 'summary'>('extended');
  const [selectedLedgerAccountId, setSelectedLedgerAccountId] = useState<string>(accounts[0]?.id || '');
  const [ledgerSearchTerm, setLedgerSearchTerm] = useState<string>('');

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
  const totalClientReceivables = clients.reduce((sum, c) => sum + (c.currentBalance !== undefined ? (Number(c.currentBalance) || 0) : (c.monthlyBillingAmount || 0)), 0);

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
          <Scale className="w-4 h-4" />
          <span>Trial Balance (میزان پڑتال)</span>
        </button>

        <button
          onClick={() => setActiveReportTab('ledger')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-2 ${
            activeReportTab === 'ledger'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>General Ledger (کھاتہ)</span>
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
      {activeReportTab === 'trial-balance' && (() => {
        const currentBatch = openingBatches.find((b) => b.fiscalYear === currentFiscalYear);
        const batchStatus = currentBatch ? currentBatch.status : 'Draft';

        const trialBalanceRows = accounts.map((acc) => {
          const obRecord = openingBalances.find(
            (b) => b.accountId === acc.id && b.fiscalYear === currentFiscalYear
          );
          const obAmount = obRecord !== undefined ? (Number(obRecord.amount) || 0) : (Number(acc.openingBalance) || 0);
          const obType: BalanceType = obRecord
            ? obRecord.balanceType
            : acc.openingBalanceType ||
              (acc.category === 'Asset' || acc.category === 'Expense' ? 'Debit' : 'Credit');

          const openingDr = obType === 'Debit' ? obAmount : 0;
          const openingCr = obType === 'Credit' ? obAmount : 0;

          let periodDr = 0;
          let periodCr = 0;
          vouchers.forEach((v) => {
            if (
              v.voucherNo === `JV-OB-${currentFiscalYear}` ||
              v.voucherNo === 'OB-0001' ||
              v.referenceNo?.startsWith('OB-') ||
              v.id?.startsWith('VOUCH-OB-') ||
              v.narration?.toLowerCase().includes('opening balance')
            ) return;
            v.entries.forEach((e) => {
              if (e.accountId === acc.id) {
                periodDr += Number(e.debit) || 0;
                periodCr += Number(e.credit) || 0;
              }
            });
          });

          const totalDr = openingDr + periodDr;
          const totalCr = openingCr + periodCr;

          let closingDr = 0;
          let closingCr = 0;
          if (totalDr >= totalCr) {
            closingDr = totalDr - totalCr;
          } else {
            closingCr = totalCr - totalDr;
          }

          return {
            account: acc,
            openingDr,
            openingCr,
            periodDr,
            periodCr,
            closingDr,
            closingCr,
            totalDr,
            totalCr,
          };
        });

        const totalOpeningDr = trialBalanceRows.reduce((sum, r) => sum + r.openingDr, 0);
        const totalOpeningCr = trialBalanceRows.reduce((sum, r) => sum + r.openingCr, 0);
        const totalPeriodDr = trialBalanceRows.reduce((sum, r) => sum + r.periodDr, 0);
        const totalPeriodCr = trialBalanceRows.reduce((sum, r) => sum + r.periodCr, 0);
        const totalClosingDr = trialBalanceRows.reduce((sum, r) => sum + r.closingDr, 0);
        const totalClosingCr = trialBalanceRows.reduce((sum, r) => sum + r.closingCr, 0);

        const isOpeningBalanced = Math.abs(totalOpeningDr - totalOpeningCr) < 0.01;
        const isPeriodBalanced = Math.abs(totalPeriodDr - totalPeriodCr) < 0.01;
        const isClosingBalanced = Math.abs(totalClosingDr - totalClosingCr) < 0.01;

        return (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            {/* Header with Batch and View Mode */}
            <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-white uppercase font-display">
                    Trial Balance (میزان پڑتال)
                  </h2>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      batchStatus === 'Locked'
                        ? 'bg-purple-950 text-purple-300 border-purple-800'
                        : batchStatus === 'Posted'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}
                  >
                    FY {currentFiscalYear} • {batchStatus}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Reconciled statement incorporating Opening Balances and Period Journal Vouchers.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTbViewMode('extended')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    tbViewMode === 'extended'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  6-Column Extended
                </button>
                <button
                  onClick={() => setTbViewMode('summary')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    tbViewMode === 'summary'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  Net Closing Summary
                </button>
              </div>
            </div>

            {/* Reconciliation KPI Strip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-bold text-slate-400 uppercase">1. Opening Balances</span>
                  <span className={`text-[10px] font-black ${isOpeningBalanced ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isOpeningBalanced ? '✓ Reconciled' : '✗ Difference'}
                  </span>
                </div>
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-emerald-400">Dr: {formatPKR(totalOpeningDr)}</span>
                  <span className="text-blue-400">Cr: {formatPKR(totalOpeningCr)}</span>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-bold text-slate-400 uppercase">2. Period Movement</span>
                  <span className={`text-[10px] font-black ${isPeriodBalanced ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isPeriodBalanced ? '✓ Reconciled' : '✗ Difference'}
                  </span>
                </div>
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-emerald-400">Dr: {formatPKR(totalPeriodDr)}</span>
                  <span className="text-blue-400">Cr: {formatPKR(totalPeriodCr)}</span>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-bold text-slate-400 uppercase">3. Closing Balances</span>
                  <span className={`text-[10px] font-black ${isClosingBalanced ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isClosingBalanced ? '✓ Balanced' : '✗ Difference'}
                  </span>
                </div>
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-emerald-400 font-bold">Dr: {formatPKR(totalClosingDr)}</span>
                  <span className="text-blue-400 font-bold">Cr: {formatPKR(totalClosingCr)}</span>
                </div>
              </div>
            </div>

            {/* Trial Balance Table */}
            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead>
                  {tbViewMode === 'extended' ? (
                    <>
                      <tr className="bg-slate-900 text-slate-300 uppercase text-[10px] font-black tracking-wider border-b border-slate-800 text-center">
                        <th colSpan={3} className="py-2 px-3 text-left border-r border-slate-800">
                          Account Information
                        </th>
                        <th colSpan={2} className="py-2 px-3 border-r border-slate-800 bg-cyan-950/40 text-cyan-300">
                          Opening Balance (ابتدائی)
                        </th>
                        <th colSpan={2} className="py-2 px-3 border-r border-slate-800 bg-slate-900/80 text-slate-300">
                          Period Transactions (گردش)
                        </th>
                        <th colSpan={2} className="py-2 px-3 bg-emerald-950/30 text-emerald-300">
                          Net Closing Balance (اختتامی)
                        </th>
                      </tr>
                      <tr className="bg-slate-900/90 text-slate-400 uppercase text-[9px] tracking-wider border-b border-slate-800 font-bold">
                        <th className="py-2 px-3">Code</th>
                        <th className="py-2 px-3">Title & Group</th>
                        <th className="py-2 px-3 border-r border-slate-800">Category</th>
                        <th className="py-2 px-3 text-right bg-cyan-950/20 text-emerald-400">Dr (PKR)</th>
                        <th className="py-2 px-3 text-right border-r border-slate-800 bg-cyan-950/20 text-blue-400">Cr (PKR)</th>
                        <th className="py-2 px-3 text-right text-emerald-400">Dr (PKR)</th>
                        <th className="py-2 px-3 text-right border-r border-slate-800 text-blue-400">Cr (PKR)</th>
                        <th className="py-2 px-3 text-right bg-emerald-950/20 text-emerald-400 font-black">Dr (PKR)</th>
                        <th className="py-2 px-3 text-right bg-emerald-950/20 text-blue-400 font-black">Cr (PKR)</th>
                      </tr>
                    </>
                  ) : (
                    <tr className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-bold">
                      <th className="py-2.5 px-4">Account Code</th>
                      <th className="py-2.5 px-4">Account Title & Group</th>
                      <th className="py-2.5 px-4">Category</th>
                      <th className="py-2.5 px-4 text-right">Opening Balance</th>
                      <th className="py-2.5 px-4 text-right text-emerald-400">Closing Debit (PKR)</th>
                      <th className="py-2.5 px-4 text-right text-blue-400">Closing Credit (PKR)</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {trialBalanceRows.map((r) => {
                    return tbViewMode === 'extended' ? (
                      <tr key={r.account.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="py-2 px-3 font-bold text-blue-400">{r.account.accountCode}</td>
                        <td className="py-2 px-3 font-sans font-medium text-slate-200">
                          <div>{r.account.accountName}</div>
                          <div className="text-[10px] text-slate-500 font-sans">{r.account.subcategory}</div>
                        </td>
                        <td className="py-2 px-3 font-sans text-slate-400 border-r border-slate-800">
                          <span className="text-[9px] px-1.5 py-0.2 bg-slate-900 border border-slate-700/60 rounded">
                            {r.account.category}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right bg-cyan-950/10 text-emerald-300">
                          {r.openingDr > 0 ? r.openingDr.toLocaleString() : '-'}
                        </td>
                        <td className="py-2 px-3 text-right border-r border-slate-800 bg-cyan-950/10 text-blue-300">
                          {r.openingCr > 0 ? r.openingCr.toLocaleString() : '-'}
                        </td>
                        <td className="py-2 px-3 text-right text-emerald-300">
                          {r.periodDr > 0 ? r.periodDr.toLocaleString() : '-'}
                        </td>
                        <td className="py-2 px-3 text-right border-r border-slate-800 text-blue-300">
                          {r.periodCr > 0 ? r.periodCr.toLocaleString() : '-'}
                        </td>
                        <td className="py-2 px-3 text-right bg-emerald-950/20 font-bold text-emerald-400">
                          {r.closingDr > 0 ? r.closingDr.toLocaleString() : '-'}
                        </td>
                        <td className="py-2 px-3 text-right bg-emerald-950/20 font-bold text-blue-400">
                          {r.closingCr > 0 ? r.closingCr.toLocaleString() : '-'}
                        </td>
                      </tr>
                    ) : (
                      <tr key={r.account.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="py-2.5 px-4 font-bold text-blue-400">{r.account.accountCode}</td>
                        <td className="py-2.5 px-4 font-sans font-medium text-slate-200">
                          <div>{r.account.accountName}</div>
                          <div className="text-[10px] text-slate-500 font-sans">{r.account.subcategory}</div>
                        </td>
                        <td className="py-2.5 px-4 font-sans text-slate-400">
                          <span className="text-[10px] px-2 py-0.5 bg-slate-900 border border-slate-800 rounded">
                            {r.account.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          {r.openingDr > 0 ? (
                            <span className="text-emerald-400 font-bold">{r.openingDr.toLocaleString()} Dr</span>
                          ) : r.openingCr > 0 ? (
                            <span className="text-blue-400 font-bold">{r.openingCr.toLocaleString()} Cr</span>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-right font-bold text-emerald-400">
                          {r.closingDr > 0 ? r.closingDr.toLocaleString() : '-'}
                        </td>
                        <td className="py-2.5 px-4 text-right font-bold text-blue-400">
                          {r.closingCr > 0 ? r.closingCr.toLocaleString() : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  {tbViewMode === 'extended' ? (
                    <tr className="bg-slate-900/90 font-mono font-bold text-xs border-t-2 border-slate-700">
                      <td colSpan={3} className="py-3 px-3 uppercase text-slate-300 font-sans text-right border-r border-slate-800">
                        Total Double-Entry Balances:
                      </td>
                      <td className="py-3 px-3 text-right text-emerald-400 bg-cyan-950/30 font-black">
                        {formatPKR(totalOpeningDr)}
                      </td>
                      <td className="py-3 px-3 text-right text-blue-400 border-r border-slate-800 bg-cyan-950/30 font-black">
                        {formatPKR(totalOpeningCr)}
                      </td>
                      <td className="py-3 px-3 text-right text-emerald-400 font-black">
                        {formatPKR(totalPeriodDr)}
                      </td>
                      <td className="py-3 px-3 text-right text-blue-400 border-r border-slate-800 font-black">
                        {formatPKR(totalPeriodCr)}
                      </td>
                      <td className="py-3 px-3 text-right text-emerald-400 bg-emerald-950/40 font-black text-sm">
                        {formatPKR(totalClosingDr)}
                      </td>
                      <td className="py-3 px-3 text-right text-blue-400 bg-emerald-950/40 font-black text-sm">
                        {formatPKR(totalClosingCr)}
                      </td>
                    </tr>
                  ) : (
                    <tr className="bg-slate-900/90 font-mono font-bold text-xs border-t-2 border-slate-700">
                      <td colSpan={4} className="py-3 px-4 uppercase text-slate-300 font-sans text-right">
                        Total Reconciled Trial Balance:
                      </td>
                      <td className="py-3 px-4 text-right text-emerald-400 font-black text-sm">
                        {formatPKR(totalClosingDr)}
                      </td>
                      <td className="py-3 px-4 text-right text-blue-400 font-black text-sm">
                        {formatPKR(totalClosingCr)}
                      </td>
                    </tr>
                  )}
                </tfoot>
              </table>
            </div>
          </div>
        );
      })()}

      {/* TAB: GENERAL ACCOUNT LEDGER */}
      {activeReportTab === 'ledger' && (() => {
        const selectedLedgerAccount =
          accounts.find((a) => a.id === selectedLedgerAccountId) || accounts[0];

        const currentBatch = openingBatches.find((b) => b.fiscalYear === currentFiscalYear);
        const batchStatus = currentBatch ? currentBatch.status : 'Draft';

        const obRecord = openingBalances.find(
          (b) => b.accountId === selectedLedgerAccount?.id && b.fiscalYear === currentFiscalYear
        );
        const obAmount = obRecord !== undefined
          ? (Number(obRecord.amount) || 0)
          : (Number(selectedLedgerAccount?.openingBalance) || 0);
        const obType: BalanceType = obRecord
          ? obRecord.balanceType
          : selectedLedgerAccount?.openingBalanceType ||
            (selectedLedgerAccount?.category === 'Asset' || selectedLedgerAccount?.category === 'Expense' ? 'Debit' : 'Credit');

        const isNormalDebit =
          selectedLedgerAccount?.category === 'Asset' || selectedLedgerAccount?.category === 'Expense';

        let runningLedgerBal = isNormalDebit
          ? obType === 'Debit' ? obAmount : -obAmount
          : obType === 'Credit' ? obAmount : -obAmount;

        const ledgerTransactions: Array<{
          id: string;
          date: string;
          voucherNo: string;
          narration: string;
          debit: number;
          credit: number;
          balance: number;
          isOpening?: boolean;
        }> = [];

        // Row 1: Opening Balance
        ledgerTransactions.push({
          id: 'OB-ROW',
          date: obRecord?.openingDate || `${currentFiscalYear.split('-')[0]}-07-01`,
          voucherNo: obRecord?.reference || `OB-${currentFiscalYear}`,
          narration: `Opening Balance (ابتدائی بیلنس) - FY ${currentFiscalYear} [Batch: ${batchStatus}]`,
          debit: obType === 'Debit' ? obAmount : 0,
          credit: obType === 'Credit' ? obAmount : 0,
          balance: runningLedgerBal,
          isOpening: true,
        });

        // Transactions from vouchers (excluding auto OB voucher)
        vouchers.forEach((v) => {
          if (
            v.voucherNo === `JV-OB-${currentFiscalYear}` ||
            v.voucherNo === 'OB-0001' ||
            v.referenceNo?.startsWith('OB-') ||
            v.id?.startsWith('VOUCH-OB-') ||
            v.narration?.toLowerCase().includes('opening balance')
          ) return;
          v.entries.forEach((e, idx) => {
            if (e.accountId === selectedLedgerAccount?.id) {
              const d = Number(e.debit) || 0;
              const c = Number(e.credit) || 0;
              if (isNormalDebit) {
                runningLedgerBal = runningLedgerBal + d - c;
              } else {
                runningLedgerBal = runningLedgerBal + c - d;
              }
              ledgerTransactions.push({
                id: `${v.id}-${idx}`,
                date: v.date,
                voucherNo: v.voucherNo,
                narration: e.narration || v.narration,
                debit: d,
                credit: c,
                balance: runningLedgerBal,
              });
            }
          });
        });

        const totalDebitLedger = ledgerTransactions.reduce((sum, r) => sum + r.debit, 0);
        const totalCreditLedger = ledgerTransactions.reduce((sum, r) => sum + r.credit, 0);

        const filteredAccountsForSelect = accounts.filter(
          (a) =>
            a.accountName.toLowerCase().includes(ledgerSearchTerm.toLowerCase()) ||
            a.accountCode.includes(ledgerSearchTerm) ||
            a.subcategory.toLowerCase().includes(ledgerSearchTerm.toLowerCase())
        );

        return (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-white uppercase font-display flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  <span>General Account Ledger (کھاتہ برائے لیجر)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Full transactional ledger with Opening Balance row and live running balance calculation.
                </p>
              </div>

              {/* Account Selector */}
              <div className="flex items-center gap-2">
                <div className="relative w-72">
                  <select
                    value={selectedLedgerAccountId}
                    onChange={(e) => setSelectedLedgerAccountId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold cursor-pointer"
                  >
                    {filteredAccountsForSelect.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.accountCode} - {acc.accountName} ({acc.category})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Selected Account Summary Banner */}
            {selectedLedgerAccount && (
              <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-blue-400 font-black text-sm">
                      {selectedLedgerAccount.accountCode}
                    </span>
                    <span className="text-white font-bold text-sm">{selectedLedgerAccount.accountName}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded uppercase font-bold">
                      {selectedLedgerAccount.category} • {selectedLedgerAccount.subcategory}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                    <span>
                      Opening Balance:{' '}
                      <strong className={obType === 'Debit' ? 'text-emerald-400' : 'text-blue-400'}>
                        {formatPKR(obAmount)} ({obType})
                      </strong>
                    </span>
                    <span>•</span>
                    <span>FY: <strong>{currentFiscalYear}</strong></span>
                    <span>•</span>
                    <span>Batch: <strong>{batchStatus}</strong></span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-400">Current Ledger Balance:</span>
                  <div className="text-xl font-black text-emerald-400 font-mono">
                    {formatPKR(runningLedgerBal)}
                  </div>
                </div>
              </div>
            )}

            {/* Ledger Transactions Table */}
            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-bold">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Voucher / Ref</th>
                    <th className="py-2.5 px-3">Narration / Particulars</th>
                    <th className="py-2.5 px-3 text-right text-emerald-400">Debit (PKR)</th>
                    <th className="py-2.5 px-3 text-right text-blue-400">Credit (PKR)</th>
                    <th className="py-2.5 px-3 text-right text-white">Running Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {ledgerTransactions.map((row) => (
                    <tr
                      key={row.id}
                      className={
                        row.isOpening
                          ? 'bg-cyan-950/20 font-bold'
                          : 'hover:bg-slate-900/60 transition-colors'
                      }
                    >
                      <td className="py-2.5 px-3 text-slate-300">{row.date}</td>
                      <td className="py-2.5 px-3 text-blue-400 font-bold">
                        {row.voucherNo}
                        {row.isOpening && (
                          <span className="ml-1.5 text-[9px] px-1.5 py-0.2 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded font-sans">
                            OB
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-200">{row.narration}</td>
                      <td className="py-2.5 px-3 text-right text-emerald-400">
                        {row.debit > 0 ? row.debit.toLocaleString() : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right text-blue-400">
                        {row.credit > 0 ? row.credit.toLocaleString() : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-slate-100">
                        {formatPKR(row.balance)}
                      </td>
                    </tr>
                  ))}
                  {ledgerTransactions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 font-sans">
                        No transactions found for this account.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-900/90 font-mono font-bold text-xs border-t-2 border-slate-700">
                    <td colSpan={3} className="py-3 px-3 uppercase text-slate-300 font-sans text-right">
                      Totals / Closing Position:
                    </td>
                    <td className="py-3 px-3 text-right text-emerald-400 font-black">
                      {formatPKR(totalDebitLedger)}
                    </td>
                    <td className="py-3 px-3 text-right text-blue-400 font-black">
                      {formatPKR(totalCreditLedger)}
                    </td>
                    <td className="py-3 px-3 text-right text-emerald-400 font-black text-sm">
                      {formatPKR(runningLedgerBal)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        );
      })()}

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
                        {formatPKR(c.currentBalance !== undefined ? (Number(c.currentBalance) || 0) : (c.monthlyBillingAmount || 0))}
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
