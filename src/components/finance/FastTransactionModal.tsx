import React, { useState, useEffect } from 'react';
import {
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  Check,
  AlertCircle,
  X,
  User,
  Tag,
  Wallet,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CashTransaction, TransactionDirection, PaymentMode } from '../../types';
import { formatPKR } from '../../utils/formatters';

interface FastTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTransaction?: CashTransaction | null;
  defaultAccountId?: string;
  defaultDirection?: TransactionDirection;
}

export const FastTransactionModal: React.FC<FastTransactionModalProps> = ({
  isOpen,
  onClose,
  editingTransaction,
  defaultAccountId,
  defaultDirection = 'OUT',
}) => {
  const {
    financeAccounts,
    expenseCategories,
    parties,
    addCashTransaction,
    updateCashTransaction,
    getAccountLiveBalance,
    currentUserRole,
  } = useApp();

  const activeAccounts = financeAccounts.filter((a) => a.status === 'active');

  const [direction, setDirection] = useState<TransactionDirection>(defaultDirection);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [accountId, setAccountId] = useState<string>(
    defaultAccountId || activeAccounts[0]?.id || ''
  );
  const [categoryId, setCategoryId] = useState<string>(expenseCategories[0]?.id || '');
  const [subcategoryName, setSubcategoryName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [amount, setAmount] = useState<number | ''>('');
  const [partyId, setPartyId] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Cash');
  const [referenceNo, setReferenceNo] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Sync state if editing
  useEffect(() => {
    if (editingTransaction) {
      setDirection(editingTransaction.direction);
      setDate(editingTransaction.date);
      setAccountId(editingTransaction.accountId);
      setCategoryId(editingTransaction.categoryId);
      setSubcategoryName(editingTransaction.subcategoryName || '');
      setDescription(editingTransaction.description);
      setAmount(editingTransaction.amount);
      setPartyId(editingTransaction.partyId || '');
      setPaymentMode(editingTransaction.paymentMode || 'Cash');
      setReferenceNo(editingTransaction.referenceNo || '');
      setNotes(editingTransaction.notes || '');
    } else {
      setDirection(defaultDirection);
      setDate(new Date().toISOString().split('T')[0]);
      if (defaultAccountId) setAccountId(defaultAccountId);
      else if (activeAccounts.length > 0) setAccountId(activeAccounts[0].id);
      if (expenseCategories.length > 0) setCategoryId(expenseCategories[0].id);
      setSubcategoryName('');
      setDescription('');
      setAmount('');
      setPartyId('');
      setPaymentMode('Cash');
      setReferenceNo('');
      setNotes('');
    }
  }, [editingTransaction, defaultAccountId, defaultDirection, isOpen]);

  if (!isOpen) return null;

  const currentCategory = expenseCategories.find((c) => c.id === categoryId);
  const selectedAccount = financeAccounts.find((a) => a.id === accountId);
  const selectedAccountBalance = accountId ? getAccountLiveBalance(accountId) : 0;
  const selectedParty = parties.find((p) => p.id === partyId);

  const handleSave = (addAnother: boolean = false) => {
    setError(null);

    if (!accountId) {
      setError('Please select an account.');
      return;
    }

    if (!categoryId) {
      setError('Please select a Head A/C category.');
      return;
    }

    if (!description.trim()) {
      setError('Please enter a description or particulars for this transaction.');
      return;
    }

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }

    if (editingTransaction) {
      updateCashTransaction(editingTransaction.id, {
        direction,
        date,
        accountId,
        categoryId,
        subcategoryName: subcategoryName.trim() || undefined,
        description: description.trim(),
        amount: numAmount,
        partyId: partyId || undefined,
        paymentMode,
        referenceNo: referenceNo.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setSuccessToast('Transaction updated successfully!');
      setTimeout(() => {
        onClose();
      }, 600);
    } else {
      addCashTransaction({
        direction,
        date,
        accountId,
        categoryId,
        subcategoryName: subcategoryName.trim() || undefined,
        description: description.trim(),
        amount: numAmount,
        partyId: partyId || undefined,
        paymentMode,
        referenceNo: referenceNo.trim() || undefined,
        notes: notes.trim() || undefined,
        createdBy: currentUserRole === 'Super Admin' ? 'Ali Akbar' : currentUserRole,
      });

      if (addAnother) {
        setSuccessToast(`Logged ${formatPKR(numAmount)}! Ready for next entry.`);
        setAmount('');
        setDescription('');
        setReferenceNo('');
        setTimeout(() => setSuccessToast(null), 1500);
      } else {
        setSuccessToast(`Logged ${formatPKR(numAmount)} successfully!`);
        setTimeout(() => {
          onClose();
        }, 600);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[94vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl border ${
                direction === 'OUT'
                  ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              }`}
            >
              {direction === 'OUT' ? (
                <ArrowDownRight className="w-5 h-5" />
              ) : (
                <ArrowUpRight className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {editingTransaction
                  ? 'Edit Cashbook Transaction'
                  : direction === 'OUT'
                  ? 'Record Payment / Expense (OUT)'
                  : 'Record Receipt / Income (IN)'}
              </h3>
              <p className="text-xs text-slate-400">
                Instantly updates live ledger & daily reconciliation balance
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

        {/* Direction Switcher Toggle */}
        {!editingTransaction && (
          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setDirection('OUT')}
              className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                direction === 'OUT'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowDownRight className="w-4 h-4 text-rose-200" />
              <span>OUT (Expense / Payment / Advance)</span>
            </button>
            <button
              type="button"
              onClick={() => setDirection('IN')}
              className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                direction === 'IN'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 text-emerald-200" />
              <span>IN (Receipt / Client Income / Refund)</span>
            </button>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-950/70 border border-red-800 text-red-200 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successToast && (
          <div className="p-3 bg-emerald-950/70 border border-emerald-800 text-emerald-200 rounded-xl text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        <div className="space-y-3.5 text-xs">
          {/* Account Selector + Balance Preview */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-blue-400" />
                <span>Operating Account *</span>
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                Live Balance:{' '}
                <strong
                  className={
                    selectedAccountBalance < 0 ? 'text-rose-400' : 'text-emerald-400'
                  }
                >
                  {formatPKR(selectedAccountBalance)}
                </strong>
              </span>
            </div>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-medium focus:border-blue-500"
            >
              {activeAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} — ({acc.type.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Amount (PKR) *
              </label>
              <input
                type="number"
                required
                min={1}
                placeholder="e.g. 25000"
                value={amount}
                onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono text-base font-bold focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Transaction Date *
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

          {/* Category (Head A/C) and Subcategory (Sub-Head A/C) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Head A/C (Category) *
              </label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setSubcategoryName('');
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-blue-500"
              >
                {expenseCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Sub-Head A/C (Subcategory)
              </label>
              {currentCategory && currentCategory.subcategories.length > 0 ? (
                <select
                  value={subcategoryName}
                  onChange={(e) => setSubcategoryName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-blue-500"
                >
                  <option value="">-- General / No Subcategory --</option>
                  {currentCategory.subcategories.map((sub) => (
                    <option key={sub.id} value={sub.name}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="e.g. Fuel / Tea / Ammunition"
                  value={subcategoryName}
                  onChange={(e) => setSubcategoryName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-blue-500"
                />
              )}
            </div>
          </div>

          {/* Particulars / Description */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Particulars / Description *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Office generator diesel 25 liters, Uniform purchase batch 4..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-blue-500"
            />
          </div>

          {/* Party (Employee / Vendor / Director / Guard) & Payment Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-semibold flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Person / Party (Optional)</span>
                </label>
                {selectedParty && (
                  <span className="text-[10px] text-amber-400">
                    Adv: {formatPKR(selectedParty.openingAdvanceBalance || 0)}
                  </span>
                )}
              </div>
              <select
                value={partyId}
                onChange={(e) => setPartyId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-blue-500"
              >
                <option value="">-- No specific party linked --</option>
                {parties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.roleRelation})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Payment Mode
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-blue-500"
              >
                <option value="Cash">Cash</option>
                <option value="Online / Bank Transfer">Online / Bank Transfer</option>
                <option value="Cheque">Cheque</option>
                <option value="JazzCash">JazzCash</option>
                <option value="EasyPaisa">EasyPaisa</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Reference No / Bill No */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Bill / Receipt / Slip No (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. REC-8830, INV-4491"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Internal Remarks / Notes
              </label>
              <input
                type="text"
                placeholder="e.g. Approved by Director Ali Akbar"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:border-blue-500"
              />
            </div>
          </div>

          {/* Buttons Footer */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold cursor-pointer"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {!editingTransaction && (
                <button
                  type="button"
                  onClick={() => handleSave(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold border border-slate-700 cursor-pointer"
                >
                  Save & Add Another
                </button>
              )}

              <button
                type="button"
                onClick={() => handleSave(false)}
                className={`w-full sm:w-auto px-5 py-2 rounded-xl font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-lg ${
                  direction === 'OUT'
                    ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/50'
                    : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/50'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>{editingTransaction ? 'Save Changes' : 'Record Transaction'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
