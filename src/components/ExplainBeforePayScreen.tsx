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
  AlertTriangle, 
  AlertCircle, 
  ShieldCheck, 
  ShieldAlert
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

  const level = riskResult?.level || 'low';
  const amountFormatted = Number(draftPayment.amount).toLocaleString('en-IN');
  const recipient = draftPayment.recipientName;

  // Spoken script construction
  const getSpeechScript = (): { local: string; englishFallback: string } => {
    let local = '';
    let englishFallback = '';

    if (level === 'low') {
      local = t.ttsSafe
        .replace('{recipient}', recipient)
        .replace('{amount}', amountFormatted);
      englishFallback = `SafePay safety check. This payment to ${recipient} for ${amountFormatted} rupees looks safe. You have sent money to this person before.`;
    } else if (level === 'medium') {
      local = t.ttsMedium
        .replace('{recipient}', recipient)
        .replace('{amount}', amountFormatted);
      englishFallback = `SafePay warning. You are sending ${amountFormatted} rupees to ${recipient}. This is a new recipient you have not paid before. Please verify receiver carefully.`;
    } else {
      local = t.ttsHigh
        .replace('{recipient}', recipient)
        .replace('{amount}', amountFormatted);
      englishFallback = `SafePay high risk alert. You are sending ${amountFormatted} rupees to ${recipient}. This is an unusually large amount to an unfamiliar receiver. If you are feeling pressured, cancel the payment now.`;
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

  // Plain-language warning card headline
  let warningMessage = '';
  if (language === 'ta') {
    if (!riskResult?.isKnownRecipient) {
      warningMessage = `நீங்கள் ${recipient} என்பவருக்கு முதல் முறையாக ₹${amountFormatted} பணம் அனுப்புகிறீர்கள்.`;
    } else if (level === 'medium' || level === 'high') {
      warningMessage = `${recipient} என்பவருக்கு ₹${amountFormatted} அனுப்பப்படுகிறது. வழக்கத்தை விட அதிக தொகை.`;
    } else {
      warningMessage = `${recipient} என்பவருக்கு ₹${amountFormatted} வழக்கமான பாதுகாப்பான பரிவர்த்தனை.`;
    }
  } else if (language === 'hi') {
    if (!riskResult?.isKnownRecipient) {
      warningMessage = `आप पहली बार ${recipient} को ₹${amountFormatted} भेज रहे हैं।`;
    } else if (level === 'medium' || level === 'high') {
      warningMessage = `${recipient} को ₹${amountFormatted} भेजा जा रहा है। यह सामान्य से अधिक राशि है।`;
    } else {
      warningMessage = `${recipient} को ₹${amountFormatted} का भुगतान सामान्य और सुरक्षित है।`;
    }
  } else {
    // English
    if (!riskResult?.isKnownRecipient) {
      warningMessage = `You are sending ₹${amountFormatted} to ${recipient} for the first time.`;
    } else if (level === 'medium' || level === 'high') {
      warningMessage = `You are sending ₹${amountFormatted} to ${recipient}. This amount is higher than your usual transfer.`;
    } else {
      warningMessage = `You are sending ₹${amountFormatted} to ${recipient}. This matches your typical payments.`;
    }
  }

  // Localized reasons
  const localizedReasons = riskResult?.reasonDetails.map((detail) => {
    if (language === 'ta') return detail.textTa;
    if (language === 'hi') return detail.textHi;
    return detail.textEn;
  }) || riskResult?.reasons || [];

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
          <span>SafePay voice assistant is reading the safety warning aloud...</span>
        </div>
      )}

      {/* Signature Plain-Language Warning Card */}
      <div
        className={`rounded-3xl border-2 p-5 sm:p-6 shadow-2xl transition-all ${
          level === 'high'
            ? 'border-rose-500 bg-rose-950/25'
            : level === 'medium'
            ? 'border-amber-500 bg-amber-950/25'
            : 'border-emerald-500 bg-emerald-950/25'
        }`}
      >
        <div className="flex items-center gap-2.5">
          {level === 'high' ? (
            <AlertCircle className="h-6 w-6 text-rose-400 shrink-0" />
          ) : level === 'medium' ? (
            <AlertTriangle className="h-6 w-6 text-amber-400 shrink-0" />
          ) : (
            <ShieldCheck className="h-6 w-6 text-emerald-400 shrink-0" />
          )}
          <span className="text-base sm:text-lg font-black text-white">
            {t.warningNotice}
          </span>
        </div>

        {/* Highlighted Warning Statement */}
        <div className="mt-3.5 rounded-2xl bg-slate-950/80 p-4 border border-slate-800">
          <p className="text-base sm:text-lg font-bold text-slate-100 leading-snug">
            "{warningMessage}"
          </p>
          
          {/* Specific reasons list */}
          <div className="mt-3 space-y-1.5 border-t border-slate-800 pt-3">
            {localizedReasons.map((reason, idx) => (
              <p key={idx} className="text-xs text-slate-300 leading-relaxed">
                • {reason}
              </p>
            ))}
          </div>
        </div>

        {/* 3-Point Interactive Verification Checklist */}
        <div className="mt-5 space-y-2.5">
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
