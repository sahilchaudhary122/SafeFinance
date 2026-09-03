import React from 'react';
import { PlayCircle } from 'lucide-react';
import { translations } from '../lib/i18n';
import { useApp } from '../state/AppContext';

export const DemoScenarioBar: React.FC = () => {
  const { applyDemoScenario, currentUser, language } = useApp();
  const t = translations[language];

  if (!currentUser || currentUser.role !== 'sender') {
    return null;
  }

  return (
    <aside className="border-b px-4 py-3" style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-demo-bar)' }}>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2 text-sm font-bold" style={{ color: 'var(--sf-text-strong)' }}>
          <PlayCircle className="h-4 w-4" />
          {t.demoScenarios}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => applyDemoScenario('A')}
            className="rounded-full border px-4 py-2 text-xs font-bold"
            style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel)', color: 'var(--sf-text-strong)' }}
          >
            {t.demoMerchantScenario}
          </button>
          <button
            type="button"
            onClick={() => applyDemoScenario('B')}
            className="rounded-full border px-4 py-2 text-xs font-bold"
            style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel)', color: 'var(--sf-text-strong)' }}
          >
            {t.demoP2pScenario}
          </button>
          <button
            type="button"
            onClick={() => applyDemoScenario('C')}
            className="rounded-full border px-4 py-2 text-xs font-bold"
            style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel)', color: 'var(--sf-text-strong)' }}
          >
            {t.demoHighValueScenario}
          </button>
        </div>
      </div>
    </aside>
  );
};
