import { ArrowUpRight, Flame, Play, Trophy } from 'lucide-react';
import { L, locale } from '../lib/i18n';
import { motion } from 'motion/react';
import { categoryLabel, courseMinutes, courses } from '../content/courses';
import { useNav } from '../lib/nav';
import {
  courseProgress,
  coursesCompleted,
  currentCourse,
  firstName,
  overallProgress,
  streak,
  testsPassed,
  useStore,
} from '../lib/store';
import { ProgressBar, plural, stagger } from '../components/ui';

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return L('Доброй ночи', 'Good night');
  if (h < 12) return L('Доброе утро', 'Good morning');
  if (h < 18) return L('Добрый день', 'Good afternoon');
  return L('Добрый вечер', 'Good evening');
}

function today() {
  const s = new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' });
  return s[0]!.toUpperCase() + s.slice(1);
}

export function HomeScreen() {
  const s = useStore();
  const nav = useNav();
  const total = overallProgress(s);
  const current = currentCourse(s);
  const currentP = courseProgress(s, current);
  const done = coursesCompleted(s);
  const days = streak(s);
  const allDone = total === 100;
  const recommended = courses.filter((c) => c.id !== current.id && courseProgress(s, c) < 100).slice(0, 3);

  return (
    <div className="px-5 pb-36">
      <div className="pt-safe">
        <motion.div {...stagger(0)} className="pt-6">
          <p style={{ fontSize: 12, color: 'var(--muted)' }}>{today()}</p>
          <h2 className="font-display" style={{ fontSize: 26, marginTop: 2 }}>
            {greeting()}, {firstName(s.user?.name ?? '')}
          </h2>
        </motion.div>
      </div>

      <motion.div
        {...stagger(1)}
        className="relative mt-6 overflow-hidden rounded-3xl p-6 text-white"
        style={{ background: 'linear-gradient(135deg, #1A1A1F 0%, #2E2E36 60%, #3A3A42 100%)' }}
      >
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.08), transparent 70%)' }} />
        <div className="flex items-center gap-2" style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
          <Flame size={14} /> {L('Ваш прогресс', 'Your progress')}
        </div>
        <div className="mt-3 flex items-end gap-3">
          <span className="font-display" style={{ fontSize: 56, lineHeight: 1 }}>{total}</span>
          <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>%</span>
        </div>
        <p className="mt-1" style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
          {L(`Пройдено ${done} из ${courses.length} ${plural(courses.length, 'раздела', 'разделов', 'разделов')} курса мастера`, `${done} of ${courses.length} courses completed`)}
        </p>
        <div className="mt-5">
          <ProgressBar value={total} dark height={6} />
        </div>
        <div className="mt-5 flex items-center gap-4" style={{ fontSize: 12 }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.5)' }}>{L('Дней подряд', 'Day streak')}</div>
            <div style={{ fontWeight: 500, marginTop: 2 }}>{days} {plural(days, 'день', 'дня', 'дней', 'day', 'days')}</div>
          </div>
          <div className="h-6 w-px bg-white/15" />
          <div>
            <div style={{ color: 'rgba(255,255,255,0.5)' }}>{L('Тестов сдано', 'Quizzes passed')}</div>
            <div style={{ fontWeight: 500, marginTop: 2 }}>{testsPassed(s)} {L('из', 'of')} {courses.filter((c) => c.quiz.length).length}</div>
          </div>
        </div>
      </motion.div>

      {allDone ? (
        <motion.div {...stagger(2)} className="mt-7 rounded-3xl border border-black/5 p-6 text-center" style={{ background: 'var(--cream)' }}>
          <Trophy className="mx-auto" size={28} />
          <h3 className="font-display mt-3" style={{ fontSize: 22 }}>{L('Все курсы пройдены!', 'All courses complete!')}</h3>
          <p className="mt-2" style={{ color: 'var(--muted-2)', fontSize: 14 }}>
            {L('Возвращайтесь в базу знаний, когда нужно что-то уточнить.', 'Come back to the knowledge base whenever you need a refresher.')}
          </p>
        </motion.div>
      ) : (
        <>
          <motion.div {...stagger(2)} className="mt-8 flex items-center justify-between">
            <h3 style={{ fontWeight: 500, fontSize: 18 }}>{currentP > 0 ? L('Продолжить', 'Continue') : L('Начните отсюда', 'Start here')}</h3>
            <button onClick={() => nav.toTab('courses')} className="flex items-center gap-1" style={{ fontSize: 13, color: 'var(--muted-2)' }}>
              {L('Все курсы', 'All courses')} <ArrowUpRight size={14} />
            </button>
          </motion.div>

          <motion.button
            {...stagger(3)}
            onClick={() => nav.push({ name: 'course', courseId: current.id })}
            className="press mt-4 w-full overflow-hidden rounded-3xl border border-black/5 bg-white text-left"
            style={{ boxShadow: '0 4px 24px -8px rgba(0,0,0,0.06)' }}
          >
            <div className="h-32 w-full" style={{ background: current.cover }} />
            <div className="p-5">
              <div className="eyebrow">{categoryLabel(current.category)}</div>
              <div className="mt-1.5 flex items-center justify-between gap-3">
                <h4 style={{ fontWeight: 500, fontSize: 18 }}>{current.title}</h4>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-white">
                  <Play size={14} fill="white" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex-1"><ProgressBar value={currentP} /></div>
                <span style={{ fontSize: 12, color: 'var(--muted-2)' }}>{currentP}%</span>
              </div>
            </div>
          </motion.button>
        </>
      )}

      {recommended.length > 0 && (
        <>
          <motion.h3 {...stagger(4)} className="mt-8" style={{ fontWeight: 500, fontSize: 18 }}>{L('Дальше по программе', 'Up next')}</motion.h3>
          <div className="mt-3 space-y-2.5">
            {recommended.map((c, i) => (
              <motion.button
                {...stagger(5 + i)}
                key={c.id}
                onClick={() => nav.push({ name: 'course', courseId: c.id })}
                className="press flex w-full items-center gap-4 rounded-2xl border border-black/5 bg-white p-3 text-left"
              >
                <div className="h-14 w-14 shrink-0 rounded-xl" style={{ background: c.cover }} />
                <div className="min-w-0 flex-1">
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{categoryLabel(c.category)} · {courseMinutes(c)} {L('мин', 'min')}</div>
                  <div className="truncate" style={{ fontWeight: 500, marginTop: 2 }}>{c.title}</div>
                </div>
                <ArrowUpRight size={16} className="shrink-0 text-black/40" />
              </motion.button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
