// Хранилище — Upstash Redis (бесплатно, подключается в Vercel → Storage).
// Работает через обычный HTTP, без библиотек.
//
// Ключи:
//   user:<telegramId>  → JSON с данными сотрудницы и её прогрессом
//   users              → множество всех telegramId

// Vercel добавляет к именам переменных выбранный префикс (KV_, STORAGE_ …),
// поэтому ищем по окончанию имени.
const findEnv = (suffix) =>
  process.env[`KV_${suffix}`] ||
  process.env[`UPSTASH_REDIS_${suffix}`] ||
  Object.entries(process.env).find(([k, v]) => v && k.endsWith(suffix) && !k.includes('READ_ONLY'))?.[1];

const URL_ = findEnv('REST_API_URL') || findEnv('REDIS_REST_URL');
const TOKEN = findEnv('REST_API_TOKEN') || findEnv('REDIS_REST_TOKEN');

async function redis(...commands) {
  if (!URL_ || !TOKEN) throw new Error('База не подключена: добавьте Upstash Redis в Vercel → Storage');
  const res = await fetch(`${URL_}/pipeline`, {
    method: 'POST',
    headers: { authorization: `Bearer ${TOKEN}`, 'content-type': 'application/json' },
    body: JSON.stringify(commands),
  });
  if (!res.ok) throw new Error(`Redis ${res.status}`);
  const out = await res.json();
  return out.map((r) => {
    if (r.error) throw new Error(r.error);
    return r.result;
  });
}

const key = (id) => `user:${id}`;
const now = () => new Date().toISOString();

export async function getUser(id) {
  const [raw] = await redis(['GET', key(id)]);
  return raw ? JSON.parse(raw) : null;
}

async function putUser(u) {
  await redis(['SET', key(u.telegram_id), JSON.stringify(u)], ['SADD', 'users', String(u.telegram_id)]);
  return u;
}

/** Создать или обновить сотрудницу по данным из Telegram */
export async function upsertUser({ id, name, username }, extra = {}) {
  const prev = await getUser(id);
  return putUser({
    telegram_id: id,
    role: null,
    joined_at: now(),
    state: null,
    summary: null,
    chat_id: null,
    last_reminded: null,
    ...prev,
    name,
    username: username ?? null,
    last_active: now(),
    ...extra,
  });
}

export async function updateUser(id, patch) {
  const prev = await getUser(id);
  if (!prev) return null;
  return putUser({ ...prev, ...patch });
}

export async function allUsers() {
  const [ids] = await redis(['SMEMBERS', 'users']);
  if (!ids?.length) return [];
  const [raws] = await redis(['MGET', ...ids.map(key)]);
  return raws
    .filter(Boolean)
    .map((r) => JSON.parse(r))
    .sort((a, b) => a.joined_at.localeCompare(b.joined_at));
}
