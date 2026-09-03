import React from 'react';
import { useApp } from '../state/AppContext';
import { translations } from '../lib/i18n';
import { ArrowLeft, KeyRound, CheckCircle2, User, Phone } from 'lucide-react';

export const ConfirmationScreen: React.FC = () => {
  const { language, setScreen, draftPayment, completeSimulatedPayment } = useApp();
  const t = translations[language];

  const amountFormatted = Number(draftPayment.amount).toLocaleString('en-IN');

  const handleConfirm = () => {
    completeSimulatedPayment();
    setScreen('success');
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setScreen('explain')}
          className="flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t.back}</span>
        </button>

        <span className="text-xs font-semibold text-emerald-400">
          Step 4 of 4 • Confirmation
        </span>
      </div>

      {/* Screen Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-white">{t.confirmTitle}</h2>
        <p className="mt-0.5 text-xs text-slate-400">{t.confirmSubtitle}</p>
      </div>

      {/* Transfer Review Summary Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl space-y-4">
        <div className="text-center pb-4 border-b border-slate-800">
          <span className="text-xs font-semibold text-slate-400">{t.amountToPay}</span>
          <div className="mt-1 text-3xl sm:text-4xl font-black text-white tracking-tight">
            ₹{amountFormatted}
          </div>
        </div>

        <div className="space-y-3 text-sm">
          {/* Receiver */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2 text-slate-400">
              <User className="h-4 w-4" />
              <span>{t.payingTo}</span>
            </div>
            <span className="font-bold text-white text-base">{draftPayment.recipientName}</span>
          </div>

          {/* Phone */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2 text-slate-400">
              <Phone className="h-4 w-4" />
              <span>{t.mobileNumber}</span>
            </div>
            <span className="font-medium text-slate-200">{draftPayment.phoneNumber || '98765 43210'}</span>
          </div>

          {/* Safety Check Status */}
          <div className="flex items-center justify-between py-1">
            <span className="text-slate-400">SafePay AI Audit</span>
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/20">
              Verified & Approved
            </span>
          </div>
        </div>
      </div>

      {/* Crucial Educational Reminder Banner */}
      <div className="rounded-2xl border-2 border-amber-500/40 bg-amber-950/25 p-4 space-y-2">
        <div className="flex items-center gap-2 text-amber-300 font-bold text-xs sm:text-sm">
          <KeyRound className="h-4 w-4 text-amber-400 shrink-0" />
          <span>{t.upiPinReminderTitle}</span>
        </div>
        <p className="text-xs text-amber-200/90 leading-relaxed font-medium">
          "{t.upiPinReminder}"
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <button
          onClick={handleConfirm}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-4 text-base font-bold text-white shadow-xl shadow-emerald-950/40 transition hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98]"
        >
          <CheckCircle2 className="h-5 w-5" />
          <span>{t.confirmPayButton.replace('{amount}', amountFormatted)}</span>
        </button>

        <button
          onClick={() => setScreen('explain')}
          className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-3 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
        >
          {t.goBackEdit}
        </button>
      </div>
    </div>
  );
};
