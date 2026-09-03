import React from 'react';
import { useApp } from '../state/AppContext';
import { translations } from '../lib/i18n';
import { X, ShieldAlert, KeyRound, ArrowDownLeft, PhoneOff, UserCheck, CheckCircle2 } from 'lucide-react';

export const StaySafeModal: React.FC = () => {
  const { language, staySafeOpen, setStaySafeOpen } = useApp();
  const t = translations[language];

  if (!staySafeOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fadeIn">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="stay-safe-title"
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 p-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h2 id="stay-safe-title" className="text-lg font-bold text-white">{t.staySafeTitle}</h2>
              <p className="text-xs text-slate-400">{t.staySafeSubtitle}</p>
            </div>
          </div>
          <button
            onClick={() => setStaySafeOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content list of 5 essential rules */}
        <div className="max-h-[70vh] space-y-3.5 overflow-y-auto p-5 text-sm">
          {/* Tip 1 */}
          <div className="flex gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3.5">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400">
              <KeyRound className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-rose-200">1. {t.tip1Title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-rose-300/80">{t.tip1Desc}</p>
            </div>
          </div>

          {/* Tip 2 */}
          <div className="flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3.5">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
              <ArrowDownLeft className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-amber-200">2. {t.tip2Title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-amber-300/80">{t.tip2Desc}</p>
            </div>
          </div>

          {/* Tip 3 */}
          <div className="flex gap-3 rounded-xl border border-purple-500/20 bg-purple-500/10 p-3.5">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400">
              <PhoneOff className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-purple-200">3. {t.tip3Title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-purple-300/80">{t.tip3Desc}</p>
            </div>
          </div>

          {/* Tip 4 */}
          <div className="flex gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <UserCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-emerald-200">4. {t.tip4Title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-emerald-300/80">{t.tip4Desc}</p>
            </div>
          </div>

          {/* Tip 5 */}
          <div className="flex gap-3 rounded-xl border border-sky-500/20 bg-sky-500/10 p-3.5">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-sky-200">5. {t.tip5Title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-sky-300/80">{t.tip5Desc}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 bg-slate-950/60 p-4">
          <button
            onClick={() => setStaySafeOpen(false)}
            className="w-full rounded-xl bg-slate-800 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
