import type { Transaction } from './dummyData';

export type RiskLevel = 'low' | 'medium' | 'high';

export interface RiskReasonDetail {
  code: 'NEW_RECIPIENT' | 'HIGH_AMOUNT' | 'EXCEEDS_AVERAGE' | 'RAPID_DUPLICATE' | 'KNOWN_NORMAL';
  textEn: string;
  textTa: string;
  textHi: string;
}

export interface RiskResult {
  level: RiskLevel;
  reasons: string[]; // English reasons for direct access
  reasonDetails: RiskReasonDetail[]; // Localized reason details
  isKnownRecipient: boolean;
  averagePastAmount?: number;
  multiplier?: number;
  isRapidDuplicate?: boolean;
}

/**
 * Pure, deterministic risk assessment engine.
 *
 * @param recipientName Name of payee
 * @param amount Payment amount in INR
 * @param history Full transaction history
 * @param sessionPaymentsToRecipient Number of payments already made to this recipient in current session
 */
export function calculateRisk(
  recipientName: string,
  amount: number,
  history: Transaction[],
  sessionPaymentsToRecipient = 0
): RiskResult {
  const normalizedName = recipientName.trim().toLowerCase();

  // 1. Find prior payments to this recipient in history
  const pastPayments = history.filter(
    (tx) => tx.recipientName.trim().toLowerCase() === normalizedName
  );
  const isKnownRecipient = pastPayments.length > 0;

  let averagePastAmount = 0;
  let multiplier = 1;

  if (isKnownRecipient) {
    const total = pastPayments.reduce((sum, tx) => sum + tx.amount, 0);
    averagePastAmount = total / pastPayments.length;
    multiplier = amount / (averagePastAmount || 1);
  }

  const reasons: string[] = [];
  const reasonDetails: RiskReasonDetail[] = [];

  // Evaluate conditions
  const isUnknown = !isKnownRecipient;
  const isRapidDuplicate = isUnknown && sessionPaymentsToRecipient >= 2;
  const exceedsAverage = isKnownRecipient && amount > 1.5 * averagePastAmount;
  const isVeryLargeAmount = amount >= 25000;
  const isLargeAmount = amount >= 10000;

  // Determine Level:
  // HIGH RISK rules:
  // - unknown recipient AND amount >= 10,000
  // - unknown recipient AND amount >= 25,000 (always high)
  // - 2+ payments to same new recipient in same session (duplicate/rapid pattern)
  // - Or amount >= 50,000 even if known
  let level: RiskLevel = 'low';

  if (isRapidDuplicate || (isUnknown && isLargeAmount) || isVeryLargeAmount) {
    level = 'high';
  } else if (isUnknown || exceedsAverage) {
    level = 'medium';
  } else {
    level = 'low';
  }

  // Populate reasons (stackable)
  if (isRapidDuplicate) {
    reasons.push('Multiple rapid payments sent to this new recipient in this session.');
    reasonDetails.push({
      code: 'RAPID_DUPLICATE',
      textEn: 'Multiple payments to this new recipient were made in this session. Beware of rapid transfer scams.',
      textTa: 'இந்த புதிய நபருக்கு மிகக் குறுகிய நேரத்தில் அடுத்தடுத்து பணம் அனுப்பப்படுகிறது. பண மோசடி எச்சரிக்கை!',
      textHi: 'इस नए प्राप्तकर्ता को इस सत्र में तेजी से कई भुगतान किए गए हैं। ट्रांसफर फ्रॉड से सावधान रहें।'
    });
  }

  if (isUnknown) {
    reasons.push('This is a new recipient. You have never sent money to this person before.');
    reasonDetails.push({
      code: 'NEW_RECIPIENT',
      textEn: 'This is a new recipient. You have never sent money to this person before.',
      textTa: 'இது ஒரு புதிய பெறுநர். நீங்கள் இதற்கு முன் இவருக்கு பணம் அனுப்பவில்லை.',
      textHi: 'यह एक नया प्राप्तकर्ता है। आपने पहले कभी इस व्यक्ति को पैसे नहीं भेजे हैं।'
    });
  }

  if (isLargeAmount || isVeryLargeAmount) {
    reasons.push(`Unusually large transfer amount (₹${amount.toLocaleString('en-IN')}).`);
    reasonDetails.push({
      code: 'HIGH_AMOUNT',
      textEn: `This payment amount (₹${amount.toLocaleString('en-IN')}) is unusually high. Double check before paying.`,
      textTa: `இந்த தொகை (₹${amount.toLocaleString('en-IN')}) வழக்கத்தை விட மிக அதிகமாக உள்ளது. செலுத்தும் முன் உறுதிப்படுத்தவும்.`,
      textHi: `यह राशि (₹${amount.toLocaleString('en-IN')}) असामान्य रूप से बहुत बड़ी है। भुगतान से पहले दोबारा जांचें।`
    });
  } else if (exceedsAverage) {
    const avgFormatted = Math.round(averagePastAmount).toLocaleString('en-IN');
    reasons.push(`Amount exceeds typical payment to this recipient (average ₹${avgFormatted}).`);
    reasonDetails.push({
      code: 'EXCEEDS_AVERAGE',
      textEn: `This amount (₹${amount.toLocaleString('en-IN')}) is higher than your usual payment of ~₹${avgFormatted} to ${recipientName}.`,
      textTa: `இந்த தொகை (₹${amount.toLocaleString('en-IN')}) வழக்கமாக ${recipientName} என்பவருக்கு நீங்கள் அனுப்பும் சராசரி தொகையை (₹${avgFormatted}) விட அதிகம்.`,
      textHi: `यह राशि (₹${amount.toLocaleString('en-IN')}) इस प्राप्तकर्ता को आपके सामान्य औसत भुगतान (~₹${avgFormatted}) से काफी अधिक है।`
    });
  }

  if (level === 'low') {
    reasons.push('Known recipient with normal payment amount. Looks safe.');
    reasonDetails.push({
      code: 'KNOWN_NORMAL',
      textEn: `Looks normal. You regularly pay ~₹${Math.round(averagePastAmount).toLocaleString('en-IN')} to ${recipientName}.`,
      textTa: `பரிவர்த்தனை சாதாரணமாக உள்ளது. நீங்கள் ${recipientName} என்பவருக்கு வழக்கமாக பணம் செலுத்துகிறீர்கள்.`,
      textHi: `सब सामान्य लग रहा है। आप नियमित रूप से ${recipientName} को भुगतान करते रहे हैं।`
    });
  }

  return {
    level,
    reasons,
    reasonDetails,
    isKnownRecipient,
    averagePastAmount: isKnownRecipient ? Math.round(averagePastAmount) : undefined,
    multiplier: isKnownRecipient ? Number(multiplier.toFixed(1)) : undefined,
    isRapidDuplicate
  };
}
