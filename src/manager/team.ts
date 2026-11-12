import { useEffect, useState } from 'react';
import { L, en, locale } from '../lib/i18n';
import { courses } from '../content/courses';
import { fetchTeam, type Blocked, type Member } from '../lib/sync';
import { useStore } from '../lib/store';
import { inTelegram } from '../lib/telegram';

/** Сотрудница в том виде, в каком её показывает режим руководителя */
export type Employee = {
  id: string;
  name: string;
  role: string;
  since: string;
  avatar: string;
  /** courseId -> % прохождения */
  courses: Record<string, number>;
  tests: number;
  minutes: number;
  lastActive?: string;
  isNew: boolean;
};

const palette = ['#E8DCC8', '#DCC8C8', '#C8D5CA', '#D0CFE3', '#E3DCD0', '#D5DCE3'];
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });

function fromMember(m: Member): Employee {
  const s = m.summary;
  return {
    id: String(m.id),
    name: m.name,
    role: m.role || (m.username ? `@${m.username}` : NO_ROLE),
    since: fmtDate(m.joinedAt),
    avatar: palette[m.id % palette.length]!,
    courses: Object.fromEntries(courses.map((c) => [c.id, s?.courses[c.id] ?? 0])),
    tests: s?.tests ?? 0,
    minutes: s?.minutes ?? 0,
    lastActive: m.lastActive,
    isNew: Date.now() - Date.parse(m.joinedAt) < 7 * 24 * 3600 * 1000,
  };
}

/** ДЕМО-команда: показывается вне Telegram, чтобы было видно, как выглядит режим руководителя */
export const NO_ROLE = L('Должность не указана', 'No role set');

const demoEn: Employee[] = [
  { id: 'e1', name: 'Emma Carter', role: 'Nail technician', since: 'March 12, 2026', avatar: '#E8DCC8', courses: { onboarding: 100, sanitary: 83, clients: 60, safety: 50, rules: 0 }, tests: 3, minutes: 600, isNew: false },
  { id: 'e2', name: 'Sofia Martinez', role: 'Brow artist', since: 'February 4, 2026', avatar: '#DCC8C8', courses: { onboarding: 100, sanitary: 100, clients: 100, safety: 100, rules: 100 }, tests: 5, minutes: 840, isNew: false },
  { id: 'e3', name: 'Mia Johnson', role: 'Lash artist', since: 'May 18, 2026', avatar: '#C8D5CA', courses: { onboarding: 100, sanitary: 40, clients: 20, safety: 0, rules: 0 }, tests: 1, minutes: 240, isNew: false },
  { id: 'e4', name: 'Chloe Brown', role: 'Cosmetologist', since: 'June 20, 2026', avatar: '#D0CFE3', courses: { onboarding: 60, sanitary: 0, clients: 0, safety: 0, rules: 0 }, tests: 0, minutes: 60, isNew: true },
  { id: 'e5', name: 'Ava Wilson', role: 'Hairstylist', since: 'April 7, 2026', avatar: '#E3DCD0', courses: { onboarding: 100, sanitary: 100, clients: 60, safety: 33, rules: 25 }, tests: 2, minutes: 420, isNew: false },
];

const demoRu: Employee[] = [
  { id: 'e1', name: 'Анна Соколова', role: 'Мастер маникюра', since: '12 марта 2026', avatar: '#E8DCC8', courses: { onboarding: 100, sanitary: 83, clients: 60, safety: 50, rules: 0 }, tests: 3, minutes: 600, isNew: false },
  { id: 'e2', name: 'Мария Орлова', role: 'Бровист', since: '4 февраля 2026', avatar: '#DCC8C8', courses: { onboarding: 100, sanitary: 100, clients: 100, safety: 100, rules: 100 }, tests: 5, minutes: 840, isNew: false },
  { id: 'e3', name: 'Дарья Лебедева', role: 'Мастер маникюра', since: '18 мая 2026', avatar: '#C8D5CA', courses: { onboarding: 100, sanitary: 40, clients: 20, safety: 0, rules: 0 }, tests: 1, minutes: 240, isNew: false },
  { id: 'e4', name: 'Елена Громова', role: 'Косметолог', since: '20 июня 2026', avatar: '#D0CFE3', courses: { onboarding: 60, sanitary: 0, clients: 0, safety: 0, rules: 0 }, tests: 0, minutes: 60, isNew: true },
  { id: 'e5', name: 'София Белова', role: 'Стилист', since: '7 апреля 2026', avatar: '#E3DCD0', courses: { onboarding: 100, sanitary: 100, clients: 60, safety: 33, rules: 25 }, tests: 2, minutes: 420, isNew: false },
];

export const empProgress = (e: Employee) => {
  const v = Object.values(e.courses);
  return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : 0;
};

export const empStatus = (e: Employee): 'done' | 'new' | 'active' => {
  if (empProgress(e) === 100) return 'done';
  return e.isNew ? 'new' : 'active';
};

type TeamData = { team: Employee[]; blocked: Blocked[]; bot: string | null };

// общий кэш для всех экранов кабинета, чтобы при переходах не мигала загрузка
let cache: TeamData | null = null;
const subs = new Set<(d: TeamData) => void>();

const demoData: TeamData = { team: en ? demoEn : demoRu, blocked: [], bot: null };

export function useTeam() {
  const s = useStore();
  const live = inTelegram && !!s.isManager;
  const [data, setData] = useState<TeamData | null>(live ? cache : demoData);
  const [error, setError] = useState<string | null>(null);

  const reload = () =>
    fetchTeam()
      .then((d) => {
        cache = { team: d.team.map(fromMember), blocked: d.blocked, bot: d.bot };
        subs.forEach((f) => f(cache!));
        setError(null);
      })
      .catch((e: Error) => setError(e.message));

  useEffect(() => {
    if (!live) {
      setData(demoData);
      return;
    }
    subs.add(setData);
    void reload();
    return () => {
      subs.delete(setData);
    };
  }, [live]);

  return { team: data?.team ?? null, blocked: data?.blocked ?? [], bot: data?.bot ?? null, error, live, reload };
}
