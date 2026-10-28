import { Item, Sale, Settings } from '../types';
import { adToBs, getTodayIsoDate } from './bikramSambat';

const STORAGE_KEYS = {
  ITEMS: 'litreLedger_items',
  SALES: 'litreLedger_sales',
  SETTINGS: 'litreLedger_settings',
};

export const DEFAULT_ITEMS: Item[] = [
  { id: 'item-1', name: 'Cow Milk (गाईको दूध)', price: 50.0, createdAt: Date.now() - 100000 },
  { id: 'item-2', name: 'Buffalo Milk (भैँसीको दूध)', price: 65.0, createdAt: Date.now() - 90000 },
  { id: 'item-3', name: 'Full Cream Milk (फुल क्रिम)', price: 70.0, createdAt: Date.now() - 80000 },
  { id: 'item-4', name: 'Curd / Dahi (दही)', price: 60.0, createdAt: Date.now() - 70000 },
  { id: 'item-5', name: 'Paneer / Dairy Milk', price: 85.0, createdAt: Date.now() - 60000 },
];

export const DEFAULT_SETTINGS: Settings = {
  calendarSystem: 'BS',
  currency: 'Rs.',
  businessName: 'Litre Ledger Dairy Farm',
  phone: '9800000000',
  address: 'Milk Collection Center',
};

export function cleanupDemoItems(): void {
  try {
    const rawItems = localStorage.getItem(STORAGE_KEYS.ITEMS);
    if (rawItems) {
      const parsed = JSON.parse(rawItems);
      if (Array.isArray(parsed)) {
        const nonDemo = parsed.filter(
          (i) => !['item-1', 'item-2', 'item-3', 'item-4', 'item-5'].includes(i.id)
        );
        localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(nonDemo));
      }
    }

    const rawSales = localStorage.getItem(STORAGE_KEYS.SALES);
    if (rawSales) {
      const parsedSales = JSON.parse(rawSales);
      if (Array.isArray(parsedSales)) {
        const nonDemoSales = parsedSales.filter(
          (s) =>
            !['Cow Milk (गाईको दूध)', 'Buffalo Milk (भैँसीको दूध)', 'Full Cream Milk (फुल क्रिम)', 'Curd / Dahi (दही)', 'Paneer / Dairy Milk'].includes(s.item)
        );
        localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(nonDemoSales));
      }
    }
  } catch (e) {
    console.error('Error cleaning demo items', e);
  }
}

export function loadItems(): Item[] {
  try {
    // Run cleanup once for existing browsers with demo items
    if (!localStorage.getItem('litreLedger_demo_cleaned_v2')) {
      localStorage.setItem('litreLedger_demo_cleaned_v2', 'true');
      cleanupDemoItems();
    }

    const raw = localStorage.getItem(STORAGE_KEYS.ITEMS);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveItems(items: Item[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save items to localStorage', err);
  }
}

export function loadSales(): Sale[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SALES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSales(sales: Sale[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  } catch (err) {
    console.error('Failed to save sales to localStorage', err);
  }
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings to localStorage', err);
  }
}

export function roundToTwo(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function formatCurrency(amount: number, symbol = 'Rs.'): string {
  const cleanSym = symbol.trim();
  const formattedNum = Number(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${cleanSym} ${formattedNum}`;
}

export function formatLitres(litres: number): string {
  const formattedNum = Number(litres || 0).toLocaleString('en-US', {
    maximumFractionDigits: 2,
  });
  return `${formattedNum} L`;
}

export function generateUid(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

/**
 * Creates and downloads JSON backup compatible with Android & offline prototype
 */
export function exportBackupJson(items: Item[], sales: Sale[]): void {
  const todayStr = getTodayIsoDate();
  const backupData = {
    app: 'litre-ledger',
    version: 2,
    exported: new Date().toISOString(),
    items,
    sales,
  };

  const blob = new Blob([JSON.stringify(backupData, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `litre-ledger-backup-${todayStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Validates and parses JSON backup content
 */
export function parseBackupJson(jsonString: string): { items: Item[]; sales: Sale[] } {
  const data = JSON.parse(jsonString);
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid JSON format');
  }

  const rawItems = Array.isArray(data.items) ? data.items : [];
  const rawSales = Array.isArray(data.sales) ? data.sales : [];

  const validItems: Item[] = rawItems
    .filter((it: unknown): it is { name: string; price: number; id?: string } => {
      const item = it as Record<string, unknown>;
      return Boolean(item && typeof item.name === 'string' && Number.isFinite(item.price));
    })
    .map((it: { name: string; price: number; id?: string }) => ({
      id: String(it.id || generateUid()),
      name: it.name.trim(),
      price: Number(it.price),
      createdAt: Date.now(),
    }));

  const validSales: Sale[] = rawSales
    .filter((s: unknown): s is Record<string, unknown> => {
      const sale = s as Record<string, unknown>;
      return Boolean(
        sale &&
        typeof sale.item === 'string' &&
        typeof sale.date === 'string' &&
        /^\d{4}-\d{2}-\d{2}$/.test(sale.date) &&
        Number.isFinite(sale.litres) &&
        Number.isFinite(sale.price)
      );
    })
    .map((s: Record<string, unknown>) => {
      const litres = Number(s.litres);
      const price = Number(s.price);
      const total = Number.isFinite(s.total) ? Number(s.total) : roundToTwo(litres * price);
      const shiftStr = String(s.shift || 'morning').toLowerCase();
      const shift = shiftStr === 'noon' ? 'noon' : shiftStr === 'evening' ? 'evening' : 'morning';

      return {
        id: String(s.id || generateUid()),
        timestamp: Number(s.ts || s.timestamp) || Date.now(),
        date: String(s.date),
        item: String(s.item).trim(),
        litres,
        price,
        total,
        shift,
        notes: typeof s.notes === 'string' ? s.notes : undefined,
      };
    });

  return { items: validItems, sales: validSales };
}

/**
 * Exports sales records as CSV spreadsheet for Excel / Sheets
 */
export function exportSalesCsv(sales: Sale[], currency = 'Rs.'): void {
  const headers = [
    'Transaction ID',
    'Date (AD)',
    'Date (BS)',
    'Nepali Day',
    'Time',
    'Shift',
    'Item Name',
    'Litres Sold (L)',
    `Price per Litre (${currency})`,
    `Total Amount (${currency})`,
    'Notes',
  ];

  const rows = sales.map((sale) => {
    const bs = adToBs(sale.date);
    const timeStr = new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return [
      `"${sale.id}"`,
      `"${sale.date}"`,
      `"${bs.formattedBsDate}"`,
      `"${bs.dayOfWeekNp}"`,
      `"${timeStr}"`,
      `"${sale.shift}"`,
      `"${sale.item.replace(/"/g, '""')}"`,
      sale.litres,
      sale.price,
      sale.total,
      `"${(sale.notes || '').replace(/"/g, '""')}"`,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `litre-ledger-sales-${getTodayIsoDate()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Generates sample past days sales to demonstrate analytics, calendar, and shifts immediately
 */
export function generateDemoSales(items: Item[]): Sale[] {
  const sales: Sale[] = [];
  const shifts: Array<'morning' | 'noon' | 'evening'> = ['morning', 'noon', 'evening'];
  const today = new Date();

  // Create transactions for the past 7 days
  for (let d = 0; d < 7; d++) {
    const dayDate = new Date(today);
    dayDate.setDate(today.getDate() - d);
    const pad = (n: number) => String(n).padStart(2, '0');
    const dateStr = `${dayDate.getFullYear()}-${pad(dayDate.getMonth() + 1)}-${pad(dayDate.getDate())}`;

    // For each shift in that day
    shifts.forEach((shift) => {
      // 1-3 sales per shift
      const numSales = d === 0 ? 3 : Math.floor(Math.random() * 2) + 1;
      for (let s = 0; s < numSales; s++) {
        const item = items[Math.floor(Math.random() * items.length)] || DEFAULT_ITEMS[0];
        const litreOptions = [1, 1.5, 2, 2.5, 3, 5, 8, 10];
        const litres = litreOptions[Math.floor(Math.random() * litreOptions.length)];
        const total = roundToTwo(litres * item.price);

        let hour = 7;
        if (shift === 'noon') hour = 13;
        if (shift === 'evening') hour = 18;

        const ts = new Date(dayDate).setHours(hour, Math.floor(Math.random() * 50), 0);

        sales.push({
          id: generateUid(),
          timestamp: ts,
          date: dateStr,
          item: item.name,
          litres,
          price: item.price,
          total,
          shift,
        });
      }
    });
  }

  return sales;
}
