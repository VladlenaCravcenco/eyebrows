import { L } from '../lib/i18n';

/**
 * Название и тексты бренда. Для каждой студии задаются при сборке:
 *   VITE_BRAND_NAME — название (по умолчанию Eyebrows.curs)
 *   VITE_STUDIO     — название студии в подписи (необязательно)
 */
const name = import.meta.env.VITE_BRAND_NAME || 'Eyebrows.curs';
const studio = import.meta.env.VITE_STUDIO || (import.meta.env.VITE_BRAND_NAME ? '' : 'Atelier');

export const brand = {
  name,
  studio,
  tagline: studio
    ? L(`Платформа обучения мастеров студии красоты ${studio}.`, `The training platform for ${studio} masters.`)
    : L('Платформа обучения мастеров вашей студии.', 'Training for the masters of your studio.'),
  phonePrefix: import.meta.env.VITE_PHONE_PREFIX || '+373',
};
