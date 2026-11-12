import type { CSSProperties, ReactNode } from 'react';
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';

export const { fontFamily } = loadFont('normal', { weights: ['400', '500', '600', '700'], subsets: ['latin', 'cyrillic'] });

export const C = {
  black: '#000000',
  light: '#F5F5F7',
  ink: '#1D1D1F',
  gray: '#86868B',
  sand: 'linear-gradient(135deg, #EFE7DC 0%, #D9CFC2 100%)',
};

const ease = Easing.bezier(0.22, 1, 0.36, 1);

/** 0→1 плавно, начиная с кадра `at`, за `dur` кадров */
export function useIn(at = 0, dur = 24) {
  const f = useCurrentFrame();
  return interpolate(f, [at, at + dur], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
}

/** 1→0 к концу сцены */
export function useOut(total: number, dur = 18) {
  const f = useCurrentFrame();
  return interpolate(f, [total - dur, total], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
}

export function useSpring(at = 0, damping = 200) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - at, fps, config: { damping, mass: 0.9 } });
}

/** Текст, который проявляется из размытия и чуть поднимается — как в презентациях Apple */
export function Reveal({ at = 0, dur = 26, children, style, y = 28 }: { at?: number; dur?: number; children: ReactNode; style?: CSSProperties; y?: number }) {
  const t = useIn(at, dur);
  return (
    <div style={{ opacity: t, transform: `translateY(${(1 - t) * y}px)`, filter: `blur(${(1 - t) * 14}px)`, ...style }}>
      {children}
    </div>
  );
}

export function Scene({ bg, total, children, fadeIn = 14 }: { bg: string; total: number; children: ReactNode; fadeIn?: number }) {
  const inT = useIn(0, fadeIn);
  const out = useOut(total);
  return (
    <AbsoluteFill style={{ background: bg, fontFamily, opacity: Math.min(inT, out), WebkitFontSmoothing: 'antialiased' }}>
      {children}
    </AbsoluteFill>
  );
}

export const H = ({ children, color = C.ink, size = 96, style }: { children: ReactNode; color?: string; size?: number; style?: CSSProperties }) => (
  <div style={{ fontSize: size, fontWeight: 600, letterSpacing: '-0.035em', lineHeight: 1.04, color, textWrap: 'balance', ...style } as CSSProperties}>{children}</div>
);

export const Sub = ({ children, color = C.gray, size = 34, style }: { children: ReactNode; color?: string; size?: number; style?: CSSProperties }) => (
  <div style={{ fontSize: size, fontWeight: 500, letterSpacing: '-0.015em', lineHeight: 1.3, color, textWrap: 'pretty', ...style } as CSSProperties}>{children}</div>
);

/** iPhone с экраном: картинкой из public/screens или своим содержимым */
export function Phone({ src, height = 860, children, style, shadow = true, dark = false }: {
  src?: string;
  height?: number;
  children?: ReactNode;
  style?: CSSProperties;
  shadow?: boolean;
  dark?: boolean;
}) {
  const width = (height * 390) / 844;
  const bezel = height * 0.017;
  const radius = height * 0.068;
  return (
    <div
      style={{
        width: width + bezel * 2,
        height: height + bezel * 2,
        borderRadius: radius + bezel,
        background: dark ? '#2a2a2e' : '#0b0b0c',
        padding: bezel,
        boxShadow: shadow ? '0 60px 120px -30px rgba(0,0,0,0.35), 0 0 0 1.5px rgba(255,255,255,0.08) inset' : undefined,
        position: 'relative',
        ...style,
      }}
    >
      <div style={{ width, height, borderRadius: radius, overflow: 'hidden', background: '#fff', position: 'relative' }}>
        {src ? <Img src={staticFile(`screens/${src}.png`)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> : children}
        <div
          style={{
            position: 'absolute',
            top: height * 0.012,
            left: '50%',
            width: width * 0.3,
            height: height * 0.036,
            transform: 'translateX(-50%)',
            background: '#000',
            borderRadius: 999,
          }}
        />
      </div>
    </div>
  );
}

/** Значок приложения (как в боте) */
export function Mark({ size = 120, invert = false }: { size?: number; invert?: boolean }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: invert ? '#fff' : '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke={invert ? '#000' : '#fff'} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.94 14.06 8 20l-1.94-5.94L0 12l6.06-1.94L8 4l1.94 6.06L16 12z" transform="translate(2 0)" />
        <path d="M20 3v4M18 5h4" />
      </svg>
    </div>
  );
}

/** Чат с ботом в Telegram — нарисован, чтобы показать, с чего всё начинается */
export function TelegramChat({ t }: { t: number }) {
  const bubble = interpolate(t, [0.15, 0.45], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
  const button = interpolate(t, [0.4, 0.7], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
  const press = interpolate(t, [0.82, 0.88, 0.94], [1, 0.94, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ width: '100%', height: '100%', background: '#DCE6EC', fontFamily, display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: '#fff', paddingTop: 56, paddingBottom: 14, display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 18, borderBottom: '1px solid #e6e6e6' }}>
        <Mark size={40} />
        <div>
          <div style={{ fontSize: 17, fontWeight: 600, color: '#000' }}>Mentor</div>
          <div style={{ fontSize: 13, color: '#8e8e93' }}>bot</div>
        </div>
      </div>
      <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 8 }}>
        <div style={{ alignSelf: 'flex-end', background: '#E3F8D2', borderRadius: 18, padding: '8px 14px', fontSize: 16, color: '#000' }}>/start</div>
        <div style={{ opacity: bubble, transform: `translateY(${(1 - bubble) * 20}px)` }}>
          <div style={{ background: '#fff', borderRadius: 18, padding: '12px 14px', fontSize: 15.5, lineHeight: 1.4, color: '#000', maxWidth: '88%' }}>
            Hi, Emma! 👋
            <br />
            <br />
            Here you’ll find short lessons and quick quizzes on how everything works in our studio. Go at your own pace — your progress is saved.
          </div>
          <div
            style={{
              opacity: button,
              marginTop: 6,
              maxWidth: '88%',
              background: 'rgba(255,255,255,0.65)',
              borderRadius: 12,
              padding: '11px 0',
              textAlign: 'center',
              fontSize: 15.5,
              fontWeight: 500,
              color: '#2481CC',
              transform: `scale(${press})`,
            }}
          >
            Open training ↗
          </div>
        </div>
      </div>
      <div style={{ background: '#fff', padding: '10px 12px 34px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ background: '#2481CC', color: '#fff', borderRadius: 10, padding: '7px 12px', fontSize: 14, fontWeight: 600 }}>Training</div>
        <div style={{ flex: 1, border: '1px solid #e2e2e2', borderRadius: 18, padding: '8px 14px', fontSize: 15, color: '#a0a0a5' }}>Message</div>
      </div>
    </div>
  );
}
