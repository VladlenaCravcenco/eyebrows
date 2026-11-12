// GET /api/cron — раз в день (см. vercel.json) напоминает тем, кто не заходил 2+ дня
import { allUsers, updateUser } from './_lib/db.js';
import { MANAGER_IDS, bot, json, openButton, webAppUrl } from './_lib/telegram.js';

const DAY = 24 * 3600 * 1000;

export async function GET(request) {
  // Vercel подписывает вызовы расписания CRON_SECRET; без него — запрещаем посторонним
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) return json({ error: 'forbidden' }, 403);

  const url = webAppUrl(request);
  let sent = 0;
  for (const u of await allUsers()) {
    if (!u.chat_id || MANAGER_IDS.has(u.telegram_id)) continue;
    const p = u.summary?.overall ?? 0;
    if (p >= 100) continue;
    if (Date.now() - Date.parse(u.last_active) < 2 * DAY) continue;
    if (u.last_reminded && Date.now() - Date.parse(u.last_reminded) < 20 * 3600 * 1000) continue;
    const name = u.name.split(' ')[0];
    try {
      await bot('sendMessage', {
        chat_id: u.chat_id,
        text:
          p === 0
            ? `${name}, обучение ждёт вас ✨ Первый урок занимает всего 4 минуты.`
            : `${name}, вы прошли ${p}% обучения — давайте продолжим? Пара минут в день, и всё готово ✨`,
        reply_markup: openButton(url, 'Продолжить'),
      });
      await updateUser(u.telegram_id, { last_reminded: new Date().toISOString() });
      sent++;
    } catch (e) {
      console.error('[cron]', u.telegram_id, e.message);
    }
  }
  return json({ ok: true, sent });
}
