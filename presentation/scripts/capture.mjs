// Снимает экраны работающего приложения для видео-презентации.
//
// Английская продающая версия (Mentor):
//   в корне:  VITE_LANG=en VITE_BRAND_NAME=Mentor npx vite --port 5191
//   здесь:    APP_URL=http://localhost:5191 npm run screens
// Русская версия: LANG_UI=ru APP_URL=http://localhost:5173 npm run screens
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const APP = process.env.APP_URL || 'http://localhost:5191';
const RU = process.env.LANG_UI === 'ru';
const OUT = new URL('../public/screens/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

// надписи, по которым скрипт нажимает кнопки
const T = RU
  ? {
      name: 'Анна Соколова', phone: '+373 (78) 123-456',
      courses: 'Курсы', library: 'База', profile: 'Профиль', staff: 'Сотрудники', content: 'Тексты',
      course1: 'Онбординг мастера', lesson1: 'Добро пожаловать в студию', lesson2: 'Первый рабочий день',
      check1: 'Получить доступ в приложение', check2: 'Познакомиться с командой',
      takeQuiz: 'Пройти тест', wrong1: 'Дружеский тон', check: 'Проверить', next: 'Следующий вопрос',
      right2: 'Только в нейтральных тонах', right3: 'Подготовка рабочего места', finish: 'Завершить',
      doc: 'Санитарные нормы', member: 'Анна Соколова', heading: 'Наша философия', headingNew: 'Наша философия и ценности',
    }
  : {
      name: 'Emma Carter', phone: '+1 (415) 555-0142',
      courses: 'Courses', library: 'Library', profile: 'Profile', staff: 'Staff', content: 'Content',
      course1: 'Welcome aboard', lesson1: 'Welcome to the studio', lesson2: 'Your first day',
      check1: 'Get access to the app', check2: 'Meet the team',
      takeQuiz: 'Take the quiz', wrong1: 'A friendly, casual tone', check: 'Check', next: 'Next question',
      right2: 'Only neutral shades', right3: 'Setting up your station', finish: 'Finish',
      doc: 'Hygiene standards', member: 'Emma Carter', heading: 'Our philosophy', headingNew: 'Our philosophy & values',
    };

const day = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toLocaleDateString('sv-SE');
};

const learner = {
  user: { name: T.name, phone: T.phone },
  welcomed: true,
  lessonsDone: { onboarding: ['l1', 'l2', 'l3'], sanitary: ['s1', 's2'] },
  quiz: {},
  activeDays: [day(3), day(2), day(1), day(0)],
  joinedAt: new Date(Date.now() - 4 * 864e5).toISOString(),
};

const browser = await chromium.launch();

async function session(state, fn) {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    locale: RU ? 'ru-RU' : 'en-US',
  });
  await ctx.addInitScript((s) => {
    localStorage.setItem('eyebrows.progress.v1', JSON.stringify(s));
    localStorage.removeItem('eyebrows.content.v1');
    localStorage.removeItem('eyebrows.draft.v1');
  }, state);
  const page = await ctx.newPage();
  await page.goto(APP, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1200);
  const shot = async (name, { clean = true, wait = 1100 } = {}) => {
    await page.waitForTimeout(wait);
    await page.evaluate((c) => {
      // для «чистых» кадров прячем водяной знак (отдельная сцена показывает его специально)
      document.querySelectorAll('[aria-hidden][style*="svg+xml"]').forEach((el) => (el.style.display = c ? 'none' : ''));
      // служебные надписи демо-режима в видео не нужны
      const hideText = ['Выйти из демо', 'Exit demo', 'Выйти из аккаунта', 'Sign out'];
      for (const el of document.querySelectorAll('button, div')) {
        const t = el.textContent?.trim() ?? '';
        if (el.tagName === 'BUTTON' && hideText.includes(t)) el.style.visibility = 'hidden';
        if (el.tagName === 'DIV' && ['Демо-данные', 'Demo data'].includes(el.firstElementChild?.textContent ?? '')) el.style.display = 'none';
        if (el.tagName === 'BUTTON' && (t.startsWith('Кабинет руководителя') || t.startsWith('Manager dashboard'))) el.style.display = 'none';
      }
    }, clean);
    await page.screenshot({ path: `${OUT}${name}.png` });
    console.log('✓', name);
  };
  const tap = (text) => page.getByText(text).first().click();
  // кнопки ищем по точному тексту, чтобы «Check» не совпал с «checklist» в вопросе
  const btn = (text) => page.getByRole('button', { name: text, exact: true }).last().click();
  const tab = (name) => page.getByRole('button', { name, exact: true }).last().click();
  await fn(page, shot, tap, tab, btn);
  await ctx.close();
}

// --- Мастер ---
await session({ ...learner, welcomed: false }, async (page, shot) => {
  await shot('welcome', { wait: 1500 });
});

await session(learner, async (page, shot, tap, tab) => {
  await shot('home', { wait: 1500 });
  await tab(T.courses);
  await shot('courses');
  await tap(T.course1);
  await shot('course');
  await tap(T.lesson1);
  await shot('lesson');
  await shot('lesson-watermark', { clean: false, wait: 100 });
});

await session({ ...learner, lessonsDone: { onboarding: ['l1'] } }, async (page, shot, tap, tab) => {
  await tab(T.courses);
  await page.waitForTimeout(700);
  await tap(T.course1);
  await page.waitForTimeout(900);
  await tap(T.lesson2);
  await page.waitForTimeout(1200);
  await tap(T.check1);
  await tap(T.check2);
  await shot('checklist', { wait: 600 });
});

await session({ ...learner, lessonsDone: { onboarding: ['l1', 'l2', 'l3', 'l4'] } }, async (page, shot, tap, tab, btn) => {
  await tab(T.courses);
  await page.waitForTimeout(700);
  await tap(T.course1);
  await page.waitForTimeout(900);
  await tap(T.takeQuiz);
  await page.waitForTimeout(1200);
  await tap(T.wrong1);
  await btn(T.check);
  await shot('quiz', { wait: 900 });
  await btn(T.next);
  await page.waitForTimeout(700);
  await tap(T.right2);
  await btn(T.check);
  await page.waitForTimeout(500);
  await btn(T.next);
  await page.waitForTimeout(700);
  await tap(T.right3);
  await btn(T.check);
  await page.waitForTimeout(500);
  await btn(T.finish);
  await shot('result', { wait: 1000 });
});

await session(learner, async (page, shot, tap, tab) => {
  await tab(T.library);
  await shot('knowledge');
  await tap(T.doc);
  await shot('doc');
});

await session(learner, async (page, shot, tap, tab) => {
  await tab(T.profile);
  await shot('profile');
});

// --- Кабинет руководителя (демо-данные) ---
await session({ ...learner, demoAdmin: true }, async (page, shot, tap, tab) => {
  await shot('admin-team', { wait: 1500 });
  await tab(T.staff);
  await shot('admin-staff');
  await tap(T.member);
  await shot('admin-employee');
});

await session({ ...learner, demoAdmin: true }, async (page, shot, tap, tab) => {
  await tab(T.content);
  await shot('admin-texts');
  await tap(T.course1);
  await page.waitForTimeout(900);
  await tap(T.lesson1);
  await page.waitForTimeout(1200);
  const field = page.locator(`input[value="${T.heading}"]`);
  await field.click();
  await field.fill(T.headingNew);
  await page.locator('body').click({ position: { x: 20, y: 200 } });
  await shot('admin-editor', { wait: 900 });
});

await browser.close();
