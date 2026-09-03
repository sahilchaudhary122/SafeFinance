import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { type Transaction, INITIAL_TRANSACTIONS, generateTransactionId } from '../lib/dummyData';
import { calculateRisk, type RiskResult } from '../lib/riskEngine';
import type { SupportedLanguage } from '../lib/i18n';
import { stopSpeaking } from '../lib/tts';

export type Screen = 
  | 'home'
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
}

interface AppContextType {
  screen: Screen;
  setScreen: (screen: Screen) => void;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  draftPayment: DraftPayment;
  setDraftPayment: React.Dispatch<React.SetStateAction<DraftPayment>>;
  updateDraft: (updates: Partial<DraftPayment>) => void;
  resetDraft: () => void;
  riskResult: RiskResult | null;
  history: Transaction[];
  lastTransaction: Transaction | null;
  emergencyStopOpen: boolean;
  setEmergencyStopOpen: (open: boolean) => void;
  staySafeOpen: boolean;
  setStaySafeOpen: (open: boolean) => void;
  isPhoneFrame: boolean;
  setIsPhoneFrame: (val: boolean | ((prev: boolean) => boolean)) => void;
  
  // Actions
  applyDemoScenario: (scenario: 'A' | 'B' | 'C') => void;
  executeRiskCheck: () => RiskResult;
  completeSimulatedPayment: () => Transaction;
  cancelPayment: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [screen, setScreenState] = useState<Screen>('home');
  const [language, setLanguageState] = useState<SupportedLanguage>('en');
  const [history, setHistory] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  
  const [draftPayment, setDraftPayment] = useState<DraftPayment>({
    recipientName: '',
    phoneNumber: '',
    amount: ''
  });

  const [riskResult, setRiskResult] = useState<RiskResult | null>(null);
  const [sessionNewPayments, setSessionNewPayments] = useState<Record<string, number>>({});
  
  const [emergencyStopOpen, setEmergencyStopOpen] = useState<boolean>(false);
  const [staySafeOpen, setStaySafeOpen] = useState<boolean>(false);
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(true);

  const setScreen = (newScreen: Screen) => {
    stopSpeaking();
    setScreenState(newScreen);
  };

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
  };

  const updateDraft = (updates: Partial<DraftPayment>) => {
    setDraftPayment((prev) => ({ ...prev, ...updates }));
  };

  const resetDraft = () => {
    stopSpeaking();
    setDraftPayment({
      recipientName: '',
      phoneNumber: '',
      amount: ''
    });
    setRiskResult(null);
  };

  const cancelPayment = () => {
    stopSpeaking();
    setEmergencyStopOpen(false);
    resetDraft();
    setScreen('home');
  };

  // 1-Click quick fill for Demo Scenarios
  const applyDemoScenario = (scenario: 'A' | 'B' | 'C') => {
    stopSpeaking();
    if (scenario === 'A') {
      // Scenario A — Safe: Priya Sharma, ₹500 → 🟢 Low Risk, "Looks normal."
      setDraftPayment({
        recipientName: 'Priya Sharma',
        phoneNumber: '98765 43210',
        amount: 500
      });
    } else if (scenario === 'B') {
      // Scenario B — New Recipient: Rahul Kumar, ₹5,000 → 🟠 Medium Risk, "This is your first payment to this recipient."
      setDraftPayment({
        recipientName: 'Rahul Kumar',
        phoneNumber: '98765 43210',
        amount: 5000
      });
    } else if (scenario === 'C') {
      // Scenario C — Suspicious: unknown name, ₹50,000 → 🔴 High Risk, "This payment is unusually large and the recipient is new."
      setDraftPayment({
        recipientName: 'Ramesh Verma (Unknown)',
        phoneNumber: '98111 22233',
        amount: 50000
      });
    }
    setScreen('send');
  };

  const executeRiskCheck = (): RiskResult => {
    const numAmount = typeof draftPayment.amount === 'number' ? draftPayment.amount : Number(draftPayment.amount) || 0;
    const normName = draftPayment.recipientName.trim().toLowerCase();
    const sessionCount = sessionNewPayments[normName] || 0;

    const result = calculateRisk(draftPayment.recipientName, numAmount, history, sessionCount);
    setRiskResult(result);
    return result;
  };

  const completeSimulatedPayment = (): Transaction => {
    stopSpeaking();
    const numAmount = typeof draftPayment.amount === 'number' ? draftPayment.amount : Number(draftPayment.amount) || 0;
    const normName = draftPayment.recipientName.trim().toLowerCase();

    // Track session payments count for rapid duplicates
    setSessionNewPayments((prev) => ({
      ...prev,
      [normName]: (prev[normName] || 0) + 1
    }));

    const newTx: Transaction = {
      id: generateTransactionId(),
      recipientName: draftPayment.recipientName.trim(),
      phoneNumber: draftPayment.phoneNumber.trim() || '98765 43210',
      amount: numAmount,
      dateStr: 'Just now',
      timestamp: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      riskLevel: riskResult?.level || 'low',
      status: (riskResult?.level === 'high' || riskResult?.level === 'medium') ? 'reviewed' : 'safe',
      isSimulated: true,
      category: 'Simulated Payment'
    };

    setLastTransaction(newTx);
    setHistory((prev) => [newTx, ...prev]);
    return newTx;
  };

  return (
    <AppContext.Provider
      value={{
        screen,
        setScreen,
        language,
        setLanguage,
        draftPayment,
        setDraftPayment,
        updateDraft,
        resetDraft,
        riskResult,
        history,
        lastTransaction,
        emergencyStopOpen,
        setEmergencyStopOpen,
        staySafeOpen,
        setStaySafeOpen,
        isPhoneFrame,
        setIsPhoneFrame,
        applyDemoScenario,
        executeRiskCheck,
        completeSimulatedPayment,
        cancelPayment
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
