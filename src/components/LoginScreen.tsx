import React, { useState } from 'react';
import { Fingerprint, KeyRound, LogIn, ScanFace, UserRound } from 'lucide-react';
import { APP_NAME } from '../lib/config';
import { registerBiometrics } from '../lib/biometrics';
import { translations } from '../lib/i18n';
import { useApp } from '../state/AppContext';

export const LoginScreen: React.FC = () => {
  const { demoAccounts, language, login, registerAccount } = useApp();
  const t = translations[language];
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [registerForm, setRegisterForm] = useState({ username: '', password: '', fullName: '', upiId: '', phoneNumber: '' });
  const [registerMfa, setRegisterMfa] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const result = login(username, password);
    if (!result.success) {
      setErrorMessage(t.invalidCredentials);
      return;
    }

    setErrorMessage(null);
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = registerAccount(registerForm);
    if (!result.success) {
      setErrorMessage(result.message || 'Account creation failed.');
      return;
    }

    if (registerMfa) {
      await registerBiometrics(registerForm.username);
    }
    setErrorMessage(null);
  };

  const updateRegisterForm = (field: keyof typeof registerForm, value: string) => {
    setRegisterForm((previous) => ({ ...previous, [field]: value }));
    setErrorMessage(null);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1.2fr_0.9fr]">
      <section className="rounded-[32px] border p-7 shadow-xl" style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-accent-soft)' }}>
        <div className="inline-flex rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.24em]" style={{ background: 'var(--sf-panel)', color: 'var(--sf-text-muted)' }}>
          {APP_NAME}
        </div>
        <h1 className="mt-5 text-4xl font-black" style={{ color: 'var(--sf-text-strong)' }}>
          {t.loginTitle}
        </h1>
        <p className="mt-3 max-w-xl text-base leading-7" style={{ color: 'var(--sf-text-soft)' }}>
          {t.loginSubtitle}
        </p>
        <div className="mt-6 rounded-[24px] border p-5 text-sm leading-6" style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel)' }}>
          <div className="font-bold" style={{ color: 'var(--sf-text-strong)' }}>{t.loginHelp}</div>
          <div className="mt-2" style={{ color: 'var(--sf-text-soft)' }}>{t.switchAccountHint}</div>
          <div className="mt-2 font-semibold" style={{ color: 'var(--sf-text-muted)' }}>{t.demoUpiPinHint}</div>
        </div>
      </section>

      <section className="space-y-5">
        <form onSubmit={showRegister ? handleRegister : handleSubmit} className="rounded-[32px] border p-6 shadow-xl" style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel)' }}>
          <div className="flex items-center justify-between gap-3">
            <div className="text-2xl font-black" style={{ color: 'var(--sf-text-strong)' }}>{showRegister ? 'Create account' : t.login}</div>
            <button type="button" onClick={() => { setShowRegister((value) => !value); setErrorMessage(null); }} className="text-xs font-bold" style={{ color: 'var(--sf-accent)' }}>
              {showRegister ? 'Use login' : 'Create account'}
            </button>
          </div>

          {showRegister ? (
            <div className="mt-5 space-y-4">
              {([
                ['fullName', 'Full name', 'Your name'],
                ['username', 'User ID', 'Choose a user ID'],
                ['password', t.password, 'At least 6 characters'],
                ['upiId', 'UPI ID', 'name@safefinance'],
                ['phoneNumber', 'Mobile number', '10-digit mobile number']
              ] as Array<[keyof typeof registerForm, string, string]>).map(([field, label, placeholder]) => (
                <label key={field} className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--sf-text-muted)' }}>{label}</span>
                  <input type={field === 'password' ? 'password' : 'text'} value={registerForm[field]} onChange={(event) => updateRegisterForm(field, event.target.value)} placeholder={placeholder} className="w-full rounded-2xl border px-4 py-3 text-sm outline-none" style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-input)', color: 'var(--sf-text-strong)' }} />
                </label>
              ))}
              <label className="flex items-center gap-3 rounded-2xl border p-3 text-sm" style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel-soft)', color: 'var(--sf-text-soft)' }}>
                <input type="checkbox" checked={registerMfa} onChange={(event) => setRegisterMfa(event.target.checked)} />
                <span className="inline-flex items-center gap-2"><Fingerprint className="h-4 w-4" /> Register face or fingerprint MFA on this device</span>
                <ScanFace className="ml-auto h-4 w-4" />
              </label>
              <button type="submit" className="rounded-full px-6 py-3 text-sm font-black text-white" style={{ background: 'var(--sf-accent-gradient)' }}>Create account</button>
            </div>
          ) : (
          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--sf-text-muted)' }}>
                {t.username}
              </span>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-4 top-3.5 h-4 w-4" style={{ color: 'var(--sf-text-muted)' }} />
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="w-full rounded-2xl border py-3 pl-11 pr-4 text-sm outline-none"
                  style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-input)', color: 'var(--sf-text-strong)' }}
                  placeholder="sahilchaudhary"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--sf-text-muted)' }}>
                {t.password}
              </span>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-4 top-3.5 h-4 w-4" style={{ color: 'var(--sf-text-muted)' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border py-3 pl-11 pr-4 text-sm outline-none"
                  style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-input)', color: 'var(--sf-text-strong)' }}
                  placeholder="sahil1122"
                />
              </div>
            </label>
          </div>
          )}

          {errorMessage && (
            <div className="mt-4 rounded-2xl border px-4 py-3 text-sm font-medium" style={{ borderColor: 'rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.08)', color: 'var(--sf-danger)' }}>
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            className="mt-5 rounded-full px-6 py-3 text-sm font-black text-white"
            style={{ background: 'var(--sf-accent-gradient)' }}
          >
            <span className="inline-flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              {t.login}
            </span>
          </button>
        </form>

        <section className="rounded-[32px] border p-6 shadow-xl" style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel)' }}>
          <div className="text-lg font-black" style={{ color: 'var(--sf-text-strong)' }}>
            {t.demoAccounts}
          </div>
          <div className="mt-4 space-y-3">
            {demoAccounts.map((account) => (
              <div
                key={account.username}
                className="rounded-[24px] border p-4"
                style={{ borderColor: 'var(--sf-border)', background: 'var(--sf-panel-soft)' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--sf-text-muted)' }}>
                      {account.role === 'sender' ? t.senderAccount : t.receiverAccount}
                    </div>
                    <div className="mt-2 text-lg font-black" style={{ color: 'var(--sf-text-strong)' }}>
                      {account.username}
                    </div>
                    <div className="mt-1 text-sm" style={{ color: 'var(--sf-text-soft)' }}>
                      {account.password}
                    </div>
                    <div className="mt-2 text-sm" style={{ color: 'var(--sf-text-muted)' }}>
                      {account.role === 'sender' ? t.senderTip : t.receiverTip}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUsername(account.username);
                      setPassword(account.password);
                      setErrorMessage(null);
                    }}
                    className="rounded-full px-4 py-2 text-xs font-black text-white"
                    style={{ background: 'var(--sf-accent-gradient)' }}
                  >
                    {t.autoFill}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
};
