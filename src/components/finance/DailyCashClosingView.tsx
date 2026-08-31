import React, { useState } from 'react';
import {
  Calendar,
  DollarSign,
  Calculator,
  Printer,
  CheckCircle2,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  Wallet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatPKR, formatDate } from '../../utils/formatters';

export const DailyCashClosingView: React.FC = () => {
  const {
    financeAccounts,
    cashTransactions,
    getDailyReconciliation,
    triggerPrint,
    companySettings,
  } = useApp();

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');

  // Physical Cash Counter Denominations (Pakistani Rupee notes)
  const [denominations, setDenominations] = useState<{ [key: number]: number }>({
    5000: 0,
    1000: 0,
    500: 0,
    100: 0,
    50: 0,
    20: 0,
    10: 0,
  });

  const reconciliationData = getDailyReconciliation(
    selectedDate,
    selectedAccountId === 'all' ? undefined : selectedAccountId
  );

  const totalOpening = reconciliationData.reduce((sum, r) => sum + r.openingBalance, 0);
  const totalIn = reconciliationData.reduce((sum, r) => sum + r.totalIn, 0);
  const totalOut = reconciliationData.reduce((sum, r) => sum + r.totalOut, 0);
  const totalClosing = reconciliationData.reduce((sum, r) => sum + r.closingBalance, 0);
  const totalTxnCount = reconciliationData.reduce((sum, r) => sum + r.transactionCount, 0);

  // Transactions on this specific date
  const dayTransactions = cashTransactions
    .filter((t) => {
      if (t.date !== selectedDate) return false;
      if (selectedAccountId !== 'all' && t.accountId !== selectedAccountId) return false;
      return true;
    })
    .sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime());

  // Calculate physical cash total from denomination counter
  const physicalCashTotal = Object.entries(denominations).reduce(
    (sum, [note, count]) => sum + Number(note) * (Number(count) || 0),
    0
  );

  // Physical cash difference only relevant for cash accounts
  const cashAccountsClosing = reconciliationData
    .filter((r) => {
      const acc = financeAccounts.find((a) => a.id === r.accountId);
      return acc?.type === 'cash';
    })
    .reduce((sum, r) => sum + r.closingBalance, 0);

  const cashDiscrepancy = physicalCashTotal - cashAccountsClosing;

  const handleDenominationChange = (note: number, count: number) => {
    setDenominations((prev) => ({
      ...prev,
      [note]: Math.max(0, count || 0),
    }));
  };

  const handlePrintDailyReport = () => {
    triggerPrint({
      type: 'general-report',
      data: {
        title: `Daily Cash & Accounts Closing Sheet — ${formatDate(selectedDate)}`,
        date: selectedDate,
        reconciliationData,
        dayTransactions,
        totals: {
          opening: totalOpening,
          in: totalIn,
          out: totalOut,
          closing: totalClosing,
          physicalCash: physicalCashTotal,
          discrepancy: cashDiscrepancy,
        },
      },
      title: `Daily Closing - ${selectedDate}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <label className="text-xs font-semibold text-slate-300">Closing Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-medium focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <label className="text-xs font-semibold text-slate-300">Account Filter:</label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-blue-500"
            >
              <option value="all">-- All Accounts Consolidated --</option>
              {financeAccounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.type.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handlePrintDailyReport}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-slate-700 shadow-md"
        >
          <Printer className="w-4 h-4 text-blue-400" />
          <span>Print Daily Closing Sheet</span>
        </button>
      </div>

      {/* Summary Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Day Opening Balance
          </p>
          <p className="text-xl font-extrabold font-mono text-slate-100 mt-1">
            {formatPKR(totalOpening)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Carryover before {formatDate(selectedDate)}</p>
        </div>

        <div className="bg-slate-900/90 border border-emerald-900/40 p-4 rounded-2xl shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Total Receipts (IN)</span>
          </p>
          <p className="text-xl font-extrabold font-mono text-emerald-400 mt-1">
            {formatPKR(totalIn)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Client receipts, fund deposits & refunds</p>
        </div>

        <div className="bg-slate-900/90 border border-rose-900/40 p-4 rounded-2xl shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Total Expenses (OUT)</span>
          </p>
          <p className="text-xl font-extrabold font-mono text-rose-400 mt-1">
            {formatPKR(totalOut)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Site expenses, salaries & cash advances</p>
        </div>

        <div className="bg-slate-900/90 border border-blue-900/40 p-4 rounded-2xl shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">
            Day Closing Balance
          </p>
          <p className="text-xl font-extrabold font-mono text-blue-300 mt-1">
            {formatPKR(totalClosing)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">{totalTxnCount} transactions recorded today</p>
        </div>
      </div>

      {/* Account-wise Breakdown Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span>Account-wise Day Reconciliation for {formatDate(selectedDate)}</span>
          </h3>
          <span className="text-xs text-slate-400">
            Opening + Total IN - Total OUT = Closing Balance
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950/60 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Account Title</th>
                <th className="py-3 px-4 text-right">Morning Opening</th>
                <th className="py-3 px-4 text-right text-emerald-400">Today Receipts (IN)</th>
                <th className="py-3 px-4 text-right text-rose-400">Today Payments (OUT)</th>
                <th className="py-3 px-4 text-right text-blue-400">Night Closing</th>
                <th className="py-3 px-4 text-center">Txns</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {reconciliationData.map((rec) => (
                <tr key={rec.accountId} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4">
                    <p className="font-bold text-white">{rec.accountName}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{rec.accountId}</p>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-300">
                    {formatPKR(rec.openingBalance)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                    {rec.totalIn > 0 ? `+${formatPKR(rec.totalIn)}` : '-'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-rose-400">
                    {rec.totalOut > 0 ? `-${formatPKR(rec.totalOut)}` : '-'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-100">
                    <span className={rec.closingBalance < 0 ? 'text-rose-400' : 'text-blue-300'}>
                      {formatPKR(rec.closingBalance)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-slate-400">
                    {rec.transactionCount}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-950 font-bold border-t-2 border-slate-700">
              <tr>
                <td className="py-3 px-4 text-white uppercase text-xs">Consolidated Totals</td>
                <td className="py-3 px-4 text-right font-mono text-slate-200">
                  {formatPKR(totalOpening)}
                </td>
                <td className="py-3 px-4 text-right font-mono text-emerald-400">
                  +{formatPKR(totalIn)}
                </td>
                <td className="py-3 px-4 text-right font-mono text-rose-400">
                  -{formatPKR(totalOut)}
                </td>
                <td className="py-3 px-4 text-right font-mono text-blue-300 text-sm">
                  {formatPKR(totalClosing)}
                </td>
                <td className="py-3 px-4 text-center font-mono text-slate-300">
                  {totalTxnCount}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Cash Denomination Drawer Verification Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-sm font-bold text-white">
                  Physical Cash Drawer Denomination Counter
                </h3>
                <p className="text-xs text-slate-400">
                  Count physical rupee banknotes to verify actual cash against system closing balance
                </p>
              </div>
            </div>
            <button
              onClick={() =>
                setDenominations({
                  5000: 0,
                  1000: 0,
                  500: 0,
                  100: 0,
                  50: 0,
                  20: 0,
                  10: 0,
                })
              }
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              Reset Counter
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {[5000, 1000, 500, 100, 50, 20, 10].map((note) => {
              const count = denominations[note] || 0;
              const subtotal = note * count;
              return (
                <div key={note} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="font-bold text-amber-400 font-mono">Rs {note}</span>
                    <span className="text-[10px]">Note</span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={count || ''}
                    onChange={(e) =>
                      handleDenominationChange(note, parseInt(e.target.value, 10) || 0)
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white font-mono text-center font-bold focus:border-amber-500"
                  />
                  <p className="text-[10px] text-right font-mono text-slate-400">
                    = {formatPKR(subtotal)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Physical Cash vs System Balance Reconciled Result */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Cash Drawer Reconciliation</h3>
            <p className="text-xs text-slate-400">Comparing counted notes vs Cash Accounts closing</p>
          </div>

          <div className="space-y-3 text-xs bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-medium">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">System Cash Closing:</span>
              <span className="font-mono font-bold text-white">
                {formatPKR(cashAccountsClosing)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Physical Cash Counted:</span>
              <span className="font-mono font-bold text-amber-400">
                {formatPKR(physicalCashTotal)}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-sm font-bold">
              <span className="text-slate-300">Difference (Variance):</span>
              <span
                className={`font-mono ${
                  cashDiscrepancy === 0
                    ? 'text-emerald-400'
                    : cashDiscrepancy > 0
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }`}
              >
                {cashDiscrepancy === 0
                  ? '0 (Exact Match)'
                  : cashDiscrepancy > 0
                  ? `+${formatPKR(cashDiscrepancy)} (Surplus)`
                  : `${formatPKR(cashDiscrepancy)} (Shortage)`}
              </span>
            </div>
          </div>

          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              cashDiscrepancy === 0
                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
                : 'bg-amber-950/60 border-amber-800 text-amber-200'
            }`}
          >
            {cashDiscrepancy === 0 ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Physical drawer matches software records with zero discrepancy!</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <span>
                  Variance of {formatPKR(Math.abs(cashDiscrepancy))}. Please double-check slips or unrecorded petty cash.
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
