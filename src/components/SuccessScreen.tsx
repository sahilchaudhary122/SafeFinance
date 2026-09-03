import React, { useEffect } from 'react';
import { useApp } from '../state/AppContext';
import { translations } from '../lib/i18n';
import confetti from 'canvas-confetti';
import { CheckCircle, ShieldCheck, History, Home, Info, ArrowRight } from 'lucide-react';

export const SuccessScreen: React.FC = () => {
  const { language, setScreen, lastTransaction, resetDraft } = useApp();
  const t = translations[language];

  // Fire celebratory confetti on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
  }, []);

  const handleDone = () => {
    resetDraft();
    setScreen('home');
  };

  const handleViewHistory = () => {
    resetDraft();
    setScreen('history');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-6 text-center">
      {/* Clear Mandatory Simulated Prototype Notice Banner */}
      <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-[11px] font-bold tracking-wider text-amber-300">
        <Info className="h-3.5 w-3.5" />
        <span>{t.prototypeBadge}</span>
      </div>

      {/* Success Badge & Animated Check */}
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-2xl shadow-emerald-500/30 animate-scaleUp">
        <CheckCircle className="h-14 w-14 stroke-[2.5]" />
      </div>

      {/* Title & Amount */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-white">{t.paymentSuccessful}</h2>
        <p className="mt-1 text-xs text-slate-400">{t.successSubtitle}</p>
        <div className="mt-4 text-4xl sm:text-5xl font-black text-emerald-400 tracking-tight">
          ₹{lastTransaction?.amount.toLocaleString('en-IN') || '0'}
        </div>
      </div>

      {/* Receipt Details Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 text-left shadow-xl space-y-3.5">
        <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-800">
          <span className="text-slate-400">{t.transactionId}</span>
          <span className="font-mono font-bold text-emerald-400">{lastTransaction?.id || 'SAFE829102'}</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">{t.paidTo}</span>
          <span className="font-bold text-white text-sm">{lastTransaction?.recipientName || 'Payee'}</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">{t.mobileNumber}</span>
          <span className="font-medium text-slate-200">{lastTransaction?.phoneNumber || '98765 43210'}</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">{t.time}</span>
          <span className="text-slate-300">{lastTransaction?.timestamp || 'Today'}</span>
        </div>

        <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800">
          <span className="text-slate-400">SafePay Safety Status</span>
          <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Passed AI Safety Checks</span>
          </span>
        </div>
      </div>

      <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
        {t.simulatedBadgeNotice}
      </p>

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <button
          onClick={handleDone}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-4 text-base font-bold text-white shadow-xl shadow-emerald-950/40 transition hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98]"
        >
          <Home className="h-5 w-5" />
          <span>{t.done}</span>
        </button>

        <button
          onClick={handleViewHistory}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 py-3 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
        >
          <History className="h-4 w-4" />
          <span>{t.viewHistory}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
