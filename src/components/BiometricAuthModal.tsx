import React, { useEffect, useState } from 'react';
import { CheckCircle2, Fingerprint, ScanFace, ShieldCheck, TriangleAlert, X } from 'lucide-react';
import {
  authenticateWithBiometrics,
  checkBiometricSupport,
  registerBiometrics,
  type BiometricCheckResult
} from '../lib/biometrics';
import { useApp } from '../state/AppContext';

interface BiometricAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isMfa: boolean;
}

export const BiometricAuthModal: React.FC<BiometricAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  isMfa
}) => {
  const { currentUser, draftPayment } = useApp();
  const [supportInfo, setSupportInfo] = useState<BiometricCheckResult>({
    isSupported: true,
    isPlatformAvailable: true,
    isRegistered: false
  });
  const [status, setStatus] = useState<'idle' | 'working' | 'fallback' | 'error' | 'success'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setStatus('idle');
    setMessage(null);
    checkBiometricSupport(currentUser?.username).then((result) => {
      setSupportInfo(result);
    });
  }, [currentUser?.username, isOpen]);

  if (!isOpen) {
    return null;
  }

  const amount = typeof draftPayment.amount === 'number' ? draftPayment.amount : Number(draftPayment.amount) || 0;

  const markSuccess = () => {
    setStatus('success');
    setTimeout(() => {
      onSuccess();
    }, 700);
  };

  const startBiometricFlow = async () => {
    setStatus('working');
    setMessage(null);

    if (!supportInfo.isSupported || !supportInfo.isPlatformAvailable) {
      setStatus('fallback');
      setMessage('Device biometrics are not available here, so you can finish with a demo face or fingerprint approval.');
      return;
    }

    if (!supportInfo.isRegistered) {
      const registration = await registerBiometrics(currentUser?.username || 'payment@safefinance.local');
      if (!registration.success) {
        setStatus('fallback');
        setMessage(registration.error || 'Biometric setup was not completed.');
        return;
      }
    }

    const result = await authenticateWithBiometrics(currentUser?.username);
    if (result.success) {
      markSuccess();
      return;
    }

    setStatus('fallback');
    setMessage(result.error || 'Biometric verification was not completed.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4">
      <div className="w-full max-w-md rounded-[28px] border p-6 shadow-2xl" style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel)' }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-black" style={{ color: 'var(--sf-text-strong)' }}>
              High-value payment approval
            </div>
            <p className="mt-2 text-sm leading-6" style={{ color: 'var(--sf-text-soft)' }}>
              Confirm Rs. {amount.toLocaleString('en-IN')} to {draftPayment.recipientName} with fingerprint or face verification.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2"
            style={{ background: 'var(--sf-panel-soft)', color: 'var(--sf-text-muted)' }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 rounded-[24px] border p-5" style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel-soft)' }}>
          <div className="inline-flex items-center gap-2 text-sm font-bold" style={{ color: 'var(--sf-text-strong)' }}>
            <ShieldCheck className="h-4 w-4" />
            {isMfa ? 'UPI PIN step already completed' : 'Biometric payment approval'}
          </div>
          <div className="mt-2 text-sm leading-6" style={{ color: 'var(--sf-text-soft)' }}>
            {isMfa
              ? 'Final step: approve with device biometrics. If the browser cannot open a real prompt, a demo fallback is available.'
              : 'Use device biometrics instead of a UPI PIN. If the browser cannot open a real prompt, a demo fallback is available.'}
          </div>
        </div>

        {status === 'working' && (
          <div className="mt-4 rounded-[24px] border p-4 text-sm" style={{ borderColor: 'var(--sf-border)', background: 'rgba(14,165,233,0.08)', color: 'var(--sf-text-strong)' }}>
            <span className="inline-flex items-center gap-2">
              <Fingerprint className="h-4 w-4" />
              Waiting for fingerprint or face approval...
            </span>
          </div>
        )}

        {status === 'fallback' && (
          <div className="mt-4 rounded-[24px] border p-4 text-sm" style={{ borderColor: 'rgba(245,158,11,0.28)', background: 'rgba(245,158,11,0.08)', color: 'var(--sf-text-strong)' }}>
            <span className="inline-flex items-center gap-2 font-bold">
              <TriangleAlert className="h-4 w-4" />
              Demo fallback available
            </span>
            <p className="mt-2 leading-6" style={{ color: 'var(--sf-text-soft)' }}>
              {message}
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="mt-4 rounded-[24px] border p-4 text-sm" style={{ borderColor: 'rgba(34,197,94,0.28)', background: 'rgba(34,197,94,0.08)', color: 'var(--sf-text-strong)' }}>
            <span className="inline-flex items-center gap-2 font-bold">
              <CheckCircle2 className="h-4 w-4" />
              Verification complete
            </span>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={startBiometricFlow}
            className="rounded-full px-6 py-3 text-sm font-black text-white"
            style={{ background: 'var(--sf-accent-gradient)' }}
          >
            <span className="inline-flex items-center gap-2">
              <ScanFace className="h-4 w-4" />
              Approve biometrics
            </span>
          </button>

          {(status === 'fallback' || !supportInfo.isPlatformAvailable) && (
            <button
              type="button"
              onClick={markSuccess}
              className="rounded-full border px-5 py-3 text-sm font-black"
              style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel-soft)', color: 'var(--sf-text-strong)' }}
            >
              Use demo approval
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
