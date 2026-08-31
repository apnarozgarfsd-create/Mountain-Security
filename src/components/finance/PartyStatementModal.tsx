import React, { useState } from 'react';
import {
  User,
  Printer,
  Calendar,
  ArrowDownRight,
  ArrowUpRight,
  X,
  Search,
  Wallet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatPKR, formatDate } from '../../utils/formatters';

interface PartyStatementModalProps {
  partyId: string | null;
  onClose: () => void;
}

export const PartyStatementModal: React.FC<PartyStatementModalProps> = ({
  partyId,
  onClose,
}) => {
  const { getPartyLedger, triggerPrint, companySettings } = useApp();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  if (!partyId) return null;

  const ledger = getPartyLedger(partyId);
  const party = ledger.party;

  if (!party) return null;

  // Filter transactions
  const filteredTransactions = ledger.transactions
    .filter((t) => {
      if (startDate && t.date < startDate) return false;
      if (endDate && t.date > endDate) return false;
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        return (
          t.description.toLowerCase().includes(query) ||
          (t.categoryName && t.categoryName.toLowerCase().includes(query)) ||
          (t.accountName && t.accountName.toLowerCase().includes(query))
        );
      }
      return true;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Compute running balance: Opening Advance + OUT (Given to Party) - IN (Received back from Party)
  let currentRunning = Number(party.openingAdvanceBalance) || 0;
  const rowsWithBalance = filteredTransactions.map((t) => {
    if (t.direction === 'OUT') {
      currentRunning += Number(t.amount) || 0;
    } else {
      currentRunning -= Number(t.amount) || 0;
    }
    return {
      ...t,
      runningBalance: currentRunning,
    };
  });

  const handlePrint = () => {
    triggerPrint({
      type: 'account-ledger',
      data: {
        accountName: `Party Statement: ${party.name} (${party.roleRelation})`,
        partyDetails: party,
        startDate: startDate || 'Beginning',
        endDate: endDate || 'Latest',
        openingBalance: party.openingAdvanceBalance || 0,
        transactions: rowsWithBalance,
        totalIn: ledger.totalIn,
        totalOut: ledger.totalOut,
        netBalance: ledger.netBalance,
      },
      title: `Party Ledger - ${party.name}`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-4 max-h-[94vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{party.name}</h3>
                <span className="px-2 py-0.5 bg-indigo-950 text-indigo-300 text-[10px] font-bold rounded-full border border-indigo-800/60">
                  {party.roleRelation}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {party.phone ? `Phone: ${party.phone} • ` : ''}
                {party.cnic ? `CNIC: ${party.cnic} • ` : ''}
                {party.notes || 'Party & Person Ledger Statement'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-slate-700"
            >
              <Printer className="w-4 h-4 text-blue-400" />
              <span>Print Statement</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Metrics Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Opening Advance
            </p>
            <p className="text-sm font-bold font-mono text-slate-200 mt-1">
              {formatPKR(party.openingAdvanceBalance || 0)}
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <p className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider">
              Paid OUT (Given)
            </p>
            <p className="text-sm font-bold font-mono text-rose-400 mt-1">
              {formatPKR(ledger.totalOut)}
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
              Received IN (Back)
            </p>
            <p className="text-sm font-bold font-mono text-emerald-400 mt-1">
              {formatPKR(ledger.totalIn)}
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-indigo-500/30">
            <p className="text-[10px] font-semibold text-indigo-300 uppercase tracking-wider">
              Net Receivable / Balance
            </p>
            <p className="text-sm font-bold font-mono text-indigo-400 mt-1">
              {formatPKR(ledger.netBalance)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search description, account or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-white focus:outline-none placeholder-slate-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-[11px]">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white text-xs"
            />
            <span className="text-slate-500 text-[11px]">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white text-xs"
            />
          </div>
        </div>

        {/* Statement Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Operating Account</th>
                <th className="py-2.5 px-3">Head / Sub-Head</th>
                <th className="py-2.5 px-3">Particulars / Description</th>
                <th className="py-2.5 px-3 text-right">Debit (OUT)</th>
                <th className="py-2.5 px-3 text-right">Credit (IN)</th>
                <th className="py-2.5 px-3 text-right">Running Advance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 font-medium">
              {rowsWithBalance.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No transactions recorded for this party within selected range.
                  </td>
                </tr>
              ) : (
                rowsWithBalance.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-300 font-mono text-[11px]">
                      {formatDate(row.date)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {row.accountName}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      <span>{row.categoryName}</span>
                      {row.subcategoryName && (
                        <span className="text-[10px] text-slate-500 block">
                          {row.subcategoryName}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-white max-w-xs truncate">
                      {row.description}
                      {row.referenceNo && (
                        <span className="text-[10px] text-slate-400 font-mono block">
                          Ref: {row.referenceNo}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-400">
                      {row.direction === 'OUT' ? formatPKR(row.amount) : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                      {row.direction === 'IN' ? formatPKR(row.amount) : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-indigo-300">
                      {formatPKR(row.runningBalance)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
