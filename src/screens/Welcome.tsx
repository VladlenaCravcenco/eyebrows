import { motion } from 'motion/react';
import { brand } from '../content/brand';
import { courses, totalLessons, totalMinutes } from '../content/courses';
import { actions, firstName, useStore } from '../lib/store';
import { PrimaryButton, Stat, plural } from '../components/ui';

export function WelcomeScreen() {
  const s = useStore();
  const name = firstName(s.user?.name ?? '');
  const hours = Math.max(1, Math.round(totalMinutes() / 60));
  const lessons = totalLessons();

  return (
    <div className="relative flex min-h-dvh flex-col">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 60% at 50% 0%, #EFE7DB 0%, #F7F2E9 35%, #FFFFFF 70%)' }} />
      <div className="pt-safe relative flex min-h-dvh flex-col justify-between px-7 pb-10">
        <div className="flex flex-col items-center pt-16 text-center">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            className="flex h-32 w-32 items-center justify-center rounded-full"
            style={{ background: 'linear-gradient(135deg, #1A1A1F 0%, #3A3A42 100%)', boxShadow: '0 20px 60px -15px rgba(0,0,0,0.4)' }}
          >
            <span className="font-display text-white" style={{ fontSize: 56 }}>{name[0]?.toUpperCase()}</span>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
            <p className="mt-8" style={{ fontSize: 13, letterSpacing: '0.12em', color: 'var(--muted)', textTransform: 'uppercase' }}>
              {brand.name}
            </p>
            <h1 className="font-display mt-3" style={{ fontSize: 34, lineHeight: 1.1 }}>Привет, {name}</h1>
            <p className="mx-auto mt-4 max-w-[300px]" style={{ color: 'var(--muted-2)', lineHeight: 1.55 }}>
              Здесь вы пройдёте курс мастера, изучите регламенты студии и сможете сверяться с базой знаний в любой момент.
            </p>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }} className="mt-10 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Stat value={courses.length} label={plural(courses.length, 'раздел', 'раздела', 'разделов')} />
            <Stat value={lessons} label={plural(lessons, 'урок', 'урока', 'уроков')} />
            <Stat value={`~${hours} ч`} label="обучения" />
          </div>
          <PrimaryButton onClick={actions.welcomeSeen}>Начать обучение</PrimaryButton>
        </motion.div>
      </div>
    </div>
  );
}
