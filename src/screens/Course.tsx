import { motion } from 'motion/react';
import { L } from '../lib/i18n';
import { CheckCircle2, Clock, FileText, ListChecks, Lock, Trophy } from 'lucide-react';
import { categoryLabel, courseMinutes, findCourse, isDarkCover } from '../content/courses';
import { useNav } from '../lib/nav';
import { courseProgress, lessonsDoneCount, nextLessonIndex, useStore } from '../lib/store';
import { BackButton, BottomBar, PrimaryButton, ProgressBar, plural, stagger } from '../components/ui';

export function CourseScreen({ courseId }: { courseId: string }) {
  const s = useStore();
  const nav = useNav();
  const course = findCourse(courseId);
  if (!course) return null;

  const p = courseProgress(s, course);
  const doneCount = lessonsDoneCount(s, course);
  const next = nextLessonIndex(s, course);
  const allLessonsDone = next >= course.lessons.length;
  const quiz = s.quiz[course.id];
  const dark = isDarkCover(course.cover);

  const openLesson = (i: number) => nav.push({ name: 'lesson', courseId, lessonId: course.lessons[i]!.id });
  const startQuiz = () => nav.push({ name: 'quiz', courseId });

  const hasQuiz = course.quiz.length > 0;
  const cta = !allLessonsDone
    ? { label: doneCount === 0 ? L('Начать курс', 'Start course') : L(`Продолжить · урок ${next + 1}`, `Continue · lesson ${next + 1}`), go: () => openLesson(next) }
    : hasQuiz && !quiz?.passed
      ? { label: L('Пройти тест', 'Take the quiz'), go: startQuiz }
      : null;

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="relative w-full" style={{ background: course.cover }}>
        <div className="pt-safe">
          <div className="h-56">
            <div className="absolute left-5 top-5" style={{ marginTop: 'var(--safe-top)' }}>
              <BackButton glass onClick={nav.back} />
            </div>
            <div className="absolute bottom-5 left-5 eyebrow" style={{ color: dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }}>
              {categoryLabel(course.category)}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-5 pb-8 pt-5">
        <motion.h1 {...stagger(0)} className="font-display" style={{ fontSize: 28, lineHeight: 1.15 }}>{course.title}</motion.h1>
        <motion.p {...stagger(1)} className="mt-2" style={{ color: 'var(--muted-2)', lineHeight: 1.5 }}>{course.subtitle}</motion.p>

        <motion.div {...stagger(2)} className="mt-5 flex items-center gap-4" style={{ fontSize: 13, color: 'var(--muted-2)' }}>
          <div className="flex items-center gap-1.5"><Clock size={14} /> {courseMinutes(course)} {L('мин', 'min')}</div>
          <div className="h-3 w-px bg-black/10" />
          <div>{course.lessons.length} {plural(course.lessons.length, 'урок', 'урока', 'уроков', 'lesson', 'lessons')}</div>
          <div className="h-3 w-px bg-black/10" />
          <div>{L('+ тест', '+ quiz')}</div>
        </motion.div>

        <motion.div {...stagger(3)} className="mt-5 rounded-2xl border border-black/5 bg-white p-4">
          <div className="flex items-center justify-between" style={{ fontSize: 13 }}>
            <span style={{ color: 'var(--muted-2)' }}>{L('Ваш прогресс', 'Your progress')}</span>
            <span style={{ fontWeight: 500 }}>{p}%</span>
          </div>
          <div className="mt-3"><ProgressBar value={p} height={6} /></div>
          <div className="mt-2" style={{ fontSize: 12, color: 'var(--muted)' }}>
            {L(`Пройдено ${doneCount} из ${course.lessons.length}`, `${doneCount} of ${course.lessons.length} done`)}
            {quiz && L(` · тест ${quiz.correct}/${quiz.total}`, ` · quiz ${quiz.correct}/${quiz.total}`)}
          </div>
        </motion.div>

        <h3 className="mt-7" style={{ fontWeight: 500, fontSize: 18 }}>{L('Программа', 'Program')}</h3>
        <div className="mt-3 space-y-2">
          {course.lessons.map((l, i) => {
            const Icon = l.type === 'checklist' ? ListChecks : FileText;
            const done = (s.lessonsDone[course.id] ?? []).includes(l.id);
            const current = i === next;
            const locked = !done && i > next;
            return (
              <motion.button
                {...stagger(4 + i)}
                key={l.id}
                disabled={locked}
                onClick={() => openLesson(i)}
                className={`press flex w-full items-center gap-4 rounded-2xl border bg-white p-4 text-left ${
                  current ? 'border-black/20' : 'border-black/5'
                } ${locked ? 'opacity-50' : ''}`}
              >
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${done ? 'bg-black text-white' : 'bg-black/5'}`}>
                  {done ? <CheckCircle2 size={18} /> : locked ? <Lock size={16} className="text-black/40" /> : <Icon size={16} />}
                </div>
                <div className="min-w-0 flex-1">
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{L('Урок', 'Lesson')} {i + 1} · {l.minutes} {L('мин', 'min')}</div>
                  <div style={{ fontWeight: 500, marginTop: 2, lineHeight: 1.3 }}>{l.title}</div>
                </div>
                {current && <span className="shrink-0 rounded-full bg-black px-3 py-1 text-white" style={{ fontSize: 11 }}>{L('Сейчас', 'Now')}</span>}
              </motion.button>
            );
          })}

          {hasQuiz && <motion.button
            {...stagger(4 + course.lessons.length)}
            disabled={!allLessonsDone}
            onClick={startQuiz}
            className={`press flex w-full items-center gap-4 rounded-2xl border border-dashed bg-white p-4 text-left ${
              allLessonsDone ? 'border-black/25' : 'border-black/15 opacity-50'
            }`}
          >
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${quiz?.passed ? 'bg-black text-white' : 'bg-black/5'}`}>
              {quiz?.passed ? <Trophy size={16} /> : allLessonsDone ? <ListChecks size={16} /> : <Lock size={16} className="text-black/40" />}
            </div>
            <div className="flex-1">
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                {L('Финальный тест', 'Final quiz')} · {course.quiz.length} {plural(course.quiz.length, 'вопрос', 'вопроса', 'вопросов', 'question', 'questions')}
              </div>
              <div style={{ fontWeight: 500, marginTop: 2 }}>
                {quiz?.passed ? L(`Сдан · ${quiz.correct}/${quiz.total}`, `Passed · ${quiz.correct}/${quiz.total}`) : L('Проверка знаний', 'Knowledge check')}
              </div>
            </div>
            {quiz?.passed && <span style={{ fontSize: 12, color: 'var(--muted-2)' }}>{L('Пересдать', 'Retake')}</span>}
          </motion.button>}
        </div>
      </div>

      {cta && (
        <BottomBar>
          <PrimaryButton onClick={cta.go}>{cta.label}</PrimaryButton>
        </BottomBar>
      )}
    </div>
  );
}
