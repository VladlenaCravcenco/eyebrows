import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { brand } from '../content/brand';
import { actions } from '../lib/store';
import { PrimaryButton } from '../components/ui';

/** +373 (XX) XXX-XXX — молдавский формат, 8 цифр после кода */
function formatPhone(digits: string) {
  let out = brand.phonePrefix + ' (' + digits.slice(0, 2);
  if (digits.length >= 2) out += ') ' + digits.slice(2, 5);
  if (digits.length >= 5) out += '-' + digits.slice(5, 8);
  return out;
}

/**
 * Вход. Пока без SMS: сотрудница вводит телефон и имя.
 * SMS-код / вход через Telegram подключим вместе с сервером.
 * Внутри Telegram этот экран вообще не показывается — имя берём из Telegram.
 */
export function AuthScreen() {
  const [step, setStep] = useState<'phone' | 'name'>('phone');
  const [digits, setDigits] = useState('');
  const [name, setName] = useState('');
  const phoneOk = digits.length === 8;
  const nameOk = name.trim().length >= 2;

  return (
    <div className="relative flex min-h-dvh flex-col px-7 pb-10">
      <div
        className="absolute inset-x-0 top-0 h-[55%]"
        style={{ background: 'linear-gradient(180deg, #F4EFE7 0%, #EDE6DA 60%, #FFFFFF 100%)' }}
      />
      <div className="pt-safe relative flex flex-1 flex-col justify-between">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="pt-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white">
              <Sparkles size={18} strokeWidth={2} />
            </div>
            <span style={{ fontWeight: 600, fontSize: 18, letterSpacing: '-0.02em' }}>{brand.name}</span>
          </div>
          <div className="mt-[18vh]">
            <h1 className="font-display" style={{ fontSize: 40, lineHeight: 1.05 }}>
              Добро
              <br />
              пожаловать.
            </h1>
            <p className="mt-3 max-w-[280px]" style={{ color: 'var(--muted-2)', lineHeight: 1.5 }}>
              {brand.tagline}
            </p>
          </div>
        </motion.div>

        <div className="relative mt-10">
          <AnimatePresence mode="wait">
            {step === 'phone' ? (
              <motion.form
                key="phone"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (phoneOk) setStep('name');
                }}
              >
                <label htmlFor="phone" style={{ fontSize: 13, color: 'var(--muted-2)' }}>Номер телефона</label>
                <div className="rounded-2xl border border-black/10 bg-white px-5 py-4 focus-within:border-black">
                  <input
                    id="phone"
                    inputMode="tel"
                    autoComplete="tel"
                    value={formatPhone(digits)}
                    onChange={(e) => {
                      const all = e.target.value.replace(/\D/g, '');
                      const prefix = brand.phonePrefix.replace(/\D/g, '');
                      setDigits((all.startsWith(prefix) ? all.slice(prefix.length) : all).slice(0, 8));
                    }}
                    className="w-full bg-transparent outline-none"
                    style={{ fontSize: 17, letterSpacing: '0.01em' }}
                  />
                </div>
                <PrimaryButton disabled={!phoneOk} onClick={() => setStep('name')}>Продолжить</PrimaryButton>
                <p className="text-center" style={{ fontSize: 12, color: 'var(--muted)' }}>
                  Продолжая, вы соглашаетесь
                  <br />с условиями обработки данных
                </p>
              </motion.form>
            ) : (
              <motion.form
                key="name"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (nameOk) actions.login({ name: name.trim(), phone: formatPhone(digits) });
                }}
              >
                <div>
                  <label htmlFor="name" style={{ fontSize: 13, color: 'var(--muted-2)' }}>Как вас зовут?</label>
                  <p className="mt-1" style={{ fontSize: 13, color: 'var(--muted)' }}>{formatPhone(digits)}</p>
                </div>
                <div className="rounded-2xl border border-black/10 bg-white px-5 py-4 focus-within:border-black">
                  <input
                    id="name"
                    autoFocus
                    autoComplete="name"
                    placeholder="Имя и фамилия"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent outline-none placeholder:text-black/30"
                    style={{ fontSize: 17 }}
                  />
                </div>
                <PrimaryButton disabled={!nameOk} onClick={() => actions.login({ name: name.trim(), phone: formatPhone(digits) })}>
                  Войти
                </PrimaryButton>
                <button type="button" onClick={() => setStep('phone')} className="w-full text-center" style={{ fontSize: 13, color: 'var(--muted-2)' }}>
                  Изменить номер
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
