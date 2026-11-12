import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { setBackButton } from './telegram';

export type Tab = 'home' | 'courses' | 'knowledge' | 'profile';

export type Route =
  | { name: 'tab'; tab: Tab }
  | { name: 'course'; courseId: string }
  | { name: 'lesson'; courseId: string; lessonId: string }
  | { name: 'quiz'; courseId: string }
  | { name: 'quizResult'; courseId: string; correct: number; total: number; before: number }
  | { name: 'doc'; docId: string }
  | { name: 'manager' }
  | { name: 'employees' }
  | { name: 'employee'; employeeId: string }
  | { name: 'content' }
  | { name: 'editCourse'; courseId: string }
  | { name: 'editLesson'; courseId: string; lessonId: string }
  | { name: 'editQuestion'; courseId: string; index: number }
  | { name: 'editDoc'; docId: string };

type Nav = {
  route: Route;
  depth: number;
  /** 1 — вперёд, -1 — назад; нужно для направления анимации */
  dir: 1 | -1;
  push(r: Route): void;
  /** заменить текущий экран (без добавления в историю) */
  replace(r: Route): void;
  back(): void;
  /** вернуться на вкладку, очистив стек */
  toTab(t: Tab): void;
};

const Ctx = createContext<Nav | null>(null);

/**
 * Простой стек экранов. Синхронизирован с кнопкой «назад» браузера / Android
 * и с BackButton в Telegram.
 */
export function NavProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<Route[]>([{ name: 'tab', tab: 'home' }]);
  const [dir, setDir] = useState<1 | -1>(1);
  const stackRef = useRef(stack);
  stackRef.current = stack;

  useEffect(() => {
    const onPop = () => {
      if (stackRef.current.length > 1) {
        setDir(-1);
        setStack((s) => s.slice(0, -1));
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const push = useCallback((r: Route) => {
    history.pushState(null, '');
    setDir(1);
    setStack((s) => [...s, r]);
  }, []);

  const replace = useCallback((r: Route) => {
    setDir(1);
    setStack((s) => [...s.slice(0, -1), r]);
  }, []);

  const back = useCallback(() => {
    if (stackRef.current.length > 1) history.back();
  }, []);

  const toTab = useCallback((tab: Tab) => {
    const extra = stackRef.current.length - 1;
    setDir(extra > 0 ? -1 : 1);
    setStack([{ name: 'tab', tab }]);
    // убираем лишние записи истории, не вызывая popstate-обработчик
    if (extra > 0) {
      stackRef.current = [{ name: 'tab', tab }];
      history.go(-extra);
    }
  }, []);

  const route = stack[stack.length - 1]!;

  useEffect(() => setBackButton(stack.length > 1, back), [stack.length, back]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);

  return <Ctx.Provider value={{ route, depth: stack.length, dir, push, replace, back, toTab }}>{children}</Ctx.Provider>;
}

export function useNav() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useNav outside NavProvider');
  return v;
}
