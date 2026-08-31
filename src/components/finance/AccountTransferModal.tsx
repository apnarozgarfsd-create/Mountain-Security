import React, { useState } from 'react';
import { ArrowRightLeft, Check, AlertCircle, X, Wallet } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatPKR } from '../../utils/formatters';

interface AccountTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSourceAccountId?: string;
}

export const AccountTransferModal: React.FC<AccountTransferModalProps> = ({
  isOpen,
  onClose,
  defaultSourceAccountId,
}) => {
  const {
    financeAccounts,
    executeAccountTransfer,
    getAccountLiveBalance,
    currentUserRole,
  } = useApp();

  const activeAccounts = financeAccounts.filter((a) => a.status === 'active');

  const [fromAccountId, setFromAccountId] = useState<string>(
    defaultSourceAccountId || activeAccounts[0]?.id || ''
  );
  const [toAccountId, setToAccountId] = useState<string>(
    activeAccounts[1]?.id || activeAccounts[0]?.id || ''
  );
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>('Fund transfer for site operational expenses');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const fromBalance = fromAccountId ? getAccountLiveBalance(fromAccountId) : 0;
  const toBalance = toAccountId ? getAccountLiveBalance(toAccountId) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fromAccountId || !toAccountId) {
      setError('Please select both source and target accounts.');
      return;
    }

    if (fromAccountId === toAccountId) {
      setError('Source account and destination account cannot be the same.');
      return;
    }

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      setError('Please enter a valid transfer amount greater than 0.');
      return;
    }

    if (numericAmount > fromBalance) {
      const confirmed = window.confirm(
        `Source account balance (${formatPKR(fromBalance)}) is less than transfer amount (${formatPKR(numericAmount)}). This will result in a negative balance. Do you wish to continue?`
      );
      if (!confirmed) return;
    }

    executeAccountTransfer({
      fromAccountId,
      toAccountId,
      amount: numericAmount,
      date,
      description: description.trim() || 'Fund Transfer',
      createdBy: currentUserRole === 'Super Admin' ? 'Ali Akbar' : currentUserRole,
    });

    setSuccessMsg(`Successfully transferred ${formatPKR(numericAmount)} between accounts!`);
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Inter-Account Fund Transfer</h3>
              <p className="text-xs text-slate-400">Shift balance between Cash Drawers and Bank Accounts</p>
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

        {successMsg && (
          <div className="p-3 bg-emerald-950/70 border border-emerald-800 text-emerald-200 rounded-xl text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Transfer Route Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800/90">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Source Account (OUT) *
              </label>
              <select
                required
                value={fromAccountId}
                onChange={(e) => setFromAccountId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-medium focus:border-blue-500"
              >
                {activeAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.type.toUpperCase()})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] font-mono text-slate-400 flex items-center gap-1">
                <Wallet className="w-3 h-3 text-slate-500" />
                <span>Live Balance: </span>
                <strong className={fromBalance < 0 ? 'text-rose-400' : 'text-emerald-400'}>
                  {formatPKR(fromBalance)}
                </strong>
              </p>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Destination Account (IN) *
              </label>
              <select
                required
                value={toAccountId}
                onChange={(e) => setToAccountId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-medium focus:border-blue-500"
              >
                {activeAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.type.toUpperCase()})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] font-mono text-slate-400 flex items-center gap-1">
                <Wallet className="w-3 h-3 text-slate-500" />
                <span>Live Balance: </span>
                <strong className={toBalance < 0 ? 'text-rose-400' : 'text-emerald-400'}>
                  {formatPKR(toBalance)}
                </strong>
              </p>
            </div>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Transfer Amount (PKR) *
              </label>
              <input
                type="number"
                required
                min={1}
                placeholder="e.g. 150000"
                value={amount}
                onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono text-sm font-bold focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Transfer Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-blue-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Transfer Narration / Remarks
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Cash withdrawn for Ali Akbar field disbursement"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-blue-900/40"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Execute Transfer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
