import React, { useState } from 'react';
import { ArrowLeft, CircleAlert, QrCode, UserRound } from 'lucide-react';
import { QUICK_PAYEES } from '../lib/dummyData';
import { getPaymentReasonOptions, translations } from '../lib/i18n';
import { useApp } from '../state/AppContext';

export const SendMoneyScreen: React.FC = () => {
  const { availableBalance, draftPayment, history, language, setScreen, updateDraft } = useApp();
  const t = translations[language];
  const reasonOptions = getPaymentReasonOptions(language);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const quickPayees = QUICK_PAYEES.filter((payee) => payee.paymentType === draftPayment.paymentType);
  const knownContacts = history.filter((transaction, index, all) => transaction.direction === 'debit' && transaction.paymentType === 'p2p' && transaction.contactRelationship !== 'new' && all.findIndex((item) => item.recipientName === transaction.recipientName) === index);

  const handleQuickFill = (name: string, upiId: string, amount: number, reasonCode: string) => {
    updateDraft({
      recipientName: name,
      phoneNumber: upiId,
      amount,
      reasonCode: reasonCode as typeof draftPayment.reasonCode,
      customReason: ''
    });
    setErrorMessage(null);
  };

  const validateRecipient = () => {
    const phoneOrUpi = draftPayment.phoneNumber.trim();
    if (!draftPayment.recipientName.trim()) {
      return t.nameRequired;
    }

    const amount = typeof draftPayment.amount === 'number' ? draftPayment.amount : Number(draftPayment.amount);
    if (!amount || amount <= 0) {
      return t.amountRequired;
    }

    if (!draftPayment.reasonCode) {
      return t.reasonRequired;
    }

    if (draftPayment.reasonCode === 'other' && !draftPayment.customReason.trim()) {
      return t.reasonRequired;
    }

    const digitCount = phoneOrUpi.replace(/\D/g, '').length;
    if (!phoneOrUpi || (!phoneOrUpi.includes('@') && digitCount < 10)) {
      return t.phoneRequired;
    }

    if (amount > availableBalance) {
      return t.insufficientBalance;
    }

    return null;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const validationError = validateRecipient();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setScreen('confirm');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setScreen('home')}
          className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold"
          style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel-soft)', color: 'var(--sf-text-strong)' }}
        >
          <ArrowLeft className="h-4 w-4" />
          {t.back}
        </button>
        <div className="text-sm font-semibold" style={{ color: 'var(--sf-text-muted)' }}>
          {t.availableBalance}: Rs. {availableBalance.toLocaleString('en-IN')}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setScreen('scan-qr')}
        className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold"
        style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel-soft)', color: 'var(--sf-text-strong)' }}
      >
        <QrCode className="h-4 w-4" />
        {t.scanQrPay}
      </button>

      <section className="rounded-[28px] border p-6" style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel)' }}>
        <h2 className="text-2xl font-black" style={{ color: 'var(--sf-text-strong)' }}>
          {t.sendMoneyTitle}
        </h2>
        <p className="mt-2 text-sm leading-6" style={{ color: 'var(--sf-text-soft)' }}>
          {t.sendMoneySubtitle}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--sf-text-muted)' }}>
              {t.payeeType}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateDraft({ paymentType: 'p2p', recipientName: '', phoneNumber: '' })}
                className="rounded-2xl border px-4 py-3 text-sm font-bold transition"
                style={{
                  borderColor: 'var(--sf-border)',
                  background: draftPayment.paymentType === 'p2p' ? 'var(--sf-accent-gradient)' : 'var(--sf-panel-soft)',
                  color: draftPayment.paymentType === 'p2p' ? '#fff' : 'var(--sf-text-strong)'
                }}
              >
                {t.person}
              </button>
              <button
                type="button"
                onClick={() => updateDraft({ paymentType: 'merchant', recipientName: '', phoneNumber: '' })}
                className="rounded-2xl border px-4 py-3 text-sm font-bold transition"
                style={{
                  borderColor: 'var(--sf-border)',
                  background: draftPayment.paymentType === 'merchant' ? 'var(--sf-accent-gradient)' : 'var(--sf-panel-soft)',
                  color: draftPayment.paymentType === 'merchant' ? '#fff' : 'var(--sf-text-strong)'
                }}
              >
                {t.merchant}
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {draftPayment.paymentType === 'p2p' && knownContacts.map((contact) => (
              <button key={`known-${contact.recipientName}`} type="button" onClick={() => handleQuickFill(contact.recipientName, contact.phoneNumber, contact.amount, contact.reasonCode)} className="rounded-2xl border p-4 text-left" style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel-soft)' }}>
                <div className="text-base font-black" style={{ color: 'var(--sf-text-strong)' }}>{contact.recipientName}</div>
                <div className="mt-1 text-sm" style={{ color: 'var(--sf-text-muted)' }}>{contact.phoneNumber}</div>
                <div className="mt-3 text-xs font-semibold" style={{ color: 'var(--sf-success)' }}>Known contact</div>
              </button>
            ))}
            {quickPayees.map((payee) => (
              <button
                key={payee.upiId}
                type="button"
                onClick={() => handleQuickFill(payee.name, payee.upiId, payee.suggestedAmount, payee.defaultReasonCode)}
                className="rounded-2xl border p-4 text-left"
                style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel-soft)' }}
              >
                <div className="text-base font-black" style={{ color: 'var(--sf-text-strong)' }}>
                  {payee.name}
                </div>
                <div className="mt-1 text-sm" style={{ color: 'var(--sf-text-muted)' }}>
                  {payee.upiId}
                </div>
                <div className="mt-3 text-xs font-semibold" style={{ color: 'var(--sf-accent)' }}>
                  Rs. {payee.suggestedAmount.toLocaleString('en-IN')}
                </div>
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--sf-text-muted)' }}>
                {t.recipientNameLabel}
              </span>
              <input
                value={draftPayment.recipientName}
                onChange={(event) => {
                  updateDraft({ recipientName: event.target.value });
                  setErrorMessage(null);
                }}
                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-input)', color: 'var(--sf-text-strong)' }}
                placeholder={draftPayment.paymentType === 'p2p' ? 'Tilak' : 'Fresh Basket Store'}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--sf-text-muted)' }}>
                {t.phoneNumberLabel}
              </span>
              <input
                value={draftPayment.phoneNumber}
                onChange={(event) => {
                  updateDraft({ phoneNumber: event.target.value });
                  setErrorMessage(null);
                }}
                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-input)', color: 'var(--sf-text-strong)' }}
                placeholder={draftPayment.paymentType === 'p2p' ? 'tilak@safefinance' : 'merchant@upi'}
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--sf-text-muted)' }}>
                {t.amountLabel}
              </span>
              <input
                value={draftPayment.amount}
                onChange={(event) => {
                  updateDraft({
                    amount: event.target.value === '' ? '' : Number(event.target.value)
                  });
                  setErrorMessage(null);
                }}
                type="number"
                min="1"
                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-input)', color: 'var(--sf-text-strong)' }}
                placeholder="5000"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--sf-text-muted)' }}>
                {t.reasonLabel}
              </span>
              <select
                value={draftPayment.reasonCode}
                onChange={(event) => {
                  updateDraft({ reasonCode: event.target.value as typeof draftPayment.reasonCode, customReason: '' });
                  setErrorMessage(null);
                }}
                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-input)', color: 'var(--sf-text-strong)' }}
              >
                <option value="">{t.selectReason}</option>
                {reasonOptions.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {draftPayment.reasonCode === 'other' && (
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--sf-text-muted)' }}>
                {t.customReasonLabel}
              </span>
              <input
                value={draftPayment.customReason}
                onChange={(event) => updateDraft({ customReason: event.target.value })}
                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-input)', color: 'var(--sf-text-strong)' }}
                placeholder={t.customReasonPlaceholder}
              />
            </label>
          )}

          {errorMessage && (
            <div className="rounded-2xl border px-4 py-3 text-sm font-medium" style={{ borderColor: 'rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.08)', color: 'var(--sf-danger)' }}>
              <span className="inline-flex items-center gap-2">
                <CircleAlert className="h-4 w-4" />
                {errorMessage}
              </span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="rounded-full px-6 py-3 text-sm font-black text-white"
              style={{ background: 'var(--sf-accent-gradient)' }}
            >
              {t.continueToConfirm}
            </button>
            <div className="inline-flex items-center gap-2 text-sm" style={{ color: 'var(--sf-text-muted)' }}>
              <UserRound className="h-4 w-4" />
              {t.demoUpiPinHint}
            </div>
          </div>
        </form>
      </section>
    </div>
  );
};
