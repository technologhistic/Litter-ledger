import React, { useState, useId } from 'react';
import {
  Plus,
  Trash2,
  Calendar,
  Share2,
  Printer,
  CheckCircle2,
  AlertCircle,
  Sun,
  CloudSun,
  Moon,
  Droplet,
} from 'lucide-react';
import { Item, Sale, Settings, ShiftType } from '../types';
import { adToBs, getTodayBs } from '../utils/bikramSambat';
import { SHIFTS, SHIFT_LIST } from '../utils/shifts';
import { formatCurrency, formatLitres, roundToTwo, generateUid } from '../utils/storage';

interface SellTodayViewProps {
  items: Item[];
  sales: Sale[];
  todayDate: string;
  activeShift: ShiftType;
  onSelectShift: (shift: ShiftType) => void;
  calendarSystem: 'BS' | 'AD';
  settings: Settings;
  onAddSale: (sale: Sale) => void;
  onDeleteSale: (saleId: string) => void;
  onOpenReceipt: (sale: Sale) => void;
  onOpenDailySummaryReceipt: (shiftFilter: string) => void;
}

export const SellTodayView: React.FC<SellTodayViewProps> = ({
  items,
  sales,
  todayDate,
  activeShift,
  onSelectShift,
  calendarSystem,
  settings,
  onAddSale,
  onDeleteSale,
  onOpenReceipt,
  onOpenDailySummaryReceipt,
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string>(items[0]?.id || '');
  const [litresInput, setLitresInput] = useState<string>('');
  const [customPriceInput, setCustomPriceInput] = useState<string>('');
  const [todayShiftFilter, setTodayShiftFilter] = useState<string>('all');
  const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; ok: boolean } | null>(null);
  const [sharedAlert, setSharedAlert] = useState<string | null>(null);

  const litresInputId = useId();
  const priceInputId = useId();

  // Find active item
  const selectedItem = items.find((i) => i.id === selectedItemId) || items[0];

  // Effective price per litre
  const parsedCustomPrice = parseFloat(customPriceInput);
  const effectivePrice = !isNaN(parsedCustomPrice) && parsedCustomPrice >= 0
    ? parsedCustomPrice
    : selectedItem?.price || 0;

  // Calculated sale total
  const parsedLitres = parseFloat(litresInput);
  const calculatedTotal = !isNaN(parsedLitres) && parsedLitres > 0
    ? roundToTwo(parsedLitres * effectivePrice)
    : 0;

  // Filter today's sales
  const todaySales = sales.filter((s) => s.date === todayDate);

  // Shift metrics for today
  const shiftSummaries: Record<ShiftType, { litres: number; amount: number; count: number }> = {
    morning: { litres: 0, amount: 0, count: 0 },
    noon: { litres: 0, amount: 0, count: 0 },
    evening: { litres: 0, amount: 0, count: 0 },
  };

  todaySales.forEach((s) => {
    if (shiftSummaries[s.shift]) {
      shiftSummaries[s.shift].litres += s.litres;
      shiftSummaries[s.shift].amount += s.total;
      shiftSummaries[s.shift].count += 1;
    }
  });

  const totalTodayLitres = roundToTwo(todaySales.reduce((acc, s) => acc + s.litres, 0));
  const totalTodayAmount = roundToTwo(todaySales.reduce((acc, s) => acc + s.total, 0));

  // Filtered sales list
  const filteredSales = todayShiftFilter === 'all'
    ? todaySales
    : todaySales.filter((s) => s.shift === todayShiftFilter);

  // Today BS Date info
  const todayBs = getTodayBs();

  // Handle Quick Add Litres
  const handleAddQuickLitre = (amount: number) => {
    const current = parseFloat(litresInput) || 0;
    const nextVal = current + amount;
    setLitresInput(nextVal % 1 === 0 ? nextVal.toString() : nextVal.toFixed(2).replace(/\.?0+$/, ''));
  };

  // Handle Save Sale
  const handleSaveSale = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedItem) {
      setFeedback({ text: 'Please add an item first in the Items tab.', ok: false });
      return;
    }

    const litres = parseFloat(litresInput);
    if (isNaN(litres) || litres <= 0) {
      setFeedback({ text: 'Please enter a valid litre amount sold.', ok: false });
      return;
    }

    const newSale: Sale = {
      id: generateUid(),
      timestamp: Date.now(),
      date: todayDate,
      item: selectedItem.name,
      litres,
      price: effectivePrice,
      total: calculatedTotal,
      shift: activeShift,
    };

    onAddSale(newSale);
    setLitresInput('');
    setCustomPriceInput('');
    setFeedback({
      text: `Saved: ${formatLitres(litres)} of ${selectedItem.name} for ${formatCurrency(calculatedTotal, settings.currency)} (${SHIFTS[activeShift].titleEn})`,
      ok: true,
    });

    setTimeout(() => {
      setFeedback(null);
    }, 4000);
  };

  // Handle Share Report
  const handleShareDailyReport = () => {
    const shiftLabel = todayShiftFilter === 'all' ? 'All Shifts' : SHIFTS[todayShiftFilter as ShiftType]?.titleEn;
    const reportSales = todayShiftFilter === 'all' ? todaySales : todaySales.filter((s) => s.shift === todayShiftFilter);
    const lit = roundToTwo(reportSales.reduce((sum, s) => sum + s.litres, 0));
    const amt = roundToTwo(reportSales.reduce((sum, s) => sum + s.total, 0));

    const text = `🥛 ${settings.businessName} - Daily Sales Report\n` +
      `📅 Date: ${todayBs.formattedBsDate} (${todayBs.dayOfWeekNp}) / AD: ${todayDate}\n` +
      `⏰ Shift: ${shiftLabel}\n` +
      `----------------------------\n` +
      `💧 Total Volume: ${formatLitres(lit)}\n` +
      `💰 Total Revenue: ${formatCurrency(amt, settings.currency)}\n` +
      `📦 Transactions: ${reportSales.length}\n` +
      `----------------------------\n` +
      `Shift Breakdown:\n` +
      `• Morning (बिहान): ${formatLitres(shiftSummaries.morning.litres)} | ${formatCurrency(shiftSummaries.morning.amount, settings.currency)}\n` +
      `• Noon (दिउँसो): ${formatLitres(shiftSummaries.noon.litres)} | ${formatCurrency(shiftSummaries.noon.amount, settings.currency)}\n` +
      `• Evening (साँझ): ${formatLitres(shiftSummaries.evening.litres)} | ${formatCurrency(shiftSummaries.evening.amount, settings.currency)}\n\n` +
      `Generated by Litre Ledger`;

    navigator.clipboard.writeText(text);
    setSharedAlert('Daily report copied to clipboard! Ready to paste into WhatsApp, Viber, or SMS.');
    setTimeout(() => setSharedAlert(null), 3500);
  };

  const getShiftIcon = (type: ShiftType) => {
    switch (type) {
      case 'morning':
        return <Sun className="w-5 h-5 text-amber-500" />;
      case 'noon':
        return <CloudSun className="w-5 h-5 text-orange-500" />;
      case 'evening':
        return <Moon className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Date & Calendar System Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/20">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-bold tracking-tight">
                  {calendarSystem === 'BS' ? todayBs.formattedFull : new Date(todayDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-blue-100 mt-0.5">
                {calendarSystem === 'BS'
                  ? `${todayBs.dayOfWeekNp} · ${todayBs.nepaliNumeralDate} · AD: ${todayDate}`
                  : `Gregorian Calendar · BS Reference: ${todayBs.formattedBsDate} (${todayBs.dayOfWeekNp})`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <div className="text-right">
              <span className="block text-xs uppercase tracking-wider text-blue-200">Today's Earnings</span>
              <span className="text-lg sm:text-xl font-bold font-mono tabular-nums text-white">
                {formatCurrency(totalTodayAmount, settings.currency)}
              </span>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-right">
              <span className="block text-xs uppercase tracking-wider text-blue-200">Total Volume</span>
              <span className="text-lg sm:text-xl font-bold font-mono tabular-nums text-white">
                {formatLitres(totalTodayLitres)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Three Shift Summary Cards (Morning, Noon, Evening) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SHIFT_LIST.map((shiftKey) => {
          const info = SHIFTS[shiftKey];
          const summary = shiftSummaries[shiftKey];
          const isActive = activeShift === shiftKey;

          return (
            <div
              key={shiftKey}
              onClick={() => onSelectShift(shiftKey)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectShift(shiftKey);
                }
              }}
              className={`p-4 rounded-xl border transition-all text-left cursor-pointer ${
                isActive
                  ? 'bg-blue-50/70 border-blue-500 shadow-sm ring-1 ring-blue-500'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getShiftIcon(shiftKey)}
                  <div>
                    <span className="text-sm font-bold text-slate-900 block leading-tight">
                      {info.titleEn} ({info.titleNp})
                    </span>
                    <span className="text-[11px] text-slate-500">{info.timeRange}</span>
                  </div>
                </div>
                {isActive && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-blue-600 text-white">
                    Recording
                  </span>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-500">Volume</span>
                  <div className="text-base font-bold text-slate-900 font-mono tabular-nums">
                    {formatLitres(summary.litres)}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500">Amount</span>
                  <div className="text-base font-bold text-blue-700 font-mono tabular-nums">
                    {formatCurrency(summary.amount, settings.currency)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. New Sale Entry Form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Record a Sale</h2>
            <p className="text-xs text-slate-500">
              Active schedule: <strong className="text-blue-700">{SHIFTS[activeShift].titleEn} ({SHIFTS[activeShift].titleNp})</strong> · Time: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Need another shift?</span>
            <div className="flex gap-1">
              {SHIFT_LIST.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSelectShift(s)}
                  className={`text-xs px-2 py-1 rounded-md font-medium transition-colors ${
                    activeShift === s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {SHIFTS[s].titleEn}
                </button>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveSale} className="mt-5 space-y-4">
          {/* Item Selector Chips */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Select Liquid / Dairy Item
            </label>
            {items.length === 0 ? (
              <p className="text-sm text-red-600">No items available. Please add items in the Items tab.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {items.map((item) => {
                  const isSelected = item.id === selectedItemId;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedItemId(item.id);
                        setCustomPriceInput('');
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Droplet className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-blue-600'}`} />
                      <span>{item.name}</span>
                      <span className={`text-xs font-mono font-medium ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                        {formatCurrency(item.price, settings.currency)}/L
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Litres and Price Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Litres Input */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor={litresInputId} className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Litres Sold <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-slate-400">e.g. 2.5 L</span>
              </div>
              <div className="relative">
                <input
                  id={litresInputId}
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="0"
                  placeholder="0.00"
                  value={litresInput}
                  onChange={(e) => setLitresInput(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-lg font-bold font-mono text-slate-900 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  Litre
                </span>
              </div>

              {/* Quick Litre Buttons */}
              <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1">
                {[0.5, 1, 2, 5, 10].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleAddQuickLitre(val)}
                    className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors shrink-0"
                  >
                    +{val}L
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setLitresInput('')}
                  className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-600 rounded-lg transition-colors shrink-0"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Price Override Input */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor={priceInputId} className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Price per Litre <span className="text-slate-400 font-normal">(Optional Override)</span>
                </label>
                <span className="text-xs text-slate-500 font-mono">
                  Default: {formatCurrency(selectedItem?.price || 0, settings.currency)}
                </span>
              </div>
              <div className="relative">
                <input
                  id={priceInputId}
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="0"
                  placeholder={selectedItem ? selectedItem.price.toString() : '0.00'}
                  value={customPriceInput}
                  onChange={(e) => setCustomPriceInput(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-lg font-bold font-mono text-slate-900 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  {settings.currency}/L
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Leave empty to automatically use the standard rate of {formatCurrency(selectedItem?.price || 0, settings.currency)}/L.
              </p>
            </div>
          </div>

          {/* Real-time Total Display Bar */}
          <div className="flex items-center justify-between p-4 bg-blue-50/60 border border-blue-100 rounded-xl">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-900">Total Amount For This Sale</span>
              <p className="text-xs text-slate-500">
                {parsedLitres > 0
                  ? `${formatLitres(parsedLitres)} × ${formatCurrency(effectivePrice, settings.currency)} per litre`
                  : 'Enter litres to compute price'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-extrabold text-blue-700 font-mono tabular-nums">
                {formatCurrency(calculatedTotal, settings.currency)}
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={!selectedItem || !parsedLitres || parsedLitres <= 0}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-base rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span>Record Sale ({SHIFTS[activeShift].titleEn})</span>
            </button>
          </div>

          {/* Feedback banner */}
          {feedback && (
            <div
              className={`p-3 rounded-xl flex items-center gap-2 text-sm font-semibold transition-all ${
                feedback.ok ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {feedback.ok ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          {sharedAlert && (
            <div className="p-3 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{sharedAlert}</span>
            </div>
          )}
        </form>
      </div>

      {/* 4. Today's Shift Sales List Header & Filter Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Today's Sales Records</h3>
            <p className="text-xs text-slate-500">
              Showing {filteredSales.length} {filteredSales.length === 1 ? 'sale' : 'sales'} for {todayShiftFilter === 'all' ? 'All Shifts' : `${SHIFTS[todayShiftFilter as ShiftType]?.titleEn} (${SHIFTS[todayShiftFilter as ShiftType]?.titleNp})`}
            </p>
          </div>

          {/* Action Buttons: Share & Print Daily Summary */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareDailyReport}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
              title="Copy formatted daily sales summary for WhatsApp / SMS"
            >
              <Share2 className="w-4 h-4 text-slate-600" />
              <span>Share Summary</span>
            </button>
            <button
              onClick={() => onOpenDailySummaryReceipt(todayShiftFilter)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors"
              title="View & Print Daily Sales Sheet"
            >
              <Printer className="w-4 h-4 text-blue-600" />
              <span>Print Sheet</span>
            </button>
          </div>
        </div>

        {/* Shift Filter Segmented Control */}
        <div className="flex items-center gap-1.5 pt-4 overflow-x-auto pb-1">
          <button
            onClick={() => setTodayShiftFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              todayShiftFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Shifts ({todaySales.length})
          </button>
          {SHIFT_LIST.map((s) => {
            const count = shiftSummaries[s].count;
            return (
              <button
                key={s}
                onClick={() => setTodayShiftFilter(s)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  todayShiftFilter === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {SHIFTS[s].icon} {SHIFTS[s].titleEn} ({count})
              </button>
            );
          })}
        </div>

        {/* Transactions Table / List */}
        <div className="mt-4 divide-y divide-slate-100">
          {filteredSales.length === 0 ? (
            <div className="py-12 text-center">
              <Droplet className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No sales recorded yet for this shift.</p>
              <p className="text-xs text-slate-400 mt-1">
                Enter litres sold in the form above and click Record Sale.
              </p>
            </div>
          ) : (
            filteredSales
              .slice()
              .sort((a, b) => b.timestamp - a.timestamp)
              .map((sale) => {
                const shiftInfo = SHIFTS[sale.shift];
                const timeStr = new Date(sale.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={sale.id}
                    className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/70 px-2 rounded-lg transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm truncate">
                          {sale.item}
                        </span>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {shiftInfo.icon} {shiftInfo.titleEn}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">
                        {formatLitres(sale.litres)} @ {formatCurrency(sale.price, settings.currency)}/L · {timeStr}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-base font-bold text-blue-700 font-mono tabular-nums block">
                          {formatCurrency(sale.total, settings.currency)}
                        </span>
                      </div>
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
              })
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {saleToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Delete Sale Record?</h3>
            <p className="text-xs text-slate-600 mt-2">
              Are you sure you want to remove the sale of <strong>{formatLitres(saleToDelete.litres)}</strong> of <strong>{saleToDelete.item}</strong> ({formatCurrency(saleToDelete.total, settings.currency)})?
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
