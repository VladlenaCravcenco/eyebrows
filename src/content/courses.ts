/**
 * НАЧАЛЬНЫЕ КУРСЫ, УРОКИ И ТЕСТЫ.
 *
 * После запуска тексты правятся прямо в приложении: Профиль → Режим руководителя →
 * «Курсы и тексты». Сохранённая там версия хранится в базе и заменяет эту.
 * Этот файл используется, пока в базе ничего не сохранено.
 *
 * Виды блоков внутри урока (content):
 *   h     — подзаголовок
 *   p     — обычный абзац
 *   tip   — бежевая плашка «Важно»
 *   warn  — красная плашка «Нельзя»
 *   list  — список с точками (пункты через items)
 *   check — пункт чек-листа, который нужно отметить, чтобы пройти дальше
 *
 * В тесте correct — номер правильного ответа, считая с нуля (0 = первый вариант).
 * id курсов и уроков менять нельзя после запуска — к ним привязан прогресс девочек.
 */
import { L, en } from '../lib/i18n';
import { coursesEn } from './demo-en';

export type Block =
  | { kind: 'h' | 'p' | 'tip' | 'warn' | 'check'; text: string }
  | { kind: 'list'; items: string[] };

export type Lesson = {
  id: string;
  title: string;
  minutes: number;
  type: 'reading' | 'checklist';
  content: Block[];
};

export type Question = {
  question: string;
  options: string[];
  correct: number;
  /** Пояснение после ответа — показывается всегда, помогает запомнить */
  explain?: string;
};

export type Course = {
  id: string;
  title: string;
  subtitle: string;
  category: Category;
  cover: string;
  lessons: Lesson[];
  quiz: Question[];
};

export const CATEGORIES = ['Старт', 'Обязательно', 'Сервис', 'Регламент'] as const;
export type Category = (typeof CATEGORIES)[number];

/** Обложки на выбор в редакторе */
export const COVERS = [
  'linear-gradient(135deg, #EFE7DC 0%, #D9CFC2 100%)',
  'linear-gradient(135deg, #E8EEE9 0%, #C9D5CB 100%)',
  'linear-gradient(135deg, #F1E4E4 0%, #DFC9C9 100%)',
  'linear-gradient(135deg, #E5E5EA 0%, #C7C7CE 100%)',
  'linear-gradient(135deg, #E9E6F2 0%, #CFCAE0 100%)',
  'linear-gradient(135deg, #1A1A1F 0%, #2E2E36 100%)',
];
/** Название раздела на языке интерфейса (в данных разделы хранятся по-русски) */
export const categoryLabel = (c: string) =>
  ({ Старт: L('Старт', 'Start'), Обязательно: L('Обязательно', 'Required'), Сервис: L('Сервис', 'Service'), Регламент: L('Регламент', 'Policy') })[c] ?? c;

export const isDarkCover = (cover: string) => cover.includes('#1A1A1F');

export const PASS_THRESHOLD = 0.6; // доля верных ответов, чтобы тест засчитался

export const defaultCourses: Course[] = [
  {
    id: 'onboarding',
    title: 'Онбординг мастера',
    subtitle: 'Первые шаги в студии: ценности, культура и стандарты',
    category: 'Старт',
    cover: 'linear-gradient(135deg, #EFE7DC 0%, #D9CFC2 100%)',
    lessons: [
      {
        id: 'l1',
        title: 'Добро пожаловать в студию',
        minutes: 4,
        type: 'reading',
        content: [
          { kind: 'h', text: 'Наша философия' },
          { kind: 'p', text: 'Мы создаём пространство, где каждый клиент чувствует заботу и внимание. Внешний вид — это всегда отражение внутреннего состояния студии.' },
          { kind: 'tip', text: 'Эстетика, чистота и спокойствие — три кита нашей работы.' },
        ],
      },
      {
        id: 'l2',
        title: 'Первый рабочий день',
        minutes: 6,
        type: 'checklist',
        content: [
          { kind: 'h', text: 'Чек-лист первого дня' },
          { kind: 'p', text: 'Отметьте каждый пункт, когда сделаете его.' },
          { kind: 'check', text: 'Получить доступ в приложение и расписание' },
          { kind: 'check', text: 'Познакомиться с командой и администратором' },
          { kind: 'check', text: 'Изучить расположение материалов и стерилизатора' },
          { kind: 'check', text: 'Подготовить рабочее место по чек-листу' },
        ],
      },
      {
        id: 'l3',
        title: 'Дресс-код и внешний вид',
        minutes: 5,
        type: 'reading',
        content: [
          { kind: 'p', text: 'Аккуратная форма, минимум украшений, ухоженные руки — это часть сервиса. Клиент видит вас раньше, чем результат вашей работы.' },
          { kind: 'list', items: ['Чистая выглаженная форма', 'Волосы собраны', 'Минимум украшений на руках'] },
          { kind: 'tip', text: 'Парфюм — лёгкий и ненавязчивый. Маникюр всегда в нейтральных тонах.' },
        ],
      },
      {
        id: 'l4',
        title: 'Ценности и правила общения',
        minutes: 4,
        type: 'reading',
        content: [
          { kind: 'p', text: 'Мы говорим на «вы», обращаемся по имени, никогда не обсуждаем клиентов между собой. Уважение — базовая норма.' },
          { kind: 'warn', text: 'Не обсуждаем клиентов, коллег и цены других студий при клиенте.' },
        ],
      },
    ],
    quiz: [
      { question: 'Что считается базовой нормой общения с клиентом?', options: ['Дружеский тон', 'Уважение и обращение по имени', 'Молчаливая работа'], correct: 1, explain: 'Говорим на «вы» и обращаемся по имени — это база.' },
      { question: 'Допустим ли яркий маникюр у мастера?', options: ['Да, это самовыражение', 'Только в нейтральных тонах', 'Только в выходные'], correct: 1 },
      { question: 'Что входит в чек-лист первого дня?', options: ['Подготовка рабочего места', 'Покупка инструментов', 'Самостоятельный приём клиента'], correct: 0 },
    ],
  },
  {
    id: 'sanitary',
    title: 'Санитарные нормы',
    subtitle: 'Стерилизация, обработка инструментов и безопасность',
    category: 'Обязательно',
    cover: 'linear-gradient(135deg, #E8EEE9 0%, #C9D5CB 100%)',
    lessons: [
      {
        id: 's1', title: 'Этапы обработки инструмента', minutes: 6, type: 'reading',
        content: [
          { kind: 'p', text: 'Инструмент проходит четыре этапа строго по порядку:' },
          { kind: 'list', items: ['Дезинфекция', 'ПСО (предстерилизационная очистка)', 'Стерилизация', 'Хранение в крафт-пакете'] },
          { kind: 'warn', text: 'Нарушение порядка недопустимо.' },
        ],
      },
      {
        id: 's2', title: 'Работа со стерилизатором', minutes: 5, type: 'checklist',
        content: [
          { kind: 'check', text: 'Проверить целостность крафт-пакета' },
          { kind: 'check', text: 'Указать дату стерилизации' },
          { kind: 'check', text: 'Хранить не более 72 часов' },
        ],
      },
      { id: 's3', title: 'Уборка рабочего места', minutes: 5, type: 'reading', content: [{ kind: 'p', text: 'После каждого клиента — обработка поверхностей, замена одноразовых материалов, проветривание.' }] },
      { id: 's4', title: 'Работа с биоматериалами', minutes: 7, type: 'reading', content: [{ kind: 'p', text: 'Перчатки, маска, очки при необходимости. Утилизация — в отдельный контейнер.' }] },
      { id: 's5', title: 'Личная гигиена мастера', minutes: 4, type: 'reading', content: [{ kind: 'p', text: 'Мытьё рук до и после клиента — обязательно. Антисептик всегда под рукой.' }] },
    ],
    quiz: [
      { question: 'Какой срок хранения крафт-пакета?', options: ['24 часа', '72 часа', '7 дней'], correct: 1 },
      { question: 'Что идёт первым в обработке инструмента?', options: ['Стерилизация', 'Дезинфекция', 'ПСО'], correct: 1, explain: 'Порядок: дезинфекция → ПСО → стерилизация → хранение.' },
      { question: 'Когда мастер моет руки?', options: ['Утром', 'До и после клиента', 'По желанию'], correct: 1 },
    ],
  },
  {
    id: 'clients',
    title: 'Работа с клиентами',
    subtitle: 'Коммуникация, сервис и конфликтные ситуации',
    category: 'Сервис',
    cover: 'linear-gradient(135deg, #F1E4E4 0%, #DFC9C9 100%)',
    lessons: [
      { id: 'c1', title: 'Встреча и приветствие', minutes: 4, type: 'reading', content: [{ kind: 'p', text: 'Улыбка, зрительный контакт, предложение воды или чая. Клиент должен почувствовать заботу с первой секунды.' }] },
      { id: 'c2', title: 'Консультация и согласование', minutes: 5, type: 'reading', content: [{ kind: 'p', text: 'Уточняем ожидания, рассказываем о процедуре, согласуем стоимость до начала работы.' }] },
      { id: 'c3', title: 'Решение конфликтов', minutes: 6, type: 'reading', content: [{ kind: 'p', text: 'Сохраняем спокойствие, выслушиваем, предлагаем решение. При необходимости подключаем администратора.' }] },
      { id: 'c4', title: 'Прощание и обратная связь', minutes: 3, type: 'reading', content: [{ kind: 'p', text: 'Запись на следующий визит, благодарность, мягкая просьба об отзыве.' }] },
    ],
    quiz: [
      { question: 'Что делаем до начала процедуры?', options: ['Сразу приступаем', 'Согласовываем стоимость', 'Берём предоплату'], correct: 1 },
      { question: 'Как решать конфликт?', options: ['Спорить', 'Выслушать и предложить решение', 'Игнорировать'], correct: 1 },
    ],
  },
  {
    id: 'safety',
    title: 'Техника безопасности',
    subtitle: 'Электроприборы, химия и действия при ЧС',
    category: 'Обязательно',
    cover: 'linear-gradient(135deg, #E5E5EA 0%, #C7C7CE 100%)',
    lessons: [
      { id: 't1', title: 'Работа с электроприборами', minutes: 5, type: 'reading', content: [{ kind: 'p', text: 'Проверяем целостность шнура, не оставляем включённые приборы без присмотра.' }] },
      { id: 't2', title: 'Хранение химии', minutes: 6, type: 'reading', content: [{ kind: 'p', text: 'Только в закрытых ёмкостях, вдали от источников тепла. Маркировка обязательна.' }] },
      {
        id: 't3', title: 'Действия при ЧС', minutes: 7, type: 'checklist',
        content: [
          { kind: 'check', text: 'Сохранять спокойствие' },
          { kind: 'check', text: 'Эвакуировать клиента' },
          { kind: 'check', text: 'Сообщить администратору' },
        ],
      },
    ],
    quiz: [
      { question: 'Как хранится профхимия?', options: ['Открыто на полке', 'В закрытых маркированных ёмкостях', 'В холодильнике'], correct: 1 },
      { question: 'Можно ли оставить включённый прибор и выйти?', options: ['Да, если ненадолго', 'Нет, никогда', 'Только лампу'], correct: 1 },
    ],
  },
  {
    id: 'rules',
    title: 'Общие правила',
    subtitle: 'Рабочее время, дисциплина и внутренний распорядок',
    category: 'Регламент',
    cover: 'linear-gradient(135deg, #1A1A1F 0%, #2E2E36 100%)',
    lessons: [
      { id: 'r1', title: 'Рабочее время', minutes: 4, type: 'reading', content: [{ kind: 'p', text: 'Приходим за 15 минут до первого клиента. Опоздание фиксируется администратором.' }] },
      { id: 'r2', title: 'Поведение в студии', minutes: 5, type: 'reading', content: [{ kind: 'p', text: 'Тихая речь, отсутствие личных разговоров при клиенте, телефон на беззвучном.' }] },
      {
        id: 'r3', title: 'Финансовая дисциплина', minutes: 6, type: 'reading',
        content: [
          { kind: 'p', text: 'Все расчёты — через кассу.' },
          { kind: 'warn', text: 'Личные договорённости с клиентом запрещены.' },
        ],
      },
    ],
    quiz: [
      { question: 'За сколько приходим до клиента?', options: ['5 минут', '15 минут', '30 минут'], correct: 1 },
      { question: 'Клиент предлагает оплатить вам напрямую со скидкой. Что делаете?', options: ['Соглашаюсь', 'Вежливо отказываю, оплата через кассу', 'Беру половину наличными'], correct: 1 },
    ],
  },
];

/** Актуальные курсы (из базы, если там что-то сохранено). Меняется через setCourses. */
export let courses: Course[] = en ? coursesEn : defaultCourses;
export function setCourses(next: Course[]) {
  courses = next;
}

export const findCourse = (id: string) => courses.find((c) => c.id === id);

export const totalLessons = () => courses.reduce((s, c) => s + c.lessons.length, 0);
export const totalMinutes = () => courses.reduce((s, c) => s + c.lessons.reduce((a, l) => a + l.minutes, 0), 0);
export const courseMinutes = (c: Course) => c.lessons.reduce((a, l) => a + l.minutes, 0);
