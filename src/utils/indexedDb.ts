import { Item, Sale } from '../types';

const DB_NAME = 'litre_ledger_offline_db';
const DB_VERSION = 1;
const STORES = {
  ITEMS: 'items',
  SALES: 'sales',
};

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB not supported in this browser environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORES.ITEMS)) {
        db.createObjectStore(STORES.ITEMS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.SALES)) {
        const salesStore = db.createObjectStore(STORES.SALES, { keyPath: 'id' });
        salesStore.createIndex('date', 'date', { unique: false });
        salesStore.createIndex('shift', 'shift', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Persists current items into IndexedDB
 */
export async function syncItemsToIndexedDB(items: Item[]): Promise<void> {
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORES.ITEMS, 'readwrite');
    const store = tx.objectStore(STORES.ITEMS);

    // Clear and re-populate
    await new Promise<void>((resolve, reject) => {
      const clearReq = store.clear();
      clearReq.onsuccess = () => resolve();
      clearReq.onerror = () => reject(clearReq.error);
    });

    for (const item of items) {
      store.put(item);
    }
  } catch (err) {
    // Silently fall back if IndexedDB is unavailable in restricted environment
    console.warn('IndexedDB items sync notice:', err);
  }
}

/**
 * Persists current sales into IndexedDB
 */
export async function syncSalesToIndexedDB(sales: Sale[]): Promise<void> {
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORES.SALES, 'readwrite');
    const store = tx.objectStore(STORES.SALES);

    // Clear and re-populate
    await new Promise<void>((resolve, reject) => {
      const clearReq = store.clear();
      clearReq.onsuccess = () => resolve();
      clearReq.onerror = () => reject(clearReq.error);
    });

    for (const sale of sales) {
      store.put(sale);
    }
  } catch (err) {
    console.warn('IndexedDB sales sync notice:', err);
  }
}

/**
 * Loads items from IndexedDB if localStorage was cleared
 */
export async function loadItemsFromIndexedDB(): Promise<Item[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORES.ITEMS, 'readonly');
      const store = tx.objectStore(STORES.ITEMS);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

/**
 * Loads sales from IndexedDB if localStorage was cleared
 */
export async function loadSalesFromIndexedDB(): Promise<Sale[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORES.SALES, 'readonly');
      const store = tx.objectStore(STORES.SALES);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}
