import React, { useState, useRef, useId } from 'react';
import {
  Download,
  Upload,
  FileSpreadsheet,
  Trash2,
  Building,
  Coins,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
} from 'lucide-react';
import { Item, Sale, Settings } from '../types';
import {
  exportBackupJson,
  exportSalesCsv,
  generateDemoSales,
  parseBackupJson,
} from '../utils/storage';

interface BackupSettingsViewProps {
  items: Item[];
  sales: Sale[];
  settings: Settings;
  onUpdateSettings: (settings: Settings) => void;
  onImportData: (newItems: Item[], newSales: Sale[], replace: boolean) => void;
  onClearAllData: () => void;
  onLoadDemoData: (demoSales: Sale[]) => void;
}

export const BackupSettingsView: React.FC<BackupSettingsViewProps> = ({
  items,
  sales,
  settings,
  onUpdateSettings,
  onImportData,
  onClearAllData,
  onLoadDemoData,
}) => {
  const [businessName, setBusinessName] = useState(settings.businessName);
  const [phone, setPhone] = useState(settings.phone);
  const [address, setAddress] = useState(settings.address);
  const [currency, setCurrency] = useState(settings.currency);
  const [calendarSystem, setCalendarSystem] = useState<'BS' | 'AD'>(settings.calendarSystem);

  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [importPending, setImportPending] = useState<{ items: Item[]; sales: Sale[] } | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const businessNameId = useId();
  const phoneId = useId();
  const addressId = useId();

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Settings = {
      businessName: businessName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      currency: currency.trim() || 'Rs.',
      calendarSystem,
    };
    onUpdateSettings(updated);
    setMessage({ text: 'Settings updated successfully!', ok: true });
    setTimeout(() => setMessage(null), 3000);
  };

  // Handle file import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = parseBackupJson(content);
        if (parsed.items.length === 0 && parsed.sales.length === 0) {
          setMessage({ text: 'Backup file contains no valid items or sales.', ok: false });
          return;
        }
        setImportPending(parsed);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Invalid file';
        setMessage({ text: `Failed to parse backup: ${errorMsg}`, ok: false });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Confirm Import
  const handleConfirmImport = (replace: boolean) => {
    if (!importPending) return;
    onImportData(importPending.items, importPending.sales, replace);
    setMessage({
      text: `Successfully imported ${importPending.items.length} items and ${importPending.sales.length} sales (${replace ? 'Replaced' : 'Merged'})!`,
      ok: true,
    });
    setImportPending(null);
    setTimeout(() => setMessage(null), 4000);
  };

  // Load Demo Data
  const handleLoadDemo = () => {
    const demoSales = generateDemoSales(items);
    onLoadDemoData(demoSales);
    setMessage({ text: `Generated ${demoSales.length} realistic past transactions for testing!`, ok: true });
    setTimeout(() => setMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Data Backup & App Settings</h2>
          <p className="text-xs text-slate-500 mt-1">
            Export JSON backups, download CSV spreadsheets for Excel, configure business receipts, or manage storage.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold">
            <HardDrive className="w-3.5 h-3.5" />
            <span>{items.length} Items · {sales.length} Sales Stored</span>
          </span>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-2.5 text-sm font-semibold transition-all ${
            message.ok ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.ok ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Backup and Data Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Export JSON */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Export JSON Backup</h3>
            <p className="text-xs text-slate-500 mt-1">
              Download your complete ledger database (items, prices, and past sales) in standard JSON format.
            </p>
          </div>
          <button
            onClick={() => exportBackupJson(items, sales)}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Backup (.json)</span>
          </button>
        </div>

        {/* Import JSON */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Import JSON Backup</h3>
            <p className="text-xs text-slate-500 mt-1">
              Restore data from an exported backup file or migrate records from another device.
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 text-indigo-600" />
            <span>Select Backup File</span>
          </button>
        </div>

        {/* Export CSV */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Export CSV Spreadsheet</h3>
            <p className="text-xs text-slate-500 mt-1">
              Export all sales records to a CSV spreadsheet with AD and BS dates for Excel or Google Sheets.
            </p>
          </div>
          <button
            onClick={() => exportSalesCsv(sales, settings.currency)}
            disabled={sales.length === 0}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Download CSV (.csv)</span>
          </button>
        </div>
      </div>

      {/* Import Confirmation Dialog */}
      {importPending && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Import Litre Ledger Backup</h3>
            <p className="text-xs text-slate-600 mt-2">
              Found <strong>{importPending.items.length} items</strong> and <strong>{importPending.sales.length} sales records</strong> in this backup file.
            </p>

            <div className="mt-5 space-y-2">
              <button
                type="button"
                onClick={() => handleConfirmImport(false)}
                className="w-full py-2.5 px-4 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer text-left flex items-center justify-between"
              >
                <span>Merge with existing records</span>
                <span className="text-[11px] font-normal text-blue-500">Keep current items/sales</span>
              </button>
              <button
                type="button"
                onClick={() => handleConfirmImport(true)}
                className="w-full py-2.5 px-4 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-colors cursor-pointer text-left flex items-center justify-between"
              >
                <span>Replace all current records</span>
                <span className="text-[11px] font-normal text-red-500">Overwrites existing data</span>
              </button>
            </div>

            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={() => setImportPending(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Business Profile & Preferences */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs max-w-2xl">
        <h3 className="text-base font-bold text-slate-900 mb-1">Business Profile & Receipts</h3>
        <p className="text-xs text-slate-500 mb-4">
          Information displayed on printable receipts, daily summary reports, and invoices.
        </p>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor={businessNameId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Dairy / Farm / Business Name
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id={businessNameId}
                  type="text"
                  placeholder="e.g. Pashupati Dairy Collection"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor={phoneId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Contact Phone Number
              </label>
              <input
                id={phoneId}
                type="text"
                placeholder="e.g. 98XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor={addressId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Address / Location
            </label>
            <input
              id={addressId}
              type="text"
              placeholder="e.g. Pokhara, Ward 4, Nepal"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          {/* Currency and Calendar System */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Currency Symbol
              </label>
              <div className="flex items-center gap-2">
                {['Rs.', 'रू', '₹', '$'].map((sym) => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => setCurrency(sym)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                      currency === sym
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {sym}
                  </button>
                ))}
                <input
                  type="text"
                  placeholder="Custom"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-20 px-2 py-1.5 text-xs font-bold border border-slate-200 rounded-lg text-center"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Default Calendar System
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCalendarSystem('BS')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                    calendarSystem === 'BS'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Bikram Sambat (BS)
                </button>
                <button
                  type="button"
                  onClick={() => setCalendarSystem('AD')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                    calendarSystem === 'AD'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Gregorian (AD)
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="py-2.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>

      {/* Demo Data & Danger Zone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
        {/* Load Demo Data */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 mb-2">
              <Sparkles className="w-5 h-5" />
              <h4 className="font-bold text-slate-900 text-sm">Load Sample Demo Data</h4>
            </div>
            <p className="text-xs text-slate-500">
              Generates a week of morning, noon, and evening sales to explore analytics, reports, and filters immediately.
            </p>
          </div>
          <button
            onClick={handleLoadDemo}
            className="mt-4 py-2 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Add Sample Sales
          </button>
        </div>

        {/* Clear All Records */}
        <div className="bg-red-50/50 border border-red-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <Trash2 className="w-5 h-5" />
              <h4 className="font-bold text-red-900 text-sm">Reset All Ledger Data</h4>
            </div>
            <p className="text-xs text-slate-500">
              Deletes all local items and sales records on this browser. Make sure you have exported a JSON backup first.
            </p>
          </div>
          <button
            onClick={() => setShowClearConfirm(true)}
            className="mt-4 py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Reset Database
          </button>
        </div>
      </div>

      {/* Clear Confirmation Dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Reset All Data?</h3>
            <p className="text-xs text-slate-600 mt-2">
              This will permanently delete all {sales.length} sales and {items.length} items from this device's storage. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearAllData();
                  setShowClearConfirm(false);
                  setMessage({ text: 'All data has been cleared.', ok: true });
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Yes, Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
