import {
  AlertCircle,
  Building,
  CheckCircle2,
  Copy,
  Database,
  Download,
  Eye,
  EyeOff,
  FileCheck,
  History,
  KeyRound,
  Lock,
  Phone,
  RefreshCw,
  Save,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Unlock,
  Upload,
  UserCheck,
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CompanySettings, DEFAULT_ROLE_PASSWORDS, UserRole } from '../../types';

const ROLES_LIST: { role: UserRole; title: string; desc: string; color: string }[] = [
  {
    role: 'Super Admin',
    title: 'Super Admin (Ali Akbar)',
    desc: 'Unrestricted full access to finance, weapons, staff, company settings, and master data.',
    color: 'text-purple-400 bg-purple-950/60 border-purple-800/80',
  },
  {
    role: 'Accountant',
    title: 'Accountant / Finance Officer',
    desc: 'Access to general ledger, vouchers, salary disbursements, and client invoicing.',
    color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/80',
  },
  {
    role: 'HR Manager',
    title: 'HR & Personnel Manager',
    desc: 'Security guards onboarding, documents verification, sites deployment, and attendance.',
    color: 'text-blue-400 bg-blue-950/60 border-blue-800/80',
  },
  {
    role: 'Armoury Officer',
    title: 'Armoury & Ordnance Keeper',
    desc: 'Weapons registry, ammunition stock, license expiry, and weapons handover issues.',
    color: 'text-amber-400 bg-amber-950/60 border-amber-800/80',
  },
  {
    role: 'Site Supervisor',
    title: 'Field & Site Supervisor',
    desc: 'Site patrol status, guard daily roll call, and incidents reporting.',
    color: 'text-teal-400 bg-teal-950/60 border-teal-800/80',
  },
  {
    role: 'Viewer',
    title: 'Auditor / Viewer Only',
    desc: 'Read-only inspection access without editing or financial authorization capabilities.',
    color: 'text-slate-400 bg-slate-800 border-slate-700',
  },
];

export const SettingsView: React.FC = () => {
  const {
    companySettings,
    updateCompanySettings,
    securitySettings,
    updateSecuritySettings,
    updateRolePassword,
    lockSystem,
    auditLogs,
    exportDataJson,
    importDataJson,
    resetToInitialData,
  } = useApp();

  const [formData, setFormData] = useState<CompanySettings>(companySettings);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [passwordSaveSuccess, setPasswordSaveSuccess] = useState(false);
  const [auditFilter, setAuditFilter] = useState('');

  // Password fields state for each role
  const [editedPasswords, setEditedPasswords] = useState<Record<UserRole, string>>({
    'Super Admin': securitySettings.passwords['Super Admin'] || DEFAULT_ROLE_PASSWORDS['Super Admin'],
    Accountant: securitySettings.passwords['Accountant'] || DEFAULT_ROLE_PASSWORDS['Accountant'],
    'HR Manager': securitySettings.passwords['HR Manager'] || DEFAULT_ROLE_PASSWORDS['HR Manager'],
    'Armoury Officer': securitySettings.passwords['Armoury Officer'] || DEFAULT_ROLE_PASSWORDS['Armoury Officer'],
    'Site Supervisor': securitySettings.passwords['Site Supervisor'] || DEFAULT_ROLE_PASSWORDS['Site Supervisor'],
    Viewer: securitySettings.passwords['Viewer'] || DEFAULT_ROLE_PASSWORDS['Viewer'],
  });

  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedRole, setCopiedRole] = useState<string | null>(null);

  const togglePasswordVisibility = (role: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [role]: !prev[role] }));
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanySettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSavePasswords = (e: React.FormEvent) => {
    e.preventDefault();
    updateSecuritySettings({
      passwords: { ...editedPasswords },
    });
    setPasswordSaveSuccess(true);
    setTimeout(() => setPasswordSaveSuccess(false), 3000);
  };

  const handleResetPasswords = () => {
    if (confirm('Are you sure you want to restore default passwords for all 6 roles?')) {
      setEditedPasswords({ ...DEFAULT_ROLE_PASSWORDS });
      updateSecuritySettings({
        passwords: { ...DEFAULT_ROLE_PASSWORDS },
      });
      setPasswordSaveSuccess(true);
      setTimeout(() => setPasswordSaveSuccess(false), 3000);
    }
  };

  const copyPasswordToClipboard = (role: UserRole, pass: string) => {
    navigator.clipboard.writeText(pass);
    setCopiedRole(role);
    setTimeout(() => setCopiedRole(null), 2000);
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

      {/* Role Security & Passwords Section */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-950/80 border border-amber-800/80 rounded-xl">
              <KeyRound className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>Role Passwords & Access Control</span>
                <span className="text-xs normal-case font-normal text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                  Switch Active Role Security
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Set and update authorization passwords required when switching active operational roles.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {passwordSaveSuccess && (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-800 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>Passwords Saved!</span>
              </span>
            )}
            <button
              onClick={lockSystem}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 font-bold text-xs rounded-xl cursor-pointer transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Test Lock System</span>
            </button>
          </div>
        </div>

        {/* Password Requirement Master Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Enforce Password on Role Switch (پاس ورڈ تصدیق لازمی)</span>
            </div>
            <p className="text-[11px] text-slate-400">
              When enabled, any operator attempting to switch to a role (Super Admin, Accountant, etc.) must enter that role's password.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={securitySettings.requirePasswordOnSwitch}
              onChange={(e) => updateSecuritySettings({ requirePasswordOnSwitch: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Role Passwords Form */}
        <form onSubmit={handleSavePasswords} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ROLES_LIST.map((item) => {
              const currentPass = editedPasswords[item.role] || '';
              const isVisible = visiblePasswords[item.role] || false;
              const isCopied = copiedRole === item.role;
              const defaultPass = DEFAULT_ROLE_PASSWORDS[item.role];

              return (
                <div
                  key={item.role}
                  className="bg-slate-900 border border-slate-800/90 rounded-xl p-4 space-y-3 flex flex-col justify-between hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${item.color}`}>
                        {item.role}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Def: <strong className="text-slate-300">{defaultPass}</strong>
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white">{item.title}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{item.desc}</p>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <label className="block text-[11px] font-semibold text-slate-300">
                      Access Password:
                    </label>
                    <div className="relative">
                      <input
                        type={isVisible ? 'text' : 'password'}
                        value={currentPass}
                        onChange={(e) =>
                          setEditedPasswords({
                            ...editedPasswords,
                            [item.role]: e.target.value,
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono tracking-wider focus:outline-hidden focus:border-blue-500 pr-16"
                        placeholder={`Password for ${item.role}...`}
                      />
                      <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => copyPasswordToClipboard(item.role, currentPass)}
                          title="Copy Password"
                          className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer"
                        >
                          {isCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(item.role)}
                          title={isVisible ? 'Hide Password' : 'Show Password'}
                          className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer"
                        >
                          {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={handleResetPasswords}
              className="text-xs text-slate-400 hover:text-slate-200 underline cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Restore Default Passwords for All Roles</span>
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save & Apply Role Passwords</span>
            </button>
          </div>
        </form>
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

          <form onSubmit={handleSaveCompany} className="space-y-4 text-xs">
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
