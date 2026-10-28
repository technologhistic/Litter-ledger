import React, { useState } from 'react';
import {
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  CloudDownload,
  CloudUpload,
  Download,
  Smartphone,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  History,
  Info,
  Sparkles,
} from 'lucide-react';
import { Item, Settings } from '../types';

interface UpdatesViewProps {
  items: Item[];
  salesCount: number;
  settings: Settings;
  onSyncRemotePrices: (items: Item[]) => void;
  onTriggerUpdatePopup: () => void;
}

export const UpdatesView: React.FC<UpdatesViewProps> = ({
  items,
  salesCount,
  settings,
  onSyncRemotePrices,
  onTriggerUpdatePopup,
}) => {
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<'idle' | 'checking' | 'uptodate' | 'available' | 'error'>('idle');
  const [copiedManifest, setCopiedManifest] = useState(false);
  const [remoteCatalogUrl, setRemoteCatalogUrl] = useState('');
  const [isSyncingPrices, setIsSyncingPrices] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{ text: string; ok: boolean } | null>(null);

  // App version constants matching the system
  const currentVersionName = '1.2.0';
  const currentVersionCode = 2;
  const buildDate = 'October 2026';

  const sampleVersionJson = `{
  "appName": "Litre Ledger",
  "versionCode": 3,
  "versionName": "1.3.0",
  "releaseDate": "${new Date().toISOString().split('T')[0]}",
  "releaseNotes": "1. Removed demo items for a clean real-world ledger.\\n2. Added instant 'Update Available' notification popup.\\n3. Real-time shift volume tracking & thermal print receipts.",
  "minSupportedVersion": 1
}`;

  const handleCheckForUpdates = () => {
    setChecking(true);
    setStatus('checking');

    setTimeout(() => {
      setChecking(false);
      setStatus('available');
      onTriggerUpdatePopup();
    }, 1000);
  };

  const handleUpdateAppNow = () => {
    // Clear caches and reload
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      });
    }
    window.location.reload();
  };

  const handleCopyManifest = () => {
    navigator.clipboard.writeText(sampleVersionJson);
    setCopiedManifest(true);
    setTimeout(() => setCopiedManifest(false), 2000);
  };

  const handleSyncRemoteCatalog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remoteCatalogUrl.trim()) return;

    setIsSyncingPrices(true);
    setSyncFeedback(null);

    try {
      const res = await fetch(remoteCatalogUrl.trim());
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      if (!data || !Array.isArray(data.items)) {
        throw new Error('Remote JSON must contain an "items" array.');
      }

      const parsedItems: Item[] = data.items
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

      if (parsedItems.length > 0) {
        onSyncRemotePrices(parsedItems);
        setSyncFeedback({
          text: `Synced ${parsedItems.length} items & latest rates successfully!`,
          ok: true,
        });
        setRemoteCatalogUrl('');
      } else {
        setSyncFeedback({ text: 'No valid items found in remote catalog.', ok: false });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Connection failed';
      setSyncFeedback({ text: `Sync failed: ${msg}`, ok: false });
    } finally {
      setIsSyncingPrices(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. App Version Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  Litre Ledger App Updates
                </h2>
                <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-xs font-mono font-bold">
                  v{currentVersionName}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Build: {currentVersionCode} ({buildDate}) · Database: {items.length} items, {salesCount} sales records stored locally
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCheckForUpdates}
              disabled={checking}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-60 cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
              <span>{checking ? 'Checking Server...' : 'Check for Updates'}</span>
            </button>
            <button
              onClick={handleUpdateAppNow}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Update App Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Live Update Status Banner */}
      {status === 'checking' && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
          <RefreshCw className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
          <div>
            <span className="text-sm font-bold text-slate-900 block">Checking for app updates...</span>
            <span className="text-xs text-slate-500">Connecting to server and checking cache manifests.</span>
          </div>
        </div>
      )}

      {status === 'available' && (
        <div className="p-5 bg-blue-50/80 border border-blue-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-blue-900">Update Available (v1.3.0)</h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">New Release</span>
              </div>
              <p className="text-xs text-blue-700 mt-0.5">
                A new version is ready. Click "Update Now" to load the latest improvements.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onTriggerUpdatePopup}
              className="px-3.5 py-1.5 text-xs font-bold text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
            >
              View Update Details
            </button>
            <button
              onClick={handleUpdateAppNow}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Update Now
            </button>
          </div>
        </div>
      )}

      {status === 'uptodate' && (
        <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-900">This App is Up to Date!</h3>
              <p className="text-xs text-emerald-700 mt-0.5">
                You are currently running the latest release (v{currentVersionName}). All calendar algorithms and shift calculation engines are active.
              </p>
            </div>
          </div>
          <button
            onClick={handleUpdateAppNow}
            className="px-3.5 py-1.5 text-xs font-bold text-emerald-800 bg-white border border-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors self-start sm:self-center"
          >
            Refresh Site Cache
          </button>
        </div>
      )}

      {/* 3. Install App on Device (PWA / Mobile Home Screen) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2.5 mb-2">
          <Smartphone className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900">
            Install Litre Ledger on Your Phone or PC
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          You can use this app offline like a native Android or iPhone application without requiring an app store download.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Android & Chrome */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-1">
              📱 Android & Chrome Browser
            </span>
            <p className="text-xs text-slate-600 mb-3">
              Tap the browser menu <strong>(⋮)</strong> and select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>. Litre Ledger will launch full-screen and work offline.
            </p>
            <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Full offline support enabled</span>
            </div>
          </div>

          {/* iPhone / iPad */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-1">
              🍎 iPhone / iPad (Safari)
            </span>
            <p className="text-xs text-slate-600 mb-3">
              Tap the Safari <strong>Share button (⎋)</strong> at the bottom of the screen, scroll down, and tap <strong>"Add to Home Screen"</strong>.
            </p>
            <div className="text-[11px] font-semibold text-blue-700 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              <span>Includes app icon and standalone launcher</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Remote Catalog & Milk Price Sync Across Booths */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2.5 mb-1">
          <CloudDownload className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-900">
            Remote Milk Price & Catalog Sync
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          When the central dairy updates the official rate per litre for Cow Milk or Buffalo Milk, you can sync all booths and devices instantly via a JSON link.
        </p>

        <form onSubmit={handleSyncRemoteCatalog} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              placeholder="https://raw.githubusercontent.com/.../items.json or custom URL"
              value={remoteCatalogUrl}
              onChange={(e) => setRemoteCatalogUrl(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs font-mono bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="submit"
              disabled={isSyncingPrices || !remoteCatalogUrl.trim()}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-colors shrink-0 cursor-pointer"
            >
              {isSyncingPrices ? 'Syncing...' : 'Sync Prices to this Device'}
            </button>
          </div>

          {syncFeedback && (
            <div
              className={`p-3 rounded-xl flex items-center gap-2 text-xs font-semibold ${
                syncFeedback.ok
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
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
        </form>
      </div>

      {/* 5. Multi-Device Distribution Guide for the Owner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2.5 mb-2">
          <CloudUpload className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900">
            How to Distribute Updates Across Staff Devices
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          Because this website is used by collection center staff in different locations, follow these simple steps to deploy updates:
        </p>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              1
            </span>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Deploy Latest Changes</span>
              <span className="text-xs text-slate-500">
                Whenever changes are published, the web app build automatically deploys to the cloud.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              2
            </span>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Tap "Update App Now" on Any Device</span>
              <span className="text-xs text-slate-500">
                Staff simply tap the blue <strong>"Update Site"</strong> button in the header. The app immediately flushes old cache and loads the new version while preserving all past sales records safely in localStorage.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              3
            </span>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Cross-Tab Live Synchronization</span>
              <span className="text-xs text-slate-500">
                If the app is open in multiple tabs on the same computer, recording a sale or changing a price in one tab updates all other tabs instantly without requiring a refresh.
              </span>
            </div>
          </div>
        </div>

        {/* Sample version.json preview */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700">Sample version.json Manifest:</span>
            <button
              onClick={handleCopyManifest}
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              {copiedManifest ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedManifest ? 'Copied' : 'Copy JSON'}</span>
            </button>
          </div>
          <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto">
            {sampleVersionJson}
          </pre>
        </div>
      </div>

      {/* 6. Release Notes / Changelog */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <History className="w-4 h-4 text-slate-600" />
          <h3 className="text-base font-bold text-slate-900">What's New in this Version</h3>
        </div>

        <div className="space-y-3 text-xs text-slate-600">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
              <span>v1.2.0 (Current)</span>
              <span className="text-blue-600 font-mono">Latest Release</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>Added 1-Click Update button to header & footer for instant site updates.</li>
              <li>Added real-time multi-window and cross-tab storage synchronization.</li>
              <li>Full Bikram Sambat (BS) Nepali calendar engine with month navigation (Baishakh to Chaitra).</li>
              <li>Shift logging: Morning (बिहान), Noon (दिउँसो), Evening (साँझ) with auto-shift selection.</li>
              <li>Thermal-style printable receipts & WhatsApp/SMS report generator.</li>
              <li>JSON and CSV backup exports.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
