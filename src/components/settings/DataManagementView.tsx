import {
  AlertOctagon,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Database,
  Download,
  FolderTree,
  Lock,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
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
    resetAllTransactionData,
    exportDataJson,
    logAudit,
  } = useApp();

  const isSuperAdmin = currentUserRole === 'Super Admin';
  const summaryCounts: DataSummaryCounts = getDataSummaryCounts();

  // Reset to Clean Demo Dataset Modal
  const [isDemoResetModalOpen, setIsDemoResetModalOpen] = useState(false);
  const [demoResetConfirmInput, setDemoResetConfirmInput] = useState('');
  const [demoSuccessNotice, setDemoSuccessNotice] = useState<string | null>(null);

  // RESET ALL TRANSACTION DATA Modal
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetConfirmInput, setResetConfirmInput] = useState('');
  const [resetSuccessNotice, setResetSuccessNotice] = useState<string | null>(null);
  const [resetErrorNotice, setResetErrorNotice] = useState<string | null>(null);

  // Download Manual Backup
  const handleDownloadBackup = () => {
    try {
      const backupJson = exportDataJson();
      const blob = new Blob([backupJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `MSS_SECURITY_SYSTEM_BACKUP_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      logAudit('Manual Backup Export', 'System', 'BACKUP', 'Super Admin manually exported JSON safety backup');
    } catch (err) {
      console.error('Backup download error:', err);
    }
  };

  // Demo Reset Handlers
  const handleOpenDemoResetModal = () => {
    if (!isSuperAdmin) return;
    setDemoResetConfirmInput('');
    setIsDemoResetModalOpen(true);
  };

  const handleExecuteDemoReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (demoResetConfirmInput.trim() !== 'RESET') return;

    resetToCleanInitialDataset();
    logAudit('Reset Dataset', 'System', 'ALL', 'Super Admin reset application to clean initial demo dataset');
    setIsDemoResetModalOpen(false);
    setDemoSuccessNotice('Application has been successfully reset to the initial demo baseline dataset.');
    setTimeout(() => setDemoSuccessNotice(null), 6000);
  };

  // RESET ALL TRANSACTION DATA Handlers
  const handleOpenResetModal = () => {
    if (!isSuperAdmin) return;
    setResetConfirmInput('');
    setResetErrorNotice(null);
    setIsResetModalOpen(true);
  };

  const handleExecuteResetAllData = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetConfirmInput.trim() !== 'DELETE ALL DATA') {
      return;
    }

    try {
      const res = resetAllTransactionData();
      if (res && res.success) {
        setIsResetModalOpen(false);
        setResetSuccessNotice(
          'All transaction and operational entries have been permanently deleted across all modules. Chart of Accounts, Master Profiles, and System Configurations are preserved with PKR 0.00 balances. A full safety backup JSON file was generated.'
        );
        setTimeout(() => setResetSuccessNotice(null), 10000);
      } else {
        setResetErrorNotice(res?.error || 'Failed to complete transaction reset.');
      }
    } catch (err: any) {
      setResetErrorNotice(err?.message || 'Error occurred while resetting data.');
    }
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
            Database summary metrics, full safety backups, clean start from zero, and administrative data controls.
          </p>
        </div>

        <button
          onClick={handleDownloadBackup}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-slate-700 shadow-md transition-colors cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Download Safety Backup JSON</span>
        </button>
      </div>

      {/* Success & Error Alerts */}
      {resetSuccessNotice && (
        <div className="p-4 rounded-xl border bg-emerald-950/90 border-emerald-700 text-emerald-100 text-xs flex items-start gap-3 animate-in fade-in shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-semibold">{resetSuccessNotice}</p>
        </div>
      )}

      {resetErrorNotice && (
        <div className="p-4 rounded-xl border bg-red-950/90 border-red-700 text-red-100 text-xs flex items-start gap-3 animate-in fade-in shadow-lg">
          <AlertOctagon className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-semibold">{resetErrorNotice}</p>
        </div>
      )}

      {demoSuccessNotice && (
        <div className="p-4 rounded-xl border bg-amber-950/90 border-amber-800 text-amber-200 text-xs flex items-start gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-semibold">{demoSuccessNotice}</p>
        </div>
      )}

      {!isSuperAdmin && (
        <div className="p-4 rounded-xl border bg-amber-950/60 border-amber-800/80 text-amber-200 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Access Restricted</p>
            <p className="mt-0.5 text-amber-300/80">
              Only the <strong>Super Admin</strong> role has permission to execute Clean Resets or Reset All Transaction Data operations. Switch to Super Admin in the role selector if you have appropriate authorization.
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
            Total Records in Database: <strong className="text-white">{summaryCounts.totalRecordsCount}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Accounting Vouchers</span>
              <div className="text-xl font-black text-amber-400 mt-0.5">{summaryCounts.journalEntriesCount}</div>
            </div>
            <div className="p-2 bg-amber-950/80 text-amber-400 rounded-lg">
              <Database className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Invoices Generated</span>
              <div className="text-xl font-black text-blue-400 mt-0.5">{summaryCounts.invoicesCount}</div>
            </div>
            <div className="p-2 bg-blue-950/80 text-blue-400 rounded-lg">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Cash/Bank Expenses</span>
              <div className="text-xl font-black text-rose-400 mt-0.5">{summaryCounts.expensesCount}</div>
            </div>
            <div className="p-2 bg-rose-950/80 text-rose-400 rounded-lg">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Attendance Records</span>
              <div className="text-xl font-black text-purple-400 mt-0.5">{summaryCounts.attendanceCount}</div>
            </div>
            <div className="p-2 bg-purple-950/80 text-purple-400 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Stock Movements</span>
              <div className="text-xl font-black text-teal-400 mt-0.5">{summaryCounts.inventoryTransactionsCount}</div>
            </div>
            <div className="p-2 bg-teal-950/80 text-teal-400 rounded-lg">
              <FolderTree className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Active Force (Guards)</span>
              <div className="text-xl font-black text-emerald-400 mt-0.5">{summaryCounts.guardsCount}</div>
            </div>
            <div className="p-2 bg-emerald-950/80 text-emerald-400 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Client Sites</span>
              <div className="text-xl font-black text-cyan-400 mt-0.5">{summaryCounts.sitesCount}</div>
            </div>
            <div className="p-2 bg-cyan-950/80 text-cyan-400 rounded-lg">
              <FolderTree className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Armoury Weapons</span>
              <div className="text-xl font-black text-rose-400 mt-0.5">{summaryCounts.armouryRecordsCount}</div>
            </div>
            <div className="p-2 bg-rose-950/80 text-rose-400 rounded-lg">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* PRIMARY FEATURE: RESET ALL TRANSACTION DATA */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-red-800/70 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-red-950/90 border border-red-700 text-red-400 rounded-2xl shadow-inner">
              <AlertOctagon className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight font-display">
                  RESET ALL TRANSACTION DATA
                </h2>
                <span className="px-2 py-0.5 bg-red-950 text-red-300 border border-red-800 rounded-full text-[10px] font-bold tracking-wider uppercase">
                  Super Admin Only
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Remove ALL operational and transactional entries from EVERY module/tab and return the software to a clean fresh-data state.
              </p>
            </div>
          </div>

          <button
            disabled={!isSuperAdmin}
            onClick={handleOpenResetModal}
            className="py-3 px-5 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xl flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 hover:shadow-red-950/50"
          >
            <Trash2 className="w-4 h-4" />
            <span>RESET ALL TRANSACTION DATA</span>
          </button>
        </div>

        {/* Clear Explanation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          {/* Box 1: Reset to Zero */}
          <div className="bg-red-950/30 border border-red-900/60 rounded-xl p-4 space-y-2.5">
            <h4 className="font-bold text-red-300 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span>All Transactional Entries Reset to Zero (0)</span>
            </h4>
            <ul className="space-y-1.5 text-slate-300 pl-4 list-disc leading-relaxed">
              <li><strong>All Transaction Totals:</strong> Set to 0.00</li>
              <li><strong>All Financial Statements:</strong> P&L, Balance Sheet, Trial Balance show 0.00</li>
              <li><strong>All Fiscal Year Opening Balances:</strong> Reset to 0.00 (Status: Draft)</li>
              <li><strong>All Journals & Vouchers:</strong> Cleared to empty list (0)</li>
              <li><strong>All General Ledger Balances:</strong> Reconciled to 0.00</li>
              <li><strong>All Client Invoices & Receivables:</strong> Outstanding set to 0.00</li>
              <li><strong>All Salary Slips & Payroll Entries:</strong> Cleared (0)</li>
              <li><strong>All Cash / Bank Multi-Account Transactions:</strong> Cleared (0)</li>
              <li><strong>All Inventory Stock Movements:</strong> Current item quantities reset to 0</li>
              <li><strong>All Guard Attendance Logs:</strong> Cleared (0)</li>
              <li><strong>Deployments & Weapons:</strong> Status reset to Available / Unassigned</li>
            </ul>
          </div>

          {/* Box 2: Preserved Master Data */}
          <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-xl p-4 space-y-2.5">
            <h4 className="font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Master Data & Settings Preserved</span>
            </h4>
            <ul className="space-y-1.5 text-slate-300 pl-4 list-disc leading-relaxed">
              <li><strong>Company Profile:</strong> Mountain Security Services branding, address, NTN & contact info</li>
              <li><strong>Chart of Accounts:</strong> All 16 primary accounts retained ready for real entries</li>
              <li><strong>Client Profiles:</strong> All client names, codes, contacts, and contracted rates</li>
              <li><strong>Site Directories:</strong> All operational sites and deployment location names</li>
              <li><strong>Guard Personnel:</strong> Master personnel roster (CNIC, names, phones, status)</li>
              <li><strong>Armoury Catalog:</strong> Weapon registry (make, model, caliber, license numbers)</li>
              <li><strong>Inventory Item Catalog:</strong> Uniform & equipment definitions and categories</li>
              <li><strong>Finance Accounts & Heads:</strong> Bank accounts, cash drawers, and expense categories</li>
              <li><strong>Security Configuration:</strong> User credentials, role passwords, and policy settings</li>
            </ul>
          </div>
        </div>

        {/* Safety Guarantee Notice */}
        <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5 text-slate-300">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              <strong>Automated Safety Backup Guarantee:</strong> Executing this reset triggers an immediate, full JSON backup download of your database to your local machine before any data is cleared.
            </span>
          </div>
          <button
            type="button"
            onClick={handleDownloadBackup}
            className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer shrink-0"
          >
            Export Backup Now
          </button>
        </div>
      </div>

      {/* SECONDARY CARD: RESET TO CLEAN INITIAL DEMO DATASET */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-950/80 border border-amber-800 text-amber-400 rounded-xl">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Reset to Clean Demo Dataset
              </h3>
              <p className="text-[11px] text-slate-400">Restore standard demo baseline records for testing</p>
            </div>
          </div>

          <button
            disabled={!isSuperAdmin}
            onClick={handleOpenDemoResetModal}
            className="py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restore Demo Dataset...</span>
          </button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Restores sample operational entries (sample guards, sample vouchers, sample clients) for demonstration or training purposes while preserving company settings and chart of accounts.
        </p>
      </div>

      {/* MODAL: RESET ALL TRANSACTION DATA CONFIRMATION */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-red-600 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3.5 pb-3 border-b border-slate-800">
              <div className="p-3 bg-red-950/90 border border-red-800 text-red-400 rounded-xl animate-pulse">
                <AlertOctagon className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-black text-red-400 uppercase tracking-tight">
                  RESET ALL TRANSACTION DATA
                </h3>
                <p className="text-xs text-slate-400">Super Admin Authorization & Safety Verification</p>
              </div>
            </div>

            {/* Exact Warning Dialog Required */}
            <div className="bg-red-950/50 border border-red-800/80 rounded-xl p-4 text-xs space-y-3">
              <p className="font-black text-red-300 tracking-wider uppercase text-[11px] flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span>WARNING:</span>
              </p>
              <div className="text-slate-100 font-medium leading-relaxed space-y-2">
                <p>
                  This will permanently delete <strong>ALL</strong> operational and transactional data from the system.
                </p>
                <p>
                  Accounts, master settings, users, permissions, categories and configuration will be preserved.
                </p>
                <p className="font-bold text-red-200">
                  This action cannot be undone.
                </p>
                <p className="font-bold text-white pt-1">
                  Are you sure you want to continue?
                </p>
              </div>
            </div>

            {resetErrorNotice && (
              <div className="p-3 rounded-lg bg-red-950 border border-red-700 text-red-200 text-xs">
                {resetErrorNotice}
              </div>
            )}

            <form onSubmit={handleExecuteResetAllData} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Type <strong className="text-red-400 font-mono font-black select-all">DELETE ALL DATA</strong> to enable confirmation:
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={resetConfirmInput}
                  onChange={(e) => setResetConfirmInput(e.target.value)}
                  placeholder="Type DELETE ALL DATA"
                  className="w-full bg-slate-950 border-2 border-red-900/80 rounded-xl p-3 text-white font-mono font-bold tracking-wider placeholder:text-slate-600 focus:border-red-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetConfirmInput.trim() !== 'DELETE ALL DATA'}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xl cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Confirm Reset All Data</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESET DEMO DATASET */}
      {isDemoResetModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2.5 bg-amber-950/80 border border-amber-800 text-amber-400 rounded-xl">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Restore Demo Dataset</h3>
                <p className="text-xs text-slate-400">Baseline seed data confirmation</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This will restore standard baseline sample records while keeping your Chart of Accounts, Categories, Company branding, and Super Admin settings intact.
            </p>

            <form onSubmit={handleExecuteDemoReset} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Please type <strong className="text-amber-400 font-mono">RESET</strong> to confirm:
                </label>
                <input
                  type="text"
                  required
                  value={demoResetConfirmInput}
                  onChange={(e) => setDemoResetConfirmInput(e.target.value)}
                  placeholder="Type RESET"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDemoResetModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={demoResetConfirmInput.trim() !== 'RESET'}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Confirm Demo Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
