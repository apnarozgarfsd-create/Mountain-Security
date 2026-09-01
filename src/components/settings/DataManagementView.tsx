import {
  AlertOctagon,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Database,
  Eye,
  FolderTree,
  Lock,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DataSummaryCounts } from '../../types';

export const DataManagementView: React.FC = () => {
  const {
    currentUserRole,
    getDataSummaryCounts,
    resetToCleanInitialDataset,
    deleteAllOperationalData,
    logAudit,
  } = useApp();

  const isSuperAdmin = currentUserRole === 'Super Admin';
  const summaryCounts: DataSummaryCounts = getDataSummaryCounts();

  // Reset to Clean Initial Dataset Modal
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetConfirmInput, setResetConfirmInput] = useState('');
  const [resetSuccessNotice, setResetSuccessNotice] = useState<string | null>(null);

  // Delete All Data (2-step) Modal
  const [isDeleteAllStep1Open, setIsDeleteAllStep1Open] = useState(false);
  const [isDeleteAllStep2Open, setIsDeleteAllStep2Open] = useState(false);
  const [deleteAllConfirmInput, setDeleteAllConfirmInput] = useState('');
  const [deleteSuccessNotice, setDeleteSuccessNotice] = useState<string | null>(null);

  const handleOpenResetModal = () => {
    if (!isSuperAdmin) return;
    setResetConfirmInput('');
    setIsResetModalOpen(true);
  };

  const handleExecuteReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetConfirmInput.trim() !== 'RESET') return;

    resetToCleanInitialDataset();
    logAudit('Reset Dataset', 'System', 'ALL', 'Super Admin reset application to clean initial dataset');
    setIsResetModalOpen(false);
    setResetSuccessNotice('Application has been successfully reset to the clean initial dataset. Demo/test transactions were purged while system structure, accounts, categories, and settings were preserved.');
    setTimeout(() => setResetSuccessNotice(null), 6000);
  };

  const handleOpenDeleteAllStep1 = () => {
    if (!isSuperAdmin) return;
    setDeleteAllConfirmInput('');
    setIsDeleteAllStep1Open(true);
  };

  const handleProceedToDeleteAllStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteAllConfirmInput.trim() !== 'DELETE ALL DATA') return;
    setIsDeleteAllStep1Open(false);
    setIsDeleteAllStep2Open(true);
  };

  const handleExecuteDeleteAllFinal = () => {
    deleteAllOperationalData();
    logAudit('Delete All Data', 'System', 'CRITICAL', 'Super Admin executed Delete All Data');
    setIsDeleteAllStep2Open(false);
    setDeleteSuccessNotice('All operational data records have been permanently cleared. Schema, Super Admin account, and baseline configurations have been preserved.');
    setTimeout(() => setDeleteSuccessNotice(null), 6000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white uppercase flex items-center gap-2">
              <Database className="w-6 h-6 text-purple-400" />
              <span>Super Admin • Data Management</span>
            </h1>
            {isSuperAdmin ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-950/80 border border-purple-800 text-purple-300">
                <ShieldCheck className="w-2.5 h-2.5" /> Super Admin Authorized
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-950/80 border border-red-800 text-red-300">
                <Lock className="w-2.5 h-2.5" /> Restricted to Super Admin
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Database summary metrics, clean initial dataset reset, and protected high-level administrative data controls.
          </p>
        </div>
      </div>

      {/* Success Alerts */}
      {resetSuccessNotice && (
        <div className="p-4 rounded-xl border bg-emerald-950/90 border-emerald-800 text-emerald-200 text-xs flex items-start gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-semibold">{resetSuccessNotice}</p>
        </div>
      )}

      {deleteSuccessNotice && (
        <div className="p-4 rounded-xl border bg-blue-950/90 border-blue-800 text-blue-200 text-xs flex items-start gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-semibold">{deleteSuccessNotice}</p>
        </div>
      )}

      {!isSuperAdmin && (
        <div className="p-4 rounded-xl border bg-amber-950/60 border-amber-800/80 text-amber-200 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Access Restricted</p>
            <p className="mt-0.5 text-amber-300/80">
              Only the <strong>Super Admin</strong> role has permission to execute Clean Dataset Resets or Delete All Data actions. Switch to Super Admin in the top-right menu if you have appropriate authorization.
            </p>
          </div>
        </div>
      )}

      {/* Live Data Summary Dashboard */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <BarChart3 className="w-5 h-5 text-sky-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Live Database Summary & Record Counts
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">
            Total Records: <strong className="text-white">{summaryCounts.totalRecordsCount}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Security Guards</span>
              <div className="text-xl font-black text-white mt-0.5">{summaryCounts.guardsCount}</div>
            </div>
            <div className="p-2 bg-blue-950/80 text-blue-400 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Security Sites</span>
              <div className="text-xl font-black text-emerald-400 mt-0.5">{summaryCounts.sitesCount}</div>
            </div>
            <div className="p-2 bg-emerald-950/80 text-emerald-400 rounded-lg">
              <FolderTree className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Attendance Records</span>
              <div className="text-xl font-black text-purple-400 mt-0.5">{summaryCounts.attendanceCount}</div>
            </div>
            <div className="p-2 bg-purple-950/80 text-purple-400 rounded-lg">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Invoices & Billing</span>
              <div className="text-xl font-black text-sky-400 mt-0.5">{summaryCounts.invoicesCount}</div>
            </div>
            <div className="p-2 bg-sky-950/80 text-sky-400 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Payments & Receipts</span>
              <div className="text-xl font-black text-emerald-400 mt-0.5">{summaryCounts.paymentsCount}</div>
            </div>
            <div className="p-2 bg-emerald-950/80 text-emerald-400 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Expenses Logged</span>
              <div className="text-xl font-black text-amber-400 mt-0.5">{summaryCounts.expensesCount}</div>
            </div>
            <div className="p-2 bg-amber-950/80 text-amber-400 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Journal & Vouchers</span>
              <div className="text-xl font-black text-blue-400 mt-0.5">{summaryCounts.journalEntriesCount}</div>
            </div>
            <div className="p-2 bg-blue-950/80 text-blue-400 rounded-lg">
              <FolderTree className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Store Items</span>
              <div className="text-xl font-black text-teal-400 mt-0.5">{summaryCounts.inventoryItemsCount}</div>
            </div>
            <div className="p-2 bg-teal-950/80 text-teal-400 rounded-lg">
              <Database className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Stock Movements</span>
              <div className="text-xl font-black text-sky-400 mt-0.5">{summaryCounts.inventoryTransactionsCount}</div>
            </div>
            <div className="p-2 bg-sky-950/80 text-sky-400 rounded-lg">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Armoury & Weapons</span>
              <div className="text-xl font-black text-rose-400 mt-0.5">{summaryCounts.armouryRecordsCount}</div>
            </div>
            <div className="p-2 bg-rose-950/80 text-rose-400 rounded-lg">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Categories & Subs</span>
              <div className="text-xl font-black text-indigo-400 mt-0.5">
                {summaryCounts.categoriesCount} / {summaryCounts.subCategoriesCount}
              </div>
            </div>
            <div className="p-2 bg-indigo-950/80 text-indigo-400 rounded-lg">
              <FolderTree className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Authorized Users</span>
              <div className="text-xl font-black text-emerald-400 mt-0.5">{summaryCounts.usersCount}</div>
            </div>
            <div className="p-2 bg-emerald-950/80 text-emerald-400 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Super Admin High-Level Data Operations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Reset to Clean Initial Dataset */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2.5 bg-amber-950/80 border border-amber-800 text-amber-400 rounded-xl">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Reset to Clean Initial Dataset
                </h3>
                <p className="text-[11px] text-slate-400">Purge demo transactional entries</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Resets the application to a clean baseline. This removes demo/test guards, test attendance, test vouchers, and test stock transactions while strictly preserving:
            </p>

            <ul className="text-xs text-slate-400 space-y-1 pl-4 list-disc">
              <li>Super Admin account and role credentials</li>
              <li>Chart of Accounts structure and system accounts</li>
              <li>Official Categories & Sub-Categories taxonomy</li>
              <li>Company profile & Mountain Security Services branding</li>
              <li>System configuration & security policies</li>
            </ul>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              disabled={!isSuperAdmin}
              onClick={handleOpenResetModal}
              className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset to Clean Initial Dataset...</span>
            </button>
          </div>
        </div>

        {/* Card 2: Delete All Data (Dangerous) */}
        <div className="bg-slate-950 border border-red-900/60 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2.5 bg-red-950/90 border border-red-800 text-red-400 rounded-xl">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertOctagon className="w-4 h-4" />
                  <span>Delete All Operational Data</span>
                </h3>
                <p className="text-[11px] text-slate-400">Dangerous • Two-Step Confirmation Required</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Permanently purges all operational records from the database (all guards, sites, attendance, invoices, payments, vouchers, weapons, items).
            </p>

            <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-xl text-[11px] text-red-300 space-y-1">
              <p className="font-bold">⚠️ Irreversible Administrative Action:</p>
              <p className="leading-relaxed">
                Keeps system schema, Chart of Accounts definitions, categories structure, and Super Admin active credentials, while wiping all runtime transactional data.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              disabled={!isSuperAdmin}
              onClick={handleOpenDeleteAllStep1}
              className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete All Data (Dangerous)...</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Reset Confirmation */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2.5 bg-amber-950/80 border border-amber-800 text-amber-400 rounded-xl">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Reset Application Dataset</h3>
                <p className="text-xs text-slate-400">Clean initial dataset confirmation</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This will remove demo/test transaction records from the database while keeping your Chart of Accounts, Categories, Company branding, and Super Admin settings intact.
            </p>

            <form onSubmit={handleExecuteReset} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Please type <strong className="text-amber-400 font-mono">RESET</strong> to confirm:
                </label>
                <input
                  type="text"
                  required
                  value={resetConfirmInput}
                  onChange={(e) => setResetConfirmInput(e.target.value)}
                  placeholder="Type RESET"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetConfirmInput.trim() !== 'RESET'}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Confirm Clean Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete All Data Step 1 */}
      {isDeleteAllStep1Open && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2.5 bg-red-950/90 border border-red-800 text-red-400 rounded-xl">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-red-400">Step 1: Delete All Data Verification</h3>
                <p className="text-xs text-slate-400">Dangerous Administrative Action</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This action will permanently delete all operational records (guards, sites, vouchers, invoices, weapons, inventory items, and logs).
            </p>

            <form onSubmit={handleProceedToDeleteAllStep2} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Please type <strong className="text-red-400 font-mono">DELETE ALL DATA</strong> to proceed:
                </label>
                <input
                  type="text"
                  required
                  value={deleteAllConfirmInput}
                  onChange={(e) => setDeleteAllConfirmInput(e.target.value)}
                  placeholder="Type DELETE ALL DATA"
                  className="w-full bg-slate-950 border border-red-900/80 rounded-lg p-2.5 text-white font-mono font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDeleteAllStep1Open(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteAllConfirmInput.trim() !== 'DELETE ALL DATA'}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Proceed to Step 2
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete All Data Step 2 Final */}
      {isDeleteAllStep2Open && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-red-600 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2.5 bg-red-950/90 border border-red-800 text-red-400 rounded-xl animate-pulse">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-red-400">Final Confirmation</h3>
                <p className="text-xs text-slate-400">Are you absolutely sure?</p>
              </div>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-semibold">
              Are you absolutely sure? This action cannot be undone. All operational database records will be erased immediately.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsDeleteAllStep2Open(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                No, Keep My Data
              </button>
              <button
                type="button"
                onClick={handleExecuteDeleteAllFinal}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl shadow-lg cursor-pointer transition-colors"
              >
                Yes, Delete All Data Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
