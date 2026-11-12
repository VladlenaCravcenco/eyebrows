import { AnimatePresence, motion } from 'motion/react';
import { useEffect } from 'react';
import { Lock, Sparkles } from 'lucide-react';
import { adminTabs, BottomNav, learnerTabs } from './components/BottomNav';
import { NavProvider, useNav, type Route } from './lib/nav';
import { useStore } from './lib/store';
import { useSyncReady } from './lib/sync';
import { inTelegram } from './lib/telegram';
import { useContentVersion } from './content/live';
import { AuthScreen } from './screens/Auth';
import { WelcomeScreen } from './screens/Welcome';
import { HomeScreen } from './screens/Home';
import { CoursesScreen } from './screens/Courses';
import { CourseScreen } from './screens/Course';
import { LessonScreen } from './screens/Lesson';
import { QuizScreen } from './screens/Quiz';
import { QuizResultScreen } from './screens/QuizResult';
import { DocScreen, KnowledgeScreen } from './screens/Knowledge';
import { ProfileScreen } from './screens/Profile';
import { EmployeeScreen, StaffTab, TeamTab } from './manager/Manager';
import { useDraft } from './manager/editor/draft';
import {
  ContentHomeScreen,
  CourseEditorScreen,
  DocEditorScreen,
  LessonEditorScreen,
  QuestionEditorScreen,
} from './manager/editor/screens';

function screenFor(r: Route) {
  switch (r.name) {
    case 'tab':
      if (r.tab === 'home') return <HomeScreen />;
      if (r.tab === 'courses') return <CoursesScreen />;
      if (r.tab === 'knowledge') return <KnowledgeScreen />;
      if (r.tab === 'team') return <TeamTab />;
      if (r.tab === 'staff') return <StaffTab />;
      if (r.tab === 'texts') return <ContentHomeScreen />;
      return <ProfileScreen />;
    case 'course':
      return <CourseScreen courseId={r.courseId} />;
    case 'lesson':
      return <LessonScreen courseId={r.courseId} lessonId={r.lessonId} />;
    case 'quiz':
      return <QuizScreen courseId={r.courseId} />;
    case 'quizResult':
      return <QuizResultScreen {...r} />;
    case 'doc':
      return <DocScreen docId={r.docId} />;
    case 'employee':
      return <EmployeeScreen employeeId={r.employeeId} />;
    case 'editCourse':
      return <CourseEditorScreen courseId={r.courseId} />;
    case 'editLesson':
      return <LessonEditorScreen courseId={r.courseId} lessonId={r.lessonId} />;
    case 'editQuestion':
      return <QuestionEditorScreen courseId={r.courseId} index={r.index} />;
    case 'editDoc':
      return <DocEditorScreen docId={r.docId} />;
  }
}

function Router({ admin }: { admin: boolean }) {
  const { route, dir } = useNav();
  const { dirty } = useDraft();
  const isTab = route.name === 'tab';
  // вкладки переключаются мягким фейдом, остальные экраны «въезжают» сбоку
  const key = JSON.stringify(route);
  return (
    <>
      <AnimatePresence mode="wait" initial={false} custom={dir}>
        <motion.main
          key={key}
          custom={dir}
          initial={isTab ? { opacity: 0 } : { opacity: 0, x: dir * 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={isTab ? { opacity: 0 } : { opacity: 0, x: dir * -40 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {screenFor(route)}
        </motion.main>
      </AnimatePresence>
      {/* пока в редакторе есть несохранённые правки, вместо меню показана панель сохранения */}
      {isTab && !(admin && dirty && route.tab === 'texts') && <BottomNav active={route.tab} items={admin ? adminTabs : learnerTabs} />}
    </>
  );
}

function Splash() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-black text-white">
        <Sparkles size={22} />
      </div>
    </div>
  );
}

function Blocked() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/5"><Lock size={24} /></div>
      <h1 className="font-display mt-6" style={{ fontSize: 26 }}>Доступ закрыт</h1>
      <p className="mt-3" style={{ color: 'var(--muted-2)', lineHeight: 1.5 }}>
        Если это ошибка — напишите администратору студии.
      </p>
    </div>
  );
}

/** Мастерам — защита от копирования текста и сохранения картинок */
function useCopyProtection(on: boolean) {
  useEffect(() => {
    if (!on) return;
    const stop = (e: Event) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest('input, textarea')) return;
      e.preventDefault();
    };
    const events = ['copy', 'cut', 'contextmenu', 'dragstart', 'selectstart'] as const;
    events.forEach((ev) => document.addEventListener(ev, stop));
    document.documentElement.classList.add('protect');
    return () => {
      events.forEach((ev) => document.removeEventListener(ev, stop));
      document.documentElement.classList.remove('protect');
    };
  }, [on]);
}

export default function App() {
  const s = useStore();
  const ready = useSyncReady();
  useContentVersion(); // перерисовать всё, когда руководитель обновил тексты

  // руководитель в Telegram (или демо-кабинет в браузере) — отдельное приложение без режима мастера
  const admin = inTelegram ? !!s.isManager : !!s.demoAdmin;
  useCopyProtection(!admin);

  let body;
  if (inTelegram && !ready && s.isManager === undefined) body = <Splash />;
  else if (s.blocked) body = <Blocked />;
  else if (admin)
    body = (
      <NavProvider key="admin" initial="team">
        <Router admin />
      </NavProvider>
    );
  else if (!s.user) body = <AuthScreen />;
  else if (!s.welcomed) body = <WelcomeScreen />;
  else
    body = (
      <NavProvider key="learner">
        <Router admin={false} />
      </NavProvider>
    );

  return <div className="mx-auto min-h-dvh max-w-[480px] overflow-x-clip bg-white shadow-[0_0_60px_-20px_rgba(0,0,0,0.15)]">{body}</div>;
}
