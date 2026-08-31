import {
  Calendar,
  Download,
  FileText,
  LayoutDashboard,
  MapPin,
  MoreHorizontal,
  Receipt,
  Shield,
  Smartphone,
  Users,
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, onTabChange }) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const { guards, weapons, vouchers } = useApp();

  const mainTabs = [
    { id: 'dashboard', label: 'Home', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'attendance', label: 'حاضری', icon: <Calendar className="w-5 h-5" /> },
    { id: 'guards', label: 'Guards', icon: <Users className="w-5 h-5" /> },
    { id: 'weapons', label: 'Armoury', icon: <Shield className="w-5 h-5" /> },
    { id: 'salary-slips', label: 'Slips', icon: <FileText className="w-5 h-5" /> },
  ];

  const moreTabs = [
    { id: 'sites', label: 'Sites & Deployments', icon: <MapPin className="w-4 h-4 text-emerald-400" /> },
    { id: 'attendance', label: 'Guard Duty & Attendance', icon: <Calendar className="w-4 h-4 text-emerald-400" /> },
    { id: 'vouchers', label: 'Vouchers & Accounts', icon: <Receipt className="w-4 h-4 text-blue-400" /> },
    { id: 'clients', label: 'Client Accounts', icon: <Users className="w-4 h-4 text-cyan-400" /> },
    { id: 'inventory', label: 'Uniforms & Store', icon: <Shield className="w-4 h-4 text-amber-400" /> },
    { id: 'reports', label: 'Reports & Statements', icon: <FileText className="w-4 h-4 text-purple-400" /> },
    { id: 'native-apps', label: 'Android & Windows App', icon: <Smartphone className="w-4 h-4 text-sky-400" /> },
    { id: 'settings', label: 'System Settings', icon: <MoreHorizontal className="w-4 h-4 text-slate-400" /> },
  ];

  return (
    <>
      {/* Slide-up "More" sheet for mobile */}
      {isMoreMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            onClick={() => setIsMoreMenuOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
          />
          <div className="fixed bottom-16 inset-x-0 bg-slate-950 border-t border-slate-800 rounded-t-2xl p-4 space-y-2 z-50 animate-in slide-in-from-bottom duration-200">
            <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-3"></div>
            <div className="text-xs font-black uppercase tracking-wider text-slate-400 px-2 mb-2">
              All Modules & Tools
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {moreTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    onTabChange(tab.id);
                    setIsMoreMenuOpen(false);
                  }}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-left font-bold transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-blue-600/20 border-blue-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {tab.icon}
                  <span className="truncate">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Bar Container */}
      <nav className="no-print fixed bottom-0 inset-x-0 z-40 lg:hidden bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/90 px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-pb">
        {mainTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                onTabChange(tab.id);
                setIsMoreMenuOpen(false);
              }}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
                isActive ? 'text-blue-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {tab.id === 'weapons' && weapons.filter((w) => w.currentStatus === 'Issued').length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-slate-950"></span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{tab.label}</span>
            </button>
          );
        })}

        {/* More Menu Trigger */}
        <button
          onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            isMoreMenuOpen || activeTab === 'native-apps' ? 'text-sky-400 font-bold' : 'text-slate-400'
          }`}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-0.5">More</span>
        </button>
      </nav>
    </>
  );
};
