import { useSyncExternalStore } from 'react';
import { courses, findCourse, PASS_THRESHOLD, type Course } from '../content/courses';

/**
 * Прогресс сотрудницы. Хранится на телефоне (localStorage), а внутри Telegram
 * ещё и синхронизируется с сервером (см. lib/sync.ts) — его видит руководитель.
 */
export type QuizResult = { correct: number; total: number; passed: boolean; at: string };

export type State = {
  user: { name: string; phone?: string; telegramId?: number; role?: string | null } | null;
  welcomed: boolean;
  /** courseId -> id пройденных уроков */
  lessonsDone: Record<string, string[]>;
  /** courseId -> лучший результат теста */
  quiz: Record<string, QuizResult>;
  /** дни, когда открывали уроки, в формате YYYY-MM-DD */
  activeDays: string[];
  joinedAt: string;
  /** выдаётся сервером; сам сервер всё равно проверяет права */
  isManager?: boolean;
};

const KEY = 'eyebrows.progress.v1';

const empty = (): State => ({
  user: null,
  welcomed: false,
  lessonsDone: {},
  quiz: {},
  activeDays: [],
  joinedAt: new Date().toISOString(),
});

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...empty(), ...JSON.parse(raw) };
  } catch {
    /* приватный режим и т.п. — работаем без сохранения */
  }
  return empty();
}

let state = load();
const listeners = new Set<() => void>();

function set(patch: Partial<State> | ((s: State) => Partial<State>)) {
  const p = typeof patch === 'function' ? patch(state) : patch;
  state = { ...state, ...p };
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export const getState = () => state;

export function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function useStore() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
  );
}

const today = () => new Date().toLocaleDateString('sv-SE'); // YYYY-MM-DD в местном времени

function touchDay(s: State) {
  const d = today();
  return s.activeDays.includes(d) ? s.activeDays : [...s.activeDays, d];
}

export const actions = {
  login(user: State['user']) {
    set({ user });
  },
  welcomeSeen() {
    set({ welcomed: true });
  },
  completeLesson(courseId: string, lessonId: string) {
    set((s) => {
      const done = s.lessonsDone[courseId] ?? [];
      return {
        lessonsDone: done.includes(lessonId) ? s.lessonsDone : { ...s.lessonsDone, [courseId]: [...done, lessonId] },
        activeDays: touchDay(s),
      };
    });
  },
  saveQuiz(courseId: string, correct: number, total: number) {
    set((s) => {
      const prev = s.quiz[courseId];
      const passed = correct / total >= PASS_THRESHOLD;
      const best = !prev || correct > prev.correct ? { correct, total, passed, at: new Date().toISOString() } : prev;
      return { quiz: { ...s.quiz, [courseId]: { ...best, passed: best.passed || passed } }, activeDays: touchDay(s) };
    });
  },
  logout() {
    set(empty());
  },
  /** Объединить прогресс с сервера с локальным: ничего пройденного не теряем */
  merge(remote: Partial<State> | null, patch: Partial<State> = {}) {
    set((s) => {
      if (!remote) return patch;
      const lessonsDone: State['lessonsDone'] = { ...(remote.lessonsDone ?? {}) };
      for (const [cid, ids] of Object.entries(s.lessonsDone)) {
        lessonsDone[cid] = [...new Set([...(lessonsDone[cid] ?? []), ...ids])];
      }
      const quiz: State['quiz'] = { ...(remote.quiz ?? {}) };
      for (const [cid, q] of Object.entries(s.quiz)) {
        const r = quiz[cid];
        quiz[cid] = !r || q.correct > r.correct ? { ...q, passed: q.passed || !!r?.passed } : { ...r, passed: r.passed || q.passed };
      }
      return {
        lessonsDone,
        quiz,
        activeDays: [...new Set([...(remote.activeDays ?? []), ...s.activeDays])].sort(),
        welcomed: s.welcomed || !!remote.welcomed,
        joinedAt: remote.joinedAt && remote.joinedAt < s.joinedAt ? remote.joinedAt : s.joinedAt,
        ...patch,
      };
    });
  },
};

/* ---------- Подсчёты ---------- */

export function lessonsDoneCount(s: State, c: Course) {
  const done = s.lessonsDone[c.id] ?? [];
  return c.lessons.filter((l) => done.includes(l.id)).length;
}

/** Уроки открываются по порядку: следующий — первый непройденный. */
export function nextLessonIndex(s: State, c: Course) {
  const done = s.lessonsDone[c.id] ?? [];
  const i = c.lessons.findIndex((l) => !done.includes(l.id));
  return i === -1 ? c.lessons.length : i;
}

/** Процент по курсу: каждый урок + тест считаются одинаковыми шагами. */
export function courseProgress(s: State, c: Course) {
  const steps = c.lessons.length + 1;
  const done = lessonsDoneCount(s, c) + (s.quiz[c.id]?.passed ? 1 : 0);
  return Math.round((done / steps) * 100);
}

export function overallProgress(s: State) {
  return Math.round(courses.reduce((sum, c) => sum + courseProgress(s, c), 0) / courses.length);
}

export const coursesCompleted = (s: State) => courses.filter((c) => courseProgress(s, c) === 100).length;
export const testsPassed = (s: State) => Object.values(s.quiz).filter((q) => q.passed).length;
export const lessonsTotalDone = (s: State) => courses.reduce((n, c) => n + lessonsDoneCount(s, c), 0);

/** Серия дней подряд (сегодня или вчера должен быть активным). */
export function streak(s: State) {
  const days = new Set(s.activeDays);
  const d = new Date();
  if (!days.has(d.toLocaleDateString('sv-SE'))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (days.has(d.toLocaleDateString('sv-SE'))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

/** Курс, который стоит продолжить: начатый и не законченный, иначе первый незаконченный. */
export function currentCourse(s: State) {
  return (
    courses.find((c) => {
      const p = courseProgress(s, c);
      return p > 0 && p < 100;
    }) ??
    courses.find((c) => courseProgress(s, c) < 100) ??
    courses[0]
  );
}

export type Achievement = { id: string; title: string; hint: string; tone: string; got: boolean };

export function achievements(s: State): Achievement[] {
  const perfect = Object.values(s.quiz).some((q) => q.correct === q.total);
  const sanitary = findCourse('sanitary');
  const mandatory = courses.filter((c) => c.category === 'Обязательно');
  return [
    { id: 'first', title: 'Первый урок', hint: 'Пройти любой урок', tone: '#EFE7DC', got: lessonsTotalDone(s) > 0 },
    { id: 'test', title: 'Первый тест', hint: 'Сдать любой тест', tone: '#E8EEE9', got: testsPassed(s) > 0 },
    { id: 'perfect', title: 'Без ошибок', hint: 'Тест на 100%', tone: '#F1E4E4', got: perfect },
    { id: 'steril', title: 'Стерильность 100%', hint: 'Санитарные нормы без ошибок', tone: '#E8EEE9', got: !!sanitary && s.quiz.sanitary?.correct === s.quiz.sanitary?.total && !!s.quiz.sanitary },
    { id: 'streak3', title: '3 дня подряд', hint: 'Заниматься 3 дня подряд', tone: '#EFE7DC', got: streak(s) >= 3 },
    { id: 'mandatory', title: 'Всё обязательное', hint: 'Пройти обязательные курсы', tone: '#E5E5EA', got: mandatory.every((c) => courseProgress(s, c) === 100) },
    { id: 'all', title: 'Мастер студии', hint: 'Пройти все курсы', tone: '#1A1A1F', got: courses.every((c) => courseProgress(s, c) === 100) },
  ];
}

/** Краткая сводка для руководителя — сервер не знает структуру курсов */
export function summary(s: State) {
  const perCourse: Record<string, number> = {};
  let minutes = 0;
  for (const c of courses) {
    perCourse[c.id] = courseProgress(s, c);
    const done = s.lessonsDone[c.id] ?? [];
    minutes += c.lessons.filter((l) => done.includes(l.id)).reduce((a, l) => a + l.minutes, 0);
  }
  return {
    overall: overallProgress(s),
    courses: perCourse,
    tests: testsPassed(s),
    lessons: lessonsTotalDone(s),
    minutes,
    streak: streak(s),
  };
}
export type Summary = ReturnType<typeof summary>;

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}

export const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name;
