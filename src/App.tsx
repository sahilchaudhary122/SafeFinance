import React from 'react';
import { AppProvider, useApp } from './state/AppContext';
import { Navbar } from './components/Navbar';
import { DemoScenarioBar } from './components/DemoScenarioBar';
import { HomeScreen } from './components/HomeScreen';
import { SendMoneyScreen } from './components/SendMoneyScreen';
import { RiskCheckScreen } from './components/RiskCheckScreen';
import { ExplainBeforePayScreen } from './components/ExplainBeforePayScreen';
import { ConfirmationScreen } from './components/ConfirmationScreen';
import { SuccessScreen } from './components/SuccessScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { EmergencyStopModal } from './components/EmergencyStopModal';
import { StaySafeModal } from './components/StaySafeModal';
import { ShieldCheck } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { screen, isPhoneFrame } = useApp();

  const renderScreen = () => {
    switch (screen) {
      case 'home':
        return <HomeScreen />;
      case 'send':
        return <SendMoneyScreen />;
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar />

      {/* Judges Demo Testing Bar */}
      <DemoScenarioBar />

      {/* Main Body Viewport */}
      <main className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 md:p-8">
        {isPhoneFrame ? (
          /* Mobile Phone Mockup Frame */
          <div className="w-full max-w-[420px] rounded-[44px] border-[8px] border-slate-800 bg-slate-900 shadow-2xl shadow-emerald-950/20 overflow-hidden relative flex flex-col min-h-[750px]">
            {/* Phone Speaker & Camera Notch */}
            <div className="w-full bg-slate-900 pt-3 pb-2 flex justify-center items-center relative z-20">
              <div className="w-24 h-4 bg-slate-800 rounded-full flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-950 mr-2" />
                <div className="w-10 h-1 rounded-full bg-slate-700" />
              </div>
            </div>

            {/* Screen Content */}
            <div className="flex-1 p-4 sm:p-5 overflow-y-auto max-h-[750px] relative">
              {renderScreen()}
            </div>

            {/* Simulated Phone Home Bar */}
            <div className="w-full bg-slate-900 py-2.5 flex justify-center items-center border-t border-slate-800/60">
              <div className="w-32 h-1 bg-slate-700 rounded-full" />
            </div>
          </div>
        ) : (
          /* Responsive Fullscreen View Container */
          <div className="w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6 md:p-8 shadow-2xl">
            {renderScreen()}
          </div>
        )}
      </main>

      {/* Persistent Simulated Prototype Notice Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950/80 px-4 py-3 text-center text-xs text-slate-500">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-2">
          <span className="flex items-center gap-1 font-semibold text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            SafePay AI Prototype
          </span>
          <span>•</span>
          <span>Designed for Digital Literacy & Financial Safety</span>
          <span>•</span>
          <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/20">
            Simulated Payments Only (No Real Money)
          </span>
        </div>
      </footer>

      {/* Modals */}
      <EmergencyStopModal />
      <StaySafeModal />
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
