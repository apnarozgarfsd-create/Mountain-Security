import {
  Building,
  CheckCircle2,
  Database,
  Download,
  FileCheck,
  History,
  Phone,
  RefreshCw,
  Save,
  Settings,
  ShieldCheck,
  Trash2,
  Upload,
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CompanySettings } from '../../types';

export const SettingsView: React.FC = () => {
  const {
    companySettings,
    updateCompanySettings,
    auditLogs,
    exportDataJson,
    importDataJson,
    resetToInitialData,
  } = useApp();

  const [formData, setFormData] = useState<CompanySettings>(companySettings);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [auditFilter, setAuditFilter] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanySettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExportBackup = () => {
    const jsonStr = exportDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MountainSecurity_SGMS_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importDataJson(content);
      if (success) {
        alert('Database successfully restored from backup file!');
      } else {
        alert('Failed to parse backup JSON file. Please ensure it is a valid SGMS backup.');
      }
    };
    reader.readAsText(file);
  };

  const filteredLogs = auditLogs.filter(
    (l) =>
      l.action.toLowerCase().includes(auditFilter.toLowerCase()) ||
      l.entity.toLowerCase().includes(auditFilter.toLowerCase()) ||
      l.details.toLowerCase().includes(auditFilter.toLowerCase()) ||
      l.userName.toLowerCase().includes(auditFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white uppercase flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-400" />
            <span>Company Branding & System Configuration</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Configure Mountain Security Services official letterheads, licenses, database backup & audit trail.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Company Profile & Slip Header Setup */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-400" />
              <span>Official Slip & Letterhead Profile</span>
            </h3>

            {saveSuccess && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Saved Successfully!</span>
              </span>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-slate-400 font-semibold mb-1">Company Registered Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Arms / Govt License No</label>
                <input
                  type="text"
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">NTN / Tax Registration</label>
                <input
                  type="text"
                  value={formData.taxNumber}
                  onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Official Mobile / Helpline</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Official Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 font-semibold mb-1">Registered Head Office Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 font-semibold mb-1">Corporate Bank Account Details (Print on Invoices)</label>
                <input
                  type="text"
                  value={formData.bankDetails}
                  onChange={(e) => setFormData({ ...formData, bankDetails: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Branding Settings</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right 5 cols: Database Backup, JSON Export & Reset */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <Database className="w-4 h-4 text-blue-400" />
              <span>Data Persistence & Backup Tools</span>
            </h3>

            <p className="text-xs text-slate-400 leading-relaxed">
              Export complete system snapshots including Clients, Sites, Guards, Armoury, Inventory, and General Ledger Vouchers.
            </p>

            <div className="space-y-3 pt-2">
              <button
                onClick={handleExportBackup}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Full Database JSON Backup</span>
              </button>

              <label className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Restore Database from File (.json)</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>

              <button
                onClick={() => {
                  if (confirm('Are you sure you want to reset all data back to the demo initial state? Any unsaved edits will be refreshed.')) {
                    resetToInitialData();
                  }
                }}
                className="w-full py-2 px-4 bg-red-950/40 hover:bg-red-950 text-red-300 border border-red-900/60 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset to Clean Initial Dataset</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* System Audit Trail Viewer */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-purple-400" />
              <span>Immutable System Audit Trail ({auditLogs.length} Events)</span>
            </h3>
            <p className="text-xs text-slate-400">Security event timestamps, voucher postings, and custody handovers.</p>
          </div>

          <input
            type="text"
            placeholder="Filter audit logs..."
            value={auditFilter}
            onChange={(e) => setAuditFilter(e.target.value)}
            className="w-full sm:w-64 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-hidden"
          />
        </div>

        <div className="max-h-72 overflow-y-auto space-y-2">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between text-xs p-2.5 bg-slate-900/70 rounded-lg border border-slate-800/80 gap-2"
            >
              <div className="flex items-center gap-3">
                <span className="bg-slate-800 text-blue-300 font-mono text-[10px] px-2 py-0.5 rounded font-bold">
                  {log.action}
                </span>
                <span className="font-semibold text-slate-200">{log.details}</span>
                <span className="text-[10px] text-slate-500 font-mono">[{log.entity}]</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <span>By: <strong className="text-slate-300">{log.userName}</strong></span>
                <span className="font-mono text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
