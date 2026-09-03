import React, { useState } from 'react';
import { useApp } from '../state/AppContext';
import { translations } from '../lib/i18n';
import { ArrowLeft, User, Phone, IndianRupee, ShieldCheck, AlertCircle } from 'lucide-react';

export const SendMoneyScreen: React.FC = () => {
  const { language, setScreen, draftPayment, updateDraft, executeRiskCheck } = useApp();
  const t = translations[language];

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleQuickContact = (name: string, phone: string, amount?: number) => {
    updateDraft({
      recipientName: name,
      phoneNumber: phone,
      amount: amount || draftPayment.amount || ''
    });
    setErrorMessage(null);
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftPayment.recipientName.trim()) {
      setErrorMessage(t.nameRequired);
      return;
    }

    const numAmount = typeof draftPayment.amount === 'number' 
      ? draftPayment.amount 
      : Number(draftPayment.amount);

    if (!numAmount || numAmount <= 0) {
      setErrorMessage(t.amountRequired);
      return;
    }

    const cleanPhone = draftPayment.phoneNumber.replace(/\D/g, '');
    if (cleanPhone && cleanPhone.length < 10) {
      setErrorMessage(t.phoneRequired);
      return;
    }

    // Run pure deterministic risk engine
    executeRiskCheck();
    setScreen('risk-check');
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-6">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setScreen('home')}
          className="flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t.back}</span>
        </button>

        <span className="text-xs font-semibold text-emerald-400">
          Step 1 of 4 • Details
        </span>
      </div>

      {/* Screen Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-white">{t.sendMoneyTitle}</h2>
        <p className="mt-1 text-xs text-slate-400">{t.sendMoneySubtitle}</p>
      </div>

      {/* Form Card */}
      <form onSubmit={handleContinue} className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
        {/* Recipient Name Field */}
        <div>
          <label htmlFor="recipient-name" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
            {t.recipientNameLabel} <span className="text-rose-400">*</span>
          </label>
          <div className="relative mt-1.5">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <User className="h-5 w-5" />
            </div>
            <input
              id="recipient-name"
              type="text"
              required
              value={draftPayment.recipientName}
              onChange={(e) => {
                updateDraft({ recipientName: e.target.value });
                setErrorMessage(null);
              }}
              placeholder={t.recipientNamePlaceholder}
              className="w-full rounded-xl border border-slate-700 bg-slate-800/90 py-3.5 pl-11 pr-4 text-sm font-medium text-white placeholder-slate-500 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        {/* Quick Pick Frequent Contacts */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400">{t.quickSelectKnown}</span>
          <div className="mt-1.5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleQuickContact('Priya Sharma', '98765 43210', 500)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/50"
            >
              <span>👤 Priya Sharma</span>
              <span className="rounded bg-emerald-500/20 px-1 text-[10px]">Freq: ₹500</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickContact('College Canteen', '91234 56789', 120)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/50"
            >
              <span>☕ College Canteen</span>
              <span className="rounded bg-emerald-500/20 px-1 text-[10px]">Freq: ₹120</span>
            </button>
          </div>
        </div>

        {/* Mobile Number Field */}
        <div>
          <label htmlFor="phone-number" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
            {t.phoneNumberLabel}
          </label>
          <div className="relative mt-1.5">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Phone className="h-5 w-5" />
            </div>
            <input
              id="phone-number"
              type="tel"
              value={draftPayment.phoneNumber}
              onChange={(e) => {
                updateDraft({ phoneNumber: e.target.value });
                setErrorMessage(null);
              }}
              placeholder={t.phoneNumberPlaceholder}
              className="w-full rounded-xl border border-slate-700 bg-slate-800/90 py-3.5 pl-11 pr-4 text-sm font-medium text-white placeholder-slate-500 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        {/* Amount Field */}
        <div>
          <label htmlFor="payment-amount" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
            {t.amountLabel} <span className="text-rose-400">*</span>
          </label>
          <div className="relative mt-1.5">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <IndianRupee className="h-5 w-5 font-bold" />
            </div>
            <input
              id="payment-amount"
              type="number"
              min="1"
              required
              value={draftPayment.amount === '' ? '' : draftPayment.amount}
              onChange={(e) => {
                const val = e.target.value === '' ? '' : Number(e.target.value);
                updateDraft({ amount: val });
                setErrorMessage(null);
              }}
              placeholder={t.amountPlaceholder}
              className="w-full rounded-xl border border-slate-700 bg-slate-800/90 py-3.5 pl-11 pr-4 text-base font-bold text-white placeholder-slate-500 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        {/* Error message if any */}
        {errorMessage && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Informational shield note */}
        <div className="flex items-center gap-2 rounded-xl bg-slate-800/60 p-3 text-xs text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>SafePay AI will analyze this recipient before asking for confirmation.</span>
        </div>

        {/* Submit / Trigger Safety Check CTA */}
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-4 text-base font-bold text-white shadow-lg shadow-emerald-900/30 transition hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98]"
        >
          <ShieldCheck className="h-5 w-5" />
          <span>{t.continueSafetyCheck}</span>
        </button>
      </form>
    </div>
  );
};
