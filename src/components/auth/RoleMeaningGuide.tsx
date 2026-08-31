import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Info,
  KeyRound,
  Lock,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  X,
} from 'lucide-react';
import React from 'react';
import { UserRole } from '../../types';

export interface RoleGuideItem {
  role: UserRole;
  emoji: string;
  badgeColor: string;
  borderColor: string;
  kyaKarSaktaHai: string;
  scopeSummary: string;
}

export const ROLE_EXPLANATIONS: RoleGuideItem[] = [
  {
    role: 'Super Admin',
    emoji: '👑',
    badgeColor: 'bg-purple-950/80 text-purple-300 border-purple-800',
    borderColor: 'border-purple-800/60 hover:border-purple-500',
    kyaKarSaktaHai:
      'Full control — users, settings, security sites, guards, reports, roles sab manage kar sakta hai.',
    scopeSummary: 'Poore system ka unrestricted access aur master configuration.',
  },
  {
    role: 'Accountant',
    emoji: '💰',
    badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-800',
    borderColor: 'border-emerald-800/60 hover:border-emerald-500',
    kyaKarSaktaHai:
      'Salary, payments, invoices, expenses, billing aur financial reports manage karta hai.',
    scopeSummary: 'Accounts, Multi-account cashbook, vouchers, salary slips aur billing.',
  },
  {
    role: 'HR Manager',
    emoji: '👥',
    badgeColor: 'bg-blue-950/80 text-blue-300 border-blue-800',
    borderColor: 'border-blue-800/60 hover:border-blue-500',
    kyaKarSaktaHai:
      'Guards/employees ka record, hiring, attendance, documents, leave aur HR matters manage karta hai.',
    scopeSummary: 'Guards directory, CNIC/NADRA verification, daily haziri, transfer history.',
  },
  {
    role: 'Armoury Officer',
    emoji: '🔫',
    badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-800',
    borderColor: 'border-amber-800/60 hover:border-amber-500',
    kyaKarSaktaHai:
      'Weapons/arms ka record, issue/return, ammunition aur armoury inventory manage karta hai.',
    scopeSummary: 'Aslah master register, license expiry, guard weapon handover/return slips.',
  },
  {
    role: 'Site Supervisor',
    emoji: '🏢',
    badgeColor: 'bg-teal-950/80 text-teal-300 border-teal-800',
    borderColor: 'border-teal-800/60 hover:border-teal-500',
    kyaKarSaktaHai:
      'Assigned security sites par guards ki attendance, duty, shifts aur site reports manage karta hai.',
    scopeSummary: 'Field deployment, site shifts (Day/Night), daily guard roll call.',
  },
  {
    role: 'Viewer',
    emoji: '👁️',
    badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
    borderColor: 'border-slate-700 hover:border-slate-600',
    kyaKarSaktaHai:
      'Sirf information/reports dekh sakta hai; normally changes nahi kar sakta.',
    scopeSummary: 'Read-only inspection mode for auditors, directors aur guests.',
  },
];

export const RoleMeaningCard: React.FC<{ highlightRole?: UserRole; compact?: boolean }> = ({
  highlightRole,
  compact = false,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl text-left">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-950 border border-blue-800/80 rounded-xl text-blue-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              <span>🔐 Roles ka Simple Meaning & Guide</span>
            </h3>
            <p className="text-xs text-slate-400">
              Har role ke ikhtiyarat aur functions ki aasan Roman Urdu wazahat
            </p>
          </div>
        </div>
      </div>

      {/* Role Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-950/70 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <th className="py-2.5 px-3 font-bold w-44">Role</th>
              <th className="py-2.5 px-3 font-bold">Kya kar sakta hai?</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70">
            {ROLE_EXPLANATIONS.map((item) => {
              const isTarget = highlightRole === item.role;
              return (
                <tr
                  key={item.role}
                  className={`transition-colors ${
                    isTarget
                      ? 'bg-blue-950/60 font-semibold text-white'
                      : 'hover:bg-slate-800/40 text-slate-200'
                  }`}
                >
                  <td className="py-3 px-3 align-top">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-bold text-xs shadow-xs" style={{}} >
                      <span className="text-sm">{item.emoji}</span>
                      <span className={item.badgeColor.split(' ')[1]}>{item.role}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 align-middle">
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      {item.kyaKarSaktaHai}
                    </p>
                    {!compact && (
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        <span className="text-slate-500 font-semibold">Dastras: </span>
                        {item.scopeSummary}
                      </p>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Example Box */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
        <h4 className="font-bold text-amber-400 flex items-center gap-1.5 text-xs uppercase tracking-wide">
          <span>⭐ Example (Misaal)</span>
        </h4>
        <ul className="space-y-1.5 text-slate-300">
          <li className="flex items-start gap-2">
            <span className="text-purple-400 font-bold shrink-0">•</span>
            <span>
              <strong>Agar aap Super Admin select karte hain:</strong> Aapko poore system ka access milega.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 font-bold shrink-0">•</span>
            <span>
              <strong>Agar aap Accountant select karte hain:</strong> Aapko mainly accounts/financial section milega, lekin HR ya armoury ki sensitive settings access nahi hongi.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-400 font-bold shrink-0">•</span>
            <span>
              <strong>Agar aap Site Supervisor select karte hain:</strong> Aap apni assigned sites ke guards aur duties manage karenge.
            </span>
          </li>
        </ul>
      </div>

      {/* Important Note */}
      <div className="p-3 bg-blue-950/40 border border-blue-800/60 rounded-xl flex items-start gap-2.5 text-xs text-blue-200">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-white font-bold">Important: </strong>
          “Switch Active Role” ka matlab usually account change karna nahi, balki same account ke andar apna current access/role change karna hai.
        </p>
      </div>
    </div>
  );
};

export const RoleGuideModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <RoleMeaningCard />

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors"
          >
            Theek Hai / Samjh Aagaya
          </button>
        </div>
      </div>
    </div>
  );
};
