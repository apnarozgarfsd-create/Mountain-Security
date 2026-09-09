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
    resetSystemDataToZero,
    exportDataJson,
    logAudit,
  } = useApp();

  const isSuperAdmin = currentUserRole === 'Super Admin';
  const summaryCounts: DataSummaryCounts = getDataSummaryCounts();

  // Reset to Clean Demo Dataset Modal
  const [isDemoResetModalOpen, setIsDemoResetModalOpen] = useState(false);
  const [demoResetConfirmInput, setDemoResetConfirmInput] = useState('');
  const [demoSuccessNotice, setDemoSuccessNotice] = useState<string | null>(null);

  // START FROM ZERO (Reset System Data) 2-step Modal
  const [isZeroStep1Open, setIsZeroStep1Open] = useState(false);
  const [isZeroStep2Open, setIsZeroStep2Open] = useState(false);
  const [zeroConfirmInput, setZeroConfirmInput] = useState('');
  const [zeroSuccessNotice, setZeroSuccessNotice] = useState<string | null>(null);

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

  // START FROM ZERO Handlers
  const handleOpenZeroStep1 = () => {
    if (!isSuperAdmin) return;
    setZeroConfirmInput('');
    setIsZeroStep1Open(true);
  };

  const handleProceedToZeroStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (zeroConfirmInput.trim().toUpperCase() !== 'START FROM ZERO') return;
    setIsZeroStep1Open(false);
    setIsZeroStep2Open(true);
  };

  const handleExecuteZeroFinal = () => {
    const res = resetSystemDataToZero();
    setIsZeroStep2Open(false);
    if (res.success) {
      setZeroSuccessNotice(
        'System has been successfully reset to ZERO! An automatic safety backup JSON has been downloaded to your computer. All transaction records, vouchers, ledger balances, invoices, and financial reports now stand at 0.00 while all Master Data and Chart of Accounts are preserved.'
      );
      setTimeout(() => setZeroSuccessNotice(null), 10000);
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

      {/* Success Alerts */}
      {zeroSuccessNotice && (
        <div className="p-4 rounded-xl border bg-emerald-950/90 border-emerald-700 text-emerald-100 text-xs flex items-start gap-3 animate-in fade-in shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-semibold">{zeroSuccessNotice}</p>
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
              Only the <strong>Super Admin</strong> role has permission to execute Clean Resets or Start From Zero operations. Switch to Super Admin in the role selector if you have appropriate authorization.
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

      {/* PRIMARY FEATURE: START FROM ZERO (RESET SYSTEM DATA) */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-red-800/70 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-red-950/90 border border-red-700 text-red-400 rounded-2xl shadow-inner">
              <AlertOctagon className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight font-display">
                  RESET SYSTEM DATA • START FROM ZERO
                </h2>
                <span className="px-2 py-0.5 bg-red-950 text-red-300 border border-red-800 rounded-full text-[10px] font-bold tracking-wider uppercase">
                  Admin Only
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Clear all existing transactional, accounting, and operational entries to begin accounting and operations from clean zero.
              </p>
            </div>
          </div>

          <button
            disabled={!isSuperAdmin}
            onClick={handleOpenZeroStep1}
            className="py-3 px-5 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xl flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 hover:shadow-red-950/50"
          >
            <Trash2 className="w-4 h-4" />
            <span>Start From Zero (Reset)...</span>
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

      {/* MODAL 1: START FROM ZERO - STEP 1 CONFIRMATION */}
      {isZeroStep1Open && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-3 bg-red-950/90 border border-red-800 text-red-400 rounded-xl">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-red-400 uppercase">
                  Step 1: Authorization to Reset System Data
                </h3>
                <p className="text-xs text-slate-400">Clear all transactional data & start from zero</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                You are about to clear <strong>ALL</strong> transactional, financial, and operational entries from the system.
              </p>

              <div className="bg-red-950/40 border border-red-900/60 rounded-xl p-3 space-y-1.5 text-[11px] text-red-200">
                <p className="font-bold flex items-center gap-1.5 text-red-300">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Important Confirmation Details:</span>
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>All vouchers, journals, ledger balances, and opening balances will become 0.</li>
                  <li>All invoices, payment records, salary slips, and attendance will be removed.</li>
                  <li>Master records (Chart of Accounts, Clients, Sites, Guards, Weapons, Products) are preserved.</li>
                  <li>An automatic complete JSON backup will download when confirmed.</li>
                </ul>
              </div>
            </div>

            <form onSubmit={handleProceedToZeroStep2} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  To continue, type <strong className="text-red-400 font-mono font-black">START FROM ZERO</strong> below:
                </label>
                <input
                  type="text"
                  required
                  value={zeroConfirmInput}
                  onChange={(e) => setZeroConfirmInput(e.target.value)}
                  placeholder="Type START FROM ZERO"
                  className="w-full bg-slate-950 border border-red-900/80 rounded-xl p-3 text-white font-mono font-bold tracking-wider placeholder:text-slate-600 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsZeroStep1Open(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={zeroConfirmInput.trim().toUpperCase() !== 'START FROM ZERO'}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Proceed to Final Confirmation →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: START FROM ZERO - STEP 2 FINAL CONFIRMATION */}
      {isZeroStep2Open && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-red-600 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3.5 pb-3 border-b border-slate-800">
              <div className="p-3 bg-red-950/90 border border-red-800 text-red-400 rounded-xl animate-pulse">
                <AlertOctagon className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-black text-red-400 uppercase">
                  Final Authorization
                </h3>
                <p className="text-xs text-slate-400">Download backup & reset data to zero</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-200">
              <p className="font-semibold text-white leading-relaxed">
                Clicking the button below will immediately:
              </p>
              <ol className="list-decimal pl-4 space-y-1.5 text-slate-300 leading-relaxed">
                <li>Download your complete safety JSON backup file.</li>
                <li>Reset all transactions, journals, vouchers, and opening balances to 0.00.</li>
                <li>Clear invoices, salary slips, attendance, and stock logs.</li>
                <li>Preserve all Master Data and Chart of Accounts for clean data entry.</li>
              </ol>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsZeroStep2Open(false)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                No, Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteZeroFinal}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xl cursor-pointer transition-all flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Confirm & Reset System to Zero</span>
              </button>
            </div>
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
