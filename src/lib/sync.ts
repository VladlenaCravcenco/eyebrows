import { actions, getState, subscribe, summary, type State, type Summary } from './store';
import { initData, inTelegram } from './telegram';

/**
 * Синхронизация прогресса с сервером. Работает только внутри Telegram:
 * сервер узнаёт сотрудницу по подписи Telegram, пароль не нужен.
 */
const headers = () => ({ 'content-type': 'application/json', 'x-init-data': initData });

let timer: ReturnType<typeof setTimeout> | undefined;
let lastSent = '';

async function push() {
  const s = getState();
  const { isManager: _m, ...state } = s;
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
  try {
    const r = await fetch('/api/me', { headers: headers() });
    if (!r.ok) throw new Error(String(r.status));
    const data: { user: { id: number; name: string; role: string | null }; state: Partial<State> | null; isManager: boolean } =
      await r.json();
    const local = getState().user;
    actions.merge(data.state, {
      isManager: data.isManager,
      user: { ...local, name: data.user.name, telegramId: data.user.id, role: data.user.role },
    });
  } catch (e) {
    console.warn('Сервер недоступен, прогресс пока сохраняется только на телефоне', e);
    return;
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

export async function fetchTeam(): Promise<Member[]> {
  const r = await fetch('/api/team', { headers: headers() });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? 'Ошибка сервера');
  return (await r.json()).team;
}

export async function saveRole(id: number, role: string) {
  const r = await fetch('/api/role', { method: 'PUT', headers: headers(), body: JSON.stringify({ id, role }) });
  if (!r.ok) throw new Error('Не удалось сохранить');
}
