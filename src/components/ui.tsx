import { ArrowLeft, ArrowRight, Check, Sparkles, TriangleAlert } from 'lucide-react';
import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import type { Block } from '../content/courses';
import { haptic } from '../lib/telegram';

export function PrimaryButton({
  children,
  onClick,
  disabled,
  arrow = true,
  center,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  arrow?: boolean;
  center?: boolean;
}) {
  return (
    <button
      onClick={() => {
        haptic.tap();
        onClick?.();
      }}
      disabled={disabled}
      className={`press group flex w-full items-center rounded-2xl px-6 py-4 text-white transition-colors ${
        center ? 'justify-center' : 'justify-between'
      } ${disabled ? 'bg-black/30' : 'bg-black hover:bg-black/85'}`}
    >
      <span style={{ fontWeight: 500 }}>{children}</span>
      {arrow && !center && <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />}
    </button>
  );
}

export function ProgressBar({ value, dark, height = 4 }: { value: number; dark?: boolean; height?: number }) {
  return (
    <div className={`w-full overflow-hidden rounded-full ${dark ? 'bg-white/10' : 'bg-black/5'}`} style={{ height }}>
      <motion.div
        className={`h-full rounded-full ${dark ? 'bg-white' : 'bg-black'}`}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

export function BackButton({ onClick, glass }: { onClick: () => void; glass?: boolean }) {
  return (
    <button
      onClick={onClick}
      aria-label="Назад"
      className={`press flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
        glass ? 'bg-white/80 backdrop-blur' : 'bg-black/5'
      }`}
    >
      <ArrowLeft size={18} />
    </button>
  );
}

/** Шапка урока/теста: назад + подпись + сегментный прогресс */
export function StepHeader({ label, steps, current, onBack }: { label: string; steps: number; current: number; onBack: () => void }) {
  return (
    <div className="pt-safe sticky top-0 z-20 border-b border-black/5 bg-white/85 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-5 py-4">
        <BackButton onClick={onBack} />
        <div className="min-w-0 flex-1">
          <div className="truncate" style={{ fontSize: 11, color: 'var(--muted)' }}>{label}</div>
          <div className="mt-1.5 flex gap-1">
            {Array.from({ length: steps }, (_, i) => (
              <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-black/5">
                <motion.div
                  className="h-full bg-black"
                  initial={false}
                  animate={{ width: i < current ? '100%' : i === current ? '50%' : '0%' }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Нижняя панель с главной кнопкой */
export function BottomBar({ children }: { children: ReactNode }) {
  return (
    <div className="pb-safe sticky bottom-0 z-20 border-t border-black/5 bg-white/85 px-5 pt-4 backdrop-blur-xl">
      {children}
    </div>
  );
}

export function Stat({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white/70 px-3 py-4 text-center backdrop-blur">
      <div className="font-display" style={{ fontSize: 22 }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{label}</div>
    </div>
  );
}

export function Avatar({ text, bg, size = 44 }: { text: string; bg: string; size?: number }) {
  return (
    <div
      className="font-display flex shrink-0 items-center justify-center rounded-full"
      style={{ width: size, height: size, background: bg, fontSize: size * 0.34 }}
    >
      {text}
    </div>
  );
}

/** Рендер блоков текста (урок, база знаний). Пункты check рендерит сам урок. */
export function ContentBlock({ block }: { block: Block }) {
  switch (block.kind) {
    case 'h':
      return <h3 style={{ fontWeight: 500, fontSize: 18 }}>{block.text}</h3>;
    case 'p':
      return <p style={{ color: '#3a3a3a', lineHeight: 1.6 }}>{block.text}</p>;
    case 'list':
      return (
        <ul className="space-y-2">
          {block.items.map((it, i) => (
            <li key={i} className="flex gap-3" style={{ color: '#3a3a3a', lineHeight: 1.5 }}>
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-black/40" />
              {it}
            </li>
          ))}
        </ul>
      );
    case 'tip':
      return (
        <div className="rounded-2xl border border-black/5 p-4" style={{ background: 'var(--cream)' }}>
          <div className="eyebrow flex items-center gap-2" style={{ color: 'var(--gold)' }}>
            <Sparkles size={12} /> Важно
          </div>
          <p className="mt-2" style={{ color: '#3a3a3a', lineHeight: 1.55 }}>{block.text}</p>
        </div>
      );
    case 'warn':
      return (
        <div className="rounded-2xl border border-red-500/15 bg-red-50/60 p-4">
          <div className="eyebrow flex items-center gap-2" style={{ color: '#b54444' }}>
            <TriangleAlert size={12} /> Нельзя
          </div>
          <p className="mt-2" style={{ color: '#3a3a3a', lineHeight: 1.55 }}>{block.text}</p>
        </div>
      );
    case 'check':
      return (
        <div className="flex items-start gap-3">
          <Check size={16} className="mt-1" /> {block.text}
        </div>
      );
  }
}

/** Плавное появление элементов списка один за другим */
export const stagger = (i: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.04 * i, duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
});

export function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}
