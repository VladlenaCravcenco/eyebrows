import { useState } from 'react';
import { L } from '../lib/i18n';
import { motion } from 'motion/react';
import { CheckCircle2, Search, X } from 'lucide-react';
import { CATEGORIES, categoryLabel, courses } from '../content/courses';
import { useNav } from '../lib/nav';
import { courseProgress, useStore } from '../lib/store';
import { ProgressBar, plural, stagger } from '../components/ui';

const filters = ['Все', ...CATEGORIES] as const;

export function CoursesScreen() {
  const s = useStore();
  const nav = useNav();
  const [filter, setFilter] = useState<(typeof filters)[number]>('Все');
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();

  const list = courses.filter((c) => {
    if (filter !== 'Все' && c.category !== filter) return false;
    if (!query) return true;
    return (
      c.title.toLowerCase().includes(query) ||
      c.subtitle.toLowerCase().includes(query) ||
      c.lessons.some((l) => l.title.toLowerCase().includes(query))
    );
  });

  return (
    <div className="px-5 pb-36">
      <div className="pt-safe">
        <h2 className="font-display pt-6" style={{ fontSize: 28 }}>{L('Курсы', 'Courses')}</h2>
        <p className="mt-1" style={{ color: 'var(--muted)', fontSize: 13 }}>{L('Микрообучение по разделам внутреннего регламента', 'Bite-sized lessons on how your studio works')}</p>
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-2xl border border-black/5 bg-white px-4 py-3 focus-within:border-black/20">
        <Search size={16} className="text-black/40" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={L('Поиск курса или урока', 'Search courses and lessons')}
          className="w-full bg-transparent outline-none placeholder:text-black/35"
          style={{ fontSize: 14 }}
        />
        {q && (
          <button onClick={() => setQ('')} aria-label={L('Очистить', 'Clear')}>
            <X size={16} className="text-black/40" />
          </button>
        )}
      </div>

      <div className="no-scrollbar -mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-full border px-4 py-2 transition-colors ${
              filter === f ? 'border-black bg-black text-white' : 'border-black/10 bg-white text-black/60'
            }`}
            style={{ fontSize: 13 }}
          >
            {f === 'Все' ? L('Все', 'All') : categoryLabel(f)}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {list.map((c, i) => {
          const p = courseProgress(s, c);
          return (
            <motion.button
              {...stagger(i)}
              key={c.id}
              onClick={() => nav.push({ name: 'course', courseId: c.id })}
              className="press w-full overflow-hidden rounded-3xl border border-black/5 bg-white text-left"
            >
              <div className="flex">
                <div className="relative w-28 shrink-0 self-stretch" style={{ background: c.cover, minHeight: 120 }}>
                  {p === 100 && (
                    <div className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white">
                      <CheckCircle2 size={16} />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between gap-4 p-4">
                  <div>
                    <div className="eyebrow">{categoryLabel(c.category)}</div>
                    <div className="mt-1" style={{ fontWeight: 500, lineHeight: 1.3 }}>{c.title}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1"><ProgressBar value={p} /></div>
                    <span className="shrink-0" style={{ fontSize: 11, color: 'var(--muted)' }}>
                      {p > 0 ? `${p}%` : `${c.lessons.length} ${plural(c.lessons.length, 'урок', 'урока', 'уроков', 'lesson', 'lessons')}`}
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
        {list.length === 0 && (
          <p className="py-10 text-center" style={{ color: 'var(--muted)', fontSize: 14 }}>{L('Ничего не нашлось', 'Nothing found')}</p>
        )}
      </div>
    </div>
  );
}
