import { useEffect, useRef, useState, type ReactNode } from 'react';
import { L, locale } from '../../lib/i18n';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import type { Block } from '../../content/courses';
import { contentMeta } from '../../content/live';
import { ask, inTelegram, tell } from '../../lib/telegram';
import { BackButton } from '../../components/ui';
import { blankBlock, discard, publish, useDraft } from './draft';

/* ---------- Каркас экрана редактора ---------- */

export function EditorPage({ title, onBack, children, right, tab }: { title: string; onBack?: () => void; children: ReactNode; right?: ReactNode; tab?: boolean }) {
  const { dirty } = useDraft();
  return (
    <div className="flex min-h-dvh flex-col" style={{ background: '#FAFAF8' }}>
      <div className="pt-safe sticky top-0 z-20 border-b border-black/5 bg-white/85 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-5 py-3">
          {onBack && <BackButton onClick={onBack} />}
          <h2 className="min-w-0 flex-1 truncate" style={{ fontWeight: 500, fontSize: 17 }}>{title}</h2>
          {right}
        </div>
      </div>
      {/* во вкладке снизу меню — оставляем под ним место */}
      <div className={`flex-1 space-y-4 px-5 pt-5 ${tab && !dirty ? 'pb-36' : 'pb-10'}`}>{children}</div>
      <PublishBar />
    </div>
  );
}

export function Card({ children, title, action }: { children: ReactNode; title?: string; action?: ReactNode }) {
  return (
    <section className="rounded-3xl border border-black/5 bg-white p-4">
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between">
          {title && <div className="eyebrow">{title}</div>}
          {action}
        </div>
      )}
      <div className="space-y-3">{children}</div>
    </section>
  );
}

/* ---------- Поля ---------- */

export function Field({ label, value, onChange, placeholder, multiline, type }: {
  label?: string;
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  type?: 'number';
}) {
  return (
    <label className="block">
      {label && <div className="mb-1.5" style={{ fontSize: 12, color: 'var(--muted-2)' }}>{label}</div>}
      {multiline ? (
        <AutoTextarea value={String(value)} onChange={onChange} placeholder={placeholder} />
      ) : (
        <input
          type={type ?? 'text'}
          inputMode={type === 'number' ? 'numeric' : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none placeholder:text-black/30 focus:border-black"
          style={{ fontSize: 16 }}
        />
      )}
    </label>
  );
}

/** Поле, которое растёт вместе с текстом (шрифт 16px — иначе iPhone зумит страницу) */
function AutoTextarea({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      rows={2}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full resize-none overflow-hidden rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none placeholder:text-black/30 focus:border-black"
      style={{ fontSize: 16, lineHeight: 1.45 }}
    />
  );
}

export function Chips<T extends string>({ options, value, onChange, render }: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  render?: (v: T) => ReactNode;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`rounded-full border px-3.5 py-2 transition-colors ${value === o ? 'border-black bg-black text-white' : 'border-black/10 bg-white text-black/70'}`}
          style={{ fontSize: 13 }}
        >
          {render ? render(o) : o}
        </button>
      ))}
    </div>
  );
}

/** Кнопки вверх / вниз / удалить для элемента списка */
export function RowTools({ onUp, onDown, onDelete, confirmText, stacked }: {
  onUp?: () => void;
  onDown?: () => void;
  onDelete?: () => void;
  confirmText?: string;
  /** стрелки столбиком — экономит ширину в списках */
  stacked?: boolean;
}) {
  const btn = 'flex h-8 w-8 items-center justify-center rounded-full bg-black/5 disabled:opacity-25';
  const arrows = (onUp || onDown) && (
    <div className={`flex gap-1 ${stacked ? 'flex-col' : ''}`}>
      <button type="button" className={stacked ? btn.replace('h-8', 'h-7') : btn} disabled={!onUp} onClick={onUp} aria-label={L('Выше', 'Up')}><ChevronUp size={15} /></button>
      <button type="button" className={stacked ? btn.replace('h-8', 'h-7') : btn} disabled={!onDown} onClick={onDown} aria-label={L('Ниже', 'Down')}><ChevronDown size={15} /></button>
    </div>
  );
  return (
    <div className="flex shrink-0 items-center gap-1">
      {arrows}
      {onDelete && (
        <button
          type="button"
          className={btn}
          aria-label={L('Удалить', 'Delete')}
          onClick={async () => {
            if (!confirmText || (await ask(confirmText))) onDelete();
          }}
        >
          <Trash2 size={14} className="text-red-700" />
        </button>
      )}
    </div>
  );
}

export function AddButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="press flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-black/20 bg-white px-4 py-3"
      style={{ fontSize: 14, fontWeight: 500 }}
    >
      <Plus size={16} /> {children}
    </button>
  );
}

/* ---------- Блоки текста (урок, раздел базы знаний) ---------- */

export const BLOCK_LABELS: Record<Block['kind'], string> = {
  h: L('Подзаголовок', 'Heading'),
  p: L('Текст', 'Text'),
  tip: L('✨ Важно', '✨ Important'),
  warn: L('⚠️ Нельзя', '⚠️ Never'),
  list: L('Список', 'List'),
  check: L('☑️ Пункт чек-листа', '☑️ Checklist item'),
};
const KINDS = Object.keys(BLOCK_LABELS) as Block['kind'][];

export function BlocksEditor({ blocks, onChange }: { blocks: Block[]; onChange: (next: Block[]) => void }) {
  const [adding, setAdding] = useState(false);
  const set = (i: number, b: Block) => onChange(blocks.map((x, j) => (j === i ? b : x)));
  const swap = (i: number, d: -1 | 1) => {
    const next = [...blocks];
    [next[i], next[i + d]] = [next[i + d]!, next[i]!];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {blocks.map((b, i) => (
        <div key={i} className="rounded-2xl border border-black/5 p-3" style={{ background: b.kind === 'warn' ? '#FDF5F5' : b.kind === 'tip' ? 'var(--cream)' : '#fff' }}>
          <div className="mb-2 flex items-center gap-2">
            <select
              value={b.kind}
              onChange={(e) => {
                const kind = e.target.value as Block['kind'];
                const text = b.kind === 'list' ? b.items.join('\n') : b.text;
                set(i, kind === 'list' ? { kind, items: text.split('\n') } : { kind, text });
              }}
              className="min-w-0 flex-1 rounded-full bg-black/5 px-3 py-1.5 outline-none"
              style={{ fontSize: 13 }}
            >
              {KINDS.map((k) => <option key={k} value={k}>{BLOCK_LABELS[k]}</option>)}
            </select>
            <RowTools
              onUp={i > 0 ? () => swap(i, -1) : undefined}
              onDown={i < blocks.length - 1 ? () => swap(i, 1) : undefined}
              onDelete={() => onChange(blocks.filter((_, j) => j !== i))}
              confirmText={(b.kind === 'list' ? b.items.join('') : b.text).trim() ? L('Удалить этот блок?', 'Delete this block?') : undefined}
            />
          </div>
          {b.kind === 'list' ? (
            <Field multiline value={b.items.join('\n')} onChange={(v) => set(i, { kind: 'list', items: v.split('\n') })} placeholder={L('Каждый пункт — с новой строки', 'One item per line')} />
          ) : (
            <Field
              multiline={b.kind !== 'h'}
              value={b.text}
              onChange={(v) => set(i, { kind: b.kind, text: v })}
              placeholder={b.kind === 'h' ? L('Подзаголовок', 'Heading') : b.kind === 'check' ? L('Что нужно сделать', 'What to do') : L('Текст', 'Text')}
            />
          )}
        </div>
      ))}

      {adding ? (
        <div className="grid grid-cols-2 gap-2">
          {KINDS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => {
                onChange([...blocks, blankBlock(k)]);
                setAdding(false);
              }}
              className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-left"
              style={{ fontSize: 13 }}
            >
              {BLOCK_LABELS[k]}
            </button>
          ))}
        </div>
      ) : (
        <AddButton onClick={() => setAdding(true)}>{L('Добавить блок', 'Add block')}</AddButton>
      )}
    </div>
  );
}

/* ---------- Панель сохранения ---------- */

export function PublishBar() {
  const { dirty } = useDraft();
  const [busy, setBusy] = useState(false);
  return (
    <AnimatePresence>
      {dirty && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="pb-safe sticky bottom-0 z-30 border-t border-black/5 bg-white/90 px-5 pt-3 backdrop-blur-xl"
        >
          <p className="mb-2 text-center" style={{ fontSize: 12, color: 'var(--muted-2)' }}>
            {L('Есть несохранённые изменения — девочки их пока не видят', 'Unsaved changes — your team doesn’t see them yet')}
          </p>
          <div className="flex gap-2">
            <button
              disabled={busy}
              onClick={async () => {
                if (await ask(L('Отменить все несохранённые изменения?', 'Discard all unsaved changes?'))) discard();
              }}
              className="rounded-2xl border border-black/10 bg-white px-4 py-3.5"
              style={{ fontSize: 14, fontWeight: 500 }}
            >
              {L('Отменить', 'Discard')}
            </button>
            <button
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await publish();
                  await tell(inTelegram ? L('Сохранено! Девочки увидят изменения при следующем открытии.', 'Saved! Your team will see the changes next time they open the app.') : L('Сохранено (демо: только на этом устройстве).', 'Saved (demo: this device only).'));
                } catch (e) {
                  await tell((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
              className="flex-1 rounded-2xl bg-black px-4 py-3.5 text-white disabled:opacity-50"
              style={{ fontSize: 14, fontWeight: 500 }}
            >
              {busy ? L('Сохраняем…', 'Saving…') : L('Сохранить для всех', 'Publish for everyone')}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function LastSaved() {
  const m = contentMeta();
  if (!m.updatedAt) return null;
  const when = new Date(m.updatedAt).toLocaleString(locale, { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
  return (
    <p className="text-center" style={{ fontSize: 12, color: 'var(--muted)' }}>
      {L('Последнее сохранение', 'Last saved')}: {when}{m.updatedBy ? ` · ${m.updatedBy}` : ''}
    </p>
  );
}
