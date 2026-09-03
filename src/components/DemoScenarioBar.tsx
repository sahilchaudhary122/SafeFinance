import React from 'react';
import { useApp } from '../state/AppContext';
import { translations } from '../lib/i18n';
import { PlayCircle, ShieldCheck, AlertCircle, AlertTriangle } from 'lucide-react';

export const DemoScenarioBar: React.FC = () => {
  const { language, applyDemoScenario } = useApp();
  const t = translations[language];

  return (
    <aside aria-label="Demo Testing Bar" className="w-full border-b border-emerald-500/20 bg-emerald-950/40 px-3 py-2 text-xs">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-semibold text-emerald-300">
          <PlayCircle className="h-4 w-4 text-emerald-400" />
          <span>{t.demoScenariosTitle}</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Scenario A */}
          <button
            onClick={() => applyDemoScenario('A')}
            className="flex items-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-900/50 px-2.5 py-1 text-emerald-200 transition hover:bg-emerald-800 hover:text-white"
            title="Priya Sharma, ₹500 (Low Risk 🟢)"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span className="font-bold">A:</span>
            <span>Priya (₹500)</span>
            <span className="rounded bg-emerald-500/20 px-1 text-[10px] text-emerald-300">🟢 Safe</span>
          </button>

          {/* Scenario B */}
          <button
            onClick={() => applyDemoScenario('B')}
            className="flex items-center gap-1.5 rounded-md border border-amber-500/40 bg-amber-950/60 px-2.5 py-1 text-amber-200 transition hover:bg-amber-900 hover:text-white"
            title="Rahul Kumar, ₹5,000 (Medium Risk 🟠)"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-bold">B:</span>
            <span>Rahul (₹5,000)</span>
            <span className="rounded bg-amber-500/20 px-1 text-[10px] text-amber-300">🟠 New</span>
          </button>

          {/* Scenario C */}
          <button
            onClick={() => applyDemoScenario('C')}
            className="flex items-center gap-1.5 rounded-md border border-rose-500/40 bg-rose-950/60 px-2.5 py-1 text-rose-200 transition hover:bg-rose-900 hover:text-white"
            title="Unknown Payee, ₹50,000 (High Risk 🔴)"
          >
            <AlertCircle className="h-3.5 w-3.5 text-rose-400" />
            <span className="font-bold">C:</span>
            <span>Unknown (₹50k)</span>
            <span className="rounded bg-rose-500/20 px-1 text-[10px] text-rose-300">🔴 Alert</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
