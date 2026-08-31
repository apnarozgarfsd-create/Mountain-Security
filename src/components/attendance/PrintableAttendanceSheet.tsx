import React from 'react';
import { CompanySettings } from '../../types';
import { formatDate } from '../../utils/formatters';
import { MountainLogo } from '../common/MountainLogo';

interface PrintableAttendanceSheetProps {
  data: any;
  companySettings: CompanySettings;
}

export const PrintableAttendanceSheet: React.FC<PrintableAttendanceSheetProps> = ({
  data,
  companySettings,
}) => {
  const isDaily = data.mode === 'daily';

  if (isDaily) {
    return (
      <div className="bg-white p-6 rounded-lg border border-slate-300 shadow-sm max-w-4xl mx-auto print:shadow-none print:border-0 print:p-0 text-sm">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-red-600 mb-4">
          <div className="flex items-center gap-3">
            <MountainLogo size="md" showText={false} />
            <div>
              <h2 className="text-xl font-black font-display text-blue-900 uppercase">
                {companySettings.companyName}
              </h2>
              <p className="text-xs font-bold text-red-600">{companySettings.subTitle}</p>
              <p className="text-[11px] text-slate-500">{companySettings.address} • Ph: {companySettings.phone}</p>
            </div>
          </div>
          <div className="text-right text-xs">
            <div className="text-sm font-black text-slate-900 bg-slate-100 px-3 py-1 rounded inline-block border border-slate-200 uppercase">
              Daily Guard Duty Register
            </div>
            <div className="font-bold text-blue-900 mt-1">Date: {formatDate(data.date)}</div>
            <div className="text-slate-600">Deployment: {data.siteName || 'All Sites'}</div>
          </div>
        </div>

        {/* Daily Summary Counters */}
        <div className="grid grid-cols-4 gap-3 text-xs mb-4 bg-slate-50 p-3 rounded border border-slate-200 text-center">
          <div>
            <span className="text-slate-500 font-semibold block text-[10px] uppercase">Guards Deployed</span>
            <span className="font-black text-sm text-slate-900">{data.records.length}</span>
          </div>
          <div>
            <span className="text-emerald-700 font-semibold block text-[10px] uppercase">Full Days (1.0)</span>
            <span className="font-black text-sm text-emerald-800">{data.stats?.fullDays || 0}</span>
          </div>
          <div>
            <span className="text-blue-700 font-semibold block text-[10px] uppercase">Double Duties (2.0)</span>
            <span className="font-black text-sm text-blue-800">{data.stats?.doubleDuties || 0}</span>
          </div>
          <div>
            <span className="text-purple-700 font-semibold block text-[10px] uppercase">Overtime Total</span>
            <span className="font-black text-sm text-purple-800">{data.stats?.totalOvertimeHours || 0} hrs</span>
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-xs border border-slate-300 rounded mb-6">
          <thead>
            <tr className="bg-slate-900 text-white uppercase text-[10px]">
              <th className="p-2 text-center w-8">#</th>
              <th className="p-2 text-left">Guard Code & Name</th>
              <th className="p-2 text-left">Rank</th>
              <th className="p-2 text-left">Assigned Site</th>
              <th className="p-2 text-center">Shift</th>
              <th className="p-2 text-center">Duty Status</th>
              <th className="p-2 text-center">Units</th>
              <th className="p-2 text-center">OT (h)</th>
              <th className="p-2 text-left">Remarks / Weapon</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {data.records.map((item: any, idx: number) => {
              const g = item.guard;
              const r = item.record;
              const status = r ? r.status : 'Full Day';
              const units = r ? r.dutyUnits : 1.0;
              const ot = r ? r.overtimeHours || 0 : 0;

              return (
                <tr key={g.id} className="hover:bg-slate-50">
                  <td className="p-2 text-center font-bold text-slate-500">{idx + 1}</td>
                  <td className="p-2 font-bold text-slate-900">
                    {g.name} <span className="font-mono text-[10px] text-slate-500">({g.guardCode})</span>
                  </td>
                  <td className="p-2 text-slate-700">{g.designation}</td>
                  <td className="p-2 text-slate-700">{g.currentSiteName || 'HQ'}</td>
                  <td className="p-2 text-center text-slate-600">{r?.shift || 'Day Shift (12h)'}</td>
                  <td className="p-2 text-center font-bold">
                    <span className={status === 'Double Duty' ? 'text-blue-700' : status === 'Absent' ? 'text-red-700' : 'text-emerald-700'}>
                      {status}
                    </span>
                  </td>
                  <td className="p-2 text-center font-black text-slate-900">{units}</td>
                  <td className="p-2 text-center font-bold text-purple-700">{ot > 0 ? `${ot}h` : '-'}</td>
                  <td className="p-2 text-slate-600 italic text-[11px]">{r?.remarks || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Signature Area */}
        <div className="grid grid-cols-3 gap-6 text-xs pt-8 text-center mt-6">
          <div>
            <div className="border-t border-slate-400 pt-1 font-bold text-slate-700">Duty Field Supervisor</div>
          </div>
          <div>
            <div className="border-t border-slate-400 pt-1 font-bold text-slate-700">Operations Manager</div>
          </div>
          <div>
            <div className="border-t border-slate-400 pt-1 font-bold text-slate-700">Client / Site Authority</div>
          </div>
        </div>
      </div>
    );
  }

  // Monthly Muster Roll Matrix Print
  return (
    <div className="bg-white p-6 rounded-lg border border-slate-300 shadow-sm max-w-5xl mx-auto print:shadow-none print:border-0 print:p-0 text-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b-2 border-red-600 mb-4">
        <div className="flex items-center gap-3">
          <MountainLogo size="md" showText={false} />
          <div>
            <h2 className="text-xl font-black font-display text-blue-900 uppercase">
              {companySettings.companyName}
            </h2>
            <p className="text-xs font-bold text-red-600">MONTHLY GUARD ATTENDANCE & DUTY MUSTER ROLL</p>
            <p className="text-[10px] text-slate-500">{companySettings.address} • Ph: {companySettings.phone}</p>
          </div>
        </div>
        <div className="text-right text-xs">
          <div className="font-bold text-sm text-slate-900 bg-slate-100 px-3 py-1 rounded inline-block border border-slate-200">
            Month: {data.monthYear}
          </div>
          <div className="text-slate-600 mt-1">Total Active Guards: {data.guards.length}</div>
        </div>
      </div>

      {/* Summary Matrix Table */}
      <table className="w-full text-[10px] border border-slate-300 rounded mb-4">
        <thead>
          <tr className="bg-slate-900 text-white uppercase text-[9px]">
            <th className="p-1.5 text-left">Guard Code & Name</th>
            <th className="p-1.5 text-left">Site</th>
            <th className="p-1.5 text-center">FD (1.0)</th>
            <th className="p-1.5 text-center">DD (2.0)</th>
            <th className="p-1.5 text-center">HD (0.5)</th>
            <th className="p-1.5 text-center">Absent</th>
            <th className="p-1.5 text-center font-bold">Duty Units</th>
            <th className="p-1.5 text-center">OT (h)</th>
            <th className="p-1.5 text-right">Basic (PKR)</th>
            <th className="p-1.5 text-right">Earned Base</th>
            <th className="p-1.5 text-right">OT Amount</th>
            <th className="p-1.5 text-right font-black">Net Pay (PKR)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {data.summaries.map((s: any) => (
            <tr key={s.guardId} className="hover:bg-slate-50">
              <td className="p-1.5 font-bold text-slate-900">
                {s.guardName} <span className="font-mono text-slate-500">({s.guardCode})</span>
              </td>
              <td className="p-1.5 text-slate-600">{s.siteName}</td>
              <td className="p-1.5 text-center font-bold text-emerald-700">{s.fullDays}</td>
              <td className="p-1.5 text-center font-bold text-blue-700">{s.doubleDuties}</td>
              <td className="p-1.5 text-center font-bold text-amber-700">{s.halfDays}</td>
              <td className="p-1.5 text-center font-bold text-red-600">{s.absentDays}</td>
              <td className="p-1.5 text-center font-black text-blue-900 bg-blue-50">{s.totalDutyUnits}</td>
              <td className="p-1.5 text-center font-bold text-purple-700">{s.totalOvertimeHours}h</td>
              <td className="p-1.5 text-right text-slate-600">{s.basicSalary.toLocaleString()}</td>
              <td className="p-1.5 text-right font-semibold">{s.earnedSalary.toLocaleString()}</td>
              <td className="p-1.5 text-right text-purple-800 font-semibold">{s.overtimeAmount.toLocaleString()}</td>
              <td className="p-1.5 text-right font-black text-emerald-900 bg-emerald-50">
                {(s.earnedSalary + s.overtimeAmount).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-slate-900 text-white font-bold text-[10px] uppercase">
          <tr>
            <td colSpan={2} className="p-2 text-right">
              Total Summary:
            </td>
            <td className="p-2 text-center text-emerald-300">{data.aggregates.totalFullDays}</td>
            <td className="p-2 text-center text-blue-300">{data.aggregates.totalDoubleDuties}</td>
            <td className="p-2 text-center text-amber-300">{data.aggregates.totalHalfDays}</td>
            <td className="p-2 text-center">-</td>
            <td className="p-2 text-center text-white text-xs font-black">{data.aggregates.totalDutyUnits}</td>
            <td className="p-2 text-center text-purple-300">{data.aggregates.totalOTHours}h</td>
            <td className="p-2 text-right">-</td>
            <td className="p-2 text-right">PKR {data.aggregates.totalEarnedSalary.toLocaleString()}</td>
            <td className="p-2 text-right text-purple-300">PKR {data.aggregates.totalOTAmt.toLocaleString()}</td>
            <td className="p-2 text-right text-emerald-400 font-black text-xs">
              PKR {data.aggregates.grandTotalSalary.toLocaleString()}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Signature Row */}
      <div className="grid grid-cols-3 gap-6 text-xs pt-8 text-center mt-6">
        <div>
          <div className="border-t border-slate-400 pt-1 font-bold text-slate-700">Prepared By (HR & Duty Clerk)</div>
        </div>
        <div>
          <div className="border-t border-slate-400 pt-1 font-bold text-slate-700">Checked By (Accountant)</div>
        </div>
        <div>
          <div className="border-t border-slate-400 pt-1 font-bold text-slate-700">Approved By (Director Operations)</div>
        </div>
      </div>
    </div>
  );
};
