import { motion } from 'motion/react';
import { L, locale } from '../lib/i18n';
import { Award, ChevronRight, LogOut, Phone, UserCog } from 'lucide-react';
import { courses } from '../content/courses';
import { achievements, actions, coursesCompleted, initials, overallProgress, testsPassed, useStore } from '../lib/store';
import { inTelegram } from '../lib/telegram';
import { Avatar, plural, stagger } from '../components/ui';

export function ProfileScreen() {
  const s = useStore();
  const name = s.user?.name ?? '';
  const since = new Date(s.joinedAt).toLocaleDateString(locale, { day: 'numeric', month: 'long' });
  const list = achievements(s);
  const got = list.filter((a) => a.got).length;
  const done = coursesCompleted(s);
  const tests = testsPassed(s);

  return (
    <div className="px-5 pb-36">
      <div className="pt-safe">
        <h2 className="font-display pt-6" style={{ fontSize: 28 }}>{L('Профиль', 'Profile')}</h2>
      </div>

      <motion.div {...stagger(0)} className="mt-5 rounded-3xl border border-black/5 bg-white p-5">
        <div className="flex items-center gap-4">
          <Avatar text={initials(name)} bg="linear-gradient(135deg, #E8DCC8, #D9CBB1)" size={64} />
          <div className="min-w-0">
            <div className="truncate" style={{ fontWeight: 500, fontSize: 18 }}>{name}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
              {s.user?.role ? `${s.user.role} · ` : ''}{L('с', 'since')} {since}
            </div>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-black/5 pt-5">
          <div>
            <div className="font-display" style={{ fontSize: 24 }}>{overallProgress(s)}%</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{L('обучение', 'progress')}</div>
          </div>
          <div>
            <div className="font-display" style={{ fontSize: 24 }}>{done}/{courses.length}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{plural(courses.length, 'курс', 'курса', 'курсов', 'course', 'courses')}</div>
          </div>
          <div>
            <div className="font-display" style={{ fontSize: 24 }}>{tests}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{plural(tests, 'тест сдан', 'теста сдано', 'тестов сдано', 'quiz passed', 'quizzes passed')}</div>
          </div>
        </div>
      </motion.div>

      <div className="mt-7 flex items-baseline justify-between">
        <div className="eyebrow">{L('Достижения', 'Achievements')}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{got} {L('из', 'of')} {list.length}</div>
      </div>
      <div className="no-scrollbar -mx-5 mt-3 flex gap-3 overflow-x-auto px-5 pb-1">
        {list.map((a, i) => {
          const dark = a.tone === '#1A1A1F';
          return (
            <motion.div
              {...stagger(1 + i)}
              key={a.id}
              className={`shrink-0 rounded-2xl border border-black/5 p-4 ${a.got ? '' : 'opacity-45 grayscale'}`}
              style={{ background: a.got ? a.tone : '#f4f4f4', width: 150, color: a.got && dark ? '#fff' : undefined }}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/60 backdrop-blur" style={{ color: '#111' }}>
                <Award size={16} />
              </div>
              <div className="mt-4" style={{ fontWeight: 500, fontSize: 14, lineHeight: 1.25 }}>{a.title}</div>
              <div style={{ fontSize: 11, opacity: 0.65, marginTop: 4 }}>{a.got ? L('Получено', 'Unlocked') : a.hint}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-7 overflow-hidden rounded-2xl border border-black/5 bg-white">
        {s.user?.phone && (
          <div className="flex items-center gap-4 border-b border-black/5 px-4 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/5"><Phone size={16} /></div>
            <span className="flex-1" style={{ fontWeight: 500 }}>{L('Телефон', 'Phone')}</span>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>{s.user.phone}</span>
          </div>
        )}
        {!inTelegram && (
        <button onClick={() => actions.setDemoAdmin(true)} className="flex w-full items-center gap-4 px-4 py-4 text-left">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white"><UserCog size={16} /></div>
          <div className="flex-1">
            <div style={{ fontWeight: 500 }}>{L('Кабинет руководителя', 'Manager dashboard')}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{L('Демо — в Telegram открывается сам у руководителя', 'Demo — in Telegram it opens for managers automatically')}</div>
          </div>
          <ChevronRight size={16} className="text-black/30" />
        </button>
        )}
      </div>

      {!inTelegram && (
        <button
          onClick={() => {
            if (confirm(L('Выйти? Прогресс на этом устройстве будет сброшен.', 'Sign out? Progress on this device will be reset.'))) actions.logout();
          }}
          className="press mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-black/5 bg-white p-4"
          style={{ color: '#9a4848' }}
        >
          <LogOut size={16} /> <span style={{ fontWeight: 500 }}>{L('Выйти из аккаунта', 'Sign out')}</span>
        </button>
      )}
    </div>
  );
}
