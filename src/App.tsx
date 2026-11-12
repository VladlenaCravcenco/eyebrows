import { AnimatePresence, motion } from 'motion/react';
import { BottomNav } from './components/BottomNav';
import { NavProvider, useNav, type Route } from './lib/nav';
import { useStore } from './lib/store';
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
import { EmployeeScreen, EmployeesScreen, ManagerScreen } from './manager/Manager';

function screenFor(r: Route) {
  switch (r.name) {
    case 'tab':
      if (r.tab === 'home') return <HomeScreen />;
      if (r.tab === 'courses') return <CoursesScreen />;
      if (r.tab === 'knowledge') return <KnowledgeScreen />;
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
    case 'manager':
      return <ManagerScreen />;
    case 'employees':
      return <EmployeesScreen />;
    case 'employee':
      return <EmployeeScreen employeeId={r.employeeId} />;
  }
}

function Router() {
  const { route, dir } = useNav();
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
      {isTab && <BottomNav active={route.tab} />}
    </>
  );
}

export default function App() {
  const s = useStore();
  return (
    <div className="mx-auto min-h-dvh max-w-[480px] overflow-x-clip bg-white shadow-[0_0_60px_-20px_rgba(0,0,0,0.15)]">
      {!s.user ? (
        <AuthScreen />
      ) : !s.welcomed ? (
        <WelcomeScreen />
      ) : (
        <NavProvider>
          <Router />
        </NavProvider>
      )}
    </div>
  );
}
