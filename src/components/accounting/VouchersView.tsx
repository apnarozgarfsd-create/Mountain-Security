import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Filter,
  Plus,
  Printer,
  Receipt,
  Search,
  Trash2,
  XCircle,
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Voucher, VoucherEntry, VoucherType } from '../../types';
import { formatPKR } from '../../utils/formatters';

export const VouchersView: React.FC = () => {
  const {
    vouchers,
    accounts,
    clients,
    guards,
    createVoucher,
    cancelVoucher,
    deleteVoucher,
    triggerPrint,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [cancelModalVoucher, setCancelModalVoucher] = useState<Voucher | null>(null);
  const [deleteModalVoucher, setDeleteModalVoucher] = useState<Voucher | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Voucher Form State
  const [voucherType, setVoucherType] = useState<VoucherType>('Receipt');
  const [voucherNo, setVoucherNo] = useState(`RV-${Date.now().toString().slice(-6)}`);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [referenceNo, setReferenceNo] = useState('');
  const [narration, setNarration] = useState('');

  const [entries, setEntries] = useState<
    Array<{
      id: string;
      accountId: string;
      debit: number;
      credit: number;
      narration: string;
      partyType?: 'Client' | 'Guard' | 'Vendor' | 'Other';
      partyId?: string;
      partyName?: string;
    }>
  >([
    {
      id: '1',
      accountId: accounts[1]?.id || accounts[0]?.id, // Bank or Cash
      debit: 50000,
      credit: 0,
      narration: 'Receipt from client',
      partyType: 'Client',
      partyName: clients[0]?.companyName || '',
    },
    {
      id: '2',
      accountId: 'ACC-1030', // Receivables
      debit: 0,
      credit: 50000,
      narration: 'Receivable cleared',
      partyType: 'Client',
      partyName: clients[0]?.companyName || '',
    },
  ]);

  const totalDebit = entries.reduce((sum, e) => sum + (Number(e.debit) || 0), 0);
  const totalCredit = entries.reduce((sum, e) => sum + (Number(e.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  const handleVoucherTypeChange = (type: VoucherType) => {
    setVoucherType(type);
    const prefix =
      type === 'Receipt' ? 'RV' : type === 'Payment' ? 'PV' : type === 'Contra' ? 'CV' : 'GV';
    setVoucherNo(`${prefix}-${Date.now().toString().slice(-6)}`);

    if (type === 'Receipt') {
      setEntries([
        {
          id: '1',
          accountId: accounts.find((a) => a.accountCode === '1020')?.id || accounts[0].id,
          debit: 100000,
          credit: 0,
          narration: 'Payment received into bank',
        },
        {
          id: '2',
          accountId: accounts.find((a) => a.accountCode === '1030')?.id || accounts[1].id,
          debit: 0,
          credit: 100000,
          narration: 'Client account credited',
        },
      ]);
    } else if (type === 'Payment') {
      setEntries([
        {
          id: '1',
          accountId: accounts.find((a) => a.accountCode === '5010')?.id || accounts[0].id,
          debit: 40000,
          credit: 0,
          narration: 'Guard salary / site operational expense',
        },
        {
          id: '2',
          accountId: accounts.find((a) => a.accountCode === '1010')?.id || accounts[1].id,
          debit: 0,
          credit: 40000,
          narration: 'Cash paid from drawer',
        },
      ]);
    } else if (type === 'Contra') {
      setEntries([
        {
          id: '1',
          accountId: accounts.find((a) => a.accountCode === '1010')?.id || accounts[0].id,
          debit: 50000,
          credit: 0,
          narration: 'Cash in drawer increased (Bank withdrawal)',
        },
        {
          id: '2',
          accountId: accounts.find((a) => a.accountCode === '1020')?.id || accounts[1].id,
          debit: 0,
          credit: 50000,
          narration: 'Meezan Bank cheque withdrawal',
        },
      ]);
    }
  };

  const handleAddEntryLine = () => {
    setEntries((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        accountId: accounts[0]?.id || '',
        debit: 0,
        credit: 0,
        narration: '',
      },
    ]);
  };

  const handleRemoveEntryLine = (index: number) => {
    if (entries.length <= 2) return;
    setEntries((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleEntryChange = (index: number, field: string, value: any) => {
    setEntries((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleAutoBalance = (targetIndex: number) => {
    const currentEntry = entries[targetIndex];
    let otherDebit = 0;
    let otherCredit = 0;

    entries.forEach((e, idx) => {
      if (idx !== targetIndex) {
        otherDebit += Number(e.debit) || 0;
        otherCredit += Number(e.credit) || 0;
      }
    });

    const diff = otherDebit - otherCredit;
    if (diff > 0) {
      handleEntryChange(targetIndex, 'credit', diff);
      handleEntryChange(targetIndex, 'debit', 0);
    } else if (diff < 0) {
      handleEntryChange(targetIndex, 'debit', Math.abs(diff));
      handleEntryChange(targetIndex, 'credit', 0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!isBalanced) {
      setFormError(`Debit (PKR ${totalDebit.toLocaleString()}) does not equal Credit (PKR ${totalCredit.toLocaleString()}). Unbalanced vouchers cannot be posted!`);
      return;
    }

    const formattedEntries: VoucherEntry[] = entries.map((ent, idx) => {
      const acc = accounts.find((a) => a.id === ent.accountId) || accounts[0];
      return {
        id: `ENT-${Date.now()}-${idx}`,
        accountId: acc.id,
        accountCode: acc.accountCode,
        accountName: acc.accountName,
        debit: Number(ent.debit) || 0,
        credit: Number(ent.credit) || 0,
        narration: ent.narration || narration,
        partyType: ent.partyType,
        partyId: ent.partyId,
        partyName: ent.partyName,
      };
    });

    const result = createVoucher({
      voucherNo,
      date,
      voucherType,
      referenceNo,
      narration: narration || `${voucherType} Voucher Transaction`,
      totalDebit,
      totalCredit,
      entries: formattedEntries,
    });

    if (result.success && result.voucher) {
      setIsCreateOpen(false);
      triggerPrint({
        type: 'voucher',
        data: result.voucher,
        title: `Voucher #${result.voucher.voucherNo}`,
      });
    } else {
      setFormError(result.error || 'Failed to post voucher.');
    }
  };

  const handleConfirmCancel = () => {
    if (!cancelModalVoucher || !cancelReason.trim()) return;
    cancelVoucher(cancelModalVoucher.id, cancelReason);
    setCancelModalVoucher(null);
    setCancelReason('');
  };

  const filteredVouchers = vouchers.filter((v) => {
    const matchesSearch =
      v.voucherNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.narration.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.referenceNo && v.referenceNo.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'All' || v.voucherType === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white uppercase flex items-center gap-2">
            <Receipt className="w-6 h-6 text-blue-400" />
            <span>Double-Entry Vouchers Engine</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Strict double-entry accounting where every debit matches credit, driving ledgers and live balances.
          </p>
        </div>

        <button
          onClick={() => {
            handleVoucherTypeChange('Receipt');
            setIsCreateOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Double-Entry Voucher</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Voucher #, Narration, Cheque Ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-hidden"
          >
            <option value="All">All Voucher Types</option>
            <option value="Receipt">Receipt Voucher (RV)</option>
            <option value="Payment">Payment Voucher (PV)</option>
            <option value="General">General / Journal Voucher (GV)</option>
            <option value="Contra">Contra Voucher (CV)</option>
          </select>
        </div>
      </div>

      {/* Vouchers Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-bold">
                <th className="py-3 px-4">Voucher No</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Ref #</th>
                <th className="py-3 px-4">Narration / Account Breakdown</th>
                <th className="py-3 px-4 text-right">Debit (PKR)</th>
                <th className="py-3 px-4 text-right">Credit (PKR)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredVouchers.map((v) => (
                <tr key={v.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-blue-400 font-mono">
                    {v.voucherNo}
                  </td>
                  <td className="py-3 px-4 text-slate-300">{v.date}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        v.voucherType === 'Receipt'
                          ? 'bg-emerald-950 text-emerald-300'
                          : v.voucherType === 'Payment'
                          ? 'bg-red-950 text-red-300'
                          : v.voucherType === 'Contra'
                          ? 'bg-purple-950 text-purple-300'
                          : 'bg-blue-950 text-blue-300'
                      }`}
                    >
                      {v.voucherType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono">{v.referenceNo || '-'}</td>
                  <td className="py-3 px-4 max-w-xs">
                    <div className="font-semibold text-slate-200 truncate">{v.narration}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {v.entries.map((e) => `${e.accountCode} (${e.debit > 0 ? `Dr ${e.debit.toLocaleString()}` : `Cr ${e.credit.toLocaleString()}`})`).join(' ↔ ')}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-black text-slate-100 font-mono">
                    {v.totalDebit.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-black text-slate-100 font-mono">
                    {v.totalCredit.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        v.status === 'Posted'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                          : 'bg-red-950 text-red-300 border border-red-800/60'
                      }`}
                    >
                      {v.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1.5">
                    <button
                      onClick={() =>
                        triggerPrint({
                          type: 'voucher',
                          data: v,
                          title: `Voucher #${v.voucherNo}`,
                        })
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-bold text-xs cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-blue-400" />
                      <span>Print</span>
                    </button>

                    {v.status === 'Posted' && (
                      <button
                        onClick={() => setCancelModalVoucher(v)}
                        className="inline-flex items-center gap-1 px-2 py-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-300 rounded font-semibold text-xs border border-red-800/50 cursor-pointer"
                        title="Reverse / Cancel Voucher"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Cancel</span>
                      </button>
                    )}

                    <button
                      onClick={() => setDeleteModalVoucher(v)}
                      className="inline-flex items-center gap-1 px-2 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 rounded font-semibold text-xs border border-rose-800/60 cursor-pointer"
                      title="Permanently Delete Voucher"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create New Double-Entry Voucher */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-blue-400" />
                  <span>Post Double-Entry Voucher</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Strict debit-credit equality enforced with instant balance adjustments.
                </p>
              </div>

              {/* Type Switcher Pills */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {(['Receipt', 'Payment', 'General', 'Contra'] as VoucherType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleVoucherTypeChange(t)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      voucherType === t ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {formError && (
              <div className="bg-red-950/60 border border-red-800 text-red-200 p-3 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Voucher Meta */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Voucher Number *</label>
                  <input
                    type="text"
                    required
                    value={voucherNo}
                    onChange={(e) => setVoucherNo(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Posting Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Cheque / Ref No</label>
                  <input
                    type="text"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    placeholder="e.g. CHQ-88912"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Master Narration</label>
                  <input
                    type="text"
                    value={narration}
                    onChange={(e) => setNarration(e.target.value)}
                    placeholder="e.g. July Security Bill Settlement"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              {/* Multi-Line Accounting Entries Grid */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                    Double-Entry Transaction Lines
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddEntryLine}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-blue-300 px-3 py-1 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Line</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {entries.map((entry, idx) => (
                    <div
                      key={entry.id}
                      className="grid grid-cols-12 gap-2 items-center bg-slate-900 p-2.5 rounded-lg border border-slate-800"
                    >
                      {/* Account Selector */}
                      <div className="col-span-12 sm:col-span-4">
                        <label className="block text-[10px] text-slate-400 font-semibold mb-0.5">
                          Account Title & Code
                        </label>
                        <select
                          value={entry.accountId}
                          onChange={(e) => handleEntryChange(idx, 'accountId', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-white font-medium"
                        >
                          {accounts.map((acc) => (
                            <option key={acc.id} value={acc.id}>
                              {acc.accountCode} - {acc.accountName} ({acc.category})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Line Narration */}
                      <div className="col-span-12 sm:col-span-3">
                        <label className="block text-[10px] text-slate-400 font-semibold mb-0.5">
                          Particulars / Line Narration
                        </label>
                        <input
                          type="text"
                          value={entry.narration}
                          onChange={(e) => handleEntryChange(idx, 'narration', e.target.value)}
                          placeholder="Line details..."
                          className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-white"
                        />
                      </div>

                      {/* Debit Input */}
                      <div className="col-span-5 sm:col-span-2">
                        <label className="block text-[10px] text-emerald-400 font-semibold mb-0.5">
                          Debit (PKR)
                        </label>
                        <input
                          type="number"
                          value={entry.debit || ''}
                          onChange={(e) => {
                            handleEntryChange(idx, 'debit', Number(e.target.value));
                            if (Number(e.target.value) > 0) {
                              handleEntryChange(idx, 'credit', 0);
                            }
                          }}
                          placeholder="0"
                          className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-white font-mono font-bold"
                        />
                      </div>

                      {/* Credit Input */}
                      <div className="col-span-5 sm:col-span-2">
                        <label className="block text-[10px] text-blue-400 font-semibold mb-0.5">
                          Credit (PKR)
                        </label>
                        <input
                          type="number"
                          value={entry.credit || ''}
                          onChange={(e) => {
                            handleEntryChange(idx, 'credit', Number(e.target.value));
                            if (Number(e.target.value) > 0) {
                              handleEntryChange(idx, 'debit', 0);
                            }
                          }}
                          placeholder="0"
                          className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-white font-mono font-bold"
                        />
                      </div>

                      {/* Line Tools */}
                      <div className="col-span-2 sm:col-span-1 flex items-center justify-end gap-1 pt-3">
                        <button
                          type="button"
                          onClick={() => handleAutoBalance(idx)}
                          title="Auto-balance line"
                          className="p-1 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded cursor-pointer"
                        >
                          ⚡
                        </button>
                        {entries.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveEntryLine(idx)}
                            className="p-1 text-slate-500 hover:text-red-400 rounded cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals & Balance Bar */}
                <div
                  className={`p-3 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-2 ${
                    isBalanced
                      ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
                      : 'bg-red-950/50 border-red-800/80 text-red-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold">
                    {isBalanced ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Voucher is perfectly balanced! Ready to post.</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span>
                          Difference: PKR {Math.abs(totalDebit - totalCredit).toLocaleString()} (Debit and Credit must match)
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono font-bold">
                    <div>
                      Debit: <span className="text-emerald-400">PKR {totalDebit.toLocaleString()}</span>
                    </div>
                    <div>
                      Credit: <span className="text-blue-400">PKR {totalCredit.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isBalanced}
                  className={`px-5 py-2 rounded-lg font-bold shadow-lg flex items-center gap-2 ${
                    isBalanced
                      ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Post to General Ledger</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Cancel / Reverse Voucher */}
      {cancelModalVoucher && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-5 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-400" />
              <span>Reverse Voucher #{cancelModalVoucher.voucherNo}</span>
            </h3>
            <p className="text-xs text-slate-300">
              Cancelling will reverse all debits and credits from account ledgers. Please specify audit reason:
            </p>
            <textarea
              required
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Incorrect bank account chosen / duplicate entry..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setCancelModalVoucher(null)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg cursor-pointer"
              >
                Dismiss
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={!cancelReason.trim()}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg cursor-pointer disabled:opacity-50"
              >
                Confirm Reversal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Permanent Delete Voucher */}
      {deleteModalVoucher && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-800/80 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-950/80 border border-rose-700/60 rounded-xl text-rose-400">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Delete Voucher #{deleteModalVoucher.voucherNo}?
                </h3>
                <p className="text-xs text-rose-300 font-medium">
                  {deleteModalVoucher.voucherType} Voucher • PKR {deleteModalVoucher.totalDebit.toLocaleString()}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
              {deleteModalVoucher.status === 'Posted'
                ? '⚠️ This voucher is currently POSTED. Deleting it will automatically reverse all debit & credit postings from affected account balances and permanently remove the record.'
                : 'This cancelled voucher record will be permanently deleted from the system.'}
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteModalVoucher(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteVoucher(deleteModalVoucher.id);
                  setDeleteModalVoucher(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow-lg shadow-rose-950/50 flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Delete Voucher</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
