import React, { useState } from 'react';
import { useApp } from '../state/AppContext';
import { translations } from '../lib/i18n';
import { type EvidenceSubmission, generateCaseId } from '../lib/dummyData';
import { analyzeEvidenceSubmission, type AiEvidenceReviewResult } from '../lib/aiEvidenceReview';
import { 
  X, 
  ShieldAlert, 
  FileText, 
  Image as ImageIcon, 
  CheckCircle2, 
  Trash2,
  Lock,
  Sparkles,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

export const FreezeEvidenceModal: React.FC = () => {
  const { 
    language, 
    freezeEvidenceModalOpen, 
    setFreezeEvidenceModalOpen, 
    selectedTxForFreeze, 
    freezeTransactionWithAiReview 
  } = useApp();

  const t = translations[language];

  // Steps: 'confirm_freeze' -> 'evidence_form' -> 'ai_analyzing' -> 'ai_review_result'
  const [modalStage, setModalStage] = useState<'confirm_freeze' | 'evidence_form' | 'ai_analyzing' | 'ai_review_result'>('confirm_freeze');

  const [category, setCategory] = useState<EvidenceSubmission['category']>('urgency_pressure');
  const [description, setDescription] = useState<string>('');
  const [screenshotName, setScreenshotName] = useState<string>('');
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState<string>('');
  const [aiReviewResult, setAiReviewResult] = useState<AiEvidenceReviewResult | null>(null);
  const [caseId, setCaseId] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!freezeEvidenceModalOpen || !selectedTxForFreeze) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshotName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocumentName(file.name);
    }
  };

  const handleRemoveImage = () => {
    setScreenshotName('');
    setScreenshotPreview(null);
  };

  const getCategoryLabel = (cat: EvidenceSubmission['category']): string => {
    switch (cat) {
      case 'impersonation':
        return t.categoryImpersonation;
      case 'urgency_pressure':
        return t.categoryUrgency;
      case 'wrong_recipient':
        return t.categoryWrongRecipient;
      case 'fake_qr':
        return t.categoryFakeQr;
      default:
        return t.categoryOther;
    }
  };

  // Step 1: User confirms freeze
  const handleProceedToEvidence = () => {
    setModalStage('evidence_form');
  };

  // Step 2: User submits evidence -> AI First-Level Review runs
  const handleRunAiEvidenceReview = (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      setErrorMsg('Please write an explanation describing why this transaction should be reviewed.');
      return;
    }

    setModalStage('ai_analyzing');
    setErrorMsg(null);

    // 1.5s simulated AI analysis delay
    setTimeout(() => {
      const generatedId = generateCaseId();
      setCaseId(generatedId);

      const review = analyzeEvidenceSubmission(
        selectedTxForFreeze,
        category,
        description,
        screenshotName,
        documentName,
        screenshotPreview || undefined
      );

      const evidence: EvidenceSubmission = {
        category,
        categoryLabel: getCategoryLabel(category),
        description: description.trim(),
        screenshotName: screenshotName || (screenshotPreview ? 'dispute_screenshot.png' : undefined),
        screenshotPreviewUrl: screenshotPreview || undefined,
        documentName: documentName || undefined,
        submittedAt: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        caseId: generatedId
      };

      setAiReviewResult(review);

      // Update transaction status in state
      freezeTransactionWithAiReview(selectedTxForFreeze.id, evidence, review);

      setModalStage('ai_review_result');
    }, 1500);
  };

  const handleClose = () => {
    setFreezeEvidenceModalOpen(false);
    setModalStage('confirm_freeze');
    setDescription('');
    setScreenshotName('');
    setScreenshotPreview(null);
    setDocumentName('');
    setAiReviewResult(null);
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-md animate-fadeIn">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="freeze-modal-title"
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h2 id="freeze-modal-title" className="text-base sm:text-lg font-bold text-white">
                {modalStage === 'confirm_freeze' && 'Freeze Transaction'}
                {modalStage === 'evidence_form' && 'Submit Dispute Evidence'}
                {modalStage === 'ai_analyzing' && 'AI Evidence Review'}
                {modalStage === 'ai_review_result' && 'AI Evidence Review'}
              </h2>
              <p className="text-xs text-slate-400">
                {modalStage === 'confirm_freeze' && 'Safety protection for new recipient transfers'}
                {modalStage === 'evidence_form' && 'Provide screenshots, receipts, or written context'}
                {modalStage === 'ai_analyzing' && 'Automated cross-checking in progress...'}
                {modalStage === 'ai_review_result' && `Case ${caseId} • First-Level Triage`}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* ================= STAGE 1: Confirm Freeze ================= */}
          {modalStage === 'confirm_freeze' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 text-center space-y-2">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Lock className="h-7 w-7" />
                </div>
                <h3 className="text-base font-bold text-white">Freeze this transaction?</h3>
                <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                  This transaction will be flagged and frozen under SafeFinance's safety protection mechanism for first-time recipients. Simulated funds settlement is suspended.
                </p>
              </div>

              {/* Transaction Summary Mini Card */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Recipient:</span>
                  <span className="font-bold text-white text-sm">{selectedTxForFreeze.recipientName}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">UPI ID / Phone:</span>
                  <span className="text-slate-300 font-medium">{selectedTxForFreeze.phoneNumber}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Amount:</span>
                  <span className="text-base font-black text-white">₹{selectedTxForFreeze.amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Contact Status:</span>
                  <span className="rounded bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                    New Contact — First Payment
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-[11px] text-slate-400">
                After freezing, you will submit supporting proof so our automated AI review can cross-examine the transaction details.
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleProceedToEvidence}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-amber-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-950/40 transition hover:bg-amber-500 active:scale-[0.98]"
                >
                  <Lock className="h-4 w-4" />
                  <span>Freeze Transaction & Submit Evidence</span>
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Keep Transaction Active
                </button>
              </div>
            </div>
          )}

          {/* ================= STAGE 2: Evidence Submission Form ================= */}
          {modalStage === 'evidence_form' && (
            <form onSubmit={handleRunAiEvidenceReview} className="space-y-4 animate-fadeIn">
              {/* Active Status Badge */}
              <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-2.5 flex items-center justify-between">
                <span className="text-xs text-amber-200 font-semibold">Transaction Status:</span>
                <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/40">
                  Frozen — Under Review
                </span>
              </div>

              {/* 1. Category Selection */}
              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5 text-[11px]">
                  Dispute Category <span className="text-rose-400">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/90 py-2.5 px-3 text-xs font-semibold text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="urgency_pressure">{t.categoryUrgency}</option>
                  <option value="impersonation">{t.categoryImpersonation}</option>
                  <option value="wrong_recipient">{t.categoryWrongRecipient}</option>
                  <option value="fake_qr">{t.categoryFakeQr}</option>
                  <option value="other">{t.categoryOther}</option>
                </select>
              </div>

              {/* 2. Text Description */}
              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5 text-[11px]">
                  Explanation & What Happened <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder="Explain why this payment should be reviewed (e.g. caller impersonated customer support, wrong UPI ID provided, tampered QR code sticker)..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/90 p-3 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none resize-none"
                />
              </div>

              {/* 3. Evidence File Upload (Screenshot/Image) */}
              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5 text-[11px]">
                  Upload Screenshot / Photo Proof (Optional)
                </label>
                {screenshotPreview ? (
                  <div className="relative rounded-xl border border-emerald-500/40 bg-slate-950 p-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={screenshotPreview}
                        alt="Evidence Proof"
                        className="h-10 w-10 object-cover rounded-lg border border-slate-700"
                      />
                      <span className="font-semibold text-slate-200 text-xs truncate max-w-[180px]">
                        {screenshotName || 'screenshot.png'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="p-1.5 text-slate-400 hover:text-rose-400 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-800/40 p-3.5 hover:border-emerald-500/50 hover:bg-slate-800/70 transition cursor-pointer">
                    <ImageIcon className="h-6 w-6 text-slate-400 mb-1" />
                    <span className="text-xs text-slate-300 font-semibold">Attach screenshot of chat, SMS, or QR sticker</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">PNG, JPG or WebP</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* 4. Document Upload */}
              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5 text-[11px]">
                  Attach Document / Invoice / Bill (Optional)
                </label>
                <label className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800/70 py-2 px-3 hover:bg-slate-800 transition cursor-pointer">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-400" />
                    <span className="text-xs text-slate-300">
                      {documentName || 'Attach PDF receipt, bill, or statement'}
                    </span>
                  </div>
                  <span className="rounded bg-slate-700 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                    Browse
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleDocUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {errorMsg && (
                <div className="text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-emerald-950/40 transition hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98]"
                >
                  <Sparkles className="h-4 w-4 text-emerald-300" />
                  <span>Submit Evidence for AI Review</span>
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* ================= STAGE 3: AI Analyzing State ================= */}
          {modalStage === 'ai_analyzing' && (
            <div className="rounded-3xl border border-emerald-500/30 bg-slate-950 p-8 text-center space-y-4 animate-fadeIn">
              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <RefreshCw className="h-8 w-8 animate-spin" />
              </div>
              <h3 className="text-base font-bold text-white">AI Evidence Review in Progress</h3>
              <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                Analyzing submitted proof, checking recipient/amount consistency, and cross-examining transaction logs...
              </p>
              <div className="space-y-1.5 text-[11px] text-slate-400 max-w-xs mx-auto text-left pt-2">
                <div>• Comparing recipient identifier...</div>
                <div>• Checking amount coherence...</div>
                <div>• Validating dispute relevance...</div>
              </div>
            </div>
          )}

          {/* ================= STAGE 4: AI Review Result ================= */}
          {modalStage === 'ai_review_result' && aiReviewResult && (
            <div className="space-y-4 animate-fadeIn">
              {/* Result Headline Card */}
              <div className={`rounded-2xl border p-4 text-center space-y-1.5 ${
                aiReviewResult.hasMismatch
                  ? 'border-rose-500/40 bg-rose-950/30'
                  : 'border-emerald-500/40 bg-emerald-950/30'
              }`}>
                {aiReviewResult.hasMismatch ? (
                  <AlertTriangle className="mx-auto h-10 w-10 text-rose-400 animate-pulse" />
                ) : (
                  <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400 animate-scaleUp" />
                )}
                <h3 className="text-base font-black text-white">{aiReviewResult.headline}</h3>
                <p className="text-xs font-medium text-slate-200 leading-snug">
                  "{aiReviewResult.conclusion}"
                </p>
                <div className="pt-1">
                  <span className="inline-block rounded-full bg-slate-900/80 px-3 py-1 font-mono text-[10px] font-bold text-emerald-300 border border-slate-700">
                    Case ID: {caseId}
                  </span>
                </div>
              </div>

              {/* Itemized Check Findings (§9) */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Itemized AI Findings:
                </span>

                {/* Check 1: Recipient */}
                <div className="flex items-start justify-between py-1.5 border-b border-slate-800">
                  <div>
                    <div className="font-bold text-white text-xs">Recipient</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{aiReviewResult.checks.recipientCheck.detail}</div>
                  </div>
                  <span className={`rounded px-2 py-0.5 text-[10px] font-bold shrink-0 ml-2 ${
                    aiReviewResult.checks.recipientCheck.status === 'mismatch'
                      ? 'bg-rose-500/20 text-rose-300'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {aiReviewResult.checks.recipientCheck.label}
                  </span>
                </div>

                {/* Check 2: Amount */}
                <div className="flex items-start justify-between py-1.5 border-b border-slate-800">
                  <div>
                    <div className="font-bold text-white text-xs">Amount</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{aiReviewResult.checks.amountCheck.detail}</div>
                  </div>
                  <span className={`rounded px-2 py-0.5 text-[10px] font-bold shrink-0 ml-2 ${
                    aiReviewResult.checks.amountCheck.status === 'mismatch'
                      ? 'bg-rose-500/20 text-rose-300'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {aiReviewResult.checks.amountCheck.label}
                  </span>
                </div>

                {/* Check 3: Transaction details */}
                <div className="flex items-start justify-between py-1.5 border-b border-slate-800">
                  <div>
                    <div className="font-bold text-white text-xs">Transaction Details</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{aiReviewResult.checks.transactionDetailsCheck.detail}</div>
                  </div>
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 shrink-0 ml-2">
                    {aiReviewResult.checks.transactionDetailsCheck.label}
                  </span>
                </div>

                {/* Check 4: Evidence relevance */}
                <div className="flex items-start justify-between py-1.5">
                  <div>
                    <div className="font-bold text-white text-xs">Evidence Relevance</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{aiReviewResult.checks.evidenceRelevanceCheck.detail}</div>
                  </div>
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 shrink-0 ml-2">
                    {aiReviewResult.checks.evidenceRelevanceCheck.label}
                  </span>
                </div>
              </div>

              {/* Regulatory Caveat Note */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-[11px] text-slate-400 leading-relaxed">
                ℹ️ <strong>Status Updated:</strong> {aiReviewResult.recommendation} ({aiReviewResult.confidenceNote})
              </div>

              {/* Close / Return to History Button */}
              <button
                type="button"
                onClick={handleClose}
                className="w-full rounded-2xl bg-emerald-600 py-3.5 text-xs font-bold text-white shadow-lg transition hover:bg-emerald-500"
              >
                Done • View Updated Transaction History
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
