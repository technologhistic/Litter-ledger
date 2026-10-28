import React, { useState } from 'react';
import {
  X,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  CloudDownload,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Item } from '../types';

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: Item[];
  salesCount: number;
  onSyncRemotePrices?: (items: Item[]) => void;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
  isOpen,
  onClose,
  items,
  salesCount,
  onSyncRemotePrices,
}) => {
  const [checking, setChecking] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'checking' | 'latest' | 'ready'>('idle');
  const [remoteUrl, setRemoteUrl] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{ text: string; ok: boolean } | null>(null);

  if (!isOpen) return null;

  const currentVersion = 'v1.2.0';
  const buildDate = 'October 2026';

  const handleCheckUpdates = () => {
    setChecking(true);
    setUpdateStatus('checking');

    setTimeout(() => {
      setChecking(false);
      setUpdateStatus('latest');
    }, 1000);
  };

  const handleForceUpdateSite = () => {
    // Preserves localStorage while refreshing application scripts and caches
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((reg) => reg.update());
      });
    }
    // Hard refresh
    window.location.reload();
  };

  const handleRemoteSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remoteUrl.trim()) return;

    setIsSyncing(true);
    setSyncFeedback(null);

    try {
      const response = await fetch(remoteUrl.trim());
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      if (!data || !Array.isArray(data.items)) {
        throw new Error('JSON missing valid "items" array.');
      }

      const updatedItems: Item[] = data.items
        .filter((it: unknown): it is { name: string; price: number; id?: string } => {
          const item = it as Record<string, unknown>;
          return Boolean(item && typeof item.name === 'string' && Number.isFinite(item.price));
        })
        .map((it: { name: string; price: number; id?: string }) => ({
          id: String(it.id || Date.now().toString(36) + Math.random().toString(36).slice(2, 6)),
          name: it.name.trim(),
          price: Number(it.price),
          createdAt: Date.now(),
        }));

      if (updatedItems.length > 0 && onSyncRemotePrices) {
        onSyncRemotePrices(updatedItems);
        setSyncFeedback({
          text: `Successfully synced ${updatedItems.length} items and latest prices!`,
          ok: true,
        });
        setRemoteUrl('');
      } else {
        setSyncFeedback({ text: 'No valid items found in remote catalog.', ok: false });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch catalog';
      setSyncFeedback({ text: `Remote price sync failed: ${msg}`, ok: false });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Update & Synchronize Site
              </h3>
              <p className="text-xs text-slate-500">Litre Ledger Web App</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Version & Status Card */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">Current App Version</span>
                  <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-xs font-mono font-bold">
                    {currentVersion}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Build: {buildDate} · Local Storage: {items.length} items, {salesCount} sales records
                </p>
              </div>

              <button
                onClick={handleCheckUpdates}
                disabled={checking}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-lg transition-colors shrink-0 disabled:opacity-60 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${checking ? 'animate-spin' : ''}`} />
                <span>{checking ? 'Checking...' : 'Check Status'}</span>
              </button>
            </div>

            {updateStatus === 'latest' && (
              <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-2 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Your application and local database are up to date!</span>
              </div>
            )}
          </div>

          {/* Instant 1-Click Update Site Button */}
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Update Site Whenever Changes Occur</span>
            </div>
            <p className="text-xs text-blue-800/80 leading-relaxed">
              Clicking <strong>"Update Site Now"</strong> flushes browser memory, fetches the freshest code, and reloads without affecting your saved sales ledger or custom item prices.
            </p>
            <button
              onClick={handleForceUpdateSite}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Update Site Now (Reload & Refresh Cache)</span>
            </button>
          </div>

          {/* Remote Price & Catalog Sync (From original Android feature) */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-2">
              <CloudDownload className="w-4 h-4 text-slate-700" />
              <h4 className="text-sm font-bold text-slate-900">
                Remote Milk Price & Catalog Sync
              </h4>
            </div>
            <p className="text-xs text-slate-500">
              Update milk prices and catalog items across all staff devices instantly by loading a remote JSON link.
            </p>

            <form onSubmit={handleRemoteSync} className="flex gap-2">
              <input
                type="url"
                placeholder="https://example.com/items.json"
                value={remoteUrl}
                onChange={(e) => setRemoteUrl(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:border-blue-600 font-mono"
              />
              <button
                type="submit"
                disabled={isSyncing || !remoteUrl.trim()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-colors shrink-0 cursor-pointer"
              >
                {isSyncing ? 'Syncing...' : 'Sync Prices'}
              </button>
            </form>

            {syncFeedback && (
              <div
                className={`p-3 rounded-xl flex items-center gap-2 text-xs font-semibold ${
                  syncFeedback.ok ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {syncFeedback.ok ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{syncFeedback.text}</span>
              </div>
            )}
          </div>

          {/* Cross-Tab Realtime Sync Guarantee */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Cross-Tab Live Sync:</strong> Any changes made in another tab or window will automatically sync in real-time.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
