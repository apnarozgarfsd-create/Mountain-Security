import { CheckCircle, Eye, FileText, Plus, Printer, RefreshCw, Search } from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SalarySlip } from '../../types';
import { formatPKR, numberToWordsPKR } from '../../utils/formatters';

export const SalarySlipsView: React.FC = () => {
  const {
    salarySlips,
    guards,
    sites,
    clients,
    generateSalarySlip,
    updateSalarySlipStatus,
    triggerPrint,
    companySettings,
    getGuardMonthlySummary,
    setActiveTab,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('All');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form State for New Salary Slip
  const [selectedGuardId, setSelectedGuardId] = useState(guards[0]?.id || '');
  const [selectedSiteId, setSelectedSiteId] = useState(sites[0]?.id || '');
  const [customerName, setCustomerName] = useState('Mr. Ashfaq Sb');
  const [customerLocation, setCustomerLocation] = useState('The T H M Enterprises Dhanola Fsd.');
  const [customerContact, setCustomerContact] = useState('0308-5394816');
  const [monthName, setMonthName] = useState('July 2026');
  const [monthYear, setMonthYear] = useState('2026-07');
  const [issueDate, setIssueDate] = useState('05 August , 2026');
  const [salaryPeriod, setSalaryPeriod] = useState('01 – 31 July , 2026');
  const [slipNo, setSlipNo] = useState(`MSS/07/2026/${String(salarySlips.length + 1).padStart(4, '0')}`);

  const [basicSalary, setBasicSalary] = useState<number>(40000);
  const [annualSalaryIncrement, setAnnualSalaryIncrement] = useState<number>(0);
  const [attendanceDays, setAttendanceDays] = useState<number>(60);
  const [eidBonusDays, setEidBonusDays] = useState<number>(0);
  const [advances, setAdvances] = useState<number>(10000);
  const [deductions, setDeductions] = useState<number>(0);
  const [weaponCharges, setWeaponCharges] = useState<number>(0);
  const [securityGuardCompanyShare, setSecurityGuardCompanyShare] = useState<number>(0);
  const [notes, setNotes] = useState('Official Salary Slip - Mountain Security Services Pvt. Ltd.');

  // Auto-calculated fields
  const perDaySalary = basicSalary > 0 ? Number((basicSalary / 30).toFixed(1)) : 0;
  const earnedSalary = Math.round(perDaySalary * attendanceDays);
  const eidBonusAmount = Math.round(perDaySalary * eidBonusDays);
  const netSalary = Math.max(
    0,
    earnedSalary + annualSalaryIncrement + eidBonusAmount + weaponCharges - advances - deductions - securityGuardCompanyShare
  );
  const amountInWords = numberToWordsPKR(netSalary);

  const handleGuardChange = (guardId: string) => {
    setSelectedGuardId(guardId);
    const guard = guards.find((g) => g.id === guardId);
    if (guard) {
      setBasicSalary(guard.basicSalary || 40000);
      if (guard.currentSiteId) {
        setSelectedSiteId(guard.currentSiteId);
        const site = sites.find((s) => s.id === guard.currentSiteId);
        if (site) {
          setCustomerLocation(site.clientName || site.siteName);
          setCustomerName(site.contactPerson || 'Site In-Charge');
          setCustomerContact(site.contactPhone || guard.phone);
        }
      }
    }
  };

  const handlePreFillSampleSlip = (type: 'July-Ali' | 'June-Ali-Eid') => {
    if (type === 'July-Ali') {
      const ali = guards.find((g) => g.name.includes('Ali Akbar')) || guards[0];
      setSelectedGuardId(ali.id);
      setSlipNo('MSS/07/2026/0002');
      setMonthName('July 2026');
      setMonthYear('2026-07');
      setIssueDate('05 August , 2026');
      setSalaryPeriod('01 – 31 July , 2026');
      setCustomerName('Mr. Ashfaq Sb');
      setCustomerLocation('The T H M Enterprises Dhanola Fsd.');
      setCustomerContact('0308-5394816');
      setBasicSalary(40000);
      setAttendanceDays(60);
      setEidBonusDays(0);
      setAdvances(10000);
      setDeductions(0);
      setNotes('Official July 2026 Salary Slip');
    } else if (type === 'June-Ali-Eid') {
      const ali = guards.find((g) => g.name.includes('Ali Akbar')) || guards[0];
      setSelectedGuardId(ali.id);
      setSlipNo('MSS/07/2026/0007');
      setMonthName('June 2026');
      setMonthYear('2026-06');
      setIssueDate('06 July , 2026');
      setSalaryPeriod('01 – 30 June , 2026');
      setCustomerName('Mr. Ashfaq Sb');
      setCustomerLocation('The T H M Enterprises Dhanola Fsd.');
      setCustomerContact('0308-5394816');
      setBasicSalary(40000);
      setAttendanceDays(60);
      setEidBonusDays(6);
      setAdvances(20000);
      setDeductions(0);
      setNotes('Includes 6-days Eid bonus (PKR 8,000) and PKR 20,000 previous advance recovery');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const guard = guards.find((g) => g.id === selectedGuardId);
    const site = sites.find((s) => s.id === selectedSiteId);

    const newSlip = generateSalarySlip({
      slipNo,
      monthYear,
      monthName,
      issueDate,
      salaryPeriod,
      guardId: selectedGuardId,
      guardName: guard?.name || 'Guard',
      guardCnic: guard?.cnic || '',
      guardContact: guard?.phone || '',
      siteId: selectedSiteId,
      siteName: site?.siteName || '',
      customerName,
      customerLocation,
      customerContact,
      basicSalary,
      annualSalaryIncrement,
      perDaySalary,
      attendanceDays,
      earnedSalary,
      eidBonusDays,
      eidBonusAmount,
      advances,
      deductions,
      weaponCharges,
      securityGuardCompanyShare,
      netSalary,
      notes,
      status: 'Paid',
    });

    setIsCreateOpen(false);
    triggerPrint({
      type: 'salary-slip',
      data: newSlip,
      title: `Salary Slip ${newSlip.slipNo}`,
    });
  };

  const filteredSlips = salarySlips.filter((s) => {
    const matchesSearch =
      s.slipNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.guardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.customerLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = filterMonth === 'All' || s.monthName === filterMonth || s.monthYear === filterMonth;
    return matchesSearch && matchesMonth;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white uppercase flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-400" />
            <span>Official Salary Slips (MSS Slip)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Full compliance with Mountain Security Services official slip layout, automated attendance math & bank words.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Salary Slip</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Slip No, Guard Name, Site..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-hidden"
          >
            <option value="All">All Months</option>
            <option value="July 2026">July 2026</option>
            <option value="June 2026">June 2026</option>
            <option value="May 2026">May 2026</option>
          </select>
        </div>
      </div>

      {/* Salary Slips Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-bold">
                <th className="py-3 px-4">Slip Number</th>
                <th className="py-3 px-4">Month / Period</th>
                <th className="py-3 px-4">Guard Details</th>
                <th className="py-3 px-4">Customer / Site</th>
                <th className="py-3 px-4 text-center">Days</th>
                <th className="py-3 px-4 text-right">Earned</th>
                <th className="py-3 px-4 text-right">Bonus</th>
                <th className="py-3 px-4 text-right">Advance</th>
                <th className="py-3 px-4 text-right">Net Salary (PKR)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredSlips.map((slip) => (
                <tr key={slip.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-blue-400">{slip.slipNo}</span>
                    <div className="text-[10px] text-slate-500">{slip.issueDate}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-200">{slip.monthName}</span>
                    <div className="text-[10px] text-slate-400">{slip.salaryPeriod}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-100">{slip.guardName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{slip.guardCnic || slip.guardContact}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-slate-200 font-semibold">{slip.customerLocation}</div>
                    <div className="text-[10px] text-slate-400">{slip.customerName}</div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="bg-slate-800 text-blue-300 px-2 py-0.5 rounded font-mono font-bold">
                      {slip.attendanceDays}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-slate-300">
                    {slip.earnedSalary.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-emerald-400 font-semibold">
                    {slip.eidBonusAmount > 0 ? `+${slip.eidBonusAmount.toLocaleString()}` : '-'}
                  </td>
                  <td className="py-3 px-4 text-right text-red-400 font-semibold">
                    {slip.advances > 0 ? `-${slip.advances.toLocaleString()}` : '-'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="font-black text-sm text-emerald-400 font-mono">
                      {formatPKR(slip.netSalary)}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        slip.status === 'Paid'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                          : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                      }`}
                    >
                      {slip.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1.5">
                    <button
                      onClick={() =>
                        triggerPrint({
                          type: 'salary-slip',
                          data: slip,
                          title: `Official Slip: ${slip.slipNo}`,
                        })
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-600/90 hover:bg-blue-600 text-white rounded font-bold text-xs cursor-pointer shadow-xs"
                      title="Print Official Slip"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create New Salary Slip */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <span>Generate Official Salary / Customer Slip</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Calculates daily rate, earned wage, bonus, advances, net payable & words automatically.
                </p>
              </div>

              {/* Quick Sample pre-fill buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedGuardId) {
                      const summary = getGuardMonthlySummary(selectedGuardId, monthYear);
                      setAttendanceDays(summary.totalDutyUnits);
                      setWeaponCharges(summary.overtimeAmount);
                      setNotes(`Calculated from Attendance Register: ${summary.fullDays} Full Days, ${summary.doubleDuties} Double Duties, ${summary.halfDays} Half Days, ${summary.totalOvertimeHours}h Overtime.`);
                    }
                  }}
                  className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 text-white text-[11px] font-bold rounded border border-emerald-600 cursor-pointer flex items-center gap-1 shadow-xs"
                  title="Auto-fetch duty days and overtime amount from Attendance Register"
                >
                  <span>⚡ Sync Attendance (حاضری سے لائیں)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePreFillSampleSlip('July-Ali')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-300 text-[11px] font-bold rounded border border-slate-700 cursor-pointer"
                >
                  July (PKR 70k)
                </button>
                <button
                  type="button"
                  onClick={() => handlePreFillSampleSlip('June-Ali-Eid')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-[11px] font-bold rounded border border-slate-700 cursor-pointer"
                >
                  June Eid
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Slip Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Salary Slip No *</label>
                  <input
                    type="text"
                    required
                    value={slipNo}
                    onChange={(e) => setSlipNo(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Month Badge Name *</label>
                  <input
                    type="text"
                    required
                    value={monthName}
                    onChange={(e) => setMonthName(e.target.value)}
                    placeholder="e.g. July 2026"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Issue Date *</label>
                  <input
                    type="text"
                    required
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    placeholder="e.g. 05 August , 2026"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-semibold"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-slate-400 font-semibold mb-1">Salary Period Text *</label>
                  <input
                    type="text"
                    required
                    value={salaryPeriod}
                    onChange={(e) => setSalaryPeriod(e.target.value)}
                    placeholder="e.g. 01 – 31 July , 2026"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              {/* Guard & Customer Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Select Guard *</label>
                  <select
                    value={selectedGuardId}
                    onChange={(e) => handleGuardChange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-semibold"
                  >
                    {guards.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.guardCode}) - {g.designation} (Basic: {g.basicSalary.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Customer / Guard Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Customer Location / Site *</label>
                  <input
                    type="text"
                    required
                    value={customerLocation}
                    onChange={(e) => setCustomerLocation(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Customer / Guard Contact No *</label>
                  <input
                    type="text"
                    required
                    value={customerContact}
                    onChange={(e) => setCustomerContact(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              {/* Financial Calculation Inputs */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                  Salary Components & Math Breakdown
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Basic Salary (PKR)</label>
                    <input
                      type="number"
                      required
                      value={basicSalary}
                      onChange={(e) => setBasicSalary(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Attendance Days</label>
                    <input
                      type="number"
                      required
                      value={attendanceDays}
                      onChange={(e) => setAttendanceDays(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Per Day Rate</label>
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-300 font-mono font-bold">
                      {perDaySalary}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Earned Wage</label>
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-blue-400 font-mono font-bold">
                      {earnedSalary.toLocaleString()}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Eid Bonus (Days)</label>
                    <input
                      type="number"
                      value={eidBonusDays}
                      onChange={(e) => setEidBonusDays(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Eid Bonus Amount</label>
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-emerald-400 font-mono font-bold">
                      {eidBonusAmount.toLocaleString()}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Advance Deductions (PKR)</label>
                    <input
                      type="number"
                      value={advances}
                      onChange={(e) => setAdvances(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-red-400 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Annual Increment</label>
                    <input
                      type="number"
                      value={annualSalaryIncrement}
                      onChange={(e) => setAnnualSalaryIncrement(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                    />
                  </div>
                </div>

                {/* Net Summary Preview */}
                <div className="mt-3 p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-300 uppercase">Calculated Net Payable Salary:</span>
                    <div className="text-xl font-black text-white font-mono">
                      PKR {netSalary.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right text-xs text-emerald-200 italic">
                    "{amountInWords}"
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-lg cursor-pointer flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Generate & Open Printable Slip</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
