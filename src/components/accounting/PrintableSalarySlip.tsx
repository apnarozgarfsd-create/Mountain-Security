import React from 'react';
import { CompanySettings, SalarySlip } from '../../types';
import { MountainLogo } from '../common/MountainLogo';

interface PrintableSalarySlipProps {
  slip: SalarySlip;
  companySettings: CompanySettings;
  isDoubleView?: boolean;
}

export const PrintableSalarySlip: React.FC<PrintableSalarySlipProps> = ({
  slip,
  companySettings,
  isDoubleView = false,
}) => {
  return (
    <div
      id={`salary-slip-${slip.id}`}
      className="bg-white text-slate-900 border border-slate-300 rounded-lg p-5 max-w-[850px] mx-auto shadow-sm print:shadow-none print:border-0 print:p-2 print:max-w-none print:w-full select-text text-sm font-sans"
    >
      {/* 1. Header with Official Logo, Company Name & In-Charge Contact */}
      <div className="flex items-center justify-between pb-3 border-b-2 border-red-600">
        <div className="flex items-center gap-3">
          <MountainLogo size="slip" showText={false} />
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0a327c] font-display uppercase leading-tight">
              {companySettings.companyName}
            </h1>
            <p className="text-xs sm:text-sm font-bold tracking-wider text-red-600 uppercase">
              {companySettings.subTitle}
            </p>
          </div>
        </div>

        <div className="text-right text-xs space-y-1">
          <div className="flex items-center justify-end gap-1 font-semibold text-slate-800">
            <span className="inline-block w-4 text-center">👮</span>
            <span>Security In-Charge :</span>
            <span className="font-bold text-blue-900 uppercase">
              {companySettings.securityInCharge}
            </span>
          </div>

          <div className="flex items-center justify-end gap-1 text-slate-700 font-medium">
            <span className="inline-block text-emerald-600 font-bold">✆</span>
            <span>{companySettings.phone1}, {companySettings.phone2}</span>
          </div>

          <div className="flex items-center justify-end gap-1 text-slate-600 text-[11px] max-w-[280px]">
            <span className="text-red-500 font-bold">📍</span>
            <span>Office Address: {companySettings.officeAddress}</span>
          </div>
        </div>
      </div>

      {/* 2. Sub Header Badges: Customer Slip & Month */}
      <div className="flex items-center justify-between mt-3 mb-3">
        <div className="bg-[#0b2b69] text-white px-5 py-1.5 rounded-r-full font-bold text-xs uppercase tracking-wider shadow-sm">
          Customer / Guard Slip
        </div>
        <div className="bg-[#d90429] text-white px-6 py-1.5 rounded-l-full font-bold text-xs uppercase tracking-wider shadow-sm">
          {slip.monthName || slip.monthYear}
        </div>
      </div>

      {/* 3. Customer & Slip Information Grid */}
      <div className="border border-slate-300 rounded-md p-3 mb-4 grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 bg-slate-50/70 text-xs">
        <div className="space-y-1.5">
          <div className="flex items-start gap-2">
            <span className="text-blue-700 font-bold">📍</span>
            <div>
              <span className="font-semibold text-slate-600">Customer Location / Site :</span>
              <p className="font-bold text-slate-900">{slip.customerLocation || slip.siteName}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <span className="text-blue-700 font-bold">👤</span>
            <div>
              <span className="font-semibold text-slate-600">Customer / Guard Name :</span>
              <p className="font-bold text-slate-900">
                {slip.customerName} {slip.guardName ? `(${slip.guardName} - ${slip.guardCnic})` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <span className="text-blue-700 font-bold">📞</span>
            <div>
              <span className="font-semibold text-slate-600">Contact No :</span>
              <span className="font-bold text-slate-900 ml-1">{slip.customerContact || slip.guardContact}</span>
            </div>
          </div>
        </div>

        <div className="space-y-1.5 md:border-l md:border-slate-200 md:pl-4">
          <div className="flex items-start gap-2">
            <span className="text-red-600 font-bold">🗓️</span>
            <div>
              <span className="font-semibold text-slate-600">Issue Date :</span>
              <span className="font-bold text-slate-900 ml-1">{slip.issueDate}</span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <span className="text-red-600 font-bold">⏱️</span>
            <div>
              <span className="font-semibold text-slate-600">Salary Period :</span>
              <span className="font-bold text-slate-900 ml-1">{slip.salaryPeriod}</span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <span className="text-red-600 font-bold">🧾</span>
            <div>
              <span className="font-semibold text-slate-600">Salary Slip No :</span>
              <span className="font-bold text-blue-900 ml-1 tracking-wide">{slip.slipNo}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Financial Description Table */}
      <div className="border border-slate-300 rounded-md overflow-hidden mb-3">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="bg-[#0b2b69] text-white uppercase tracking-wider text-[11px] font-bold">
              <th className="py-2 px-3">DESCRIPTION</th>
              <th className="py-2 px-3 text-right">AMOUNT ( PKR )</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-medium">
            <tr className="hover:bg-slate-50">
              <td className="py-1.5 px-3">Basic Salary</td>
              <td className="py-1.5 px-3 text-right font-semibold">
                {slip.basicSalary.toLocaleString()}
              </td>
            </tr>

            {slip.annualSalaryIncrement > 0 && (
              <tr className="hover:bg-slate-50">
                <td className="py-1.5 px-3">Annual Salary Increment</td>
                <td className="py-1.5 px-3 text-right font-semibold">
                  {slip.annualSalaryIncrement.toLocaleString()}
                </td>
              </tr>
            )}

            <tr className="hover:bg-slate-50">
              <td className="py-1.5 px-3">Per Day Salary</td>
              <td className="py-1.5 px-3 text-right font-semibold">
                {slip.perDaySalary > 0 ? slip.perDaySalary.toFixed(1) : (slip.basicSalary / 30).toFixed(1)}
              </td>
            </tr>

            <tr className="hover:bg-slate-50">
              <td className="py-1.5 px-3">Attendance Days</td>
              <td className="py-1.5 px-3 text-right font-bold text-blue-900">
                {slip.attendanceDays}
              </td>
            </tr>

            <tr className="hover:bg-slate-50 bg-blue-50/30">
              <td className="py-1.5 px-3 font-semibold">Earned Salary</td>
              <td className="py-1.5 px-3 text-right font-bold text-slate-900">
                {slip.earnedSalary.toLocaleString()}
              </td>
            </tr>

            {slip.eidBonusAmount > 0 && (
              <tr className="hover:bg-slate-50 text-emerald-800">
                <td className="py-1.5 px-3">Eid Bonus {slip.eidBonusDays ? `(${slip.eidBonusDays} - Days)` : ''}</td>
                <td className="py-1.5 px-3 text-right font-semibold">
                  {slip.eidBonusAmount.toLocaleString()}
                </td>
              </tr>
            )}

            <tr className="hover:bg-slate-50 text-red-700">
              <td className="py-1.5 px-3">Advances</td>
              <td className="py-1.5 px-3 text-right font-semibold">
                {slip.advances > 0 ? `(${slip.advances.toLocaleString()})` : '0'}
              </td>
            </tr>

            {slip.deductions > 0 && (
              <tr className="hover:bg-slate-50 text-red-700">
                <td className="py-1.5 px-3">Other Deductions / Penalties</td>
                <td className="py-1.5 px-3 text-right font-semibold">
                  ({slip.deductions.toLocaleString()})
                </td>
              </tr>
            )}

            <tr className="hover:bg-slate-50">
              <td className="py-1.5 px-3">Weapon Charges</td>
              <td className="py-1.5 px-3 text-right font-semibold">
                {slip.weaponCharges ? slip.weaponCharges.toLocaleString() : '0'}
              </td>
            </tr>

            <tr className="hover:bg-slate-50">
              <td className="py-1.5 px-3">Security Guard Salary (Company Share)</td>
              <td className="py-1.5 px-3 text-right font-semibold">
                {slip.securityGuardCompanyShare ? slip.securityGuardCompanyShare.toLocaleString() : '0'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 5. NET SALARY BAR */}
      <div className="bg-emerald-50 border-2 border-emerald-600 rounded-md p-2.5 flex items-center justify-between mb-3 text-emerald-950 font-bold">
        <span className="text-sm uppercase tracking-wide">NET SALARY / TOTAL PAYABLE :</span>
        <div className="text-base sm:text-lg tracking-tight font-black text-emerald-800">
          <span className="text-xs mr-1 font-semibold text-emerald-700">PKR</span>
          {slip.netSalary.toLocaleString()}
        </div>
      </div>

      {/* 6. Amount in Words */}
      <div className="border border-slate-300 rounded p-2 mb-4 bg-slate-50 text-xs">
        <span className="font-bold text-slate-700">Amount in Words: </span>
        <span className="italic font-semibold text-slate-900 ml-1">
          {slip.amountInWords || 'Rupees Zero Only.'}
        </span>
      </div>

      {/* 7. Receiving Signature & Stamp Area */}
      <div className="my-5 pt-2 flex items-end justify-between text-xs">
        <div className="w-1/2">
          <div className="font-bold text-slate-800 uppercase tracking-wider mb-8">
            SALARY RECEIVED BY ( COMPANY / GUARD ) :
          </div>
          <div className="border-b border-slate-800 w-48"></div>
        </div>

        <div className="text-center">
          <div className="border border-dashed border-slate-400 w-32 h-14 rounded flex items-center justify-center text-slate-400 font-bold text-[10px] uppercase">
            STAMP / SIGN
          </div>
        </div>
      </div>

      {/* 8. Official Bottom Footer with Online Payment, Social & Chief Executive Info */}
      <div className="border-t-2 border-red-600 pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] items-center bg-slate-50 -mx-5 -mb-5 p-3 rounded-b-lg">
        {/* Payment */}
        <div className="space-y-0.5">
          <div className="bg-[#0b2b69] text-white px-2 py-0.5 rounded text-[10px] font-bold inline-block uppercase">
            FOR ONLINE PAYMENT :
          </div>
          <div className="font-bold text-slate-800 flex items-center gap-1.5 mt-1">
            <span className="bg-red-600 text-white text-[9px] px-1 py-0.5 rounded font-black">
              {companySettings.onlinePaymentBank}
            </span>
            <span>{companySettings.onlinePaymentAccountName}</span>
          </div>
          <div className="text-slate-700 font-semibold">{companySettings.onlinePaymentAccountNo}</div>
        </div>

        {/* Social */}
        <div className="text-center space-y-0.5 border-y sm:border-y-0 sm:border-x border-slate-200 py-1 sm:py-0">
          <div className="flex items-center justify-center gap-2 text-slate-600 text-sm">
            <span>🎵</span>
            <span>📘</span>
            <span>📸</span>
          </div>
          <div className="text-[10px] font-semibold text-slate-700">
            1. {companySettings.facebookHandle}
          </div>
          <div className="text-[10px] font-semibold text-slate-700">
            2. {companySettings.tiktokHandle}
          </div>
        </div>

        {/* Chief Executive */}
        <div className="text-right">
          <div className="text-red-600 font-bold text-[11px] uppercase tracking-wider">
            {companySettings.companyName}
          </div>
          <div className="text-[10px] text-slate-600 font-medium">
            Chief Executive : <span className="font-bold text-slate-900">{companySettings.chiefExecutiveTitle}</span>
          </div>
          <div className="text-xs font-black text-[#0b2b69] tracking-tight">
            {companySettings.chiefExecutive}
          </div>
        </div>
      </div>
    </div>
  );
};
