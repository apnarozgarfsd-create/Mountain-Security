import {
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Shield,
  ShieldAlert,
  ShieldCheck,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DEFAULT_ROLE_PASSWORDS, UserRole } from '../../types';

export const RoleAuthModal: React.FC = () => {
  const {
    isSecurityModalOpen,
    pendingRoleSwitch,
    confirmRoleSwitch,
    cancelRoleSwitch,
    currentUserRole,
    securitySettings,
  } = useApp();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isSecurityModalOpen || !pendingRoleSwitch) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setErrorMsg('Please enter the password for this role.');
      return;
    }
    setIsVerifying(true);
    setErrorMsg('');

    const res = confirmRoleSwitch(password);
    setIsVerifying(false);
    if (!res.success) {
      setErrorMsg(res.error || 'Authentication failed. Please check the password.');
    } else {
      setPassword('');
      setErrorMsg('');
    }
  };

  const defaultHint = DEFAULT_ROLE_PASSWORDS[pendingRoleSwitch];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-950/90 border border-blue-800/80 rounded-xl">
              <Lock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                <span>Role Access Verification</span>
              </h3>
              <p className="text-xs text-slate-400">Enter authorization password to switch role</p>
            </div>
          </div>
          <button
            onClick={cancelRoleSwitch}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Role Switch Info Box */}
        <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Current Active Role:</span>
            <span className="font-semibold text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded">
              {currentUserRole}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Switching To:</span>
            <span className="font-bold text-blue-400 bg-blue-950/80 border border-blue-800/60 px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              {pendingRoleSwitch}
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-red-950/70 border border-red-800/80 rounded-xl flex items-start gap-2.5 text-xs text-red-300 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">{errorMsg}</p>
              <p className="text-[11px] text-red-400/90">
                Default password for {pendingRoleSwitch} is: <code className="bg-red-900/60 px-1.5 py-0.5 rounded font-mono font-bold text-white">{defaultHint}</code>
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                <span>Password for {pendingRoleSwitch}</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                Default: <span className="font-mono text-slate-300 font-semibold">{defaultHint}</span>
              </span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoFocus
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder={`Enter password for ${pendingRoleSwitch}...`}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white pr-10 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm font-mono tracking-wider placeholder:font-sans placeholder:tracking-normal placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
            <p className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>You can manage and update all role passwords in <strong>Settings & Company Profile</strong>.</span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={cancelRoleSwitch}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl cursor-pointer text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifying}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md cursor-pointer text-xs transition-colors disabled:opacity-50"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isVerifying ? 'Verifying...' : `Unlock ${pendingRoleSwitch}`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
