import { useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Check, RotateCcw, Sparkles } from 'lucide-react';
import { PASS_THRESHOLD } from '../content/courses';
import { useNav } from '../lib/nav';
import { overallProgress, useStore } from '../lib/store';
import { PrimaryButton } from '../components/ui';

export function QuizResultScreen({ courseId, correct, total, before }: { courseId: string; correct: number; total: number; before: number }) {
  const nav = useNav();
  const s = useStore();
  const passed = correct / total >= PASS_THRESHOLD;
  const pct = Math.round((correct / total) * 100);
  const gained = Math.max(0, overallProgress(s) - before);

  useEffect(() => {
    if (!passed) return;
    const colors = ['#1A1A1F', '#D9CFC2', '#C9D5CB', '#DFC9C9', '#ffffff'];
    confetti({ particleCount: 90, spread: 75, origin: { y: 0.35 }, colors, disableForReducedMotion: true });
    const t = setTimeout(() => confetti({ particleCount: 50, spread: 110, origin: { y: 0.3 }, colors, disableForReducedMotion: true }), 350);
    return () => clearTimeout(t);
  }, [passed]);

  const stats = [
    { v: `${correct}/${total}`, l: 'верных' },
    { v: `${pct}%`, l: 'результат' },
    { v: `+${gained}%`, l: 'к прогрессу' },
  ];

  return (
    <div className="relative flex min-h-dvh flex-col">
      <div
        className="absolute inset-0"
        style={{
          background: passed
            ? 'radial-gradient(120% 60% at 50% 10%, #E8EEE9 0%, #F4F1EA 45%, #FFFFFF 75%)'
            : 'radial-gradient(120% 60% at 50% 10%, #F1E4E4 0%, #F8F2EE 45%, #FFFFFF 75%)',
        }}
      />
      <div className="pt-safe relative flex min-h-dvh flex-col items-center px-7 pb-10 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 14 }}
          className="mt-16 flex h-28 w-28 items-center justify-center rounded-full"
          style={{
            background: passed ? 'linear-gradient(135deg, #1A1A1F, #3A3A42)' : 'linear-gradient(135deg, #6b6b6b, #9a9a9a)',
            boxShadow: '0 20px 50px -15px rgba(0,0,0,0.3)',
          }}
        >
          {passed ? <Check size={44} className="text-white" strokeWidth={2.5} /> : <Sparkles size={36} className="text-white" />}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="eyebrow mt-7" style={{ letterSpacing: '0.12em' }}>{passed ? 'Раздел завершён' : 'Почти получилось'}</div>
          <h1 className="font-display mt-2" style={{ fontSize: 34, lineHeight: 1.1 }}>{passed ? 'Отличная работа!' : 'Попробуйте ещё раз'}</h1>
          <p className="mx-auto mt-3 max-w-[290px]" style={{ color: 'var(--muted-2)', lineHeight: 1.5 }}>
            {passed
              ? 'Вы успешно прошли проверку знаний. Прогресс по курсу обновлён.'
              : `Нужно ответить верно хотя бы на ${Math.ceil(total * PASS_THRESHOLD)} из ${total}. Перечитайте уроки и попробуйте снова.`}
          </p>
        </motion.div>

        <div className="mt-8 grid w-full grid-cols-3 gap-3">
          {stats.map((x, i) => (
            <motion.div
              key={x.l}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
              className="rounded-2xl border border-black/5 bg-white/70 p-4 backdrop-blur"
            >
              <div className="font-display" style={{ fontSize: 24 }}>{x.v}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{x.l}</div>
            </motion.div>
          ))}
        </div>

        <div className="mt-auto w-full space-y-3 pt-10">
          <PrimaryButton center onClick={() => (passed ? nav.toTab('home') : nav.back())}>
            {passed ? 'Продолжить обучение' : 'К курсу'}
          </PrimaryButton>
          {!passed && (
            <button
              onClick={() => nav.replace({ name: 'quiz', courseId })}
              className="press flex w-full items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white px-6 py-4"
              style={{ fontWeight: 500 }}
            >
              <RotateCcw size={16} /> Пройти заново
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
