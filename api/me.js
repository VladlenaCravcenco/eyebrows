// GET /api/me — кто я, мой сохранённый прогресс и роль
import { isBlocked, upsertUser } from './_lib/db.js';
import { auth, blockedResponse, json, unauthorized } from './_lib/telegram.js';

export async function GET(request) {
  const me = auth(request);
  if (!me) return unauthorized();
  if (!me.isManager && (await isBlocked(me.id))) return blockedResponse();
  const u = await upsertUser(me);
  return json({
    user: { id: u.telegram_id, name: u.name, username: u.username, role: u.role, joinedAt: u.joined_at },
    state: u.state,
    isManager: me.isManager,
  });
}
