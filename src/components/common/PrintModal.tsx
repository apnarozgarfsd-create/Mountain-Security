import { Download, FileText, Printer, X } from 'lucide-react';
import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/formatters';
import { PrintableSalarySlip } from '../accounting/PrintableSalarySlip';
import { PrintableAttendanceSheet } from '../attendance/PrintableAttendanceSheet';
import { MountainLogo } from './MountainLogo';

export const PrintModal: React.FC = () => {
  const { printPayload, setPrintPayload, companySettings } = useApp();

  if (!printPayload) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:static print:bg-white">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden print:max-h-none print:shadow-none print:border-0 print:w-full">
        {/* Top bar (Hidden when printing) */}
        <div className="no-print bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-red-500" />
            <h3 className="font-bold text-base tracking-tight">
              Official Document Preview: {printPayload.title}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={() => setPrintPayload(null)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Body */}
        <div className="p-4 sm:p-6 overflow-y-auto grow bg-slate-100 print:bg-white print:p-0 print:overflow-visible">
          {printPayload.type === 'attendance-sheet' && (
            <PrintableAttendanceSheet
              data={printPayload.data}
              companySettings={companySettings}
            />
          )}

          {printPayload.type === 'salary-slip' && (
            <PrintableSalarySlip
              slip={printPayload.data}
              companySettings={companySettings}
            />
          )}

          {printPayload.type === 'voucher' && (
            <div className="bg-white p-6 rounded-lg border border-slate-300 shadow-sm max-w-3xl mx-auto print:shadow-none print:border-0 print:p-0 text-sm">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b-2 border-red-600 mb-4">
                <div className="flex items-center gap-3">
                  <MountainLogo size="md" showText={false} />
                  <div>
                    <h2 className="text-xl font-black font-display text-blue-900 uppercase">
                      {companySettings.companyName}
                    </h2>
                    <p className="text-xs font-bold text-red-600">{companySettings.subTitle}</p>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <div className="text-base font-black text-slate-900 bg-slate-100 px-3 py-1 rounded inline-block border border-slate-200 uppercase">
                    {printPayload.data.voucherType} Voucher
                  </div>
                  <div className="font-bold text-blue-900 mt-1">No: {printPayload.data.voucherNo}</div>
                  <div className="text-slate-600">Date: {printPayload.data.date}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs mb-4 bg-slate-50 p-3 rounded border border-slate-200">
                <div>
                  <span className="text-slate-500 font-semibold">Reference / Cheque #:</span>
                  <p className="font-bold text-slate-900">{printPayload.data.referenceNo || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold">Created By:</span>
                  <p className="font-bold text-slate-900">{printPayload.data.createdBy} (Status: {printPayload.data.status})</p>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 font-semibold">Narration / Description:</span>
                  <p className="font-bold text-slate-900">{printPayload.data.narration}</p>
                </div>
              </div>

              {/* Table */}
              <table className="w-full text-xs border border-slate-200 rounded mb-4">
                <thead>
                  <tr className="bg-slate-900 text-white uppercase text-[11px]">
                    <th className="p-2 text-left">Account Code & Title</th>
                    <th className="p-2 text-left">Line Narration / Party</th>
                    <th className="p-2 text-right">Debit (PKR)</th>
                    <th className="p-2 text-right">Credit (PKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {printPayload.data.entries.map((ent: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2 font-bold text-slate-800">
                        {ent.accountCode} - {ent.accountName}
                      </td>
                      <td className="p-2 text-slate-600">
                        {ent.narration || '-'} {ent.partyName ? `(${ent.partyName})` : ''}
                      </td>
                      <td className="p-2 text-right font-semibold text-slate-900">
                        {ent.debit > 0 ? ent.debit.toLocaleString() : '-'}
                      </td>
                      <td className="p-2 text-right font-semibold text-slate-900">
                        {ent.credit > 0 ? ent.credit.toLocaleString() : '-'}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100 font-black text-xs border-t-2 border-slate-900">
                    <td colSpan={2} className="p-2 text-right uppercase">Total Amount:</td>
                    <td className="p-2 text-right text-blue-900">{printPayload.data.totalDebit.toLocaleString()}</td>
                    <td className="p-2 text-right text-blue-900">{printPayload.data.totalCredit.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>

              {/* Signatures */}
              <div className="grid grid-cols-3 gap-4 pt-10 text-xs text-center">
                <div>
                  <div className="border-t border-slate-400 pt-1 font-bold text-slate-700">Prepared By</div>
                </div>
                <div>
                  <div className="border-t border-slate-400 pt-1 font-bold text-slate-700">Checked / Verified</div>
                </div>
                <div>
                  <div className="border-t border-slate-400 pt-1 font-bold text-slate-700">Authorized Officer / Stamp</div>
                </div>
              </div>
            </div>
          )}

          {printPayload.type === 'weapon-slip' && (
            <div className="bg-white p-6 rounded-lg border border-slate-300 shadow-sm max-w-2xl mx-auto print:shadow-none print:border-0 print:p-0 text-sm">
              <div className="flex items-center justify-between pb-3 border-b-2 border-red-600 mb-4">
                <div className="flex items-center gap-3">
                  <MountainLogo size="md" showText={false} />
                  <div>
                    <h2 className="text-xl font-black font-display text-blue-900 uppercase">
                      {companySettings.companyName}
                    </h2>
                    <p className="text-xs font-bold text-red-600">ARMOURY ASSET DEPLOYMENT SLIP</p>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <div className="font-bold text-slate-900">Date: {new Date().toISOString().split('T')[0]}</div>
                  <div className="font-semibold text-blue-900">Armoury Registry</div>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                  <h4 className="font-bold text-blue-900 mb-2 uppercase">Weapon Information</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="text-slate-500">Weapon Code:</span> <strong>{printPayload.data.weaponCode}</strong></div>
                    <div><span className="text-slate-500">Weapon Type:</span> <strong>{printPayload.data.weaponType}</strong></div>
                    <div><span className="text-slate-500">Make & Model:</span> <strong>{printPayload.data.makeModel}</strong></div>
                    <div><span className="text-slate-500">Serial Number:</span> <strong className="text-red-700">{printPayload.data.serialNumber}</strong></div>
                    <div><span className="text-slate-500">Condition:</span> <strong>{printPayload.data.condition}</strong></div>
                    <div><span className="text-slate-500">Armoury Bay:</span> <strong>{printPayload.data.armouryLocation}</strong></div>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-3 rounded">
                  <h4 className="font-bold text-slate-900 mb-2 uppercase">Deployment Assignment</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="text-slate-500">Assigned Guard:</span> <strong>{printPayload.data.currentGuardName || 'Armoury Reserve'}</strong></div>
                    <div><span className="text-slate-500">Stationed Site:</span> <strong>{printPayload.data.currentSiteName || 'Headquarters Armoury'}</strong></div>
                    <div><span className="text-slate-500">Current Status:</span> <strong className="text-blue-900">{printPayload.data.currentStatus}</strong></div>
                    <div><span className="text-slate-500">License Authority:</span> <strong>Govt. of Punjab Arms Reg.</strong></div>
                  </div>
                </div>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-6 text-xs text-center">
                <div>
                  <div className="border-t border-slate-400 pt-1 font-bold text-slate-800">Armoury In-Charge</div>
                </div>
                <div>
                  <div className="border-t border-slate-400 pt-1 font-bold text-slate-800">Guard / Receiver Signature</div>
                </div>
              </div>
            </div>
          )}

          {printPayload.type === 'uniform-slip' && (
            <div className="bg-white p-6 rounded-lg border border-slate-300 shadow-sm max-w-2xl mx-auto print:shadow-none print:border-0 print:p-0 text-sm">
              <div className="flex items-center justify-between pb-3 border-b-2 border-red-600 mb-4">
                <div className="flex items-center gap-3">
                  <MountainLogo size="md" showText={false} />
                  <div>
                    <h2 className="text-xl font-black font-display text-blue-900 uppercase">
                      {companySettings.companyName}
                    </h2>
                    <p className="text-xs font-bold text-red-600">UNIFORM & EQUIPMENT ISSUE SLIP</p>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <div className="font-bold text-slate-900">Date: {printPayload.data.issueDate || new Date().toISOString().split('T')[0]}</div>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs mb-4">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-slate-500">Guard Name:</span> <strong>{printPayload.data.guardName}</strong></div>
                  <div><span className="text-slate-500">Item Issued:</span> <strong>{printPayload.data.productName}</strong></div>
                  <div><span className="text-slate-500">Quantity:</span> <strong className="text-blue-900 text-sm">{printPayload.data.quantity}</strong></div>
                  <div><span className="text-slate-500">Condition on Issue:</span> <strong>{printPayload.data.conditionOnIssue || 'Brand New'}</strong></div>
                  <div className="col-span-2"><span className="text-slate-500">Notes:</span> {printPayload.data.notes || '-'}</div>
                </div>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-6 text-xs text-center">
                <div>
                  <div className="border-t border-slate-400 pt-1 font-bold text-slate-800">Store Keeper</div>
                </div>
                <div>
                  <div className="border-t border-slate-400 pt-1 font-bold text-slate-800">Guard Signature</div>
                </div>
              </div>
            </div>
          )}

          {printPayload.type === 'client-invoice' && (
            <div className="bg-white p-6 rounded-lg border border-slate-300 shadow-sm max-w-3xl mx-auto print:shadow-none print:border-0 print:p-0 text-sm">
              <div className="flex items-center justify-between pb-3 border-b-2 border-red-600 mb-4">
                <div className="flex items-center gap-3">
                  <MountainLogo size="md" showText={false} />
                  <div>
                    <h2 className="text-xl font-black font-display text-blue-900 uppercase">
                      {companySettings.companyName}
                    </h2>
                    <p className="text-xs font-bold text-red-600 uppercase">Security Services Billing Invoice</p>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <div className="text-lg font-black text-blue-900">INVOICE #{printPayload.data.invoiceNo}</div>
                  <div className="text-slate-600">Month: {printPayload.data.billingMonth}</div>
                  <div className="text-slate-600">Date: {printPayload.data.issueDate}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs mb-4 bg-slate-50 p-3 rounded border border-slate-200">
                <div>
                  <span className="text-slate-500 font-semibold uppercase text-[10px]">Billed To (Client):</span>
                  <p className="font-bold text-sm text-slate-900 mt-0.5">{printPayload.data.clientName}</p>
                  <p className="text-slate-600">Site: {printPayload.data.siteName}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 font-semibold uppercase text-[10px]">Payment Due Date:</span>
                  <p className="font-bold text-red-600 text-sm mt-0.5">{printPayload.data.dueDate}</p>
                  <p className="text-slate-600">Status: <span className="font-bold uppercase text-blue-900">{printPayload.data.status}</span></p>
                </div>
              </div>

              <table className="w-full text-xs border border-slate-200 rounded mb-4">
                <thead>
                  <tr className="bg-slate-900 text-white uppercase text-[11px]">
                    <th className="p-2 text-left">Description</th>
                    <th className="p-2 text-center">Guards Deployed</th>
                    <th className="p-2 text-right">Rate / Guard (PKR)</th>
                    <th className="p-2 text-right">Total (PKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2 font-bold text-slate-800">
                      Security Guarding Services for {printPayload.data.billingMonth}
                    </td>
                    <td className="p-2 text-center font-bold">{printPayload.data.guardsDeployed}</td>
                    <td className="p-2 text-right font-semibold">{printPayload.data.ratePerGuard.toLocaleString()}</td>
                    <td className="p-2 text-right font-bold text-slate-900">{printPayload.data.totalAmount.toLocaleString()}</td>
                  </tr>
                  <tr className="bg-slate-50 font-bold">
                    <td colSpan={3} className="p-2 text-right">Total Payable Amount:</td>
                    <td className="p-2 text-right font-black text-blue-900 text-sm">PKR {printPayload.data.totalAmount.toLocaleString()}</td>
                  </tr>
                  {printPayload.data.paidAmount > 0 && (
                    <tr className="text-emerald-700">
                      <td colSpan={3} className="p-2 text-right">Amount Received:</td>
                      <td className="p-2 text-right font-bold">PKR {printPayload.data.paidAmount.toLocaleString()}</td>
                    </tr>
                  )}
                  {printPayload.data.balanceAmount > 0 && (
                    <tr className="text-red-700 font-bold">
                      <td colSpan={3} className="p-2 text-right">Balance Outstanding:</td>
                      <td className="p-2 text-right font-bold">PKR {printPayload.data.balanceAmount.toLocaleString()}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="bg-blue-50 p-3 rounded border border-blue-200 text-xs mb-6">
                <span className="font-bold text-blue-900 uppercase">Payment Instructions:</span>
                <p className="text-slate-700 mt-1">
                  Please deposit cross cheque in favor of <strong>Mountain Security Services</strong> or online transfer to {companySettings.onlinePaymentBank}: {companySettings.onlinePaymentAccountNo} ({companySettings.onlinePaymentAccountName}).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs pt-4 text-center">
                <div>
                  <div className="border-t border-slate-400 pt-1 font-bold text-slate-700">Prepared By Accountant</div>
                </div>
                <div>
                  <div className="border-t border-slate-400 pt-1 font-bold text-slate-700">Authorized Signature & Stamp</div>
                </div>
              </div>
            </div>
          )}

          {printPayload.type === 'account-ledger' && (
            <div className="bg-white p-6 rounded-lg border border-slate-300 shadow-sm max-w-4xl mx-auto print:shadow-none print:border-0 print:p-0 text-sm">
              <div className="flex items-center justify-between pb-3 border-b-2 border-red-600 mb-4">
                <div className="flex items-center gap-3">
                  <MountainLogo size="md" showText={false} />
                  <div>
                    <h2 className="text-xl font-black font-display text-blue-900 uppercase">
                      {companySettings.companyName}
                    </h2>
                    <p className="text-xs font-bold text-red-600">GENERAL LEDGER STATEMENT</p>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <div className="font-bold text-slate-900">Account: {printPayload.data.accountName} ({printPayload.data.accountCode})</div>
                  <div className="text-slate-600">Period: {printPayload.data.period || 'All Transactions'}</div>
                </div>
              </div>

              <table className="w-full text-xs border border-slate-200 rounded mb-4">
                <thead>
                  <tr className="bg-slate-900 text-white uppercase text-[11px]">
                    <th className="p-2 text-left">Date</th>
                    <th className="p-2 text-left">Voucher #</th>
                    <th className="p-2 text-left">Narration / Particulars</th>
                    <th className="p-2 text-right">Debit (PKR)</th>
                    <th className="p-2 text-right">Credit (PKR)</th>
                    <th className="p-2 text-right">Balance (PKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr className="bg-slate-50 font-bold">
                    <td className="p-2">-</td>
                    <td className="p-2">-</td>
                    <td className="p-2">Opening Balance</td>
                    <td className="p-2 text-right">-</td>
                    <td className="p-2 text-right">-</td>
                    <td className="p-2 text-right text-blue-900">{printPayload.data.openingBalance.toLocaleString()}</td>
                  </tr>
                  {printPayload.data.entries.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2">{row.date}</td>
                      <td className="p-2 font-bold text-blue-900">{row.voucherNo}</td>
                      <td className="p-2 text-slate-700">{row.narration}</td>
                      <td className="p-2 text-right font-medium">{row.debit > 0 ? row.debit.toLocaleString() : '-'}</td>
                      <td className="p-2 text-right font-medium">{row.credit > 0 ? row.credit.toLocaleString() : '-'}</td>
                      <td className="p-2 text-right font-bold text-slate-900">{row.balance.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100 font-black border-t-2 border-slate-900">
                    <td colSpan={3} className="p-2 text-right uppercase">Closing Balance:</td>
                    <td className="p-2 text-right">{printPayload.data.totalDebit.toLocaleString()}</td>
                    <td className="p-2 text-right">{printPayload.data.totalCredit.toLocaleString()}</td>
                    <td className="p-2 text-right text-emerald-800 text-sm">{printPayload.data.closingBalance.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
