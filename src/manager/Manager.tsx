import { useState, type ReactNode } from 'react';
import { L } from '../lib/i18n';
import { motion } from 'motion/react';
import { CheckCircle2, Circle, Clock, Pencil, Search, Send, TrendingUp, UserMinus, UserPlus, Users } from 'lucide-react';
import { brand } from '../content/brand';
import { courses } from '../content/courses';
import { useNav } from '../lib/nav';
import { actions, initials } from '../lib/store';
import { removeMember, saveRole, unblockMember } from '../lib/sync';
import { ask, inTelegram, shareLink, tell } from '../lib/telegram';
import { Avatar, BackButton, PrimaryButton, ProgressBar, plural, stagger } from '../components/ui';
import { NO_ROLE, empProgress, empStatus, useTeam, type Employee } from './team';

function ago(iso?: string) {
  if (!iso) return '';
  const d = Math.floor((Date.now() - Date.parse(iso)) / 86400000);
  if (d <= 0) return L('сегодня', 'today');
  if (d === 1) return L('вчера', 'yesterday');
  return `${d} ${plural(d, 'день', 'дня', 'дней', 'day', 'days')} ${L('назад', 'ago')}`;
}

const fmtMinutes = (m: number) => (m < 60 ? `${m} ${L('мин', 'min')}` : `${Math.round(m / 6) / 10} ${L('ч', 'h')}`);

/** Заголовок вкладки кабинета */
function AdminHeader({ title }: { title: string }) {
  const { live } = useTeam();
  return (
    <div className="pt-safe">
      <div className="flex items-start justify-between gap-3 pt-6">
        <div>
          <p style={{ fontSize: 12, color: 'var(--muted)' }}>{L('Кабинет руководителя', 'Manager')} · {brand.name}</p>
          <h2 className="font-display" style={{ fontSize: 28, marginTop: 2 }}>{title}</h2>
        </div>
        {!live && !inTelegram && (
          <button onClick={() => actions.setDemoAdmin(false)} className="shrink-0 whitespace-nowrap rounded-full border border-black/10 bg-white px-3 py-2" style={{ fontSize: 12 }}>
            {L('Выйти из демо', 'Exit demo')}
          </button>
        )}
      </div>
    </div>
  );
}

function DemoNote() {
  const { live } = useTeam();
  if (live) return null;
  return (
    <div className="mt-6 rounded-2xl border border-black/5 p-4" style={{ background: 'var(--cream)' }}>
      <div className="eyebrow" style={{ color: 'var(--gold)' }}>{L('Демо-данные', 'Demo data')}</div>
      <p className="mt-2" style={{ fontSize: 13, color: '#3a3a3a', lineHeight: 1.5 }}>
        {L('Это пример. Настоящая команда видна, когда руководитель открывает приложение через Telegram-бота.', 'This is sample data. The real team appears when a manager opens the app from the Telegram bot.')}
      </p>
    </div>
  );
}

/** Карточка «пригласить сотрудницу» — отправляет ссылку на бота */
function InviteCard({ compact }: { compact?: boolean }) {
  const { bot } = useTeam();
  const url = bot ? `https://t.me/${bot}` : null;
  return (
    <div className="rounded-3xl border border-black/5 p-5" style={{ background: 'var(--cream)' }}>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white"><UserPlus size={18} /></div>
        <div className="min-w-0">
          <div style={{ fontWeight: 500 }}>{L('Пригласить сотрудницу', 'Invite a team member')}</div>
          {!compact && (
            <p className="mt-1" style={{ fontSize: 13, color: 'var(--muted-2)', lineHeight: 1.5 }}>
              {L('Отправьте ей ссылку на бота. Как только она нажмёт «Старт», появится в списке.', 'Send them the bot link. They appear here as soon as they tap Start.')}
            </p>
          )}
          {url && <div className="mt-1 truncate" style={{ fontSize: 13, color: 'var(--muted)' }}>{url.replace('https://', '')}</div>}
        </div>
      </div>
      {url && (
        <button
          onClick={() => shareLink(url, L('Привет! Это обучение для мастеров нашей студии — нажми «Старт» 👇', 'Hi! This is the training for our studio team — tap Start 👇'))}
          className="press mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-black px-4 py-3.5 text-white"
          style={{ fontWeight: 500, fontSize: 14 }}
        >
          <Send size={15} /> {L('Отправить ссылку', 'Send link')}
        </button>
      )}
    </div>
  );
}

function Loading({ error }: { error: string | null }) {
  return (
    <p className="mt-10 text-center" style={{ color: error ? '#9a4848' : 'var(--muted)', fontSize: 14 }}>
      {error ?? L('Загружаем команду…', 'Loading team…')}
    </p>
  );
}

function EmployeeRow({ e, i }: { e: Employee; i: number }) {
  const nav = useNav();
  const p = empProgress(e);
  const st = empStatus(e);
  return (
    <motion.button
      {...stagger(i)}
      onClick={() => nav.push({ name: 'employee', employeeId: e.id })}
      className="press flex w-full items-center gap-3 rounded-2xl border border-black/5 bg-white p-3 text-left"
    >
      <Avatar text={initials(e.name)} bg={e.avatar} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span style={{ fontWeight: 500 }}>{e.name}</span>
          {st === 'new' && <span className="rounded-full bg-black/5 px-2 py-0.5" style={{ fontSize: 10 }}>{L('Новая', 'New')}</span>}
          {st === 'done' && <span className="rounded-full bg-black px-2 py-0.5 text-white" style={{ fontSize: 10 }}>{L('Завершила', 'Done')}</span>}
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{e.role}</div>
      </div>
      <div className="w-16 shrink-0 text-right">
        <div style={{ fontSize: 13, fontWeight: 500 }}>{p}%</div>
        <div className="mt-1"><ProgressBar value={p} /></div>
      </div>
    </motion.button>
  );
}

/* ---------- Вкладка «Команда» ---------- */

export function TeamTab() {
  const nav = useNav();
  const { team, error } = useTeam();
  const list = team ?? [];
  const avg = list.length ? Math.round(list.reduce((s, e) => s + empProgress(e), 0) / list.length) : 0;
  const attention = list.filter((e) => empProgress(e) < 50);

  return (
    <div className="min-h-dvh px-5 pb-36">
      <AdminHeader title={L('Команда', 'Team')} />

      <motion.div {...stagger(0)} className="mt-5 rounded-3xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #1A1A1F 0%, #2E2E36 100%)' }}>
        <div className="flex items-center gap-2" style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
          <TrendingUp size={14} /> {L('Средний прогресс команды', 'Average team progress')}
        </div>
        <div className="mt-3 flex items-end gap-3">
          <span className="font-display" style={{ fontSize: 56, lineHeight: 1 }}>{avg}</span>
          <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>%</span>
        </div>
        <div className="mt-5"><ProgressBar value={avg} dark height={6} /></div>
        <div className="mt-5 grid grid-cols-3 gap-4" style={{ fontSize: 12 }}>
          {[
            [L('Сотрудниц', 'Members'), list.length],
            [L('Завершили', 'Completed'), list.filter((e) => empStatus(e) === 'done').length],
            [L('Новых', 'New'), list.filter((e) => empStatus(e) === 'new').length],
          ].map(([l, v]) => (
            <div key={l}>
              <div style={{ color: 'rgba(255,255,255,0.5)' }}>{l}</div>
              <div style={{ fontWeight: 500, marginTop: 2 }}>{v}</div>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <motion.button {...stagger(1)} onClick={() => nav.toTab('staff')} className="press flex flex-col items-start gap-3 rounded-2xl border border-black/5 bg-white p-4 text-left">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/5"><Users size={18} /></div>
          <div>
            <div style={{ fontWeight: 500 }}>{L('Сотрудники', 'Staff')}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{list.length} {plural(list.length, 'человек', 'человека', 'человек', 'person', 'people')}</div>
          </div>
        </motion.button>
        <motion.button {...stagger(2)} onClick={() => nav.toTab('texts')} className="press flex flex-col items-start gap-3 rounded-2xl border border-black/5 bg-white p-4 text-left">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white"><Pencil size={17} /></div>
          <div>
            <div style={{ fontWeight: 500 }}>{L('Тексты', 'Content')}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{courses.length} {plural(courses.length, 'курс', 'курса', 'курсов', 'course', 'courses')} · {L('редактор', 'editor')}</div>
          </div>
        </motion.button>
      </div>

      {!team ? (
        <Loading error={error} />
      ) : list.length === 0 ? (
        <motion.div {...stagger(3)} className="mt-5"><InviteCard /></motion.div>
      ) : (
        attention.length > 0 && (
          <>
            <div className="mt-7 flex items-center justify-between">
              <h3 style={{ fontWeight: 500, fontSize: 18 }}>{L('Требуют внимания', 'Needs attention')}</h3>
              <button onClick={() => nav.toTab('staff')} style={{ fontSize: 13, color: 'var(--muted-2)' }}>{L('Все', 'All')}</button>
            </div>
            <div className="mt-3 space-y-2">
              {attention.map((e, i) => <EmployeeRow key={e.id} e={e} i={3 + i} />)}
            </div>
          </>
        )
      )}
      <DemoNote />
    </div>
  );
}

/* ---------- Вкладка «Сотрудники» ---------- */

export function StaffTab() {
  const [q, setQ] = useState('');
  const { team, blocked, error, live, reload } = useTeam();
  const list = (team ?? []).filter((e) => e.name.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <div className="min-h-dvh px-5 pb-36">
      <AdminHeader title={L('Сотрудники', 'Staff')} />
      {(team?.length ?? 0) > 3 && (
        <div className="mt-5 flex items-center gap-2 rounded-2xl border border-black/5 bg-white px-4 py-3">
          <Search size={16} className="text-black/40" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={L('Поиск по имени', 'Search by name')} className="w-full bg-transparent outline-none placeholder:text-black/35" style={{ fontSize: 16 }} />
        </div>
      )}

      {!team ? (
        <Loading error={error} />
      ) : (
        <div className="mt-4 space-y-2">
          {list.map((e, i) => <EmployeeRow key={e.id} e={e} i={i} />)}
          {team.length === 0 && <p className="py-6 text-center" style={{ fontSize: 14, color: 'var(--muted)' }}>{L('Пока никого нет', 'No one here yet')}</p>}
        </div>
      )}

      <div className="mt-5"><InviteCard compact={(team?.length ?? 0) > 0} /></div>

      {live && blocked.length > 0 && (
        <Section title={`${L('Удалённые', 'Removed')} · ${blocked.length}`}>
          {blocked.map((b) => (
            <div key={b.id} className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white p-3 opacity-80">
              <Avatar text={initials(b.name)} bg="#eee" size={40} />
              <div className="min-w-0 flex-1">
                <div className="truncate" style={{ fontWeight: 500 }}>{b.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{L('доступ закрыт', 'access closed')} {ago(b.at)}</div>
              </div>
              <button
                onClick={async () => {
                  if (!(await ask(L(`Вернуть доступ: ${b.name}? Она снова сможет открыть бота (прогресс начнётся заново).`, `Restore access for ${b.name}? They can open the bot again (progress starts over).`)))) return;
                  await unblockMember(b.id).then(reload).catch((e: Error) => tell(e.message));
                }}
                className="shrink-0 rounded-full border border-black/10 px-3 py-2"
                style={{ fontSize: 12 }}
              >
                {L('Вернуть', 'Restore')}
              </button>
            </div>
          ))}
        </Section>
      )}
      <DemoNote />
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-7">
      <div className="eyebrow">{title}</div>
      <div className="mt-3 space-y-2">{children}</div>
    </div>
  );
}

/* ---------- Карточка сотрудницы ---------- */

export function EmployeeScreen({ employeeId }: { employeeId: string }) {
  const nav = useNav();
  const { team, live, reload } = useTeam();
  const [editing, setEditing] = useState(false);
  const [role, setRole] = useState('');
  const e = team?.find((x) => x.id === employeeId);
  if (!e)
    return (
      <div className="min-h-dvh px-5 pt-safe">
        <div className="pt-5"><BackButton onClick={nav.back} /></div>
        <p className="mt-10 text-center" style={{ color: 'var(--muted)' }}>{L('Сотрудница не найдена', 'Member not found')}</p>
      </div>
    );
  const p = empProgress(e);
  const started = courses.filter((c) => (e.courses[c.id] ?? 0) > 0).length;

  return (
    <div className="min-h-dvh px-5 pb-16">
      <div className="pt-safe">
        <div className="flex items-center gap-3 pt-5">
          <BackButton onClick={nav.back} />
          <h2 className="font-display" style={{ fontSize: 22 }}>{L('Карточка сотрудницы', 'Team member')}</h2>
        </div>
      </div>

      <motion.div {...stagger(0)} className="mt-5 rounded-3xl border border-black/5 bg-white p-5">
        <div className="flex items-center gap-4">
          <Avatar text={initials(e.name)} bg={e.avatar} size={64} />
          <div className="min-w-0">
            <div style={{ fontWeight: 500, fontSize: 18 }}>{e.name}</div>
            <button
              disabled={!live}
              onClick={() => {
                setRole(e.role.startsWith('@') || e.role === NO_ROLE ? '' : e.role);
                setEditing(true);
              }}
              className="flex items-center gap-1.5 text-left"
              style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}
            >
              {e.role} {live && <Pencil size={11} />}
            </button>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
              {L('В студии с', 'Joined')} {e.since}
              {e.lastActive && ` · ${L('заходила', 'last seen')} ${ago(e.lastActive)}`}
            </div>
          </div>
        </div>
        <div className="mt-5 border-t border-black/5 pt-5">
          <div className="flex items-center justify-between" style={{ fontSize: 13 }}>
            <span style={{ color: 'var(--muted-2)' }}>{L('Общий прогресс', 'Overall progress')}</span>
            <span style={{ fontWeight: 500 }}>{p}%</span>
          </div>
          <div className="mt-3"><ProgressBar value={p} height={8} /></div>
        </div>
      </motion.div>

      {editing && (
        <div className="mt-4 space-y-3 rounded-3xl border border-black/10 bg-white p-4">
          <div style={{ fontSize: 13, color: 'var(--muted-2)' }}>{L('Должность', 'Role')}</div>
          <input
            autoFocus
            value={role}
            onChange={(ev) => setRole(ev.target.value)}
            placeholder={L('Например, бровист', 'e.g. Brow artist')}
            className="w-full rounded-2xl border border-black/10 px-4 py-3 outline-none focus:border-black"
            style={{ fontSize: 16 }}
          />
          <PrimaryButton
            center
            onClick={() =>
              saveRole(Number(e.id), role.trim())
                .then(reload)
                .then(() => setEditing(false))
                .catch(() => tell(L('Не удалось сохранить, попробуйте ещё раз', 'Could not save, please try again')))
            }
          >
            {L('Сохранить', 'Save')}
          </PrimaryButton>
        </div>
      )}

      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          [started, plural(started, 'курс', 'курса', 'курсов', 'course', 'courses')],
          [e.tests, plural(e.tests, 'тест', 'теста', 'тестов', 'quiz', 'quizzes')],
          [fmtMinutes(e.minutes), L('в обучении', 'learning')],
        ].map(([v, l], i) => (
          <motion.div {...stagger(1 + i)} key={String(l)} className="rounded-2xl border border-black/5 bg-white p-3">
            <div className="font-display" style={{ fontSize: 22 }}>{v}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{l}</div>
          </motion.div>
        ))}
      </div>

      <h3 className="mt-7" style={{ fontWeight: 500, fontSize: 18 }}>{L('Курсы сотрудницы', 'Courses')}</h3>
      <div className="mt-3 space-y-2">
        {courses.map((c, i) => {
          const cp = e.courses[c.id] ?? 0;
          return (
            <motion.div {...stagger(4 + i)} key={c.id} className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white p-3">
              <div className="h-11 w-11 shrink-0 rounded-xl" style={{ background: c.cover }} />
              <div className="min-w-0 flex-1">
                <div className="truncate" style={{ fontWeight: 500, fontSize: 14 }}>{c.title}</div>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex-1"><ProgressBar value={cp} /></div>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>{cp}%</span>
                </div>
              </div>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: cp === 100 ? '#1a1a1a' : cp > 0 ? 'var(--cream)' : '#f5f5f5' }}>
                {cp === 100 ? <CheckCircle2 size={15} className="text-white" /> : cp > 0 ? <Clock size={13} /> : <Circle size={13} className="text-black/30" />}
              </div>
            </motion.div>
          );
        })}
      </div>

      {live && (
        <button
          onClick={async () => {
            if (!(await ask(L(`Удалить ${e.name} из бота? Её прогресс сотрётся, а войти снова она не сможет, пока вы не вернёте доступ.`, `Remove ${e.name} from the bot? Their progress will be erased and they can't sign in again until you restore access.`)))) return;
            try {
              await removeMember(Number(e.id));
              await reload();
              nav.back();
            } catch (err) {
              await tell((err as Error).message);
            }
          }}
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-white p-4"
          style={{ color: '#9a4848', fontWeight: 500 }}
        >
          <UserMinus size={16} /> {L('Удалить из бота', 'Remove from bot')}
        </button>
      )}
      <DemoNote />
    </div>
  );
}
