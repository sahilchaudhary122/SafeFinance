import React from 'react';
import { useApp } from '../state/AppContext';
import { translations } from '../lib/i18n';
import { AlertOctagon, ShieldAlert, XCircle, CheckCircle } from 'lucide-react';

export const EmergencyStopModal: React.FC = () => {
  const { language, emergencyStopOpen, setEmergencyStopOpen, cancelPayment, setScreen } = useApp();
  const t = translations[language];

  if (!emergencyStopOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-fadeIn">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="emergency-title"
        className="relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-rose-500 bg-slate-900 shadow-2xl shadow-rose-950/50"
      >
        {/* Urgent header */}
        <div className="bg-rose-950/90 p-6 text-center border-b border-rose-500/30">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-600/30 text-rose-400 border border-rose-500/40 shadow-inner">
            <AlertOctagon className="h-10 w-10 animate-bounce" />
          </div>
          <h2 id="emergency-title" className="mt-4 text-2xl font-black text-rose-100">{t.emergencyTitle}</h2>
          <p className="mt-2 text-sm font-semibold text-rose-200">
            {t.emergencyHeadline}
          </p>
        </div>

        {/* Breakdown of psychological manipulation tactics */}
        <div className="space-y-3.5 p-6 text-sm">
          <div className="rounded-xl border border-rose-500/20 bg-rose-950/30 p-3.5 flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            <p className="text-slate-200 text-xs leading-relaxed">{t.emergencyReason1}</p>
          </div>

          <div className="rounded-xl border border-rose-500/20 bg-rose-950/30 p-3.5 flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            <p className="text-slate-200 text-xs leading-relaxed">{t.emergencyReason2}</p>
          </div>

          <div className="rounded-xl border border-rose-500/20 bg-rose-950/30 p-3.5 flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            <p className="text-slate-200 text-xs leading-relaxed">{t.emergencyReason3}</p>
          </div>
        </div>

        {/* High priority action buttons */}
        <div className="border-t border-slate-800 bg-slate-950/70 p-5 space-y-3">
          {/* Primary Recommended: Cancel Payment */}
          <button
            onClick={cancelPayment}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-4 text-base font-bold text-white shadow-lg shadow-rose-900/40 transition hover:bg-rose-500 active:scale-[0.98]"
          >
            <XCircle className="h-5 w-5" />
            <span>{t.emergencyCancelButton}</span>
          </button>

          {/* Secondary: Continue after verification */}
          <button
            onClick={() => {
              setEmergencyStopOpen(false);
              setScreen('confirm');
            }}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-xs font-semibold text-slate-300 transition hover:bg-slate-700"
          >
            <CheckCircle className="h-4 w-4 text-slate-400" />
            <span>{t.emergencyVerifyButton}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
