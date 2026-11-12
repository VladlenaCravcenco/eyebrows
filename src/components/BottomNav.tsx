import { BookOpen, Home, Library, User } from 'lucide-react';
import { motion } from 'motion/react';
import { useNav, type Tab } from '../lib/nav';
import { haptic } from '../lib/telegram';

const items: { id: Tab; label: string; Icon: typeof Home }[] = [
  { id: 'home', label: 'Главная', Icon: Home },
  { id: 'courses', label: 'Курсы', Icon: BookOpen },
  { id: 'knowledge', label: 'База', Icon: Library },
  { id: 'profile', label: 'Профиль', Icon: User },
];

export function BottomNav({ active }: { active: Tab }) {
  const nav = useNav();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[480px] px-4 pt-2" style={{ paddingBottom: 'max(var(--safe-bottom), 16px)' }}>
      <nav
        className="pointer-events-auto flex items-center justify-around rounded-3xl border border-black/5 bg-white/80 px-3 py-3 backdrop-blur-xl"
        style={{ boxShadow: '0 8px 30px -10px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.03)' }}
      >
        {items.map(({ id, label, Icon }) => {
          const on = active === id;
          return (
            <button
              key={id}
              onClick={() => {
                if (!on) {
                  haptic.select();
                  nav.toTab(id);
                }
              }}
              className="flex flex-1 flex-col items-center gap-1 py-1"
              aria-current={on ? 'page' : undefined}
            >
              <div className="relative flex h-9 w-12 items-center justify-center">
                {on && (
                  <motion.div layoutId="tab-pill" className="absolute inset-0 rounded-full bg-black" transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
                )}
                <Icon size={18} strokeWidth={2} className={`relative transition-colors ${on ? 'text-white' : 'text-black/40'}`} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 500, color: on ? '#000' : 'var(--muted)' }}>{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
