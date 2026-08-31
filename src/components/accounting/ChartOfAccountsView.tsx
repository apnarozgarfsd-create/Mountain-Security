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
  Pencil,
  Plus,
  Printer,
  Search,
  Trash2,
  Wallet,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Account, AccountCategory } from '../../types';
import { formatPKR } from '../../utils/formatters';

export const ChartOfAccountsView: React.FC = () => {
  const { accounts, vouchers, addAccount, updateAccount, deleteAccount, triggerPrint } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null);
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

  // Balance totals
  const totalAssets = accounts
    .filter((a) => a.category === 'Asset')
    .reduce((sum, a) => sum + a.currentBalance, 0);

  const totalLiabilities = accounts
    .filter((a) => a.category === 'Liability')
    .reduce((sum, a) => sum + a.currentBalance, 0);

  const totalEquity = accounts
    .filter((a) => a.category === 'Equity')
    .reduce((sum, a) => sum + a.currentBalance, 0);

  const totalIncome = accounts
    .filter((a) => a.category === 'Income')
    .reduce((sum, a) => sum + a.currentBalance, 0);

  const totalExpense = accounts
    .filter((a) => a.category === 'Expense')
    .reduce((sum, a) => sum + a.currentBalance, 0);

  const handleOpenLedger = (acc: Account) => {
    setSelectedAccountForLedger(acc);
  };

  const getAccountLedgerRows = (acc: Account) => {
    let runningBalance = acc.openingBalance || 0;
    let totalDebit = 0;
    let totalCredit = 0;

    const rows: any[] = [];

    // Filter all posted vouchers with an entry for this account
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
      openingBalance: acc.openingBalance || 0,
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

  const handleAddAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAccount({
      accountCode,
      accountName,
      category,
      subcategory: subcategory || `${category} Account`,
      openingBalance,
      isSystem: false,
      status: 'Active',
      description,
    });
    setIsAddAccountOpen(false);
    setAccountCode('');
    setAccountName('');
    setDescription('');
  };

  const filteredAccounts = accounts.filter((a) => {
    const matchesSearch =
      a.accountCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.subcategory.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || a.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white uppercase flex items-center gap-2">
            <Wallet className="w-6 h-6 text-emerald-400" />
            <span>Chart of Accounts & General Ledgers</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            5-tier accounting tree. Click any account to inspect transaction ledger and generate print statements.
          </p>
        </div>

        <button
          onClick={() => {
            const nextCode = `50${String(accounts.length + 1).padStart(2, '0')}`;
            setAccountCode(nextCode);
            setIsAddAccountOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Account</span>
        </button>
      </div>

      {/* Financial Structure Summary Pills */}
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
          <div className="text-lg font-black text-emerald-400 mt-0.5">{formatPKR(totalIncome)}</div>
        </div>
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase">5000 • Total Expenses</span>
          <div className="text-lg font-black text-amber-400 mt-0.5">{formatPKR(totalExpense)}</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Code (e.g. 1010), Title, Subcategory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 ${
              selectedCategory === 'All' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            All Accounts
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 ${
                selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {cat}s
            </button>
          ))}
        </div>
      </div>

      {/* Accounts List & Ledger Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Accounts Tree (7 cols) */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="p-3.5 bg-slate-900/80 border-b border-slate-800 font-bold text-xs text-slate-200 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-blue-400" />
              <span>Chart of Accounts Directory ({filteredAccounts.length})</span>
            </span>
            <span className="text-[10px] text-slate-400">Click to view Ledger</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-900/50 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <th className="py-2.5 px-3">Code</th>
                  <th className="py-2.5 px-3">Account Title & Group</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Current Balance</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredAccounts.map((acc) => {
                  const isSelected = selectedAccountForLedger?.id === acc.id;
                  return (
                    <tr
                      key={acc.id}
                      onClick={() => handleOpenLedger(acc)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-950/50 text-white' : 'hover:bg-slate-900/60'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-400">{acc.accountCode}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-200">{acc.accountName}</div>
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
                      <td className="py-2.5 px-3 text-right font-black font-mono text-slate-100">
                        {formatPKR(acc.currentBalance)}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrintLedger(acc);
                          }}
                          className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
                          title="Print Ledger"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Selected Account Ledger Details (5 cols) */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          {selectedAccountForLedger ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-400 font-mono">
                    {selectedAccountForLedger.accountCode} • {selectedAccountForLedger.category}
                  </span>
                  <h3 className="font-bold text-sm text-white">{selectedAccountForLedger.accountName}</h3>
                </div>

                <button
                  onClick={() => handlePrintLedger(selectedAccountForLedger)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Ledger</span>
                </button>
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
                        <div className="text-center py-6 text-slate-500 text-xs">
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
            <div className="py-20 text-center text-slate-500 text-xs">
              <FolderTree className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
              <p className="font-bold text-slate-400">Select an Account</p>
              <p className="mt-1">Click on any account in the list to view its real-time transaction ledger.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add Custom Account */}
      {isAddAccountOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-5 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-400" />
              <span>Create Chart of Account</span>
            </h3>

            <form onSubmit={handleAddAccountSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Account Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as AccountCategory)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-bold"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
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
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Opening Balance (PKR)</label>
                  <input
                    type="number"
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono"
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
                  placeholder="e.g. Weapon Ammunition Licensing Fee"
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Subcategory / Group</label>
                <input
                  type="text"
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  placeholder="e.g. Legal & Licensing"
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Notes on usage of this account..."
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddAccountOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg cursor-pointer shadow-md"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
