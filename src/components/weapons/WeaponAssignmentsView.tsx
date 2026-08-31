import { ArrowDownLeft, ArrowUpRight, History, Search, Shield } from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const WeaponAssignmentsView: React.FC = () => {
  const { weaponAssignments, weapons, guards } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('All');

  const filteredLogs = weaponAssignments.filter((log) => {
    const matchesSearch =
      log.weaponCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.guardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.siteName && log.siteName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesAction = filterAction === 'All' || log.actionType === filterAction;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white uppercase flex items-center gap-2">
            <History className="w-6 h-6 text-red-500" />
            <span>Armoury Weapon Movement & Custody Ledger</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Full compliance audit log of all weapon issue, return, and custody handovers.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Weapon, S/N, Guard, Site..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-hidden"
          >
            <option value="All">All Movements</option>
            <option value="Issue">Issued to Guard</option>
            <option value="Return">Returned to Armoury</option>
          </select>
        </div>
      </div>

      {/* Movement Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-bold">
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Weapon Details</th>
                <th className="py-3 px-4">Guard (Custody)</th>
                <th className="py-3 px-4">Stationed Site</th>
                <th className="py-3 px-4 text-center">Condition</th>
                <th className="py-3 px-4">Notes / Officer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        log.actionType === 'Issue'
                          ? 'bg-red-950 text-red-300 border border-red-800/60'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                      }`}
                    >
                      {log.actionType === 'Issue' ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownLeft className="w-3 h-3" />
                      )}
                      <span>{log.actionType === 'Issue' ? 'Issued' : 'Returned'}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-mono">{log.issuedDate || log.returnedDate}</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-red-400 font-mono">{log.weaponCode}</span>
                    <div className="text-[10px] text-slate-400 font-mono">S/N: {log.serialNumber}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-100">{log.guardName}</div>
                    <div className="text-[10px] text-blue-400 font-mono">{log.guardCode}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-slate-200 font-semibold">{log.siteName || 'HQ Armoury'}</div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-mono font-semibold">
                      {log.conditionOnReturn || log.conditionOnIssue || 'Good'}
                    </span>
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <div className="text-slate-300 truncate">{log.notes || '-'}</div>
                    <div className="text-[10px] text-slate-500">Issued by: {log.issuedBy}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
