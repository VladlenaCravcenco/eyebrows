/**
 * Язык интерфейса. Задаётся при сборке переменной VITE_LANG (ru по умолчанию, en — английский).
 * Так одну и ту же программу можно запускать для разных студий и стран.
 *
 *   L('Курсы', 'Courses')  → строка на нужном языке
 */
export const lang: 'ru' | 'en' = import.meta.env.VITE_LANG === 'en' ? 'en' : 'ru';
export const en = lang === 'en';
export const locale = en ? 'en-US' : 'ru-RU';

export const L = (ru: string, enText: string) => (en ? enText : ru);
