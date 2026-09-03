import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { AppProvider, useApp } from './state/AppContext';
import { Navbar } from './components/Navbar';
import { DemoScenarioBar } from './components/DemoScenarioBar';
import { HomeScreen } from './components/HomeScreen';
import { SendMoneyScreen } from './components/SendMoneyScreen';
import { RiskCheckScreen } from './components/RiskCheckScreen';
import { ConfirmationScreen } from './components/ConfirmationScreen';
import { SuccessScreen } from './components/SuccessScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { LoginScreen } from './components/LoginScreen';
import { FreezeRequestModal } from './components/FreezeRequestModal';
import { translations } from './lib/i18n';
import { ScanQrScreen } from './components/ScanQrScreen';
import { ExplainBeforePayScreen } from './components/ExplainBeforePayScreen';

const MainAppContent: React.FC = () => {
  const { currentUser, isPhoneFrame, language, screen } = useApp();
  const t = translations[language];

  const renderScreen = () => {
    if (!currentUser) {
      return <LoginScreen />;
    }

    switch (screen) {
      case 'home':
        return <HomeScreen />;
      case 'send':
        return <SendMoneyScreen />;
      case 'scan-qr':
        return <ScanQrScreen />;
      case 'risk-check':
        return <RiskCheckScreen />;
      case 'explain':
        return <ExplainBeforePayScreen />;
      case 'confirm':
        return <ConfirmationScreen />;
      case 'success':
        return <SuccessScreen />;
      case 'history':
        return <HistoryScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--sf-app-bg)', color: 'var(--sf-text-strong)' }}>
      <div className="min-h-screen" style={{ background: 'var(--sf-app-overlay)' }}>
        <Navbar />
        <DemoScenarioBar />

        <main className="mx-auto flex max-w-7xl flex-1 justify-center px-4 py-6 sm:px-6 lg:px-8">
          {isPhoneFrame && currentUser ? (
            <div
              className="w-full max-w-[430px] overflow-hidden rounded-[42px] border p-3 shadow-2xl"
              style={{ borderColor: 'var(--sf-shell-border)', background: 'var(--sf-shell)' }}
            >
              <div className="mx-auto mb-3 flex h-6 w-28 items-center justify-center rounded-full" style={{ background: 'var(--sf-panel-soft)' }}>
                <div className="h-1.5 w-12 rounded-full" style={{ background: 'var(--sf-text-muted)' }} />
              </div>
              <div className="rounded-[30px] p-4 sm:p-5" style={{ background: 'transparent' }}>
                {renderScreen()}
              </div>
            </div>
          ) : (
            <div className="w-full max-w-6xl">
              {renderScreen()}
            </div>
          )}
        </main>

        <footer className="border-t px-4 py-4 text-center text-xs" style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-header)', color: 'var(--sf-text-muted)' }}>
          <span className="inline-flex items-center gap-2 font-semibold" style={{ color: 'var(--sf-text-strong)' }}>
            <ShieldCheck className="h-3.5 w-3.5" />
            SafeFinance Prototype
          </span>
          <span className="mx-2">•</span>
          <span>{t.localDatabaseNote}</span>
        </footer>

        <FreezeRequestModal />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
