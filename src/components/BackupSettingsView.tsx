import React, { useState, useRef, useId } from 'react';
import {
  Download,
  Upload,
  FileSpreadsheet,
  Trash2,
  Building,
  Coins,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  Sun,
  Moon,
  Languages,
  Sparkles,
} from 'lucide-react';
import { Item, Sale, Settings, ThemeMode, Language } from '../types';
import {
  exportBackupJson,
  exportSalesCsv,
  parseBackupJson,
} from '../utils/storage';
import { getTranslation } from '../utils/translations';

interface BackupSettingsViewProps {
  items: Item[];
  sales: Sale[];
  settings: Settings;
  onUpdateSettings: (settings: Settings) => void;
  onImportData: (newItems: Item[], newSales: Sale[], replace: boolean) => void;
  onClearAllData: () => void;
}

export const BackupSettingsView: React.FC<BackupSettingsViewProps> = ({
  items,
  sales,
  settings,
  onUpdateSettings,
  onImportData,
  onClearAllData,
}) => {
  const currentLang = settings.language || 'en';
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(currentLang, key);

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

  // Instant Theme Mode Switcher
  const handleToggleTheme = (newTheme: ThemeMode) => {
    const updated: Settings = {
      ...settings,
      theme: newTheme,
    };
    onUpdateSettings(updated);
    setMessage({
      text: newTheme === 'dark' ? 'Dark Mode activated' : 'Light Mode activated',
      ok: true,
    });
    setTimeout(() => setMessage(null), 2500);
  };

  // Instant Language Switcher (English <-> Nepali)
  const handleToggleLanguage = (newLang: Language) => {
    const updated: Settings = {
      ...settings,
      language: newLang,
    };
    onUpdateSettings(updated);
    setMessage({
      text: newLang === 'np' ? 'भाषा परिवर्तन भयो: नेपाली' : 'Language changed to English',
      ok: true,
    });
    setTimeout(() => setMessage(null), 2500);
  };

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Settings = {
      ...settings,
      businessName: businessName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      currency: currency.trim() || 'Rs.',
      calendarSystem,
    };
    onUpdateSettings(updated);
    setMessage({ text: t('saveSettingsBtn') + ' ✓', ok: true });
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

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('settingsTitle')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('settingsDesc')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl">
            <HardDrive className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{items.length} Items · {sales.length} Sales Stored</span>
          </span>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-2.5 text-sm font-semibold transition-all ${
            message.ok
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
          }`}
        >
          {message.ok ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* 1. APPEARANCE & LANGUAGE CONTROLS (Theme & Language Switching Buttons) */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 sm:p-6 shadow-xs max-w-2xl transition-colors">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>{t('appearanceAndLang')}</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
          Customize the visual display theme and select your preferred language.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Light Mode / Dark Mode Toggle Button */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80">
            <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              {settings.theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
              <span>{t('themeMode')}</span>
            </span>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                type="button"
                onClick={() => handleToggleTheme('light')}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  settings.theme !== 'dark'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>{t('lightMode')}</span>
              </button>
              <button
                type="button"
                onClick={() => handleToggleTheme('dark')}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  settings.theme === 'dark'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>{t('darkMode')}</span>
              </button>
            </div>
          </div>

          {/* Language Changing Button (English / Nepali) */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80">
            <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{t('language')}</span>
            </span>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                type="button"
                onClick={() => handleToggleLanguage('en')}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  settings.language !== 'np'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <span>🇬🇧</span>
                <span>English</span>
              </button>
              <button
                type="button"
                onClick={() => handleToggleLanguage('np')}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  settings.language === 'np'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <span>🇳🇵</span>
                <span>नेपाली</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Backup and Data Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Export JSON */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {t('exportBackup')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
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
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {t('importBackup')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
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
            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Select Backup File</span>
          </button>
        </div>

        {/* Export CSV */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {t('exportCsv')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Open your dairy sales in Microsoft Excel, Google Sheets, or LibreOffice Calc.
            </p>
          </div>
          <button
            onClick={() => exportSalesCsv(sales, settings.calendarSystem)}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Download CSV (.csv)</span>
          </button>
        </div>
      </div>

      {/* Import Modal Confirmation */}
      {importPending && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Import Litre Ledger Backup</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
              Found <strong>{importPending.items.length} items</strong> and <strong>{importPending.sales.length} sales records</strong> in this backup file.
            </p>

            <div className="mt-5 space-y-2">
              <button
                type="button"
                onClick={() => handleConfirmImport(false)}
                className="w-full py-2.5 px-4 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer text-left flex items-center justify-between"
              >
                <span>Merge with existing records</span>
                <span className="text-[11px] font-normal text-blue-500 dark:text-blue-400">Keep current items/sales</span>
              </button>
              <button
                type="button"
                onClick={() => handleConfirmImport(true)}
                className="w-full py-2.5 px-4 text-xs font-bold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 rounded-xl transition-colors cursor-pointer text-left flex items-center justify-between"
              >
                <span>Replace all current records</span>
                <span className="text-[11px] font-normal text-red-500 dark:text-red-400">Overwrites existing data</span>
              </button>
            </div>

            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={() => setImportPending(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Business Profile & Preferences */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 sm:p-6 shadow-xs max-w-2xl transition-colors">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          {t('businessProfile')}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Information displayed on printable receipts, daily summary reports, and invoices.
        </p>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor={businessNameId} className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                {t('businessName')}
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id={businessNameId}
                  type="text"
                  placeholder="e.g. Pashupati Dairy Collection"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor={phoneId} className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                {t('phone')}
              </label>
              <input
                id={phoneId}
                type="text"
                placeholder="e.g. 98XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor={addressId} className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              {t('address')}
            </label>
            <input
              id={addressId}
              type="text"
              placeholder="e.g. Pokhara, Ward 4, Nepal"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                {t('currencySymbol')}
              </label>
              <div className="relative">
                <Coins className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rs. or रु or NPR"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                {t('calendarSystem')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCalendarSystem('BS')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                    calendarSystem === 'BS'
                      ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 ring-1 ring-blue-400'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  वि.सं. (BS)
                </button>
                <button
                  type="button"
                  onClick={() => setCalendarSystem('AD')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                    calendarSystem === 'AD'
                      ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 ring-1 ring-blue-400'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
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
              className="py-2.5 px-6 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs active:scale-98"
            >
              {t('saveSettingsBtn')}
            </button>
          </div>
        </form>
      </div>

      {/* Database Management / Reset */}
      <div className="max-w-md">
        <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
              <Trash2 className="w-5 h-5" />
              <h4 className="font-bold text-red-900 dark:text-red-200 text-sm">
                {t('resetDatabase')}
              </h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
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
          <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Reset All Data?</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
              This will permanently delete all {sales.length} sales and {items.length} items from this device's storage. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearAllData();
                  setShowClearConfirm(false);
                  setMessage({ text: 'All data cleared successfully.', ok: true });
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs"
              >
                Yes, Reset All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
