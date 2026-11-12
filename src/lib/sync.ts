import { useSyncExternalStore } from 'react';
import { actions, getState, subscribe, summary, type State, type Summary } from './store';
import { initData, inTelegram } from './telegram';

/**
 * Синхронизация прогресса с сервером. Работает только внутри Telegram:
 * сервер узнаёт сотрудницу по подписи Telegram, пароль не нужен.
 */
const headers = () => ({ 'content-type': 'application/json', 'x-init-data': initData });

let timer: ReturnType<typeof setTimeout> | undefined;

/** Готов ли первый ответ сервера (до него не знаем, руководитель ли это) */
let ready = !inTelegram;
const readyListeners = new Set<() => void>();
function markReady() {
  ready = true;
  readyListeners.forEach((l) => l());
}
export function useSyncReady() {
  return useSyncExternalStore(
    (cb) => {
      readyListeners.add(cb);
      return () => readyListeners.delete(cb);
    },
    () => ready,
  );
}
let lastSent = '';

async function push() {
  const s = getState();
  if (s.blocked) return;
  const { isManager: _m, blocked: _b, demoAdmin: _d, ...state } = s;
  const body = JSON.stringify({ state, summary: summary(s) });
  if (body === lastSent) return;
  try {
    const r = await fetch('/api/progress', { method: 'PUT', headers: headers(), body, keepalive: true });
    if (r.ok) lastSent = body;
  } catch {
    /* нет сети — отправим при следующем изменении */
  }
}

export async function startSync() {
  if (!inTelegram) return;
  // если сервер долго не отвечает — не держим людей на заставке
  const fallback = setTimeout(markReady, 5000);
  try {
    const r = await fetch('/api/me', { headers: headers() });
    if (r.status === 403 && (await r.json().catch(() => ({}))).blocked) {
      actions.setBlocked();
      return;
    }
    if (!r.ok) throw new Error(String(r.status));
    const data: { user: { id: number; name: string; role: string | null }; state: Partial<State> | null; isManager: boolean } =
      await r.json();
    const local = getState().user;
    actions.merge(data.state, {
      isManager: data.isManager,
      user: { ...local, name: data.user.name, telegramId: data.user.id, role: data.user.role },
      blocked: false,
    });
  } catch (e) {
    console.warn('Сервер недоступен, прогресс пока сохраняется только на телефоне', e);
    return;
  } finally {
    clearTimeout(fallback);
    markReady();
  }
  void push();
  subscribe(() => {
    clearTimeout(timer);
    timer = setTimeout(push, 800);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') void push();
  });
}

/* ---------- Для руководителя ---------- */

export type Member = {
  id: number;
  name: string;
  username?: string;
  role: string | null;
  joinedAt: string;
  lastActive: string;
  summary: Summary | null;
};

export type Blocked = { id: number; name: string; username: string | null; at: string };

export async function fetchTeam(): Promise<{ team: Member[]; blocked: Blocked[]; bot: string | null }> {
  const r = await fetch('/api/team', { headers: headers() });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? 'Ошибка сервера');
  return r.json();
}

export async function removeMember(id: number) {
  const r = await fetch(`/api/member?id=${id}`, { method: 'DELETE', headers: headers() });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? 'Не удалось удалить');
}

export async function unblockMember(id: number) {
  const r = await fetch('/api/member', { method: 'POST', headers: headers(), body: JSON.stringify({ id, action: 'unblock' }) });
  if (!r.ok) throw new Error('Не удалось вернуть доступ');
}

export async function saveRole(id: number, role: string) {
  const r = await fetch('/api/role', { method: 'PUT', headers: headers(), body: JSON.stringify({ id, role }) });
  if (!r.ok) throw new Error('Не удалось сохранить');
}
