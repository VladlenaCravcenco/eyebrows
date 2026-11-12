import { useSyncExternalStore } from 'react';
import { L } from '../../lib/i18n';
import { courses, type Block, type Course, type Lesson, type Question } from '../../content/courses';
import { knowledgeBase, type Doc } from '../../content/knowledge';
import { publishContent, type Content } from '../../content/live';

/**
 * Черновик редактора. Все правки копятся здесь (и на телефоне, если Telegram закроется),
 * а девочки видят их только после «Сохранить для всех».
 */
const KEY = 'eyebrows.draft.v1';

let draft: Content | null = (() => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Content) : null;
  } catch {
    return null;
  }
})();
const listeners = new Set<() => void>();

function emit() {
  try {
    if (draft) localStorage.setItem(KEY, JSON.stringify(draft));
    else localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

const current = (): Content => structuredClone({ courses, knowledgeBase });

/** Черновик, а если правок ещё нет — актуальная версия */
export function useDraft(): { content: Content; dirty: boolean } {
  const d = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => draft,
  );
  return { content: d ?? { courses, knowledgeBase }, dirty: !!d };
}

export function edit(fn: (c: Content) => void) {
  const next = draft ? structuredClone(draft) : current();
  fn(next);
  // тип урока определяется сам: есть пункты чек-листа → «чек-лист»
  for (const c of next.courses)
    for (const l of c.lessons) l.type = l.content.some((b) => b.kind === 'check') ? 'checklist' : 'reading';
  draft = next;
  emit();
}

export function discard() {
  draft = null;
  emit();
}

/** Пустые блоки и пустые пункты списка девочкам не показываем */
function tidy(blocks: Block[]): Block[] {
  return blocks
    .map((b) => (b.kind === 'list' ? { ...b, items: b.items.map((x) => x.trim()).filter(Boolean) } : { ...b, text: b.text.trim() }))
    .filter((b) => (b.kind === 'list' ? b.items.length > 0 : b.text.length > 0));
}

export async function publish() {
  if (!draft) return;
  const c = structuredClone(draft);
  for (const course of c.courses) {
    for (const l of course.lessons) l.content = tidy(l.content);
    course.quiz = course.quiz.filter((q) => q.question.trim());
    for (const q of course.quiz) {
      q.options = q.options.map((o) => o.trim());
      if (q.options.some((o) => !o)) throw new Error(L(`В вопросе «${q.question}» есть пустой вариант ответа`, `Question “${q.question}” has an empty answer option`));
    }
  }
  for (const d of c.knowledgeBase) for (const s of d.sections) s.content = tidy(s.content);
  await publishContent(c);
  draft = null;
  emit();
}

/* ---------- помощники ---------- */

export const newId = (prefix: string) => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

export const findIn = (c: Content, courseId: string) => c.courses.find((x) => x.id === courseId);

export function move<T>(list: T[], i: number, dir: -1 | 1) {
  const j = i + dir;
  if (j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j]!, list[i]!];
}

export const blankCourse = (): Course => ({
  id: newId('c'),
  title: L('Новый курс', 'New course'),
  subtitle: '',
  category: 'Регламент',
  cover: 'linear-gradient(135deg, #EFE7DC 0%, #D9CFC2 100%)',
  lessons: [],
  quiz: [],
});

export const blankLesson = (): Lesson => ({
  id: newId('l'),
  title: L('Новый урок', 'New lesson'),
  minutes: 3,
  type: 'reading',
  content: [{ kind: 'p', text: '' }],
});

export const blankQuestion = (): Question => ({ question: '', options: ['', ''], correct: 0 });

export const blankDoc = (): Doc => ({
  id: newId('d'),
  title: L('Новый документ', 'New document'),
  desc: '',
  icon: 'book',
  tag: L('Регламент', 'Policy'),
  sections: [{ title: L('Раздел', 'Section'), content: [{ kind: 'p', text: '' }] }],
});

export const blankBlock = (kind: Block['kind']): Block => (kind === 'list' ? { kind, items: [''] } : { kind, text: '' });
