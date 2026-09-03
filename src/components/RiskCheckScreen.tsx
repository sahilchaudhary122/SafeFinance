import React, { useEffect, useState } from 'react';
import { ArrowLeft, CircleCheckBig, Clock3, ShieldAlert, Wallet } from 'lucide-react';
import { translations } from '../lib/i18n';
import { useApp } from '../state/AppContext';
import type { SafetyFinding, SafetyScanResult } from '../lib/riskEngine';

function getLocalizedFinding(finding: SafetyFinding, language: 'en' | 'hi' | 'ta') {
  if (language === 'hi') {
    return { title: finding.titleHi, description: finding.descriptionHi, badge: finding.badgeHi };
  }
  if (language === 'ta') {
    return { title: finding.titleTa, description: finding.descriptionTa, badge: finding.badgeTa };
  }
  return { title: finding.titleEn, description: finding.descriptionEn, badge: finding.badgeEn };
}

export const RiskCheckScreen: React.FC = () => {
  const { draftPayment, executeRiskCheck, language, riskResult, setScreen } = useApp();
  const t = translations[language];
  const [activeResult, setActiveResult] = useState<SafetyScanResult | null>(riskResult);

  const getContactLabel = (relationship: SafetyScanResult['contactRelationship']) => {
    if (relationship === 'family') return t.familyContact;
    if (relationship === 'known') return t.knownContact;
    return t.newContact;
  };

  useEffect(() => {
    if (riskResult) {
      setActiveResult(riskResult);
      return;
    }

    if (draftPayment.recipientName.trim()) {
      setActiveResult(executeRiskCheck());
    }
  }, [draftPayment.amount, draftPayment.recipientName, executeRiskCheck, riskResult]);

  if (!activeResult) {
    return (
      <div className="rounded-[28px] border p-6" style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel)' }}>
        <button
          type="button"
          onClick={() => setScreen('confirm')}
          className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold"
          style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel-soft)', color: 'var(--sf-text-strong)' }}
        >
          <ArrowLeft className="h-4 w-4" />
          {t.back}
        </button>
      </div>
    );
  }

  const amount = typeof draftPayment.amount === 'number' ? draftPayment.amount : Number(draftPayment.amount) || 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setScreen('confirm')}
          className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold"
          style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel-soft)', color: 'var(--sf-text-strong)' }}
        >
          <ArrowLeft className="h-4 w-4" />
          {t.back}
        </button>
      </div>

      <section className="rounded-[28px] border p-6" style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel)' }}>
        <h2 className="text-2xl font-black" style={{ color: 'var(--sf-text-strong)' }}>
          {t.riskAnalysisTitle}
        </h2>
        <p className="mt-2 text-sm leading-6" style={{ color: 'var(--sf-text-soft)' }}>
          {t.riskAnalysisSubtitle}
        </p>

        <div className="mt-6 rounded-[24px] border p-5" style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel-soft)' }}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: 'var(--sf-text-muted)' }}>
                {t.safetyCheckComplete}
              </div>
              <div className="mt-2 text-2xl font-black" style={{ color: 'var(--sf-text-strong)' }}>
                Rs. {amount.toLocaleString('en-IN')}
              </div>
              <div className="mt-1 text-sm" style={{ color: 'var(--sf-text-soft)' }}>
                {draftPayment.recipientName}
              </div>
            </div>
            <div className="rounded-full px-4 py-2 text-xs font-bold text-white" style={{ background: activeResult.isNewContact ? 'linear-gradient(135deg, #0ea5e9, #0284c7)' : 'var(--sf-accent-gradient)' }}>
              {getContactLabel(activeResult.contactRelationship)}
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel)' }}>
              <div className="text-xs" style={{ color: 'var(--sf-text-muted)' }}>{t.contactStatus}</div>
              <div className="mt-2 font-bold" style={{ color: 'var(--sf-text-strong)' }}>
                {getContactLabel(activeResult.contactRelationship)}
              </div>
            </div>
            <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel)' }}>
              <div className="text-xs" style={{ color: 'var(--sf-text-muted)' }}>{t.previousPayments}</div>
              <div className="mt-2 font-bold" style={{ color: 'var(--sf-text-strong)' }}>
                {activeResult.pastTransactionsCount}
              </div>
            </div>
            <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel)' }}>
              <div className="text-xs" style={{ color: 'var(--sf-text-muted)' }}>{t.averagePayment}</div>
              <div className="mt-2 font-bold" style={{ color: 'var(--sf-text-strong)' }}>
                Rs. {(activeResult.averagePastAmount || 0).toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>

        {draftPayment.paymentType === 'p2p' && (
          <div className="mt-4 rounded-[24px] border px-4 py-4 text-sm leading-6" style={{ borderColor: 'var(--sf-border)', background: 'rgba(14,165,233,0.08)', color: 'var(--sf-text-soft)' }}>
            <div className="inline-flex items-center gap-2 font-bold" style={{ color: 'var(--sf-text-strong)' }}>
              <Clock3 className="h-4 w-4" />
              {t.settlementDelayNote}
            </div>
          </div>
        )}

        <div className="mt-5 space-y-3">
          {activeResult.findings.map((finding) => {
            const localized = getLocalizedFinding(finding, language);
            return (
              <div
                key={finding.id}
                className="rounded-[24px] border p-4"
                style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel-soft)' }}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CircleCheckBig className="h-4 w-4" style={{ color: 'var(--sf-accent)' }} />
                    <div className="font-bold" style={{ color: 'var(--sf-text-strong)' }}>
                      {localized.title}
                    </div>
                  </div>
                  {localized.badge && (
                    <div className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: 'rgba(37,99,235,0.12)', color: 'var(--sf-info)' }}>
                      {localized.badge}
                    </div>
                  )}
                </div>
                <p className="mt-3 text-sm leading-6" style={{ color: 'var(--sf-text-soft)' }}>
                  {localized.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setScreen('explain')}
            className="rounded-full px-6 py-3 text-sm font-black text-white"
            style={{ background: 'var(--sf-accent-gradient)' }}
          >
            Explain before paying
          </button>
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold" style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel-soft)', color: 'var(--sf-text-muted)' }}>
            {activeResult.isUnusualAmount ? <ShieldAlert className="h-4 w-4" /> : <Wallet className="h-4 w-4" />}
            {activeResult.isUnusualAmount ? t.unusualAmount : t.transactionPattern}
          </div>
        </div>
      </section>
    </div>
  );
};
