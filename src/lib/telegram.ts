/**
 * Тонкая обёртка над Telegram Mini App SDK.
 * Если приложение открыто в обычном браузере — все функции просто ничего не делают.
 */
import { L } from './i18n';
type TgUser = { id: number; first_name: string; last_name?: string; username?: string };

type WebApp = {
  initData: string;
  initDataUnsafe: { user?: TgUser };
  ready(): void;
  expand(): void;
  setHeaderColor(c: string): void;
  setBackgroundColor(c: string): void;
  disableVerticalSwipes?: () => void;
  BackButton: { show(): void; hide(): void; onClick(cb: () => void): void; offClick(cb: () => void): void };
  showConfirm?: (message: string, cb: (ok: boolean) => void) => void;
  openTelegramLink?: (url: string) => void;
  showAlert?: (message: string, cb?: () => void) => void;
  HapticFeedback?: {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
    notificationOccurred(type: 'error' | 'success' | 'warning'): void;
    selectionChanged(): void;
  };
};

const wa: WebApp | undefined = (window as unknown as { Telegram?: { WebApp?: WebApp } }).Telegram?.WebApp;

/** true, если открыто внутри Telegram */
export const inTelegram = !!wa?.initData;

/** Подписанные Telegram данные — сервер по ним проверяет, кто зашёл */
export const initData = wa?.initData ?? '';

export function initTelegram() {
  if (!inTelegram || !wa) return;
  wa.ready();
  wa.expand();
  wa.setHeaderColor('#ffffff');
  wa.setBackgroundColor('#ffffff');
  wa.disableVerticalSwipes?.();
  document.documentElement.classList.add('tg');
}

export function telegramUser() {
  const u = wa?.initDataUnsafe.user;
  if (!inTelegram || !u) return null;
  return { name: [u.first_name, u.last_name].filter(Boolean).join(' '), telegramId: u.id };
}

export function setBackButton(visible: boolean, onClick: () => void) {
  if (!inTelegram || !wa) return () => {};
  if (visible) {
    wa.BackButton.show();
    wa.BackButton.onClick(onClick);
  } else wa.BackButton.hide();
  return () => wa.BackButton.offClick(onClick);
}

export const haptic = {
  tap: () => wa?.HapticFeedback?.impactOccurred('light'),
  select: () => wa?.HapticFeedback?.selectionChanged(),
  success: () => wa?.HapticFeedback?.notificationOccurred('success'),
  error: () => wa?.HapticFeedback?.notificationOccurred('error'),
};

/** Подтверждение: в Telegram — родное окно, в браузере — confirm */
export function ask(message: string): Promise<boolean> {
  if (inTelegram && wa?.showConfirm) return new Promise((r) => wa.showConfirm!(message, r));
  return Promise.resolve(window.confirm(message));
}

export function tell(message: string): Promise<void> {
  if (inTelegram && wa?.showAlert) return new Promise((r) => wa.showAlert!(message, r));
  window.alert(message);
  return Promise.resolve();
}

/** Поделиться ссылкой: в Telegram — выбор чата, в браузере — системное меню или копирование */
export async function shareLink(url: string, text: string) {
  if (inTelegram && wa?.openTelegramLink) {
    wa.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`);
    return;
  }
  if (navigator.share) {
    await navigator.share({ url, text }).catch(() => {});
    return;
  }
  await navigator.clipboard?.writeText(`${text} ${url}`);
  await tell(L('Ссылка скопирована', 'Link copied'));
}
