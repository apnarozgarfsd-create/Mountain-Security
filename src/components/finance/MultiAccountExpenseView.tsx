import React, { useState, useMemo } from 'react';
import {
  Wallet,
  Plus,
  ArrowRightLeft,
  ArrowDownRight,
  ArrowUpRight,
  Filter,
  Search,
  Printer,
  FileSpreadsheet,
  Download,
  Trash2,
  Edit2,
  Copy,
  User,
  Tag,
  Building2,
  DollarSign,
  Calendar,
  Layers,
  TrendingDown,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  FolderTree,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  CashTransaction,
  FinanceAccount,
  Party,
  TransactionDirection,
} from '../../types';
import { formatPKR, formatDate } from '../../utils/formatters';
import { FastTransactionModal } from './FastTransactionModal';
import { AccountTransferModal } from './AccountTransferModal';
import { AccountManagerModal } from './AccountManagerModal';
import { PartyStatementModal } from './PartyStatementModal';
import { DailyCashClosingView } from './DailyCashClosingView';
import { CsvImportModal } from './CsvImportModal';

export const MultiAccountExpenseView: React.FC = () => {
  const {
    financeAccounts,
    expenseCategories,
    parties,
    cashTransactions,
    deleteCashTransaction,
    duplicateCashTransaction,
    getAccountLiveBalance,
    addExpenseCategory,
    addParty,
    updateParty,
    deleteParty,
    triggerPrint,
    companySettings,
  } = useApp();

  // Navigation Subtabs
  const [activeSubtab, setActiveSubtab] = useState<
    'cashbook' | 'daily-closing' | 'party-ledgers' | 'categories'
  >('cashbook');

  // Modals state
  const [isFastEntryOpen, setIsFastEntryOpen] = useState(false);
  const [fastEntryDirection, setFastEntryDirection] = useState<TransactionDirection>('OUT');
  const [editingTransaction, setEditingTransaction] = useState<CashTransaction | null>(null);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isAccountManagerOpen, setIsAccountManagerOpen] = useState(false);
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);
  const [selectedPartyIdForStatement, setSelectedPartyIdForStatement] = useState<string | null>(
    null
  );
  const [deleteConfirmTxn, setDeleteConfirmTxn] = useState<CashTransaction | null>(null);

  // Filters State
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedPartyFilter, setSelectedPartyFilter] = useState<string>('all');
  const [selectedDirection, setSelectedDirection] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Category creation inline
  const [newCatName, setNewCatName] = useState('');
  const [newSubcatName, setNewSubcatName] = useState('');
  const [selectedParentCatId, setSelectedParentCatId] = useState('');

  // Party creation inline
  const [isNewPartyModalOpen, setIsNewPartyModalOpen] = useState(false);
  const [newPartyName, setNewPartyName] = useState('');
  const [newPartyRole, setNewPartyRole] = useState<'Director' | 'Employee' | 'Guard' | 'Vendor' | 'Contractor' | 'Other'>('Guard');
  const [newPartyPhone, setNewPartyPhone] = useState('');
  const [newPartyAdvance, setNewPartyAdvance] = useState<number | ''>(0);

  // Derived Account Totals
  const accountBalances = useMemo(() => {
    let totalCash = 0;
    let totalBank = 0;
    let totalOther = 0;

    financeAccounts.forEach((acc) => {
      const bal = getAccountLiveBalance(acc.id);
      if (acc.type === 'cash') totalCash += bal;
      else if (acc.type === 'bank') totalBank += bal;
      else totalOther += bal;
    });

    return {
      totalCash,
      totalBank,
      totalOther,
      grandTotal: totalCash + totalBank + totalOther,
    };
  }, [financeAccounts, cashTransactions]);

  // Today Stats
  const todayStr = new Date().toISOString().split('T')[0];
  const todayStats = useMemo(() => {
    let todayIn = 0;
    let todayOut = 0;
    cashTransactions.forEach((t) => {
      if (t.date === todayStr) {
        if (t.direction === 'IN') todayIn += t.amount;
        else todayOut += t.amount;
      }
    });
    return { todayIn, todayOut };
  }, [cashTransactions, todayStr]);

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return cashTransactions
      .filter((t) => {
        if (selectedAccountId !== 'all' && t.accountId !== selectedAccountId) return false;
        if (selectedCategoryId !== 'all' && t.categoryId !== selectedCategoryId) return false;
        if (selectedPartyFilter !== 'all' && t.partyId !== selectedPartyFilter) return false;
        if (selectedDirection !== 'all' && t.direction !== selectedDirection) return false;
        if (startDate && t.date < startDate) return false;
        if (endDate && t.date > endDate) return false;
        if (searchTerm) {
          const q = searchTerm.toLowerCase();
          return (
            t.description.toLowerCase().includes(q) ||
            t.accountName.toLowerCase().includes(q) ||
            (t.categoryName && t.categoryName.toLowerCase().includes(q)) ||
            (t.subcategoryName && t.subcategoryName.toLowerCase().includes(q)) ||
            (t.partyName && t.partyName.toLowerCase().includes(q)) ||
            (t.referenceNo && t.referenceNo.toLowerCase().includes(q))
          );
        }
        return true;
      })
      .sort((a, b) => {
        const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateDiff !== 0) return dateDiff;
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      });
  }, [
    cashTransactions,
    selectedAccountId,
    selectedCategoryId,
    selectedPartyFilter,
    selectedDirection,
    startDate,
    endDate,
    searchTerm,
  ]);

  const filteredTotalIn = filteredTransactions
    .filter((t) => t.direction === 'IN')
    .reduce((sum, t) => sum + t.amount, 0);

  const filteredTotalOut = filteredTransactions
    .filter((t) => t.direction === 'OUT')
    .reduce((sum, t) => sum + t.amount, 0);

  // Fast duplicate handler
  const handleDuplicate = (id: string) => {
    const dup = duplicateCashTransaction(id);
    if (dup) {
      // open editor with duplicate
      setEditingTransaction(dup);
      setIsFastEntryOpen(true);
    }
  };

  const handlePrintCashbook = () => {
    triggerPrint({
      type: 'account-ledger',
      data: {
        accountName:
          selectedAccountId === 'all'
            ? 'Consolidated Multi-Account Cashbook'
            : financeAccounts.find((a) => a.id === selectedAccountId)?.name || 'Account Ledger',
        startDate: startDate || 'All Dates',
        endDate: endDate || 'Latest',
        transactions: filteredTransactions,
        totalIn: filteredTotalIn,
        totalOut: filteredTotalOut,
        netBalance: filteredTotalIn - filteredTotalOut,
      },
      title: `Cashbook Report - ${formatDate(new Date().toISOString())}`,
    });
  };

  const handleExportCsv = () => {
    const headers = ['Date', 'Account', 'Direction', 'Head A/C', 'Sub-Head A/C', 'Particulars', 'Party', 'Amount (PKR)', 'Payment Mode', 'Reference No'];
    const rows = filteredTransactions.map((t) => [
      t.date,
      `"${t.accountName}"`,
      t.direction,
      `"${t.categoryName}"`,
      `"${t.subcategoryName || ''}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      `"${t.partyName || ''}"`,
      t.amount,
      `"${t.paymentMode || ''}"`,
      `"${t.referenceNo || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `mountain_security_cashbook_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateParty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartyName.trim()) return;
    addParty({
      name: newPartyName.trim(),
      roleRelation: newPartyRole,
      phone: newPartyPhone.trim() || undefined,
      openingAdvanceBalance: Number(newPartyAdvance) || 0,
    });
    setNewPartyName('');
    setNewPartyPhone('');
    setNewPartyAdvance(0);
    setIsNewPartyModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-2xl border border-blue-500/30">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  Multi-Account Expense & Cashbook Ledger
                </h2>
                <p className="text-xs text-slate-400">
                  Normalized database ledger replacing manual Excel sheets • Mountain Security Services
                </p>
              </div>
            </div>
          </div>

          {/* Master Actions Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setEditingTransaction(null);
                setFastEntryDirection('OUT');
                setIsFastEntryOpen(true);
              }}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-rose-950/50"
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>- Expense (OUT)</span>
            </button>

            <button
              onClick={() => {
                setEditingTransaction(null);
                setFastEntryDirection('IN');
                setIsFastEntryOpen(true);
              }}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-950/50"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>+ Receipt (IN)</span>
            </button>

            <button
              onClick={() => setIsTransferOpen(true)}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-slate-700"
            >
              <ArrowRightLeft className="w-4 h-4 text-blue-400" />
              <span>Transfer</span>
            </button>

            <button
              onClick={() => setIsAccountManagerOpen(true)}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-slate-700"
            >
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>Accounts ({financeAccounts.length})</span>
            </button>

            <button
              onClick={() => setIsCsvImportOpen(true)}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-slate-700"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Import Excel</span>
            </button>
          </div>
        </div>

        {/* Live Accounts Liquidity Cards Carousel */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80">
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cash in Drawers</span>
            </p>
            <p className="text-lg font-black font-mono text-emerald-400 mt-1">
              {formatPKR(accountBalances.totalCash)}
            </p>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Bank & Wallets</span>
            </p>
            <p className="text-lg font-black font-mono text-blue-400 mt-1">
              {formatPKR(accountBalances.totalBank)}
            </p>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
              <span>Today Expenses</span>
            </p>
            <p className="text-lg font-black font-mono text-rose-400 mt-1">
              {formatPKR(todayStats.todayOut)}
            </p>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-blue-500/30">
            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
              Total Liquidity (All Accounts)
            </p>
            <p className="text-lg font-black font-mono text-white mt-1">
              {formatPKR(accountBalances.grandTotal)}
            </p>
          </div>
        </div>

        {/* Quick Filter Chips by Individual Dynamic Accounts */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-semibold text-slate-500 shrink-0">Filter Account:</span>
          <button
            onClick={() => setSelectedAccountId('all')}
            className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-colors shrink-0 ${
              selectedAccountId === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            All Accounts ({financeAccounts.length})
          </button>
          {financeAccounts.map((acc) => {
            const bal = getAccountLiveBalance(acc.id);
            return (
              <button
                key={acc.id}
                onClick={() => setSelectedAccountId(acc.id)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 shrink-0 ${
                  selectedAccountId === acc.id
                    ? 'bg-slate-700 text-white border border-blue-400'
                    : 'bg-slate-950/70 text-slate-300 border border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>{acc.name}</span>
                <span
                  className={`font-mono text-[10px] font-bold ${
                    bal < 0 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  ({formatPKR(bal)})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Subtabs Bar */}
      <div className="flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 w-fit">
        <button
          onClick={() => setActiveSubtab('cashbook')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubtab === 'cashbook'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Transactions Cash-Book ({filteredTransactions.length})</span>
        </button>

        <button
          onClick={() => setActiveSubtab('daily-closing')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubtab === 'daily-closing'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Daily Reconciliation & Closing</span>
        </button>

        <button
          onClick={() => setActiveSubtab('party-ledgers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubtab === 'party-ledgers'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Party & Person Ledgers ({parties.length})</span>
        </button>

        <button
          onClick={() => setActiveSubtab('categories')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubtab === 'categories'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>Head A/C & Categories</span>
        </button>
      </div>

      {/* Subtab 1: Transactions Cash-Book */}
      {activeSubtab === 'cashbook' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Search */}
              <div className="lg:col-span-2 relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search particulars, reference, party..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:border-blue-500"
                />
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white focus:border-blue-500"
                >
                  <option value="all">-- All Head A/C Categories --</option>
                  {expenseCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Direction Filter */}
              <div>
                <select
                  value={selectedDirection}
                  onChange={(e) => setSelectedDirection(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white focus:border-blue-500"
                >
                  <option value="all">-- All Flow (IN & OUT) --</option>
                  <option value="OUT">OUT (Expenses / Advances)</option>
                  <option value="IN">IN (Receipts / Income)</option>
                </select>
              </div>

              {/* Party Filter */}
              <div>
                <select
                  value={selectedPartyFilter}
                  onChange={(e) => setSelectedPartyFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white focus:border-blue-500"
                >
                  <option value="all">-- All Parties / People --</option>
                  {parties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.roleRelation})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date Range & Action Tools */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-[11px]">Date Range:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-white text-xs"
                />
                <span className="text-slate-500 text-[11px]">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-white text-xs"
                />
                {(startDate || endDate || searchTerm || selectedAccountId !== 'all' || selectedCategoryId !== 'all' || selectedDirection !== 'all') && (
                  <button
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                      setSearchTerm('');
                      setSelectedAccountId('all');
                      setSelectedCategoryId('all');
                      setSelectedDirection('all');
                      setSelectedPartyFilter('all');
                    }}
                    className="text-xs text-blue-400 hover:underline cursor-pointer ml-2"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCsv}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer border border-slate-700"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={handlePrintCashbook}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer border border-slate-700"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-400" />
                  <span>Print Sheet</span>
                </button>
              </div>
            </div>
          </div>

          {/* Cashbook Sheet Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Account</th>
                    <th className="py-3 px-3">Head A/C & Subcategory</th>
                    <th className="py-3 px-3">Particulars / Description</th>
                    <th className="py-3 px-3">Party</th>
                    <th className="py-3 px-3 text-right text-emerald-400">Receipt (IN)</th>
                    <th className="py-3 px-3 text-right text-rose-400">Payment (OUT)</th>
                    <th className="py-3 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        No transactions found matching the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((txn) => (
                      <tr key={txn.id} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 whitespace-nowrap text-slate-300 font-mono text-[11px]">
                          {formatDate(txn.date)}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="font-semibold text-slate-200 block">
                            {txn.accountName}
                          </span>
                          {txn.paymentMode && (
                            <span className="text-[10px] text-slate-500">
                              {txn.paymentMode}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="text-slate-200 font-semibold">{txn.categoryName}</span>
                          {txn.subcategoryName && (
                            <span className="text-[10px] text-slate-400 block font-normal">
                              {txn.subcategoryName}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-white max-w-sm">
                          <p className="truncate font-normal">{txn.description}</p>
                          {txn.referenceNo && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              Ref: {txn.referenceNo}
                            </span>
                          )}
                          {txn.transferGroupId && (
                            <span className="text-[9px] bg-blue-950 text-blue-300 px-1.5 py-0.2 rounded ml-1 border border-blue-800/50">
                              Inter-Account Transfer
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {txn.partyName ? (
                            <button
                              onClick={() => setSelectedPartyIdForStatement(txn.partyId || null)}
                              className="text-indigo-400 hover:text-indigo-300 underline cursor-pointer font-semibold"
                            >
                              {txn.partyName}
                            </button>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400 text-xs">
                          {txn.direction === 'IN' ? formatPKR(txn.amount) : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-400 text-xs">
                          {txn.direction === 'OUT' ? formatPKR(txn.amount) : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap space-x-1">
                          <button
                            onClick={() => handleDuplicate(txn.id)}
                            className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer"
                            title="Duplicate Entry (Quick Repeat)"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingTransaction(txn);
                              setIsFastEntryOpen(true);
                            }}
                            className="p-1 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded cursor-pointer"
                            title="Edit Entry"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmTxn(txn)}
                            className="p-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded cursor-pointer border border-rose-800/50"
                            title="Delete Entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-slate-950 font-bold border-t-2 border-slate-700">
                  <tr>
                    <td colSpan={5} className="py-3 px-3 text-white uppercase text-xs">
                      Filtered Totals ({filteredTransactions.length} items)
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-400 text-sm">
                      +{formatPKR(filteredTotalIn)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-rose-400 text-sm">
                      -{formatPKR(filteredTotalOut)}
                    </td>
                    <td className="py-3 px-3 text-center text-[10px] text-slate-400">
                      Net: {formatPKR(filteredTotalIn - filteredTotalOut)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: Daily Reconciliation & Closing */}
      {activeSubtab === 'daily-closing' && <DailyCashClosingView />}

      {/* Subtab 3: Party & Person Ledgers */}
      {activeSubtab === 'party-ledgers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-400" />
                <span>Personnel, Vendor & Stakeholder Ledgers</span>
              </h3>
              <p className="text-xs text-slate-400">
                Track personal advances, field disbursements, director drawings and vendor balances
              </p>
            </div>
            <button
              onClick={() => setIsNewPartyModalOpen(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Person / Party</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {parties.map((p) => {
              const txns = cashTransactions.filter((t) => t.partyId === p.id);
              const outTotal = txns
                .filter((t) => t.direction === 'OUT')
                .reduce((s, t) => s + t.amount, 0);
              const inTotal = txns
                .filter((t) => t.direction === 'IN')
                .reduce((s, t) => s + t.amount, 0);
              const netBal = (p.openingAdvanceBalance || 0) + outTotal - inTotal;

              return (
                <div
                  key={p.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-2xl shadow-lg space-y-3 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{p.name}</h4>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-semibold border border-slate-700">
                        {p.roleRelation}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedPartyIdForStatement(p.id)}
                      className="px-3 py-1 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 text-xs font-bold rounded-lg border border-indigo-800/60 cursor-pointer"
                    >
                      Statement
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Paid OUT</span>
                      <span className="font-bold text-rose-400">{formatPKR(outTotal)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Received IN</span>
                      <span className="font-bold text-emerald-400">{formatPKR(inTotal)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/70 text-xs">
                    <span className="text-slate-400">Current Net Balance:</span>
                    <strong className="font-mono text-sm text-indigo-300">
                      {formatPKR(netBal)}
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Subtab 4: Head A/C & Categories */}
      {activeSubtab === 'categories' && (
        <div className="space-y-4">
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-emerald-400" />
                <span>2-Level Expense Head A/C Hierarchy</span>
              </h3>
              <p className="text-xs text-slate-400">
                Organize company finances into clean Heads and Sub-Heads
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {expenseCategories.map((cat) => {
              const catTxns = cashTransactions.filter((t) => t.categoryId === cat.id);
              const catExpense = catTxns
                .filter((t) => t.direction === 'OUT')
                .reduce((s, t) => s + t.amount, 0);

              return (
                <div
                  key={cat.id}
                  className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h4 className="font-bold text-white text-sm">{cat.name}</h4>
                    <span className="text-xs font-mono font-bold text-rose-400">
                      {formatPKR(catExpense)}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Subcategories ({cat.subcategories.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.subcategories.map((sub) => (
                        <span
                          key={sub.id}
                          className="bg-slate-950 text-slate-300 text-[11px] px-2.5 py-1 rounded-lg border border-slate-800"
                        >
                          {sub.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODALS */}

      {/* Fast Transaction (OUT/IN) Modal */}
      <FastTransactionModal
        isOpen={isFastEntryOpen}
        onClose={() => {
          setIsFastEntryOpen(false);
          setEditingTransaction(null);
        }}
        editingTransaction={editingTransaction}
        defaultAccountId={selectedAccountId === 'all' ? undefined : selectedAccountId}
        defaultDirection={fastEntryDirection}
      />

      {/* Inter-Account Transfer Modal */}
      <AccountTransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        defaultSourceAccountId={selectedAccountId === 'all' ? undefined : selectedAccountId}
      />

      {/* Account Manager Modal */}
      <AccountManagerModal
        isOpen={isAccountManagerOpen}
        onClose={() => setIsAccountManagerOpen(false)}
      />

      {/* Party Statement Modal */}
      {selectedPartyIdForStatement && (
        <PartyStatementModal
          partyId={selectedPartyIdForStatement}
          onClose={() => setSelectedPartyIdForStatement(null)}
        />
      )}

      {/* Excel / CSV Import Modal */}
      <CsvImportModal
        isOpen={isCsvImportOpen}
        onClose={() => setIsCsvImportOpen(false)}
      />

      {/* Delete Transaction Confirmation Dialog */}
      {deleteConfirmTxn && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-800/80 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-950 text-rose-400 rounded-xl border border-rose-800/60">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Transaction Entry?</h3>
                <p className="text-xs text-rose-300 font-medium font-mono">
                  [{deleteConfirmTxn.direction}] {formatPKR(deleteConfirmTxn.amount)} • {deleteConfirmTxn.accountName}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
              {deleteConfirmTxn.transferGroupId
                ? '⚠️ This transaction was logged as part of an Inter-Account Transfer. Deleting it will automatically delete both the outgoing and incoming counterpart records to keep accounts synchronized.'
                : 'Deleting this entry will remove it from the cashbook and automatically recalculate live account balances.'}
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmTxn(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteCashTransaction(deleteConfirmTxn.id);
                  setDeleteConfirmTxn(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow-lg shadow-rose-950/50 flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Entry</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Party Modal */}
      {isNewPartyModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-400" />
              <span>Create Party / Person Profile</span>
            </h3>

            <form onSubmit={handleCreateParty} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Full Name / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ali Akbar, Zeeshan Ali, Guard Gul Khan"
                  value={newPartyName}
                  onChange={(e) => setNewPartyName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Role / Relationship *
                  </label>
                  <select
                    value={newPartyRole}
                    onChange={(e) => setNewPartyRole(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  >
                    <option value="Director">Director</option>
                    <option value="Employee">Employee / Staff</option>
                    <option value="Guard">Security Guard</option>
                    <option value="Vendor">Vendor / Supplier</option>
                    <option value="Contractor">Contractor</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="0300-1234567"
                    value={newPartyPhone}
                    onChange={(e) => setNewPartyPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Opening Advance Balance (PKR)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={newPartyAdvance}
                  onChange={(e) => setNewPartyAdvance(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewPartyModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold cursor-pointer"
                >
                  Create Party
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
