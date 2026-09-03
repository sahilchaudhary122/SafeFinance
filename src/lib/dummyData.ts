import type { AiEvidenceReviewResult } from './aiEvidenceReview';
import type { PaymentReasonCode } from './i18n';

export type ThemeMode = 'light' | 'dark';
export type PaymentType = 'p2p' | 'merchant';
export type PaymentDirection = 'debit' | 'credit';
export type TransactionStatus = 'completed' | 'pending_reflection' | 'under_review' | 'frozen';
export type ContactRelationship = 'new' | 'known' | 'family';

export type EvidenceStatus =
  | 'none'
  | 'submitted'
  | 'ai_review_complete'
  | 'further_review'
  | 'mismatch_detected';

export interface EvidenceSubmission {
  category: 'impersonation' | 'urgency_pressure' | 'wrong_recipient' | 'fake_qr' | 'other';
  categoryLabel: string;
  description: string;
  screenshotName?: string;
  screenshotPreviewUrl?: string;
  documentName?: string;
  submittedAt: string;
  caseId: string;
}

export interface FreezeRequest {
  caseId: string;
  requestedBy: string;
  reason: string;
  note: string;
  evidenceFiles: string[];
  requestedAt: string;
}

export interface Transaction {
  id: string;
  recipientName: string;
  phoneNumber: string;
  amount: number;
  dateStr: string;
  timestamp: string;
  createdAt: string;
  settledAt: string;
  status: TransactionStatus;
  isNewContact: boolean;
  contactRelationship: ContactRelationship;
  isSimulated: boolean;
  category?: string;
  evidenceStatus?: EvidenceStatus;
  evidence?: EvidenceSubmission;
  aiReviewResult?: AiEvidenceReviewResult;
  paymentType: PaymentType;
  direction: PaymentDirection;
  senderUsername: string;
  receiverUsername?: string;
  reason: string;
  reasonCode: PaymentReasonCode;
  freezeEligible: boolean;
  settlementDelayMinutes: number;
  freezeRequest?: FreezeRequest;
}

export interface DemoAccount {
  username: string;
  password: string;
  fullName: string;
  upiId: string;
  phoneNumber: string;
  openingBalance: number;
  role: 'sender' | 'receiver' | 'member';
}

export interface PayeeDefinition {
  name: string;
  upiId: string;
  phoneNumber: string;
  paymentType: PaymentType;
  receiverUsername?: string;
  defaultReasonCode: PaymentReasonCode;
  suggestedAmount: number;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    username: 'sahilchaudhary',
    password: 'sahil1122',
    fullName: 'Sahil Chaudhary',
    upiId: 'sahilchaudhary@safefinance',
    phoneNumber: '9876543210',
    openingBalance: 125000,
    role: 'sender'
  },
  {
    username: 'tilak',
    password: 'tilak1122',
    fullName: 'Tilak',
    upiId: 'tilak@safefinance',
    phoneNumber: '9123456780',
    openingBalance: 42000,
    role: 'receiver'
  }
];

export const QUICK_PAYEES: PayeeDefinition[] = [
  {
    name: 'Tilak',
    upiId: 'tilak@safefinance',
    phoneNumber: '9123456780',
    paymentType: 'p2p',
    receiverUsername: 'tilak',
    defaultReasonCode: 'family_support',
    suggestedAmount: 5000
  },
  {
    name: 'Fresh Basket Store',
    upiId: 'freshbasket@upi',
    phoneNumber: '9000011111',
    paymentType: 'merchant',
    defaultReasonCode: 'groceries',
    suggestedAmount: 850
  },
  {
    name: 'Metro Pharmacy',
    upiId: 'metrocare@upi',
    phoneNumber: '9000022222',
    paymentType: 'merchant',
    defaultReasonCode: 'medical',
    suggestedAmount: 640
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export function generateTransactionId(): string {
  const timePart = Date.now().toString().slice(-7);
  const randomPart = Math.floor(100 + Math.random() * 900);
  return `SFN${timePart}${randomPart}`;
}

export function generateCaseId(): string {
  const randomFiveDigits = Math.floor(10000 + Math.random() * 90000);
  return `CASE-${randomFiveDigits}`;
}

export function formatCurrency(amount: number) {
  return `Rs. ${amount.toLocaleString('en-IN')}`;
}

export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'SF';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function formatRelativeDate(isoDate: string, now = new Date()) {
  const date = new Date(isoDate);
  const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startOfNow.getTime() - startOfDate.getTime()) / 86400000);

  if (diffDays === 0) {
    return 'Today';
  }
  if (diffDays === 1) {
    return 'Yesterday';
  }
  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

export function formatTimestamp(isoDate: string) {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function minutesUntil(isoDate: string, now = new Date()) {
  const diff = new Date(isoDate).getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / 60000));
}
