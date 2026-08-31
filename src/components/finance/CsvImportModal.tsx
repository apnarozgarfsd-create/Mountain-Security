import React, { useState } from 'react';
import { Upload, Download, Check, AlertCircle, FileSpreadsheet, X, HelpCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({ isOpen, onClose }) => {
  const { importTransactionsFromCsv, financeAccounts, expenseCategories } = useApp();

  const [csvText, setCsvText] = useState('');
  const [importResult, setImportResult] = useState<{
    successCount: number;
    errors: string[];
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvText(content || '');
    };
    reader.readAsText(file);
  };

  const parseCsvToObjects = (text: string) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Handle simple CSV splitting with quote handling
      const values: string[] = [];
      let inQuotes = false;
      let curVal = '';

      for (let char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(curVal.trim().replace(/^["']|["']$/g, ''));
          curVal = '';
        } else {
          curVal += char;
        }
      }
      values.push(curVal.trim().replace(/^["']|["']$/g, ''));

      const rowObj: any = {};
      headers.forEach((header, idx) => {
        rowObj[header] = values[idx] || '';
      });
      rows.push(rowObj);
    }
    return rows;
  };

  const handleImport = () => {
    if (!csvText.trim()) return;
    setIsProcessing(true);
    try {
      const parsedRows = parseCsvToObjects(csvText);
      const result = importTransactionsFromCsv(parsedRows);
      setImportResult(result);
    } catch (err: any) {
      setImportResult({
        successCount: 0,
        errors: [err.message || 'Failed to parse CSV spreadsheet'],
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadSampleTemplate = () => {
    const sampleCsv = `Date,Account,Head A/C,Sub-Head A/C,Description,IN,OUT
2026-08-25,Cash - Ali Akbar,Office,Stationery,Purchased paper and ledger files,0,4500
2026-08-25,Bank - JazzCash,Client Billing,Monthly Invoice,Received July bill payment from Habib Metro,185000,0
2026-08-26,Cash - Zeeshan Ali,Site Operational,Generator Fuel,Diesel 40 Liters for Site Alpha,0,12800
2026-08-27,Cash - Ali Akbar,Advance / Loans,Staff Advance,Advance cash given to Guard Gul Khan,0,15000`;

    const blob = new Blob([sampleCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'mountain_security_cashbook_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Import Excel / CSV Cash-Book Entries
              </h3>
              <p className="text-xs text-slate-400">
                Migrate legacy spreadsheets into the multi-account database
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sample Template Download Box */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div>
            <p className="font-bold text-slate-200">Need the exact CSV format?</p>
            <p className="text-slate-400 text-[11px]">
              Columns: Date, Account, Head A/C, Sub-Head A/C, Description, IN, OUT
            </p>
          </div>
          <button
            onClick={downloadSampleTemplate}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer border border-slate-700 shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV Template</span>
          </button>
        </div>

        {/* File Upload Drop Area */}
        <div>
          <label className="block text-slate-300 font-semibold mb-2 text-xs">
            Upload CSV File or Paste Raw Text:
          </label>
          <input
            type="file"
            accept=".csv,.txt"
            onChange={handleFileUpload}
            className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer mb-2"
          />

          <textarea
            rows={6}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder="Date,Account,Head A/C,Sub-Head A/C,Description,IN,OUT&#10;2026-08-25,Cash - Ali Akbar,Office,Stationery,Ledger purchase,0,4500"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-mono text-xs focus:border-blue-500"
          />
        </div>

        {/* Import Results Feedback */}
        {importResult && (
          <div className="space-y-2 text-xs">
            {importResult.successCount > 0 && (
              <div className="p-3 bg-emerald-950/70 border border-emerald-800 text-emerald-200 rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Successfully imported <strong>{importResult.successCount}</strong> transactions into the database!
                </span>
              </div>
            )}

            {importResult.errors.length > 0 && (
              <div className="p-3 bg-amber-950/70 border border-amber-800 text-amber-200 rounded-xl space-y-1 max-h-32 overflow-y-auto">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>Skipped rows / Errors ({importResult.errors.length}):</span>
                </p>
                <ul className="list-disc pl-5 text-[11px] space-y-0.5">
                  {importResult.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800 text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handleImport}
            disabled={!csvText.trim() || isProcessing}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-950/50"
          >
            <Upload className="w-4 h-4" />
            <span>{isProcessing ? 'Processing...' : 'Run Import'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
