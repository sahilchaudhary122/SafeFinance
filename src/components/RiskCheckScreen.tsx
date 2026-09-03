import React, { useState, useEffect } from 'react';
import { useApp } from '../state/AppContext';
import { translations } from '../lib/i18n';
import { ShieldCheck, AlertTriangle, AlertCircle, ArrowRight, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';

export const RiskCheckScreen: React.FC = () => {
  const { language, setScreen, draftPayment, riskResult } = useApp();
  const t = translations[language];

  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [scanStep, setScanStep] = useState<number>(1);

  // 1.5s simulated scan steps
  useEffect(() => {
    setIsScanning(true);
    setScanStep(1);

    const timer1 = setTimeout(() => {
      setScanStep(2);
    }, 600);

    const timer2 = setTimeout(() => {
      setScanStep(3);
    }, 1100);

    const timer3 = setTimeout(() => {
      setIsScanning(false);
    }, 1600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [draftPayment]);

  const level = riskResult?.level || 'low';

  // Localized reason lines from riskEngine
  const localizedReasons = riskResult?.reasonDetails.map((detail) => {
    if (language === 'ta') return detail.textTa;
    if (language === 'hi') return detail.textHi;
    return detail.textEn;
  }) || riskResult?.reasons || [];

  return (
    <div className="space-y-5 animate-fadeIn pb-6">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setScreen('send')}
          className="flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t.back}</span>
        </button>

        <span className="text-xs font-semibold text-emerald-400">
          Step 2 of 4 • AI Safety Scan
        </span>
      </div>

      {isScanning ? (
        /* Animated Scanning State (1.5 sec) */
        <div className="rounded-3xl border border-emerald-500/30 bg-slate-900/90 p-8 text-center shadow-2xl space-y-6">
          <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
            {/* Pulsing radar rings */}
            <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20 duration-1000" />
            <div className="absolute inset-2 animate-pulse rounded-full bg-emerald-500/30" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-xl shadow-emerald-500/30">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-black text-white">{t.checkingSafetyTitle}</h2>
            <p className="mt-1 text-xs text-slate-400 max-w-xs mx-auto">{t.checkingSafetySubtitle}</p>
          </div>

          {/* Stepped progress indicators */}
          <div className="space-y-2.5 max-w-xs mx-auto text-left text-xs">
            <div className={`flex items-center gap-2 transition-opacity ${scanStep >= 1 ? 'opacity-100 text-emerald-300' : 'opacity-40 text-slate-400'}`}>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Verifying recipient familiarity...</span>
            </div>
            <div className={`flex items-center gap-2 transition-opacity ${scanStep >= 2 ? 'opacity-100 text-emerald-300' : 'opacity-40 text-slate-400'}`}>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Evaluating typical payment amounts...</span>
            </div>
            <div className={`flex items-center gap-2 transition-opacity ${scanStep >= 3 ? 'opacity-100 text-emerald-300' : 'opacity-40 text-slate-400'}`}>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Checking transfer velocity & fraud flags...</span>
            </div>
          </div>
        </div>
      ) : (
        /* Safety Result Card (Informational) */
        <div className="space-y-5 animate-fadeIn">
          <div
            className={`rounded-3xl border p-6 text-center shadow-2xl transition-all ${
              level === 'high'
                ? 'border-rose-500/40 bg-gradient-to-b from-rose-950/40 via-slate-900 to-slate-900'
                : level === 'medium'
                ? 'border-amber-500/40 bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-900'
                : 'border-emerald-500/40 bg-gradient-to-b from-emerald-950/40 via-slate-900 to-slate-900'
            }`}
          >
            {/* Risk Badge Icon */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl shadow-xl">
              {level === 'high' && (
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-600 text-white shadow-rose-900/50">
                  <AlertCircle className="h-10 w-10 animate-pulse" />
                </div>
              )}
              {level === 'medium' && (
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-500 text-slate-950 shadow-amber-900/50">
                  <AlertTriangle className="h-10 w-10" />
                </div>
              )}
              {level === 'low' && (
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500 text-white shadow-emerald-900/50">
                  <ShieldCheck className="h-10 w-10" />
                </div>
              )}
            </div>

            {/* Level Label */}
            <div className="mt-4">
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${
                  level === 'high'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : level === 'medium'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {level === 'high' && '🔴 ' + t.highRiskTitle}
                {level === 'medium' && '🟠 ' + t.mediumRiskTitle}
                {level === 'low' && '🟢 ' + t.lowRiskTitle}
              </span>
            </div>

            {/* Payment Summary */}
            <h2 className="mt-4 text-xl font-bold text-white">
              ₹{Number(draftPayment.amount).toLocaleString('en-IN')} to {draftPayment.recipientName}
            </h2>

            {/* Plain language findings */}
            <div className="mt-4 rounded-2xl bg-slate-950/70 p-4 text-left border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Safety Findings:
              </span>
              {localizedReasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs font-medium text-slate-200">
                  <span className="mt-0.5 text-base leading-none">
                    {level === 'high' ? '⚠️' : level === 'medium' ? 'ℹ️' : '✓'}
                  </span>
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Informational distinction notice */}
          <div className="rounded-xl bg-slate-800/60 p-3 text-center text-xs text-slate-400">
            Screen 3 shows what our safety scan found. Click below to review the explanation and make your decision.
          </div>

          {/* CTA: Proceed to Decision Screen 4 */}
          <button
            onClick={() => setScreen('explain')}
            className={`w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold text-white shadow-xl transition active:scale-[0.98] ${
              level === 'high'
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/50'
                : level === 'medium'
                ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-950/50'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/50'
            }`}
          >
            <span>{t.proceedToExplanation}</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};
