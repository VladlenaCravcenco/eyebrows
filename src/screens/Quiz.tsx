import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, X } from 'lucide-react';
import { findCourse } from '../content/courses';
import { useNav } from '../lib/nav';
import { actions, overallProgress, useStore } from '../lib/store';
import { haptic } from '../lib/telegram';
import { BottomBar, PrimaryButton, StepHeader, Watermark } from '../components/ui';

export function QuizScreen({ courseId }: { courseId: string }) {
  const nav = useNav();
  const s = useStore();
  const course = findCourse(courseId);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  if (!course || !course.quiz[idx]) return null;

  const q = course.quiz[idx]!;
  const total = course.quiz.length;
  const isLast = idx + 1 === total;

  const onMain = () => {
    if (selected === null) return;
    if (!revealed) {
      const ok = selected === q.correct;
      ok ? haptic.success() : haptic.error();
      if (ok) setScore((n) => n + 1);
      setRevealed(true);
      return;
    }
    if (!isLast) {
      setIdx(idx + 1);
      setSelected(null);
      setRevealed(false);
      return;
    }
    const before = overallProgress(s);
    actions.saveQuiz(courseId, score, total);
    // прогресс после сохранения читаем уже из обновлённого стора на экране результата
    nav.replace({ name: 'quizResult', courseId, correct: score, total, before });
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <Watermark />
      <StepHeader label={`Тест · Вопрос ${idx + 1} из ${total}`} steps={total} current={revealed ? idx + 1 : idx} onBack={nav.back} />

      <div className="flex-1 px-5 pb-10 pt-6">
        <div className="eyebrow">{course.title}</div>
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            <h2 className="font-display mt-3" style={{ fontSize: 28, lineHeight: 1.2 }}>{q.question}</h2>

            <div className="mt-7 space-y-2.5">
              {q.options.map((opt, i) => {
                const isSel = selected === i;
                const isCorrect = revealed && i === q.correct;
                const isWrong = revealed && isSel && i !== q.correct;
                return (
                  <motion.button
                    key={i}
                    onClick={() => {
                      if (revealed) return;
                      haptic.select();
                      setSelected(i);
                    }}
                    disabled={revealed}
                    animate={isWrong ? { x: [0, -8, 8, -5, 5, 0] } : isCorrect ? { scale: [1, 1.02, 1] } : {}}
                    transition={{ duration: 0.4 }}
                    className={`flex w-full items-center justify-between gap-3 rounded-2xl border bg-white p-4 text-left transition-colors ${
                      isCorrect
                        ? 'border-green-600 bg-green-50/50'
                        : isWrong
                          ? 'border-red-500 bg-red-50/50'
                          : isSel
                            ? 'border-black'
                            : 'border-black/10'
                    }`}
                  >
                    <span style={{ fontWeight: isSel ? 500 : 400 }}>{opt}</span>
                    {isCorrect && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-600 text-white">
                        <Check size={15} strokeWidth={3} />
                      </motion.div>
                    )}
                    {isWrong && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-500 text-white">
                        <X size={15} strokeWidth={3} />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence>
              {revealed && q.explain && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5 rounded-2xl border border-black/5 p-4"
                  style={{ background: 'var(--cream)', color: '#3a3a3a', lineHeight: 1.5, fontSize: 14 }}
                >
                  {q.explain}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

      <BottomBar>
        <PrimaryButton disabled={selected === null} onClick={onMain}>
          {!revealed ? 'Проверить' : isLast ? 'Завершить' : 'Следующий вопрос'}
        </PrimaryButton>
      </BottomBar>
    </div>
  );
}
