import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { actions, getState } from './lib/store';
import { initTelegram, telegramUser } from './lib/telegram';
import { startSync } from './lib/sync';
import { loadContent } from './content/live';
import './styles.css';
import { brand } from './content/brand';
import { lang, L } from './lib/i18n';

document.title = `${brand.name} — ${L('обучение мастеров', 'team training')}`;
document.documentElement.lang = lang;

initTelegram();

// Внутри Telegram отдельный вход не нужен — берём имя из профиля Telegram
const tg = telegramUser();
if (tg) {
  // другой аккаунт Telegram на этом телефоне — начинаем с чистого листа (прогресс подтянется с сервера)
  if (getState().user?.telegramId !== tg.telegramId) {
    actions.logout();
    actions.login(tg);
  }
}

void loadContent();
void startSync();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
