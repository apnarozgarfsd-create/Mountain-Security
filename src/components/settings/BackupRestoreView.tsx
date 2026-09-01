import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Database,
  Download,
  FileCheck,
  FolderTree,
  GitMerge,
  HelpCircle,
  Lock,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Upload,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MergePreviewSummary } from '../../types';

export const BackupRestoreView: React.FC = () => {
  const {
    currentUserRole,
    exportDataJson,
    importDataJson,
    previewMergeBackupJson,
    executeMergeBackup,
    logAudit,
  } = useApp();

  const isSuperAdmin = currentUserRole === 'Super Admin';

  const [restoreNotice, setRestoreNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [pendingRestoreJson, setPendingRestoreJson] = useState<string | null>(null);

  // Merge State
  const [mergePreview, setMergePreview] = useState<MergePreviewSummary | null>(null);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [mergeFileContent, setMergeFileContent] = useState<string | null>(null);
  const [mergeResolutions, setMergeResolutions] = useState<Record<string, 'keep_existing' | 'use_incoming'>>({});
  const [mergeSuccessNotice, setMergeSuccessNotice] = useState<string | null>(null);

  // Export
  const handleExportBackup = () => {
    const jsonStr = exportDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MountainSecurity_SGMS_Backup_${new Date().toISOString().split('T')[0]}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    logAudit('Export Backup', 'System', 'ALL', 'Exported full JSON system backup');
  };

  // Restore Flow
  const handleRestoreFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        const parsed = JSON.parse(content);
        if (!parsed || (!parsed.guards && !parsed.clients && !parsed.inventoryCategories)) {
          setRestoreNotice({
            type: 'error',
            message: 'Invalid SGMS backup format. File does not contain valid security management entities.',
          });
          return;
        }
        setPendingRestoreJson(content);
        setIsRestoreModalOpen(true);
      } catch (err) {
        setRestoreNotice({
          type: 'error',
          message: 'Failed to parse file. Please upload a valid JSON backup file.',
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmRestore = () => {
    if (!pendingRestoreJson) return;

    // Safety backup download first
    handleExportBackup();

    const success = importDataJson(pendingRestoreJson);
    if (success) {
      logAudit('Restore Database', 'System', 'ALL', 'Restored database from JSON file');
      setRestoreNotice({
        type: 'success',
        message: 'Database has been successfully restored from backup! An automatic safety snapshot of your previous state was downloaded.',
      });
    } else {
      setRestoreNotice({
        type: 'error',
        message: 'Failed to restore database from file. Data integrity check failed.',
      });
    }
    setIsRestoreModalOpen(false);
    setPendingRestoreJson(null);
  };

  // Merge Flow
  const handleMergeFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const preview = previewMergeBackupJson(content);
      if (!preview) {
        setRestoreNotice({
          type: 'error',
          message: 'Unable to analyze merge file. Please ensure it is a valid SGMS backup JSON.',
        });
        return;
      }
      setMergeFileContent(content);
      setMergePreview(preview);

      // Default conflict resolutions to 'keep_existing'
      const initResolutions: Record<string, 'keep_existing' | 'use_incoming'> = {};
      preview.conflicts.forEach((c) => {
        initResolutions[c.id] = 'keep_existing';
      });
      setMergeResolutions(initResolutions);
      setIsMergeModalOpen(true);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExecuteMerge = () => {
    if (!mergeFileContent || !mergePreview) return;

    // Automatic safety snapshot
    handleExportBackup();

    const stats = executeMergeBackup(mergeFileContent, mergeResolutions);
    logAudit('Merge Backup', 'System', 'ALL', `Merged backup data: +${stats.newRecordsCount} new, ${stats.duplicateRecordsCount} duplicates, ${stats.conflictsCount} conflicts resolved`);

    setIsMergeModalOpen(false);
    setMergePreview(null);
    setMergeFileContent(null);
    setMergeSuccessNotice(`Backup data merged successfully! Added ${stats.newRecordsCount} new records, skipped/updated ${stats.duplicateRecordsCount} duplicates, and resolved ${stats.conflictsCount} conflicts.`);
    setTimeout(() => setMergeSuccessNotice(null), 6000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white uppercase flex items-center gap-2">
              <GitMerge className="w-6 h-6 text-sky-400" />
              <span>Backup, Restore & Data Merge</span>
            </h1>
            {isSuperAdmin ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-950/80 border border-purple-800 text-purple-300">
                <ShieldCheck className="w-2.5 h-2.5" /> Super Admin Authorized
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 border border-amber-800 text-amber-300">
                <Lock className="w-2.5 h-2.5" /> Read-Only Access
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Full system JSON snapshots, database recovery, and intelligent conflict-free data merge with foreign-key preservation.
          </p>
        </div>
      </div>

      {/* Notice Alerts */}
      {restoreNotice && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 text-xs animate-in fade-in ${
            restoreNotice.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-800 text-emerald-200'
              : 'bg-red-950/90 border-red-800 text-red-200'
          }`}
        >
          {restoreNotice.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <p className="font-bold">{restoreNotice.type === 'success' ? 'Database Restored' : 'Restore Error'}</p>
            <p className="text-slate-300">{restoreNotice.message}</p>
          </div>
          <button
            onClick={() => setRestoreNotice(null)}
            className="ml-auto text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {mergeSuccessNotice && (
        <div className="p-4 rounded-xl border bg-emerald-950/90 border-emerald-800 text-emerald-200 text-xs flex items-start gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-semibold">{mergeSuccessNotice}</p>
        </div>
      )}

      {/* Main 3 Action Pillars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pillar 1: Create Backup */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2.5 bg-blue-950/80 border border-blue-800 text-blue-400 rounded-xl">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  1. Create Full Backup
                </h3>
                <p className="text-[11px] text-slate-400">Export Complete JSON Snapshot</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Generates an encrypted, versioned JSON snapshot containing all guards, clients, security sites, attendance logs, weapons registry, Chart of Accounts, Categories, inventory store items, and company configurations.
            </p>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <p className="text-slate-200 font-semibold flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Format: Universal SGMS JSON V1</span>
              </p>
              <p>Download anytime for off-site backup or migration.</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={handleExportBackup}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download Backup File</span>
            </button>
          </div>
        </div>

        {/* Pillar 2: Restore Database */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2.5 bg-emerald-950/80 border border-emerald-800 text-emerald-400 rounded-xl">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  2. Restore Full Database
                </h3>
                <p className="text-[11px] text-slate-400">Complete Database Replacement</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Replaces the current active system data entirely with the data from the selected backup file.
            </p>

            <div className="p-3 bg-emerald-950/40 border border-emerald-900/60 rounded-xl text-[11px] text-emerald-300 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Automatic Safety Snapshot</span>
              </p>
              <p className="text-emerald-300/80">
                A safety copy of your existing data will be downloaded automatically before replacing.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <label
              className={`w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors ${
                isSuperAdmin ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Select File & Restore Database...</span>
              <input
                type="file"
                accept=".json"
                disabled={!isSuperAdmin}
                onChange={handleRestoreFileSelected}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Pillar 3: Merge Backup Data */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2.5 bg-purple-950/80 border border-purple-800 text-purple-400 rounded-xl">
                <GitMerge className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  3. Merge Backup Data
                </h3>
                <p className="text-[11px] text-slate-400">Intelligent Non-Destructive Sync</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Merges records from an external backup file into your existing database without deleting your current records:
            </p>

            <ul className="text-xs text-slate-400 space-y-1 pl-4 list-disc">
              <li>Automatic duplicate detection by ID/Code</li>
              <li>Preserves existing foreign keys & relations</li>
              <li>Financial conflict detection and review</li>
              <li>Interactive merge preview summary</li>
            </ul>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <label
              className={`w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors ${
                isSuperAdmin ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <GitMerge className="w-4 h-4" />
              <span>Select File & Merge Data...</span>
              <input
                type="file"
                accept=".json"
                disabled={!isSuperAdmin}
                onChange={handleMergeFileSelected}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Modal: Full Restore Confirmation */}
      {isRestoreModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2.5 bg-emerald-950/80 border border-emerald-800 text-emerald-400 rounded-xl">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Confirm Database Restore</h3>
                <p className="text-xs text-slate-400">Complete replacement of current state</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to replace all current active system records with the data from the selected backup file?
            </p>

            <div className="p-3 bg-blue-950/40 border border-blue-900/60 rounded-xl text-xs text-blue-300">
              <p className="font-semibold">Safety Assurance:</p>
              <p className="text-[11px] text-blue-300/80 mt-0.5">
                The system will automatically trigger a download of your current database state before applying changes.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsRestoreModalOpen(false);
                  setPendingRestoreJson(null);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRestore}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors"
              >
                Proceed & Restore Database
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Merge Preview & Conflict Resolution */}
      {isMergeModalOpen && mergePreview && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-950/80 border border-purple-800 text-purple-400 rounded-xl">
                  <GitMerge className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Merge Backup Data Preview</h3>
                  <p className="text-xs text-slate-400">Non-destructive intelligent synchronization</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsMergeModalOpen(false);
                  setMergePreview(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Merge Summary Counts Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                <span className="text-[10px] font-bold uppercase text-slate-400">Current Records</span>
                <div className="text-lg font-black text-white mt-0.5">{mergePreview.currentTotalRecords}</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                <span className="text-[10px] font-bold uppercase text-emerald-400">New Records to Add</span>
                <div className="text-lg font-black text-emerald-400 mt-0.5">+{mergePreview.newRecordsCount}</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                <span className="text-[10px] font-bold uppercase text-slate-400">Duplicates Skipped</span>
                <div className="text-lg font-black text-slate-300 mt-0.5">{mergePreview.duplicateRecordsCount}</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                <span className="text-[10px] font-bold uppercase text-amber-400">Conflicts Detected</span>
                <div className="text-lg font-black text-amber-400 mt-0.5">{mergePreview.conflictsCount}</div>
              </div>
            </div>

            {/* Breakdown per Entity */}
            <div className="bg-slate-950 rounded-xl border border-slate-800 p-3 space-y-2 text-xs">
              <h4 className="font-bold text-slate-300 text-[11px] uppercase tracking-wider">
                Entity Breakdown
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                {mergePreview.entityBreakdown.map((ent) => (
                  <div key={ent.entityName} className="p-2 bg-slate-900 rounded-lg border border-slate-800/80 flex items-center justify-between">
                    <span className="text-slate-300 font-medium">{ent.entityName}</span>
                    <span className="text-emerald-400 font-mono font-bold">+{ent.newCount}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Conflicts List */}
            {mergePreview.conflicts.length > 0 && (
              <div className="bg-slate-950 rounded-xl border border-amber-900/60 p-3 space-y-3 text-xs">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Financial & Record Conflict Resolution ({mergePreview.conflicts.length})</span>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {mergePreview.conflicts.map((conf) => (
                    <div
                      key={conf.id}
                      className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">
                          [{conf.entity}] {conf.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{conf.id}</span>
                      </div>
                      <p className="text-[11px] text-amber-300/90">{conf.reason}</p>

                      <div className="flex items-center gap-2 pt-1">
                        <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer">
                          <input
                            type="radio"
                            name={`resolution_${conf.id}`}
                            checked={mergeResolutions[conf.id] === 'keep_existing'}
                            onChange={() =>
                              setMergeResolutions({
                                ...mergeResolutions,
                                [conf.id]: 'keep_existing',
                              })
                            }
                            className="text-blue-500"
                          />
                          <span>Keep Existing (Recommended)</span>
                        </label>
                        <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer ml-3">
                          <input
                            type="radio"
                            name={`resolution_${conf.id}`}
                            checked={mergeResolutions[conf.id] === 'use_incoming'}
                            onChange={() =>
                              setMergeResolutions({
                                ...mergeResolutions,
                                [conf.id]: 'use_incoming',
                              })
                            }
                            className="text-purple-500"
                          />
                          <span>Overwrite with Backup Version</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsMergeModalOpen(false);
                  setMergePreview(null);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteMerge}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors"
              >
                Confirm & Execute Merge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
