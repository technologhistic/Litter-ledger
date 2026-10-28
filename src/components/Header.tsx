import React from 'react';
import { Droplet, Calendar, Sun, CloudSun, Moon, RefreshCw } from 'lucide-react';
import { ShiftType, Language } from '../types';
import { SHIFTS } from '../utils/shifts';
import { OfflineIndicator } from './OfflineIndicator';
import { getTranslation } from '../utils/translations';

export type NavTab = 'sell' | 'items' | 'month' | 'history' | 'backup';

interface HeaderProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  calendarSystem: 'BS' | 'AD';
  onToggleCalendar: () => void;
  activeShift: ShiftType;
  onSelectShift: (shift: ShiftType) => void;
  todayBsText: string;
  hasUpdate: boolean;
  isUpdating: boolean;
  onTriggerUpdate: () => void;
  language: Language;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  calendarSystem,
  onToggleCalendar,
  activeShift,
  onSelectShift,
  todayBsText,
  hasUpdate,
  isUpdating,
  onTriggerUpdate,
  language,
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  const getShiftIcon = (type: ShiftType) => {
    switch (type) {
      case 'morning':
        return <Sun className="w-3.5 h-3.5 text-amber-500" />;
      case 'noon':
        return <CloudSun className="w-3.5 h-3.5 text-orange-500" />;
      case 'evening':
        return <Moon className="w-3.5 h-3.5 text-indigo-500" />;
    }
  };

  const getShiftLabel = (type: ShiftType) => {
    if (language === 'np') {
      return SHIFTS[type].titleNp;
    }
    return SHIFTS[type].titleEn;
  };

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <Droplet className="w-5 h-5 fill-white text-white" />
            </div>
            <button
              onClick={() => onSelectTab('sell')}
              className="text-left cursor-pointer group"
            >
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors whitespace-nowrap">
                Litre Ledger
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                {todayBsText}
              </span>
            </button>
          </div>

          {/* Zone 2: Navigation links */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2 text-sm font-medium">
            <button
              onClick={() => onSelectTab('sell')}
              className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'sell'
                  ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {t('sellToday')}
            </button>
            <button
              onClick={() => onSelectTab('items')}
              className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'items'
                  ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {t('itemsRates')}
            </button>
            <button
              onClick={() => onSelectTab('month')}
              className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'month'
                  ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {t('thisMonth')}
            </button>
            <button
              onClick={() => onSelectTab('history')}
              className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'history'
                  ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {t('salesHistory')}
            </button>
            <button
              onClick={() => onSelectTab('backup')}
              className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'backup'
                  ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {t('dataSettings')}
            </button>
          </nav>

          {/* Zone 3: Actions area (Shift Selector, Offline Status, Calendar, and Single Glowing Update Button) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Shift pill toggle */}
            <div className="hidden lg:flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-700/60 rounded-lg border border-slate-200 dark:border-slate-700">
              {(['morning', 'noon', 'evening'] as ShiftType[]).map((s) => {
                const isSelected = activeShift === s;
                return (
                  <button
                    key={s}
                    onClick={() => onSelectShift(s)}
                    title={`${SHIFTS[s].titleEn} (${SHIFTS[s].titleNp})`}
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-semibold'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {getShiftIcon(s)}
                    <span>{getShiftLabel(s)}</span>
                  </button>
                );
              })}
            </div>

            {/* Offline / Online Status Indicator */}
            <OfflineIndicator />

            {/* Calendar toggle button */}
            <button
              onClick={onToggleCalendar}
              title={`Switch calendar (currently ${calendarSystem})`}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors whitespace-nowrap cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{calendarSystem === 'BS' ? t('bsCalendar') : t('adCalendar')}</span>
            </button>

            {/* Single Update Button (Glows when update is available) */}
            <button
              onClick={onTriggerUpdate}
              disabled={isUpdating}
              title={
                hasUpdate
                  ? 'New update available! Tap to refresh and apply the update'
                  : 'Tap to check and update app'
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-300 cursor-pointer ${
                hasUpdate
                  ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.75)] ring-2 ring-blue-400 ring-offset-1 animate-pulse hover:bg-blue-700'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              } ${isUpdating ? 'opacity-70 cursor-wait' : ''}`}
            >
              {hasUpdate && (
                <span className="relative flex h-2 w-2 mr-0.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-200"></span>
                </span>
              )}
              <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
              <span>{isUpdating ? t('updating') : hasUpdate ? t('updateAvailable') : t('update')}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-between border-t border-slate-100 dark:border-slate-700/80 py-2 gap-1 overflow-x-auto">
          <button
            onClick={() => onSelectTab('sell')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
              currentTab === 'sell' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t('sellToday')}
          </button>
          <button
            onClick={() => onSelectTab('items')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
              currentTab === 'items' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t('itemsRates')}
          </button>
          <button
            onClick={() => onSelectTab('month')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
              currentTab === 'month' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t('thisMonth')}
          </button>
          <button
            onClick={() => onSelectTab('history')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
              currentTab === 'history' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t('salesHistory')}
          </button>
          <button
            onClick={() => onSelectTab('backup')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
              currentTab === 'backup' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t('dataSettings')}
          </button>
        </div>
      </div>
    </header>
  );
};
