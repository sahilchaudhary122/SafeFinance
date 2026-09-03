import React, { useState } from 'react';
import { useApp } from '../state/AppContext';
import { translations } from '../lib/i18n';
import { speakText, stopSpeaking } from '../lib/tts';
import { 
  Volume2, 
  VolumeX, 
  ArrowLeft, 
  X, 
  Check, 
  ShieldAlert,
  Info,
  ShieldCheck
} from 'lucide-react';

export const ExplainBeforePayScreen: React.FC = () => {
  const { 
    language, 
    setScreen, 
    draftPayment, 
    riskResult, 
    cancelPayment, 
    setEmergencyStopOpen 
  } = useApp();

  const t = translations[language];
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [checklist, setChecklist] = useState({
    receiverIntended: true,
    amountCorrect: true,
    notPressured: true
  });

  const numAmount = typeof draftPayment.amount === 'number' 
    ? draftPayment.amount 
    : Number(draftPayment.amount) || 0;
  const amountFormatted = numAmount.toLocaleString('en-IN');
  const recipient = draftPayment.recipientName;
  const isNew = riskResult?.isNewContact ?? true;

  // Spoken script construction (Neutral, no "risk levels")
  const getSpeechScript = (): { local: string; englishFallback: string } => {
    let local = '';
    let englishFallback = '';

    if (isNew) {
      local = t.ttsNewContact
        .replace('{recipient}', recipient)
        .replace('{amount}', amountFormatted);
      englishFallback = `SafeFinance safety check. Attention. You are sending ${amountFormatted} rupees to ${recipient} for the first time. You have no prior payment history with this contact. Please verify receiver carefully.`;
    } else if (riskResult?.isUnusualAmount) {
      local = t.ttsUnusual
        .replace('{recipient}', recipient)
        .replace('{amount}', amountFormatted);
      englishFallback = `SafeFinance safety check. Attention. You are sending ${amountFormatted} rupees to ${recipient}. This amount is higher than your typical payment to this contact. Please verify before paying.`;
    } else {
      local = t.ttsFamiliar
        .replace('{recipient}', recipient)
        .replace('{amount}', amountFormatted);
      englishFallback = `SafeFinance safety check. You are sending ${amountFormatted} rupees to ${recipient}. You have sent payments to this contact before.`;
    }

    return { local, englishFallback };
  };

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    const { local, englishFallback } = getSpeechScript();
    setIsSpeaking(true);

    speakText(
      local,
      language,
      englishFallback,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      () => setIsSpeaking(false)
    );
  };

  // Plain language explanation message
  let headline = '';
  let subReason = '';

  if (language === 'ta') {
    if (isNew) {
      headline = `நீங்கள் ${recipient} என்பவருக்கு முதல் முறையாக ₹${amountFormatted} பணம் அனுப்புகிறீர்கள்.`;
      subReason = 'இந்த நபருக்கு நீங்கள் இதற்கு முன் பணம் அனுப்பியதில்லை. பணம் அனுப்பும் முன் சரிபார்க்கவும்.';
    } else if (riskResult?.isUnusualAmount) {
      headline = `${recipient} என்பவருக்கு ₹${amountFormatted} அனுப்பப்படுகிறது.`;
      subReason = 'இந்த தொகை உங்கள் வழக்கமான கொடுப்பனவுகளை விட அதிகமாக உள்ளது. செலுத்தும் முன் சரிபார்க்கவும்.';
    } else {
      headline = `${recipient} என்பவருக்கு ₹${amountFormatted} அனுப்பப்படுகிறது.`;
      subReason = 'நீங்கள் இதற்கு முன்பும் இந்த நபருக்கு பணம் அனுப்பியுள்ளீர்கள்.';
    }
  } else if (language === 'hi') {
    if (isNew) {
      headline = `आप पहली बार ${recipient} को ₹${amountFormatted} भेज रहे हैं।`;
      subReason = 'आपने पहले कभी इस व्यक्ति को पैसे नहीं भेजे हैं। भुगतान करने से पहले कृपया जांच करें।';
    } else if (riskResult?.isUnusualAmount) {
      headline = `${recipient} को ₹${amountFormatted} भेजा जा रहा है।`;
      subReason = 'यह राशि इस प्राप्तकर्ता को आपके सामान्य औसत भुगतान से अधिक है।';
    } else {
      headline = `${recipient} को ₹${amountFormatted} भेजा जा रहा है।`;
      subReason = 'आप पहले भी इस प्राप्तकर्ता को सुरक्षित रूप से पैसे भेज चुके हैं।';
    }
  } else {
    // English
    if (isNew) {
      headline = `You are sending ₹${amountFormatted} to ${recipient} for the first time.`;
      subReason = 'This is a new recipient. You have never sent money to this person before. Please verify the receiver before paying.';
    } else if (riskResult?.isUnusualAmount) {
      headline = `You are sending ₹${amountFormatted} to ${recipient}.`;
      subReason = `This amount is higher than your usual average transfer to this contact. Double-check before confirming.`;
    } else {
      headline = `You are sending ₹${amountFormatted} to ${recipient}.`;
      subReason = 'You have previously completed successful payments to this contact.';
    }
  }

  return (
    <div className="space-y-5 animate-fadeIn pb-6">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            stopSpeaking();
            setScreen('risk-check');
          }}
          className="flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t.back}</span>
        </button>

        <span className="text-xs font-semibold text-emerald-400">
          Step 3 of 4 • Explain Before Pay
        </span>
      </div>

      {/* Screen Title & Listen (TTS) Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white">{t.explainTitle}</h2>
          <p className="mt-0.5 text-xs text-slate-400">{t.explainSubtitle}</p>
        </div>

        {/* 🔊 Voice Assistance Button */}
        <button
          onClick={handleToggleSpeak}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition shadow-lg shrink-0 ${
            isSpeaking
              ? 'bg-amber-500 text-slate-950 shadow-amber-500/30 animate-pulse'
              : 'border border-emerald-500/40 bg-emerald-950/60 text-emerald-200 hover:bg-emerald-900/60'
          }`}
        >
          {isSpeaking ? (
            <>
              <VolumeX className="h-4 w-4" />
              <span>{t.stopAudio}</span>
            </>
          ) : (
            <>
              <Volume2 className="h-4 w-4 text-emerald-400" />
              <span>{t.listen}</span>
            </>
          )}
        </button>
      </div>

      {/* Spoken Voice Bar Banner if playing */}
      {isSpeaking && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200 animate-fadeIn">
          <div className="flex gap-1">
            <span className="inline-block h-3 w-1 bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="inline-block h-4 w-1 bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="inline-block h-3 w-1 bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span>SafeFinance voice assistant is reading the safety notice aloud...</span>
        </div>
      )}

      {/* Signature Plain-Language Warning Card (Neutral, High-Contrast) */}
      <div className="rounded-3xl border-2 border-slate-700 bg-slate-900/90 p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {isNew ? (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Info className="h-5 w-5" />
              </div>
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="h-5 w-5" />
              </div>
            )}
            <span className="text-base sm:text-lg font-black text-white">
              {t.warningNotice}
            </span>
          </div>

          {/* New contact badge if applicable */}
          {isNew && (
            <span className="rounded-full bg-cyan-500/15 border border-cyan-500/30 px-3 py-1 text-[11px] font-bold text-cyan-300">
              {t.firstTimeContactBadge}
            </span>
          )}
        </div>

        {/* Highlighted Plain-Language Statement */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-2">
          <p className="text-base sm:text-lg font-bold text-slate-100 leading-snug">
            "{headline}"
          </p>
          <p className="text-xs text-slate-300 leading-relaxed">
            {subReason}
          </p>
        </div>

        {/* 3-Point Interactive Verification Checklist */}
        <div className="space-y-2.5 pt-1">
          <span className="block text-xs font-bold uppercase tracking-wider text-slate-300">
            {t.checklistTitle}
          </span>

          {/* Check 1: Recipient intended */}
          <label className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 cursor-pointer hover:bg-slate-800/80 transition">
            <input
              type="checkbox"
              checked={checklist.receiverIntended}
              onChange={(e) => setChecklist((prev) => ({ ...prev, receiverIntended: e.target.checked }))}
              className="h-5 w-5 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
            />
            <span className="text-xs sm:text-sm font-medium text-slate-200">
              {t.check1}
            </span>
          </label>

          {/* Check 2: Amount correct */}
          <label className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 cursor-pointer hover:bg-slate-800/80 transition">
            <input
              type="checkbox"
              checked={checklist.amountCorrect}
              onChange={(e) => setChecklist((prev) => ({ ...prev, amountCorrect: e.target.checked }))}
              className="h-5 w-5 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
            />
            <span className="text-xs sm:text-sm font-medium text-slate-200">
              {t.check2.replace('{amount}', amountFormatted)}
            </span>
          </label>

          {/* Check 3: Not being pressured */}
          <label className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 cursor-pointer hover:bg-slate-800/80 transition">
            <input
              type="checkbox"
              checked={checklist.notPressured}
              onChange={(e) => setChecklist((prev) => ({ ...prev, notPressured: e.target.checked }))}
              className="h-5 w-5 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
            />
            <span className="text-xs sm:text-sm font-medium text-slate-200">
              {t.check3}
            </span>
          </label>
        </div>
      </div>

      {/* Emergency Stop Entry Point (§10) */}
      <div 
        onClick={() => {
          stopSpeaking();
          setEmergencyStopOpen(true);
        }}
        className="cursor-pointer rounded-2xl border-2 border-rose-500/40 bg-rose-950/30 p-4 transition hover:border-rose-500 hover:bg-rose-950/50"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-300 font-bold text-sm sm:text-base">
            <ShieldAlert className="h-5 w-5 text-rose-400" />
            <span>{t.pressuredPrompt}</span>
          </div>
          <span className="rounded-lg bg-rose-500/20 px-2.5 py-1 text-xs font-bold text-rose-300">
            Emergency Stop
          </span>
        </div>
        <p className="mt-1 text-xs text-rose-200/80">
          {t.pressuredSub}
        </p>
      </div>

      {/* Action Buttons: Cancel, Go Back, Continue */}
      <div className="space-y-3 pt-2">
        {/* Primary CTA: I Understand — Continue */}
        <button
          onClick={() => {
            stopSpeaking();
            setScreen('confirm');
          }}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-4 text-base font-bold text-white shadow-xl shadow-emerald-950/40 transition hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98]"
        >
          <Check className="h-5 w-5 stroke-[2.5]" />
          <span>{t.understandAndContinue}</span>
        </button>

        <div className="grid grid-cols-2 gap-3">
          {/* Go Back & Edit */}
          <button
            onClick={() => {
              stopSpeaking();
              setScreen('send');
            }}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/90 py-3 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            <span>{t.goBackEdit}</span>
          </button>

          {/* Cancel Payment */}
          <button
            onClick={cancelPayment}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-950/40 py-3 text-xs font-semibold text-rose-300 hover:bg-rose-900/40 transition"
          >
            <X className="h-4 w-4" />
            <span>{t.cancel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
