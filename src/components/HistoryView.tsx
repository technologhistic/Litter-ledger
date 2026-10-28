import React, { useState, useMemo } from 'react';
import {
  Search,
  Trash2,
  Printer,
  Calendar,
  X,
  Download,
  Droplet,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { DayHistoryGroup, Sale, Settings, ShiftType } from '../types';
import { adToBs } from '../utils/bikramSambat';
import { SHIFTS, SHIFT_LIST } from '../utils/shifts';
import { exportSalesCsv, formatCurrency, formatLitres, roundToTwo } from '../utils/storage';

interface HistoryViewProps {
  sales: Sale[];
  calendarSystem: 'BS' | 'AD';
  settings: Settings;
  onDeleteSale: (saleId: string) => void;
  onOpenReceipt: (sale: Sale) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  sales,
  calendarSystem,
  settings,
  onDeleteSale,
  onOpenReceipt,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [shiftFilter, setShiftFilter] = useState<string>('all');
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});
  const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);

  // Filter sales
  const filteredSales = useMemo(() => {
    let result = sales;

    if (shiftFilter !== 'all') {
      result = result.filter((s) => s.shift === shiftFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((s) => {
        const bs = adToBs(s.date);
        const shiftObj = SHIFTS[s.shift];
        return (
          s.item.toLowerCase().includes(q) ||
          s.date.toLowerCase().includes(q) ||
          s.shift.toLowerCase().includes(q) ||
          shiftObj.titleEn.toLowerCase().includes(q) ||
          shiftObj.titleNp.includes(q) ||
          bs.formattedBsDate.toLowerCase().includes(q) ||
          bs.monthNameEn.toLowerCase().includes(q) ||
          bs.monthNameNp.includes(q) ||
          bs.dayOfWeek.toLowerCase().includes(q) ||
          bs.dayOfWeekNp.includes(q) ||
          bs.year.toString().includes(q)
        );
      });
    }

    return result;
  }, [sales, shiftFilter, searchQuery]);

  // Group by day
  const groupedDays: DayHistoryGroup[] = useMemo(() => {
    const dayMap: Record<string, Sale[]> = {};

    filteredSales.forEach((s) => {
      if (!dayMap[s.date]) {
        dayMap[s.date] = [];
      }
      dayMap[s.date].push(s);
    });

    return Object.entries(dayMap)
      .map(([date, daySales]) => {
        const bs = adToBs(date);
        const totalLitres = roundToTwo(daySales.reduce((sum, s) => sum + s.litres, 0));
        const totalAmount = roundToTwo(daySales.reduce((sum, s) => sum + s.total, 0));
        const morn = roundToTwo(daySales.filter((s) => s.shift === 'morning').reduce((sum, s) => sum + s.litres, 0));
        const noon = roundToTwo(daySales.filter((s) => s.shift === 'noon').reduce((sum, s) => sum + s.litres, 0));
        const eve = roundToTwo(daySales.filter((s) => s.shift === 'evening').reduce((sum, s) => sum + s.litres, 0));

        const formattedDateAndDay = calendarSystem === 'BS'
          ? `${bs.dayOfWeek}, ${bs.formattedBsDate}`
          : new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

        return {
          date,
          dayOfWeek: bs.dayOfWeek,
          dayOfWeekNp: bs.dayOfWeekNp,
          formattedDateAndDay,
          totalLitres,
          totalAmount,
          salesCount: daySales.length,
          morningLitres: morn,
          noonLitres: noon,
          eveningLitres: eve,
          sales: daySales.sort((a, b) => b.timestamp - a.timestamp),
        };
      })
      .sort((a, b) => (b.date > a.date ? 1 : -1));
  }, [filteredSales, calendarSystem]);

  // Expand / collapse all toggle
  const toggleDate = (date: string) => {
    setExpandedDates((prev) => ({
      ...prev,
      [date]: prev[date] === false ? true : false, // defaults to expanded (undefined/true)
    }));
  };

  const isExpanded = (date: string) => expandedDates[date] !== false;

  const totalFilteredLitres = roundToTwo(filteredSales.reduce((sum, s) => sum + s.litres, 0));
  const totalFilteredAmount = roundToTwo(filteredSales.reduce((sum, s) => sum + s.total, 0));

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Sales History & Search</h2>
            <p className="text-xs text-slate-500 mt-1">
              Search all past records by product, date (AD/BS), day of week, or shift.
            </p>
          </div>
          <button
            onClick={() => exportSalesCsv(filteredSales, settings.currency)}
            disabled={filteredSales.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors self-start sm:self-center disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by item name, Kartik, 2083, मंगलबार, Morning, etc..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Shift Filter Segmented Control */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-slate-500 mr-1 whitespace-nowrap">Shift:</span>
          <button
            onClick={() => setShiftFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              shiftFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Shifts
          </button>
          {SHIFT_LIST.map((s) => (
            <button
              key={s}
              onClick={() => setShiftFilter(s)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                shiftFilter === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {SHIFTS[s].icon} {SHIFTS[s].titleEn}
            </button>
          ))}
        </div>

        {/* Filter Summary Results Bar */}
        {(searchQuery || shiftFilter !== 'all') && (
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>
              Found <strong>{filteredSales.length}</strong> transactions matching filters
            </span>
            <span className="font-mono font-semibold">
              Volume: {formatLitres(totalFilteredLitres)} · Revenue: {formatCurrency(totalFilteredAmount, settings.currency)}
            </span>
          </div>
        )}
      </div>

      {/* History Day Groups */}
      {groupedDays.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
          <Droplet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No Sales Records Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            {searchQuery || shiftFilter !== 'all'
              ? 'Try modifying your search keywords or clearing the shift filter.'
              : 'Sales will appear here organized day-by-day as you record sales.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedDays.map((group) => {
            const open = isExpanded(group.date);

            return (
              <div
                key={group.date}
                className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden"
              >
                {/* Day Header Bar */}
                <div
                  onClick={() => toggleDate(group.date)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/70 transition-colors select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-base">
                          {group.formattedDateAndDay}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          ({group.dayOfWeekNp})
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {group.salesCount} {group.salesCount === 1 ? 'sale' : 'sales'} · AD: {group.date}
                      </div>
                    </div>
                  </div>

                  {/* Day Totals and Shift breakdown */}
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    {/* Shift pills */}
                    <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                      {group.morningLitres > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/60">
                          ☀️ {formatLitres(group.morningLitres)}
                        </span>
                      )}
                      {group.noonLitres > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-800 border border-orange-200/60">
                          ⛅ {formatLitres(group.noonLitres)}
                        </span>
                      )}
                      {group.eveningLitres > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200/60">
                          🌙 {formatLitres(group.eveningLitres)}
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="text-base font-bold text-blue-700 font-mono tabular-nums leading-tight">
                        {formatCurrency(group.totalAmount, settings.currency)}
                      </div>
                      <div className="text-xs font-semibold text-slate-600 font-mono">
                        {formatLitres(group.totalLitres)}
                      </div>
                    </div>

                    <div className="text-slate-400">
                      {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Day Transactions Table */}
                {open && (
                  <div className="border-t border-slate-100 divide-y divide-slate-100 bg-slate-50/30 px-4 sm:px-5 py-2">
                    {group.sales.map((sale) => {
                      const shiftInfo = SHIFTS[sale.shift];
                      const timeStr = new Date(sale.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                      return (
                        <div
                          key={sale.id}
                          className="py-3 flex items-center justify-between gap-4"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900 text-sm">
                                {sale.item}
                              </span>
                              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                                {shiftInfo.icon} {shiftInfo.titleEn}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 font-mono mt-0.5">
                              {formatLitres(sale.litres)} @ {formatCurrency(sale.price, settings.currency)}/L · {timeStr}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                              {formatCurrency(sale.total, settings.currency)}
                            </span>
                            <button
                              onClick={() => onOpenReceipt(sale)}
                              title="Print receipt"
                              className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setSaleToDelete(sale)}
                              title="Delete sale"
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {saleToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Delete Past Sale?</h3>
            <p className="text-xs text-slate-600 mt-2">
              Remove sale of <strong>{formatLitres(saleToDelete.litres)}</strong> of <strong>{saleToDelete.item}</strong> on {saleToDelete.date}?
            </p>
            <div className="flex justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={() => setSaleToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteSale(saleToDelete.id);
                  setSaleToDelete(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
