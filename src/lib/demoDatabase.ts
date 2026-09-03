import {
  DEMO_ACCOUNTS,
  QUICK_PAYEES,
  formatRelativeDate,
  formatTimestamp,
  generateCaseId,
  generateTransactionId,
  type DemoAccount,
  type PaymentDirection,
  type PaymentType,
  type PayeeDefinition,
  type Transaction
} from './dummyData';
import { FREEZE_WINDOW_MINUTES, NEW_ACCOUNT_OPENING_BALANCE, SETTLEMENT_DELAY_MINUTES } from './config';
import type { PaymentReasonCode } from './i18n';

const STORAGE_KEY = 'safefinance_local_db_v1';

interface StoredTransaction {
  id: string;
  senderUsername: string;
  senderName: string;
  receiverUsername?: string;
  receiverName: string;
  receiverPhoneOrUpi: string;
  amount: number;
  createdAt: string;
  settledAt: string;
  paymentType: PaymentType;
  reasonCode: PaymentReasonCode;
  reasonLabel: string;
  freezeRequest?: Transaction['freezeRequest'];
}

interface DemoDatabase {
  accounts: DemoAccount[];
  transactions: StoredTransaction[];
}

export interface DerivedAccountSnapshot {
  account: DemoAccount;
  balance: number;
  pendingIncomingAmount: number;
  pendingIncomingCount: number;
  frozenIncomingAmount: number;
  frozenIncomingCount: number;
  transactions: Transaction[];
}

export interface CreateAccountInput {
  username: string;
  password: string;
  fullName: string;
  upiId: string;
  phoneNumber: string;
}

export interface CreatePaymentInput {
  senderUsername: string;
  recipientName: string;
  recipientPhoneOrUpi: string;
  amount: number;
  paymentType: PaymentType;
  reasonCode: PaymentReasonCode;
  reasonLabel: string;
}

function buildSeedTransactions(now = new Date()): StoredTransaction[] {
  const merchantTime = new Date(now.getTime() - 1000 * 60 * 60 * 22).toISOString();
  const p2pTime = new Date(now.getTime() - 1000 * 60 * 60 * 48).toISOString();

  return [
    {
      id: 'SFN240001',
      senderUsername: 'sahilchaudhary',
      senderName: 'Sahil Chaudhary',
      receiverName: 'Fresh Basket Store',
      receiverPhoneOrUpi: 'freshbasket@upi',
      amount: 850,
      createdAt: merchantTime,
      settledAt: merchantTime,
      paymentType: 'merchant',
      reasonCode: 'groceries',
      reasonLabel: 'Groceries'
    },
    {
      id: 'SFN240002',
      senderUsername: 'sahilchaudhary',
      senderName: 'Sahil Chaudhary',
      receiverUsername: 'tilak',
      receiverName: 'Tilak',
      receiverPhoneOrUpi: 'tilak@safefinance',
      amount: 2400,
      createdAt: p2pTime,
      settledAt: new Date(new Date(p2pTime).getTime() + SETTLEMENT_DELAY_MINUTES * 60000).toISOString(),
      paymentType: 'p2p',
      reasonCode: 'family_support',
      reasonLabel: 'Family support'
    }
  ];
}

function createInitialDb(): DemoDatabase {
  return {
    accounts: DEMO_ACCOUNTS,
    transactions: buildSeedTransactions()
  };
}

function writeDb(db: DemoDatabase) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

export function readDb(): DemoDatabase {
  if (typeof window === 'undefined') {
    return createInitialDb();
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initialDb = createInitialDb();
    writeDb(initialDb);
    return initialDb;
  }

  try {
    const parsed = JSON.parse(raw) as DemoDatabase;
    if (!Array.isArray(parsed.accounts) || !Array.isArray(parsed.transactions)) {
      const initialDb = createInitialDb();
      writeDb(initialDb);
      return initialDb;
    }
    return parsed;
  } catch {
    const initialDb = createInitialDb();
    writeDb(initialDb);
    return initialDb;
  }
}

export function listDemoAccounts() {
  return readDb().accounts;
}

export function authenticateUser(username: string, password: string) {
  const db = readDb();
  return db.accounts.find(
    (account) => account.username === username.trim() && account.password === password
  ) || null;
}

export function createAccount(input: CreateAccountInput) {
  const db = readDb();
  const username = input.username.trim().toLowerCase();
  const fullName = input.fullName.trim();
  const upiId = input.upiId.trim().toLowerCase();
  const phoneNumber = input.phoneNumber.replace(/\D/g, '');

  if (!/^[a-z0-9._-]{3,30}$/.test(username)) {
    return { ok: false as const, error: 'Choose a username with 3–30 letters, numbers, dots, hyphens, or underscores.' };
  }
  if (fullName.length < 2) {
    return { ok: false as const, error: 'Enter your full name.' };
  }
  if (input.password.length < 6) {
    return { ok: false as const, error: 'Password must have at least 6 characters.' };
  }
  if (!/^[a-z0-9._-]{2,}@[a-z0-9._-]{2,}$/i.test(upiId)) {
    return { ok: false as const, error: 'Enter a valid UPI ID, for example name@safefinance.' };
  }
  if (!/^\d{10}$/.test(phoneNumber)) {
    return { ok: false as const, error: 'Enter a valid 10-digit mobile number.' };
  }
  if (db.accounts.some((account) => account.username === username)) {
    return { ok: false as const, error: 'That username is already in use.' };
  }
  if (db.accounts.some((account) => account.upiId.toLowerCase() === upiId)) {
    return { ok: false as const, error: 'That UPI ID is already in use.' };
  }
  if (db.accounts.some((account) => account.phoneNumber === phoneNumber)) {
    return { ok: false as const, error: 'That mobile number is already in use.' };
  }

  const account: DemoAccount = {
    username,
    password: input.password,
    fullName,
    upiId,
    phoneNumber,
    openingBalance: NEW_ACCOUNT_OPENING_BALANCE,
    role: 'member'
  };

  writeDb({ ...db, accounts: [...db.accounts, account] });
  return { ok: true as const, account };
}

export function findPayeeByType(paymentType: PaymentType, receiverName?: string): PayeeDefinition[] {
  return QUICK_PAYEES.filter((payee) => {
    if (payee.paymentType !== paymentType) return false;
    if (!receiverName) return true;
    return payee.name.toLowerCase().includes(receiverName.toLowerCase());
  });
}

function countPersonalPaymentsToPayee(
  transactions: StoredTransaction[],
  senderUsername: string,
  recipientName: string,
  recipientPhoneOrUpi?: string
) {
  const normalizedName = recipientName.trim().toLowerCase();
  const normalizedAddress = recipientPhoneOrUpi?.trim().toLowerCase();

  return transactions.filter(
    (transaction) =>
      transaction.senderUsername === senderUsername &&
      transaction.paymentType === 'p2p' &&
      (transaction.receiverName.trim().toLowerCase() === normalizedName ||
        (!!normalizedAddress && transaction.receiverPhoneOrUpi.trim().toLowerCase() === normalizedAddress))
  ).length;
}

function getContactRelationship(paymentCount: number): Transaction['contactRelationship'] {
  if (paymentCount > 3) return 'known';
  return 'new';
}

export function createPayment(input: CreatePaymentInput) {
  const db = readDb();
  const sender = db.accounts.find((account) => account.username === input.senderUsername);

  if (!sender) {
    return { ok: false as const, error: 'Sender account not found.' };
  }

  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return { ok: false as const, error: 'Enter a valid payment amount.' };
  }

  const senderSnapshot = deriveAccountSnapshot(input.senderUsername, db);
  if (senderSnapshot.balance < input.amount) {
    return { ok: false as const, error: 'Insufficient balance.' };
  }

  const receiverAccount = db.accounts.find(
    (account) =>
      account.username.toLowerCase() === input.recipientName.trim().toLowerCase() ||
      account.fullName.toLowerCase() === input.recipientName.trim().toLowerCase() ||
      account.upiId.toLowerCase() === input.recipientPhoneOrUpi.trim().toLowerCase() ||
      account.phoneNumber === input.recipientPhoneOrUpi.replace(/\D/g, '')
  );

  if (input.paymentType === 'p2p' && receiverAccount?.username === sender.username) {
    return { ok: false as const, error: 'You cannot send money to your own account.' };
  }

  const createdAt = new Date().toISOString();
  const settledAt =
    input.paymentType === 'p2p'
      ? new Date(Date.now() + SETTLEMENT_DELAY_MINUTES * 60000).toISOString()
      : createdAt;

  const storedTransaction: StoredTransaction = {
    id: generateTransactionId(),
    senderUsername: sender.username,
    senderName: sender.fullName,
    receiverUsername: input.paymentType === 'p2p' ? receiverAccount?.username : undefined,
    receiverName:
      input.paymentType === 'p2p' && receiverAccount
        ? receiverAccount.fullName
        : input.recipientName.trim(),
    receiverPhoneOrUpi:
      input.paymentType === 'p2p' && receiverAccount
        ? receiverAccount.upiId
        : input.recipientPhoneOrUpi.trim(),
    amount: input.amount,
    createdAt,
    settledAt,
    paymentType: input.paymentType,
    reasonCode: input.reasonCode,
    reasonLabel: input.reasonLabel
  };

  const nextDb: DemoDatabase = {
    ...db,
    transactions: [storedTransaction, ...db.transactions]
  };
  writeDb(nextDb);

  return {
    ok: true as const,
    transaction: deriveTransactionForUser(storedTransaction, sender.username, nextDb)
  };
}

export function requestFreeze(
  transactionId: string,
  requestedBy: string,
  reason: string,
  note: string,
  evidenceFiles: string[] = []
) {
  const db = readDb();
  const transactionIndex = db.transactions.findIndex((transaction) => transaction.id === transactionId);

  if (transactionIndex === -1) {
    return { ok: false as const, error: 'Transaction not found.' };
  }

  const selectedTransaction = db.transactions[transactionIndex];
  if (selectedTransaction.paymentType !== 'p2p' || selectedTransaction.senderUsername !== requestedBy) {
    return { ok: false as const, error: 'Freeze is allowed only for outgoing P2P payments.' };
  }
  const transactionAgeMinutes = (Date.now() - new Date(selectedTransaction.createdAt).getTime()) / 60000;
  if (transactionAgeMinutes > FREEZE_WINDOW_MINUTES) {
    return { ok: false as const, error: 'Freeze requests are only available for one hour after a payment.' };
  }

  const freezeRequest = {
    caseId: generateCaseId(),
    requestedBy,
    reason,
    note,
    evidenceFiles,
    requestedAt: new Date().toISOString()
  };

  const nextTransactions = [...db.transactions];
  nextTransactions[transactionIndex] = {
    ...selectedTransaction,
    freezeRequest
  };

  writeDb({
    ...db,
    transactions: nextTransactions
  });

  return { ok: true as const, caseId: freezeRequest.caseId };
}

function deriveAccountSnapshot(username: string, db = readDb(), now = new Date()): DerivedAccountSnapshot {
  const account = db.accounts.find((item) => item.username === username);
  if (!account) {
    throw new Error(`Unknown account: ${username}`);
  }

  const transactions = db.transactions
    .map((transaction) => deriveTransactionForUser(transaction, username, db, now))
    .filter((transaction): transaction is Transaction => !!transaction)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());

  const frozenIncomingTransactions = db.transactions.filter(
    (transaction) =>
      transaction.receiverUsername === username &&
      !!transaction.freezeRequest
  );

  const balance = account.openingBalance
    - db.transactions
        .filter((transaction) => transaction.senderUsername === username)
        .reduce((sum, transaction) => sum + transaction.amount, 0)
    + db.transactions
        .filter(
          (transaction) =>
            transaction.receiverUsername === username &&
            !transaction.freezeRequest &&
            new Date(transaction.settledAt).getTime() <= now.getTime()
        )
        .reduce((sum, transaction) => sum + transaction.amount, 0);

  const pendingIncomingTransactions = db.transactions.filter(
    (transaction) =>
      transaction.receiverUsername === username && new Date(transaction.settledAt).getTime() > now.getTime()
  );

  return {
    account,
    balance,
    pendingIncomingAmount: pendingIncomingTransactions.reduce((sum, transaction) => sum + transaction.amount, 0),
    pendingIncomingCount: pendingIncomingTransactions.length,
    frozenIncomingAmount: frozenIncomingTransactions.reduce((sum, transaction) => sum + transaction.amount, 0),
    frozenIncomingCount: frozenIncomingTransactions.length,
    transactions
  };
}

function deriveTransactionForUser(
  storedTransaction: StoredTransaction,
  username: string,
  db = readDb(),
  now = new Date()
): Transaction | null {
  if (storedTransaction.senderUsername !== username && storedTransaction.receiverUsername !== username) {
    return null;
  }

  const isSender = storedTransaction.senderUsername === username;
  const direction: PaymentDirection = isSender ? 'debit' : 'credit';
  const isSettled = new Date(storedTransaction.settledAt).getTime() <= now.getTime();
  const isP2P = storedTransaction.paymentType === 'p2p';
  const contactPaymentCount = countPersonalPaymentsToPayee(
    db.transactions,
    storedTransaction.senderUsername,
    storedTransaction.receiverName,
    storedTransaction.receiverPhoneOrUpi
  );
  const contactRelationship = getContactRelationship(contactPaymentCount);

  let status: Transaction['status'] = 'completed';
  if (!isSender && storedTransaction.freezeRequest) {
    status = 'frozen';
  } else if (!isSender && isP2P && !isSettled) {
    status = 'pending_reflection';
  } else if (storedTransaction.freezeRequest) {
    status = 'under_review';
  }

  const displayName = isSender ? storedTransaction.receiverName : storedTransaction.senderName;
  const displayPhoneOrUpi = isSender
    ? storedTransaction.receiverPhoneOrUpi
    : db.accounts.find((account) => account.username === storedTransaction.senderUsername)?.upiId ||
      storedTransaction.senderName;

  return {
    id: storedTransaction.id,
    recipientName: displayName,
    phoneNumber: displayPhoneOrUpi,
    amount: storedTransaction.amount,
    dateStr: formatRelativeDate(storedTransaction.createdAt, now),
    timestamp: formatTimestamp(storedTransaction.createdAt),
    createdAt: storedTransaction.createdAt,
    settledAt: storedTransaction.settledAt,
    status,
    isNewContact: contactRelationship === 'new',
    contactRelationship,
    isSimulated: true,
    category: storedTransaction.reasonLabel,
    evidenceStatus: storedTransaction.freezeRequest ? 'submitted' : 'none',
    paymentType: storedTransaction.paymentType,
    direction,
    senderUsername: storedTransaction.senderUsername,
    receiverUsername: storedTransaction.receiverUsername,
    reason: storedTransaction.reasonLabel,
    reasonCode: storedTransaction.reasonCode,
    freezeEligible:
      isSender &&
      storedTransaction.paymentType === 'p2p' &&
      !storedTransaction.freezeRequest &&
      (now.getTime() - new Date(storedTransaction.createdAt).getTime()) / 60000 <= FREEZE_WINDOW_MINUTES,
    settlementDelayMinutes: storedTransaction.paymentType === 'p2p' ? SETTLEMENT_DELAY_MINUTES : 0,
    freezeRequest: storedTransaction.freezeRequest
  } satisfies Transaction;
}

export function getAccountSnapshot(username: string) {
  return deriveAccountSnapshot(username);
}

export function resetDemoDatabase() {
  writeDb(createInitialDb());
}
