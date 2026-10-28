import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Droplet,
  DollarSign,
  Receipt,
  TrendingUp,
  Download,
  Calendar,
  Sun,
  CloudSun,
  Moon,
} from 'lucide-react';
import { Sale, Settings, ShiftType } from '../types';
import {
  adToBs,
  formatAdMonthDisplay,
  formatBsMonthDisplay,
  shiftAdMonth,
  shiftBsMonth,
} from '../utils/bikramSambat';
import { SHIFTS, SHIFT_LIST } from '../utils/shifts';
import { exportSalesCsv, formatCurrency, formatLitres, roundToTwo } from '../utils/storage';

interface MonthViewProps {
  sales: Sale[];
  calendarSystem: 'BS' | 'AD';
  settings: Settings;
}

export const MonthView: React.FC<MonthViewProps> = ({
  sales,
  calendarSystem,
  settings,
}) => {
  // Current month state
  const today = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const initialAdMonth = `${today.getFullYear()}-${pad(today.getMonth() + 1)}`;
  const initialBsMonth = adToBs(today).yearMonthKey;

  const [selectedBsMonth, setSelectedBsMonth] = useState<string>(initialBsMonth);
  const [selectedAdMonth, setSelectedAdMonth] = useState<string>(initialAdMonth);
  const [shiftFilter, setShiftFilter] = useState<string>('all');

  // Month navigation
  const handlePrevMonth = () => {
    if (calendarSystem === 'BS') {
      setSelectedBsMonth((prev) => shiftBsMonth(prev, -1));
    } else {
      setSelectedAdMonth((prev) => shiftAdMonth(prev, -1));
    }
  };

  const handleNextMonth = () => {
    if (calendarSystem === 'BS') {
      setSelectedBsMonth((prev) => shiftBsMonth(prev, 1));
    } else {
      setSelectedAdMonth((prev) => shiftAdMonth(prev, 1));
    }
  };

  const handleCurrentMonth = () => {
    setSelectedBsMonth(initialBsMonth);
    setSelectedAdMonth(initialAdMonth);
  };

  // Filter sales for the selected month
  const monthSales = sales.filter((s) => {
    let inMonth = false;
    if (calendarSystem === 'BS') {
      const bs = adToBs(s.date);
      inMonth = bs.yearMonthKey === selectedBsMonth;
    } else {
      inMonth = s.date.startsWith(selectedAdMonth);
    }

    if (!inMonth) return false;
    if (shiftFilter !== 'all' && s.shift !== shiftFilter) return false;
    return true;
  });

  // Calculate monthly metrics
  const totalLitres = roundToTwo(monthSales.reduce((acc, s) => acc + s.litres, 0));
  const totalAmount = roundToTwo(monthSales.reduce((acc, s) => acc + s.total, 0));
  const salesCount = monthSales.length;
  const avgPricePerLitre = totalLitres > 0 ? roundToTwo(totalAmount / totalLitres) : 0;

  // Monthly shift breakdown
  const shiftDistribution: Record<ShiftType, { litres: number; amount: number; count: number }> = {
    morning: { litres: 0, amount: 0, count: 0 },
    noon: { litres: 0, amount: 0, count: 0 },
    evening: { litres: 0, amount: 0, count: 0 },
  };

  monthSales.forEach((s) => {
    if (shiftDistribution[s.shift]) {
      shiftDistribution[s.shift].litres += s.litres;
      shiftDistribution[s.shift].amount += s.total;
      shiftDistribution[s.shift].count += 1;
    }
  });

  // Sales by item breakdown
  const byItemMap: Record<string, { litres: number; amount: number; count: number }> = {};
  monthSales.forEach((s) => {
    if (!byItemMap[s.item]) {
      byItemMap[s.item] = { litres: 0, amount: 0, count: 0 };
    }
    byItemMap[s.item].litres += s.litres;
    byItemMap[s.item].amount += s.total;
    byItemMap[s.item].count += 1;
  });

  const itemBreakdowns = Object.entries(byItemMap)
    .map(([itemName, data]) => ({
      itemName,
      litres: roundToTwo(data.litres),
      amount: roundToTwo(data.amount),
      count: data.count,
      pctOfAmount: totalAmount > 0 ? roundToTwo((data.amount / totalAmount) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Group by day for the daily trend
  const dailyBreakdownMap: Record<string, { litres: number; amount: number; sales: Sale[] }> = {};
  monthSales.forEach((s) => {
    if (!dailyBreakdownMap[s.date]) {
      dailyBreakdownMap[s.date] = { litres: 0, amount: 0, sales: [] };
    }
    dailyBreakdownMap[s.date].litres += s.litres;
    dailyBreakdownMap[s.date].amount += s.total;
    dailyBreakdownMap[s.date].sales.push(s);
  });

  const dailyList = Object.entries(dailyBreakdownMap)
    .map(([date, d]) => ({
      date,
      litres: roundToTwo(d.litres),
      amount: roundToTwo(d.amount),
      count: d.sales.length,
      bsDate: adToBs(date),
    }))
    .sort((a, b) => (b.date > a.date ? 1 : -1));

  const displayMonthTitle = calendarSystem === 'BS'
    ? formatBsMonthDisplay(selectedBsMonth)
    : formatAdMonthDisplay(selectedAdMonth);

  return (
    <div className="space-y-6">
      {/* Month Navigation Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-700 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="px-3 text-center sm:text-left">
              <span className="text-lg sm:text-xl font-bold text-slate-900 block leading-tight">
                {displayMonthTitle}
              </span>
              <span className="text-xs text-slate-500">
                {calendarSystem === 'BS' ? 'Bikram Sambat (वि.सं.)' : 'Gregorian Calendar (AD)'}
              </span>
            </div>
            <button
              onClick={handleNextMonth}
              className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-700 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={handleCurrentMonth}
              className="ml-2 text-xs font-semibold px-2.5 py-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors whitespace-nowrap"
            >
              Today's Month
            </button>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={() => exportSalesCsv(monthSales, settings.currency)}
              disabled={monthSales.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Export Month CSV</span>
            </button>
          </div>
        </div>

        {/* Shift Filter for the Month */}
        <div className="flex items-center gap-1.5 mt-5 pt-4 border-t border-slate-100 overflow-x-auto pb-1">
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
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Litres */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Volume</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Droplet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums block">
              {formatLitres(totalLitres)}
            </span>
            <span className="text-xs text-slate-400 mt-0.5 block">sold this month</span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-700 font-mono tabular-nums block">
              {formatCurrency(totalAmount, settings.currency)}
            </span>
            <span className="text-xs text-slate-400 mt-0.5 block">gross receipts</span>
          </div>
        </div>

        {/* Sales Recorded */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Transactions</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums block">
              {salesCount}
            </span>
            <span className="text-xs text-slate-400 mt-0.5 block">sales logged</span>
          </div>
        </div>

        {/* Average Price per Litre */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Price / L</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums block">
              {formatCurrency(avgPricePerLitre, settings.currency)}
            </span>
            <span className="text-xs text-slate-400 mt-0.5 block">effective rate</span>
          </div>
        </div>
      </div>

      {/* Monthly Shift Distribution Breakdown */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-1">Monthly Shift Distribution</h3>
        <p className="text-xs text-slate-500 mb-4">
          Compare milk collection and sales volume across Morning, Noon, and Evening shifts.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SHIFT_LIST.map((s) => {
            const data = shiftDistribution[s];
            const pct = totalLitres > 0 ? ((data.litres / totalLitres) * 100).toFixed(1) : '0.0';
            const icon = s === 'morning'
              ? <Sun className="w-5 h-5 text-amber-500" />
              : s === 'noon'
                ? <CloudSun className="w-5 h-5 text-orange-500" />
                : <Moon className="w-5 h-5 text-indigo-500" />;

            return (
              <div key={s} className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {icon}
                    <span className="font-bold text-slate-900 text-sm">{SHIFTS[s].titleEn}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-500 font-mono">{pct}%</span>
                </div>
                <div className="mt-3">
                  <div className="text-lg font-extrabold text-slate-900 font-mono tabular-nums">
                    {formatLitres(roundToTwo(data.litres))}
                  </div>
                  <div className="text-xs font-semibold text-blue-700 font-mono mt-0.5">
                    {formatCurrency(roundToTwo(data.amount), settings.currency)}
                  </div>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.max(0, parseFloat(pct)))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Item Sales Breakdown with Progress Bars */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-1">Sales by Liquid & Dairy Item</h3>
        <p className="text-xs text-slate-500 mb-4">
          Breakdown of total volume and revenue share by product.
        </p>

        {itemBreakdowns.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No item sales recorded for {displayMonthTitle}.
          </div>
        ) : (
          <div className="space-y-4">
            {itemBreakdowns.map((item) => (
              <div key={item.itemName} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{item.itemName}</span>
                    <span className="text-xs text-slate-500">
                      ({item.count} {item.count === 1 ? 'sale' : 'sales'})
                    </span>
                  </div>
                  <div className="flex items-baseline gap-3 text-right">
                    <span className="text-xs text-slate-500 font-mono">{formatLitres(item.litres)}</span>
                    <span className="text-sm font-bold text-blue-700 font-mono tabular-nums">
                      {formatCurrency(item.amount, settings.currency)}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 font-mono">
                      {item.pctOfAmount}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(0, item.pctOfAmount))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Daily Breakdown for this Month */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-1">Daily Breakdown</h3>
        <p className="text-xs text-slate-500 mb-4">
          All daily sales logged in {displayMonthTitle}.
        </p>

        {dailyList.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No daily activity recorded for this period.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {dailyList.map((d) => (
              <div
                key={d.date}
                className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50 px-2 rounded-lg transition-colors"
              >
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    {calendarSystem === 'BS' ? d.bsDate.formattedBsDate : d.date}
                  </div>
                  <div className="text-xs text-slate-500">
                    {d.bsDate.dayOfWeek} ({d.bsDate.dayOfWeekNp}) · {d.count} {d.count === 1 ? 'transaction' : 'transactions'}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="text-xs text-slate-500 block font-mono">
                      {formatLitres(d.litres)}
                    </span>
                    <span className="text-sm font-bold text-blue-700 font-mono tabular-nums">
                      {formatCurrency(d.amount, settings.currency)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
