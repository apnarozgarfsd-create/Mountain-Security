import { ArrowDownLeft, ArrowUpRight, History, Package, Search } from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatPKR } from '../../utils/formatters';

export const InventoryTransactionsView: React.FC = () => {
  const { stockTransactions, products } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  const filteredLogs = stockTransactions.filter((tx) => {
    const pCode = tx.productCode || '';
    const matchesSearch =
      tx.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.guardName && tx.guardName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.siteName && tx.siteName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'All' || tx.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white uppercase flex items-center gap-2">
            <History className="w-6 h-6 text-amber-400" />
            <span>Store Inventory Stock Movement Ledger</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Audit history of inward purchases, guard issue outflows, and store inventory adjustments.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by SKU, Product Name, Guard, Site..."
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
            <option value="All">All Movement Types</option>
            <option value="Purchase">Purchase (Inward)</option>
            <option value="Guard Issue">Guard Issue (Outward)</option>
            <option value="Guard Return">Guard Return (Inward)</option>
            <option value="Adjustment">Adjustments</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-bold">
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Ref No</th>
                <th className="py-3 px-4">Product Details</th>
                <th className="py-3 px-4 text-center">Movement Qty</th>
                <th className="py-3 px-4 text-right">Unit Rate</th>
                <th className="py-3 px-4 text-right">Total (PKR)</th>
                <th className="py-3 px-4">Recipient / Guard / Site</th>
                <th className="py-3 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredLogs.map((tx) => {
                const isInflow = tx.quantityIn > 0;
                return (
                  <tr key={tx.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isInflow
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                            : 'bg-blue-950 text-blue-300 border border-blue-800/60'
                        }`}
                      >
                        {isInflow ? (
                          <ArrowDownLeft className="w-3 h-3" />
                        ) : (
                          <ArrowUpRight className="w-3 h-3" />
                        )}
                        <span>{tx.type}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-mono">{tx.date}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[10px]">{tx.referenceNo}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-100">{tx.productName}</div>
                      <div className="text-[10px] text-amber-400 font-mono">{tx.productCode}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`font-black font-mono px-2 py-0.5 rounded ${
                          isInflow
                            ? 'text-emerald-400 bg-emerald-950/50'
                            : 'text-blue-400 bg-blue-950/50'
                        }`}
                      >
                        {isInflow ? `+${tx.quantityIn}` : `-${tx.quantityOut}`}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300">
                      {formatPKR(tx.unitPrice || 0)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-100">
                      {formatPKR(tx.totalAmount)}
                    </td>
                    <td className="py-3 px-4">
                      {tx.guardName ? (
                        <div>
                          <span className="font-bold text-blue-400">{tx.guardName}</span>
                          {tx.siteName && <div className="text-[10px] text-slate-400">{tx.siteName}</div>}
                        </div>
                      ) : (
                        <span className="text-slate-300">{tx.siteName || 'Head Office Store'}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 max-w-xs text-slate-400 truncate">
                      {tx.notes || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
