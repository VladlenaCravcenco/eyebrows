// GET /api/setup — открыть один раз после деплоя: подключает бота к этому сайту.
// Повторный вызов безопасен — просто ставит те же настройки.
import { BOT_TOKEN, bot, json, webAppUrl, webhookSecret } from './_lib/telegram.js';

export async function GET(request) {
  if (!BOT_TOKEN) return json({ ok: false, error: 'Не задан BOT_TOKEN в настройках Vercel' }, 500);
  const url = webAppUrl(request);
  try {
    await bot('setWebhook', {
      url: `${url}/api/bot`,
      secret_token: webhookSecret(),
      allowed_updates: ['message'],
      drop_pending_updates: true,
    });
    await bot('setChatMenuButton', { menu_button: { type: 'web_app', text: 'Обучение', web_app: { url } } });
    await bot('setMyCommands', {
      commands: [
        { command: 'start', description: 'Открыть обучение' },
        { command: 'myid', description: 'Мой Telegram ID' },
      ],
    });
    const me = await bot('getMe');
    return json({ ok: true, bot: `https://t.me/${me.username}`, app: url, message: 'Бот подключён ✅' });
  } catch (e) {
    return json({ ok: false, error: String(e.message || e) }, 500);
  }
}
