import {
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  LogOut,
  Shield,
  ShieldCheck,
  Unlock,
} from 'lucide-react';
import React, { useState } from 'react';
import { MountainLogo } from '../../components/common/MountainLogo';
import { useApp } from '../../context/AppContext';
import { DEFAULT_ROLE_PASSWORDS, UserRole } from '../../types';

export const SystemLockScreen: React.FC = () => {
  const {
    securitySettings,
    currentUserRole,
    unlockSystem,
    requestRoleSwitch,
    companySettings,
  } = useApp();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!securitySettings.isLocked) {
    return null;
  }

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }
    const res = unlockSystem(password);
    if (!res.success) {
      setErrorMsg(res.error || 'Invalid password.');
    } else {
      setPassword('');
      setErrorMsg('');
    }
  };

  const defaultHint = DEFAULT_ROLE_PASSWORDS[currentUserRole];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4 selection:bg-red-500 selection:text-white">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Logo & Header */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner">
            <MountainLogo size="lg" showText={false} />
          </div>
          <div>
            <h2 className="text-lg font-black font-display tracking-wider text-white uppercase">
              {companySettings.name || 'MOUNTAIN SECURITY SERVICES'}
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              MSS Security Management System
            </p>
          </div>
        </div>

        {/* Lock Status Pill */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-950/80 border border-amber-800/80 text-amber-300 rounded-full text-xs font-bold">
            <Lock className="w-3.5 h-3.5" />
            <span>SYSTEM LOCKED</span>
          </div>
          <div className="text-xs text-slate-300">
            Active Session Role: <strong className="text-blue-400 font-bold">{currentUserRole}</strong>
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3 bg-red-950/80 border border-red-800 text-xs text-red-300 rounded-xl text-left flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">{errorMsg}</p>
              <p className="text-[11px] text-red-400/90">
                Default password: <code className="bg-red-900/60 px-1.5 py-0.5 rounded font-mono font-bold text-white">{defaultHint}</code> (or Super Admin: <code className="bg-red-900/60 px-1.5 py-0.5 rounded font-mono font-bold text-white">admin123</code>)
              </p>
            </div>
          </div>
        )}

        {/* Unlock Form */}
        <form onSubmit={handleUnlock} className="space-y-4 text-left">
          <div>
            <label className="block text-xs text-slate-300 font-semibold mb-1.5">
              Enter Password for {currentUserRole} (or Super Admin Master)
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
                placeholder="Enter password to unlock..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm font-mono tracking-wider focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pr-10"
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

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 text-sm cursor-pointer transition-all active:scale-98"
          >
            <Unlock className="w-4 h-4" />
            <span>Unlock MSS Security Management System</span>
          </button>
        </form>

        <div className="pt-2 text-[11px] text-slate-400">
          MOUNTAIN SECURITY SERVICES (MSS) • Secure Workstation
        </div>
      </div>
    </div>
  );
};
