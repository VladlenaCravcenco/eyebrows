import type { CSSProperties, ReactNode } from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import { C, H, Mark, Phone, Reveal, Scene, Sub, TelegramChat, fontFamily, useIn, useSpring } from './kit';

const ease = Easing.bezier(0.22, 1, 0.36, 1);

/** Вертикальный кадр (9:16)? */
const useV = () => {
  const { width, height } = useVideoConfig();
  return height > width;
};

/** Высота телефона в сценах «текст + телефон» */
const usePhoneH = () => (useV() ? 1240 : 880);

/**
 * Раскладка «текст + телефон».
 * 16:9 — текст слева, телефон справа. 9:16 — текст сверху по центру, телефон крупно снизу.
 */
function Split({ text, phone, flip = false, textWidth = 760 }: { text: ReactNode; phone: ReactNode; flip?: boolean; textWidth?: number }) {
  const v = useV();
  if (v)
    return (
      <AbsoluteFill style={{ flexDirection: 'column', alignItems: 'center', paddingTop: 170 }}>
        <div style={{ width: 920, textAlign: 'center' }}>{text}</div>
        <div style={{ marginTop: 80 }}>{phone}</div>
      </AbsoluteFill>
    );
  return (
    <AbsoluteFill style={{ flexDirection: flip ? 'row-reverse' : 'row', alignItems: 'center', justifyContent: 'center', gap: 160 }}>
      <div style={{ width: textWidth }}>{text}</div>
      {phone}
    </AbsoluteFill>
  );
}


/* ---------- 1. Проблема ---------- */
function Problem({ total }: { total: number }) {
  const sz = useV() ? 96 : 104;
  return (
    <Scene bg={C.black} total={total}>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', gap: 18 }}>
        <Reveal at={6}><H color="#6e6e73" size={sz}>Every new hire.</H></Reveal>
        <Reveal at={36}><H color="#a1a1a6" size={sz}>Same questions.</H></Reveal>
        <Reveal at={66}><H color="#ffffff" size={sz}>A hundred times.</H></Reveal>
      </AbsoluteFill>
    </Scene>
  );
}

/* ---------- 2. Логотип ---------- */
function Logo({ total }: { total: number }) {
  const s = useSpring(4);
  return (
    <Scene bg={C.black} total={total}>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${0.6 + s * 0.4})`, opacity: s }}>
          <Mark size={150} invert />
        </div>
        <Reveal at={20} style={{ marginTop: 44 }}>
          <H color="#fff" size={140}>Mentor</H>
        </Reveal>
        <Reveal at={44} style={{ marginTop: 22 }}>
          <Sub color="#86868b" size={40}>Team training for beauty studios. Right in Telegram.</Sub>
        </Reveal>
      </AbsoluteFill>
    </Scene>
  );
}

/* ---------- 3. Telegram ---------- */
function Telegram({ total }: { total: number }) {
  const f = useCurrentFrame();
  const rise = useIn(0, 40);
  const ph = usePhoneH();
  return (
    <Scene bg={C.light} total={total}>
      <Split
        textWidth={780}
        text={
          <>
            <Reveal at={8}><H size={92}>No app to install.</H></Reveal>
            <Reveal at={26}><H size={92}>No passwords.</H></Reveal>
            <Reveal at={44}><H size={92} color="#2481CC">Just Telegram.</H></Reveal>
            <Reveal at={70} style={{ marginTop: 36 }}>
              <Sub>A new hire taps Start — and the training is already in their hands.</Sub>
            </Reveal>
          </>
        }
        phone={
          <div style={{ transform: `translateY(${(1 - rise) * 120}px)`, opacity: rise }}>
            <Phone height={ph}>
              {/* чат нарисован под телефон высотой 880 — в вертикали масштабируем целиком */}
              <div style={{ width: (880 * 390) / 844, height: 880, transform: `scale(${ph / 880})`, transformOrigin: '0 0' }}>
                <TelegramChat t={f / total} />
              </div>
            </Phone>
          </div>
        }
      />
    </Scene>
  );
}

/* ---------- Сцена «заголовок + один телефон» ---------- */
function Feature({ total, src, title, sub, bg = C.light, flip = false, accent }: {
  total: number;
  src: string;
  title: React.ReactNode;
  sub: string;
  bg?: string;
  flip?: boolean;
  accent?: string;
}) {
  const f = useCurrentFrame();
  const rise = useIn(0, 40);
  const drift = interpolate(f, [0, total], [20, -20]);
  const dark = bg === C.black;
  const ph = usePhoneH();
  return (
    <Scene bg={bg} total={total}>
      <Split
        flip={flip}
        text={
          <>
            <Reveal at={10}><H size={88} color={dark ? '#fff' : accent ?? C.ink}>{title}</H></Reveal>
            <Reveal at={34} style={{ marginTop: 32 }}><Sub>{sub}</Sub></Reveal>
          </>
        }
        phone={
          <div style={{ transform: `translateY(${(1 - rise) * 140 + drift}px)`, opacity: rise }}>
            <Phone src={src} height={ph} />
          </div>
        }
      />
    </Scene>
  );
}

/* ---------- Веер из трёх телефонов ---------- */
function Trio({ total, srcs, title, sub, bg = C.light }: { total: number; srcs: [string, string, string]; title: React.ReactNode; sub: string; bg?: string }) {
  const s = useSpring(10);
  const dark = bg === C.black;
  const f = useCurrentFrame();
  const drift = interpolate(f, [0, total], [0, -30]);
  const v = useV();
  const ph = v ? 1000 : 820;
  return (
    <Scene bg={bg} total={total}>
      <AbsoluteFill style={{ alignItems: 'center', paddingTop: v ? 170 : 70 }}>
        <Reveal at={4}><H color={dark ? '#fff' : C.ink} size={88} style={{ textAlign: 'center', maxWidth: v ? 920 : undefined }}>{title}</H></Reveal>
        <Reveal at={22} style={{ marginTop: 18 }}><Sub style={{ textAlign: 'center', maxWidth: v ? 900 : undefined }}>{sub}</Sub></Reveal>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-end' }}>
        <div style={{ position: 'relative', width: v ? 1080 : 1400, height: v ? 1040 : 760, transform: `translateY(${(1 - s) * 400 + (v ? 200 : 250) + drift}px)` }}>
          {srcs.map((src, i) => {
            const offset = (i - 1) * (v ? 340 : 420) * s;
            const rot = (i - 1) * 5 * s;
            return (
              <div key={src} style={{ position: 'absolute', left: '50%', top: i === 1 ? 0 : 50, transform: `translateX(calc(-50% + ${offset}px)) rotate(${rot}deg)`, zIndex: i === 1 ? 2 : 1 }}>
                <Phone src={src} height={ph} />
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Scene>
  );
}

/* ---------- Тест → результат ---------- */
function QuizScene({ total }: { total: number }) {
  const rise = useIn(0, 40);
  const swap = useIn(Math.round(total * 0.48), 26);
  const ph = usePhoneH();
  const v = useV();
  return (
    <Scene bg={C.light} total={total}>
      <Split
        text={
        <div style={{ position: 'relative', height: v ? 330 : 380, width: v ? undefined : 820 }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 1 - swap }}>
            <Reveal at={10}><H size={88}>Quick quizzes.</H></Reveal>
            <Reveal at={30} style={{ marginTop: 32 }}><Sub>Mistakes are flagged instantly — with the reason why.</Sub></Reveal>
          </div>
          <div style={{ position: 'absolute', inset: 0, opacity: swap, filter: `blur(${(1 - swap) * 12}px)` }}>
            <H size={84}>Every win feels like one.</H>
            <Sub style={{ marginTop: 32 }}>Confetti, progress and achievements. Learning that feels good.</Sub>
          </div>
        </div>
        }
        phone={
        <div style={{ position: 'relative', transform: `translateY(${(1 - rise) * 140}px)`, opacity: rise }}>
          <Phone src="quiz" height={ph} />
          <div style={{ position: 'absolute', inset: 0, opacity: swap }}>
            <Phone src="result" height={ph} shadow={false} />
          </div>
        </div>
        }
      />
    </Scene>
  );
}

/* ---------- Пауза-переход ---------- */
function Interstitial({ total, text }: { total: number; text: string }) {
  return (
    <Scene bg={C.black} total={total}>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Reveal at={6}><H color="#fff" size={useV() ? 100 : 110} style={{ textAlign: 'center', maxWidth: 940 * (useV() ? 1 : 2) }}>{text}</H></Reveal>
      </AbsoluteFill>
    </Scene>
  );
}

/* ---------- Редактор: список → правка с панелью сохранения ---------- */
function EditorScene({ total }: { total: number }) {
  const rise = useIn(0, 40);
  const swap = useIn(Math.round(total * 0.42), 24);
  const zoom = interpolate(useCurrentFrame(), [total * 0.55, total], [1, 1.05], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
  const ph = usePhoneH();
  const v = useV();
  return (
    <Scene bg={C.light} total={total}>
      <Split
        textWidth={780}
        text={
        <>
          <Reveal at={10}><H size={88}>Edit content in a minute.</H></Reveal>
          <Reveal at={34} style={{ marginTop: 32 }}><Sub>Lessons, quizzes and policies — edited right in the bot. No developer needed.</Sub></Reveal>
          <Reveal at={Math.round(total * 0.5)} style={{ marginTop: 40 }}>
            <div style={{ display: 'inline-block', background: '#000', color: '#fff', borderRadius: 18, padding: '18px 30px', fontSize: 30, fontWeight: 500 }}>
              Publish for everyone
            </div>
          </Reveal>
        </>
        }
        phone={
        <div style={{ position: 'relative', transform: `translateY(${(1 - rise) * 140}px) scale(${v ? 1 : zoom})`, transformOrigin: '50% 100%', opacity: rise }}>
          <Phone src="admin-texts" height={ph} />
          <div style={{ position: 'absolute', inset: 0, opacity: swap }}>
            <Phone src="admin-editor" height={ph} shadow={false} />
          </div>
        </div>
        }
      />
    </Scene>
  );
}

/* ---------- Защита: крупный план водяного знака ---------- */
function Protection({ total }: { total: number }) {
  const f = useCurrentFrame();
  const zoom = interpolate(f, [10, total], [1, 1.6], { extrapolateLeft: 'clamp', easing: ease });
  const rise = useIn(0, 30);
  const v = useV();
  return (
    <Scene bg={C.black} total={total}>
      <Split
        textWidth={640}
        text={
        <>
          <Reveal at={8}><H color="#fff">Protected.</H></Reveal>
          <Reveal at={30} style={{ marginTop: 32 }}><Sub color="#a1a1a6">Copying is off. Every screen carries the master’s name. Your know-how stays in the studio.</Sub></Reveal>
          <Reveal at={60} style={{ marginTop: 40 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, border: '1.5px solid rgba(255,255,255,0.22)', borderRadius: 999, padding: '14px 26px', color: '#d2d2d7', fontSize: 26, fontWeight: 500, transform: 'rotate(-4deg)', whiteSpace: 'nowrap' }}>
              <span style={{ opacity: 0.55, fontSize: 20, letterSpacing: '0.08em' }}>WATERMARK</span> Emma Carter · +1 (415) 555-0142
            </div>
          </Reveal>
        </>
        }
        phone={
        <div style={{ width: v ? 860 : 640, height: v ? 1060 : 900, overflow: 'hidden', borderRadius: 60, opacity: rise, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ transform: `scale(${zoom})`, transformOrigin: '50% 38%' }}>
            <Phone src="lesson-watermark" height={v ? 1040 : 880} shadow={false} dark />
          </div>
        </div>
        }
      />
    </Scene>
  );
}

/* ---------- Финал ---------- */
function Lineup({ total }: { total: number }) {
  const f = useCurrentFrame();
  const v = useV();
  const slide = interpolate(f, [0, total], v ? [700, -700] : [180, -180]);
  const srcs = ['knowledge', 'course', 'home', 'admin-team', 'result'];
  const s = useSpring(0);
  return (
    <Scene bg={C.light} total={total}>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', gap: 56, transform: `translateX(${slide}px) translateY(${(1 - s) * 200}px)`, opacity: s }}>
          {srcs.map((src, i) => (
            <div key={src} style={{ transform: `translateY(${i % 2 ? 60 : -20}px)` }}>
              <Phone src={src} height={v ? 1100 : 760} />
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </Scene>
  );
}

function Finale({ total }: { total: number }) {
  const s = useSpring(6);
  return (
    <Scene bg={C.black} total={total} fadeIn={20}>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${0.7 + s * 0.3})`, opacity: s }}>
          <Mark size={130} invert />
        </div>
        <Reveal at={18} style={{ marginTop: 40 }}><H color="#fff" size={130}>Mentor</H></Reveal>
        <Reveal at={40} style={{ marginTop: 22 }}><Sub color="#a1a1a6" size={40}>Explain once. Train everyone.</Sub></Reveal>
        <Reveal at={70} style={{ marginTop: 70 }}>
          <div style={{ fontFamily, fontSize: 30, fontWeight: 500, color: '#fff', border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: 999, padding: '16px 34px', whiteSpace: 'nowrap' }}>
            Launch it in your studio in one day
          </div>
        </Reveal>
      </AbsoluteFill>
    </Scene>
  );
}

/* ---------- Для кого: профессии ---------- */
const PROFESSIONS = ['Brow artists', 'Nail technicians', 'Lash artists', 'Hairstylists', 'Barbers', 'Cosmetologists', 'Massage therapists', 'Makeup artists', 'Tattoo artists', 'Spa therapists'];

function Professions({ total }: { total: number }) {
  const v = useV();
  const f = useCurrentFrame();
  return (
    <Scene bg={C.light} total={total}>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: v ? '0 60px' : '0 160px' }}>
        <Reveal at={4}><H size={v ? 104 : 110} style={{ textAlign: 'center' }}>Made for masters.</H></Reveal>
        <Reveal at={20} style={{ marginTop: 22 }}><Sub size={v ? 36 : 38} style={{ textAlign: 'center' }}>For every studio where skills are passed on by hand.</Sub></Reveal>
        <div style={{ marginTop: v ? 80 : 70, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 18, maxWidth: v ? 960 : 1500 }}>
          {PROFESSIONS.map((p, i) => {
            const t = interpolate(f, [34 + i * 5, 52 + i * 5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
            return (
              <div
                key={p}
                style={{
                  opacity: t,
                  transform: `translateY(${(1 - t) * 24}px) scale(${0.92 + t * 0.08})`,
                  background: i % 3 === 0 ? '#1D1D1F' : '#fff',
                  color: i % 3 === 0 ? '#fff' : C.ink,
                  border: '1.5px solid rgba(0,0,0,0.08)',
                  borderRadius: 999,
                  padding: v ? '18px 30px' : '20px 34px',
                  fontSize: v ? 34 : 36,
                  fontWeight: 500,
                  letterSpacing: '-0.01em',
                }}
              >
                {p}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Scene>
  );
}

/* ---------- Польза для владельца ---------- */
const BENEFITS = [
  ['01', 'Explain once.', 'Write it down once — every new hire learns it the same way. No more hundredth repeat.'],
  ['02', 'One standard.', 'Hygiene, service and house rules — identical for every master, every shift.'],
  ['03', 'See who’s ready.', 'Know who finished, who’s stuck and who hasn’t started — before they meet a client.'],
];

function Benefits({ total }: { total: number }) {
  const v = useV();
  const f = useCurrentFrame();
  return (
    <Scene bg={C.black} total={total}>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: v ? '0 70px' : 0 }}>
        <Reveal at={4}><H color="#fff" size={v ? 92 : 96} style={{ textAlign: 'center' }}>What changes for you.</H></Reveal>
        <div style={{ marginTop: v ? 70 : 80, display: 'flex', flexDirection: v ? 'column' : 'row', gap: v ? 28 : 32 }}>
          {BENEFITS.map(([n, title, text], i) => {
            const t = interpolate(f, [26 + i * 14, 50 + i * 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
            return (
              <div
                key={n}
                style={{
                  opacity: t,
                  transform: `translateY(${(1 - t) * 40}px)`,
                  filter: `blur(${(1 - t) * 10}px)`,
                  width: v ? 940 : 500,
                  background: '#1C1C1E',
                  borderRadius: 36,
                  padding: v ? '40px 46px' : '46px 44px',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ fontSize: 26, fontWeight: 600, color: '#6e6e73', letterSpacing: '0.04em' }}>{n}</div>
                <div style={{ marginTop: v ? 14 : 22, fontSize: v ? 52 : 50, fontWeight: 600, color: '#fff', letterSpacing: '-0.03em' }}>{title}</div>
                <div style={{ marginTop: 14, fontSize: v ? 30 : 28, lineHeight: 1.35, color: '#a1a1a6', fontWeight: 500 }}>{text}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Scene>
  );
}

/* ---------- Таймлайн ---------- */
/** Общий уровень звуков (кроме ударов — они и так громкие). Подобран, чтобы на телефоне было хорошо слышно без перегрузки. */
const GAIN = 1.6;

/** Звук: [кадр от начала сцены, файл из public/sfx, громкость] */
type Cue = [number, string, number];
const T = (f: number, v = 0.45): Cue => [f, 'tick', v];

const chips: Cue[] = PROFESSIONS.map((_, i) => [34 + i * 5, `pop${(i % 3) + 1}`, 0.3]);
const typing: Cue[] = [62, 66, 71, 75, 79].map((f, i) => [f, `key${(i % 3) + 1}`, 0.4]);

const scenes: [number, (p: { total: number }) => JSX.Element, Cue[]][] = [
  [140, Problem, [T(6, 0.5), T(36, 0.55), T(66, 0.6), [124, 'whoosh-soft', 0.35]]],
  [120, Logo, [[2, 'boom', 0.8], [18, 'shimmer', 0.45], T(44, 0.35)]],
  [160, Professions, [[0, 'whoosh', 0.4], T(4), T(20, 0.3), ...chips]],
  [190, Telegram, [[0, 'swipe', 0.5], T(8), T(26), T(44, 0.5), [36, 'ding', 0.55], [76, 'pop2', 0.35], [156, 'click', 0.6]]],
  [160, ({ total }) => <Feature total={total} src="home" title="Picks up where they left off." sub="Progress, streaks and quizzes — right on the home screen." />, [[0, 'swipe', 0.5], T(10), T(34, 0.3)]],
  [190, ({ total }) => <Trio total={total} srcs={['course', 'lesson', 'checklist']} title="Lessons in 4 minutes." sub="Short and to the point. Checklists can’t be skipped — every item must be ticked." />, [T(4), [10, 'whoosh', 0.5], T(22, 0.3)]],
  [220, QuizScene, [[0, 'swipe', 0.5], T(10), T(30, 0.3), [40, 'error', 0.4], [52, 'pop1', 0.3], [106, 'success', 0.6], [108, 'confetti', 0.55], T(106, 0.35)]],
  [150, ({ total }) => <Feature total={total} src="doc" flip title="Your playbook, always at hand." sub="A searchable knowledge base — right at the workstation." />, [[0, 'swipe', 0.5], T(10), T(34, 0.3), [108, 'riser', 0.3]]],
  [80, ({ total }) => <Interstitial total={total} text="And for the owner." />, [[4, 'boom', 0.3], T(6, 0.5)]],
  [190, ({ total }) => <Trio total={total} srcs={['admin-staff', 'admin-team', 'admin-employee']} title="Your whole team. At a glance." sub="Who’s done, who’s stuck, who hasn’t opened it in days." />, [T(4), [10, 'whoosh', 0.5], T(22, 0.3)]],
  [200, EditorScene, [[0, 'swipe', 0.5], T(10), T(34, 0.3), ...typing, [84, 'pop1', 0.35], [100, 'click', 0.55]]],
  [150, Protection, [[8, 'lock', 0.6], [10, 'whoosh-long', 0.25], T(30, 0.3), [60, 'pop3', 0.3]]],
  [210, Benefits, [[0, 'whoosh-soft', 0.35], T(4), [26, 'thock', 0.55], [40, 'thock', 0.55], [54, 'thock', 0.6]]],
  [150, Lineup, [[0, 'whoosh-long', 0.55]]],
  [170, Finale, [[4, 'boom', 0.85], [16, 'shimmer', 0.5], T(40, 0.35), [70, 'success', 0.3]]],
];

export const KEYNOTE_FRAMES = scenes.reduce((s, [d]) => s + d, 0);

/** Тихая атмосферная подложка: вступает с логотипом, плавно уходит в конце */
function Pad({ from }: { from: number }) {
  const dur = KEYNOTE_FRAMES - from;
  return (
    <Sequence from={from} durationInFrames={dur}>
      <Audio
        src={staticFile('sfx/pad.wav')}
        volume={(f) => interpolate(f, [0, 75, dur - 100, dur], [0, 0.24, 0.24, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
      />
    </Sequence>
  );
}

export const Keynote = () => {
  let from = 0;
  const visuals: JSX.Element[] = [];
  const sounds: JSX.Element[] = [];
  scenes.forEach(([dur, Comp, cues], i) => {
    visuals.push(
      <Sequence key={`v${i}`} from={from} durationInFrames={dur}>
        <Comp total={dur} />
      </Sequence>,
    );
    cues.forEach(([at, name, vol], j) => {
      sounds.push(
        <Sequence key={`a${i}-${j}`} from={from + at} durationInFrames={120}>
          <Audio src={staticFile(`sfx/${name}.wav`)} volume={Math.min(1, name === 'boom' ? vol : vol * GAIN)} />
        </Sequence>,
      );
    });
    from += dur;
  });
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {visuals}
      <Pad from={140} />
      {sounds}
    </AbsoluteFill>
  );
};

