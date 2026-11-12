import { useSyncExternalStore } from 'react';
import { setCourses, type Course } from './courses';
import { setKnowledge, type Doc } from './knowledge';
import { initData, inTelegram } from '../lib/telegram';

/**
 * Живой контент: курсы и база знаний приходят с сервера (их правит руководитель).
 * Последняя версия запоминается на телефоне, чтобы приложение открывалось мгновенно.
 * Если в базе ничего не сохранено — используются тексты из courses.ts / knowledge.ts.
 */
export type Content = { courses: Course[]; knowledgeBase: Doc[]; updatedAt?: string; updatedBy?: string };

const CACHE = 'eyebrows.content.v1';
let version = 0;
let meta: { updatedAt?: string; updatedBy?: string } = {};
const listeners = new Set<() => void>();

function apply(c: Content) {
  setCourses(c.courses);
  setKnowledge(c.knowledgeBase);
  meta = { updatedAt: c.updatedAt, updatedBy: c.updatedBy };
  version++;
  listeners.forEach((l) => l());
}

function cache(c: Content) {
  try {
    localStorage.setItem(CACHE, JSON.stringify(c));
  } catch {
    /* ignore */
  }
}

/** Перерисовать экран, когда контент обновился */
export function useContentVersion() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => version,
  );
}

export const contentMeta = () => meta;

export async function loadContent() {
  try {
    const raw = localStorage.getItem(CACHE);
    if (raw) apply(JSON.parse(raw));
  } catch {
    /* битый кэш — просто игнорируем */
  }
  if (!inTelegram) return;
  try {
    const r = await fetch('/api/content', { headers: { 'x-init-data': initData } });
    if (!r.ok) return;
    const { content } = (await r.json()) as { content: Content | null };
    if (content) {
      apply(content);
      cache(content);
    }
  } catch {
    /* нет сети — работаем с тем, что есть */
  }
}

/**
 * Сохранить новую версию для всех. Вне Telegram (демо) — только на этом устройстве.
 * Возвращает сохранённый контент или бросает ошибку с понятным текстом.
 */
export async function publishContent(next: Content): Promise<Content> {
  if (!inTelegram) {
    const c = { ...next, updatedAt: new Date().toISOString(), updatedBy: 'демо' };
    apply(c);
    cache(c);
    return c;
  }
  const r = await fetch('/api/content', {
    method: 'PUT',
    headers: { 'content-type': 'application/json', 'x-init-data': initData },
    body: JSON.stringify({ content: next }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error ?? 'Не удалось сохранить');
  apply(data.content);
  cache(data.content);
  return data.content;
}
