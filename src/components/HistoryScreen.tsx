import React, { useState } from 'react';
import { useApp } from '../state/AppContext';
import { translations } from '../lib/i18n';
import { ArrowLeft, ShieldCheck, AlertTriangle, Search, Clock } from 'lucide-react';

export const HistoryScreen: React.FC = () => {
  const { language, setScreen, history } = useApp();
  const t = translations[language];

  const [filter, setFilter] = useState<'all' | 'safe' | 'reviewed'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredHistory = history.filter((tx) => {
    const matchesFilter = 
      filter === 'all' 
        ? true 
        : filter === 'safe' 
        ? tx.status === 'safe' 
        : tx.status === 'reviewed';

    const matchesSearch = 
      tx.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-5 animate-fadeIn pb-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setScreen('home')}
          className="flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t.home}</span>
        </button>

        <span className="text-xs font-semibold text-slate-400">
          {history.length} Transactions Logged
        </span>
      </div>

      {/* Screen Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-white">{t.historyTitle}</h2>
        <p className="mt-0.5 text-xs text-slate-400">{t.historySubtitle}</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-2.5">
        {/* Search Input */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by payee name or ID..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              filter === 'all'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {t.filterAll} ({history.length})
          </button>
          <button
            onClick={() => setFilter('safe')}
            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              filter === 'safe'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>{t.filterSafe}</span>
          </button>
          <button
            onClick={() => setFilter('reviewed')}
            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              filter === 'reviewed'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>{t.filterReviewed}</span>
          </button>
        </div>
      </div>

      {/* Transaction List */}
      <div className="divide-y divide-slate-800 rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl overflow-hidden">
        {filteredHistory.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            {t.noTransactions}
          </div>
        ) : (
          filteredHistory.map((tx) => (
            <div key={tx.id} className="p-4 transition hover:bg-slate-800/40">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl font-bold text-sm ${
                    tx.status === 'safe'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {tx.recipientName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{tx.recipientName}</span>
                      {tx.isSimulated && (
                        <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-extrabold tracking-wider text-emerald-300">
                          {t.simulatedTag}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-400">
                      <span>{tx.phoneNumber}</span> • <span className="font-mono text-[11px] text-slate-500">{tx.id}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Clock className="h-3 w-3" />
                      <span>{tx.timestamp}</span>
                    </div>
                  </div>
                </div>

                {/* Amount & Status Badge */}
                <div className="text-right">
                  <div className="text-base font-black text-white">
                    ₹{tx.amount.toLocaleString('en-IN')}
                  </div>
                  <div className="mt-1">
                    {tx.status === 'safe' ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/20">
                        <ShieldCheck className="h-3 w-3" />
                        <span>{t.safeBadge}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-400 border border-amber-500/20">
                        <AlertTriangle className="h-3 w-3" />
                        <span>{t.reviewedBadge}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
