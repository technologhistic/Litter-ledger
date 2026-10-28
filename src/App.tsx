import React, { useState, useEffect } from 'react';
import { Header, NavTab } from './components/Header';
import { SellTodayView } from './components/SellTodayView';
import { ItemsView } from './components/ItemsView';
import { MonthView } from './components/MonthView';
import { HistoryView } from './components/HistoryView';
import { BackupSettingsView } from './components/BackupSettingsView';
import { UpdatesView } from './components/UpdatesView';
import { ReceiptModal } from './components/ReceiptModal';
import { UpdateModal } from './components/UpdateModal';
import { UpdateAvailablePopup, AppUpdateDetails } from './components/UpdateAvailablePopup';
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
import { RefreshCw, CheckCircle2, Sparkles } from 'lucide-react';

export default function App() {
  const [items, setItems] = useState<Item[]>(() => loadItems());
  const [sales, setSales] = useState<Sale[]>(() => loadSales());
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [activeShift, setActiveShift] = useState<ShiftType>(() => getCurrentShift());
  const [currentTab, setCurrentTab] = useState<NavTab>('sell');
  const [todayDate] = useState<string>(() => getTodayIsoDate());

  // Update popup state
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isUpdateAvailablePopupOpen, setIsUpdateAvailablePopupOpen] = useState(false);
  const [updateDetails, setUpdateDetails] = useState<AppUpdateDetails | null>({
    version: '1.3.0',
    title: 'New Update Available',
    notes: [
      'Clean database setup without sample demo items',
      'Enhanced Bikram Sambat (BS) date conversion algorithms',
      'Shift-wise sales summaries (Morning, Noon, Evening)',
      'Direct thermal receipt printing & one-click update engine',
    ],
  });
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

  // Synchronize localStorage
  useEffect(() => {
    saveItems(items);
  }, [items]);

  useEffect(() => {
    saveSales(sales);
  }, [sales]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

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

  // Today BS Date
  const todayBs = getTodayBs();
  const todayBsText = `${todayBs.day} ${todayBs.monthNameEn} ${todayBs.year} BS`;

  // Sale Operations
  const handleAddSale = (newSale: Sale) => {
    setSales((prev) => [newSale, ...prev]);
  };

  const handleDeleteSale = (saleId: string) => {
    setSales((prev) => prev.filter((s) => s.id !== saleId));
  };

  // Item Operations
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

  // Data import / reset
  const handleImportData = (newItems: Item[], newSales: Sale[], replace: boolean) => {
    if (replace) {
      setItems(newItems);
      setSales(newSales);
    } else {
      // Merge unique items and sales
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

  // Remote Price Sync
  const handleSyncRemotePrices = (syncedItems: Item[]) => {
    setItems(syncedItems);
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
      {/* Top Header with Update Site Button */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        calendarSystem={settings.calendarSystem}
        onToggleCalendar={handleToggleCalendar}
        activeShift={activeShift}
        onSelectShift={setActiveShift}
        todayBsText={todayBsText}
        onOpenUpdateModal={() => setIsUpdateModalOpen(true)}
      />

      {/* Floating Cross-Tab Sync Notification */}
      {syncToast && (
        <div className="fixed bottom-6 right-6 z-40 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{syncToast}</span>
          <button
            onClick={() => setSyncToast(null)}
            className="text-slate-400 hover:text-white"
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

        {currentTab === 'updates' && (
          <UpdatesView
            items={items}
            salesCount={sales.length}
            settings={settings}
            onSyncRemotePrices={handleSyncRemotePrices}
            onTriggerUpdatePopup={() => setIsUpdateAvailablePopupOpen(true)}
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

      {/* Footer with quick Update Site trigger */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 mt-auto no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="font-semibold text-slate-700">Litre Ledger</span> · Liquid & Dairy Sales Management
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Offline-Ready (LocalStorage)</span>
            <span>·</span>
            <span>Bikram Sambat (वि.सं.) + AD</span>
            <span>·</span>
            <button
              onClick={() => setIsUpdateAvailablePopupOpen(true)}
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Update Available (v1.3.0)</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Update & Sync Modal */}
      <UpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        items={items}
        salesCount={sales.length}
        onSyncRemotePrices={handleSyncRemotePrices}
      />

      {/* Update Available Popup */}
      <UpdateAvailablePopup
        isOpen={isUpdateAvailablePopupOpen}
        updateDetails={updateDetails}
        onUpdate={() => {
          if ('caches' in window) {
            caches.keys().then((names) => {
              names.forEach((name) => caches.delete(name));
            });
          }
          window.location.reload();
        }}
        onDismiss={() => setIsUpdateAvailablePopupOpen(false)}
      />

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
