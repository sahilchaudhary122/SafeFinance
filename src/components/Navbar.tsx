import React from 'react';
import { useApp } from '../state/AppContext';
import { LANGUAGES, translations } from '../lib/i18n';
import { ShieldCheck, HelpCircle, Smartphone, Monitor } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { language, setLanguage, setStaySafeOpen, isPhoneFrame, setIsPhoneFrame, setScreen } = useApp();
  const t = translations[language];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 py-3">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2">
        {/* Brand */}
        <button 
          onClick={() => setScreen('home')}
          className="flex items-center gap-2 text-left transition hover:opacity-90 focus:outline-none"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg shadow-emerald-900/30">
            <ShieldCheck className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">{t.appTitle}</span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                PROTOTYPE
              </span>
            </div>
            <p className="hidden text-xs text-slate-400 sm:block">
              {t.tagline}
            </p>
          </div>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Stay Safe Scam Guide Button */}
          <button
            onClick={() => setStaySafeOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/20"
            title="Scam Prevention Rules"
          >
            <HelpCircle className="h-4 w-4" />
            <span className="hidden md:inline">{t.staySafe}</span>
          </button>

          {/* Language Selector */}
          <div className="relative inline-flex items-center">
            <label htmlFor="language-select" className="sr-only">Select Language</label>
            <select
              id="language-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="appearance-none rounded-lg border border-slate-700 bg-slate-800 py-1.5 pl-2.5 pr-8 text-xs font-semibold text-slate-200 shadow-sm transition hover:border-slate-600 focus:border-emerald-500 focus:outline-none cursor-pointer"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                  {lang.flag} {lang.nativeName}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2 text-xs text-slate-400">▼</span>
          </div>

          {/* Device Frame Switcher (Mobile container vs Fullscreen) */}
          <button
            onClick={() => setIsPhoneFrame((prev) => !prev)}
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-700"
            title={isPhoneFrame ? "Switch to Fullscreen view" : "Switch to Mobile Phone Frame"}
          >
            {isPhoneFrame ? (
              <>
                <Monitor className="h-3.5 w-3.5" />
                <span>Full View</span>
              </>
            ) : (
              <>
                <Smartphone className="h-3.5 w-3.5 text-emerald-400" />
                <span>Phone Frame</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
