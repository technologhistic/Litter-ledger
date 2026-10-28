import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../utils/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all select-none ${
        isOnline
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'bg-amber-50 text-amber-800 border border-amber-300 shadow-sm animate-pulse'
      }`}
      title={isOnline ? 'Internet connected · Offline-ready' : 'No internet connection · Working fully offline'}
    >
      {isOnline ? (
        <>
          <Wifi className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden sm:inline">Online</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3.5 h-3.5 text-amber-600" />
          <span>Offline (Saved Locally)</span>
        </>
      )}
    </div>
  );
};
