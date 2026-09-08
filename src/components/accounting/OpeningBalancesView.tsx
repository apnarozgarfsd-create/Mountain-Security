import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  Copy,
  DollarSign,
  Download,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  History,
  Lock,
  Pencil,
  Plus,
  Printer,
  RefreshCw,
  RotateCcw,
  Scale,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Unlock,
  X,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Account, AccountCategory, BalanceType, OpeningBalance } from '../../types';
import { formatPKR } from '../../utils/formatters';

export const OpeningBalancesView: React.FC = () => {
  const {
    accounts,
    openingBalances,
    openingBalanceAudits,
    openingBatches,
    currentFiscalYear,
    setCurrentFiscalYear,
    fiscalYears,
    currentUserRole,
    saveOpeningBalance,
    clearOpeningBalance,
    postOpeningBalances,
    lockOpeningBalances,
    unlockOpeningBalances,
    carryForwardPreviousYear,
    getFiscalYearStatus,
    vouchers,
    triggerPrint,
    companySettings,
    logAudit,
  } = useApp();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [balanceFilter, setBalanceFilter] = useState<'All' | 'WithBalance' | 'ZeroBalance'>('All');
  const [activeSubTab, setActiveSubTab] = useState<'grid' | 'audit' | 'vouchers'>('grid');

  // Action / Feedback notices
  const [notice, setNotice] = useState<{ type: 'success' | 'warning' | 'error'; message: string } | null>(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAccountForEdit, setSelectedAccountForEdit] = useState<Account | null>(null);
  const [editBalanceType, setEditBalanceType] = useState<BalanceType>('Debit');
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editDate, setEditDate] = useState<string>('2026-07-01');
  const [editReference, setEditReference] = useState<string>('OB-0001');
  const [editNotes, setEditNotes] = useState<string>('');
  const [editReason, setEditReason] = useState<string>('');

  // Confirmation Modals State
  const [isPostConfirmOpen, setIsPostConfirmOpen] = useState(false);
  const [isCarryForwardConfirmOpen, setIsCarryForwardConfirmOpen] = useState(false);
  const [isLockConfirmOpen, setIsLockConfirmOpen] = useState(false);
  const [isUnlockConfirmOpen, setIsUnlockConfirmOpen] = useState(false);

  const canManage = currentUserRole === 'Super Admin' || currentUserRole === 'Accountant';
  const isSuperAdmin = currentUserRole === 'Super Admin';

  const currentBatch = openingBatches.find((b) => b.fiscalYear === currentFiscalYear);
  const batchStatus = currentBatch ? currentBatch.status : 'Draft';

  // Helper to match an account against an opening balance record
  const isAccountMatch = (acc: Account, obAccountId?: string, obAccountCode?: string) => {
    return (
      obAccountId === acc.id ||
      obAccountCode === acc.accountCode ||
      obAccountId === acc.accountCode ||
      (acc.id && obAccountId === acc.id.replace(/^ACC-/, '')) ||
      (obAccountId && `ACC-${obAccountId}` === acc.id)
    );
  };

  // Accounts combined with their opening balance for current fiscal year
  const accountsWithOB = useMemo(() => {
    return accounts.map((acc) => {
      const ob = openingBalances.find(
        (b) => b.fiscalYear === currentFiscalYear && isAccountMatch(acc, b.accountId, b.accountCode)
      );

      const amount = ob ? Number(ob.amount) || 0 : Number(acc.openingBalance) || 0;
      const balanceType: BalanceType = ob
        ? ob.balanceType
        : acc.openingBalanceType || (acc.category === 'Asset' || acc.category === 'Expense' ? 'Debit' : 'Credit');
      
      const debit = balanceType === 'Debit' ? amount : 0;
      const credit = balanceType === 'Credit' ? amount : 0;

      return {
        account: acc,
        openingBalanceRecord: ob,
        amount,
        balanceType,
        debit,
        credit,
        date: ob?.openingDate || currentBatch?.startDate || '2026-07-01',
        reference: ob?.reference || currentBatch?.voucherNo || 'OB-0001',
        notes: ob?.notes || '',
        status: ob?.status || batchStatus,
      };
    });
  }, [accounts, openingBalances, currentFiscalYear, currentBatch, batchStatus]);

  // Filtered accounts list
  const filteredAccounts = useMemo(() => {
    return accountsWithOB.filter((item) => {
      const matchesSearch =
        item.account.accountCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.account.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.account.subcategory.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === 'All' || item.account.category === selectedCategory;

      const matchesBalance =
        balanceFilter === 'All'
          ? true
          : balanceFilter === 'WithBalance'
          ? item.amount > 0
          : item.amount === 0;

      return matchesSearch && matchesCategory && matchesBalance;
    });
  }, [accountsWithOB, searchTerm, selectedCategory, balanceFilter]);

  // Totals calculation
  const totalDebit = useMemo(() => {
    return accountsWithOB.reduce((sum, item) => sum + item.debit, 0);
  }, [accountsWithOB]);

  const totalCredit = useMemo(() => {
    return accountsWithOB.reduce((sum, item) => sum + item.credit, 0);
  }, [accountsWithOB]);

  const difference = totalDebit - totalCredit;
  const isBalanced = Math.abs(difference) < 0.01;
  const configuredAccountsCount = accountsWithOB.filter((item) => item.amount > 0).length;

  // Open Edit Modal for an account
  const handleOpenEditModal = (acc: Account) => {
    if (!canManage) {
      setNotice({
        type: 'warning',
        message: 'Permission denied: Only Accountants and Super Admins can configure opening balances.',
      });
      setTimeout(() => setNotice(null), 4000);
      return;
    }

    if (batchStatus === 'Locked' && !isSuperAdmin) {
      setNotice({
        type: 'warning',
        message: `Opening balances for Fiscal Year ${currentFiscalYear} are locked. Only Super Admin can modify locked balances.`,
      });
      setTimeout(() => setNotice(null), 4000);
      return;
    }

    const existingOb = openingBalances.find(
      (ob) => ob.fiscalYear === currentFiscalYear && isAccountMatch(acc, ob.accountId, ob.accountCode)
    );

    setSelectedAccountForEdit(acc);
    setEditBalanceType(
      existingOb?.balanceType ||
        acc.openingBalanceType ||
        (acc.category === 'Asset' || acc.category === 'Expense' ? 'Debit' : 'Credit')
    );
    setEditAmount(existingOb ? existingOb.amount : acc.openingBalance || 0);
    setEditDate(existingOb?.openingDate || currentBatch?.startDate || '2026-07-01');
    setEditReference(existingOb?.reference || currentBatch?.voucherNo || 'OB-0001');
    setEditNotes(existingOb?.notes || '');
    setEditReason('');
    setIsEditModalOpen(true);
  };

  // Save Opening Balance Form Submit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccountForEdit) return;

    if (batchStatus === 'Posted' && !editReason.trim()) {
      setNotice({
        type: 'error',
        message: 'Please provide a reason for modifying a posted opening balance.',
      });
      setTimeout(() => setNotice(null), 4000);
      return;
    }

    const res = saveOpeningBalance({
      accountId: selectedAccountForEdit.id,
      fiscalYear: currentFiscalYear,
      balanceType: editBalanceType,
      amount: editAmount,
      openingDate: editDate,
      reference: editReference,
      notes: editNotes,
      reason: editReason,
    });

    if (res.success) {
      setIsEditModalOpen(false);
      setSelectedAccountForEdit(null);
      setNotice({
        type: 'success',
        message: `Opening balance for ${selectedAccountForEdit.accountCode} - ${selectedAccountForEdit.accountName} updated to PKR ${editAmount.toLocaleString()} (${editBalanceType}).`,
      });
      setTimeout(() => setNotice(null), 4000);
    } else {
      setNotice({
        type: 'error',
        message: res.error || 'Failed to save opening balance.',
      });
      setTimeout(() => setNotice(null), 5000);
    }
  };

  // Clear single opening balance
  const handleClearBalance = (acc: Account) => {
    if (!canManage) {
      setNotice({
        type: 'warning',
        message: 'Permission denied: Only Accountants and Super Admins can clear opening balances.',
      });
      setTimeout(() => setNotice(null), 4000);
      return;
    }

    if (batchStatus === 'Locked' && !isSuperAdmin) {
      setNotice({
        type: 'warning',
        message: 'Cannot clear balance: This fiscal year is locked. Super Admin override required.',
      });
      setTimeout(() => setNotice(null), 4000);
      return;
    }

    const reason = batchStatus === 'Posted' ? prompt('Enter reason for clearing this posted opening balance:') : undefined;
    if (batchStatus === 'Posted' && !reason) {
      setNotice({
        type: 'warning',
        message: 'Clear operation cancelled: A reason is required for posted opening balances.',
      });
      setTimeout(() => setNotice(null), 4000);
      return;
    }

    const res = clearOpeningBalance(acc.id, currentFiscalYear, reason || undefined);
    if (res.success) {
      setNotice({
        type: 'success',
        message: `Cleared opening balance for ${acc.accountCode} - ${acc.accountName}.`,
      });
      setTimeout(() => setNotice(null), 3000);
    } else {
      setNotice({
        type: 'error',
        message: res.error || 'Failed to clear opening balance.',
      });
      setTimeout(() => setNotice(null), 4000);
    }
  };

  // Post Opening Balances
  const handleConfirmPost = () => {
    setIsPostConfirmOpen(false);
    const res = postOpeningBalances(currentFiscalYear);
    if (res.success) {
      setNotice({
        type: 'success',
        message: `Opening Balances for Fiscal Year ${currentFiscalYear} successfully POSTED! Generated Journal Entry: ${res.voucher?.voucherNo || 'OB-0001'}.`,
      });
      setTimeout(() => setNotice(null), 5000);
    } else {
      setNotice({
        type: 'error',
        message: res.error || 'Failed to post opening balances. Total Debit must equal Total Credit.',
      });
      setTimeout(() => setNotice(null), 5000);
    }
  };

  // Lock Opening Balances
  const handleConfirmLock = () => {
    setIsLockConfirmOpen(false);
    const res = lockOpeningBalances(currentFiscalYear);
    if (res.success) {
      setNotice({
        type: 'success',
        message: `Fiscal Year ${currentFiscalYear} Opening Balances are now LOCKED. Regular modifications are disabled.`,
      });
      setTimeout(() => setNotice(null), 4000);
    } else {
      setNotice({
        type: 'error',
        message: res.error || 'Failed to lock opening balances.',
      });
      setTimeout(() => setNotice(null), 4000);
    }
  };

  // Unlock Opening Balances
  const handleConfirmUnlock = () => {
    setIsUnlockConfirmOpen(false);
    const res = unlockOpeningBalances(currentFiscalYear);
    if (res.success) {
      setNotice({
        type: 'success',
        message: `Super Admin successfully UNLOCKED opening balances for Fiscal Year ${currentFiscalYear}.`,
      });
      setTimeout(() => setNotice(null), 4000);
    } else {
      setNotice({
        type: 'error',
        message: res.error || 'Failed to unlock opening balances.',
      });
      setTimeout(() => setNotice(null), 4000);
    }
  };

  // Carry Forward closing balances
  const handleConfirmCarryForward = () => {
    setIsCarryForwardConfirmOpen(false);
    const res = carryForwardPreviousYear(currentFiscalYear);
    if (res.success) {
      setNotice({
        type: 'success',
        message: `Successfully carried forward closing balances for ${res.count || 0} accounts into Fiscal Year ${currentFiscalYear} as Draft opening balances.`,
      });
      setTimeout(() => setNotice(null), 5000);
    } else {
      setNotice({
        type: 'error',
        message: res.error || 'Failed to carry forward previous year balances.',
      });
      setTimeout(() => setNotice(null), 5000);
    }
  };

  // Print Statement
  const handlePrintStatement = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Breadcrumb & Fiscal Year Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-950/80 border border-blue-800 rounded-xl text-blue-400">
              <Scale className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black font-display uppercase tracking-tight text-white">
                  Fiscal Year Opening Balances
                </h1>
                <span className="text-xs text-slate-400 font-urdu">(ابتدائی مالیاتی بیلنس)</span>
              </div>
              <p className="text-xs text-slate-400">
                Double-entry opening balances, fiscal year transitions, balance validation and automated journal generation.
              </p>
            </div>
          </div>
        </div>

        {/* Fiscal Year & Status Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-slate-300">Fiscal Year:</span>
            <select
              value={currentFiscalYear}
              onChange={(e) => setCurrentFiscalYear(e.target.value)}
              className="bg-transparent text-xs font-bold font-mono text-white focus:outline-hidden cursor-pointer"
            >
              {fiscalYears.map((fy) => (
                <option key={fy} value={fy} className="bg-slate-900 text-white">
                  {fy} {fy === '2026-27' ? '(Active)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Batch Status Badge */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
              batchStatus === 'Locked'
                ? 'bg-purple-950/80 border-purple-800 text-purple-200'
                : batchStatus === 'Posted'
                ? 'bg-emerald-950/80 border-emerald-800 text-emerald-200'
                : 'bg-amber-950/80 border-amber-800 text-amber-200'
            }`}
          >
            {batchStatus === 'Locked' ? (
              <>
                <Lock className="w-3.5 h-3.5 text-purple-400" />
                <span>Locked (مقفل)</span>
              </>
            ) : batchStatus === 'Posted' ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Posted (پوسٹ شدہ)</span>
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Draft (مسودہ)</span>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <button
            onClick={handlePrintStatement}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors cursor-pointer"
            title="Print Opening Balance Statement"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Action Notice Alert */}
      {notice && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-bold animate-in fade-in duration-200 ${
            notice.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-200'
              : notice.type === 'warning'
              ? 'bg-amber-950/80 border-amber-800 text-amber-200'
              : 'bg-red-950/80 border-red-800 text-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : notice.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{notice.message}</span>
          </div>
          <button onClick={() => setNotice(null)} className="p-1 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Summary KPI Cards (Math & Validation) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Opening Debit */}
        <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Opening Debit (Dr)</span>
            <span className="p-1.5 bg-emerald-950/60 border border-emerald-800/60 rounded-lg text-emerald-400">
              <Plus className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="my-2">
            <span className="text-2xl font-black font-mono text-emerald-400">
              {formatPKR(totalDebit)}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Accounts with Debit:</span>
            <span className="font-mono font-bold text-slate-200">
              {accountsWithOB.filter((i) => i.debit > 0).length}
            </span>
          </div>
        </div>

        {/* Total Opening Credit */}
        <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Opening Credit (Cr)</span>
            <span className="p-1.5 bg-blue-950/60 border border-blue-800/60 rounded-lg text-blue-400">
              <DollarSign className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="my-2">
            <span className="text-2xl font-black font-mono text-blue-400">
              {formatPKR(totalCredit)}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Accounts with Credit:</span>
            <span className="font-mono font-bold text-slate-200">
              {accountsWithOB.filter((i) => i.credit > 0).length}
            </span>
          </div>
        </div>

        {/* Double-Entry Trial Balance Check */}
        <div
          className={`border rounded-2xl p-4 shadow-lg flex flex-col justify-between ${
            isBalanced
              ? 'bg-emerald-950/30 border-emerald-800/80'
              : 'bg-red-950/30 border-red-800/80 animate-pulse'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className={isBalanced ? 'text-emerald-300' : 'text-red-300'}>
              Double-Entry Balance Check
            </span>
            <span
              className={`p-1.5 rounded-lg border ${
                isBalanced
                  ? 'bg-emerald-900/60 border-emerald-700 text-emerald-300'
                  : 'bg-red-900/60 border-red-700 text-red-300'
              }`}
            >
              {isBalanced ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            </span>
          </div>
          <div className="my-2">
            <span
              className={`text-2xl font-black font-mono ${
                isBalanced ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {isBalanced ? 'PKR 0.00' : formatPKR(Math.abs(difference))}
            </span>
          </div>
          <div className="text-[11px] font-bold">
            {isBalanced ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Perfect Balance: Total Dr = Total Cr
              </span>
            ) : (
              <span className="text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {difference > 0 ? 'Debit exceeds Credit' : 'Credit exceeds Debit'}
              </span>
            )}
          </div>
        </div>

        {/* Batch Status & Operational Info */}
        <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Configured Accounts</span>
            <span className="p-1.5 bg-purple-950/60 border border-purple-800/60 rounded-lg text-purple-400">
              <FileSpreadsheet className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="my-2">
            <span className="text-2xl font-black font-mono text-purple-400">
              {configuredAccountsCount}{' '}
              <span className="text-xs text-slate-500 font-normal">/ {accounts.length} Accounts</span>
            </span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Linked Voucher:</span>
            <span className="font-mono font-bold text-blue-400">
              {currentBatch?.voucherNo || (batchStatus === 'Posted' ? 'OB-0001' : 'None (Draft)')}
            </span>
          </div>
        </div>
      </div>

      {/* Control Buttons & Lifecycle Management Bar */}
      <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex flex-wrap items-center gap-2">
          {/* Sub-Tabs: Grid vs Audit Logs vs Voucher Link */}
          <button
            onClick={() => setActiveSubTab('grid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'grid'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Accounts Table ({filteredAccounts.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('audit')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'audit'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Trail ({openingBalanceAudits.length})</span>
          </button>
        </div>

        {/* Action Pipeline: Carry Forward, Post, Lock/Unlock */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Carry Forward Previous Year */}
          {canManage && batchStatus !== 'Locked' && (
            <button
              onClick={() => setIsCarryForwardConfirmOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              title="Carry forward closing balances from previous year into this fiscal year as draft opening balances"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Carry Forward</span>
            </button>
          )}

          {/* Post Opening Balances Button */}
          {canManage && batchStatus !== 'Locked' && (
            <button
              onClick={() => {
                if (!isBalanced) {
                  setNotice({
                    type: 'error',
                    message: 'Cannot post: Total Debit must equal Total Credit! Please adjust opening balances.',
                  });
                  setTimeout(() => setNotice(null), 4000);
                  return;
                }
                setIsPostConfirmOpen(true);
              }}
              disabled={!isBalanced || configuredAccountsCount === 0}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                isBalanced && configuredAccountsCount > 0
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>{batchStatus === 'Posted' ? 'Update & Repost Voucher' : 'Post Opening Balances'}</span>
            </button>
          )}

          {/* Lock Opening Balances Button */}
          {canManage && batchStatus === 'Posted' && (
            <button
              onClick={() => setIsLockConfirmOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-900/80 hover:bg-purple-800 text-purple-200 border border-purple-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              title="Lock opening balances to prevent accidental edits by staff"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock Balances</span>
            </button>
          )}

          {/* Unlock Opening Balances Button (Super Admin only) */}
          {batchStatus === 'Locked' && (
            <button
              onClick={() => {
                if (!isSuperAdmin) {
                  setNotice({
                    type: 'warning',
                    message: 'Super Admin authorization required to unlock locked fiscal year balances.',
                  });
                  setTimeout(() => setNotice(null), 4000);
                  return;
                }
                setIsUnlockConfirmOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-md"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Unlock (Super Admin)</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW: ACCOUNTS TABLE */}
      {activeSubTab === 'grid' && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Table Filters Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-900/40 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search account code, title or group..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500 font-medium"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Category Filter */}
              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-2.5 py-1.5 rounded-xl text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-400 font-semibold">Category:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent text-xs font-bold text-white focus:outline-hidden cursor-pointer"
                >
                  <option value="All" className="bg-slate-900">All Categories</option>
                  <option value="Asset" className="bg-slate-900">Assets (اثاثہ جات)</option>
                  <option value="Liability" className="bg-slate-900">Liabilities (واجبات)</option>
                  <option value="Equity" className="bg-slate-900">Equity (سرمایہ)</option>
                  <option value="Income" className="bg-slate-900">Income (آمدن)</option>
                  <option value="Expense" className="bg-slate-900">Expense (اخراجات)</option>
                </select>
              </div>

              {/* Balance Filter */}
              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-2.5 py-1.5 rounded-xl text-xs">
                <span className="text-slate-400 font-semibold">Show:</span>
                <select
                  value={balanceFilter}
                  onChange={(e) => setBalanceFilter(e.target.value as any)}
                  className="bg-transparent text-xs font-bold text-white focus:outline-hidden cursor-pointer"
                >
                  <option value="All" className="bg-slate-900">All Accounts</option>
                  <option value="WithBalance" className="bg-slate-900">Configured Only (&gt; 0)</option>
                  <option value="ZeroBalance" className="bg-slate-900">Zero Balance (0)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-bold">
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Account Title & Group</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3 text-center">Nature / Type</th>
                  <th className="py-3 px-4 text-right">Opening Debit (Dr)</th>
                  <th className="py-3 px-4 text-right">Opening Credit (Cr)</th>
                  <th className="py-3 px-4 text-right">Current Live Balance</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredAccounts.map((item) => {
                  const hasOpening = item.amount > 0;
                  return (
                    <tr
                      key={item.account.id}
                      className="hover:bg-slate-900/60 transition-colors group"
                    >
                      {/* Code */}
                      <td className="py-3 px-4 font-mono font-bold text-blue-400 whitespace-nowrap">
                        {item.account.accountCode}
                      </td>

                      {/* Account Title & Subcategory */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-100 flex items-center gap-1.5">
                          <span>{item.account.accountName}</span>
                          {item.account.isSystem && (
                            <span className="text-[9px] px-1 py-0.2 bg-slate-800 text-slate-400 rounded">
                              Sys
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">{item.account.subcategory}</div>
                      </td>

                      {/* Category Badge */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            item.account.category === 'Asset'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                              : item.account.category === 'Liability'
                              ? 'bg-red-950 text-red-300 border border-red-800/60'
                              : item.account.category === 'Equity'
                              ? 'bg-blue-950 text-blue-300 border border-blue-800/60'
                              : item.account.category === 'Income'
                              ? 'bg-purple-950 text-purple-300 border border-purple-800/60'
                              : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                          }`}
                        >
                          {item.account.category}
                        </span>
                      </td>

                      {/* Type Badge: Dr vs Cr */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span
                          className={`text-[10px] font-mono font-black px-2 py-0.5 rounded ${
                            item.balanceType === 'Debit'
                              ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/50'
                              : 'bg-blue-950/70 text-blue-400 border border-blue-800/50'
                          }`}
                        >
                          {item.balanceType === 'Debit' ? 'Debit (Dr)' : 'Credit (Cr)'}
                        </span>
                      </td>

                      {/* Debit Column */}
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        {item.debit > 0 ? (
                          <span className="text-emerald-400">{item.debit.toLocaleString()}</span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>

                      {/* Credit Column */}
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        {item.credit > 0 ? (
                          <span className="text-blue-400">{item.credit.toLocaleString()}</span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>

                      {/* Current Balance */}
                      <td className="py-3 px-4 text-right font-mono font-black text-slate-200">
                        {formatPKR(item.account.currentBalance)}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                            item.status === 'Locked'
                              ? 'bg-purple-950 text-purple-300 border border-purple-800'
                              : item.status === 'Posted'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Opening Balance Button */}
                          <button
                            onClick={() => handleOpenEditModal(item.account)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-950 hover:bg-blue-900 text-blue-300 hover:text-white border border-blue-800/80 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            title="Edit opening balance for this account"
                          >
                            <Pencil className="w-3 h-3" />
                            <span>Edit</span>
                          </button>

                          {/* Clear Balance Button */}
                          {hasOpening && canManage && (
                            <button
                              onClick={() => handleClearBalance(item.account)}
                              disabled={batchStatus === 'Locked' && !isSuperAdmin}
                              className={`p-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                batchStatus === 'Locked' && !isSuperAdmin
                                  ? 'text-slate-600 cursor-not-allowed'
                                  : 'text-red-400 hover:text-white hover:bg-red-950/80 border border-transparent hover:border-red-800'
                              }`}
                              title="Reset opening balance to 0"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredAccounts.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500 text-xs">
                      No accounts found matching your search and filters.
                    </td>
                  </tr>
                )}
              </tbody>
              {/* Table Footer with Totals */}
              <tfoot>
                <tr className="bg-slate-900 border-t-2 border-slate-700 font-bold text-xs">
                  <td colSpan={4} className="py-3 px-4 text-right uppercase tracking-wider text-slate-300 font-display">
                    Fiscal Year {currentFiscalYear} Total Opening Balances:
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-black text-emerald-400 text-sm">
                    PKR {totalDebit.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-black text-blue-400 text-sm">
                    PKR {totalCredit.toLocaleString()}
                  </td>
                  <td colSpan={3} className="py-3 px-4 text-right">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                        isBalanced
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-red-950 text-red-300 border border-red-800'
                      }`}
                    >
                      {isBalanced ? 'Balanced (PKR 0.00 Diff)' : `Unbalanced Difference: PKR ${Math.abs(difference).toLocaleString()}`}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: AUDIT TRAIL SUBTAB */}
      {activeSubTab === 'audit' && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-blue-400" />
                <span>Opening Balance Audit Trail & Revision History</span>
              </h3>
              <p className="text-xs text-slate-400">
                Immutable audit logs documenting every opening balance creation, modification, reason and authorized user.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
              Total Logged Revisions: {openingBalanceAudits.length}
            </span>
          </div>

          <div className="divide-y divide-slate-800/80">
            {openingBalanceAudits.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No opening balance modifications logged yet.
              </div>
            ) : (
              openingBalanceAudits.map((log) => (
                <div key={log.id} className="py-3.5 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-400">{log.accountCode}</span>
                      <span className="font-bold text-white">{log.accountName}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-300 font-semibold">
                        User: {log.user}
                      </span>
                    </div>
                    <span className="text-slate-400 font-mono text-[11px]">{log.timestamp}</span>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-[11px] bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                    <span className="text-slate-400">Previous:</span>
                    <span className="text-slate-300">
                      PKR {log.oldAmount.toLocaleString()} ({log.oldType})
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-slate-400">Revised:</span>
                    <span className="font-bold text-emerald-400">
                      PKR {log.newAmount.toLocaleString()} ({log.newType})
                    </span>
                  </div>

                  {log.reason && (
                    <div className="text-slate-400 text-[11px]">
                      <strong className="text-slate-300">Reason for Change:</strong> {log.reason}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL: EDIT OPENING BALANCE */}
      {isEditModalOpen && selectedAccountForEdit && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Pencil className="w-4 h-4 text-blue-400" />
                  <span>Configure Opening Balance</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Fiscal Year: <strong className="text-blue-300 font-mono">{currentFiscalYear}</strong> •{' '}
                  Status: <strong className="text-amber-300">{batchStatus}</strong>
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Account Badge */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-mono font-bold text-blue-400 text-xs mr-2">
                  {selectedAccountForEdit.accountCode}
                </span>
                <span className="font-bold text-white text-xs">
                  {selectedAccountForEdit.accountName}
                </span>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Category: {selectedAccountForEdit.category} • Group: {selectedAccountForEdit.subcategory}
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  selectedAccountForEdit.category === 'Asset'
                    ? 'bg-emerald-950 text-emerald-300'
                    : selectedAccountForEdit.category === 'Liability'
                    ? 'bg-red-950 text-red-300'
                    : selectedAccountForEdit.category === 'Equity'
                    ? 'bg-blue-950 text-blue-300'
                    : selectedAccountForEdit.category === 'Income'
                    ? 'bg-purple-950 text-purple-300'
                    : 'bg-amber-950 text-amber-300'
                }`}
              >
                {selectedAccountForEdit.category}
              </span>
            </div>

            {/* Posted Warning Badge */}
            {batchStatus === 'Posted' && (
              <div className="p-3 bg-amber-950/40 border border-amber-800/80 rounded-xl text-amber-200 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Posted Opening Balance Warning</span>
                </div>
                <p className="text-[11px] text-amber-300/90">
                  This fiscal year is already posted in Journal Entry <strong className="font-mono text-white">OB-0001</strong>. Editing will update the journal entry and adjust account balance with a formal audit trail. A reason for change is mandatory.
                </p>
              </div>
            )}

            {/* Locked Warning Badge */}
            {batchStatus === 'Locked' && (
              <div className="p-3 bg-purple-950/40 border border-purple-800/80 rounded-xl text-purple-200 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-purple-400" />
                  <span>Locked Fiscal Year (Super Admin Override Active)</span>
                </div>
                <p className="text-[11px] text-purple-300/90">
                  You are editing a locked fiscal year under Super Admin privileges. Please ensure all modifications are double-entry balanced.
                </p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              {/* Type: Debit vs Credit */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Opening Balance Type (Dr / Cr) *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditBalanceType('Debit')}
                    className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      editBalanceType === 'Debit'
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>Debit (Dr - نام)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditBalanceType('Credit')}
                    className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      editBalanceType === 'Credit'
                        ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>Credit (Cr - جمع)</span>
                  </button>
                </div>
              </div>

              {/* Amount & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Opening Amount (PKR) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={editAmount}
                    onChange={(e) => setEditAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono font-bold text-sm focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Opening Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Reference & Notes */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Reference / Voucher No
                  </label>
                  <input
                    type="text"
                    value={editReference}
                    onChange={(e) => setEditReference(e.target.value)}
                    placeholder="e.g. OB-0001"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Notes / Description
                  </label>
                  <input
                    type="text"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="e.g. Audited opening balance"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Reason for Change (Required if Posted) */}
              {batchStatus === 'Posted' && (
                <div>
                  <label className="block text-amber-300 font-semibold mb-1">
                    Reason for Revision (تبدیلی کی وجہ) *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                    placeholder="Provide justification for modifying posted opening balance..."
                    className="w-full bg-slate-950 border border-amber-700/80 rounded-xl p-2.5 text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-hidden text-xs"
                  />
                </div>
              )}

              {/* Modal Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Save Opening Balance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM MODAL: POST OPENING BALANCES */}
      {isPostConfirmOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-emerald-400">
              <span className="p-2 bg-emerald-950/80 border border-emerald-800 rounded-xl">
                <FileCheck className="w-6 h-6" />
              </span>
              <div>
                <h3 className="text-base font-bold text-white">Post Opening Balances</h3>
                <p className="text-xs text-slate-400">Fiscal Year: {currentFiscalYear}</p>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Debit:</span>
                <span className="font-mono font-bold text-emerald-400">PKR {totalDebit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Credit:</span>
                <span className="font-mono font-bold text-blue-400">PKR {totalCredit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800 font-bold">
                <span className="text-slate-300">Journal Entry:</span>
                <span className="font-mono text-white">OB-0001 (General Voucher)</span>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Posting will generate the formal opening balance journal entry, establish initial balances in the General Ledger and Trial Balance, and mark this fiscal year as <strong>Posted</strong>.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsPostConfirmOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPost}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer"
              >
                Confirm & Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM MODAL: CARRY FORWARD */}
      {isCarryForwardConfirmOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-cyan-400">
              <span className="p-2 bg-cyan-950/80 border border-cyan-800 rounded-xl">
                <RotateCcw className="w-6 h-6" />
              </span>
              <div>
                <h3 className="text-base font-bold text-white">Carry Forward Balances</h3>
                <p className="text-xs text-slate-400">Target Year: {currentFiscalYear}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              This will inspect closing account balances and create new <strong>Draft</strong> opening balances for Fiscal Year {currentFiscalYear}. Existing balances for this fiscal year will be updated.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsCarryForwardConfirmOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCarryForward}
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer"
              >
                Execute Carry Forward
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM MODAL: LOCK */}
      {isLockConfirmOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-purple-400">
              <span className="p-2 bg-purple-950/80 border border-purple-800 rounded-xl">
                <Lock className="w-6 h-6" />
              </span>
              <div>
                <h3 className="text-base font-bold text-white">Lock Opening Balances</h3>
                <p className="text-xs text-slate-400">Fiscal Year: {currentFiscalYear}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Locking prevents any further modifications to opening balances by standard accounting staff. Only a <strong>Super Admin</strong> will have authority to unlock this fiscal year.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsLockConfirmOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLock}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer"
              >
                Lock Fiscal Year
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM MODAL: UNLOCK */}
      {isUnlockConfirmOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-amber-400">
              <span className="p-2 bg-amber-950/80 border border-amber-800 rounded-xl">
                <Unlock className="w-6 h-6" />
              </span>
              <div>
                <h3 className="text-base font-bold text-white">Super Admin Unlock</h3>
                <p className="text-xs text-slate-400">Fiscal Year: {currentFiscalYear}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              As Super Admin, unlocking this fiscal year will re-open it for authorized adjustments. All changes will continue to be recorded in the audit trail.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsUnlockConfirmOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUnlock}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer"
              >
                Confirm Unlock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
