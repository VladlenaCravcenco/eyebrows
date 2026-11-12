// POST /api/bot — сюда Telegram присылает сообщения боту (вебхук)
import { isBlocked, upsertUser } from './_lib/db.js';
import { MANAGER_IDS, bot, json, openButton, webAppUrl, webhookSecret } from './_lib/telegram.js';

export async function POST(request) {
  // принимаем только запросы от Telegram (секрет задаётся в /api/setup)
  if (request.headers.get('x-telegram-bot-api-secret-token') !== webhookSecret()) return json({ error: 'forbidden' }, 403);

  const update = await request.json();
  const msg = update.message;
  if (!msg?.from || msg.chat.type !== 'private') return json({ ok: true });
  const from = msg.from;
  const text = msg.text || '';

  try {
    if (text.startsWith('/myid')) {
      await bot('sendMessage', { chat_id: msg.chat.id, text: `Ваш Telegram ID: ${from.id}` });
      return json({ ok: true });
    }

    if (!MANAGER_IDS.has(from.id) && (await isBlocked(from.id))) {
      await bot('sendMessage', { chat_id: msg.chat.id, text: 'Доступ к обучению закрыт. Если это ошибка — напишите администратору студии.' });
      return json({ ok: true });
    }

    await upsertUser(
      { id: from.id, name: [from.first_name, from.last_name].filter(Boolean).join(' '), username: from.username },
      { chat_id: msg.chat.id },
    );

    await bot('sendMessage', {
      chat_id: msg.chat.id,
      text: MANAGER_IDS.has(from.id)
        ? `Здравствуйте, ${from.first_name}! Это ваш кабинет руководителя: команда, прогресс девочек и редактор текстов. Откройте его кнопкой ниже 👇`
        : `Привет, ${from.first_name}! 👋\n\nЗдесь короткие уроки и мини-тесты о том, как у нас всё устроено в студии. Проходите в своём темпе — прогресс сохраняется.\n\nЖмите кнопку ниже 👇`,
      reply_markup: openButton(webAppUrl(request)),
    });
  } catch (e) {
    console.error('[bot]', e);
  }
  // всегда 200, иначе Telegram будет повторять одно и то же сообщение
  return json({ ok: true });
}
