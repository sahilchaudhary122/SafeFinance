import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  createAccount,
  createPayment,
  getAccountSnapshot,
  listDemoAccounts,
  requestFreeze,
  type CreateAccountInput,
  type DerivedAccountSnapshot
} from '../lib/demoDatabase';
import { HIGH_VALUE_MFA_THRESHOLD } from '../lib/config';
import {
  type DemoAccount,
  type EvidenceSubmission,
  type PaymentType,
  type ThemeMode,
  type Transaction
} from '../lib/dummyData';
import { inspectPaymentSafety, type SafetyScanResult } from '../lib/riskEngine';
import type { AiEvidenceReviewResult } from '../lib/aiEvidenceReview';
import {
  authenticateUser
} from '../lib/demoDatabase';
import type { PaymentReasonCode, SupportedLanguage } from '../lib/i18n';
import { getPaymentReasonLabel } from '../lib/i18n';
import { stopSpeaking } from '../lib/tts';

const SESSION_STORAGE_KEY = 'safefinance_current_user';
const THEME_STORAGE_KEY = 'safefinance_theme';
const LANGUAGE_STORAGE_KEY = 'safefinance_language';

export type Screen =
  | 'login'
  | 'home'
  | 'scan-qr'
  | 'send'
  | 'risk-check'
  | 'explain'
  | 'confirm'
  | 'success'
  | 'history';

export interface DraftPayment {
  recipientName: string;
  phoneNumber: string;
  amount: number | '';
  paymentType: PaymentType;
  reasonCode: PaymentReasonCode | '';
  customReason: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  transactionId: string;
}

interface AppContextType {
  screen: Screen;
  setScreen: (screen: Screen) => void;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  draftPayment: DraftPayment;
  setDraftPayment: React.Dispatch<React.SetStateAction<DraftPayment>>;
  updateDraft: (updates: Partial<DraftPayment>) => void;
  resetDraft: () => void;
  riskResult: SafetyScanResult | null;
  history: Transaction[];
  notifications: AppNotification[];
  lastTransaction: Transaction | null;
  currentUser: DemoAccount | null;
  demoAccounts: DemoAccount[];
  availableBalance: number;
  pendingIncomingAmount: number;
  pendingIncomingCount: number;
  frozenIncomingAmount: number;
  frozenIncomingCount: number;
  balanceVisible: boolean;
  checkBalance: () => void;
  toggleBalanceVisible: () => void;
  login: (username: string, password: string) => { success: boolean; message?: string };
  registerAccount: (input: CreateAccountInput) => { success: boolean; message?: string };
  logout: () => void;
  emergencyStopOpen: boolean;
  setEmergencyStopOpen: (open: boolean) => void;
  staySafeOpen: boolean;
  setStaySafeOpen: (open: boolean) => void;
  isPhoneFrame: boolean;
  setIsPhoneFrame: (val: boolean | ((prev: boolean) => boolean)) => void;
  freezeEvidenceModalOpen: boolean;
  setFreezeEvidenceModalOpen: (open: boolean) => void;
  selectedTxForFreeze: Transaction | null;
  openFreezeModal: (tx: Transaction) => void;
  freezeTransaction: (id: string, evidence: EvidenceSubmission) => void;
  freezeTransactionWithAiReview: (id: string, evidence: EvidenceSubmission, aiReviewResult: AiEvidenceReviewResult) => void;
  submitFreezeRequest: (reason: string, note: string, evidenceFiles?: string[]) => { success: boolean; caseId?: string; message?: string };
  freezeSubmittedCaseId: string | null;
  freezeSubmittedMessage: string | null;
  clearFreezeFeedback: () => void;
  applyDemoScenario: (scenario: 'A' | 'B' | 'C') => void;
  executeRiskCheck: () => SafetyScanResult;
  completeSimulatedPayment: () => Transaction;
  cancelPayment: () => void;
  refreshData: () => void;
  requiresBiometricForDraft: boolean;
  showSuccessPopup: boolean;
  setShowSuccessPopup: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_DRAFT_PAYMENT: DraftPayment = {
  recipientName: '',
  phoneNumber: '',
  amount: '',
  paymentType: 'p2p',
  reasonCode: '',
  customReason: ''
};

function readStoredLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') {
    return 'en';
  }

  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (saved === 'en' || saved === 'hi' || saved === 'ta') {
    return saved;
  }
  return 'en';
}

function readStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') {
    return saved;
  }
  return 'dark';
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [screen, setScreenState] = useState<Screen>('login');
  const [language, setLanguageState] = useState<SupportedLanguage>(readStoredLanguage);
  const [theme, setThemeState] = useState<ThemeMode>(readStoredTheme);
  const [currentUser, setCurrentUser] = useState<DemoAccount | null>(null);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [availableBalance, setAvailableBalance] = useState<number>(0);
  const [pendingIncomingAmount, setPendingIncomingAmount] = useState<number>(0);
  const [pendingIncomingCount, setPendingIncomingCount] = useState<number>(0);
  const [frozenIncomingAmount, setFrozenIncomingAmount] = useState<number>(0);
  const [frozenIncomingCount, setFrozenIncomingCount] = useState<number>(0);
  const [balanceVisible, setBalanceVisible] = useState<boolean>(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [riskResult, setRiskResult] = useState<SafetyScanResult | null>(null);
  const [draftPayment, setDraftPayment] = useState<DraftPayment>(DEFAULT_DRAFT_PAYMENT);
  const [demoAccounts, setDemoAccounts] = useState<DemoAccount[]>(() => listDemoAccounts());
  const [showSuccessPopup, setShowSuccessPopup] = useState<boolean>(false);

  const [emergencyStopOpen, setEmergencyStopOpen] = useState<boolean>(false);
  const [staySafeOpen, setStaySafeOpen] = useState<boolean>(false);
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(true);
  const [freezeEvidenceModalOpen, setFreezeEvidenceModalOpen] = useState<boolean>(false);
  const [selectedTxForFreeze, setSelectedTxForFreeze] = useState<Transaction | null>(null);
  const [freezeSubmittedCaseId, setFreezeSubmittedCaseId] = useState<string | null>(null);
  const [freezeSubmittedMessage, setFreezeSubmittedMessage] = useState<string | null>(null);

  const requiresBiometricForDraft =
    typeof draftPayment.amount === 'number' && draftPayment.amount > HIGH_VALUE_MFA_THRESHOLD;

  const notifications: AppNotification[] = history.map((transaction) => {
    if (transaction.status === 'frozen') {
      return {
        id: `${transaction.id}-frozen`,
        title: 'Payment frozen',
        message: `Rs. ${transaction.amount.toLocaleString('en-IN')} from ${transaction.senderUsername} has been frozen.`,
        createdAt: transaction.createdAt,
        transactionId: transaction.id
      };
    }
    if (transaction.status === 'under_review') {
      return {
        id: `${transaction.id}-request`,
        title: 'Freeze request submitted',
        message: `Your request for Rs. ${transaction.amount.toLocaleString('en-IN')} is under review.`,
        createdAt: transaction.freezeRequest?.requestedAt || transaction.createdAt,
        transactionId: transaction.id
      };
    }
    return {
      id: `${transaction.id}-payment`,
      title: transaction.direction === 'credit' ? 'Payment received' : 'Payment sent',
      message: `${transaction.direction === 'credit' ? 'Received' : 'Sent'} Rs. ${transaction.amount.toLocaleString('en-IN')} ${transaction.direction === 'credit' ? `from ${transaction.senderUsername}` : `to ${transaction.recipientName}`}.`,
      createdAt: transaction.createdAt,
      transactionId: transaction.id
    };
  });

  const setScreen = (newScreen: Screen) => {
    stopSpeaking();
    setScreenState(newScreen);
  };

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    }
  };

  const setTheme = (selectedTheme: ThemeMode) => {
    setThemeState(selectedTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, selectedTheme);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const refreshFromSnapshot = (snapshot: DerivedAccountSnapshot) => {
    setHistory(snapshot.transactions);
    setAvailableBalance(snapshot.balance);
    setPendingIncomingAmount(snapshot.pendingIncomingAmount);
    setPendingIncomingCount(snapshot.pendingIncomingCount);
    setFrozenIncomingAmount(snapshot.frozenIncomingAmount);
    setFrozenIncomingCount(snapshot.frozenIncomingCount);
  };

  const refreshData = () => {
    if (!currentUser) {
      setHistory([]);
      setAvailableBalance(0);
      setPendingIncomingAmount(0);
      setPendingIncomingCount(0);
      setFrozenIncomingAmount(0);
      setFrozenIncomingCount(0);
      return;
    }

    const snapshot = getAccountSnapshot(currentUser.username);
    refreshFromSnapshot(snapshot);
  };

  const updateDraft = (updates: Partial<DraftPayment>) => {
    setDraftPayment((prev) => ({ ...prev, ...updates }));
  };

  const resetDraft = () => {
    stopSpeaking();
    setDraftPayment(DEFAULT_DRAFT_PAYMENT);
    setRiskResult(null);
  };

  const toggleBalanceVisible = () => {
    setBalanceVisible((prev) => !prev);
  };

  const checkBalance = () => {
    refreshData();
    setBalanceVisible(true);
  };

  const cancelPayment = () => {
    stopSpeaking();
    setEmergencyStopOpen(false);
    resetDraft();
    setScreen('home');
  };

  const login = (username: string, password: string) => {
    const user = authenticateUser(username, password);
    if (!user) {
      return { success: false, message: 'Invalid username or password.' };
    }

    setCurrentUser(user);
    setBalanceVisible(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_STORAGE_KEY, user.username);
    }
    refreshFromSnapshot(getAccountSnapshot(user.username));
    setScreen('home');
    return { success: true };
  };

  const registerAccount = (input: CreateAccountInput) => {
    const result = createAccount(input);
    if (!result.ok) {
      return { success: false, message: result.error };
    }

    const user = result.account;
    setDemoAccounts(listDemoAccounts());
    setCurrentUser(user);
    setBalanceVisible(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_STORAGE_KEY, user.username);
    }
    refreshFromSnapshot(getAccountSnapshot(user.username));
    setScreen('home');
    return { success: true };
  };

  const logout = () => {
    stopSpeaking();
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
    setCurrentUser(null);
    setHistory([]);
    setLastTransaction(null);
    setShowSuccessPopup(false);
    setBalanceVisible(false);
    setFreezeEvidenceModalOpen(false);
    setSelectedTxForFreeze(null);
    resetDraft();
    setScreen('login');
  };

  const applyDemoScenario = (scenario: 'A' | 'B' | 'C') => {
    stopSpeaking();
    if (scenario === 'A') {
      setDraftPayment({
        recipientName: 'Fresh Basket Store',
        phoneNumber: 'freshbasket@upi',
        amount: 850,
        paymentType: 'merchant',
        reasonCode: 'groceries',
        customReason: ''
      });
    } else if (scenario === 'B') {
      setDraftPayment({
        recipientName: 'Tilak',
        phoneNumber: 'tilak@safefinance',
        amount: 5000,
        paymentType: 'p2p',
        reasonCode: 'family_support',
        customReason: ''
      });
    } else {
      setDraftPayment({
        recipientName: 'Tilak',
        phoneNumber: 'tilak@safefinance',
        amount: 60000,
        paymentType: 'p2p',
        reasonCode: 'rent',
        customReason: ''
      });
    }
    setRiskResult(null);
    setScreen('send');
  };

  const executeRiskCheck = (): SafetyScanResult => {
    const amount =
      typeof draftPayment.amount === 'number' ? draftPayment.amount : Number(draftPayment.amount) || 0;

    const result = inspectPaymentSafety(
      draftPayment.recipientName,
      amount,
      history.filter((transaction) => transaction.direction === 'debit')
    );

    setRiskResult(result);
    return result;
  };

  const openFreezeModal = (tx: Transaction) => {
    setSelectedTxForFreeze(tx);
    setFreezeSubmittedCaseId(null);
    setFreezeSubmittedMessage(null);
    setFreezeEvidenceModalOpen(true);
  };

  const submitFreezeRequest = (reason: string, note: string, evidenceFiles: string[] = []) => {
    if (!currentUser || !selectedTxForFreeze) {
      return { success: false, message: 'Freeze request could not be created.' };
    }

    const result = requestFreeze(selectedTxForFreeze.id, currentUser.username, reason, note, evidenceFiles);
    if (!result.ok) {
      return { success: false, message: result.error };
    }

    setFreezeSubmittedCaseId(result.caseId);
    setFreezeSubmittedMessage(note);
    refreshData();
    return {
      success: true,
      caseId: result.caseId
    };
  };

  const clearFreezeFeedback = () => {
    setFreezeSubmittedCaseId(null);
    setFreezeSubmittedMessage(null);
  };

  const freezeTransaction = (id: string, evidence: EvidenceSubmission) => {
    setSelectedTxForFreeze(history.find((transaction) => transaction.id === id) || null);
    submitFreezeRequest(evidence.categoryLabel, evidence.description);
  };

  const freezeTransactionWithAiReview = (
    id: string,
    evidence: EvidenceSubmission,
    _aiReviewResult: AiEvidenceReviewResult
  ) => {
    setSelectedTxForFreeze(history.find((transaction) => transaction.id === id) || null);
    submitFreezeRequest(evidence.categoryLabel, evidence.description);
  };

  const completeSimulatedPayment = (): Transaction => {
    if (!currentUser) {
      throw new Error('No active user session.');
    }

    const amount =
      typeof draftPayment.amount === 'number' ? draftPayment.amount : Number(draftPayment.amount) || 0;

    const reasonCode = draftPayment.reasonCode || 'other';
    const reasonLabel =
      reasonCode === 'other' && draftPayment.customReason.trim()
        ? draftPayment.customReason.trim()
        : getPaymentReasonLabel(reasonCode, language);

    const result = createPayment({
      senderUsername: currentUser.username,
      recipientName: draftPayment.recipientName.trim(),
      recipientPhoneOrUpi: draftPayment.phoneNumber.trim(),
      amount,
      paymentType: draftPayment.paymentType,
      reasonCode,
      reasonLabel
    });

    if (!result.ok || !result.transaction) {
      throw new Error(result.error || 'Payment failed.');
    }

    setLastTransaction(result.transaction);
    refreshData();
    setShowSuccessPopup(true);
    return result.transaction;
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = theme;
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }, [theme]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const storedUsername = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!storedUsername) {
      return;
    }

    const user = listDemoAccounts().find((account) => account.username === storedUsername);
    if (!user) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return;
    }

    setCurrentUser(user);
    refreshFromSnapshot(getAccountSnapshot(user.username));
    setScreen('home');
  }, []);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const timer = window.setInterval(() => {
      refreshFromSnapshot(getAccountSnapshot(currentUser.username));
    }, 10000);

    return () => {
      window.clearInterval(timer);
    };
  }, [currentUser]);

  return (
    <AppContext.Provider
      value={{
        screen,
        setScreen,
        language,
        setLanguage,
        theme,
        setTheme,
        toggleTheme,
        draftPayment,
        setDraftPayment,
        updateDraft,
        resetDraft,
        riskResult,
        history,
        notifications,
        lastTransaction,
        currentUser,
        demoAccounts,
        availableBalance,
        pendingIncomingAmount,
        pendingIncomingCount,
        frozenIncomingAmount,
        frozenIncomingCount,
        balanceVisible,
        checkBalance,
        toggleBalanceVisible,
        login,
        registerAccount,
        logout,
        emergencyStopOpen,
        setEmergencyStopOpen,
        staySafeOpen,
        setStaySafeOpen,
        isPhoneFrame,
        setIsPhoneFrame,
        freezeEvidenceModalOpen,
        setFreezeEvidenceModalOpen,
        selectedTxForFreeze,
        openFreezeModal,
        freezeTransaction,
        freezeTransactionWithAiReview,
        submitFreezeRequest,
        freezeSubmittedCaseId,
        freezeSubmittedMessage,
        clearFreezeFeedback,
        applyDemoScenario,
        executeRiskCheck,
        completeSimulatedPayment,
        cancelPayment,
        refreshData,
        requiresBiometricForDraft,
        showSuccessPopup,
        setShowSuccessPopup
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
