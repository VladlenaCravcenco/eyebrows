// GET /api/content — актуальные курсы и база знаний (null → приложение берёт встроенные)
// PUT /api/content — сохранить из редактора (только руководитель)
import { getContent, saveContent } from './_lib/db.js';
import { cleanContent } from './_lib/content.js';
import { auth, json, unauthorized } from './_lib/telegram.js';

export async function GET(request) {
  if (!auth(request)) return unauthorized();
  return json({ content: await getContent() });
}

export async function PUT(request) {
  const me = auth(request);
  if (!me) return unauthorized();
  if (!me.isManager) return json({ error: 'Только для руководителя' }, 403);
  const text = await request.text();
  if (text.length > 900 * 1024) return json({ error: 'Слишком много текста' }, 413);
  let content;
  try {
    content = cleanContent(JSON.parse(text).content);
  } catch (e) {
    return json({ error: `Не получилось сохранить: ${e.message}` }, 400);
  }
  content.updatedAt = new Date().toISOString();
  content.updatedBy = me.name;
  await saveContent(content);
  return json({ ok: true, content });
}
