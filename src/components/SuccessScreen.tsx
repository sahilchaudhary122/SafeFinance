import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, History, Home, Info, X } from 'lucide-react';
import { translations } from '../lib/i18n';
import { useApp } from '../state/AppContext';

export const SuccessScreen: React.FC = () => {
  const { language, lastTransaction, resetDraft, setScreen, setShowSuccessPopup, showSuccessPopup } = useApp();
  const t = translations[language];

  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.65 }
      });
    } catch {
      // Ignore animation failures.
    }
  }, []);

  if (!lastTransaction) {
    return null;
  }

  const handleDone = () => {
    setShowSuccessPopup(false);
    resetDraft();
    setScreen('home');
  };

  const handleHistory = () => {
    setShowSuccessPopup(false);
    resetDraft();
    setScreen('history');
  };

  return (
    <div className="space-y-5">
      {showSuccessPopup && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-sm rounded-[28px] border p-6 shadow-2xl" style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel)' }}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-black" style={{ color: 'var(--sf-text-strong)' }}>
                  {t.successPopupTitle}
                </div>
                <p className="mt-2 text-sm leading-6" style={{ color: 'var(--sf-text-soft)' }}>
                  {t.successPopupText}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSuccessPopup(false)}
                className="rounded-full p-2"
                style={{ background: 'var(--sf-panel-soft)', color: 'var(--sf-text-muted)' }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 rounded-2xl border p-4 text-sm" style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel-soft)', color: 'var(--sf-text-strong)' }}>
              {t.transactionId}: <span className="font-mono font-bold">{lastTransaction.id}</span>
            </div>
          </div>
        </div>
      )}

      <section className="rounded-[28px] border p-6 text-center" style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel)' }}>
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] text-white shadow-xl" style={{ background: 'var(--sf-accent-gradient)' }}>
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h2 className="mt-5 text-3xl font-black" style={{ color: 'var(--sf-text-strong)' }}>
          {t.successTitle}
        </h2>
        <p className="mt-2 text-sm leading-6" style={{ color: 'var(--sf-text-soft)' }}>
          {t.successSubtitle}
        </p>
        <div className="mt-4 text-4xl font-black" style={{ color: 'var(--sf-text-strong)' }}>
          Rs. {lastTransaction.amount.toLocaleString('en-IN')}
        </div>
      </section>

      <section className="rounded-[28px] border p-6" style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel)' }}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: 'var(--sf-text-muted)' }}>
              {t.transactionId}
            </div>
            <div className="mt-2 font-mono text-lg font-black" style={{ color: 'var(--sf-text-strong)' }}>
              {lastTransaction.id}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: 'var(--sf-text-muted)' }}>
              {t.status}
            </div>
            <div className="mt-2 text-lg font-black" style={{ color: 'var(--sf-text-strong)' }}>
              {lastTransaction.paymentType === 'merchant' ? t.merchantPaid : t.debitCompleted}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: 'var(--sf-text-muted)' }}>
              {t.payingTo}
            </div>
            <div className="mt-2 text-lg font-black" style={{ color: 'var(--sf-text-strong)' }}>
              {lastTransaction.recipientName}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: 'var(--sf-text-muted)' }}>
              {t.paymentReason}
            </div>
            <div className="mt-2 text-lg font-black" style={{ color: 'var(--sf-text-strong)' }}>
              {lastTransaction.reason}
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-[24px] border px-4 py-4 text-sm leading-6" style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel-soft)', color: 'var(--sf-text-soft)' }}>
          <div className="inline-flex items-center gap-2 font-bold" style={{ color: 'var(--sf-text-strong)' }}>
            <Info className="h-4 w-4" />
            {t.receiverDelayLabel}
          </div>
          <p className="mt-2">
            {lastTransaction.paymentType === 'p2p'
              ? t.senderSettlementPending
              : t.merchantSettlementComplete}
          </p>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleDone}
          className="rounded-full px-6 py-3 text-sm font-black text-white"
          style={{ background: 'var(--sf-accent-gradient)' }}
        >
          <span className="inline-flex items-center gap-2">
            <Home className="h-4 w-4" />
            {t.done}
          </span>
        </button>
        <button
          type="button"
          onClick={handleHistory}
          className="rounded-full border px-6 py-3 text-sm font-black"
          style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel-soft)', color: 'var(--sf-text-strong)' }}
        >
          <span className="inline-flex items-center gap-2">
            <History className="h-4 w-4" />
            {t.viewHistory}
          </span>
        </button>
      </div>
    </div>
  );
};
