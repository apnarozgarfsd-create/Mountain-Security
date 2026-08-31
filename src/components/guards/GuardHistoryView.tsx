import { Calendar, History, MapPin, Search, User, Users } from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const GuardHistoryView: React.FC = () => {
  const { guardAssignments, guards, sites } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuard, setSelectedGuard] = useState('All');

  const filteredHistory = guardAssignments.filter((asn) => {
    const matchesSearch =
      asn.guardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asn.guardCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asn.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asn.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGuard = selectedGuard === 'All' || asn.guardId === selectedGuard;
    return matchesSearch && matchesGuard;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white uppercase flex items-center gap-2">
            <History className="w-6 h-6 text-purple-400" />
            <span>Guard Duty & Site Transfer History</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Immutable tracking of guard postings, site transitions, duty shift changes and operational logs.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Guard Name, Code, Site, Client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedGuard}
            onChange={(e) => setSelectedGuard(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-hidden"
          >
            <option value="All">All Guards ({guards.length})</option>
            {guards.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} ({g.guardCode})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* History Timeline Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-bold">
                <th className="py-3 px-4">Guard Details</th>
                <th className="py-3 px-4">Assigned Site & Client</th>
                <th className="py-3 px-4">Shift Details</th>
                <th className="py-3 px-4">Tenure (Start → End)</th>
                <th className="py-3 px-4">Transfer Remarks</th>
                <th className="py-3 px-4">Assigned By</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredHistory.map((asn) => (
                <tr key={asn.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-100">{asn.guardName}</div>
                    <div className="text-[10px] text-blue-400 font-mono">{asn.guardCode}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-200 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{asn.siteName}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">{asn.clientName}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px] font-semibold">
                      {asn.shift}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-slate-200 font-mono">{asn.startDate}</div>
                    <div className="text-[10px] text-slate-400">
                      {asn.endDate ? `to ${asn.endDate}` : <span className="text-emerald-400 font-bold">Present (Active)</span>}
                    </div>
                  </td>
                  <td className="py-3 px-4 max-w-xs text-slate-300">
                    {asn.remarks || '-'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-slate-300 font-semibold">{asn.assignedBy}</div>
                    <div className="text-[10px] text-slate-500">{asn.assignedAt}</div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        asn.status === 'Active'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {asn.status}
                    </span>
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
