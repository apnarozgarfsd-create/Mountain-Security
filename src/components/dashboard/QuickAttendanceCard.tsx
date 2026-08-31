import {
  AlertCircle,
  ArrowRight,
  Award,
  Building,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Layers,
  MapPin,
  Shield,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  UserX,
  Zap,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceShift, GuardAttendanceRecord } from '../../types';
import { formatDate } from '../../utils/formatters';

export const QuickAttendanceCard: React.FC = () => {
  const {
    guards,
    sites,
    attendanceRecords,
    markBulkAttendance,
    setActiveTab,
  } = useApp();

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Default to today (or latest active mock date in 2026-08)
  const todayDateStr = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    // If today is in 2026-08, use it, else default to '2026-08-28' for sample sync
    return today.startsWith('2026-08') ? today : '2026-08-28';
  }, []);

  // Filter guards deployed on active sites
  const activeGuards = useMemo(() => {
    return guards.filter((g) => g.status === 'Active');
  }, [guards]);

  const activeSiteGuards = useMemo(() => {
    return activeGuards.filter((g) => !!g.currentSiteId);
  }, [activeGuards]);

  // Today's attendance records
  const todayRecords = useMemo(() => {
    return attendanceRecords.filter((r) => r.date === todayDateStr);
  }, [attendanceRecords, todayDateStr]);

  const todayRecordsByGuardId = useMemo(() => {
    const map = new Map<string, GuardAttendanceRecord>();
    todayRecords.forEach((r) => {
      map.set(r.guardId, r);
    });
    return map;
  }, [todayRecords]);

  // Summary counts
  const fullDayCount = todayRecords.filter((r) => r.status === 'Full Day').length;
  const doubleDutyCount = todayRecords.filter((r) => r.status === 'Double Duty').length;
  const halfDayCount = todayRecords.filter((r) => r.status === 'Half Day' || r.status === 'Short Duty').length;
  const absentCount = todayRecords.filter((r) => r.status === 'Absent').length;
  const leaveCount = todayRecords.filter((r) => r.status === 'Leave').length;

  const totalMarked = todayRecords.length;
  const totalDutyUnits = todayRecords.reduce((sum, r) => sum + (r.dutyUnits || 0), 0);
  const totalOvertimeHours = todayRecords.reduce((sum, r) => sum + (r.overtimeHours || 0), 0);

  const pendingGuards = useMemo(() => {
    return activeSiteGuards.filter((g) => !todayRecordsByGuardId.has(g.id));
  }, [activeSiteGuards, todayRecordsByGuardId]);

  const pendingCount = pendingGuards.length;
  const totalExpectedGuards = activeSiteGuards.length || activeGuards.length || 1;
  const markedPercentage = Math.min(
    100,
    Math.round((totalMarked / (totalExpectedGuards || 1)) * 100)
  );

  // Group active sites and their today's guard attendance stats
  const siteAttendanceSummaries = useMemo(() => {
    return sites
      .filter((s) => s.status === 'Active')
      .map((site) => {
        const siteGuards = activeGuards.filter((g) => g.currentSiteId === site.id);
        const markedGuards = siteGuards.filter((g) => todayRecordsByGuardId.has(g.id));
        const doubleDutyGuards = siteGuards.filter(
          (g) => todayRecordsByGuardId.get(g.id)?.status === 'Double Duty'
        );
        const absentGuards = siteGuards.filter(
          (g) => todayRecordsByGuardId.get(g.id)?.status === 'Absent'
        );

        return {
          site,
          totalGuards: siteGuards.length,
          markedCount: markedGuards.length,
          doubleDutyCount: doubleDutyGuards.length,
          absentCount: absentGuards.length,
          isComplete: siteGuards.length > 0 && markedGuards.length === siteGuards.length,
          pendingCount: siteGuards.length - markedGuards.length,
        };
      });
  }, [sites, activeGuards, todayRecordsByGuardId]);

  // One-click action to mark all unmarked active site guards as Full Day
  const handleQuickMarkAllFullDay = () => {
    if (pendingGuards.length === 0) {
      setToastMessage('All active site guards are already marked for today!');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    const recordsToCreate = pendingGuards.map((g) => ({
      guardId: g.id,
      guardName: g.name,
      guardCode: g.guardCode,
      siteId: g.currentSiteId || 'HQ-001',
      siteName: g.currentSiteName || 'Mountain Security HQ',
      clientId: sites.find((s) => s.id === g.currentSiteId)?.clientId,
      clientName: sites.find((s) => s.id === g.currentSiteId)?.clientName,
      date: todayDateStr,
      status: 'Full Day' as const,
      dutyUnits: 1.0,
      overtimeHours: 0,
      shift: 'Day Shift (12h)' as AttendanceShift,
      checkInTime: '06:00 AM',
      checkOutTime: '06:00 PM',
      markedBy: '1-Click Quick Check-In (Dashboard)',
      remarks: 'Standard 12h rotation marked via Dashboard Quick Check-in',
    }));

    markBulkAttendance(recordsToCreate);
    setToastMessage(`✓ Successfully marked ${recordsToCreate.length} guard(s) as Full Day (1.0 Duty)!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-32 bg-emerald-600/5 blur-3xl pointer-events-none" />

      {/* Toast feedback */}
      {toastMessage && (
        <div className="mb-4 p-3 bg-emerald-950/90 border border-emerald-700/80 rounded-xl text-emerald-200 text-xs font-bold flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200 shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-400 hover:text-white text-xs ml-3"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-950/80 border border-blue-800/50 rounded-xl text-blue-400 shadow-xs">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-1.5 font-display">
                <span>Guard Duty & Attendance</span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/60 font-sans normal-case">
                  روزانہ حاضری سمری
                </span>
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
              <span>Date: <strong className="text-slate-200 font-mono">{formatDate(todayDateStr)}</strong></span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-semibold">{totalMarked} / {totalExpectedGuards} Checked In ({markedPercentage}%)</span>
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <button
              onClick={handleQuickMarkAllFullDay}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md transition-all cursor-pointer hover:shadow-emerald-600/20 active:scale-95"
              title="Instantly mark remaining pending guards as Full Day (1.0 Duty)"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Mark All Full Day ({pendingCount})</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('attendance')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold rounded-lg border border-slate-700 transition-colors cursor-pointer group"
          >
            <span>Open Attendance Register</span>
            <ArrowRight className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Counter Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 my-4">
        {/* Full Days */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Full Day (1.0)</span>
          </div>
          <div className="text-2xl font-black text-white mt-1">{fullDayCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">مکمل ڈیوٹی</div>
        </div>

        {/* Double Duties */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center justify-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Double Duty (2.0)</span>
          </div>
          <div className="text-2xl font-black text-blue-400 mt-1">{doubleDutyCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">24 گھنٹے ڈبل ڈیوٹی</div>
        </div>

        {/* Half Day */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center justify-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Half Day (0.5)</span>
          </div>
          <div className="text-2xl font-black text-amber-400 mt-1">{halfDayCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">ہاف ڈے / شارٹ</div>
        </div>

        {/* Absent / Leave */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-red-400 flex items-center justify-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>Absent / Leave</span>
          </div>
          <div className="text-2xl font-black text-red-400 mt-1">{absentCount + leaveCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">غیر حاضر / رخصت</div>
        </div>

        {/* Total Duty Units */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Duty Units Total</span>
          </div>
          <div className="text-2xl font-black text-cyan-300 mt-1">{totalDutyUnits.toFixed(1)}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">کل ویج یونٹس</div>
        </div>

        {/* Overtime Total */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center justify-center gap-1">
            <Clock className="w-3 h-3 text-purple-400" />
            <span>Overtime Hours</span>
          </div>
          <div className="text-2xl font-black text-purple-300 mt-1">{totalOvertimeHours}h</div>
          <div className="text-[10px] text-slate-400 mt-0.5">اوور ٹائم گھنٹے</div>
        </div>
      </div>

      {/* Active Sites Deployment & Quick Attendance Bar */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-blue-400" />
            <span>Active Client Deployment Sites & Check-In Status</span>
          </span>
          <span className="text-[11px] text-slate-400">
            Click any site to mark or review muster roll
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {siteAttendanceSummaries.map(({ site, totalGuards, markedCount, doubleDutyCount, isComplete, pendingCount: sitePending }) => (
            <div
              key={site.id}
              onClick={() => setActiveTab('attendance')}
              className="p-3 bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-blue-700/60 rounded-xl transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 group-hover:text-blue-300 transition-colors line-clamp-1">
                      {site.siteName}
                    </h4>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {site.clientName}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 border ${
                      isComplete
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800/60'
                        : sitePending === totalGuards
                        ? 'bg-red-950 text-red-300 border-red-800/60'
                        : 'bg-amber-950 text-amber-300 border-amber-800/60'
                    }`}
                  >
                    {isComplete
                      ? '✓ Complete'
                      : sitePending === totalGuards
                      ? 'Pending'
                      : `${markedCount}/${totalGuards} Done`}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-2.5 mt-2 border-t border-slate-800/60">
                <span className="text-slate-400 font-medium">
                  Guards: <strong className="text-slate-200">{totalGuards}</strong>
                  {doubleDutyCount > 0 && (
                    <span className="text-blue-400 ml-1 font-bold">({doubleDutyCount} DD)</span>
                  )}
                </span>
                <span className="text-blue-400 group-hover:text-blue-300 font-bold text-[10px] flex items-center gap-1">
                  <span>Mark Site</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
