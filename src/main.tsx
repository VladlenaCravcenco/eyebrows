import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { actions, getState } from './lib/store';
import { initTelegram, telegramUser } from './lib/telegram';
import { startSync } from './lib/sync';
import './styles.css';

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

void startSync();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
