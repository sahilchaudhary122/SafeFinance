import type { Transaction } from './dummyData';

export type ContactRelationship = 'new' | 'known' | 'family';

export interface SafetyFinding {
  id: string;
  type: 'recipient_history' | 'contact_status' | 'amount_pattern' | 'timing';
  icon: 'user' | 'history' | 'trending-up' | 'check' | 'alert' | 'info';
  titleEn: string;
  titleTa: string;
  titleHi: string;
  descriptionEn: string;
  descriptionTa: string;
  descriptionHi: string;
  badgeEn?: string;
  badgeTa?: string;
  badgeHi?: string;
}

export interface SafetyScanResult {
  recipientName: string;
  amount: number;
  isNewContact: boolean;
  contactRelationship: ContactRelationship;
  pastTransactionsCount: number;
  totalPastAmount: number;
  averagePastAmount?: number;
  lastPaymentDate?: string;
  isUnusualAmount: boolean;
  amountRatio?: number;
  findings: SafetyFinding[];
  neutralGuidanceEn: string;
  neutralGuidanceTa: string;
  neutralGuidanceHi: string;
}

/**
 * Pure, deterministic safety inspection engine.
 * Provides neutral factual observations to empower the user's payment decision
 * without assigning biased "risk scores" or "low/medium/high risk" labels.
 */
export function inspectPaymentSafety(
  recipientName: string,
  amount: number,
  history: Transaction[]
): SafetyScanResult {
  const normalizedName = recipientName.trim().toLowerCase();

  // Find previous payments to this recipient
  const pastPayments = history.filter(
    (tx) => tx.paymentType === 'p2p' && tx.recipientName.trim().toLowerCase() === normalizedName
  );

  const pastTransactionsCount = pastPayments.length;
  const isNewContact = pastTransactionsCount <= 3;
  const contactRelationship: ContactRelationship =
    pastTransactionsCount > 3 ? 'known' : 'new';

  let totalPastAmount = 0;
  let averagePastAmount = 0;
  let isUnusualAmount = false;
  let amountRatio: number | undefined;
  let lastPaymentDate: string | undefined;

  if (!isNewContact) {
    totalPastAmount = pastPayments.reduce((sum, tx) => sum + tx.amount, 0);
    averagePastAmount = Math.round(totalPastAmount / pastTransactionsCount);
    amountRatio = Number((amount / (averagePastAmount || 1)).toFixed(1));
    isUnusualAmount = amount > 1.5 * averagePastAmount;
    lastPaymentDate = pastPayments[0]?.timestamp || pastPayments[0]?.dateStr;
  }

  const findings: SafetyFinding[] = [];

  // Finding 1: Contact Familiarity & Recipient Status
  if (isNewContact) {
    findings.push({
      id: 'contact-status-new',
      type: 'contact_status',
      icon: 'info',
      badgeEn: 'First payment to this contact',
      badgeTa: 'இந்த நபருக்கான முதல் பரிவர்த்தனை',
      badgeHi: 'इस संपर्क को पहला भुगतान',
      titleEn: 'First Payment to this Recipient',
      titleTa: 'புதிய பெறுநர்',
      titleHi: 'नया प्राप्तकर्ता',
      descriptionEn: pastTransactionsCount === 0
        ? `You have no prior transaction history with ${recipientName}. Please double-check that the name matches your intended payee.`
        : `You have made ${pastTransactionsCount} payment${pastTransactionsCount === 1 ? '' : 's'} to ${recipientName} before. This person becomes a known contact after more than 3 payments.`,
      descriptionTa: pastTransactionsCount === 0
        ? `${recipientName} அவர்களுக்கு நீங்கள் இதற்கு முன் பணம் அனுப்பியதில்லை. பெறுநர் பெயர் சரியானதுதானா என உறுதி செய்யவும்.`
        : `${recipientName} அவர்களுக்கு நீங்கள் முன்பு ${pastTransactionsCount} முறை பணம் அனுப்பியுள்ளீர்கள். 3 முறைக்கு மேல் அனுப்பிய பிறகு இந்த நபர் அறிந்த தொடர்பாக மாறுவார்.`,
      descriptionHi: pastTransactionsCount === 0
        ? `${recipientName} के साथ आपका कोई पिछला लेन-देन नहीं है। कृपया पुष्टि करें कि नाम सही प्राप्तकर्ता से मेल खाता है।`
        : `आपने ${recipientName} को पहले ${pastTransactionsCount} बार भुगतान किया है। 3 से अधिक भुगतानों के बाद यह व्यक्ति परिचित संपर्क बनेगा।`
    });
  } else {
    findings.push({
      id: 'contact-status-familiar',
      type: 'contact_status',
      icon: 'check',
      badgeEn: `Familiar Contact (${pastTransactionsCount} previous payments)`,
      badgeTa: `அறிந்த தொடர்பு (${pastTransactionsCount} முறை அனுப்பப்பட்டுள்ளது)`,
      badgeHi: `परिचित संपर्क (${pastTransactionsCount} बार भुगतान किया गया)`,
      titleEn: 'Familiar Contact History',
      titleTa: 'அறிந்த பெறுநர் வரலாறு',
      titleHi: 'पूर्व लेन-देन इतिहास',
      descriptionEn: `You have successfully completed ${pastTransactionsCount} payment${pastTransactionsCount > 1 ? 's' : ''} to ${recipientName} previously.`,
      descriptionTa: `நீங்கள் ${recipientName} அவர்களுக்கு இதற்கு முன் ${pastTransactionsCount} முறை வெற்றிகரமாக பணம் செலுத்தியுள்ளீர்கள்.`,
      descriptionHi: `आपने पहले ${recipientName} को ${pastTransactionsCount} बार सफलतापूर्वक भुगतान किया है।`
    });
  }

  // Finding 2: Transaction History & Amounts Pattern
  if (!isNewContact) {
    if (isUnusualAmount) {
      findings.push({
        id: 'amount-comparison-unusual',
        type: 'amount_pattern',
        icon: 'alert',
        badgeEn: `Higher than usual (~₹${averagePastAmount.toLocaleString('en-IN')})`,
        badgeTa: `வழக்கத்தை விட அதிக தொகை`,
        badgeHi: `सामान्य से अधिक राशि`,
        titleEn: 'Unusual Amount Comparison',
        titleTa: 'தொகை ஒப்பீடு',
        titleHi: 'राशि तुलना',
        descriptionEn: `This payment of ₹${amount.toLocaleString('en-IN')} is ${amountRatio}x higher than your average transfer of ₹${averagePastAmount.toLocaleString('en-IN')} to this contact.`,
        descriptionTa: `இந்த ₹${amount.toLocaleString('en-IN')} தொகையானது, நீங்கள் வழக்கமாக அனுப்பும் சராசரி தொகையை (₹${averagePastAmount.toLocaleString('en-IN')}) விட ${amountRatio} மடங்கு அதிகம்.`,
        descriptionHi: `₹${amount.toLocaleString('en-IN')} का यह भुगतान इस संपर्क को आपके औसत भुगतान (₹${averagePastAmount.toLocaleString('en-IN')}) से ${amountRatio} गुना अधिक है।`
      });
    } else {
      findings.push({
        id: 'amount-comparison-normal',
        type: 'amount_pattern',
        icon: 'history',
        badgeEn: `Consistent with past payments`,
        badgeTa: `வழக்கமான வரம்பில் உள்ளது`,
        badgeHi: `सामान्य सीमा में है`,
        titleEn: 'Typical Payment Amount',
        titleTa: 'வழக்கமான கட்டண வரம்பு',
        titleHi: 'सामान्य भुगतान राशि',
        descriptionEn: `₹${amount.toLocaleString('en-IN')} is consistent with your typical payments (average ₹${averagePastAmount.toLocaleString('en-IN')}) to ${recipientName}.`,
        descriptionTa: `₹${amount.toLocaleString('en-IN')} என்பது நீங்கள் வழக்கமாக ${recipientName} அவர்களுக்கு அனுப்பும் சராசரி வரம்பிற்குள் (₹${averagePastAmount.toLocaleString('en-IN')}) உள்ளது.`,
        descriptionHi: `₹${amount.toLocaleString('en-IN')} आपके सामान्य भुगतान औसत (₹${averagePastAmount.toLocaleString('en-IN')}) के अनुरूप है।`
      });
    }
  } else {
    // New contact amount detail
    findings.push({
      id: 'new-contact-amount-check',
      type: 'amount_pattern',
      icon: 'history',
      badgeEn: `Starting transfer: ₹${amount.toLocaleString('en-IN')}`,
      badgeTa: `முதல் தொகை: ₹${amount.toLocaleString('en-IN')}`,
      badgeHi: `आरंभिक राशि: ₹${amount.toLocaleString('en-IN')}`,
      titleEn: 'Initial Transfer Amount',
      titleTa: 'பரிவர்த்தனைத் தொகை',
      titleHi: 'प्रारंभिक लेन-देन राशि',
      descriptionEn: `You are sending ₹${amount.toLocaleString('en-IN')} as your first payment to this contact. Ensure the receiver has requested this exact amount.`,
      descriptionTa: `நீங்கள் முதல் முறையாக இந்த நபருக்கு ₹${amount.toLocaleString('en-IN')} அனுப்புகிறீர்கள். தொகை சரியானதா என்பதை உறுதிப்படுத்திக் கொள்ளுங்கள்.`,
      descriptionHi: `आप इस संपर्क को पहली बार ₹${amount.toLocaleString('en-IN')} भेज रहे हैं। सुनिश्चित करें कि प्राप्तकर्ता ने इसी राशि का अनुरोध किया है।`
    });
  }

  // Finding 3: Recipient Details Verification
  findings.push({
    id: 'recipient-identity-check',
    type: 'recipient_history',
    icon: 'user',
    titleEn: 'Payee Verification',
    titleTa: 'பெறுநர் சரிபார்ப்பு',
    titleHi: 'प्राप्तकर्ता विवरण',
    descriptionEn: `Payment will be credited directly to ${recipientName}. Remember that transfers to incorrect numbers or UPI IDs cannot always be reversed immediately.`,
    descriptionTa: `பணம் நேரடியாக ${recipientName} என்பவரின் கணக்கிற்கு செல்லும். தவறான எண்ணிற்கு பணம் அனுப்பினால் உடனே திரும்பப் பெற முடியாது.`,
    descriptionHi: `भुगतान सीधे ${recipientName} के खाते में जाएगा। ध्यान रहे कि गलत नंबर पर भेजे गए पैसे तुरंत वापस नहीं हो सकते।`
  });

  return {
    recipientName,
    amount,
    isNewContact,
    contactRelationship,
    pastTransactionsCount,
    totalPastAmount,
    averagePastAmount: isNewContact ? undefined : averagePastAmount,
    lastPaymentDate,
    isUnusualAmount,
    amountRatio,
    findings,
    neutralGuidanceEn: isNewContact
      ? 'This is a new contact. We recommend verifying the payee identity before approving.'
      : isUnusualAmount
      ? 'The amount is higher than your usual payments. Please verify before continuing.'
      : 'Details verified against your payment history. You can proceed with confirmation.',
    neutralGuidanceTa: isNewContact
      ? 'இது ஒரு புதிய தொடர்பு. உறுதிப்படுத்தும் முன் பெறுநரின் அடையாளத்தை சரிபார்க்கவும்.'
      : isUnusualAmount
      ? 'தொகை உங்கள் வழக்கமான கொடுப்பனவுகளை விட அதிகம். தொடரும் முன் சரிபார்க்கவும்.'
      : 'உங்கள் பரிவர்த்தனை வரலாறுடன் விவரங்கள் சரிபார்க்கப்பட்டன.',
    neutralGuidanceHi: isNewContact
      ? 'यह एक नया संपर्क है। पुष्टि करने से पहले प्राप्तकर्ता की पहचान जांच लें।'
      : isUnusualAmount
      ? 'यह राशि आपके सामान्य भुगतानों से अधिक है। जारी रखने से पहले जांच लें।'
      : 'आपके भुगतान इतिहास के अनुसार विवरणों की जांच की गई है।'
  };
}

// Backwards-compatible export alias for any components migrating to inspectPaymentSafety
export const calculateRisk = inspectPaymentSafety;
export type RiskResult = SafetyScanResult;
