import { useState } from 'react';
import { motion } from 'motion/react';
import { Book, ChevronRight, Package, Scale, Search, Shield, Sparkles, Wallet, X } from 'lucide-react';
import { knowledgeBase, type Doc } from '../content/knowledge';
import type { Block } from '../content/courses';
import { useNav } from '../lib/nav';
import { BackButton, ContentBlock, Watermark, stagger } from '../components/ui';

export const docIcons = { book: Book, shield: Shield, package: Package, sparkles: Sparkles, wallet: Wallet, scale: Scale };

const blockText = (b: Block) => (b.kind === 'list' ? b.items.join(' ') : b.text);
const docText = (d: Doc) =>
  [d.title, d.desc, d.tag, ...d.sections.flatMap((s) => [s.title, ...s.content.map(blockText)])].join(' ').toLowerCase();

export function KnowledgeScreen() {
  const nav = useNav();
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();
  const list = query ? knowledgeBase.filter((d) => docText(d).includes(query)) : knowledgeBase;

  return (
    <div className="px-5 pb-36">
      <div className="pt-safe">
        <h2 className="font-display pt-6" style={{ fontSize: 28 }}>База знаний</h2>
        <p className="mt-1" style={{ color: 'var(--muted)', fontSize: 13 }}>Регламенты, инструкции и справочные материалы</p>
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-2xl border border-black/5 bg-white px-4 py-3 focus-within:border-black/20">
        <Search size={16} className="text-black/40" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Найти документ или раздел"
          className="w-full bg-transparent outline-none placeholder:text-black/35"
          style={{ fontSize: 14 }}
        />
        {q && (
          <button onClick={() => setQ('')} aria-label="Очистить">
            <X size={16} className="text-black/40" />
          </button>
        )}
      </div>

      <div className="eyebrow mt-6">{query ? `Найдено: ${list.length}` : 'Категории'}</div>
      <div className="mt-3 space-y-2">
        {list.map((k, i) => {
          const Icon = docIcons[k.icon];
          return (
            <motion.button
              {...stagger(i)}
              key={k.id}
              onClick={() => nav.push({ name: 'doc', docId: k.id })}
              className="press flex w-full items-center gap-4 rounded-2xl border border-black/5 bg-white p-4 text-left"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-black/5">
                <Icon size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div style={{ fontWeight: 500, lineHeight: 1.3 }}>{k.title}</div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="shrink-0 rounded-full bg-black/5 px-2 py-0.5" style={{ fontSize: 10, color: 'var(--muted-2)' }}>{k.tag}</span>
                  <span className="truncate" style={{ fontSize: 12, color: 'var(--muted)' }}>{k.desc}</span>
                </div>
              </div>
              <ChevronRight size={16} className="shrink-0 text-black/30" />
            </motion.button>
          );
        })}
      </div>

      <div className="mt-6 rounded-3xl border border-black/5 p-5" style={{ background: 'linear-gradient(135deg, #F4EFE7, #FAF7F1)' }}>
        <div className="eyebrow" style={{ color: 'var(--gold)' }}>Подсказка</div>
        <p className="mt-2" style={{ lineHeight: 1.5 }}>Сверяйтесь с регламентом прямо во время работы — поиск ищет по всему тексту документов.</p>
      </div>
    </div>
  );
}

export function DocScreen({ docId }: { docId: string }) {
  const nav = useNav();
  const doc = knowledgeBase.find((d) => d.id === docId);
  if (!doc) return null;
  const Icon = docIcons[doc.icon];

  return (
    <div className="min-h-dvh px-5 pb-16">
      <Watermark />
      <div className="pt-safe">
        <div className="flex items-center gap-3 pt-5">
          <BackButton onClick={nav.back} />
          <span className="rounded-full bg-black/5 px-3 py-1" style={{ fontSize: 12, color: 'var(--muted-2)' }}>{doc.tag}</span>
        </div>
      </div>
      <motion.div {...stagger(0)} className="mt-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white">
        <Icon size={22} />
      </motion.div>
      <motion.h1 {...stagger(1)} className="font-display mt-4" style={{ fontSize: 30, lineHeight: 1.15 }}>{doc.title}</motion.h1>
      <motion.p {...stagger(2)} className="mt-2" style={{ color: 'var(--muted-2)' }}>{doc.desc}</motion.p>

      <div className="mt-8 space-y-8">
        {doc.sections.map((sec, i) => (
          <motion.section {...stagger(3 + i)} key={i}>
            <h2 style={{ fontWeight: 500, fontSize: 19 }}>{sec.title}</h2>
            <div className="mt-3 space-y-4">
              {sec.content.map((b, j) => (
                <ContentBlock key={j} block={b} />
              ))}
            </div>
          </motion.section>
        ))}
      </div>
    </div>
  );
}
