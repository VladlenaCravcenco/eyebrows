// DELETE /api/member?id=123 — удалить сотрудницу из бота (данные стираются, вход закрывается)
// POST   /api/member  { id, action: 'unblock' } — вернуть доступ
import { blockUser, unblockUser } from './_lib/db.js';
import { MANAGER_IDS, auth, json, unauthorized } from './_lib/telegram.js';

async function managerOnly(request) {
  const me = auth(request);
  if (!me) return [null, unauthorized()];
  if (!me.isManager) return [null, json({ error: 'Только для руководителя' }, 403)];
  return [me, null];
}

export async function DELETE(request) {
  const [, err] = await managerOnly(request);
  if (err) return err;
  const id = Number(new URL(request.url).searchParams.get('id'));
  if (!id) return json({ error: 'нет id' }, 400);
  if (MANAGER_IDS.has(id)) return json({ error: 'Руководителя удалить нельзя' }, 400);
  await blockUser(id);
  return json({ ok: true });
}

export async function POST(request) {
  const [, err] = await managerOnly(request);
  if (err) return err;
  const { id, action } = await request.json();
  if (action !== 'unblock' || !Number(id)) return json({ error: 'bad request' }, 400);
  await unblockUser(Number(id));
  return json({ ok: true });
}
