import React, { useEffect, useState } from 'react';
import { ArrowLeft, Fingerprint, KeyRound, ShieldAlert } from 'lucide-react';
import { DEMO_UPI_PIN } from '../lib/config';
import { getPaymentReasonLabel, translations } from '../lib/i18n';
import { useApp } from '../state/AppContext';
import { BiometricAuthModal } from './BiometricAuthModal';

export const ConfirmationScreen: React.FC = () => {
  const {
    availableBalance,
    completeSimulatedPayment,
    draftPayment,
    executeRiskCheck,
    history,
    language,
    requiresBiometricForDraft,
    setScreen
  } = useApp();
  const t = translations[language];
  const [upiPin, setUpiPin] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [approvalMethod, setApprovalMethod] = useState<'upi-pin' | 'biometric'>('upi-pin');
  const [newContactConfirmed, setNewContactConfirmed] = useState(false);

  const amount = typeof draftPayment.amount === 'number' ? draftPayment.amount : Number(draftPayment.amount) || 0;
  const previousPayments = history.filter(
    (transaction) =>
      transaction.direction === 'debit' &&
      transaction.paymentType === 'p2p' &&
      transaction.recipientName.trim().toLowerCase() === draftPayment.recipientName.trim().toLowerCase()
  ).length;
  const isNewContact = draftPayment.paymentType === 'p2p' && previousPayments <= 3;

  useEffect(() => {
    setNewContactConfirmed(false);
  }, [draftPayment.recipientName, draftPayment.phoneNumber]);
  const reasonLabel =
    draftPayment.reasonCode === 'other'
      ? draftPayment.customReason.trim() || t.paymentReasonOtherFallback
      : draftPayment.reasonCode
      ? getPaymentReasonLabel(draftPayment.reasonCode, language)
      : '-';

  const finishPayment = () => {
    try {
      completeSimulatedPayment();
      setAuthModalOpen(false);
      setScreen('success');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Payment failed.');
    }
  };

  const validateUpiPin = () => {
    if (!/^\d{4}$/.test(upiPin)) {
      setErrorMessage(t.pinRequired);
      return false;
    }

    if (upiPin !== DEMO_UPI_PIN) {
      setErrorMessage(t.pinIncorrect);
      return false;
    }

    setErrorMessage(null);
    return true;
  };

  const handlePayment = () => {
    if (isNewContact && !newContactConfirmed) {
      setErrorMessage('Please confirm that you are paying this person for the first time.');
      return;
    }

    if (requiresBiometricForDraft) {
      if (!validateUpiPin()) return;
      setAuthModalOpen(true);
      return;
    }

    if (approvalMethod === 'biometric') {
      setErrorMessage(null);
      setAuthModalOpen(true);
      return;
    }

    if (!validateUpiPin()) return;
    finishPayment();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setScreen('send')}
          className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold"
          style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel-soft)', color: 'var(--sf-text-strong)' }}
        >
          <ArrowLeft className="h-4 w-4" />
          {t.back}
        </button>
      </div>

      <section className="rounded-[28px] border p-6" style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel)' }}>
        <h2 className="text-2xl font-black" style={{ color: 'var(--sf-text-strong)' }}>
          {t.confirmTitle}
        </h2>
        <p className="mt-2 text-sm leading-6" style={{ color: 'var(--sf-text-soft)' }}>
          {t.confirmSubtitle}
        </p>

        <div className="mt-6 rounded-[24px] border p-5" style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel-soft)' }}>
          <div className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: 'var(--sf-text-muted)' }}>
            {t.amountToPay}
          </div>
          <div className="mt-3 text-4xl font-black" style={{ color: 'var(--sf-text-strong)' }}>
            Rs. {amount.toLocaleString('en-IN')}
          </div>

          <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <div style={{ color: 'var(--sf-text-muted)' }}>{t.payingTo}</div>
              <div className="mt-1 font-bold" style={{ color: 'var(--sf-text-strong)' }}>
                {draftPayment.recipientName}
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--sf-text-muted)' }}>{t.mobileNumber}</div>
              <div className="mt-1 font-bold" style={{ color: 'var(--sf-text-strong)' }}>
                {draftPayment.phoneNumber}
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--sf-text-muted)' }}>{t.paymentType}</div>
              <div className="mt-1 font-bold" style={{ color: 'var(--sf-text-strong)' }}>
                {draftPayment.paymentType === 'p2p' ? t.transactionTypePerson : t.transactionTypeMerchant}
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--sf-text-muted)' }}>{t.paymentReason}</div>
              <div className="mt-1 font-bold" style={{ color: 'var(--sf-text-strong)' }}>
                {reasonLabel}
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--sf-text-muted)' }}>{t.currentBalance}</div>
              <div className="mt-1 font-bold" style={{ color: 'var(--sf-text-strong)' }}>
                Rs. {availableBalance.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>

        {draftPayment.paymentType === 'p2p' && (
          <div className="mt-4 rounded-[24px] border px-4 py-4 text-sm leading-6" style={{ borderColor: 'var(--sf-border)', background: 'rgba(14,165,233,0.08)', color: 'var(--sf-text-soft)' }}>
            {t.settlementDelayNote}
          </div>
        )}

        {isNewContact && (
          <div className="mt-4 rounded-[24px] border-2 p-4" style={{ borderColor: 'var(--sf-info)', background: 'var(--sf-accent-soft)' }} role="alert">
            <div className="text-sm font-black" style={{ color: 'var(--sf-text-strong)' }}>New recipient confirmation</div>
            <p className="mt-2 text-sm leading-6" style={{ color: 'var(--sf-text-soft)' }}>
              {previousPayments === 0
                ? `${draftPayment.recipientName} is not in your payment contacts. This is your first payment to this person.`
                : `You have made ${previousPayments} payment${previousPayments === 1 ? '' : 's'} to ${draftPayment.recipientName} before. This person is not a known contact yet; more than 3 payments are required.`} Check the name, UPI ID, and amount before continuing.
            </p>
            <label className="mt-3 flex items-start gap-3 text-sm font-semibold" style={{ color: 'var(--sf-text-strong)' }}>
              <input type="checkbox" checked={newContactConfirmed} onChange={(event) => { setNewContactConfirmed(event.target.checked); setErrorMessage(null); }} className="mt-0.5 h-4 w-4" />
              I confirm that I want to pay this new person.
            </label>
          </div>
        )}

        {requiresBiometricForDraft && (
          <div className="mt-4 rounded-[24px] border px-4 py-4 text-sm leading-6" style={{ borderColor: 'rgba(245,158,11,0.28)', background: 'rgba(245,158,11,0.1)', color: 'var(--sf-text-strong)' }}>
            <div className="inline-flex items-center gap-2 font-bold">
              <ShieldAlert className="h-4 w-4" />
              {t.highValueSecurity}
            </div>
            <p className="mt-2" style={{ color: 'var(--sf-text-soft)' }}>
              {t.biometricRequired}
            </p>
          </div>
        )}

        {!requiresBiometricForDraft && (
          <div className="mt-5 rounded-[24px] border p-4" style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel-soft)' }}>
            <div className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--sf-text-muted)' }}>
              {t.paymentApproval}
            </div>
            <p className="mt-2 text-sm leading-6" style={{ color: 'var(--sf-text-soft)' }}>
              {t.chooseApprovalMethod}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setApprovalMethod('upi-pin');
                  setErrorMessage(null);
                }}
                className="rounded-2xl border px-3 py-3 text-sm font-bold"
                style={{
                  borderColor: 'var(--sf-border)',
                  background: approvalMethod === 'upi-pin' ? 'var(--sf-accent-gradient)' : 'var(--sf-panel)',
                  color: approvalMethod === 'upi-pin' ? '#fff' : 'var(--sf-text-strong)'
                }}
              >
                <span className="inline-flex items-center gap-2">
                  <KeyRound className="h-4 w-4" />
                  {t.authWithUpiPin}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setApprovalMethod('biometric');
                  setErrorMessage(null);
                }}
                className="rounded-2xl border px-3 py-3 text-sm font-bold"
                style={{
                  borderColor: 'var(--sf-border)',
                  background: approvalMethod === 'biometric' ? 'var(--sf-accent-gradient)' : 'var(--sf-panel)',
                  color: approvalMethod === 'biometric' ? '#fff' : 'var(--sf-text-strong)'
                }}
              >
                <span className="inline-flex items-center gap-2">
                  <Fingerprint className="h-4 w-4" />
                  {t.authWithBiometrics}
                </span>
              </button>
            </div>
          </div>
        )}

        {(requiresBiometricForDraft || approvalMethod === 'upi-pin') && (
          <div className="mt-5">
          <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--sf-text-muted)' }}>
            {t.upiPin}
          </label>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-4 top-3.5 h-4 w-4" style={{ color: 'var(--sf-text-muted)' }} />
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={upiPin}
              onChange={(event) => {
                setUpiPin(event.target.value.replace(/\D/g, '').slice(0, 4));
                setErrorMessage(null);
              }}
              className="w-full rounded-2xl border py-3 pl-11 pr-4 text-sm outline-none"
              style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-input)', color: 'var(--sf-text-strong)' }}
              placeholder={t.enterUpiPin}
            />
          </div>
          <div className="mt-2 text-xs" style={{ color: 'var(--sf-text-muted)' }}>
            {t.demoUpiPinHint}
          </div>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 rounded-2xl border px-4 py-3 text-sm font-medium" style={{ borderColor: 'rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.08)', color: 'var(--sf-danger)' }}>
            {errorMessage}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handlePayment}
            className="rounded-full px-6 py-3 text-sm font-black text-white"
            style={{ background: 'var(--sf-accent-gradient)' }}
          >
            {requiresBiometricForDraft
              ? t.payWithMfa
              : approvalMethod === 'biometric'
              ? t.authWithBiometrics
              : t.payNow}
          </button>

          <button
            type="button"
            onClick={() => {
              executeRiskCheck();
              setScreen('risk-check');
            }}
            className="rounded-full border px-5 py-3 text-sm font-bold"
            style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel-soft)', color: 'var(--sf-text-strong)' }}
          >
            {t.viewRiskAnalysis}
          </button>
        </div>
      </section>

      <BiometricAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={finishPayment}
        isMfa={requiresBiometricForDraft}
      />
    </div>
  );
};
