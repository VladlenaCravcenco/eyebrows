import { useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, BookOpen, CheckCircle2, Circle, Clock, Pencil, Search, TrendingUp, Users } from 'lucide-react';
import { brand } from '../content/brand';
import { courses } from '../content/courses';
import { useNav } from '../lib/nav';
import { initials } from '../lib/store';
import { saveRole } from '../lib/sync';
import { Avatar, BackButton, PrimaryButton, ProgressBar, plural, stagger } from '../components/ui';
import { empProgress, empStatus, useTeam, type Employee } from './team';


function ago(iso?: string) {
  if (!iso) return '';
  const d = Math.floor((Date.now() - Date.parse(iso)) / 86400000);
  if (d <= 0) return 'сегодня';
  if (d === 1) return 'вчера';
  return `${d} ${plural(d, 'день', 'дня', 'дней')} назад`;
}

const fmtMinutes = (m: number) => (m < 60 ? `${m} мин` : `${Math.round(m / 6) / 10} ч`);

/** Обёртка: загрузка / ошибка / пусто */
function TeamState({ team, error, children }: { team: Employee[] | null; error: string | null; children: (t: Employee[]) => ReactNode }) {
  if (error && !team)
    return <p className="mt-10 text-center" style={{ color: '#9a4848', fontSize: 14 }}>{error}</p>;
  if (!team) return <p className="mt-10 text-center" style={{ color: 'var(--muted)', fontSize: 14 }}>Загружаем команду…</p>;
  if (team.length === 0)
    return (
      <div className="mt-6 rounded-3xl border border-black/5 p-6 text-center" style={{ background: 'var(--cream)' }}>
        <Users className="mx-auto" size={24} />
        <p className="mt-3" style={{ fontWeight: 500 }}>Пока никого нет</p>
        <p className="mt-1" style={{ fontSize: 13, color: 'var(--muted-2)', lineHeight: 1.5 }}>
          Отправьте девочкам ссылку на бота — как только они нажмут «Старт», появятся здесь.
        </p>
      </div>
    );
  return <>{children(team)}</>;
}

function DemoNote() {
  const { live } = useTeam();
  if (live) return null;
  return (
    <div className="mt-6 rounded-2xl border border-black/5 p-4" style={{ background: 'var(--cream)' }}>
      <div className="eyebrow" style={{ color: 'var(--gold)' }}>Демо-данные</div>
      <p className="mt-2" style={{ fontSize: 13, color: '#3a3a3a', lineHeight: 1.5 }}>
        Это пример. Настоящая команда видна, когда руководитель открывает приложение через Telegram-бота.
      </p>
    </div>
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
          {st === 'new' && <span className="rounded-full bg-black/5 px-2 py-0.5" style={{ fontSize: 10 }}>Новая</span>}
          {st === 'done' && <span className="rounded-full bg-black px-2 py-0.5 text-white" style={{ fontSize: 10 }}>Завершила</span>}
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

export function ManagerScreen() {
  const nav = useNav();
  const { team, error } = useTeam();
  const list = team ?? [];
  const avg = list.length ? Math.round(list.reduce((s, e) => s + empProgress(e), 0) / list.length) : 0;
  const attention = list.filter((e) => empProgress(e) < 50);

  return (
    <div className="min-h-dvh px-5 pb-16">
      <div className="pt-safe">
        <div className="flex items-start justify-between gap-3 pt-6">
          <div>
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>Студия {brand.name}</p>
            <h2 className="font-display" style={{ fontSize: 28, marginTop: 2 }}>Команда</h2>
          </div>
          <button onClick={nav.back} className="press flex h-11 items-center gap-2 rounded-full border border-black/10 bg-white px-4" style={{ fontSize: 13 }}>
            Режим мастера <ArrowUpRight size={14} />
          </button>
        </div>
      </div>

      <TeamState team={team} error={error}>{() => (<>
      <motion.div {...stagger(0)} className="mt-5 rounded-3xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #1A1A1F 0%, #2E2E36 100%)' }}>
        <div className="flex items-center gap-2" style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
          <TrendingUp size={14} /> Средний прогресс команды
        </div>
        <div className="mt-3 flex items-end gap-3">
          <span className="font-display" style={{ fontSize: 56, lineHeight: 1 }}>{avg}</span>
          <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>%</span>
        </div>
        <div className="mt-5"><ProgressBar value={avg} dark height={6} /></div>
        <div className="mt-5 grid grid-cols-3 gap-4" style={{ fontSize: 12 }}>
          {[
            ['Сотрудниц', list.length],
            ['Завершили', list.filter((e) => empStatus(e) === 'done').length],
            ['Новых', list.filter((e) => empStatus(e) === 'new').length],
          ].map(([l, v]) => (
            <div key={l}>
              <div style={{ color: 'rgba(255,255,255,0.5)' }}>{l}</div>
              <div style={{ fontWeight: 500, marginTop: 2 }}>{v}</div>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <motion.button {...stagger(1)} onClick={() => nav.push({ name: 'employees' })} className="press flex flex-col items-start gap-3 rounded-2xl border border-black/5 bg-white p-4 text-left">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/5"><Users size={18} /></div>
          <div>
            <div style={{ fontWeight: 500 }}>Сотрудники</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{list.length} {plural(list.length, 'человек', 'человека', 'человек')}</div>
          </div>
        </motion.button>
        <motion.div {...stagger(2)} className="flex flex-col items-start gap-3 rounded-2xl border border-black/5 bg-white p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/5"><BookOpen size={18} /></div>
          <div>
            <div style={{ fontWeight: 500 }}>Курсы</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{courses.length} {plural(courses.length, 'раздел', 'раздела', 'разделов')}</div>
          </div>
        </motion.div>
      </div>

      {attention.length > 0 && (
        <>
          <div className="mt-7 flex items-center justify-between">
            <h3 style={{ fontWeight: 500, fontSize: 18 }}>Требуют внимания</h3>
            <button onClick={() => nav.push({ name: 'employees' })} style={{ fontSize: 13, color: 'var(--muted-2)' }}>Все</button>
          </div>
          <div className="mt-3 space-y-2">
            {attention.map((e, i) => <EmployeeRow key={e.id} e={e} i={3 + i} />)}
          </div>
        </>
      )}
      </>)}</TeamState>
      <DemoNote />
    </div>
  );
}

export function EmployeesScreen() {
  const nav = useNav();
  const [q, setQ] = useState('');
  const { team, error } = useTeam();
  const list = (team ?? []).filter((e) => e.name.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <div className="min-h-dvh px-5 pb-16">
      <div className="pt-safe">
        <div className="flex items-center gap-3 pt-5">
          <BackButton onClick={nav.back} />
          <h2 className="font-display" style={{ fontSize: 26 }}>Сотрудники</h2>
        </div>
      </div>
      <div className="mt-5 flex items-center gap-2 rounded-2xl border border-black/5 bg-white px-4 py-3">
        <Search size={16} className="text-black/40" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск по имени" className="w-full bg-transparent outline-none placeholder:text-black/35" style={{ fontSize: 14 }} />
      </div>
      <TeamState team={team} error={error}>
        {() => (
          <div className="mt-4 space-y-2">
            {list.map((e, i) => <EmployeeRow key={e.id} e={e} i={i} />)}
          </div>
        )}
      </TeamState>
    </div>
  );
}

export function EmployeeScreen({ employeeId }: { employeeId: string }) {
  const nav = useNav();
  const { team, live, reload } = useTeam();
  const [editing, setEditing] = useState(false);
  const [role, setRole] = useState('');
  const e = team?.find((x) => x.id === employeeId);
  if (!e) return null;
  const p = empProgress(e);
  const started = courses.filter((c) => (e.courses[c.id] ?? 0) > 0).length;

  return (
    <div className="min-h-dvh px-5 pb-16">
      <div className="pt-safe">
        <div className="flex items-center gap-3 pt-5">
          <BackButton onClick={nav.back} />
          <h2 className="font-display" style={{ fontSize: 22 }}>Карточка сотрудницы</h2>
        </div>
      </div>

      <motion.div {...stagger(0)} className="mt-5 rounded-3xl border border-black/5 bg-white p-5">
        <div className="flex items-center gap-4">
          <Avatar text={initials(e.name)} bg={e.avatar} size={64} />
          <div>
            <div style={{ fontWeight: 500, fontSize: 18 }}>{e.name}</div>
            <button
              disabled={!live}
              onClick={() => {
                setRole(e.role.startsWith('@') || e.role === 'Должность не указана' ? '' : e.role);
                setEditing(true);
              }}
              className="flex items-center gap-1.5 text-left"
              style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}
            >
              {e.role} {live && <Pencil size={11} />}
            </button>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
              В студии с {e.since}
              {e.lastActive && ` · заходила ${ago(e.lastActive)}`}
            </div>
          </div>
        </div>
        <div className="mt-5 border-t border-black/5 pt-5">
          <div className="flex items-center justify-between" style={{ fontSize: 13 }}>
            <span style={{ color: 'var(--muted-2)' }}>Общий прогресс</span>
            <span style={{ fontWeight: 500 }}>{p}%</span>
          </div>
          <div className="mt-3"><ProgressBar value={p} height={8} /></div>
        </div>
      </motion.div>

      {editing && (
        <div className="mt-4 space-y-3 rounded-3xl border border-black/10 bg-white p-4">
          <div style={{ fontSize: 13, color: 'var(--muted-2)' }}>Должность</div>
          <input
            autoFocus
            value={role}
            onChange={(ev) => setRole(ev.target.value)}
            placeholder="Например, бровист"
            className="w-full rounded-2xl border border-black/10 px-4 py-3 outline-none focus:border-black"
          />
          <PrimaryButton
            center
            onClick={() =>
              saveRole(Number(e.id), role.trim())
                .then(reload)
                .then(() => setEditing(false))
                .catch(() => alert('Не удалось сохранить, попробуйте ещё раз'))
            }
          >
            Сохранить
          </PrimaryButton>
        </div>
      )}

      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          [started, plural(started, 'курс', 'курса', 'курсов')],
          [e.tests, plural(e.tests, 'тест', 'теста', 'тестов')],
          [fmtMinutes(e.minutes), 'в обучении'],
        ].map(([v, l], i) => (
          <motion.div {...stagger(1 + i)} key={String(l)} className="rounded-2xl border border-black/5 bg-white p-3">
            <div className="font-display" style={{ fontSize: 22 }}>{v}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{l}</div>
          </motion.div>
        ))}
      </div>

      <h3 className="mt-7" style={{ fontWeight: 500, fontSize: 18 }}>Курсы сотрудницы</h3>
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
      <DemoNote />
    </div>
  );
}
