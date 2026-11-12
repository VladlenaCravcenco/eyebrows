import { useState } from 'react';
import { L } from '../lib/i18n';
import { AnimatePresence, motion } from 'motion/react';
import { Check } from 'lucide-react';
import { findCourse } from '../content/courses';
import { useNav } from '../lib/nav';
import { actions, useStore } from '../lib/store';
import { haptic } from '../lib/telegram';
import { BottomBar, ContentBlock, PrimaryButton, StepHeader, Watermark, stagger } from '../components/ui';

export function LessonScreen({ courseId, lessonId }: { courseId: string; lessonId: string }) {
  const nav = useNav();
  const s = useStore();
  const course = findCourse(courseId);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  if (!course) return null;

  const index = course.lessons.findIndex((l) => l.id === lessonId);
  const lesson = course.lessons[index];
  if (!lesson) return null;
  const isLast = index === course.lessons.length - 1;
  const alreadyDone = (s.lessonsDone[courseId] ?? []).includes(lessonId);
  // нет теста — после последнего урока просто возвращаемся к курсу
  const quizPassed = !!s.quiz[courseId]?.passed || course.quiz.length === 0;

  const checks = lesson.content.map((b, i) => (b.kind === 'check' ? i : -1)).filter((i) => i >= 0);
  const allChecked = alreadyDone || checks.every((i) => checked.has(i));

  const finish = () => {
    actions.completeLesson(courseId, lessonId);
    if (!isLast) nav.replace({ name: 'lesson', courseId, lessonId: course.lessons[index + 1]!.id });
    else if (!quizPassed) nav.replace({ name: 'quiz', courseId });
    else nav.back();
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <Watermark />
      <StepHeader
        label={`${course.title} · ${L(`Урок ${index + 1} из ${course.lessons.length}`, `Lesson ${index + 1} of ${course.lessons.length}`)}`}
        steps={course.lessons.length}
        current={index}
        onBack={nav.back}
      />

      <div className="flex-1 px-5 pb-10 pt-6">
        <motion.div {...stagger(0)} className="eyebrow">
          {lesson.minutes} {L('мин', 'min')} · {lesson.type === 'checklist' ? L('чек-лист', 'checklist') : L('чтение', 'reading')}
        </motion.div>
        <motion.h1 {...stagger(1)} className="font-display mt-2" style={{ fontSize: 30, lineHeight: 1.15 }}>
          {lesson.title}
        </motion.h1>

        <div className="mt-7 space-y-5">
          {lesson.content.map((block, i) => {
            if (block.kind !== 'check')
              return (
                <motion.div key={i} {...stagger(2 + i)}>
                  <ContentBlock block={block} />
                </motion.div>
              );
            const on = alreadyDone || checked.has(i);
            return (
              <motion.button
                key={i}
                {...stagger(2 + i)}
                onClick={() => {
                  if (alreadyDone) return;
                  haptic.select();
                  const next = new Set(checked);
                  on ? next.delete(i) : next.add(i);
                  setChecked(next);
                }}
                className="press flex w-full items-start gap-3 rounded-2xl border border-black/5 bg-white p-4 text-left"
              >
                <motion.div
                  animate={{ scale: on ? [1, 1.25, 1] : 1 }}
                  transition={{ duration: 0.25 }}
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                    on ? 'border-black bg-black text-white' : 'border-black/20'
                  }`}
                >
                  {on && <Check size={12} strokeWidth={3} />}
                </motion.div>
                <span className="transition-colors" style={{ color: on ? 'var(--muted)' : '#1a1a1a', textDecoration: on ? 'line-through' : 'none' }}>
                  {block.text}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <BottomBar>
        <AnimatePresence>
          {!allChecked && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pb-3 text-center"
              style={{ fontSize: 12, color: 'var(--muted)' }}
            >
              {L('Отметьте все пункты чек-листа', 'Tick every item to continue')}
            </motion.p>
          )}
        </AnimatePresence>
        <PrimaryButton disabled={!allChecked} onClick={finish}>
          {!isLast ? L('Следующий урок', 'Next lesson') : quizPassed ? L('Завершить', 'Finish') : L('Перейти к тесту', 'Go to quiz')}
        </PrimaryButton>
      </BottomBar>
    </div>
  );
}
