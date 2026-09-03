import React from 'react';
import { Bell, MonitorSmartphone, MoonStar, ShieldCheck, SunMedium, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../state/AppContext';
import { LANGUAGES, translations } from '../lib/i18n';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    language,
    setLanguage,
    theme,
    setTheme,
    logout,
    setScreen,
    isPhoneFrame,
    setIsPhoneFrame
    , notifications
  } = useApp();
  const t = translations[language];
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="border-b px-4 py-4" style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-header)' }}>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <button
          className="flex items-center gap-3 text-left"
          onClick={() => setScreen(currentUser ? 'home' : 'login')}
          type="button"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-lg" style={{ background: 'var(--sf-accent-gradient)' }}>
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xl font-black tracking-tight" style={{ color: 'var(--sf-text-strong)' }}>
              {t.appTitle}
            </div>
            <div className="text-xs" style={{ color: 'var(--sf-text-muted)' }}>
              {currentUser ? `${t.signedInAs}: ${currentUser.username}` : t.tagline}
            </div>
          </div>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-full border p-1" style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel-soft)' }}>
            <button
              type="button"
              onClick={() => setTheme('light')}
              className="rounded-full px-3 py-1.5 text-xs font-semibold transition"
              style={{
                background: theme === 'light' ? 'var(--sf-accent-gradient)' : 'transparent',
                color: theme === 'light' ? '#fff' : 'var(--sf-text-muted)'
              }}
            >
              <span className="inline-flex items-center gap-1">
                <SunMedium className="h-3.5 w-3.5" />
                {t.lightTheme}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className="rounded-full px-3 py-1.5 text-xs font-semibold transition"
              style={{
                background: theme === 'dark' ? 'var(--sf-accent-gradient)' : 'transparent',
                color: theme === 'dark' ? '#fff' : 'var(--sf-text-muted)'
              }}
            >
              <span className="inline-flex items-center gap-1">
                <MoonStar className="h-3.5 w-3.5" />
                {t.darkTheme}
              </span>
            </button>
          </div>

          <label className="rounded-full border px-3 py-2 text-xs font-semibold" style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel-soft)', color: 'var(--sf-text-muted)' }}>
            <span className="mr-2">{t.language}</span>
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value as typeof language)}
              className="border-0 bg-transparent text-xs font-semibold outline-none"
              style={{ color: 'var(--sf-text-strong)' }}
            >
              {LANGUAGES.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.nativeName}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => setIsPhoneFrame((value) => !value)}
            className="rounded-full border px-3 py-2 text-xs font-semibold transition"
            style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel-soft)', color: 'var(--sf-text-muted)' }}
            title={isPhoneFrame ? t.fullView : t.phoneFrame}
          >
            <span className="inline-flex items-center gap-1.5">
              <MonitorSmartphone className="h-3.5 w-3.5" />
              {isPhoneFrame ? t.fullView : t.phoneFrame}
            </span>
          </button>

          {currentUser && (
            <div className="relative">
              <button type="button" onClick={() => setNotificationsOpen((value) => !value)} className="relative rounded-full border p-2.5" style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel-soft)', color: 'var(--sf-text-strong)' }} aria-label="Notifications">
                <Bell className="h-4 w-4" />
                {notifications.length > 0 && <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-rose-500 px-1 text-center text-[10px] font-black text-white">{notifications.length > 9 ? '9+' : notifications.length}</span>}
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 top-12 z-40 w-80 rounded-2xl border p-3 shadow-2xl" style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel)' }}>
                  <div className="px-2 pb-2 text-sm font-black" style={{ color: 'var(--sf-text-strong)' }}>Notifications</div>
                  <div className="max-h-72 space-y-2 overflow-auto">
                    {notifications.length === 0 ? <div className="px-2 py-4 text-sm" style={{ color: 'var(--sf-text-muted)' }}>No transaction notifications.</div> : notifications.map((notification) => <div key={notification.id} className="rounded-xl border p-3" style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel-soft)' }}><div className="text-xs font-black" style={{ color: 'var(--sf-text-strong)' }}>{notification.title}</div><div className="mt-1 text-xs leading-5" style={{ color: 'var(--sf-text-soft)' }}>{notification.message}</div></div>)}
                  </div>
                </div>
              )}
            </div>
          )}

          {currentUser && (
            <button
              type="button"
              onClick={logout}
              className="rounded-full border px-3 py-2 text-xs font-semibold transition"
              style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel-soft)', color: 'var(--sf-text-muted)' }}
            >
              <span className="inline-flex items-center gap-1.5">
                <LogOut className="h-3.5 w-3.5" />
                {t.logout}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
