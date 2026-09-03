export const APP_NAME = import.meta.env.VITE_APP_NAME || 'SafeFinance';
export const SETTLEMENT_DELAY_MINUTES = Number(import.meta.env.VITE_SETTLEMENT_DELAY_MINUTES || 10);
export const FREEZE_WINDOW_MINUTES = Number(import.meta.env.VITE_FREEZE_WINDOW_MINUTES || 60);
export const HIGH_VALUE_MFA_THRESHOLD = Number(import.meta.env.VITE_HIGH_VALUE_MFA_THRESHOLD || 50000);
export const DEMO_UPI_PIN = import.meta.env.VITE_DEMO_UPI_PIN || '2580';
export const NEW_ACCOUNT_OPENING_BALANCE = Number(import.meta.env.VITE_NEW_ACCOUNT_OPENING_BALANCE || 50000);
