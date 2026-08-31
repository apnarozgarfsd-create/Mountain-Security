import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  Edit2,
  Trash2,
  Archive,
  CheckCircle,
  Building2,
  DollarSign,
  X,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FinanceAccount, FinanceAccountType } from '../../types';
import { formatPKR } from '../../utils/formatters';

interface AccountManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccountStatement?: (accountId: string) => void;
}

export const AccountManagerModal: React.FC<AccountManagerModalProps> = ({
  isOpen,
  onClose,
  onSelectAccountStatement,
}) => {
  const {
    financeAccounts,
    addFinanceAccount,
    updateFinanceAccount,
    deleteFinanceAccount,
    getAccountLiveBalance,
  } = useApp();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [type, setType] = useState<FinanceAccountType>('cash');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [openingBalance, setOpeningBalance] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleOpenNew = () => {
    setEditingId(null);
    setName('');
    setType('cash');
    setBankName('');
    setAccountNumber('');
    setAccountHolder('');
    setOpeningBalance(0);
    setNotes('');
    setError(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (acc: FinanceAccount) => {
    setEditingId(acc.id);
    setName(acc.name);
    setType(acc.type);
    setBankName(acc.bankName || '');
    setAccountNumber(acc.accountNumber || '');
    setAccountHolder(acc.accountHolder || '');
    setOpeningBalance(acc.openingBalance);
    setNotes(acc.notes || '');
    setError(null);
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Account name is required (e.g. Bank - JazzCash, Cash - Ali Akbar).');
      return;
    }

    if (editingId) {
      updateFinanceAccount(editingId, {
        name: name.trim(),
        type,
        bankName: bankName.trim() || undefined,
        accountNumber: accountNumber.trim() || undefined,
        accountHolder: accountHolder.trim() || undefined,
        openingBalance: Number(openingBalance) || 0,
        notes: notes.trim() || undefined,
      });
    } else {
      addFinanceAccount({
        name: name.trim(),
        type,
        bankName: bankName.trim() || undefined,
        accountNumber: accountNumber.trim() || undefined,
        accountHolder: accountHolder.trim() || undefined,
        openingBalance: Number(openingBalance) || 0,
        notes: notes.trim() || undefined,
        status: 'active',
      });
    }

    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    const res = deleteFinanceAccount(id);
    if (!res.success && res.error) {
      setError(res.error);
    }
    setDeleteConfirmId(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Accounts & Fund Channels Manager
              </h3>
              <p className="text-xs text-slate-400">
                Dynamic, unlimited Cash Drawers, Bank Accounts, Petty Cash & Security Wallets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-950/70 border border-red-800 text-red-200 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Top Action Bar */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Total Accounts configured: <strong className="text-white">{financeAccounts.length}</strong>
          </p>
          <button
            onClick={handleOpenNew}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Account</span>
          </button>
        </div>

        {/* Create / Edit Form Drawer */}
        {isFormOpen && (
          <form
            onSubmit={handleSave}
            className="bg-slate-950 p-4 rounded-xl border border-blue-500/40 space-y-3 text-xs"
          >
            <h4 className="font-bold text-white flex items-center gap-2 text-xs">
              <span>{editingId ? 'Edit Account Details' : 'Create New Dynamic Account'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">
                  Account Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bank - JazzCash Main, Cash - Ali Akbar, Security - Uniform"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Account Type *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as FinanceAccountType)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500"
                >
                  <option value="cash">Cash / Drawer / Petty</option>
                  <option value="bank">Bank / Mobile Wallet</option>
                  <option value="other">Other / Security Hold</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Bank / Platform Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Meezan Bank, JazzCash, HBL"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Account / IBAN / Phone No
                </label>
                <input
                  type="text"
                  placeholder="e.g. 0300-1234567 / 0102938812"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Opening Balance (PKR)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold cursor-pointer"
              >
                {editingId ? 'Update Account' : 'Save Account'}
              </button>
            </div>
          </form>
        )}

        {/* Accounts List Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Account Title</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-right">Opening Bal</th>
                <th className="py-3 px-4 text-right">Live Balance (Derived)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {financeAccounts.map((acc) => {
                const liveBalance = getAccountLiveBalance(acc.id);
                return (
                  <tr key={acc.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-1.5 rounded-lg ${
                            acc.type === 'bank'
                              ? 'bg-blue-950 text-blue-400'
                              : 'bg-emerald-950 text-emerald-400'
                          }`}
                        >
                          {acc.type === 'bank' ? (
                            <Building2 className="w-4 h-4" />
                          ) : (
                            <DollarSign className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs">{acc.name}</p>
                          {acc.accountNumber && (
                            <p className="text-[11px] font-mono text-slate-400">
                              {acc.bankName ? `${acc.bankName} - ` : ''}
                              {acc.accountNumber}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] uppercase font-bold text-slate-300">
                        {acc.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">
                      {formatPKR(acc.openingBalance)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-sm">
                      <span className={liveBalance < 0 ? 'text-rose-400' : 'text-emerald-400'}>
                        {formatPKR(liveBalance)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          acc.status === 'active'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {acc.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(acc)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg cursor-pointer"
                        title="Edit Account"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(acc.id)}
                        className="p-1.5 bg-rose-950/70 hover:bg-rose-900 text-rose-300 rounded-lg cursor-pointer"
                        title="Delete / Archive Account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Delete Confirmation Alert */}
        {deleteConfirmId && (
          <div className="p-3.5 bg-rose-950/80 border border-rose-800 rounded-xl text-xs flex items-center justify-between">
            <span className="text-rose-200">
              Are you sure? Unused accounts will be deleted; accounts with transactions will be safely archived.
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
