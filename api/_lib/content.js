// Проверка и очистка текстов, которые присылает редактор.
// Всё лишнее отбрасывается, длины ограничиваются — в базу попадает только ожидаемая структура.

const CATEGORIES = ['Старт', 'Обязательно', 'Сервис', 'Регламент'];
const ICONS = ['book', 'shield', 'package', 'sparkles', 'wallet', 'scale'];
const KINDS = ['h', 'p', 'tip', 'warn', 'check', 'list'];

const str = (v, max = 2000) => String(v ?? '').slice(0, max);
const id = (v) => {
  const s = String(v ?? '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40);
  if (!s) throw new Error('пустой id');
  return s;
};
const arr = (v, max) => {
  if (!Array.isArray(v)) throw new Error('ожидался список');
  if (v.length > max) throw new Error('слишком много элементов');
  return v;
};
const unique = (items, what) => {
  const ids = items.map((x) => x.id);
  if (new Set(ids).size !== ids.length) throw new Error(`повторяющийся id: ${what}`);
  return items;
};

function block(b) {
  const kind = KINDS.includes(b?.kind) ? b.kind : 'p';
  if (kind === 'list') return { kind, items: arr(b.items ?? [], 50).map((x) => str(x, 500)) };
  return { kind, text: str(b?.text) };
}

function cover(v) {
  const s = str(v, 200);
  return /^linear-gradient\([#%,.\sa-zA-Z0-9()-]+\)$/.test(s) ? s : 'linear-gradient(135deg, #EFE7DC 0%, #D9CFC2 100%)';
}

export function cleanContent(input) {
  const courses = unique(
    arr(input?.courses, 50).map((c) => ({
      id: id(c.id),
      title: str(c.title, 120),
      subtitle: str(c.subtitle, 300),
      category: CATEGORIES.includes(c.category) ? c.category : 'Регламент',
      cover: cover(c.cover),
      lessons: unique(
        arr(c.lessons, 60).map((l) => ({
          id: id(l.id),
          title: str(l.title, 160),
          minutes: Math.max(1, Math.min(120, Math.round(Number(l.minutes) || 1))),
          type: l.type === 'checklist' ? 'checklist' : 'reading',
          content: arr(l.content, 100).map(block),
        })),
        'урок',
      ),
      quiz: arr(c.quiz, 40).map((q) => {
        const options = arr(q.options, 8).map((o) => str(o, 300));
        if (options.length < 2) throw new Error('в вопросе нужно минимум 2 варианта');
        const correct = Math.round(Number(q.correct));
        return {
          question: str(q.question, 500),
          options,
          correct: correct >= 0 && correct < options.length ? correct : 0,
          ...(q.explain ? { explain: str(q.explain, 1000) } : {}),
        };
      }),
    })),
    'курс',
  );

  const knowledgeBase = unique(
    arr(input?.knowledgeBase, 60).map((d) => ({
      id: id(d.id),
      title: str(d.title, 120),
      desc: str(d.desc, 200),
      icon: ICONS.includes(d.icon) ? d.icon : 'book',
      tag: str(d.tag, 40),
      sections: arr(d.sections, 60).map((s) => ({ title: str(s.title, 160), content: arr(s.content, 100).map(block) })),
    })),
    'документ',
  );

  return { courses, knowledgeBase };
}
