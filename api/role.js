// PUT /api/role — руководитель задаёт должность { id, role }
import { updateUser } from './_lib/db.js';
import { auth, json, unauthorized } from './_lib/telegram.js';

export async function PUT(request) {
  const me = auth(request);
  if (!me) return unauthorized();
  if (!me.isManager) return json({ error: 'Только для руководителя' }, 403);
  const { id, role } = await request.json();
  const u = await updateUser(Number(id), { role: String(role ?? '').trim().slice(0, 60) || null });
  return u ? json({ ok: true }) : json({ error: 'not found' }, 404);
}
