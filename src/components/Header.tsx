import React from 'react';
import { Droplet, Calendar, Sun, CloudSun, Moon, RefreshCw } from 'lucide-react';
import { ShiftType } from '../types';
import { SHIFTS } from '../utils/shifts';
import { OfflineIndicator } from './OfflineIndicator';

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
}) => {
  const currentShiftInfo = SHIFTS[activeShift];

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

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
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
              <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors whitespace-nowrap">
                Litre Ledger
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium text-slate-500">
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
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Sell Today
            </button>
            <button
              onClick={() => onSelectTab('items')}
              className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'items'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Items & Rates
            </button>
            <button
              onClick={() => onSelectTab('month')}
              className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'month'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => onSelectTab('history')}
              className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'history'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Sales History
            </button>
            <button
              onClick={() => onSelectTab('backup')}
              className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'backup'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Data & Settings
            </button>
          </nav>

          {/* Zone 3: Actions area (Shift Selector, Offline Status, Calendar, and Single Glowing Update Button) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Shift pill toggle */}
            <div className="hidden lg:flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
              {(['morning', 'noon', 'evening'] as ShiftType[]).map((s) => {
                const isSelected = activeShift === s;
                return (
                  <button
                    key={s}
                    onClick={() => onSelectShift(s)}
                    title={`${SHIFTS[s].titleEn} (${SHIFTS[s].titleNp})`}
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                      isSelected
                        ? 'bg-white text-slate-900 shadow-sm font-semibold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {getShiftIcon(s)}
                    <span>{SHIFTS[s].titleEn}</span>
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
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>{calendarSystem === 'BS' ? 'BS Calendar' : 'AD Calendar'}</span>
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
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              } ${isUpdating ? 'opacity-70 cursor-wait' : ''}`}
            >
              {hasUpdate && (
                <span className="relative flex h-2 w-2 mr-0.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-200"></span>
                </span>
              )}
              <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
              <span>{isUpdating ? 'Updating...' : hasUpdate ? 'Update Available' : 'Update'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-between border-t border-slate-100 py-2 gap-1 overflow-x-auto">
          <button
            onClick={() => onSelectTab('sell')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
              currentTab === 'sell' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600'
            }`}
          >
            Sell Today
          </button>
          <button
            onClick={() => onSelectTab('items')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
              currentTab === 'items' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600'
            }`}
          >
            Items
          </button>
          <button
            onClick={() => onSelectTab('month')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
              currentTab === 'month' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => onSelectTab('history')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
              currentTab === 'history' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600'
            }`}
          >
            History
          </button>
          <button
            onClick={() => onSelectTab('backup')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
              currentTab === 'backup' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600'
            }`}
          >
            Settings
          </button>
        </div>
      </div>
    </header>
  );
};
