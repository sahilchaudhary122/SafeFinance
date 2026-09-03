import React from 'react';
import { ArrowRight, Clock3, CreditCard, History, QrCode, Send } from 'lucide-react';
import { useApp } from '../state/AppContext';
import { getInitials } from '../lib/dummyData';
import { translations } from '../lib/i18n';

function formatAmount(amount: number) {
  return amount.toLocaleString('en-IN');
}

export const HomeScreen: React.FC = () => {
  const {
    availableBalance,
    balanceVisible,
    checkBalance,
    currentUser,
    history,
    language,
    pendingIncomingAmount,
    pendingIncomingCount,
    setScreen,
    toggleBalanceVisible
  } = useApp();

  const t = translations[language];

  if (!currentUser) {
    return null;
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border p-6 shadow-xl" style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-accent-soft)' }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.24em]" style={{ color: 'var(--sf-text-muted)' }}>
              {t.paymentDashboard}
            </div>
            <h1 className="mt-2 text-3xl font-black" style={{ color: 'var(--sf-text-strong)' }}>
              {t.welcomeUser}, {currentUser.fullName}
            </h1>
            <p className="mt-2 max-w-md text-sm leading-6" style={{ color: 'var(--sf-text-soft)' }}>
              {t.switchAccountHint}
            </p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-black text-white" style={{ background: 'var(--sf-accent-gradient)' }}>
            {getInitials(currentUser.fullName)}
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-3xl border p-4" style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel)' }}>
            <div className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--sf-text-muted)' }}>
              {t.availableBalance}
            </div>
            <div className="mt-3 text-3xl font-black" style={{ color: 'var(--sf-text-strong)' }}>
              {balanceVisible ? `Rs. ${formatAmount(availableBalance)}` : 'Rs. ••••••'}
            </div>
            <button
              type="button"
              onClick={balanceVisible ? toggleBalanceVisible : checkBalance}
              className="mt-4 rounded-full px-4 py-2 text-xs font-bold text-white"
              style={{ background: 'var(--sf-accent-gradient)' }}
            >
              {balanceVisible ? t.hideBalance : t.checkBalance}
            </button>
          </div>

          <div className="rounded-3xl border p-4" style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel)' }}>
            <div className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--sf-text-muted)' }}>
              {t.pendingIncoming}
            </div>
            <div className="mt-3 text-3xl font-black" style={{ color: 'var(--sf-text-strong)' }}>
              {pendingIncomingCount > 0 ? `Rs. ${formatAmount(pendingIncomingAmount)}` : 'Rs. 0'}
            </div>
            <p className="mt-3 text-sm leading-6" style={{ color: 'var(--sf-text-soft)' }}>
              {pendingIncomingCount > 0 ? t.pendingIncomingDesc : t.noPendingIncoming}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => setScreen('send')}
          className="rounded-[26px] border p-5 text-left shadow-lg transition hover:-translate-y-0.5"
          style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel)' }}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-white" style={{ background: 'var(--sf-accent-gradient)' }}>
            <Send className="h-5 w-5" />
          </div>
          <div className="mt-4 text-lg font-black" style={{ color: 'var(--sf-text-strong)' }}>
            {t.sendMoney}
          </div>
          <div className="mt-1 text-sm" style={{ color: 'var(--sf-text-soft)' }}>
            {t.sendMoneyHelper}
          </div>
        </button>

        <button
          type="button"
          onClick={() => setScreen('scan-qr')}
          className="rounded-[26px] border p-5 text-left shadow-lg transition hover:-translate-y-0.5"
          style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel)' }}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-white" style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}>
            <QrCode className="h-5 w-5" />
          </div>
          <div className="mt-4 text-lg font-black" style={{ color: 'var(--sf-text-strong)' }}>
            {t.scanQrPay}
          </div>
          <div className="mt-1 text-sm" style={{ color: 'var(--sf-text-soft)' }}>
            {t.scanQrHelper}
          </div>
        </button>

        <button
          type="button"
          onClick={() => setScreen('history')}
          className="rounded-[26px] border p-5 text-left shadow-lg transition hover:-translate-y-0.5"
          style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel)' }}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-white" style={{ background: 'linear-gradient(135deg, #3b82f6, #0ea5e9)' }}>
            <History className="h-5 w-5" />
          </div>
          <div className="mt-4 text-lg font-black" style={{ color: 'var(--sf-text-strong)' }}>
            {t.history}
          </div>
          <div className="mt-1 text-sm" style={{ color: 'var(--sf-text-soft)' }}>
            {history.length} {t.storedTransactions}
          </div>
        </button>
      </section>

      <section className="rounded-[26px] border p-5" style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel)' }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-base font-black" style={{ color: 'var(--sf-text-strong)' }}>
              {t.recentTransactions}
            </div>
            <div className="text-sm" style={{ color: 'var(--sf-text-muted)' }}>
              {currentUser.upiId}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setScreen('history')}
            className="inline-flex items-center gap-1 text-sm font-bold"
            style={{ color: 'var(--sf-accent)' }}
          >
            {t.viewHistory}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {history.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-4 text-sm" style={{ borderColor: 'var(--sf-border)', color: 'var(--sf-text-muted)' }}>
              {t.noTransactions}
            </div>
          ) : (
            history.slice(0, 4).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between rounded-2xl border p-4"
                style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel-soft)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-white" style={{ background: transaction.direction === 'debit' ? 'var(--sf-accent-gradient)' : 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                    {transaction.direction === 'debit' ? <Send className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                  </div>
                  <div>
                    <div className="font-bold" style={{ color: 'var(--sf-text-strong)' }}>
                      {transaction.recipientName}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs" style={{ color: 'var(--sf-text-muted)' }}>
                      <Clock3 className="h-3.5 w-3.5" />
                      {transaction.timestamp}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-black" style={{ color: transaction.direction === 'debit' ? 'var(--sf-danger)' : 'var(--sf-success)' }}>
                    {transaction.direction === 'debit' ? '-' : '+'}Rs. {formatAmount(transaction.amount)}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--sf-text-muted)' }}>
                    {transaction.reason}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};
