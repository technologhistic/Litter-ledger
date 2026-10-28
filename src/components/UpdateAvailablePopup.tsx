import React from 'react';
import {
  Sparkles,
  ArrowRight,
  X,
  RefreshCw,
  CheckCircle2,
  Zap,
} from 'lucide-react';

export interface AppUpdateDetails {
  version: string;
  releaseDate?: string;
  title: string;
  notes: string[];
}

interface UpdateAvailablePopupProps {
  isOpen: boolean;
  updateDetails?: AppUpdateDetails | null;
  onUpdate: () => void;
  onDismiss: () => void;
}

export const UpdateAvailablePopup: React.FC<UpdateAvailablePopupProps> = ({
  isOpen,
  updateDetails,
  onUpdate,
  onDismiss,
}) => {
  if (!isOpen) return null;

  const version = updateDetails?.version || '1.3.0';
  const notes = updateDetails?.notes || [
    'Cleaner zero-demo starter database (ready for real sales entry)',
    'Enhanced Bikram Sambat (BS) date conversion algorithms',
    'Real-time shift totals and instant cache refresh',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
        {/* Decorative Top Accent Banner */}
        <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500" />

        <div className="p-6">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/10">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">
                    Update Available
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold font-mono">
                    v{version}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  A new update is available for Litre Ledger.
                </p>
              </div>
            </div>

            <button
              onClick={onDismiss}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              title="Dismiss"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Release Notes */}
          <div className="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              What's New in this Update:
            </span>
            <ul className="space-y-1.5 text-xs text-slate-600">
              {notes.map((note, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Safe update notice */}
          <div className="mt-3 text-[11px] text-slate-500 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Updating reloads the application while keeping your local sales and items intact.</span>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={onUpdate}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer active:scale-98"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Update Now</span>
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs rounded-xl transition-colors cursor-pointer text-center"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
