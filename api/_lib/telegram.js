// Проверка подписи Telegram Mini App, клиент Bot API и общие настройки.
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export const BOT_TOKEN = process.env.BOT_TOKEN || '';
export const MANAGER_IDS = new Set(
  (process.env.MANAGER_IDS || '')
    .split(',')
    .map((s) => Number(s.trim()))
    .filter(Boolean),
);

/** Адрес приложения: основной домен проекта на Vercel (или WEBAPP_URL, если задан вручную) */
export function webAppUrl(request) {
  if (process.env.WEBAPP_URL) return process.env.WEBAPP_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return new URL(request.url).origin;
}

/** Секрет вебхука выводится из токена — отдельная переменная не нужна */
export const webhookSecret = () => createHash('sha256').update(`webhook:${BOT_TOKEN}`).digest('hex').slice(0, 48);

const MAX_AGE_SEC = 7 * 24 * 3600;

/**
 * Проверяет, что initData действительно выдал Telegram для нашего бота.
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function validateInitData(initData) {
  if (!initData || !BOT_TOKEN) return null;
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;
  params.delete('hash');
  const dataCheck = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
  const secret = createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
  const expected = createHmac('sha256', secret).update(dataCheck).digest();
  const given = Buffer.from(hash, 'hex');
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;

  const authDate = Number(params.get('auth_date'));
  if (!authDate || Date.now() / 1000 - authDate > MAX_AGE_SEC) return null;

  try {
    const u = JSON.parse(params.get('user') || 'null');
    if (!u?.id) return null;
    return { id: u.id, name: [u.first_name, u.last_name].filter(Boolean).join(' '), username: u.username };
  } catch {
    return null;
  }
}

/** Кто открыл приложение (по заголовку x-init-data) */
export function auth(request) {
  const tg = validateInitData(request.headers.get('x-init-data'));
  return tg ? { ...tg, isManager: MANAGER_IDS.has(tg.id) } : null;
}

export async function bot(method, body = {}) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(`${method}: ${json.description}`);
  return json.result;
}

export const openButton = (url, text = 'Открыть обучение') => ({ inline_keyboard: [[{ text, web_app: { url } }]] });

export const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

export const unauthorized = () => json({ error: 'Откройте приложение через Telegram-бота' }, 401);
export const blockedResponse = () => json({ error: 'Доступ закрыт. Обратитесь к администратору студии.', blocked: true }, 403);

/** Имя бота (для ссылки-приглашения) — запрашиваем один раз */
let botUsername = null;
export async function getBotUsername() {
  if (!botUsername) botUsername = (await bot('getMe')).username;
  return botUsername;
}
