import React from 'react';
import { useApp } from '../state/AppContext';
import { translations } from '../lib/i18n';
import { Send, QrCode, History, Shield, ArrowRight, AlertTriangle, ShieldCheck } from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const { language, setScreen, history, setStaySafeOpen } = useApp();
  const t = translations[language];

  // Recent 2 transactions for preview
  const recentTransactions = history.slice(0, 2);

  return (
    <div className="space-y-6 animate-fadeIn pb-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-b from-emerald-950/40 via-slate-900/80 to-slate-900 p-6 text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
          <Shield className="h-9 w-9 stroke-[2.2]" />
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          {t.appTitle}
        </h1>
        
        <p className="mx-auto mt-2 max-w-sm text-sm sm:text-base font-medium text-emerald-200/90 leading-snug">
          "{t.appSubtitle}"
        </p>

        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
          <span>{t.tagline}</span>
        </div>
      </div>

      {/* Primary Action: Send Money (Very prominent, large tap target) */}
      <div className="space-y-3">
        <button
          onClick={() => setScreen('send')}
          className="group relative flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-left text-white shadow-xl shadow-emerald-900/30 transition-all hover:scale-[1.01] hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-emerald-500/30"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md">
              <Send className="h-7 w-7 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight">{t.sendMoney}</div>
              <div className="text-xs text-emerald-100/80">AI Safety Check active before every transfer</div>
            </div>
          </div>
          <ArrowRight className="h-6 w-6 text-emerald-200 transition-transform group-hover:translate-x-1" />
        </button>

        {/* Secondary Actions: Scan QR & Transaction History */}
        <div className="grid grid-cols-2 gap-3">
          {/* Scan QR (Stub / Coming Soon) */}
          <div className="relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-4 opacity-75">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-400">
                  <QrCode className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
                  Coming Soon
                </span>
              </div>
              <div className="mt-3 text-sm font-bold text-slate-300">
                {t.scanQr.split('(')[0]}
              </div>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">Camera QR safety scan</p>
          </div>

          {/* Transaction History Button */}
          <button
            onClick={() => setScreen('history')}
            className="flex flex-col justify-between rounded-2xl border border-slate-700/80 bg-slate-900/90 p-4 text-left transition hover:border-slate-600 hover:bg-slate-800/80 active:scale-[0.98]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-emerald-400">
              <History className="h-5 w-5" />
            </div>
            <div className="mt-3">
              <div className="text-sm font-bold text-white">{t.history}</div>
              <p className="mt-0.5 text-[11px] text-slate-400">{history.length} logged payments</p>
            </div>
          </button>
        </div>
      </div>

      {/* Stay Safe Educational Teaser Card */}
      <div 
        onClick={() => setStaySafeOpen(true)}
        className="cursor-pointer rounded-2xl border border-amber-500/20 bg-amber-950/20 p-4 transition hover:border-amber-500/40 hover:bg-amber-950/30"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
            <AlertTriangle className="h-4 w-4" />
            <span>{t.staySafeTitle}</span>
          </div>
          <span className="text-xs font-semibold text-amber-400 underline">Open Guide</span>
        </div>
        <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
          Never enter your UPI PIN to receive money. Tap here to review the 5 safety rules.
        </p>
      </div>

      {/* Recent Protected Payments Preview */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {t.recentActivity}
          </span>
          <button
            onClick={() => setScreen('history')}
            className="text-xs font-semibold text-emerald-400 hover:underline"
          >
            {t.viewAllHistory} →
          </button>
        </div>

        <div className="mt-3 divide-y divide-slate-800/60">
          {recentTransactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 font-bold text-sm">
                  {tx.recipientName.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{tx.recipientName}</div>
                  <div className="text-xs text-slate-400">{tx.timestamp}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-white">₹{tx.amount.toLocaleString('en-IN')}</div>
                <div className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                  <ShieldCheck className="h-3 w-3" />
                  <span>{tx.status === 'safe' ? t.safeBadge : t.reviewedBadge}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
