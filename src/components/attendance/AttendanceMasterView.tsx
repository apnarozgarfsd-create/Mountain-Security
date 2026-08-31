import {
  AlertCircle,
  Award,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Edit,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Layers,
  Plus,
  Printer,
  Receipt,
  RotateCcw,
  Search,
  Shield,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
  UserX,
  XCircle,
  Zap,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceShift, AttendanceStatus, GuardAttendanceRecord } from '../../types';
import { formatDate, formatPKR } from '../../utils/formatters';

const ATTENDANCE_STATUS_CONFIG: Record<
  AttendanceStatus,
  { label: string; urdu: string; short: string; units: number; color: string; badgeClass: string }
> = {
  'Full Day': {
    label: 'Full Day (1.0 Duty)',
    urdu: 'مکمل دن (1.0 ڈیوٹی)',
    short: 'FD',
    units: 1.0,
    color: 'emerald',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  'Double Duty': {
    label: 'Double Duty (2.0 Duties / 24h)',
    urdu: 'ڈبل ڈیوٹی (2.0 ڈیوٹی)',
    short: 'DD',
    units: 2.0,
    color: 'blue',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300 font-bold',
  },
  'Half Day': {
    label: 'Half Day (0.5 Duty / 6h)',
    urdu: 'ہاف ڈے (0.5 ڈیوٹی)',
    short: 'HD',
    units: 0.5,
    color: 'amber',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  'Short Duty': {
    label: 'Short Duty (0.5 Duty)',
    urdu: 'شارٹ ڈیوٹی (0.5 ڈیوٹی)',
    short: 'SD',
    units: 0.5,
    color: 'amber',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  Absent: {
    label: 'Absent (0.0 Duty)',
    urdu: 'غیر حاضر',
    short: 'A',
    units: 0.0,
    color: 'red',
    badgeClass: 'bg-red-100 text-red-800 border-red-300',
  },
  Leave: {
    label: 'Authorized Leave (0.0 Duty)',
    urdu: 'رخصت / چھٹی',
    short: 'L',
    units: 0.0,
    color: 'purple',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
  },
};

export const AttendanceMasterView: React.FC = () => {
  const {
    guards,
    sites,
    attendanceRecords,
    markAttendance,
    markBulkAttendance,
    deleteAttendanceRecord,
    getGuardMonthlySummary,
    getAllGuardsMonthlySummaries,
    quickGenerateSalarySlipFromAttendance,
    triggerPrint,
    companySettings,
    setActiveTab,
  } = useApp();

  // Active sub-tab
  const [activeSubTab, setActiveSubTab] = useState<'daily' | 'monthly' | 'guard' | 'reports'>('daily');

  // Selected date for daily marking (Default today)
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Selected Month for monthly roster (YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-08');

  // Filters
  const [filterSiteId, setFilterSiteId] = useState<string>('all');
  const [filterShift, setFilterShift] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedGuardForHistory, setSelectedGuardForHistory] = useState<string>(
    guards.length > 0 ? guards[0].id : ''
  );

  // Notification Banner
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Active Guards List
  const activeGuards = useMemo(() => {
    return guards.filter((g) => g.status === 'Active' || g.status === 'On Leave');
  }, [guards]);

  // Filtered guards for Daily View
  const filteredDailyGuards = useMemo(() => {
    return activeGuards.filter((g) => {
      const matchSite = filterSiteId === 'all' || g.currentSiteId === filterSiteId;
      const matchShift = filterShift === 'all' || (g.shift && g.shift.toLowerCase().includes(filterShift.toLowerCase()));
      const matchSearch =
        searchTerm === '' ||
        g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.guardCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.cnic.includes(searchTerm);
      return matchSite && matchShift && matchSearch;
    });
  }, [activeGuards, filterSiteId, filterShift, searchTerm]);

  // Today's attendance map: GuardId -> Record
  const dailyAttendanceMap = useMemo(() => {
    const map = new Map<string, GuardAttendanceRecord>();
    attendanceRecords
      .filter((r) => r.date === selectedDate)
      .forEach((r) => {
        map.set(r.guardId, r);
      });
    return map;
  }, [attendanceRecords, selectedDate]);

  // Stats for the selected date
  const dailyStats = useMemo(() => {
    let fullDays = 0;
    let doubleDuties = 0;
    let halfDays = 0;
    let absents = 0;
    let leaves = 0;
    let totalDutyUnits = 0;
    let totalOvertimeHours = 0;

    activeGuards.forEach((g) => {
      const rec = dailyAttendanceMap.get(g.id);
      if (rec) {
        if (rec.status === 'Full Day') fullDays++;
        else if (rec.status === 'Double Duty') doubleDuties++;
        else if (rec.status === 'Half Day' || rec.status === 'Short Duty') halfDays++;
        else if (rec.status === 'Absent') absents++;
        else if (rec.status === 'Leave') leaves++;

        totalDutyUnits += rec.dutyUnits || 0;
        totalOvertimeHours += rec.overtimeHours || 0;
      }
    });

    const markedCount = dailyAttendanceMap.size;
    const unmarkedCount = Math.max(0, activeGuards.length - markedCount);

    return {
      totalGuards: activeGuards.length,
      markedCount,
      unmarkedCount,
      fullDays,
      doubleDuties,
      halfDays,
      absents,
      leaves,
      totalDutyUnits,
      totalOvertimeHours,
    };
  }, [activeGuards, dailyAttendanceMap]);

  // Monthly Summaries for the selected month
  const monthlySummaries = useMemo(() => {
    return getAllGuardsMonthlySummaries(selectedMonth);
  }, [getAllGuardsMonthlySummaries, selectedMonth, attendanceRecords]);

  // Monthly stats aggregated
  const monthlyAggregates = useMemo(() => {
    let totalDutyUnits = 0;
    let totalDoubleDuties = 0;
    let totalFullDays = 0;
    let totalHalfDays = 0;
    let totalOTHours = 0;
    let totalEarnedSalary = 0;
    let totalOTAmt = 0;

    monthlySummaries.forEach((s) => {
      totalDutyUnits += s.totalDutyUnits;
      totalDoubleDuties += s.doubleDuties;
      totalFullDays += s.fullDays;
      totalHalfDays += s.halfDays;
      totalOTHours += s.totalOvertimeHours;
      totalEarnedSalary += s.earnedSalary;
      totalOTAmt += s.overtimeAmount;
    });

    return {
      totalDutyUnits: Number(totalDutyUnits.toFixed(1)),
      totalDoubleDuties,
      totalFullDays,
      totalHalfDays,
      totalOTHours,
      totalEarnedSalary,
      totalOTAmt,
      grandTotalSalary: totalEarnedSalary + totalOTAmt,
    };
  }, [monthlySummaries]);

  // Calendar days in selected month
  const daysInMonth = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const totalDays = new Date(year, month, 0).getDate();
    return Array.from({ length: totalDays }, (_, i) => i + 1);
  }, [selectedMonth]);

  // Quick Action: Mark status for a specific guard on selected date
  const handleQuickMark = (
    guard: typeof guards[0],
    status: AttendanceStatus,
    overtimeHours: number = 0,
    shift?: AttendanceShift
  ) => {
    const units = ATTENDANCE_STATUS_CONFIG[status].units;
    markAttendance({
      guardId: guard.id,
      guardName: guard.name,
      guardCode: guard.guardCode,
      siteId: guard.currentSiteId || 'HQ-001',
      siteName: guard.currentSiteName || 'Mountain Security HQ',
      date: selectedDate,
      shift: shift || 'Day Shift (12h)',
      status,
      dutyUnits: units,
      overtimeHours,
      checkInTime: status === 'Absent' || status === 'Leave' ? undefined : '08:00',
      checkOutTime: status === 'Absent' || status === 'Leave' ? undefined : (status === 'Double Duty' ? '08:00 (Next Day)' : '20:00'),
    });
  };

  // Quick Action: Batch Mark all filtered guards
  const handleBatchMarkAll = (status: AttendanceStatus) => {
    const records = filteredDailyGuards.map((g) => ({
      guardId: g.id,
      guardName: g.name,
      guardCode: g.guardCode,
      siteId: g.currentSiteId || 'HQ-001',
      siteName: g.currentSiteName || 'Mountain Security HQ',
      date: selectedDate,
      shift: (g.shift as AttendanceShift) || 'Day 12h',
      status,
      dutyUnits: ATTENDANCE_STATUS_CONFIG[status].units,
      overtimeHours: 0,
      checkInTime: status === 'Absent' || status === 'Leave' ? undefined : '08:00',
      checkOutTime: status === 'Absent' || status === 'Leave' ? undefined : (status === 'Double Duty' ? '08:00 (Next Day)' : '20:00'),
    }));

    markBulkAttendance(records);
    showNotification(`Marked all ${records.length} guards as "${status}" for ${formatDate(selectedDate)}!`);
  };

  // Quick Salary Slip generator & navigate to accounting
  const handleGenerateSalarySlip = (guardId: string) => {
    const slip = quickGenerateSalarySlipFromAttendance(guardId, selectedMonth);
    if (slip) {
      showNotification(`Salary slip created for ${slip.guardName} (${slip.slipNo})!`);
      // Trigger print or view
      triggerPrint({
        type: 'salary-slip',
        title: `Salary Slip - ${slip.guardName} (${slip.monthName})`,
        data: slip,
      });
    }
  };

  // Print Daily Muster Roll
  const handlePrintDailySheet = () => {
    triggerPrint({
      type: 'attendance-sheet',
      title: `Daily Guard Duty Register - ${formatDate(selectedDate)}`,
      data: {
        mode: 'daily',
        date: selectedDate,
        records: filteredDailyGuards.map((g) => ({
          guard: g,
          record: dailyAttendanceMap.get(g.id),
        })),
        stats: dailyStats,
        siteName: filterSiteId !== 'all' ? sites.find((s) => s.id === filterSiteId)?.siteName : 'All Mountain Security Sites',
      },
    });
  };

  // Print Monthly Muster Roll Matrix
  const handlePrintMonthlyMusterRoll = () => {
    triggerPrint({
      type: 'attendance-sheet',
      title: `Monthly Guard Attendance Muster Roll - ${selectedMonth}`,
      data: {
        mode: 'monthly',
        monthYear: selectedMonth,
        days: daysInMonth,
        guards: activeGuards,
        attendanceRecords: attendanceRecords.filter((r) => r.date.startsWith(selectedMonth)),
        summaries: monthlySummaries,
        aggregates: monthlyAggregates,
      },
    });
  };

  // CSV Export for Monthly Attendance
  const handleExportCSV = () => {
    const headers = [
      'Guard Code',
      'Guard Name',
      'Site Name',
      'Basic Salary (PKR)',
      'Per Day Rate (PKR)',
      'Full Days (1.0)',
      'Double Duties (2.0)',
      'Half Days (0.5)',
      'Absent Days',
      'Leaves',
      'Total Duty Units',
      'Overtime Hours',
      'Earned Salary (PKR)',
      'Overtime Amount (PKR)',
      'Net Payable (PKR)',
    ];

    const rows = monthlySummaries.map((s) => [
      `"${s.guardCode}"`,
      `"${s.guardName}"`,
      `"${s.siteName}"`,
      s.basicSalary,
      s.perDayRate,
      s.fullDays,
      s.doubleDuties,
      s.halfDays,
      s.absentDays,
      s.leaveDays,
      s.totalDutyUnits,
      s.totalOvertimeHours,
      s.earnedSalary,
      s.overtimeAmount,
      s.earnedSalary + s.overtimeAmount,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Mountain_Security_Attendance_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification(`Exported Attendance Register CSV for ${selectedMonth}!`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white p-5 sm:p-6 rounded-2xl shadow-xl border border-blue-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-600/30 rounded-xl border border-blue-400/30 text-blue-300">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2 font-display">
                Guard Attendance & Duty Register
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-sans font-bold">
                  حاضری رجسٹر
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                Manage Full Day (1.0), Double Duty (2.0), Half Day (0.5), and Overtime tracking with automatic salary slip calculation.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={handlePrintDailySheet}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700 active:bg-slate-900 border border-slate-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4 text-blue-400" />
            <span>Daily Sheet Print</span>
          </button>

          <button
            onClick={handlePrintMonthlyMusterRoll}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-700 hover:bg-blue-600 active:bg-blue-800 border border-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <FileText className="w-4 h-4 text-blue-200" />
            <span>Monthly Muster Roll</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 border border-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-200" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-sm font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Quick Summary Cards (Daily & Monthly KPI) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Guards</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-1">{activeGuards.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Active on Payroll</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Full Days (1.0)</span>
            <Check className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-800 mt-1">{dailyStats.fullDays}</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">12h Regular Duty</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Double Duty (2.0)</span>
            <Zap className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-black text-blue-800 mt-1">{dailyStats.doubleDuties}</div>
          <div className="text-[10px] text-blue-600 mt-0.5">24h Double Shifts</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Half / Short (0.5)</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-black text-amber-800 mt-1">{dailyStats.halfDays}</div>
          <div className="text-[10px] text-amber-600 mt-0.5">6h Partial Shift</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-purple-200 bg-purple-50/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Overtime Total</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-black text-purple-800 mt-1">{dailyStats.totalOvertimeHours} hrs</div>
          <div className="text-[10px] text-purple-600 mt-0.5">Extra Duty Today</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-red-200 bg-red-50/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider">Absent / Leave</span>
            <UserX className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-xl font-black text-red-800 mt-1">{dailyStats.absents + dailyStats.leaves}</div>
          <div className="text-[10px] text-red-600 mt-0.5">{dailyStats.absents} Absent, {dailyStats.leaves} Leave</div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="border-b border-slate-200 bg-white rounded-xl shadow-xs px-2 pt-2 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveSubTab('daily')}
          className={`px-4 py-3 font-bold text-xs sm:text-sm rounded-t-lg transition-colors inline-flex items-center gap-2 border-b-2 ${
            activeSubTab === 'daily'
              ? 'border-blue-600 text-blue-900 bg-blue-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-blue-600" />
          <span>Daily Attendance Register (روزانہ ڈیوٹی)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('monthly')}
          className={`px-4 py-3 font-bold text-xs sm:text-sm rounded-t-lg transition-colors inline-flex items-center gap-2 border-b-2 ${
            activeSubTab === 'monthly'
              ? 'border-blue-600 text-blue-900 bg-blue-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-blue-600" />
          <span>Monthly Duty Roster Matrix (1 تا 31 شیٹ)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('guard')}
          className={`px-4 py-3 font-bold text-xs sm:text-sm rounded-t-lg transition-colors inline-flex items-center gap-2 border-b-2 ${
            activeSubTab === 'guard'
              ? 'border-blue-600 text-blue-900 bg-blue-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <UserCheck className="w-4 h-4 text-blue-600" />
          <span>Individual Guard Tracker (انفرادی ریکارڈ)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('reports')}
          className={`px-4 py-3 font-bold text-xs sm:text-sm rounded-t-lg transition-colors inline-flex items-center gap-2 border-b-2 ${
            activeSubTab === 'reports'
              ? 'border-blue-600 text-blue-900 bg-blue-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4 text-blue-600" />
          <span>Monthly Salary Calculation Summary (تنخواہ سمری)</span>
        </button>
      </div>

      {/* SUB-TAB 1: DAILY ATTENDANCE REGISTER */}
      {activeSubTab === 'daily' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Date Picker & Quick Navigator */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-600 uppercase">Duty Date:</span>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-300">
                <button
                  onClick={() => {
                    const d = new Date(selectedDate);
                    d.setDate(d.getDate() - 1);
                    setSelectedDate(d.toISOString().split('T')[0]);
                  }}
                  className="p-1 text-slate-600 hover:text-blue-700 hover:bg-white rounded transition-colors"
                  title="Previous Day"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent font-bold text-slate-900 text-xs px-2 py-0.5 focus:outline-hidden"
                />
                <button
                  onClick={() => {
                    const d = new Date(selectedDate);
                    d.setDate(d.getDate() + 1);
                    setSelectedDate(d.toISOString().split('T')[0]);
                  }}
                  className="p-1 text-slate-600 hover:text-blue-700 hover:bg-white rounded transition-colors"
                  title="Next Day"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                className="px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-bold transition-colors"
              >
                Today
              </button>
            </div>

            {/* Filter by Site, Shift & Search */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Guard name / code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:border-blue-500 w-48 sm:w-56"
                />
              </div>

              <select
                value={filterSiteId}
                onChange={(e) => setFilterSiteId(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:outline-hidden"
              >
                <option value="all">All Deployment Sites ({sites.length})</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.siteName} ({s.clientName || 'Client'})
                  </option>
                ))}
              </select>

              <select
                value={filterShift}
                onChange={(e) => setFilterShift(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:outline-hidden"
              >
                <option value="all">All Shifts</option>
                <option value="day">Day Shift (12h)</option>
                <option value="night">Night Shift (12h)</option>
                <option value="double">24h Double Duty</option>
              </select>
            </div>
          </div>

          {/* Batch Action Toolbar */}
          <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-semibold">
              <Zap className="w-4 h-4 text-blue-600" />
              <span>
                Showing <strong>{filteredDailyGuards.length}</strong> Guards for <strong>{formatDate(selectedDate)}</strong>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Batch Actions:</span>
              <button
                onClick={() => handleBatchMarkAll('Full Day')}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors shadow-xs"
              >
                ✓ Mark All Full Day (1.0)
              </button>
              <button
                onClick={() => handleBatchMarkAll('Double Duty')}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-xs"
              >
                ⚡ Mark All Double Duty (2.0)
              </button>
              <button
                onClick={() => handleBatchMarkAll('Half Day')}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors shadow-xs"
              >
                ½ Mark All Half Day (0.5)
              </button>
            </div>
          </div>

          {/* Guards Daily Register Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white uppercase text-[11px] font-bold">
                    <th className="p-3 w-12 text-center">#</th>
                    <th className="p-3">Guard Profile & Code</th>
                    <th className="p-3">Deployment Site & Shift</th>
                    <th className="p-3 text-center">Duty Status (حاضری مارک کریں)</th>
                    <th className="p-3 text-center">Units</th>
                    <th className="p-3 text-center">Overtime (Hours)</th>
                    <th className="p-3 text-center">Check-In / Out</th>
                    <th className="p-3">Remarks / Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredDailyGuards.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500 font-medium">
                        No guards found matching your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredDailyGuards.map((guard, idx) => {
                      const record = dailyAttendanceMap.get(guard.id);
                      const currentStatus: AttendanceStatus = record ? record.status : 'Full Day';
                      const currentOT: number = record ? record.overtimeHours || 0 : 0;
                      const currentUnits: number = record ? record.dutyUnits : 1.0;
                      const remarks: string = record ? record.remarks || '' : '';

                      return (
                        <tr
                          key={guard.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            record ? (record.status === 'Double Duty' ? 'bg-blue-50/20' : '') : 'bg-slate-50/40'
                          }`}
                        >
                          <td className="p-3 text-center font-bold text-slate-500">{idx + 1}</td>

                          {/* Guard Info */}
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center font-black text-xs shrink-0">
                                {guard.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                                  {guard.name}
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-300 font-mono">
                                    {guard.guardCode}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  {guard.rank} • Basic: PKR {guard.basicSalary?.toLocaleString() || '40,000'}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Site & Shift */}
                          <td className="p-3">
                            <div className="font-semibold text-slate-800">
                              {guard.currentSiteName || 'Mountain Security HQ'}
                            </div>
                            <div className="text-[11px] text-blue-700 font-medium">
                              Shift: {guard.shift || 'Day 12 Hours'}
                            </div>
                          </td>

                          {/* Interactive Status Selection Pills */}
                          <td className="p-3 text-center">
                            <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                              {/* Full Day Button */}
                              <button
                                onClick={() => handleQuickMark(guard, 'Full Day', currentOT)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  currentStatus === 'Full Day' && record
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'text-slate-700 hover:bg-white'
                                }`}
                                title="Full Day: 1.0 regular duty unit"
                              >
                                Full Day (1.0)
                              </button>

                              {/* Double Duty Button */}
                              <button
                                onClick={() => handleQuickMark(guard, 'Double Duty', currentOT)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  currentStatus === 'Double Duty'
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'text-slate-700 hover:bg-white'
                                }`}
                                title="Double Duty: 2.0 duty units (24 Hours continuous)"
                              >
                                ⚡ Double (2.0)
                              </button>

                              {/* Half Day Button */}
                              <button
                                onClick={() => handleQuickMark(guard, 'Half Day', currentOT)}
                                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  currentStatus === 'Half Day' || currentStatus === 'Short Duty'
                                    ? 'bg-amber-600 text-white shadow-xs'
                                    : 'text-slate-700 hover:bg-white'
                                }`}
                                title="Half Day: 0.5 duty units (6 Hours)"
                              >
                                ½ Half (0.5)
                              </button>

                              {/* Absent Button */}
                              <button
                                onClick={() => handleQuickMark(guard, 'Absent', 0)}
                                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  currentStatus === 'Absent'
                                    ? 'bg-red-600 text-white shadow-xs'
                                    : 'text-slate-700 hover:bg-white'
                                }`}
                                title="Absent: 0 duty units"
                              >
                                Absent
                              </button>

                              {/* Leave Button */}
                              <button
                                onClick={() => handleQuickMark(guard, 'Leave', 0)}
                                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  currentStatus === 'Leave'
                                    ? 'bg-purple-600 text-white shadow-xs'
                                    : 'text-slate-700 hover:bg-white'
                                }`}
                                title="Authorized Leave"
                              >
                                Leave
                              </button>
                            </div>
                          </td>

                          {/* Duty Units Badge */}
                          <td className="p-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-black border ${
                                ATTENDANCE_STATUS_CONFIG[currentStatus].badgeClass
                              }`}
                            >
                              {currentUnits.toFixed(1)}
                            </span>
                          </td>

                          {/* Overtime Hours Quick Controller */}
                          <td className="p-3 text-center">
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => {
                                  const newOT = Math.max(0, currentOT - 2);
                                  handleQuickMark(guard, currentStatus, newOT);
                                }}
                                className="w-6 h-6 rounded bg-slate-200 hover:bg-slate-300 font-bold text-slate-800 flex items-center justify-center text-xs"
                              >
                                -
                              </button>
                              <span
                                className={`w-10 text-center font-bold text-xs ${
                                  currentOT > 0 ? 'text-purple-900 bg-purple-100 px-1.5 py-0.5 rounded border border-purple-300' : 'text-slate-600'
                                }`}
                              >
                                {currentOT} h
                              </span>
                              <button
                                onClick={() => {
                                  const newOT = currentOT + 2;
                                  handleQuickMark(guard, currentStatus, newOT);
                                }}
                                className="w-6 h-6 rounded bg-slate-200 hover:bg-slate-300 font-bold text-slate-800 flex items-center justify-center text-xs"
                              >
                                +
                              </button>
                            </div>
                          </td>

                          {/* Check in / Check out */}
                          <td className="p-3 text-center text-slate-600 text-[11px] font-mono">
                            {currentStatus === 'Absent' || currentStatus === 'Leave' ? (
                              <span className="text-slate-400 italic">Off Duty</span>
                            ) : currentStatus === 'Double Duty' ? (
                              <span className="text-blue-700 font-bold">08:00 → 08:00 (24h)</span>
                            ) : currentStatus === 'Half Day' ? (
                              <span className="text-amber-700 font-bold">08:00 → 14:00 (6h)</span>
                            ) : (
                              <span>08:00 → 20:00 (12h)</span>
                            )}
                          </td>

                          {/* Remarks */}
                          <td className="p-3">
                            <input
                              type="text"
                              placeholder="Remarks / Note..."
                              defaultValue={remarks}
                              onBlur={(e) => {
                                if (e.target.value !== remarks) {
                                  markAttendance({
                                    guardId: guard.id,
                                    guardName: guard.name,
                                    guardCode: guard.guardCode,
                                    siteId: guard.currentSiteId || 'HQ-001',
                                    siteName: guard.currentSiteName || 'Mountain Security HQ',
                                    date: selectedDate,
                                    shift: 'Day Shift (12h)',
                                    status: currentStatus,
                                    dutyUnits: currentUnits,
                                    overtimeHours: currentOT,
                                    remarks: e.target.value,
                                  });
                                }
                              }}
                              className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-800 text-[11px] focus:bg-white focus:border-blue-400 focus:outline-hidden"
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: MONTHLY ATTENDANCE ROSTER MATRIX (1 to 31) */}
      {activeSubTab === 'monthly' && (
        <div className="space-y-4">
          {/* Month Selector Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-600 uppercase">Select Month & Year:</span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-1.5 bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden"
              />
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <span className="font-bold text-slate-500 uppercase text-[10px]">Legend:</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                FD = Full Day (1.0)
              </span>
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-300 font-bold">
                DD = Double Duty (2.0)
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 font-bold">
                HD = Half Day (0.5)
              </span>
              <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-300 font-bold">
                A = Absent (0.0)
              </span>
              <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-300 font-bold">
                L = Leave (0.0)
              </span>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto max-h-[600px]">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-900 text-white uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5 sticky left-0 z-20 bg-slate-900 border-r border-slate-700 min-w-[180px]">
                      Guard Name & Code
                    </th>
                    <th className="p-2 text-center min-w-[80px]">Site</th>
                    {daysInMonth.map((day) => (
                      <th key={day} className="p-1 text-center w-7 border-r border-slate-800 font-mono">
                        {day}
                      </th>
                    ))}
                    <th className="p-2 text-center bg-emerald-950 text-emerald-200 font-bold min-w-[50px]">FD</th>
                    <th className="p-2 text-center bg-blue-950 text-blue-200 font-bold min-w-[50px]">DD</th>
                    <th className="p-2 text-center bg-amber-950 text-amber-200 font-bold min-w-[50px]">HD</th>
                    <th className="p-2 text-center bg-red-950 text-red-200 font-bold min-w-[45px]">A</th>
                    <th className="p-2 text-center bg-purple-950 text-purple-200 font-bold min-w-[60px]">Units</th>
                    <th className="p-2 text-center min-w-[55px]">OT (h)</th>
                    <th className="p-2 text-right min-w-[90px]">Earned Salary</th>
                    <th className="p-2 text-center min-w-[110px]">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {activeGuards.map((guard) => {
                    const summary = getGuardMonthlySummary(guard.id, selectedMonth);
                    const guardMonthRecords = attendanceRecords.filter(
                      (r) => r.guardId === guard.id && r.date.startsWith(selectedMonth)
                    );
                    const recordsByDay = new Map<number, GuardAttendanceRecord>();
                    guardMonthRecords.forEach((r) => {
                      const dayNum = parseInt(r.date.split('-')[2], 10);
                      recordsByDay.set(dayNum, r);
                    });

                    return (
                      <tr key={guard.id} className="hover:bg-slate-50 transition-colors">
                        {/* Sticky Left Column: Guard Info */}
                        <td className="p-2.5 sticky left-0 z-10 bg-white border-r border-slate-200 font-bold text-slate-900 shadow-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] px-1 py-0.2 bg-blue-100 text-blue-800 rounded font-mono">
                              {guard.guardCode}
                            </span>
                            <span className="truncate max-w-[130px]">{guard.name}</span>
                          </div>
                        </td>

                        <td className="p-2 text-slate-600 text-[11px] truncate max-w-[90px]">
                          {guard.currentSiteName || 'Headquarters'}
                        </td>

                        {/* 1..31 Calendar Day Cells */}
                        {daysInMonth.map((day) => {
                          const rec = recordsByDay.get(day);
                          if (!rec) {
                            return (
                              <td key={day} className="p-1 text-center text-slate-300 border-r border-slate-100 font-mono text-[10px]">
                                -
                              </td>
                            );
                          }

                          let badgeColor = 'bg-slate-100 text-slate-600';
                          let text = 'FD';
                          if (rec.status === 'Full Day') {
                            badgeColor = 'bg-emerald-100 text-emerald-800 font-bold';
                            text = 'FD';
                          } else if (rec.status === 'Double Duty') {
                            badgeColor = 'bg-blue-600 text-white font-black';
                            text = 'DD';
                          } else if (rec.status === 'Half Day' || rec.status === 'Short Duty') {
                            badgeColor = 'bg-amber-200 text-amber-900 font-bold';
                            text = 'HD';
                          } else if (rec.status === 'Absent') {
                            badgeColor = 'bg-red-500 text-white font-black';
                            text = 'A';
                          } else if (rec.status === 'Leave') {
                            badgeColor = 'bg-purple-200 text-purple-900 font-bold';
                            text = 'L';
                          }

                          return (
                            <td key={day} className="p-0.5 text-center border-r border-slate-100">
                              <span
                                className={`inline-block w-6 h-5 leading-5 rounded text-[10px] ${badgeColor}`}
                                title={`${guard.name} on ${selectedMonth}-${String(day).padStart(2, '0')}: ${rec.status} (${rec.dutyUnits} units, OT: ${rec.overtimeHours || 0}h)`}
                              >
                                {text}
                              </span>
                            </td>
                          );
                        })}

                        {/* Summary Columns */}
                        <td className="p-2 text-center font-bold text-emerald-700 bg-emerald-50/40">
                          {summary.fullDays}
                        </td>
                        <td className="p-2 text-center font-bold text-blue-700 bg-blue-50/40">
                          {summary.doubleDuties}
                        </td>
                        <td className="p-2 text-center font-bold text-amber-700 bg-amber-50/40">
                          {summary.halfDays}
                        </td>
                        <td className="p-2 text-center font-bold text-red-700 bg-red-50/40">
                          {summary.absentDays}
                        </td>
                        <td className="p-2 text-center font-black text-blue-900 bg-blue-100/60 text-xs">
                          {summary.totalDutyUnits}
                        </td>
                        <td className="p-2 text-center font-semibold text-purple-700">
                          {summary.totalOvertimeHours}h
                        </td>
                        <td className="p-2 text-right font-black text-slate-900">
                          PKR {(summary.earnedSalary + summary.overtimeAmount).toLocaleString()}
                        </td>

                        {/* Quick Generate Salary Slip */}
                        <td className="p-2 text-center">
                          <button
                            onClick={() => handleGenerateSalarySlip(guard.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-[11px] rounded-lg transition-colors shadow-xs"
                            title="Calculate and generate salary slip from this attendance"
                          >
                            <Receipt className="w-3 h-3" />
                            <span>Slip بنائیں</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-900 text-white font-bold uppercase text-[11px]">
                  <tr>
                    <td colSpan={2} className="p-2.5 text-right">
                      Monthly Total Aggregates:
                    </td>
                    <td colSpan={daysInMonth.length} className="p-2 text-center text-slate-400 text-[10px]">
                      {activeGuards.length} Active Guards Processed
                    </td>
                    <td className="p-2 text-center text-emerald-300 font-black">{monthlyAggregates.totalFullDays}</td>
                    <td className="p-2 text-center text-blue-300 font-black">{monthlyAggregates.totalDoubleDuties}</td>
                    <td className="p-2 text-center text-amber-300 font-black">{monthlyAggregates.totalHalfDays}</td>
                    <td className="p-2 text-center text-red-300">-</td>
                    <td className="p-2 text-center text-white text-xs font-black">{monthlyAggregates.totalDutyUnits}</td>
                    <td className="p-2 text-center text-purple-300">{monthlyAggregates.totalOTHours}h</td>
                    <td className="p-2 text-right text-emerald-400 font-black text-xs">
                      PKR {monthlyAggregates.grandTotalSalary.toLocaleString()}
                    </td>
                    <td className="p-2 text-center">
                      <button
                        onClick={handlePrintMonthlyMusterRoll}
                        className="px-2 py-0.5 bg-blue-700 hover:bg-blue-600 text-white rounded text-[10px]"
                      >
                        Print Roster
                      </button>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: INDIVIDUAL GUARD ATTENDANCE DOSSIER */}
      {activeSubTab === 'guard' && (
        <div className="space-y-4">
          {/* Guard Selector */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-600 uppercase">Select Guard:</span>
              <select
                value={selectedGuardForHistory}
                onChange={(e) => setSelectedGuardForHistory(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden max-w-xs"
              >
                {activeGuards.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.guardCode} - {g.name} ({g.currentSiteName || 'HQ'})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 uppercase">Month:</span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
              />
            </div>
          </div>

          {/* Guard Dossier Card */}
          {(() => {
            const selectedGuard = guards.find((g) => g.id === selectedGuardForHistory);
            if (!selectedGuard) return null;

            const summary = getGuardMonthlySummary(selectedGuard.id, selectedMonth);
            const records = attendanceRecords
              .filter((r) => r.guardId === selectedGuard.id && r.date.startsWith(selectedMonth))
              .sort((a, b) => a.date.localeCompare(b.date));

            return (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Guard Profile & Monthly KPI */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
                  <div className="flex items-center gap-4 pb-4 border-b border-slate-200">
                    <div className="w-16 h-16 rounded-2xl bg-blue-900 text-white flex items-center justify-center font-black text-2xl shadow-md">
                      {selectedGuard.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900">{selectedGuard.name}</h3>
                      <p className="text-xs font-mono text-blue-700 font-bold">{selectedGuard.guardCode}</p>
                      <p className="text-xs text-slate-500">{selectedGuard.designation} • {selectedGuard.currentSiteName || 'HQ'}</p>
                    </div>
                  </div>

                  {/* Metrics List */}
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Basic Monthly Salary:</span>
                      <span className="font-bold text-slate-900">PKR {summary.basicSalary.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Per Day Rate (Base/30):</span>
                      <span className="font-bold text-slate-900">PKR {summary.perDayRate.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-100 text-emerald-800">
                      <span className="font-semibold">Full Days (1.0):</span>
                      <span className="font-bold">{summary.fullDays} Days</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-100 text-blue-800">
                      <span className="font-semibold">Double Duties (2.0):</span>
                      <span className="font-bold">{summary.doubleDuties} Double Shifts</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-100 text-amber-800">
                      <span className="font-semibold">Half Days (0.5):</span>
                      <span className="font-bold">{summary.halfDays} Days</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-100 text-purple-800">
                      <span className="font-semibold">Overtime Hours:</span>
                      <span className="font-bold">{summary.totalOvertimeHours} Hours</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-100 text-red-800">
                      <span className="font-semibold">Absents / Leaves:</span>
                      <span className="font-bold">{summary.absentDays} A / {summary.leaveDays} L</span>
                    </div>
                    <div className="flex justify-between items-center py-2 bg-blue-50 px-3 rounded-lg border border-blue-200">
                      <span className="font-bold text-blue-900 uppercase">Total Duty Units:</span>
                      <span className="font-black text-base text-blue-900">{summary.totalDutyUnits}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 bg-emerald-50 px-3 rounded-lg border border-emerald-200">
                      <span className="font-bold text-emerald-900 uppercase">Net Calculated Earnings:</span>
                      <span className="font-black text-base text-emerald-900">
                        PKR {(summary.earnedSalary + summary.overtimeAmount).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleGenerateSalarySlip(selectedGuard.id)}
                    className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 active:bg-blue-950 text-white font-bold text-xs rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Receipt className="w-4 h-4" />
                    <span>Generate & Print Salary Slip (سلپ بنائیں)</span>
                  </button>
                </div>

                {/* Right: Detailed Day-by-Day Log */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-slate-900 text-sm uppercase tracking-wider">
                      Daily Attendance Log for {selectedMonth}
                    </h4>
                    <span className="text-xs text-slate-500 font-bold">
                      {records.length} Marked Days
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 uppercase text-[11px] font-bold">
                          <th className="p-2.5">Date</th>
                          <th className="p-2.5">Shift</th>
                          <th className="p-2.5 text-center">Status</th>
                          <th className="p-2.5 text-center">Units</th>
                          <th className="p-2.5 text-center">Overtime</th>
                          <th className="p-2.5 text-center">Check-In / Out</th>
                          <th className="p-2.5">Remarks</th>
                          <th className="p-2.5 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {records.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="p-6 text-center text-slate-400">
                              No attendance recorded for this guard in {selectedMonth}.
                            </td>
                          </tr>
                        ) : (
                          records.map((r) => (
                            <tr key={r.id} className="hover:bg-slate-50">
                              <td className="p-2.5 font-bold text-slate-900">{formatDate(r.date)}</td>
                              <td className="p-2.5 text-slate-600">{r.shift}</td>
                              <td className="p-2.5 text-center">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                    ATTENDANCE_STATUS_CONFIG[r.status].badgeClass
                                  }`}
                                >
                                  {r.status}
                                </span>
                              </td>
                              <td className="p-2.5 text-center font-bold text-slate-900">{r.dutyUnits}</td>
                              <td className="p-2.5 text-center font-bold text-purple-700">
                                {r.overtimeHours ? `${r.overtimeHours}h` : '-'}
                              </td>
                              <td className="p-2.5 text-center font-mono text-[11px] text-slate-600">
                                {r.checkInTime ? `${r.checkInTime} - ${r.checkOutTime}` : '-'}
                              </td>
                              <td className="p-2.5 text-slate-600 text-[11px] italic">{r.remarks || '-'}</td>
                              <td className="p-2.5 text-center">
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Delete attendance record for ${r.date}?`)) {
                                      deleteAttendanceRecord(r.id);
                                    }
                                  }}
                                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                                  title="Delete record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* SUB-TAB 4: MONTHLY SALARY CALCULATION SUMMARY */}
      {activeSubTab === 'reports' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Monthly Salary & Duty Calculation Sheet</h3>
              <p className="text-xs text-slate-500">
                Direct payroll computation based on Full Days, Double Duties, Half Days & Overtime for {selectedMonth}.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-1.5 bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
              />
              <button
                onClick={handlePrintMonthlyMusterRoll}
                className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Master Sheet</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white uppercase text-[11px] font-bold">
                    <th className="p-3">#</th>
                    <th className="p-3">Guard Code & Name</th>
                    <th className="p-3">Deployment Site</th>
                    <th className="p-3 text-right">Basic Salary</th>
                    <th className="p-3 text-right">Per Day Rate</th>
                    <th className="p-3 text-center">Full (1.0)</th>
                    <th className="p-3 text-center">Double (2.0)</th>
                    <th className="p-3 text-center">Half (0.5)</th>
                    <th className="p-3 text-center">Absent</th>
                    <th className="p-3 text-center bg-blue-950 text-blue-200">Total Units</th>
                    <th className="p-3 text-center">OT (h)</th>
                    <th className="p-3 text-right">Earned Base</th>
                    <th className="p-3 text-right">OT Pay</th>
                    <th className="p-3 text-right bg-emerald-950 text-emerald-200">Net Payable</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {monthlySummaries.map((s, idx) => (
                    <tr key={s.guardId} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-bold text-slate-500">{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-mono text-[10px]">
                            {s.guardCode}
                          </span>
                          <span>{s.guardName}</span>
                        </div>
                      </td>
                      <td className="p-3 text-slate-600">{s.siteName}</td>
                      <td className="p-3 text-right font-medium">PKR {s.basicSalary.toLocaleString()}</td>
                      <td className="p-3 text-right text-slate-600 font-mono">PKR {s.perDayRate.toLocaleString()}</td>
                      <td className="p-3 text-center font-bold text-emerald-700">{s.fullDays}</td>
                      <td className="p-3 text-center font-bold text-blue-700">{s.doubleDuties}</td>
                      <td className="p-3 text-center font-bold text-amber-700">{s.halfDays}</td>
                      <td className="p-3 text-center font-bold text-red-600">{s.absentDays}</td>
                      <td className="p-3 text-center font-black text-blue-900 bg-blue-50/60 text-xs">
                        {s.totalDutyUnits}
                      </td>
                      <td className="p-3 text-center font-bold text-purple-700">{s.totalOvertimeHours}h</td>
                      <td className="p-3 text-right font-semibold">PKR {s.earnedSalary.toLocaleString()}</td>
                      <td className="p-3 text-right font-semibold text-purple-800">
                        PKR {s.overtimeAmount.toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-black text-emerald-900 bg-emerald-50/60 text-xs">
                        PKR {(s.earnedSalary + s.overtimeAmount).toLocaleString()}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleGenerateSalarySlip(s.guardId)}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded transition-colors"
                        >
                          Generate Slip
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-900 text-white font-bold text-xs uppercase">
                  <tr>
                    <td colSpan={5} className="p-3 text-right">
                      Grand Totals ({monthlySummaries.length} Guards):
                    </td>
                    <td className="p-3 text-center text-emerald-300">{monthlyAggregates.totalFullDays}</td>
                    <td className="p-3 text-center text-blue-300">{monthlyAggregates.totalDoubleDuties}</td>
                    <td className="p-3 text-center text-amber-300">{monthlyAggregates.totalHalfDays}</td>
                    <td className="p-3 text-center">-</td>
                    <td className="p-3 text-center text-white font-black text-sm">{monthlyAggregates.totalDutyUnits}</td>
                    <td className="p-3 text-center text-purple-300">{monthlyAggregates.totalOTHours}h</td>
                    <td className="p-3 text-right">PKR {monthlyAggregates.totalEarnedSalary.toLocaleString()}</td>
                    <td className="p-3 text-right text-purple-300">PKR {monthlyAggregates.totalOTAmt.toLocaleString()}</td>
                    <td className="p-3 text-right text-emerald-400 font-black text-sm">
                      PKR {monthlyAggregates.grandTotalSalary.toLocaleString()}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={handleExportCSV}
                        className="px-2 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-[10px]"
                      >
                        CSV
                      </button>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
