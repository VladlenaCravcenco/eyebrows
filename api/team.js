// GET /api/team — вся команда (только руководитель)
import { allUsers, blockedUsers } from './_lib/db.js';
import { MANAGER_IDS, auth, getBotUsername, json, unauthorized } from './_lib/telegram.js';

export async function GET(request) {
  const me = auth(request);
  if (!me) return unauthorized();
  if (!me.isManager) return json({ error: 'Только для руководителя' }, 403);
  const team = (await allUsers())
    .filter((u) => !MANAGER_IDS.has(u.telegram_id))
    .map((u) => ({
      id: u.telegram_id,
      name: u.name,
      username: u.username,
      role: u.role,
      joinedAt: u.joined_at,
      lastActive: u.last_active,
      summary: u.summary,
    }));
  const bot = await getBotUsername().catch(() => null);
  return json({ team, blocked: await blockedUsers(), bot });
}
