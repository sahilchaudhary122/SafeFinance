export type SupportedLanguage = 'en' | 'ta' | 'hi';

export interface LanguageMeta {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGES: LanguageMeta[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
];

export const translations = {
  en: {
    appTitle: 'SafePay',
    appSubtitle: 'Pay with confidence. We check before you pay.',
    tagline: '🛡️ Your payment safety assistant',
    prototypeBadge: 'SIMULATED TRANSACTION • PROTOTYPE DEMO ONLY',
    
    // Quick Demo Scenarios
    demoScenariosTitle: 'Judges Test Bar (1-Click Fill):',
    scenarioA: 'Scenario A (Safe)',
    scenarioB: 'Scenario B (New Payee)',
    scenarioC: 'Scenario C (Suspicious)',
    scenarioADesc: 'Priya Sharma • ₹500 (Low Risk 🟢)',
    scenarioBDesc: 'Rahul Kumar • ₹5,000 (Medium Risk 🟠)',
    scenarioCDesc: 'Unknown • ₹50,000 (High Risk 🔴)',
    
    // Nav & Common
    home: 'Home',
    sendMoney: 'Send Money',
    scanQr: 'Scan QR (Coming Soon)',
    history: 'Transaction History',
    staySafe: 'Stay Safe Tips',
    back: 'Back',
    cancel: 'Cancel Payment',
    continue: 'Continue',
    done: 'Done',
    viewHistory: 'View History',
    loading: 'Checking payment safety...',
    listen: 'Listen',
    stopAudio: 'Stop',
    soundPlaying: 'Speaking...',
    audioNotSupported: 'Speech not supported',

    // Home Screen
    welcomeTitle: 'SafePay Payment Shield',
    welcomeDesc: 'Inserted before payment confirmation to protect you from scams, wrong numbers, and pressured transfers.',
    quickActions: 'Quick Actions',
    recentActivity: 'Recent Protected Transfers',
    viewAllHistory: 'View full history',
    scamPreventionCardTitle: '🛡️ Protected by SafePay AI',
    scamPreventionCardDesc: 'We evaluate recipient familiarity, amount anomalies, and velocity patterns before any money leaves your account.',

    // Send Money Screen
    sendMoneyTitle: 'Enter Payment Details',
    sendMoneySubtitle: 'Enter the details of the person you want to send money to.',
    recipientNameLabel: 'Recipient Name',
    recipientNamePlaceholder: 'e.g. Priya Sharma or Rahul Kumar',
    phoneNumberLabel: 'Mobile Number',
    phoneNumberPlaceholder: 'e.g. 98765 43210',
    amountLabel: 'Amount (₹)',
    amountPlaceholder: 'e.g. 5000',
    quickSelectKnown: 'Or pick a frequent contact:',
    continueSafetyCheck: 'Check Safety & Continue',
    nameRequired: 'Please enter recipient name',
    amountRequired: 'Please enter a valid amount greater than ₹0',
    phoneRequired: 'Please enter a 10-digit mobile number',

    // Risk Check Screen (Screen 3)
    checkingSafetyTitle: 'AI Safety Scan in Progress...',
    checkingSafetySubtitle: 'Analyzing recipient history, payment velocity, and unusual amounts',
    safetyCheckComplete: 'Safety Check Complete',
    riskLevelLabel: 'Risk Level:',
    lowRiskTitle: 'Low Risk — Safe to Proceed',
    mediumRiskTitle: 'Medium Risk — Please Verify Carefully',
    highRiskTitle: 'High Risk — Caution Advised',
    proceedToExplanation: 'Review Explanation Before Paying',

    // Explain Before You Pay (Screen 4 - Signature feature)
    explainTitle: 'Explain Before You Pay',
    explainSubtitle: 'Please read this safety summary carefully before proceeding.',
    warningNotice: '⚠️ Before you pay',
    sendingSummary: 'You are sending ₹{amount} to {recipient}.',
    checklistTitle: 'Please verify these 3 safety rules:',
    check1: 'The receiver is the exact person you intended to pay.',
    check2: 'The payment amount (₹{amount}) is correct.',
    check3: 'Nobody is rushing, threatening, or pressuring you to pay.',
    pressuredPrompt: '🚨 Are you being rushed or pressured?',
    pressuredSub: 'Tap here if someone is asking you to hurry or stay on a call.',
    understandAndContinue: '✅ I Understand — Continue',
    goBackEdit: '↩️ Go Back & Edit',

    // Confirmation Screen (Screen 5)
    confirmTitle: 'Confirm Payment',
    confirmSubtitle: 'Final review before simulated transfer.',
    payingTo: 'Paying To',
    mobileNumber: 'Mobile Number',
    amountToPay: 'Amount to Pay',
    upiPinReminderTitle: 'Crucial Security Reminder:',
    upiPinReminder: 'Never enter your UPI PIN to RECEIVE money. UPI PIN is ONLY needed when you are SENDING money.',
    confirmPayButton: 'Confirm Simulated Payment of ₹{amount}',

    // Success Screen (Screen 6)
    paymentSuccessful: 'Payment Successful!',
    successSubtitle: 'Simulated payment completed safely.',
    transactionId: 'Transaction ID',
    paidTo: 'Paid to',
    amountPaid: 'Amount Paid',
    time: 'Date & Time',
    status: 'Status',
    simulatedBadgeNotice: 'This is a hackathon simulation. No real money was transferred.',

    // History Screen (Screen 7)
    historyTitle: 'Transaction History',
    historySubtitle: 'All past and session payments monitored by SafePay.',
    filterAll: 'All Transactions',
    filterSafe: 'Safe Only',
    filterReviewed: 'Reviewed / Warning',
    noTransactions: 'No transactions found.',
    safeBadge: '✓ Safe',
    reviewedBadge: '⚠️ Reviewed',
    simulatedTag: 'SIMULATED',

    // Emergency Stop Modal (§10)
    emergencyTitle: '🚨 Take a moment.',
    emergencyHeadline: 'If someone is rushing or pressuring you to make this payment, STOP now.',
    emergencyReason1: 'Scammers frequently create fake emergencies (family trouble, electricity cuts, or fake parcel customs).',
    emergencyReason2: 'Scammers demand immediate payment while staying on the phone with you.',
    emergencyReason3: 'Never download screen-sharing apps like AnyDesk or TeamViewer during payments.',
    emergencyCancelButton: '❌ Cancel Payment Now (Safe)',
    emergencyVerifyButton: 'I Have Verified Independently — Continue',

    // Scam Education Stay Safe Tips (§9)
    staySafeTitle: '🛡️ SafePay Safety Rules',
    staySafeSubtitle: 'Essential tips to protect yourself from digital payment fraud:',
    tip1Title: 'Never share your UPI PIN or OTP',
    tip1Desc: 'Bank officials, customer service, or police will NEVER ask for your UPI PIN or OTP.',
    tip2Title: 'You NEVER need a PIN to receive money',
    tip2Desc: 'If someone says "Enter your PIN to receive ₹5,000 refund/lottery", it is 100% a scam to steal your money.',
    tip3Title: "Don't pay because someone pressures you",
    tip3Desc: 'Urgency is the #1 tool of scammers. Take a breath and ask a trusted family member first.',
    tip4Title: 'Always verify the receiver name',
    tip4Desc: 'Always verify the legal name shown on screen matches the person or shop you intended.',
    tip5Title: 'Check the amount before confirming',
    tip5Desc: 'Ensure no extra zeroes were accidentally added (e.g., ₹50,000 instead of ₹5,000).',
    close: 'Close Safety Guide',

    // TTS Scripts
    ttsPrefix: 'Attention. SafePay safety check.',
    ttsSafe: 'This payment to {recipient} for {amount} rupees looks safe. You have sent money to this person before.',
    ttsMedium: 'Warning. You are sending {amount} rupees to {recipient}. This is a new recipient you have not paid before. Please verify receiver carefully.',
    ttsHigh: 'High risk alert! You are sending {amount} rupees to {recipient}. This is an unusually large amount to an unfamiliar receiver. If you are feeling pressured, cancel the payment now.',
  },

  ta: {
    appTitle: 'SafePay',
    appSubtitle: 'நம்பிக்கையுடன் பணம் செலுத்துங்கள். செலுத்தும் முன் நாங்கள் சரிபார்க்கிறோம்.',
    tagline: '🛡️ உங்கள் கட்டணப் பாதுகாப்பு உதவியாளர்',
    prototypeBadge: 'மாதிரி பரிவர்த்தனை மட்டுமே • உண்மையான பணம் அல்ல',
    
    // Quick Demo Scenarios
    demoScenariosTitle: 'நீதிபதிகள் பரிசோதனை பொத்தான்கள்:',
    scenarioA: 'வகை A (பாதுகாப்பானது)',
    scenarioB: 'வகை B (புதிய நபர்)',
    scenarioC: 'வகை C (சந்தேகத்திற்குரியது)',
    scenarioADesc: 'பிரியா சர்மா • ₹500 (குறைந்த ஆபத்து 🟢)',
    scenarioBDesc: 'ராகுல் குமார் • ₹5,000 (நடுத்தர ஆபத்து 🟠)',
    scenarioCDesc: 'தெரியாத நபர் • ₹50,000 (அதிக ஆபத்து 🔴)',
    
    // Nav & Common
    home: 'முகப்பு',
    sendMoney: 'பணம் அனுப்பு',
    scanQr: 'QR ஸ்கேன் (விரைவில்)',
    history: 'பரிவர்த்தனை வரலாறு',
    staySafe: 'பாதுகாப்பு வழிகாட்டி',
    back: 'பின்செல்க',
    cancel: 'பரிவர்த்தனையை ரத்துசெய்',
    continue: 'தொடர்க',
    done: 'முடிந்தது',
    viewHistory: 'வரலாற்றைப் பார்',
    loading: 'பாதுகாப்பு பரிசோதனை நடைபெறுகிறது...',
    listen: 'கேட்க (குரல்)',
    stopAudio: 'நிறுத்து',
    soundPlaying: 'பேசுகிறது...',
    audioNotSupported: 'குரல் வசதி கிடைக்கவில்லை',

    // Home Screen
    welcomeTitle: 'SafePay கட்டணக் கவசம்',
    welcomeDesc: 'மோசடிகள், தவறான எண்கள் மற்றும் அவசரப் பணப்பரிமாற்றங்களில் இருந்து உங்களைப் பாதுகாக்க உதவுகிறது.',
    quickActions: 'விரைவுச் செயல்கள்',
    recentActivity: 'சமீபத்திய பாதுகாக்கப்பட்ட பரிவர்த்தனைகள்',
    viewAllHistory: 'முழு வரலாற்றையும் காண்க',
    scamPreventionCardTitle: '🛡️ SafePay AI பாதுகாப்பு',
    scamPreventionCardDesc: 'உங்கள் வங்கிக் கணக்கிலிருந்து பணம் செல்லும் முன் புதிய பெறுநர் மற்றும் அசாதாரண தொகைகளை AI ஆய்வு செய்கிறது.',

    // Send Money Screen
    sendMoneyTitle: 'பணம் அனுப்பும் விவரங்கள்',
    sendMoneySubtitle: 'பணம் பெற வேண்டிய நபரின் பெயர், தொலைபேசி எண் மற்றும் தொகையை உள்ளிடவும்.',
    recipientNameLabel: 'பெறுநர் பெயர்',
    recipientNamePlaceholder: 'உதா. Priya Sharma அல்லது Rahul Kumar',
    phoneNumberLabel: 'கைப்பேசி எண்',
    phoneNumberPlaceholder: 'உதா. 98765 43210',
    amountLabel: 'தொகை (₹)',
    amountPlaceholder: 'உதா. 5000',
    quickSelectKnown: 'அல்லது அடிக்கடி அனுப்பும் நபரைத் தேர்ந்தெடுக்கவும்:',
    continueSafetyCheck: 'பாதுகாப்பைச் சரிபார்த்துத் தொடரவும்',
    nameRequired: 'பெறுநர் பெயரை உள்ளிடவும்',
    amountRequired: 'சரியான தொகையை உள்ளிடவும்',
    phoneRequired: '10 இலக்க மொபைல் எண்ணை உள்ளிடவும்',

    // Risk Check Screen (Screen 3)
    checkingSafetyTitle: 'AI பாதுகாப்பு சோதனை நடைபெறுகிறது...',
    checkingSafetySubtitle: 'பெறுநர் வரலாறு மற்றும் தொகை பாதுகாப்பை மதிப்பாய்வு செய்கிறது',
    safetyCheckComplete: 'பாதுகாப்பு சோதனை முடிந்தது',
    riskLevelLabel: 'ஆபத்து நிலை:',
    lowRiskTitle: 'குறைந்த ஆபத்து — பாதுகாப்பானது',
    mediumRiskTitle: 'நடுத்தர ஆபத்து — கவனமாக சரிபார்க்கவும்',
    highRiskTitle: 'அதிக ஆபத்து — எச்சரிக்கையுடன் இருங்கள்',
    proceedToExplanation: 'பணம் செலுத்தும் முன் விளக்கத்தைப் பார்க்கவும்',

    // Explain Before You Pay (Screen 4 - Signature feature)
    explainTitle: 'பணம் செலுத்தும் முன் விளக்கம்',
    explainSubtitle: 'தொடர்வதற்கு முன் இந்த எச்சரிக்கைக் குறிப்பை கவனமாகப் படிக்கவும்.',
    warningNotice: '⚠️ பணம் அனுப்பும் முன் சரிபார்க்கவும்',
    sendingSummary: 'நீங்கள் ₹{amount} தொகையை {recipient} என்பவருக்கு அனுப்ப உள்ளீர்கள்.',
    checklistTitle: 'இந்த 3 பாதுகாப்பு விதிகளை உறுதிப்படுத்தவும்:',
    check1: 'பெறுநர் நீங்கள் பணம் அனுப்ப விரும்பிய அதே நபர்தான்.',
    check2: 'அனுப்பும் தொகை (₹{amount}) சரியானது.',
    check3: 'யாரும் உங்களை அவசரப்படுத்தவோ அல்லது மிரட்டவோ இல்லை.',
    pressuredPrompt: '🚨 யாராவது உங்களை அவசரப்படுத்துகிறார்களா?',
    pressuredSub: 'யாராவது போனில் பேசி அவசரமாகப் பணம் செலுத்தச் சொன்னால் இங்கு தொடவும்.',
    understandAndContinue: '✅ புரிந்து கொண்டேன் — பணம் செலுத்து',
    goBackEdit: '↩️ விவரங்களை மாற்ற பின்செல்க',

    // Confirmation Screen (Screen 5)
    confirmTitle: 'கட்டண உறுதிப்படுத்தல்',
    confirmSubtitle: 'இறுதி உறுதிப்படுத்தல்.',
    payingTo: 'பணம் பெறுபவர்',
    mobileNumber: 'கைப்பேசி எண்',
    amountToPay: 'செலுத்த வேண்டிய தொகை',
    upiPinReminderTitle: 'முக்கிய பாதுகாப்பு எச்சரிக்கை:',
    upiPinReminder: 'பணம் பெற ஒருபோதும் UPI PIN உள்ளிட வேண்டாம்! பணம் அனுப்ப மட்டுமே PIN தேவைப்படும்.',
    confirmPayButton: '₹{amount} தொகையை செலுத்த உறுதிசெய்',

    // Success Screen (Screen 6)
    paymentSuccessful: 'பணம் வெற்றிகரமாக அனுப்பப்பட்டது!',
    successSubtitle: 'மாதிரி பரிவர்த்தனை பாதுகாப்பாக முடிந்தது.',
    transactionId: 'பரிவர்த்தனை எண்',
    paidTo: 'பணம் பெற்றவர்',
    amountPaid: 'செலுத்தப்பட்ட தொகை',
    time: 'தேதி மற்றும் நேரம்',
    status: 'நிலை',
    simulatedBadgeNotice: 'இது ஒரு மாதிரி காட்சி மட்டுமே. எந்த உண்மையான பணமும் அனுப்பப்படவில்லை.',

    // History Screen (Screen 7)
    historyTitle: 'பரிவர்த்தனை வரலாறு',
    historySubtitle: 'SafePay மூலம் கண்காணிக்கப்பட்ட அனைத்துப் பரிவர்த்தனைகளும்.',
    filterAll: 'அனைத்து பரிவர்த்தனைகள்',
    filterSafe: 'பாதுகாப்பானவை மட்டும்',
    filterReviewed: 'எச்சரிக்கப்பட்டவை',
    noTransactions: 'பரிவர்த்தனைகள் எதுவும் இல்லை.',
    safeBadge: '✓ பாதுகாப்பானது',
    reviewedBadge: '⚠️ சரிபார்க்கப்பட்டது',
    simulatedTag: 'மாதிரி',

    // Emergency Stop Modal (§10)
    emergencyTitle: '🚨 ஒரு நிமிடம் நிறுத்துங்கள்.',
    emergencyHeadline: 'யாராவது உங்களை அவசரப்படுத்தினால், உடனடியாகப் பரிவர்த்தனையை நிறுத்துங்கள்!',
    emergencyReason1: 'மோசடி செய்பவர்கள் மின்சாரக் கட்டணம், பரிசுத்தொகை அல்லது உறவினர் ஆபத்து என பொய் கதைகளைக் கூறுவார்கள்.',
    emergencyReason2: 'அவர்கள் உங்களை அழைப்பில் வைத்து அவசரமாகப் பணம் அனுப்ப வற்புறுத்துவார்கள்.',
    emergencyReason3: 'AnyDesk அல்லது TeamViewer போன்ற திரைப் பகிர்வு செயலிகளை ஒருபோதும் பதிவிறக்காதீர்கள்.',
    emergencyCancelButton: '❌ உடனடியாக ரத்துசெய் (பாதுகாப்பானது)',
    emergencyVerifyButton: 'நான் சுயமாக விசாரித்து உறுதி செய்தேன் — தொடர்க',

    // Scam Education Stay Safe Tips (§9)
    staySafeTitle: '🛡️ SafePay பாதுகாப்பு விதிகள்',
    staySafeSubtitle: 'டிஜிட்டல் பண மோசடிகளிலிருந்து தப்பிக்க அவசியமான குறிப்புகள்:',
    tip1Title: 'UPI PIN அல்லது OTP ஐ யாரிடமும் பகிராதீர்கள்',
    tip1Desc: 'வங்கி ஊழியர்களோ காவல்துறையோ ஒருபோதும் உங்கள் PIN கேட்க மாட்டார்கள்.',
    tip2Title: 'பணம் பெற PIN தேவையில்லை',
    tip2Desc: 'யாராவது "பணம் பெற PIN போடுங்கள்" என்று கூறினால் அது 100% மோசடி.',
    tip3Title: 'அவசரப்படுத்துவதால் மட்டும் பணம் அனுப்பாதீர்கள்',
    tip3Desc: 'மோசடி நபர்களின் ஆயுதமே அவசரம். முதலில் உங்கள் குடும்பத்தாரிடம் கேளுங்கள்.',
    tip4Title: 'பெறுநரின் பெயரை எப்போதும் சரிபார்க்கவும்',
    tip4Desc: 'திரையில் தோன்றும் பெயர் நீங்கள் அனுப்ப விரும்பிய கடை அல்லது நபரின் பெயரா எனப் பாருங்கள்.',
    tip5Title: 'தொகையை எப்போதும் சரிபார்க்கவும்',
    tip5Desc: 'கூடுதல் பூஜ்ஜியங்கள் தவறாகப் போடப்படவில்லையா (₹5,000க்கு பதில் ₹50,000) எனச் சரிபார்க்கவும்.',
    close: 'பாதுகாப்பு வழிகாட்டியை மூடு',

    // TTS Scripts
    ttsPrefix: 'கவனிக்கவும். சேஃப்பே பாதுகாப்பு சோதனை.',
    ttsSafe: 'பிரியா சர்மா அவர்களுக்கு அனுப்பப்படும் இந்த தொகை பாதுகாப்பானது. வழக்கமான பரிவர்த்தனை.',
    ttsMedium: 'எச்சரிக்கை. நீங்கள் புதிய நபருக்கு பணம் அனுப்புகிறீர்கள். பணம் செலுத்தும் முன் பெறுநரின் பெயரைச் சரிபார்க்கவும்.',
    ttsHigh: 'அதி எச்சரிக்கை! தெரியாத நபருக்கு மிக அதிக தொகை அனுப்பப்படுகிறது. யாராவது அவசரப்படுத்தினால் பரிவர்த்தனையை ரத்து செய்யவும்.',
  },

  hi: {
    appTitle: 'SafePay',
    appSubtitle: 'विश्वास के साथ भुगतान करें। भुगतान से पहले हम जांच करते हैं।',
    tagline: '🛡️ आपका डिजिटल भुगतान सुरक्षा सहायक',
    prototypeBadge: 'केवल डेमो सिमुलेशन • वास्तविक पैसा नहीं',
    
    // Quick Demo Scenarios
    demoScenariosTitle: 'परीक्षण बटन (1-क्लिक भरें):',
    scenarioA: 'सिनेरियो A (सुरक्षित)',
    scenarioB: 'सिनेरियो B (नया प्राप्तकर्ता)',
    scenarioC: 'सिनेरियो C (संदिग्ध)',
    scenarioADesc: 'प्रिया शर्मा • ₹500 (कम जोखिम 🟢)',
    scenarioBDesc: 'राहुल कुमार • ₹5,000 (मध्यम जोखिम 🟠)',
    scenarioCDesc: 'अज्ञात • ₹50,000 (उच्च जोखिम 🔴)',
    
    // Nav & Common
    home: 'होम',
    sendMoney: 'पैसे भेजें',
    scanQr: 'QR स्कैन (जल्द आ रहा है)',
    history: 'लेनदेन इतिहास',
    staySafe: 'सुरक्षा नियम',
    back: 'पीछे जाएं',
    cancel: 'भुगतान रद्द करें',
    continue: 'आगे बढ़ें',
    done: 'हो गया',
    viewHistory: 'इतिहास देखें',
    loading: 'सुरक्षा जांच जारी है...',
    listen: 'सुनें (आवाज)',
    stopAudio: 'रोकें',
    soundPlaying: 'बोल रहा है...',
    audioNotSupported: 'आवाज उपलब्ध नहीं है',

    // Home Screen
    welcomeTitle: 'SafePay पेमेंट शील्ड',
    welcomeDesc: 'भुगतान पुष्टि से पहले सुरक्षा जांच, जो आपको फ्रॉड, गलत नंबर और दबाव में किए गए भुगतानों से बचाती है।',
    quickActions: 'त्वरित कार्य',
    recentActivity: 'हाल के सुरक्षित लेनदेन',
    viewAllHistory: 'पूरा इतिहास देखें',
    scamPreventionCardTitle: '🛡️ SafePay AI द्वारा सुरक्षित',
    scamPreventionCardDesc: 'आपके खाते से पैसा जाने से पहले AI प्राप्तकर्ता की पहचान और राशि की जांच करता है।',

    // Send Money Screen
    sendMoneyTitle: 'भुगतान विवरण दर्ज करें',
    sendMoneySubtitle: 'जिस व्यक्ति को पैसे भेजने हैं उनका नाम, फोन नंबर और राशि दर्ज करें।',
    recipientNameLabel: 'प्राप्तकर्ता का नाम',
    recipientNamePlaceholder: 'उदा. Priya Sharma या Rahul Kumar',
    phoneNumberLabel: 'मोबाइल नंबर',
    phoneNumberPlaceholder: 'उदा. 98765 43210',
    amountLabel: 'राशि (₹)',
    amountPlaceholder: 'उदा. 5000',
    quickSelectKnown: 'या पूर्व संपर्क चुनें:',
    continueSafetyCheck: 'सुरक्षा जांचें और आगे बढ़ें',
    nameRequired: 'कृपया प्राप्तकर्ता का नाम दर्ज करें',
    amountRequired: 'कृपया सही राशि दर्ज करें',
    phoneRequired: '10 अंकों का मोबाइल नंबर दर्ज करें',

    // Risk Check Screen (Screen 3)
    checkingSafetyTitle: 'AI सुरक्षा जांच चल रही है...',
    checkingSafetySubtitle: 'प्राप्तकर्ता इतिहास और भुगतान पैटर्न का विश्लेषण हो रहा है',
    safetyCheckComplete: 'सुरक्षा जांच पूरी हुई',
    riskLevelLabel: 'जोखिम स्तर:',
    lowRiskTitle: 'कम जोखिम — सुरक्षित है',
    mediumRiskTitle: 'मध्यम जोखिम — कृपया ध्यान से जांचें',
    highRiskTitle: 'उच्च जोखिम — अत्यधिक सावधानी आवश्यक',
    proceedToExplanation: 'भुगतान से पहले कारण समझें',

    // Explain Before You Pay (Screen 4 - Signature feature)
    explainTitle: 'भुगतान करने से पहले समझें',
    explainSubtitle: 'आगे बढ़ने से पहले कृपया यह सुरक्षा सारांश ध्यान से पढ़ें।',
    warningNotice: '⚠️ भुगतान से पहले जांचें',
    sendingSummary: 'आप {recipient} को ₹{amount} भेज रहे हैं।',
    checklistTitle: 'कृपया इन 3 सुरक्षा नियमों की पुष्टि करें:',
    check1: 'प्राप्तकर्ता वही व्यक्ति है जिसे आप पैसे भेजना चाहते हैं।',
    check2: 'भुगतान राशि (₹{amount}) बिल्कुल सही है।',
    check3: 'कोई भी आप पर दबाव या जल्दबाजी नहीं बना रहा है।',
    pressuredPrompt: '🚨 क्या कोई आप पर दबाव बना रहा है?',
    pressuredSub: 'यदि कोई आपको फोन पर जल्दबाजी करने को कह रहा है तो यहां टैप करें।',
    understandAndContinue: '✅ मैं समझ गया — भुगतान करें',
    goBackEdit: '↩️ विवरण बदलने के लिए पीछे जाएं',

    // Confirmation Screen (Screen 5)
    confirmTitle: 'भुगतान की पुष्टि करें',
    confirmSubtitle: 'अंतिम समीक्षा।',
    payingTo: 'प्राप्तकर्ता',
    mobileNumber: 'मोबाइल नंबर',
    amountToPay: 'भुगतान राशि',
    upiPinReminderTitle: 'अति महत्वपूर्ण सुरक्षा चेतावनी:',
    upiPinReminder: 'पैसे प्राप्त करने के लिए कभी भी अपना UPI PIN दर्ज न करें! PIN केवल पैसे भेजने के लिए होता है।',
    confirmPayButton: '₹{amount} का भुगतान कन्फर्म करें',

    // Success Screen (Screen 6)
    paymentSuccessful: 'भुगतान सफल रहा!',
    successSubtitle: 'सिम्युलेटेड भुगतान सुरक्षित रूप से पूरा हुआ।',
    transactionId: 'लेनदेन संख्या (ID)',
    paidTo: 'भुगतान प्राप्तकर्ता',
    amountPaid: 'भुगतान राशि',
    time: 'दिनांक और समय',
    status: 'स्थिति',
    simulatedBadgeNotice: 'यह केवल एक प्रोटोटाइप डेमो है। कोई वास्तविक धन हस्तांतरित नहीं किया गया है।',

    // History Screen (Screen 7)
    historyTitle: 'लेनदेन इतिहास',
    historySubtitle: 'SafePay द्वारा मॉनिटर किए गए सभी पिछले और वर्तमान लेनदेन।',
    filterAll: 'सभी लेनदेन',
    filterSafe: 'केवल सुरक्षित',
    filterReviewed: 'समीक्षित / चेतावनी',
    noTransactions: 'कोई लेनदेन नहीं मिला।',
    safeBadge: '✓ सुरक्षित',
    reviewedBadge: '⚠️ समीक्षित',
    simulatedTag: 'सिम्युलेटेड',

    // Emergency Stop Modal (§10)
    emergencyTitle: '🚨 एक मिनट रुकिए।',
    emergencyHeadline: 'यदि कोई आप पर इस भुगतान के लिए दबाव बना रहा है, तो अभी रुकें!',
    emergencyReason1: 'धोखेबाज अक्सर बिजली बिल कटने, लॉटरी या परिवार में आपातकाल का बहाना बनाते हैं।',
    emergencyReason2: 'वे कॉल पर रहते हुए तुरंत पैसे भेजने की मांग करते हैं।',
    emergencyReason3: 'भुगतान के दौरान कभी भी AnyDesk या TeamViewer जैसे स्क्रीन-शेयरिंग ऐप डाउनलोड न करें।',
    emergencyCancelButton: '❌ अभी भुगतान रद्द करें (सुरक्षित)',
    emergencyVerifyButton: 'मैंने स्वतंत्र रूप से जांच की है — जारी रखें',

    // Scam Education Stay Safe Tips (§9)
    staySafeTitle: '🛡️ SafePay सुरक्षा नियम',
    staySafeSubtitle: 'डिजिटल फ्रॉड से बचने के लिए जरूरी नियम:',
    tip1Title: 'UPI PIN या OTP कभी किसी से शेयर न करें',
    tip1Desc: 'बैंक या पुलिस कभी भी आपसे आपका गोपनीय UPI PIN नहीं मांगते।',
    tip2Title: 'पैसे पाने के लिए PIN की जरूरत नहीं होती',
    tip2Desc: 'यदि कोई कहे "पैसा पाने के लिए PIN डालें", तो वह 100% फ्रॉड है।',
    tip3Title: 'दबाव या जल्दबाजी में कभी भुगतान न करें',
    tip3Desc: 'जल्दबाजी ठगों का मुख्य हथियार है। रुकें और पहले परिवार के किसी सदस्य से पूछें।',
    tip4Title: 'प्राप्तकर्ता का नाम हमेशा जांचें',
    tip4Desc: 'स्क्रीन पर दिख रहा नाम हमेशा उस व्यक्ति या दुकान से मेल खाना चाहिए जिसे आप भेजना चाहते हैं।',
    tip5Title: 'पुष्टि करने से पहले राशि जांचें',
    tip5Desc: 'सुनिश्चित करें कि गलती से अतिरिक्त शून्य न लग गए हों (जैसे ₹5,000 की जगह ₹50,000)।',
    close: 'सुरक्षा गाइड बंद करें',

    // TTS Scripts
    ttsPrefix: 'ध्यान दें। सेफ-पे सुरक्षा जांच।',
    ttsSafe: 'प्रिया शर्मा को {amount} रुपये का यह भुगतान सुरक्षित लग रहा है। यह एक सामान्य भुगतान है।',
    ttsMedium: 'चेतावनी। आप {recipient} को {amount} रुपये भेज रहे हैं। यह एक नया प्राप्तकर्ता है। भुगतान से पहले ध्यानपूर्वक पुष्टि करें।',
    ttsHigh: 'अति जोखिम चेतावनी! आप अपरिचित प्राप्तकर्ता को {amount} रुपये की बड़ी राशि भेज रहे हैं। यदि कोई दबाव बना रहा है, तो तुरंत रद्द करें।',
  }
};
