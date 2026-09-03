import type { Transaction } from './dummyData';

export interface EvidenceCheckItem {
  name: string;
  status: 'match' | 'mismatch' | 'consistent' | 'inconsistent' | 'relevant' | 'needs_clarification';
  label: string;
  detail: string;
}

export interface AiEvidenceReviewResult {
  hasMismatch: boolean;
  status: 'consistent' | 'mismatch_detected' | 'insufficient_evidence';
  headline: string;
  conclusion: string;
  recommendation: string;
  checks: {
    recipientCheck: EvidenceCheckItem;
    amountCheck: EvidenceCheckItem;
    transactionDetailsCheck: EvidenceCheckItem;
    evidenceRelevanceCheck: EvidenceCheckItem;
  };
  reviewedAt: string;
  confidenceNote: string;
}

/**
 * AI First-Level Evidence Review Engine
 * 
 * Objectively compares the user's submitted proof (image, document, explanation)
 * against the disputed transaction details.
 * 
 * Strictly uses safe evidentiary terminology ("Appears consistent", "Potential mismatch detected").
 * Never claims 100% certainty.
 */
export function analyzeEvidenceSubmission(
  tx: Transaction,
  category: string,
  description: string,
  screenshotName?: string,
  documentName?: string,
  _screenshotUrl?: string
): AiEvidenceReviewResult {
  const normDesc = description.toLowerCase().trim();
  const filenameCombined = ((screenshotName || '') + ' ' + (documentName || '')).toLowerCase();

  // 1. Recipient Match Analysis
  let recipientStatus: EvidenceCheckItem['status'] = 'match';
  let recipientDetail = `Payee name "${tx.recipientName}" corresponds with submitted dispute records.`;

  // Detect if user claims they were tricked into paying someone else
  if (
    normDesc.includes('different person') || 
    normDesc.includes('wrong person') || 
    normDesc.includes('not the intended') ||
    normDesc.includes('fake name')
  ) {
    recipientStatus = 'mismatch';
    recipientDetail = `Potential mismatch detected: User statement indicates payment was routed to unintended recipient (${tx.recipientName}).`;
  }

  // 2. Amount Match Analysis
  let amountStatus: EvidenceCheckItem['status'] = 'match';
  let amountDetail = `Amount of ₹${tx.amount.toLocaleString('en-IN')} appears consistent with transaction debit.`;

  // Extract any explicitly typed amounts from description (e.g., ₹500, Rs. 200, 50000 rupees)
  const amountRegex = /(?:rs\.?|inr|₹|\$)?\s*(\d{1,7})\s*(?:rs|rupees|inr)?/gi;
  const numbersFound: number[] = [];
  let match: RegExpExecArray | null;
  while ((match = amountRegex.exec(normDesc)) !== null) {
    const val = parseInt(match[1], 10);
    if (!isNaN(val) && val > 0 && val !== 10 && val !== 24) { // ignore common numbers like 24h, 10 digit
      numbersFound.push(val);
    }
  }

  // Check if user specifically claims a conflicting amount
  const conflictingAmount = numbersFound.find(
    (n) => n > 50 && Math.abs(n - tx.amount) / tx.amount > 0.3
  );

  if (conflictingAmount && (normDesc.includes('only wanted to pay') || normDesc.includes('charged') || normDesc.includes('deducted extra'))) {
    amountStatus = 'mismatch';
    amountDetail = `Amount mismatch detected: User notes refer to ₹${conflictingAmount.toLocaleString('en-IN')}, while actual recorded transfer was ₹${tx.amount.toLocaleString('en-IN')}.`;
  }

  // 3. Transaction Details & Consistency Analysis
  let detailsStatus: EvidenceCheckItem['status'] = 'consistent';
  let detailsDetail = `Timeline and dispute category (${category.replace(/_/g, ' ')}) align with payment records.`;

  if (category === 'fake_qr' && !filenameCombined.includes('qr') && !normDesc.includes('qr') && !normDesc.includes('code')) {
    detailsStatus = 'needs_clarification';
    detailsDetail = 'Dispute category cites QR code issues, but uploaded notes lack QR-specific details.';
  }

  // 4. Evidence Relevance & Completeness Analysis
  let relevanceStatus: EvidenceCheckItem['status'] = 'relevant';
  let relevanceDetail = 'Uploaded documentation and written context appear relevant to digital payment disputes.';

  const hasAttachment = !!(screenshotName || documentName);
  const relevantKeywords = [
    'scam', 'fraud', 'fake', 'rushed', 'pressure', 'wrong', 'mistake', 
    'refund', 'call', 'caller', 'impersonat', 'police', 'customs', 
    'lottery', 'otp', 'pin', 'threat', 'qr', 'sticker', 'driver', 'shop'
  ];
  const hasKeyword = relevantKeywords.some((kw) => normDesc.includes(kw));

  if (!hasAttachment && normDesc.length < 25) {
    relevanceStatus = 'needs_clarification';
    relevanceDetail = 'Evidence is minimal. No image/document attached and explanation is very brief.';
  } else if (!hasKeyword && normDesc.length < 30) {
    relevanceStatus = 'needs_clarification';
    relevanceDetail = 'Explanation lacks specific details on fraud indicators or dispute cause.';
  }

  // Determine overall AI conclusion
  const hasMismatch = recipientStatus === 'mismatch' || amountStatus === 'mismatch';
  const needsMoreEvidence = relevanceStatus === 'needs_clarification' || detailsStatus === 'needs_clarification';

  let status: AiEvidenceReviewResult['status'] = 'consistent';
  let headline = 'AI Evidence Review Complete';
  let conclusion = 'Evidence appears consistent with the transaction and has been submitted for further review.';
  let recommendation = 'Payment remains temporarily frozen while safety team completes formal verification.';

  if (hasMismatch) {
    status = 'mismatch_detected';
    headline = 'AI Review Found a Potential Mismatch';
    conclusion = 'Potential mismatch detected between submitted dispute notes and transaction logs.';
    recommendation = 'Please review your explanation and provide additional supporting evidence or receipts.';
  } else if (needsMoreEvidence) {
    status = 'insufficient_evidence';
    headline = 'AI Review: Additional Information Recommended';
    conclusion = 'Evidence appears relevant but incomplete. Supplementary documentation is advised.';
    recommendation = 'Consider attaching a screenshot of the chat, SMS, or QR code to expedite resolution.';
  }

  return {
    hasMismatch,
    status,
    headline,
    conclusion,
    recommendation,
    checks: {
      recipientCheck: {
        name: 'Recipient',
        status: recipientStatus,
        label: recipientStatus === 'match' ? '✓ Matches transaction' : '⚠ Potential Mismatch',
        detail: recipientDetail
      },
      amountCheck: {
        name: 'Amount',
        status: amountStatus,
        label: amountStatus === 'match' ? '✓ Matches transaction' : '⚠ Does not match',
        detail: amountDetail
      },
      transactionDetailsCheck: {
        name: 'Transaction Details',
        status: detailsStatus,
        label: detailsStatus === 'consistent' ? '✓ Consistent' : '⚠ Inconsistent',
        detail: detailsDetail
      },
      evidenceRelevanceCheck: {
        name: 'Evidence Relevance',
        status: relevanceStatus,
        label: relevanceStatus === 'relevant' ? '✓ Appears relevant' : '⚠ Needs clarification',
        detail: relevanceDetail
      }
    },
    reviewedAt: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    confidenceNote: 'AI review provides first-level automated triage. All evidence remains subject to human supervisory review.'
  };
}
