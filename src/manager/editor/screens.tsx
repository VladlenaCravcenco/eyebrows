import type { ReactNode } from 'react';
import { L } from '../../lib/i18n';
import { ChevronRight, CircleCheck, Circle, ListChecks, FileText } from 'lucide-react';
import { CATEGORIES, COVERS, categoryLabel, type Course, type Lesson, type Question } from '../../content/courses';
import { DOC_ICONS, type Doc } from '../../content/knowledge';
import { useNav } from '../../lib/nav';
import { ask, inTelegram } from '../../lib/telegram';
import { plural } from '../../components/ui';
import { docIcons } from '../../screens/Knowledge';
import { AddButton, BlocksEditor, Card, Chips, EditorPage, Field, LastSaved, RowTools } from './parts';
import { blankCourse, blankDoc, blankLesson, blankQuestion, edit, findIn, move, useDraft } from './draft';

const Row = ({ onClick, title, sub, left, tools }: { onClick: () => void; title: string; sub?: string; left?: ReactNode; tools?: ReactNode }) => (
  <div className="flex items-center gap-2">
    <button onClick={onClick} className="press flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-black/5 bg-white p-3 text-left">
      {left}
      <div className="min-w-0 flex-1">
        <div className="line-clamp-2" style={{ fontWeight: 500, lineHeight: 1.3 }}>{title || L('Без названия', 'Untitled')}</div>
        {sub && <div className="truncate" style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{sub}</div>}
      </div>
      <ChevronRight size={16} className="shrink-0 text-black/30" />
    </button>
    {tools}
  </div>
);

/* ---------- Главная редактора ---------- */

export function ContentHomeScreen() {
  const nav = useNav();
  const { content } = useDraft();

  return (
    <EditorPage title={L('Тексты', 'Content')} tab>
      <p style={{ fontSize: 13, color: 'var(--muted-2)', lineHeight: 1.5 }}>
        {L('Правьте уроки, тесты и базу знаний. Изменения копятся в черновике — девочки увидят их после кнопки «Сохранить для всех».', 'Edit lessons, quizzes and the knowledge base. Changes stay in a draft until you tap “Publish for everyone”.')}
        {!inTelegram && L(' Сейчас демо-режим: сохранится только на этом устройстве.', ' Demo mode: saves on this device only.')}
      </p>

      <Card title={`${L('Курсы', 'Courses')} · ${content.courses.length}`}>
        {content.courses.map((c, i) => (
          <Row
            key={c.id}
            onClick={() => nav.push({ name: 'editCourse', courseId: c.id })}
            title={c.title}
            sub={`${categoryLabel(c.category)} · ${c.lessons.length} ${plural(c.lessons.length, 'урок', 'урока', 'уроков', 'lesson', 'lessons')} · ${c.quiz.length} ${plural(c.quiz.length, 'вопрос', 'вопроса', 'вопросов', 'question', 'questions')}`}
            left={<div className="h-10 w-10 shrink-0 rounded-xl" style={{ background: c.cover }} />}
            tools={
              <RowTools stacked
                onUp={i > 0 ? () => edit((d) => move(d.courses, i, -1)) : undefined}
                onDown={i < content.courses.length - 1 ? () => edit((d) => move(d.courses, i, 1)) : undefined}
              />
            }
          />
        ))}
        <AddButton
          onClick={() => {
            const c = blankCourse();
            edit((d) => d.courses.push(c));
            nav.push({ name: 'editCourse', courseId: c.id });
          }}
        >
          {L('Новый курс', 'New course')}
        </AddButton>
      </Card>

      <Card title={`${L('База знаний', 'Knowledge base')} · ${content.knowledgeBase.length}`}>
        {content.knowledgeBase.map((k, i) => {
          const Icon = docIcons[k.icon];
          return (
            <Row
              key={k.id}
              onClick={() => nav.push({ name: 'editDoc', docId: k.id })}
              title={k.title}
              sub={`${k.tag} · ${k.sections.length} ${plural(k.sections.length, 'раздел', 'раздела', 'разделов', 'section', 'sections')}`}
              left={<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/5"><Icon size={16} /></div>}
              tools={
                <RowTools stacked
                  onUp={i > 0 ? () => edit((d) => move(d.knowledgeBase, i, -1)) : undefined}
                  onDown={i < content.knowledgeBase.length - 1 ? () => edit((d) => move(d.knowledgeBase, i, 1)) : undefined}
                />
              }
            />
          );
        })}
        <AddButton
          onClick={() => {
            const k = blankDoc();
            edit((d) => d.knowledgeBase.push(k));
            nav.push({ name: 'editDoc', docId: k.id });
          }}
        >
          {L('Новый документ', 'New document')}
        </AddButton>
      </Card>
      <LastSaved />
    </EditorPage>
  );
}

/* ---------- Курс ---------- */

export function CourseEditorScreen({ courseId }: { courseId: string }) {
  const nav = useNav();
  const { content } = useDraft();
  const c = findIn(content, courseId);
  if (!c) return <EditorPage title={L('Курс удалён', 'Course deleted')} onBack={nav.back}><p>{L('Курс не найден.', 'Course not found.')}</p></EditorPage>;
  const upd = (fn: (x: Course) => void) => edit((d) => fn(findIn(d, courseId)!));

  return (
    <EditorPage title={c.title || L('Курс', 'Course')} onBack={nav.back}>
      <Card title={L('О курсе', 'About')}>
        <Field label={L('Название', 'Title')} value={c.title} onChange={(v) => upd((x) => (x.title = v))} />
        <Field label={L('Короткое описание', 'Short description')} multiline value={c.subtitle} onChange={(v) => upd((x) => (x.subtitle = v))} />
        <div>
          <div className="mb-1.5" style={{ fontSize: 12, color: 'var(--muted-2)' }}>{L('Раздел', 'Category')}</div>
          <Chips options={CATEGORIES} value={c.category} onChange={(v) => upd((x) => (x.category = v))} render={categoryLabel} />
        </div>
        <div>
          <div className="mb-1.5" style={{ fontSize: 12, color: 'var(--muted-2)' }}>{L('Обложка', 'Cover')}</div>
          <div className="flex flex-wrap gap-2">
            {COVERS.map((cv) => (
              <button
                key={cv}
                type="button"
                aria-label={L('Обложка', 'Cover')}
                onClick={() => upd((x) => (x.cover = cv))}
                className={`h-11 w-11 rounded-xl border-2 ${c.cover === cv ? 'border-black' : 'border-transparent'}`}
                style={{ background: cv }}
              />
            ))}
          </div>
        </div>
      </Card>

      <Card title={`${L('Уроки', 'Lessons')} · ${c.lessons.length}`}>
        {c.lessons.map((l, i) => (
          <Row
            key={l.id}
            onClick={() => nav.push({ name: 'editLesson', courseId, lessonId: l.id })}
            title={`${i + 1}. ${l.title}`}
            sub={`${l.minutes} ${L('мин', 'min')} · ${l.type === 'checklist' ? L('чек-лист', 'checklist') : L('чтение', 'reading')}`}
            left={<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/5">{l.type === 'checklist' ? <ListChecks size={16} /> : <FileText size={16} />}</div>}
            tools={
              <RowTools stacked
                onUp={i > 0 ? () => upd((x) => move(x.lessons, i, -1)) : undefined}
                onDown={i < c.lessons.length - 1 ? () => upd((x) => move(x.lessons, i, 1)) : undefined}
                onDelete={() => upd((x) => x.lessons.splice(i, 1))}
                confirmText={L(`Удалить урок «${l.title}»?`, `Delete lesson “${l.title}”?`)}
              />
            }
          />
        ))}
        <AddButton
          onClick={() => {
            const l = blankLesson();
            upd((x) => x.lessons.push(l));
            nav.push({ name: 'editLesson', courseId, lessonId: l.id });
          }}
        >
          {L('Добавить урок', 'Add lesson')}
        </AddButton>
      </Card>

      <Card title={`${L('Тест', 'Quiz')} · ${c.quiz.length}`}>
        {c.quiz.map((q, i) => (
          <Row
            key={i}
            onClick={() => nav.push({ name: 'editQuestion', courseId, index: i })}
            title={q.question || L('Новый вопрос', 'New question')}
            sub={`${L('Ответ', 'Answer')}: ${q.options[q.correct] || '—'}`}
            tools={
              <RowTools stacked
                onUp={i > 0 ? () => upd((x) => move(x.quiz, i, -1)) : undefined}
                onDown={i < c.quiz.length - 1 ? () => upd((x) => move(x.quiz, i, 1)) : undefined}
                onDelete={() => upd((x) => x.quiz.splice(i, 1))}
                confirmText={L('Удалить этот вопрос?', 'Delete this question?')}
              />
            }
          />
        ))}
        <AddButton
          onClick={() => {
            upd((x) => x.quiz.push(blankQuestion()));
            nav.push({ name: 'editQuestion', courseId, index: c.quiz.length });
          }}
        >
          {L('Добавить вопрос', 'Add question')}
        </AddButton>
      </Card>

      <DeleteButton
        label={L('Удалить курс', 'Delete course')}
        confirm={L(`Удалить курс «${c.title}» целиком? Это можно отменить, пока не нажали «Сохранить для всех».`, `Delete the whole course “${c.title}”? You can still discard this until you publish.`)}
        onDelete={() => {
          edit((d) => (d.courses = d.courses.filter((x) => x.id !== courseId)));
          nav.back();
        }}
      />
    </EditorPage>
  );
}

/* ---------- Урок ---------- */

export function LessonEditorScreen({ courseId, lessonId }: { courseId: string; lessonId: string }) {
  const nav = useNav();
  const { content } = useDraft();
  const l = findIn(content, courseId)?.lessons.find((x) => x.id === lessonId);
  if (!l) return <EditorPage title={L('Урок удалён', 'Lesson deleted')} onBack={nav.back}><p>{L('Урок не найден.', 'Lesson not found.')}</p></EditorPage>;
  const upd = (fn: (x: Lesson) => void) => edit((d) => fn(findIn(d, courseId)!.lessons.find((x) => x.id === lessonId)!));

  return (
    <EditorPage title={l.title || L('Урок', 'Lesson')} onBack={nav.back}>
      <Card title={L('Урок', 'Lesson')}>
        <Field label={L('Название', 'Title')} value={l.title} onChange={(v) => upd((x) => (x.title = v))} />
         <Field label={L('Сколько минут читать', 'Reading time, min')} type="number" value={l.minutes} onChange={(v) => upd((x) => (x.minutes = Math.max(1, Math.min(120, Number(v) || 1))))} />
      </Card>
      <Card title={L('Содержание', 'Content')}>
        <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
          {L('Если добавить «Пункт чек-листа», урок станет чек-листом: чтобы пройти дальше, нужно отметить все пункты.', 'Add a “Checklist item” and the lesson becomes a checklist: every item must be ticked to move on.')}
        </p>
        <BlocksEditor blocks={l.content} onChange={(b) => upd((x) => (x.content = b))} />
      </Card>
    </EditorPage>
  );
}

/* ---------- Вопрос теста ---------- */

export function QuestionEditorScreen({ courseId, index }: { courseId: string; index: number }) {
  const nav = useNav();
  const { content } = useDraft();
  const q = findIn(content, courseId)?.quiz[index];
  if (!q) return <EditorPage title={L('Вопрос удалён', 'Question deleted')} onBack={nav.back}><p>{L('Вопрос не найден.', 'Question not found.')}</p></EditorPage>;
  const upd = (fn: (x: Question) => void) => edit((d) => fn(findIn(d, courseId)!.quiz[index]!));

  return (
    <EditorPage title={`${L('Вопрос', 'Question')} ${index + 1}`} onBack={nav.back}>
      <Card title={L('Вопрос', 'Question')}>
        <Field multiline value={q.question} onChange={(v) => upd((x) => (x.question = v))} placeholder={L('Например: какой срок хранения крафт-пакета?', 'e.g. How long can a sterilized pouch be stored?')} />
      </Card>
      <Card title={L('Варианты ответа', 'Answers')}>
        <p style={{ fontSize: 12, color: 'var(--muted)' }}>{L('Нажмите на кружок у правильного ответа.', 'Tap the circle next to the correct answer.')}</p>
        {q.options.map((o, i) => (
          <div key={i} className="flex items-center gap-2">
            <button type="button" onClick={() => upd((x) => (x.correct = i))} aria-label={L('Правильный ответ', 'Correct answer')} className="shrink-0">
              {q.correct === i ? <CircleCheck size={24} className="text-green-600" /> : <Circle size={24} className="text-black/25" />}
            </button>
            <div className="min-w-0 flex-1">
              <Field value={o} onChange={(v) => upd((x) => (x.options[i] = v))} placeholder={`${L('Вариант', 'Option')} ${i + 1}`} />
            </div>
            <RowTools stacked
              onDelete={
                q.options.length > 2
                  ? () =>
                      upd((x) => {
                        x.options.splice(i, 1);
                        if (x.correct === i) x.correct = 0;
                        else if (x.correct > i) x.correct--;
                      })
                  : undefined
              }
            />
          </div>
        ))}
        {q.options.length < 6 && <AddButton onClick={() => upd((x) => x.options.push(''))}>{L('Добавить вариант', 'Add option')}</AddButton>}
      </Card>
      <Card title={L('Пояснение (необязательно)', 'Explanation (optional)')}>
        <Field multiline value={q.explain ?? ''} onChange={(v) => upd((x) => (x.explain = v || undefined))} placeholder={L('Показывается после ответа — помогает запомнить', 'Shown after answering — helps it stick')} />
      </Card>
    </EditorPage>
  );
}

/* ---------- Документ базы знаний ---------- */

export function DocEditorScreen({ docId }: { docId: string }) {
  const nav = useNav();
  const { content } = useDraft();
  const k = content.knowledgeBase.find((x) => x.id === docId);
  if (!k) return <EditorPage title={L('Документ удалён', 'Document deleted')} onBack={nav.back}><p>{L('Документ не найден.', 'Document not found.')}</p></EditorPage>;
  const upd = (fn: (x: Doc) => void) => edit((d) => fn(d.knowledgeBase.find((x) => x.id === docId)!));

  return (
    <EditorPage title={k.title || L('Документ', 'Document')} onBack={nav.back}>
      <Card title={L('Документ', 'Document')}>
        <Field label={L('Название', 'Title')} value={k.title} onChange={(v) => upd((x) => (x.title = v))} />
        <Field label={L('Короткое описание', 'Short description')} value={k.desc} onChange={(v) => upd((x) => (x.desc = v))} />
        <Field label={L('Метка', 'Tag')} value={k.tag} onChange={(v) => upd((x) => (x.tag = v))} placeholder={L('Например: Регламент', 'e.g. Policy')} />
        <div>
          <div className="mb-1.5" style={{ fontSize: 12, color: 'var(--muted-2)' }}>{L('Иконка', 'Icon')}</div>
          <Chips
            options={DOC_ICONS}
            value={k.icon}
            onChange={(v) => upd((x) => (x.icon = v))}
            render={(v) => {
              const I = docIcons[v];
              return <I size={16} />;
            }}
          />
        </div>
      </Card>

      {k.sections.map((s, i) => (
        <Card
          key={i}
          title={`${L('Раздел', 'Section')} ${i + 1}`}
          action={
            <RowTools
              onUp={i > 0 ? () => upd((x) => move(x.sections, i, -1)) : undefined}
              onDown={i < k.sections.length - 1 ? () => upd((x) => move(x.sections, i, 1)) : undefined}
              onDelete={() => upd((x) => x.sections.splice(i, 1))}
              confirmText={L(`Удалить раздел «${s.title}»?`, `Delete section “${s.title}”?`)}
            />
          }
        >
           <Field label={L('Заголовок раздела', 'Section title')} value={s.title} onChange={(v) => upd((x) => (x.sections[i]!.title = v))} />
          <BlocksEditor blocks={s.content} onChange={(b) => upd((x) => (x.sections[i]!.content = b))} />
        </Card>
      ))}
      <AddButton onClick={() => upd((x) => x.sections.push({ title: L('Новый раздел', 'New section'), content: [{ kind: 'p', text: '' }] }))}>{L('Добавить раздел', 'Add section')}</AddButton>

      <DeleteButton
        label={L('Удалить документ', 'Delete document')}
        confirm={L(`Удалить документ «${k.title}»? Это можно отменить, пока не нажали «Сохранить для всех».`, `Delete the document “${k.title}”? You can still discard this until you publish.`)}
        onDelete={() => {
          edit((d) => (d.knowledgeBase = d.knowledgeBase.filter((x) => x.id !== docId)));
          nav.back();
        }}
      />
    </EditorPage>
  );
}

function DeleteButton({ label, confirm, onDelete }: { label: string; confirm: string; onDelete: () => void }) {
  return (
    <button
      type="button"
      onClick={async () => {
        if (await ask(confirm)) onDelete();
      }}
      className="w-full rounded-2xl border border-red-500/20 bg-white p-4"
      style={{ color: '#9a4848', fontWeight: 500 }}
    >
      {label}
    </button>
  );
}
