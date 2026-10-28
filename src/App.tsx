import React, { useState, useEffect } from 'react';
import { Header, NavTab } from './components/Header';
import { SellTodayView } from './components/SellTodayView';
import { ItemsView } from './components/ItemsView';
import { MonthView } from './components/MonthView';
import { HistoryView } from './components/HistoryView';
import { BackupSettingsView } from './components/BackupSettingsView';
import { ReceiptModal } from './components/ReceiptModal';
import { Item, Sale, Settings, ShiftType } from './types';
import { getTodayBs, getTodayIsoDate } from './utils/bikramSambat';
import { getCurrentShift } from './utils/shifts';
import {
  loadItems,
  loadSales,
  loadSettings,
  saveItems,
  saveSales,
  saveSettings,
} from './utils/storage';
import {
  syncItemsToIndexedDB,
  syncSalesToIndexedDB,
  loadItemsFromIndexedDB,
  loadSalesFromIndexedDB,
} from './utils/indexedDb';
import { useAppUpdate } from './utils/useAppUpdate';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const { hasUpdate, isUpdating, triggerUpdate } = useAppUpdate();
  const [items, setItems] = useState<Item[]>(() => loadItems());
  const [sales, setSales] = useState<Sale[]>(() => loadSales());
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [activeShift, setActiveShift] = useState<ShiftType>(() => getCurrentShift());
  const [currentTab, setCurrentTab] = useState<NavTab>('sell');
  const [todayDate] = useState<string>(() => getTodayIsoDate());
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Receipt Modal state
  const [receiptSale, setReceiptSale] = useState<Sale | null>(null);
  const [receiptDailySummary, setReceiptDailySummary] = useState<{
    date: string;
    shift: string;
    sales: Sale[];
    totalLitres: number;
    totalAmount: number;
  } | null>(null);

  // Dual-layer offline persistence: Synchronize localStorage + IndexedDB
  useEffect(() => {
    saveItems(items);
    syncItemsToIndexedDB(items);
  }, [items]);

  useEffect(() => {
    saveSales(sales);
    syncSalesToIndexedDB(sales);
  }, [sales]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Check IndexedDB fallback if initial localStorage was empty
  useEffect(() => {
    if (items.length === 0) {
      loadItemsFromIndexedDB().then((dbItems) => {
        if (dbItems && dbItems.length > 0) setItems(dbItems);
      });
    }
    if (sales.length === 0) {
      loadSalesFromIndexedDB().then((dbSales) => {
        if (dbSales && dbSales.length > 0) setSales(dbSales);
      });
    }
  }, []);

  // Listen for cross-tab storage changes so all open tabs update in real-time
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'litreLedger_sales') {
        const updatedSales = loadSales();
        setSales(updatedSales);
        setSyncToast('Sales ledger updated from another window!');
        setTimeout(() => setSyncToast(null), 3500);
      } else if (e.key === 'litreLedger_items') {
        const updatedItems = loadItems();
        setItems(updatedItems);
        setSyncToast('Items & rates updated from another window!');
        setTimeout(() => setSyncToast(null), 3500);
      } else if (e.key === 'litreLedger_settings') {
        const updatedSettings = loadSettings();
        setSettings(updatedSettings);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const todayBs = getTodayBs();
  const todayBsText = `${todayBs.day} ${todayBs.monthNameEn} ${todayBs.year} (${todayBs.dayOfWeekNp})`;

  // Add Sale handler
  const handleAddSale = (newSale: Sale) => {
    setSales((prev) => [newSale, ...prev]);
  };

  // Delete Sale handler
  const handleDeleteSale = (saleId: string) => {
    setSales((prev) => prev.filter((s) => s.id !== saleId));
  };

  // Item management handlers
  const handleAddItem = (newItem: Item) => {
    setItems((prev) => [...prev, newItem]);
  };

  const handleUpdateItemPrice = (id: string, newPrice: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, price: newPrice } : item))
    );
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Calendar toggle
  const handleToggleCalendar = () => {
    setSettings((prev) => ({
      ...prev,
      calendarSystem: prev.calendarSystem === 'BS' ? 'AD' : 'BS',
    }));
  };

  // Backup & Restore
  const handleImportData = (newItems: Item[], newSales: Sale[], replace: boolean) => {
    if (replace) {
      setItems(newItems);
      setSales(newSales);
    } else {
      // Merge unique
      setItems((prev) => {
        const existingNames = new Set(prev.map((i) => i.name.toLowerCase()));
        const toAdd = newItems.filter((i) => !existingNames.has(i.name.toLowerCase()));
        return [...prev, ...toAdd];
      });

      setSales((prev) => {
        const existingIds = new Set(prev.map((s) => s.id));
        const toAdd = newSales.filter((s) => !existingIds.has(s.id));
        return [...toAdd, ...prev];
      });
    }
  };

  const handleClearAllData = () => {
    setSales([]);
    setItems([]);
  };

  // Open Daily summary receipt
  const handleOpenDailySummaryReceipt = (shiftFilter: string) => {
    const todaySales = sales.filter((s) => s.date === todayDate);
    const shiftSales = shiftFilter === 'all'
      ? todaySales
      : todaySales.filter((s) => s.shift === shiftFilter);

    const totalLitres = shiftSales.reduce((sum, s) => sum + s.litres, 0);
    const totalAmount = shiftSales.reduce((sum, s) => sum + s.total, 0);

    setReceiptDailySummary({
      date: todayDate,
      shift: shiftFilter,
      sales: shiftSales,
      totalLitres,
      totalAmount,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        calendarSystem={settings.calendarSystem}
        onToggleCalendar={handleToggleCalendar}
        activeShift={activeShift}
        onSelectShift={setActiveShift}
        todayBsText={todayBsText}
        hasUpdate={hasUpdate}
        isUpdating={isUpdating}
        onTriggerUpdate={triggerUpdate}
      />

      {/* Floating Cross-Tab Sync Notification */}
      {syncToast && (
        <div className="fixed bottom-6 right-6 z-40 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{syncToast}</span>
          <button
            onClick={() => setSyncToast(null)}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'sell' && (
          <SellTodayView
            items={items}
            sales={sales}
            todayDate={todayDate}
            activeShift={activeShift}
            onSelectShift={setActiveShift}
            calendarSystem={settings.calendarSystem}
            settings={settings}
            onAddSale={handleAddSale}
            onDeleteSale={handleDeleteSale}
            onOpenReceipt={(sale) => setReceiptSale(sale)}
            onOpenDailySummaryReceipt={handleOpenDailySummaryReceipt}
          />
        )}

        {currentTab === 'items' && (
          <ItemsView
            items={items}
            sales={sales}
            settings={settings}
            onAddItem={handleAddItem}
            onUpdateItemPrice={handleUpdateItemPrice}
            onDeleteItem={handleDeleteItem}
          />
        )}

        {currentTab === 'month' && (
          <MonthView
            sales={sales}
            calendarSystem={settings.calendarSystem}
            settings={settings}
          />
        )}

        {currentTab === 'history' && (
          <HistoryView
            sales={sales}
            calendarSystem={settings.calendarSystem}
            settings={settings}
            onDeleteSale={handleDeleteSale}
            onOpenReceipt={(sale) => setReceiptSale(sale)}
          />
        )}

        {currentTab === 'backup' && (
          <BackupSettingsView
            items={items}
            sales={sales}
            settings={settings}
            onUpdateSettings={setSettings}
            onImportData={handleImportData}
            onClearAllData={handleClearAllData}
          />
        )}
      </main>

      {/* Clean Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 mt-auto no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="font-semibold text-slate-700">Litre Ledger</span> · Liquid & Dairy Sales Management
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Offline-Ready (LocalStorage + IndexedDB)</span>
            <span>·</span>
            <span>Bikram Sambat (वि.सं.) + AD</span>
          </div>
        </div>
      </footer>

      {/* Printable Receipt Modal */}
      {(receiptSale || receiptDailySummary) && (
        <ReceiptModal
          sale={receiptSale}
          dailySummary={receiptDailySummary}
          settings={settings}
          onClose={() => {
            setReceiptSale(null);
            setReceiptDailySummary(null);
          }}
        />
      )}
    </div>
  );
}
