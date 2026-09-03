import React, { useMemo, useState } from 'react';
import { ArrowLeft, Clock3, Lock, ReceiptText, UserRound } from 'lucide-react';
import { translations } from '../lib/i18n';
import { useApp } from '../state/AppContext';

type FilterKey = 'all' | 'p2p' | 'merchant' | 'pending';

export const HistoryScreen: React.FC = () => {
  const { history, language, openFreezeModal, setScreen } = useApp();
  const t = translations[language];
  const [filter, setFilter] = useState<FilterKey>('all');

  const filteredTransactions = useMemo(() => {
    return history.filter((transaction) => {
      if (filter === 'all') return true;
      if (filter === 'p2p') return transaction.paymentType === 'p2p';
      if (filter === 'merchant') return transaction.paymentType === 'merchant';
      return transaction.status === 'pending_reflection';
    });
  }, [filter, history]);

  const getStatusText = (transaction: (typeof history)[number]) => {
    if (transaction.status === 'frozen') {
      return 'Payment frozen';
    }
    if (transaction.status === 'under_review') {
      return t.freezeRequested;
    }
    if (transaction.direction === 'credit' && transaction.status === 'pending_reflection') {
      return t.settlementPending;
    }
    if (transaction.direction === 'credit') {
      return t.creditReceived;
    }
    if (transaction.paymentType === 'merchant') {
      return t.merchantPaid;
    }
    return t.debitCompleted;
  };

  const getSettlementText = (transaction: (typeof history)[number]) => {
    if (transaction.paymentType !== 'p2p') return null;
    if (transaction.direction === 'debit') return t.senderSettlementPending;
    if (transaction.status === 'pending_reflection') return t.receiverSettlementPending;
    return t.receiverSettlementComplete;
  };

  const getContactLabel = (transaction: (typeof history)[number]) => {
    if (transaction.contactRelationship === 'family') return t.familyContact;
    if (transaction.contactRelationship === 'known') return t.knownContact;
    return t.newContact;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setScreen('home')}
          className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold"
          style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel-soft)', color: 'var(--sf-text-strong)' }}
        >
          <ArrowLeft className="h-4 w-4" />
          {t.home}
        </button>
      </div>

      <section className="rounded-[28px] border p-6" style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel)' }}>
        <h2 className="text-2xl font-black" style={{ color: 'var(--sf-text-strong)' }}>
          {t.historyTitle}
        </h2>
        <p className="mt-2 text-sm leading-6" style={{ color: 'var(--sf-text-soft)' }}>
          {t.historySubtitle}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {([
            ['all', t.allTransactions],
            ['p2p', t.p2pTransactions],
            ['merchant', t.merchantTransactions],
            ['pending', t.pendingTransactions]
          ] as Array<[FilterKey, string]>).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className="rounded-full border px-4 py-2 text-sm font-bold"
              style={{
                borderColor: 'var(--sf-border)',
                background: filter === key ? 'var(--sf-accent-gradient)' : 'var(--sf-panel-soft)',
                color: filter === key ? '#fff' : 'var(--sf-text-strong)'
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-5 space-y-3">
          {filteredTransactions.length === 0 ? (
            <div className="rounded-[24px] border border-dashed p-5 text-sm" style={{ borderColor: 'var(--sf-border)', color: 'var(--sf-text-muted)' }}>
              {t.noTransactions}
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="rounded-[24px] border p-5"
                style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel-soft)' }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-2xl text-white"
                      style={{
                        background:
                          transaction.direction === 'debit'
                            ? 'var(--sf-accent-gradient)'
                            : 'linear-gradient(135deg, #22c55e, #16a34a)'
                      }}
                    >
                      {transaction.paymentType === 'merchant' ? <ReceiptText className="h-5 w-5" /> : <UserRound className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="text-lg font-black" style={{ color: 'var(--sf-text-strong)' }}>
                        {transaction.recipientName}
                      </div>
                      <div className="mt-1 text-sm" style={{ color: 'var(--sf-text-muted)' }}>
                        {transaction.phoneNumber}
                      </div>
                      <div className="mt-2 inline-flex items-center gap-2 text-xs" style={{ color: 'var(--sf-text-muted)' }}>
                        <Clock3 className="h-3.5 w-3.5" />
                        {transaction.timestamp}
                      </div>
                      {transaction.paymentType === 'p2p' && (
                        <div className="mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: 'rgba(14,165,233,0.1)', color: 'var(--sf-info)' }}>
                          {getContactLabel(transaction)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-black" style={{ color: transaction.direction === 'debit' ? 'var(--sf-danger)' : 'var(--sf-success)' }}>
                      {transaction.direction === 'debit' ? '-' : '+'}Rs. {transaction.amount.toLocaleString('en-IN')}
                    </div>
                    <div className="mt-1 text-sm font-semibold" style={{ color: 'var(--sf-text-soft)' }}>
                      {getStatusText(transaction)}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <div style={{ color: 'var(--sf-text-muted)' }}>{t.transactionId}</div>
                    <div className="mt-1 font-mono font-bold" style={{ color: 'var(--sf-text-strong)' }}>
                      {transaction.id}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--sf-text-muted)' }}>{t.paymentReason}</div>
                    <div className="mt-1 font-bold" style={{ color: 'var(--sf-text-strong)' }}>
                      {transaction.reason}
                    </div>
                  </div>
                </div>

                {getSettlementText(transaction) && (
                  <div className="mt-4 rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel)', color: 'var(--sf-text-soft)' }}>
                    {getSettlementText(transaction)}
                  </div>
                )}

                {transaction.freezeRequest && (
                  <div className="mt-4 rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: 'rgba(245,158,11,0.28)', background: 'rgba(245,158,11,0.08)', color: 'var(--sf-text-strong)' }}>
                    {t.freezeRequested}: <span className="font-mono">{transaction.freezeRequest.caseId}</span>
                  </div>
                )}

                {transaction.freezeEligible && (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => openFreezeModal(transaction)}
                      className="rounded-full px-5 py-3 text-sm font-black text-white"
                      style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
                    >
                      <span className="inline-flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        {t.freezeAction}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};
