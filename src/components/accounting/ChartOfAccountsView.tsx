import {
  AlertCircle,
  AlertTriangle,
  Building,
  CheckCircle2,
  ChevronRight,
  DollarSign,
  Edit2,
  FileSpreadsheet,
  FileText,
  FolderTree,
  Lock,
  Pencil,
  Plus,
  Power,
  Printer,
  Search,
  ShieldCheck,
  Trash2,
  Wallet,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Account, AccountCategory } from '../../types';
import { formatPKR } from '../../utils/formatters';

export const ChartOfAccountsView: React.FC = () => {
  const {
    accounts,
    vouchers,
    cashTransactions,
    clientInvoices,
    currentUserRole,
    addAccount,
    updateAccount,
    deleteAccount,
    triggerPrint,
    logAudit,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  
  // Modals
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null);
  const [deleteBlockReason, setDeleteBlockReason] = useState<string | null>(null);
  const [selectedAccountForLedger, setSelectedAccountForLedger] = useState<Account | null>(null);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'warning' | 'error'; message: string } | null>(null);

  // Form State for Add / Edit
  const [accountCode, setAccountCode] = useState('');
  const [accountName, setAccountName] = useState('');
  const [category, setCategory] = useState<AccountCategory>('Expense');
  const [subcategory, setSubcategory] = useState('');
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [description, setDescription] = useState('');

  const categories: AccountCategory[] = ['Asset', 'Liability', 'Equity', 'Income', 'Expense'];

  // Permissions: Super Admin & Accountant can edit/delete accounts
  const canManageAccounts = currentUserRole === 'Super Admin' || currentUserRole === 'Accountant';

  // Balance totals
  const totalAssets = accounts
    .filter((a) => a.category === 'Asset' && a.status === 'Active')
    .reduce((sum, a) => sum + (Number(a.currentBalance) || 0), 0);

  const totalLiabilities = accounts
    .filter((a) => a.category === 'Liability' && a.status === 'Active')
    .reduce((sum, a) => sum + (Number(a.currentBalance) || 0), 0);

  const totalEquity = accounts
    .filter((a) => a.category === 'Equity' && a.status === 'Active')
    .reduce((sum, a) => sum + (Number(a.currentBalance) || 0), 0);

  const totalIncome = accounts
    .filter((a) => a.category === 'Income' && a.status === 'Active')
    .reduce((sum, a) => sum + (Number(a.currentBalance) || 0), 0);

  const totalExpense = accounts
    .filter((a) => a.category === 'Expense' && a.status === 'Active')
    .reduce((sum, a) => sum + (Number(a.currentBalance) || 0), 0);

  // Helper to count linked records for an account
  const getLinkedTransactionsCount = (acc: Account) => {
    let count = 0;
    // Check vouchers
    vouchers.forEach((v) => {
      if (v.entries.some((e) => e.accountId === acc.id || e.accountCode === acc.accountCode)) {
        count++;
      }
    });
    // Check cash transactions
    cashTransactions.forEach((txn) => {
      if (txn.accountId === acc.id || txn.categoryId === acc.id) {
        count++;
      }
    });
    return count;
  };

  const handleOpenAddModal = () => {
    if (!canManageAccounts) {
      setActionNotice({
        type: 'warning',
        message: 'Only Super Admin and Accountant roles are authorized to create or modify Chart of Accounts.',
      });
      setTimeout(() => setActionNotice(null), 4000);
      return;
    }
    const nextCode = `50${String(accounts.length + 1).padStart(2, '0')}`;
    setAccountCode(nextCode);
    setAccountName('');
    setCategory('Expense');
    setSubcategory('Operating Expenses');
    setOpeningBalance(0);
    setStatus('Active');
    setDescription('');
    setIsAddAccountOpen(true);
  };

  const handleOpenEditModal = (acc: Account, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!canManageAccounts) {
      setActionNotice({
        type: 'warning',
        message: 'Only Super Admin and Accountant roles are authorized to modify accounts.',
      });
      setTimeout(() => setActionNotice(null), 4000);
      return;
    }
    setEditingAccount(acc);
    setAccountCode(acc.accountCode);
    setAccountName(acc.accountName);
    setCategory(acc.category);
    setSubcategory(acc.subcategory || `${acc.category} Account`);
    setOpeningBalance(acc.openingBalance || 0);
    setStatus(acc.status || 'Active');
    setDescription(acc.description || '');
  };

  const handleOpenDeleteModal = (acc: Account, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!canManageAccounts) {
      setActionNotice({
        type: 'warning',
        message: 'Only Super Admin and Accountant roles are authorized to delete accounts.',
      });
      setTimeout(() => setActionNotice(null), 4000);
      return;
    }
    const linkedCount = getLinkedTransactionsCount(acc);
    setDeletingAccount(acc);
    if (linkedCount > 0) {
      setDeleteBlockReason(
        `This account cannot be deleted because it has ${linkedCount} linked transaction record(s). You can deactivate it instead.`
      );
    } else {
      setDeleteBlockReason(null);
    }
  };

  const handleAddAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountCode.trim() || !accountName.trim()) return;

    addAccount({
      accountCode: accountCode.trim(),
      accountName: accountName.trim(),
      category,
      subcategory: subcategory.trim() || `${category} Account`,
      openingBalance: Number(openingBalance) || 0,
      isSystem: false,
      status: status || 'Active',
      description: description.trim(),
    });

    logAudit('Create Account', 'Accounting', accountCode, `Created new ${category} account "${accountName}"`);
    setIsAddAccountOpen(false);
    setActionNotice({
      type: 'success',
      message: `Account "${accountName}" (${accountCode}) created successfully!`,
    });
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleEditAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount || !accountCode.trim() || !accountName.trim()) return;

    updateAccount(editingAccount.id, {
      accountCode: accountCode.trim(),
      accountName: accountName.trim(),
      category,
      subcategory: subcategory.trim() || `${category} Account`,
      status,
      description: description.trim(),
    });

    logAudit('Update Account', 'Accounting', accountCode, `Modified account details for "${accountName}" (${accountCode})`);
    setEditingAccount(null);
    setActionNotice({
      type: 'success',
      message: `Account "${accountName}" updated successfully!`,
    });
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleConfirmDelete = () => {
    if (!deletingAccount) return;

    const res = deleteAccount(deletingAccount.id);
    if (res.success) {
      logAudit('Delete Account', 'Accounting', deletingAccount.accountCode, `Deleted account "${deletingAccount.accountName}"`);
      setActionNotice({
        type: 'success',
        message: `Account "${deletingAccount.accountName}" deleted permanently.`,
      });
      if (selectedAccountForLedger?.id === deletingAccount.id) {
        setSelectedAccountForLedger(null);
      }
    } else {
      setActionNotice({
        type: 'error',
        message: res.error || 'Failed to delete account.',
      });
    }
    setDeletingAccount(null);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleDeactivateInstead = () => {
    if (!deletingAccount) return;

    updateAccount(deletingAccount.id, { status: 'Inactive' });
    logAudit('Deactivate Account', 'Accounting', deletingAccount.accountCode, `Deactivated account "${deletingAccount.accountName}" because it had linked transactions`);
    setActionNotice({
      type: 'success',
      message: `Account "${deletingAccount.accountName}" deactivated. It will no longer appear in new voucher/transaction selectors.`,
    });
    setDeletingAccount(null);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleToggleStatusQuick = (acc: Account, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canManageAccounts) return;
    const newStatus = acc.status === 'Active' ? 'Inactive' : 'Active';
    updateAccount(acc.id, { status: newStatus });
    logAudit('Toggle Status', 'Accounting', acc.accountCode, `Changed status of "${acc.accountName}" to ${newStatus}`);
  };

  // Ledger Rows calculation
  const getAccountLedgerRows = (acc: Account) => {
    let runningBalance = Number(acc.openingBalance) || 0;
    let totalDebit = 0;
    let totalCredit = 0;

    const rows: any[] = [];

    const matchedVouchers = vouchers
      .filter((v) => v.status === 'Posted')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    matchedVouchers.forEach((v) => {
      const entries = v.entries.filter((e) => e.accountId === acc.id || e.accountCode === acc.accountCode);
      entries.forEach((ent) => {
        const deb = Number(ent.debit) || 0;
        const cred = Number(ent.credit) || 0;
        totalDebit += deb;
        totalCredit += cred;

        if (acc.category === 'Asset' || acc.category === 'Expense') {
          runningBalance += deb - cred;
        } else {
          runningBalance += cred - deb;
        }

        rows.push({
          date: v.date,
          voucherNo: v.voucherNo,
          voucherType: v.voucherType,
          narration: ent.narration || v.narration,
          partyName: ent.partyName,
          debit: deb,
          credit: cred,
          balance: runningBalance,
        });
      });
    });

    return {
      rows,
      openingBalance: Number(acc.openingBalance) || 0,
      totalDebit,
      totalCredit,
      closingBalance: runningBalance,
    };
  };

  const handlePrintLedger = (acc: Account) => {
    const ledgerData = getAccountLedgerRows(acc);
    triggerPrint({
      type: 'account-ledger',
      data: {
        accountName: acc.accountName,
        accountCode: acc.accountCode,
        category: acc.category,
        openingBalance: ledgerData.openingBalance,
        entries: ledgerData.rows,
        totalDebit: ledgerData.totalDebit,
        totalCredit: ledgerData.totalCredit,
        closingBalance: ledgerData.closingBalance,
        period: 'All Posted Vouchers',
      },
      title: `General Ledger - ${acc.accountName}`,
    });
  };

  const filteredAccounts = accounts.filter((a) => {
    const matchesSearch =
      a.accountCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.subcategory && a.subcategory.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = selectedCategory === 'All' || a.category === selectedCategory;
    const matchesStatus = statusFilter === 'All' || (a.status || 'Active') === statusFilter;
    return matchesSearch && matchesCat && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white uppercase flex items-center gap-2">
              <Wallet className="w-6 h-6 text-emerald-400" />
              <span>Chart of Accounts & General Ledgers</span>
            </h1>
            {!canManageAccounts && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 border border-amber-800 text-amber-300">
                <Lock className="w-2.5 h-2.5" /> View Only Mode
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            5-tier accounting tree with Edit, Delete & Deactivation controls. Click any account to inspect transaction ledger.
          </p>
        </div>

        {canManageAccounts && (
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Account</span>
          </button>
        )}
      </div>

      {/* Action Notice Alert */}
      {actionNotice && (
        <div
          className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-semibold animate-in fade-in ${
            actionNotice.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
              : actionNotice.type === 'warning'
              ? 'bg-amber-950/80 border-amber-800 text-amber-300'
              : 'bg-red-950/80 border-red-800 text-red-300'
          }`}
        >
          {actionNotice.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{actionNotice.message}</span>
        </div>
      )}

      {/* Financial Structure Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase">1000 • Total Assets</span>
          <div className="text-lg font-black text-emerald-400 mt-0.5">{formatPKR(totalAssets)}</div>
        </div>
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase">2000 • Total Liabilities</span>
          <div className="text-lg font-black text-red-400 mt-0.5">{formatPKR(totalLiabilities)}</div>
        </div>
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase">3000 • Total Equity</span>
          <div className="text-lg font-black text-blue-400 mt-0.5">{formatPKR(totalEquity)}</div>
        </div>
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase">4000 • Total Income</span>
          <div className="text-lg font-black text-purple-400 mt-0.5">{formatPKR(totalIncome)}</div>
        </div>
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase">5000 • Total Expenses</span>
          <div className="text-lg font-black text-amber-400 mt-0.5">{formatPKR(totalExpense)}</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Code (e.g. 1010), Title, Group..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-2.5 py-1 text-xs font-bold rounded transition-colors cursor-pointer ${
                selectedCategory === 'All' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-xs font-bold rounded transition-colors cursor-pointer ${
                  selectedCategory === cat ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setStatusFilter('All')}
              className={`px-2 py-1 text-[11px] font-bold rounded cursor-pointer ${
                statusFilter === 'All' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Status
            </button>
            <button
              onClick={() => setStatusFilter('Active')}
              className={`px-2 py-1 text-[11px] font-bold rounded cursor-pointer ${
                statusFilter === 'Active' ? 'bg-emerald-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('Inactive')}
              className={`px-2 py-1 text-[11px] font-bold rounded cursor-pointer ${
                statusFilter === 'Inactive' ? 'bg-amber-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Inactive
            </button>
          </div>
        </div>
      </div>

      {/* Accounts List & Ledger Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Accounts Directory (7 cols) */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col justify-between">
          <div>
            <div className="p-3.5 bg-slate-900/80 border-b border-slate-800 font-bold text-xs text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-blue-400" />
                <span>Chart of Accounts Directory ({filteredAccounts.length})</span>
              </span>
              <span className="text-[10px] text-slate-400">Click row for Ledger</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-900/50 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <th className="py-2.5 px-3">Code</th>
                    <th className="py-2.5 px-3">Account Title & Group</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Balance</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredAccounts.map((acc) => {
                    const isSelected = selectedAccountForLedger?.id === acc.id;
                    const isInactive = acc.status === 'Inactive';

                    return (
                      <tr
                        key={acc.id}
                        onClick={() => setSelectedAccountForLedger(acc)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-blue-950/60 text-white'
                            : isInactive
                            ? 'bg-slate-950/40 opacity-70 hover:opacity-100 hover:bg-slate-900/50'
                            : 'hover:bg-slate-900/60'
                        }`}
                      >
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-400">{acc.accountCode}</td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-200 flex items-center gap-1.5">
                            <span>{acc.accountName}</span>
                            {acc.isSystem && (
                              <span className="text-[9px] px-1 py-0.2 bg-slate-800 text-slate-400 rounded">Sys</span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">{acc.subcategory}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              acc.category === 'Asset'
                                ? 'bg-emerald-950 text-emerald-300'
                                : acc.category === 'Liability'
                                ? 'bg-red-950 text-red-300'
                                : acc.category === 'Equity'
                                ? 'bg-blue-950 text-blue-300'
                                : acc.category === 'Income'
                                ? 'bg-purple-950 text-purple-300'
                                : 'bg-amber-950 text-amber-300'
                            }`}
                          >
                            {acc.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                              acc.status === 'Inactive'
                                ? 'bg-slate-800 text-slate-400 border border-slate-700'
                                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            }`}
                          >
                            {acc.status || 'Active'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-black font-mono text-slate-100">
                          {formatPKR(acc.currentBalance)}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Edit Button */}
                            {canManageAccounts && (
                              <button
                                onClick={(e) => handleOpenEditModal(acc, e)}
                                className="p-1.5 text-blue-400 hover:text-white rounded-lg hover:bg-blue-950/80 border border-transparent hover:border-blue-800 cursor-pointer transition-colors"
                                title="Edit Account"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Delete Button */}
                            {canManageAccounts && (
                              <button
                                onClick={(e) => handleOpenDeleteModal(acc, e)}
                                className="p-1.5 text-red-400 hover:text-white rounded-lg hover:bg-red-950/80 border border-transparent hover:border-red-800 cursor-pointer transition-colors"
                                title="Delete Account"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Print Ledger Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePrintLedger(acc);
                              }}
                              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
                              title="Print Account Ledger"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredAccounts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                        No accounts found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Total Accounts: <strong>{accounts.length}</strong></span>
            <span>Active: <strong className="text-emerald-400">{accounts.filter(a => a.status !== 'Inactive').length}</strong> | Inactive: <strong className="text-amber-400">{accounts.filter(a => a.status === 'Inactive').length}</strong></span>
          </div>
        </div>

        {/* Right: Selected Account Ledger Details (5 cols) */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-lg">
          {selectedAccountForLedger ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-blue-400 font-mono">
                      {selectedAccountForLedger.accountCode} • {selectedAccountForLedger.category}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                        selectedAccountForLedger.status === 'Inactive'
                          ? 'bg-slate-800 text-slate-400'
                          : 'bg-emerald-950 text-emerald-300'
                      }`}
                    >
                      {selectedAccountForLedger.status || 'Active'}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-white">{selectedAccountForLedger.accountName}</h3>
                  {selectedAccountForLedger.description && (
                    <p className="text-[11px] text-slate-400 mt-0.5">{selectedAccountForLedger.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {canManageAccounts && (
                    <button
                      onClick={() => handleOpenEditModal(selectedAccountForLedger)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded-lg text-xs font-bold cursor-pointer"
                      title="Edit Account Details"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => handlePrintLedger(selectedAccountForLedger)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>
                </div>
              </div>

              {/* Running Ledger preview */}
              {(() => {
                const ledger = getAccountLedgerRows(selectedAccountForLedger);
                return (
                  <div className="space-y-3">
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Opening Balance:</span>
                      <span className="font-bold text-slate-200 font-mono">
                        {formatPKR(ledger.openingBalance)}
                      </span>
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-2">
                      {ledger.rows.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 text-xs">
                          No voucher transactions posted to this account yet.
                        </div>
                      ) : (
                        ledger.rows.map((row, idx) => (
                          <div
                            key={idx}
                            className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between font-mono">
                              <span className="text-blue-400 font-bold">{row.voucherNo}</span>
                              <span className="text-slate-400 text-[10px]">{row.date}</span>
                            </div>
                            <p className="text-slate-300 truncate">{row.narration}</p>
                            <div className="flex items-center justify-between font-mono text-[11px] pt-1 border-t border-slate-800">
                              <span className={row.debit > 0 ? 'text-emerald-400' : 'text-slate-500'}>
                                Dr: {row.debit > 0 ? formatPKR(row.debit) : '-'}
                              </span>
                              <span className={row.credit > 0 ? 'text-blue-400' : 'text-slate-500'}>
                                Cr: {row.credit > 0 ? formatPKR(row.credit) : '-'}
                              </span>
                              <span className="font-bold text-slate-100">
                                Bal: {formatPKR(row.balance)}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="bg-emerald-950/50 border border-emerald-800/80 p-3 rounded-lg flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-300">Closing Balance:</span>
                      <span className="font-black text-sm text-emerald-400 font-mono">
                        {formatPKR(ledger.closingBalance)}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="py-24 text-center text-slate-500 text-xs space-y-2">
              <FolderTree className="w-10 h-10 mx-auto opacity-40 text-blue-400" />
              <p className="font-bold text-slate-300 text-sm">Select an Account</p>
              <p className="max-w-xs mx-auto text-slate-400 text-[11px]">
                Click on any account in the directory to inspect its live voucher ledger, balance and print general ledger statements.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create Account */}
      {isAddAccountOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" />
                <span>Create New Account</span>
              </h3>
              <button
                onClick={() => setIsAddAccountOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddAccountSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Account Category / Type *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as AccountCategory)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-bold"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Account Code *</label>
                  <input
                    type="text"
                    required
                    value={accountCode}
                    onChange={(e) => setAccountCode(e.target.value)}
                    placeholder="e.g. 5060"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Opening Balance (PKR)</label>
                  <input
                    type="number"
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Account Title / Name *</label>
                <input
                  type="text"
                  required
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="e.g. Weapon Licensing & Ammunition Expenses"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Parent Group / Subcategory</label>
                  <input
                    type="text"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    placeholder="e.g. Legal & Licensing"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Account Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-semibold"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Accounting notes and usage instructions..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddAccountOpen(false)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl cursor-pointer shadow-md"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Account */}
      {editingAccount && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Pencil className="w-5 h-5 text-blue-400" />
                <span>Edit Account Details</span>
              </h3>
              <button
                onClick={() => setEditingAccount(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditAccountSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Account Category / Type *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as AccountCategory)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-bold"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Account Code *</label>
                  <input
                    type="text"
                    required
                    value={accountCode}
                    onChange={(e) => setAccountCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Status (حالت) *</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}
                    className={`w-full bg-slate-950 border border-slate-700 rounded-lg p-2 font-bold ${
                      status === 'Active' ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    <option value="Active">Active (فعال)</option>
                    <option value="Inactive">Inactive (غیر فعال)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Account Title / Name *</label>
                <input
                  type="text"
                  required
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Parent Group / Subcategory</label>
                <input
                  type="text"
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Notes on usage of this account..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="p-2.5 bg-blue-950/40 border border-blue-800/60 rounded-xl text-[11px] text-blue-300">
                <p>
                  <strong>Note:</strong> Changes to Account Name, Code or Status take effect immediately across all reports and entry screens.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl cursor-pointer shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation with Linked Records Protection */}
      {deletingAccount && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2.5 bg-red-950/90 border border-red-800/80 rounded-xl text-red-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Account Confirmation</h3>
                <p className="text-xs text-slate-400">Are you sure you want to delete this account?</p>
              </div>
            </div>

            {/* Account Card Info */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Account Code:</span>
                <span className="font-mono font-bold text-blue-400">{deletingAccount.accountCode}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Account Title:</span>
                <span className="font-bold text-white">{deletingAccount.accountName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Category:</span>
                <span className="font-bold text-slate-300">{deletingAccount.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Current Balance:</span>
                <span className="font-mono font-bold text-emerald-400">{formatPKR(deletingAccount.currentBalance)}</span>
              </div>
            </div>

            {/* Linked Records Protection Check */}
            {deleteBlockReason ? (
              <div className="p-3 bg-amber-950/60 border border-amber-800/80 rounded-xl space-y-2 text-xs text-amber-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="font-semibold leading-relaxed">{deleteBlockReason}</p>
                </div>
                <p className="text-[11px] text-amber-300/80 pl-6">
                  Deactivating this account preserves all previous financial vouchers and ledger histories, while preventing it from being selected for new entries.
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-300 leading-relaxed">
                This account has no linked transactions and can be safely deleted. This action will permanently remove it from the Chart of Accounts.
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingAccount(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>

              {deleteBlockReason ? (
                <button
                  type="button"
                  onClick={handleDeactivateInstead}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors"
                >
                  Deactivate Account Instead
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors"
                >
                  Confirm Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
