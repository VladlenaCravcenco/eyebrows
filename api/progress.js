// PUT /api/progress — сохранить прогресс { state, summary }
import { upsertUser } from './_lib/db.js';
import { auth, json, unauthorized } from './_lib/telegram.js';

export async function PUT(request) {
  const me = auth(request);
  if (!me) return unauthorized();
  const text = await request.text();
  if (text.length > 256 * 1024) return json({ error: 'too large' }, 413);
  const { state, summary } = JSON.parse(text || '{}');
  if (!state || typeof state !== 'object') return json({ error: 'bad state' }, 400);
  await upsertUser(me, { state, summary: summary ?? null });
  return json({ ok: true });
}
