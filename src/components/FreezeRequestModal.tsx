import React, { useMemo, useState } from 'react';
import { FileText, Lock, ShieldAlert, X } from 'lucide-react';
import { translations } from '../lib/i18n';
import { useApp } from '../state/AppContext';

export const FreezeRequestModal: React.FC = () => {
  const {
    clearFreezeFeedback,
    freezeEvidenceModalOpen,
    freezeSubmittedCaseId,
    language,
    selectedTxForFreeze,
    setFreezeEvidenceModalOpen,
    submitFreezeRequest
  } = useApp();
  const t = translations[language];
  const [reason, setReason] = useState('Suspected scam');
  const [note, setNote] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reasons = useMemo(
    () => ['Suspected scam', 'Wrong recipient', 'Pressure call', 'Fake merchant or fake UPI', 'Other'],
    []
  );

  if (!freezeEvidenceModalOpen || !selectedTxForFreeze) {
    return null;
  }

  const handleClose = () => {
    setReason('Suspected scam');
    setNote('');
    setEvidenceFiles([]);
    setErrorMessage(null);
    clearFreezeFeedback();
    setFreezeEvidenceModalOpen(false);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (note.trim().length < 20) {
      setErrorMessage(t.freezeDetailRequired);
      return;
    }

    const result = submitFreezeRequest(reason, note, evidenceFiles);
    if (!result.success) {
      setErrorMessage(result.message || 'Freeze request failed.');
      return;
    }

    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4">
      <div className="w-full max-w-lg rounded-[28px] border p-6 shadow-2xl" style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel)' }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-black" style={{ color: 'var(--sf-text-strong)' }}>
              {t.freezeAction}
            </div>
            <p className="mt-2 text-sm leading-6" style={{ color: 'var(--sf-text-soft)' }}>
              {t.freezeIntro}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-2"
            style={{ background: 'var(--sf-panel-soft)', color: 'var(--sf-text-muted)' }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 rounded-[24px] border p-4" style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel-soft)' }}>
          <div className="text-sm font-bold" style={{ color: 'var(--sf-text-strong)' }}>
            {selectedTxForFreeze.recipientName}
          </div>
          <div className="mt-1 text-sm" style={{ color: 'var(--sf-text-muted)' }}>
            {selectedTxForFreeze.phoneNumber}
          </div>
          <div className="mt-3 text-lg font-black" style={{ color: 'var(--sf-danger)' }}>
            Rs. {selectedTxForFreeze.amount.toLocaleString('en-IN')}
          </div>
        </div>

        {freezeSubmittedCaseId ? (
          <div className="mt-5 rounded-[24px] border p-5" style={{ borderColor: 'rgba(245,158,11,0.28)', background: 'rgba(245,158,11,0.08)' }}>
            <div className="inline-flex items-center gap-2 text-sm font-bold" style={{ color: 'var(--sf-text-strong)' }}>
              <ShieldAlert className="h-4 w-4" />
              {t.freezeSubmittedTitle}
            </div>
            <p className="mt-3 text-sm leading-6" style={{ color: 'var(--sf-text-soft)' }}>
              {t.freezeSubmittedText}
            </p>
            <div className="mt-4 rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel)', color: 'var(--sf-text-strong)' }}>
              Case ID: <span className="font-mono font-bold">{freezeSubmittedCaseId}</span>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="mt-5 rounded-full px-5 py-3 text-sm font-black text-white"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--sf-text-muted)' }}>
                {t.freezeReasonLabel}
              </span>
              <select
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-input)', color: 'var(--sf-text-strong)' }}
              >
                {reasons.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--sf-text-muted)' }}>
                {t.freezeNoteLabel}
              </span>
              <textarea
                value={note}
                onChange={(event) => {
                  setNote(event.target.value);
                  setErrorMessage(null);
                }}
                rows={4}
                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-input)', color: 'var(--sf-text-strong)' }}
                placeholder={t.freezeDetailPlaceholder}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--sf-text-muted)' }}>
                {t.freezeEvidenceLabel}
              </span>
              <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel-soft)' }}>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,audio/*,.pdf"
                  onChange={(event) => {
                    const files = Array.from(event.target.files || []);
                    setEvidenceFiles(files.map((file) => file.name));
                  }}
                  className="block w-full text-sm"
                  style={{ color: 'var(--sf-text-soft)' }}
                />
                <p className="mt-3 text-xs leading-5" style={{ color: 'var(--sf-text-muted)' }}>
                  {t.freezeEvidenceHint}
                </p>
                {evidenceFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {evidenceFiles.map((fileName) => (
                      <div key={fileName} className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold" style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel)', color: 'var(--sf-text-strong)' }}>
                        <FileText className="h-3.5 w-3.5" />
                        {fileName}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </label>

            {errorMessage && (
              <div className="rounded-2xl border px-4 py-3 text-sm font-medium" style={{ borderColor: 'rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.08)', color: 'var(--sf-danger)' }}>
                {errorMessage}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="rounded-full px-5 py-3 text-sm font-black text-white"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
              >
                <span className="inline-flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  {t.freezeSubmit}
                </span>
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full border px-5 py-3 text-sm font-black"
                style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel-soft)', color: 'var(--sf-text-strong)' }}
              >
                {t.freezeCancel}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
