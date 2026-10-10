import {
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Building,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CornerDownRight,
  Download,
  Edit2,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Folder,
  FolderOpen,
  FolderTree,
  History,
  Lock,
  Plus,
  Power,
  Printer,
  RefreshCw,
  Scale,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  Wallet,
  X,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  buildAccountTree,
  calculateAccountBalancesWithRollups,
  canDeleteAccount,
  canPostToAccount,
  formatCurrency,
  generateAccountLedger,
  isLeafAccount,
  validateAccountCodeUnique,
  validateParentChildRelationship,
} from '../../services/accountingService';
import { Account, AccountCategory, AccountNode, BalanceType } from '../../types';
import { formatPKR } from '../../utils/formatters';
import {
  ACCOUNT_NATURE_OPTIONS,
  CreateAccountModal,
  MSS_LOCATION_OPTIONS,
} from './CreateAccountModal';

export const ChartOfAccountsView: React.FC = () => {
  const {
    accounts,
    vouchers,
    currentUserRole,
    addAccount,
    updateAccount,
    deleteAccount,
    triggerPrint,
    logAudit,
    openingBatches,
    currentFiscalYear,
    setActiveTab,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [viewMode, setViewMode] = useState<'tree' | 'flat'>('tree');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
    // Expand Level 1 and Level 2 by default
    const set = new Set<string>();
    accounts.forEach((a) => {
      if (a.level <= 2) set.add(a.id);
    });
    return set;
  });

  // Modal States
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [selectedParentForAdd, setSelectedParentForAdd] = useState<Account | null>(null);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null);
  const [deleteBlockReason, setDeleteBlockReason] = useState<string | null>(null);
  const [selectedAccountForLedger, setSelectedAccountForLedger] = useState<Account | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importNotice, setImportNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'warning' | 'error'; message: string } | null>(null);

  // Form State for Add / Edit
  const [parentAccountId, setParentAccountId] = useState<string>('');
  const [accountCode, setAccountCode] = useState('');
  const [accountName, setAccountName] = useState('');
  const [category, setCategory] = useState<AccountCategory>('Expense');
  const [natureType, setNatureType] = useState<string>('');
  const [effectiveDate, setEffectiveDate] = useState<string>('');
  const [location, setLocation] = useState<string>(MSS_LOCATION_OPTIONS[0]);
  const [employeePartyType, setEmployeePartyType] = useState<
    'Staff' | 'Guard' | 'Officer' | 'Vendor' | 'Client' | 'General'
  >('General');
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [openingBalanceType, setOpeningBalanceType] = useState<BalanceType>('Debit');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Ledger Drawer State
  const [ledgerDateFrom, setLedgerDateFrom] = useState('');
  const [ledgerDateTo, setLedgerDateTo] = useState('');

  const isSuperAdmin = currentUserRole === 'Super Admin';
  const isAccountant = currentUserRole === 'Accountant';
  const canManageAccounts = isSuperAdmin || isAccountant;

  const categories: AccountCategory[] = ['Asset', 'Liability', 'Equity', 'Income', 'Expense'];

  // Calculate live rollup balances
  const balancesMap = useMemo(() => {
    return calculateAccountBalancesWithRollups(accounts, vouchers);
  }, [accounts, vouchers]);

  // Build the hierarchical tree
  const accountTree = useMemo(() => {
    return buildAccountTree(accounts, vouchers);
  }, [accounts, vouchers]);

  // Tree toggling
  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  const expandAll = () => {
    const all = new Set<string>();
    accounts.forEach((a) => all.add(a.id));
    setExpandedNodes(all);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  // Open Add modal under an optional parent
  const handleOpenAddModal = (parent?: Account) => {
    if (!canManageAccounts) {
      setActionNotice({
        type: 'warning',
        message: 'Permission denied. Only Super Admin and Accountant roles can create accounts.',
      });
      return;
    }

    setSelectedParentForAdd(parent || null);
    setIsAddAccountOpen(true);
  };

  // Open Edit modal
  const handleOpenEditModal = (account: Account) => {
    if (!canManageAccounts) {
      setActionNotice({
        type: 'warning',
        message: 'Permission denied. Only Super Admin and Accountant roles can modify accounts.',
      });
      return;
    }

    setFormError(null);
    setEditingAccount(account);
    setParentAccountId(account.parentId || '');
    setAccountCode(account.accountCode);
    setAccountName(account.accountName);
    setCategory(account.category);
    setNatureType(account.natureType || ACCOUNT_NATURE_OPTIONS[account.category]?.[0] || '');
    setEffectiveDate(account.effectiveDate || new Date().toISOString().split('T')[0]);
    setLocation(account.location || MSS_LOCATION_OPTIONS[0]);
    setEmployeePartyType(account.employeePartyType || 'General');
    setOpeningBalance(account.openingBalance || 0);
    setOpeningBalanceType(account.openingBalanceType || (account.category === 'Asset' || account.category === 'Expense' ? 'Debit' : 'Credit'));
    setStatus(account.status);
    setDescription(account.description || '');
  };

  // Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;
    setFormError(null);

    const trimmedCode = accountCode.trim();
    const trimmedName = accountName.trim();

    if (!trimmedCode) {
      setFormError('Account code is required.');
      return;
    }
    if (!trimmedName) {
      setFormError('Account name is required.');
      return;
    }

    if (!validateAccountCodeUnique(trimmedCode, editingAccount.id, accounts)) {
      setFormError(`Account code "${trimmedCode}" already exists on another account.`);
      return;
    }

    if (parentAccountId !== editingAccount.parentId) {
      const parentCheck = validateParentChildRelationship(editingAccount.id, parentAccountId || null, accounts);
      if (!parentCheck.isValid) {
        setFormError(parentCheck.error || 'Invalid parent account selected.');
        return;
      }
    }

    try {
      updateAccount(editingAccount.id, {
        accountCode: trimmedCode,
        accountName: trimmedName,
        category,
        parentId: parentAccountId || null,
        openingBalance: Number(openingBalance) || 0,
        openingBalanceType,
        status,
        description: description.trim() || undefined,
        natureType: natureType.trim() || undefined,
        effectiveDate: effectiveDate || undefined,
        location: location || undefined,
        employeePartyType: employeePartyType || undefined,
      });

      setEditingAccount(null);
      setActionNotice({
        type: 'success',
        message: `Account ${trimmedCode} (${trimmedName}) updated successfully.`,
      });
    } catch (err: any) {
      setFormError(err.message || 'Failed to update account.');
    }
  };

  // Toggle Status (Activate / Deactivate)
  const handleToggleStatus = (account: Account) => {
    if (!canManageAccounts) {
      setActionNotice({
        type: 'warning',
        message: 'Permission denied. Only Super Admin and Accountant roles can alter account status.',
      });
      return;
    }

    const nextStatus = account.status === 'Active' ? 'Inactive' : 'Active';

    if (nextStatus === 'Inactive') {
      const children = accounts.filter((a) => a.parentId === account.id && a.status === 'Active');
      if (children.length > 0) {
        setActionNotice({
          type: 'error',
          message: `Cannot deactivate account ${account.accountCode} because it has ${children.length} active child subaccounts. Deactivate or reassign child accounts first.`,
        });
        return;
      }
    }

    updateAccount(account.id, { status: nextStatus });
    setActionNotice({
      type: 'success',
      message: `Account ${account.accountCode} (${account.accountName}) status changed to ${nextStatus}.`,
    });
  };

  // Delete Check & Action
  const handlePromptDelete = (account: Account) => {
    if (!canManageAccounts) {
      setActionNotice({
        type: 'warning',
        message: 'Permission denied. Only Super Admin and Accountant roles can delete accounts.',
      });
      return;
    }

    const children = accounts.filter((a) => a.parentId === account.id);
    if (children.length > 0) {
      setDeleteBlockReason(
        `Account ${account.accountCode} contains ${children.length} dependent subaccounts. Delete or move those subaccounts before removing this account.`
      );
      setDeletingAccount(account);
      return;
    }

    if (account.isSystem && account.level === 1) {
      setDeleteBlockReason(
        `Account ${account.accountCode} is a protected Level 1 root category (${account.accountName}) and cannot be deleted.`
      );
      setDeletingAccount(account);
      return;
    }

    const linkedVouchers = vouchers.filter((v) =>
      v.entries.some((e) => e.accountId === account.id || e.accountCode === account.accountCode)
    );

    if (linkedVouchers.length > 0) {
      setDeleteBlockReason(
        `Account ${account.accountCode} has ${linkedVouchers.length} posted double-entry voucher transactions. To protect accounting audit integrity, you can deactivate this account, but permanent deletion is blocked.`
      );
      setDeletingAccount(account);
      return;
    }

    setDeleteBlockReason(null);
    setDeletingAccount(account);
  };

  const handleConfirmDelete = () => {
    if (!deletingAccount) return;
    const res = deleteAccount(deletingAccount.id);
    if (res.success) {
      setActionNotice({
        type: res.error ? 'warning' : 'success',
        message: res.error || `Account ${deletingAccount.accountCode} permanently removed.`,
      });
    } else {
      setActionNotice({
        type: 'error',
        message: res.error || 'Failed to delete account.',
      });
    }
    setDeletingAccount(null);
    setDeleteBlockReason(null);
  };

  // Export COA
  const handleExportJson = () => {
    const payload = {
      exportType: 'MSS_ERP_CHART_OF_ACCOUNTS',
      exportedAt: new Date().toISOString(),
      fiscalYear: currentFiscalYear,
      accountsCount: accounts.length,
      accounts,
    };
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MSS_Chart_of_Accounts_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    logAudit('COA Exported', 'Chart of Accounts', 'ALL', 'Exported full hierarchical Chart of Accounts JSON');
  };

  const handleExportCsv = () => {
    const headers = [
      'Account Code',
      'Account Name',
      'Level',
      'Category',
      'Parent Code',
      'Path',
      'Is Postable',
      'Status',
      'Opening Balance',
      'Opening Type',
      'Current Balance',
    ];
    const rows = accounts.map((a) => {
      const stats = balancesMap.get(a.id);
      return [
        `"${a.accountCode}"`,
        `"${a.accountName}"`,
        a.level,
        a.category,
        `"${a.parentCode || ''}"`,
        `"${a.path || ''}"`,
        a.isPostable ? 'Yes (Leaf)' : 'No (Summary)',
        a.status,
        a.openingBalance || 0,
        a.openingBalanceType || '',
        stats?.rollupBalance ?? a.currentBalance,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MSS_Chart_of_Accounts_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter accounts for flat view
  const filteredAccounts = useMemo(() => {
    return accounts.filter((a) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        a.accountCode.toLowerCase().includes(q) ||
        a.accountName.toLowerCase().includes(q) ||
        (a.path && a.path.toLowerCase().includes(q));

      const matchesCat = selectedCategory === 'All' || a.category === selectedCategory;
      const matchesLevel = selectedLevel === 'All' || String(a.level) === selectedLevel;
      const matchesStatus = statusFilter === 'All' || a.status === statusFilter;

      return matchesSearch && matchesCat && matchesLevel && matchesStatus;
    });
  }, [accounts, searchTerm, selectedCategory, selectedLevel, statusFilter]);

  // Totals
  const totalAssets = useMemo(() => {
    const root = accountTree.find((r) => r.category === 'Asset');
    return root ? root.rollupBalance : 0;
  }, [accountTree]);

  const totalLiabilities = useMemo(() => {
    const root = accountTree.find((r) => r.category === 'Liability');
    return root ? root.rollupBalance : 0;
  }, [accountTree]);

  const totalEquity = useMemo(() => {
    const root = accountTree.find((r) => r.category === 'Equity');
    return root ? root.rollupBalance : 0;
  }, [accountTree]);

  const totalIncome = useMemo(() => {
    const root = accountTree.find((r) => r.category === 'Income');
    return root ? root.rollupBalance : 0;
  }, [accountTree]);

  const totalExpenses = useMemo(() => {
    const root = accountTree.find((r) => r.category === 'Expense');
    return root ? root.rollupBalance : 0;
  }, [accountTree]);

  // Selected ledger data
  const selectedLedgerData = useMemo(() => {
    if (!selectedAccountForLedger) return null;
    return generateAccountLedger(
      selectedAccountForLedger,
      vouchers,
      ledgerDateFrom || undefined,
      ledgerDateTo || undefined
    );
  }, [selectedAccountForLedger, vouchers, ledgerDateFrom, ledgerDateTo]);

  // Recursive Tree Node Renderer
  const renderTreeNode = (node: AccountNode, depth: number = 0) => {
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const q = searchTerm.toLowerCase().trim();
    const isMatched =
      !q ||
      node.accountCode.toLowerCase().includes(q) ||
      node.accountName.toLowerCase().includes(q) ||
      (node.path && node.path.toLowerCase().includes(q));

    const matchesCat = selectedCategory === 'All' || node.category === selectedCategory;
    const matchesLevel = selectedLevel === 'All' || String(node.level) === selectedLevel;
    const matchesStatus = statusFilter === 'All' || node.status === statusFilter;

    // Check if any children match filter
    const hasMatchingDescendant = (n: AccountNode): boolean => {
      const mSearch =
        !q ||
        n.accountCode.toLowerCase().includes(q) ||
        n.accountName.toLowerCase().includes(q) ||
        (n.path && n.path.toLowerCase().includes(q));
      const mCat = selectedCategory === 'All' || n.category === selectedCategory;
      const mStatus = statusFilter === 'All' || n.status === statusFilter;
      if (mSearch && mCat && mStatus) return true;
      return n.children.some(hasMatchingDescendant);
    };

    if (!isMatched && !hasMatchingDescendant(node)) {
      return null;
    }

    const levelColors: Record<number, { bg: string; text: string; border: string }> = {
      1: { bg: 'bg-blue-950/70', text: 'text-blue-300', border: 'border-blue-800/80' },
      2: { bg: 'bg-purple-950/60', text: 'text-purple-300', border: 'border-purple-800/60' },
      3: { bg: 'bg-emerald-950/50', text: 'text-emerald-300', border: 'border-emerald-800/50' },
      4: { bg: 'bg-slate-900', text: 'text-slate-300', border: 'border-slate-800' },
    };

    const levelColor = levelColors[node.level] || {
      bg: 'bg-slate-900',
      text: 'text-slate-400',
      border: 'border-slate-800',
    };

    return (
      <React.Fragment key={node.id}>
        <tr
          className={`group transition-colors border-b border-slate-800/60 ${
            node.level === 1
              ? 'bg-slate-900/90 hover:bg-slate-900 font-bold'
              : node.level === 2
              ? 'bg-slate-950/70 hover:bg-slate-900/50 font-semibold'
              : 'hover:bg-slate-900/40 text-xs'
          } ${node.status === 'Inactive' ? 'opacity-60' : ''}`}
        >
          {/* Account Code & Expand Arrow */}
          <td className="py-2.5 px-3 whitespace-nowrap">
            <div className="flex items-center gap-1.5" style={{ paddingLeft: `${depth * 20}px` }}>
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => toggleNode(node.id)}
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
                  title={isExpanded ? 'Collapse subaccounts' : 'Expand subaccounts'}
                >
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-cyan-400" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              ) : (
                <span className="w-6 inline-block text-slate-600 text-center">•</span>
              )}

              <span
                className={`font-mono px-2 py-0.5 rounded text-[11px] font-bold border ${levelColor.bg} ${levelColor.text} ${levelColor.border}`}
              >
                {node.accountCode}
              </span>
            </div>
          </td>

          {/* Account Name & Tree Icon */}
          <td className="py-2.5 px-3">
            <div className="flex items-center gap-2">
              {hasChildren ? (
                isExpanded ? (
                  <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" />
                ) : (
                  <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                )
              ) : (
                <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              )}

              <div>
                <span
                  className={`${
                    node.level === 1
                      ? 'text-white text-sm tracking-wide uppercase'
                      : node.level === 2
                      ? 'text-slate-100 font-bold'
                      : 'text-slate-200'
                  }`}
                >
                  {node.accountName}
                </span>

                {node.description && (
                  <span className="text-[10px] text-slate-500 block truncate max-w-xs">{node.description}</span>
                )}
              </div>
            </div>
          </td>

          {/* Level Badge */}
          <td className="py-2.5 px-3 text-center whitespace-nowrap">
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${levelColor.bg} ${levelColor.text} ${levelColor.border}`}
            >
              Lvl {node.level}
            </span>
          </td>

          {/* Account Category */}
          <td className="py-2.5 px-3 whitespace-nowrap">
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                node.category === 'Asset'
                  ? 'bg-blue-950 text-blue-300 border border-blue-900'
                  : node.category === 'Liability'
                  ? 'bg-amber-950 text-amber-300 border border-amber-900'
                  : node.category === 'Equity'
                  ? 'bg-purple-950 text-purple-300 border border-purple-900'
                  : node.category === 'Income'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-900'
                  : 'bg-red-950 text-red-300 border border-red-900'
              }`}
            >
              {node.category}
            </span>
          </td>

          {/* Posting Eligibility: Leaf vs Summary */}
          <td className="py-2.5 px-3 text-center whitespace-nowrap">
            {node.isPostable ? (
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                Leaf (Postable)
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                Summary ({node.leafCount})
              </span>
            )}
          </td>

          {/* Status */}
          <td className="py-2.5 px-3 text-center whitespace-nowrap">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                node.status === 'Active'
                  ? 'text-emerald-300 bg-emerald-950/80 border border-emerald-800/80'
                  : 'text-slate-400 bg-slate-800 border border-slate-700'
              }`}
            >
              {node.status}
            </span>
          </td>

          {/* Consolidated / Direct Live Balance */}
          <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">
            <div>
              <span
                className={`font-bold ${
                  node.rollupBalance > 0
                    ? node.category === 'Expense' || node.category === 'Asset'
                      ? 'text-emerald-400'
                      : 'text-cyan-400'
                    : node.rollupBalance < 0
                    ? 'text-red-400'
                    : 'text-slate-400'
                }`}
              >
                {formatPKR(Math.abs(node.rollupBalance))}
              </span>
              <span className="text-[10px] text-slate-500 ml-1">
                {node.rollupBalance >= 0
                  ? node.category === 'Asset' || node.category === 'Expense'
                    ? 'Dr'
                    : 'Cr'
                  : node.category === 'Asset' || node.category === 'Expense'
                  ? 'Cr'
                  : 'Dr'}
              </span>
            </div>
            {hasChildren && node.directBalance !== 0 && (
              <div className="text-[9px] text-slate-500">
                Direct: {formatPKR(Math.abs(node.directBalance))}
              </div>
            )}
          </td>

          {/* Row Actions */}
          <td className="py-2.5 px-3 text-right whitespace-nowrap space-x-1">
            {/* Add Subaccount Button */}
            {canManageAccounts && (
              <button
                type="button"
                onClick={() => handleOpenAddModal(node)}
                className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-950/50 rounded transition-colors cursor-pointer"
                title={`Add Subaccount under ${node.accountCode}`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}

            {/* View Ledger */}
            <button
              type="button"
              onClick={() => {
                setSelectedAccountForLedger(node);
                setLedgerDateFrom('');
                setLedgerDateTo('');
              }}
              className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-950/50 rounded transition-colors cursor-pointer"
              title="View Account Ledger Statement"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>

            {/* Edit */}
            {canManageAccounts && (
              <button
                type="button"
                onClick={() => handleOpenEditModal(node)}
                className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-950/50 rounded transition-colors cursor-pointer"
                title="Edit Account Details"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Toggle Active / Inactive */}
            {canManageAccounts && !node.isSystem && (
              <button
                type="button"
                onClick={() => handleToggleStatus(node)}
                className={`p-1.5 rounded transition-colors cursor-pointer ${
                  node.status === 'Active'
                    ? 'text-slate-400 hover:text-amber-400 hover:bg-amber-950/50'
                    : 'text-slate-500 hover:text-emerald-400 hover:bg-emerald-950/50'
                }`}
                title={node.status === 'Active' ? 'Deactivate Account' : 'Activate Account'}
              >
                <Power className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Delete */}
            {canManageAccounts && !node.isSystem && (
              <button
                type="button"
                onClick={() => handlePromptDelete(node)}
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/50 rounded transition-colors cursor-pointer"
                title="Delete Account"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </td>
        </tr>

        {/* Render child accounts if expanded */}
        {hasChildren && isExpanded && node.children.map((child) => renderTreeNode(child, depth + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white uppercase flex items-center gap-2">
            <FolderTree className="w-6 h-6 text-amber-400" />
            <span>Multi-Level Chart of Accounts (COA)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Hierarchical ledger architecture (Level 1 Main → Level 2 Sub → Level 3 Group → Level 4 Leaf Accounts) with consolidated rollups.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canManageAccounts && (
            <button
              onClick={() => handleOpenAddModal()}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Account (نیا کھاتہ)</span>
            </button>
          )}

          <button
            onClick={() => {
              triggerPrint({
                type: 'general-report',
                data: {
                  title: 'Mountain Security Services - Chart of Accounts Directory',
                  subtitle: `Hierarchical Chart of Accounts Directory (${accounts.length} Accounts)`,
                  accounts,
                  vouchers,
                },
                title: 'MSS Chart of Accounts Directory',
              });
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print COA Directory</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-colors cursor-pointer"
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleExportJson}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-colors cursor-pointer"
            title="Export JSON"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Action Notice Alert */}
      {actionNotice && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
            actionNotice.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
              : actionNotice.type === 'warning'
              ? 'bg-amber-950/60 border-amber-800 text-amber-200'
              : 'bg-red-950/60 border-red-800 text-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span>{actionNotice.message}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="p-1 hover:bg-slate-800/50 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Executive Financial Position KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-400 uppercase">1. Assets</span>
            <Wallet className="w-4 h-4 text-blue-400 opacity-80" />
          </div>
          <div className="text-base sm:text-lg font-black font-mono text-white mt-1">
            {formatPKR(Math.abs(totalAssets))}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Cash, Bank, Receivables & Store</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-400 uppercase">2. Liabilities</span>
            <Building className="w-4 h-4 text-amber-400 opacity-80" />
          </div>
          <div className="text-base sm:text-lg font-black font-mono text-white mt-1">
            {formatPKR(Math.abs(totalLiabilities))}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Wages, Tailors & Vendor Payables</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-400 uppercase">3. Equity</span>
            <Scale className="w-4 h-4 text-purple-400 opacity-80" />
          </div>
          <div className="text-base sm:text-lg font-black font-mono text-white mt-1">
            {formatPKR(Math.abs(totalEquity))}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Contributed Capital & Retained Reserves</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-400 uppercase">4. Income</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400 opacity-80" />
          </div>
          <div className="text-base sm:text-lg font-black font-mono text-white mt-1">
            {formatPKR(Math.abs(totalIncome))}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Client Guarding Invoicing Revenue</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-red-400 uppercase">5. Expenses</span>
            <ArrowDownRight className="w-4 h-4 text-red-400 opacity-80" />
          </div>
          <div className="text-base sm:text-lg font-black font-mono text-white mt-1">
            {formatPKR(Math.abs(totalExpenses))}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Guard Salaries, Petrol, Uniforms & Rent</div>
        </div>
      </div>

      {/* Search, Filter & View Controls */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full lg:w-auto flex-1">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Code (e.g. 1111), Name, Path..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-hidden"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Level Filter */}
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden"
          >
            <option value="All">All Levels</option>
            <option value="1">Level 1 (Main Root)</option>
            <option value="2">Level 2 (Sub-Account)</option>
            <option value="3">Level 3 (Group Account)</option>
            <option value="4">Level 4 (Leaf Accounts)</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden"
          >
            <option value="All">All Status</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>
        </div>

        {/* Tree Tools & View Toggle */}
        <div className="flex items-center gap-2 self-end lg:self-auto">
          {viewMode === 'tree' && (
            <>
              <button
                type="button"
                onClick={expandAll}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] font-semibold rounded-lg border border-slate-800 cursor-pointer"
              >
                Expand All
              </button>
              <button
                type="button"
                onClick={collapseAll}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] font-semibold rounded-lg border border-slate-800 cursor-pointer"
              >
                Collapse All
              </button>
            </>
          )}

          <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('tree')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                viewMode === 'tree' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tree View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('flat')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                viewMode === 'flat' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Flat View
            </button>
          </div>
        </div>
      </div>

      {/* Main Accounts Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-900/95 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-bold">
                <th className="py-3 px-3">Account Code</th>
                <th className="py-3 px-3">Account Title & Description</th>
                <th className="py-3 px-3 text-center">Level</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3 text-center">Posting Status</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Consolidated Balance</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {viewMode === 'tree' ? (
                accountTree.map((rootNode) => renderTreeNode(rootNode, 0))
              ) : filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <FolderTree className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                    <p className="font-semibold text-slate-400">No accounts match the selected filters</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Try resetting the search keyword or category filter.</p>
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((account) => {
                  const stats = balancesMap.get(account.id);
                  const bal = stats ? stats.rollupBalance : account.currentBalance;

                  return (
                    <tr
                      key={account.id}
                      className={`hover:bg-slate-900/50 transition-colors ${
                        account.status === 'Inactive' ? 'opacity-60' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-amber-400">
                        {account.accountCode}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-200">{account.accountName}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-sm">
                          {account.path || `${account.category} > ${account.accountName}`}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
                          Lvl {account.level}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            account.category === 'Asset'
                              ? 'bg-blue-950 text-blue-300 border border-blue-900'
                              : account.category === 'Liability'
                              ? 'bg-amber-950 text-amber-300 border border-amber-900'
                              : account.category === 'Equity'
                              ? 'bg-purple-950 text-purple-300 border border-purple-900'
                              : account.category === 'Income'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-900'
                              : 'bg-red-950 text-red-300 border border-red-900'
                          }`}
                        >
                          {account.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {account.isPostable ? (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                            Leaf (Postable)
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                            Summary
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            account.status === 'Active'
                              ? 'text-emerald-300 bg-emerald-950/80 border border-emerald-800/80'
                              : 'text-slate-400 bg-slate-800 border border-slate-700'
                          }`}
                        >
                          {account.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">
                        <span
                          className={
                            bal > 0
                              ? account.category === 'Expense' || account.category === 'Asset'
                                ? 'text-emerald-400'
                                : 'text-cyan-400'
                              : bal < 0
                              ? 'text-red-400'
                              : 'text-slate-400'
                          }
                        >
                          {formatPKR(Math.abs(bal))}
                        </span>
                        <span className="text-[10px] text-slate-500 ml-1">
                          {bal >= 0
                            ? account.category === 'Asset' || account.category === 'Expense'
                              ? 'Dr'
                              : 'Cr'
                            : account.category === 'Asset' || account.category === 'Expense'
                            ? 'Cr'
                            : 'Dr'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right space-x-1 whitespace-nowrap">
                        {canManageAccounts && (
                          <button
                            type="button"
                            onClick={() => handleOpenAddModal(account)}
                            className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-950/50 rounded transition-colors cursor-pointer"
                            title="Add Subaccount"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAccountForLedger(account);
                            setLedgerDateFrom('');
                            setLedgerDateTo('');
                          }}
                          className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-950/50 rounded transition-colors cursor-pointer"
                          title="View Ledger"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {canManageAccounts && (
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(account)}
                            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-950/50 rounded transition-colors cursor-pointer"
                            title="Edit Account"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {canManageAccounts && !account.isSystem && (
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(account)}
                            className="p-1.5 text-slate-400 hover:text-amber-400 rounded cursor-pointer"
                            title="Toggle Status"
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {canManageAccounts && !account.isSystem && (
                          <button
                            type="button"
                            onClick={() => handlePromptDelete(account)}
                            className="p-1.5 text-slate-400 hover:text-red-400 rounded cursor-pointer"
                            title="Delete Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Final-Level Modal: Create New Account (Chart of Accounts) */}
      <CreateAccountModal
        isOpen={isAddAccountOpen}
        onClose={() => {
          setIsAddAccountOpen(false);
          setSelectedParentForAdd(null);
        }}
        initialParentAccount={selectedParentForAdd}
        onAccountCreated={(newAcc) => {
          setActionNotice({
            type: 'success',
            message: `Account ${newAcc.accountCode} - ${newAcc.accountName} (Level ${newAcc.level}) successfully created.`,
          });
        }}
      />

      {/* Modal: Edit Account */}
      {editingAccount && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-400" />
                <span>Edit Account: {editingAccount.accountCode}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingAccount(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-950/80 border border-red-800 rounded-lg text-xs text-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Parent Account */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">
                    Parent Account {editingAccount.level === 1 ? '(Root Level 1)' : ''}
                  </label>
                  <select
                    value={parentAccountId}
                    onChange={(e) => setParentAccountId(e.target.value)}
                    disabled={editingAccount.isSystem && editingAccount.level === 1}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-medium focus:outline-hidden disabled:opacity-60"
                  >
                    <option value="">None (Top-Level Category Account)</option>
                    {accounts
                      .filter((a) => a.id !== editingAccount.id)
                      .map((a) => (
                        <option key={a.id} value={a.id}>
                          {'— '.repeat(a.level - 1)} {a.accountCode} - {a.accountName} (Lvl {a.level} {a.category})
                        </option>
                      ))}
                  </select>
                </div>

                {/* Account Code */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Account Code *</label>
                  <input
                    type="text"
                    required
                    value={accountCode}
                    onChange={(e) => setAccountCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono font-bold focus:outline-hidden"
                  />
                </div>

                {/* Account Category */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Account Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as AccountCategory)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-medium focus:outline-hidden"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Account Name */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Account Name / Title *</label>
                  <input
                    type="text"
                    required
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-medium focus:outline-hidden"
                  />
                </div>

                {/* Account Nature / Type */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">A/C Nature / Type</label>
                  <input
                    type="text"
                    value={natureType}
                    onChange={(e) => setNatureType(e.target.value)}
                    placeholder="e.g. SALARY PAYABLES A/C, Cash in Hand..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-hidden"
                  />
                </div>

                {/* Effective Date */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Effective Date</label>
                  <input
                    type="date"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono focus:outline-hidden"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Location</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-hidden"
                  >
                    {MSS_LOCATION_OPTIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Employee / Party Type */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Employee / Party Type</label>
                  <select
                    value={employeePartyType}
                    onChange={(e) => setEmployeePartyType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-hidden"
                  >
                    <option value="Staff">STAFF</option>
                    <option value="Guard">GUARD</option>
                    <option value="Officer">OFFICER</option>
                    <option value="Vendor">VENDOR</option>
                    <option value="Client">CLIENT</option>
                    <option value="General">GENERAL</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-hidden"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Description / Notes</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Account Confirmation */}
      {deletingAccount && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400 pb-3 border-b border-slate-800">
              <div className="p-2.5 bg-red-950/80 border border-red-800 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {deleteBlockReason ? 'Cannot Delete Account' : 'Confirm Permanent Deletion'}
                </h3>
                <p className="text-xs text-slate-400">Chart of Accounts Governance</p>
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Account Code:</span>
                <span className="font-mono text-amber-400 font-bold">{deletingAccount.accountCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Account Title:</span>
                <span className="font-bold text-white">{deletingAccount.accountName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Hierarchy Level:</span>
                <span className="text-slate-300">Level {deletingAccount.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Category:</span>
                <span className="text-slate-300">{deletingAccount.category}</span>
              </div>
            </div>

            {deleteBlockReason ? (
              <div className="p-3 bg-amber-950/60 border border-amber-800/80 rounded-xl text-xs text-amber-200">
                <p className="font-semibold mb-1">Deletion Blocked:</p>
                <p>{deleteBlockReason}</p>
              </div>
            ) : (
              <p className="text-xs text-slate-300">
                Are you sure you want to permanently delete account <strong>{deletingAccount.accountCode}</strong>? This action cannot be undone.
              </p>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setDeletingAccount(null);
                  setDeleteBlockReason(null);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg cursor-pointer text-xs"
              >
                {deleteBlockReason ? 'Close' : 'Cancel'}
              </button>

              {!deleteBlockReason && (
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg shadow-md cursor-pointer text-xs"
                >
                  Yes, Delete Account
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal / Drawer: Account Ledger Statement */}
      {selectedAccountForLedger && selectedLedgerData && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-4 max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  <span>
                    General Account Ledger: {selectedAccountForLedger.accountCode} — {selectedAccountForLedger.accountName}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Category: <span className="text-amber-400 font-semibold">{selectedAccountForLedger.category}</span> | Level: {selectedAccountForLedger.level} | Path: {selectedAccountForLedger.path || selectedAccountForLedger.accountName}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    triggerPrint({
                      type: 'account-ledger',
                      data: {
                        account: selectedAccountForLedger,
                        ledger: selectedLedgerData,
                      },
                      title: `Account Ledger: ${selectedAccountForLedger.accountCode}`,
                    });
                  }}
                  className="p-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer"
                  title="Print Ledger"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAccountForLedger(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Date Filters & Quick Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Opening Balance</div>
                <div className="font-mono font-bold text-slate-200 mt-0.5">
                  {formatPKR(selectedLedgerData.openingBalance)} ({selectedLedgerData.openingType})
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Debits</div>
                <div className="font-mono font-bold text-emerald-400 mt-0.5">
                  {formatPKR(selectedLedgerData.totalDebit)}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Credits</div>
                <div className="font-mono font-bold text-amber-400 mt-0.5">
                  {formatPKR(selectedLedgerData.totalCredit)}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Closing Balance</div>
                <div className="font-mono font-bold text-cyan-400 mt-0.5">
                  {formatPKR(selectedLedgerData.closingBalance)} ({selectedLedgerData.closingType})
                </div>
              </div>
            </div>

            {/* Ledger Transactions Table */}
            <div className="flex-1 overflow-y-auto border border-slate-800 rounded-xl bg-slate-950">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-bold sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Voucher #</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Narration & Payee</th>
                    <th className="py-2.5 px-3 text-right">Debit (PKR)</th>
                    <th className="py-2.5 px-3 text-right">Credit (PKR)</th>
                    <th className="py-2.5 px-3 text-right">Running Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {/* Opening Balance Row */}
                  <tr className="bg-slate-900/40 font-semibold text-slate-400">
                    <td className="py-2 px-3 italic">Opening</td>
                    <td className="py-2 px-3">—</td>
                    <td className="py-2 px-3">OB</td>
                    <td className="py-2 px-3">Opening balance carried forward</td>
                    <td className="py-2 px-3 text-right font-mono">
                      {selectedLedgerData.openingType === 'Debit' ? formatPKR(selectedLedgerData.openingBalance) : '—'}
                    </td>
                    <td className="py-2 px-3 text-right font-mono">
                      {selectedLedgerData.openingType === 'Credit' ? formatPKR(selectedLedgerData.openingBalance) : '—'}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-300">
                      {formatPKR(selectedLedgerData.openingBalance)}
                    </td>
                  </tr>

                  {selectedLedgerData.rows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        No transactions recorded for this account.
                      </td>
                    </tr>
                  ) : (
                    selectedLedgerData.rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-2 px-3 whitespace-nowrap text-slate-300">{row.date}</td>
                        <td className="py-2 px-3 whitespace-nowrap font-mono font-bold text-cyan-400">
                          {row.voucherNo}
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                            {row.voucherType}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-200">
                          <div>{row.narration}</div>
                          {row.partyName && (
                            <div className="text-[10px] text-amber-400 font-semibold">Party: {row.partyName}</div>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-emerald-400">
                          {row.debit > 0 ? formatPKR(row.debit) : '—'}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-amber-400">
                          {row.credit > 0 ? formatPKR(row.credit) : '—'}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-white">
                          {formatPKR(Math.abs(row.balance))}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedAccountForLedger(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Close Ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
