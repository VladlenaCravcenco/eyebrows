// Синтезирует звуки для ролика (без сэмплов и сторонних библиотек — всё своё, без прав третьих лиц).
// Запуск: node scripts/sfx.mjs  → public/sfx/*.wav
import { mkdirSync, writeFileSync } from 'node:fs';

const SR = 48000;
const OUT = new URL('../public/sfx/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

/* ---------- базовые кирпичики ---------- */

// воспроизводимый «случайный» шум
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const track = (sec) => ({ L: new Float32Array(Math.ceil(sec * SR)), R: new Float32Array(Math.ceil(sec * SR)) });
const TAU = Math.PI * 2;

/** Биквадратный фильтр (RBJ). Частоту можно менять на лету. */
function biquad(type) {
  let b0, b1, b2, a1, a2, x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  return {
    set(f, q = 0.707) {
      const w = (TAU * Math.min(f, SR * 0.45)) / SR, c = Math.cos(w), al = Math.sin(w) / (2 * q);
      let n0, n1, n2;
      if (type === 'lp') [n0, n1, n2] = [(1 - c) / 2, 1 - c, (1 - c) / 2];
      else if (type === 'hp') [n0, n1, n2] = [(1 + c) / 2, -(1 + c), (1 + c) / 2];
      else [n0, n1, n2] = [al, 0, -al]; // полосовой
      const a0 = 1 + al;
      b0 = n0 / a0; b1 = n1 / a0; b2 = n2 / a0; a1 = (-2 * c) / a0; a2 = (1 - al) / a0;
      return this;
    },
    run(x) {
      const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
      x2 = x1; x1 = x; y2 = y1; y1 = y;
      return y;
    },
  };
}

/** Простой ревербератор Шрёдера: 4 гребёнки + 2 всепропускающих */
function reverb(t, { decay = 0.82, mix = 0.25, damp = 0.35 } = {}) {
  const make = (ch, offs) => {
    const combs = [1557, 1617, 1491, 1422].map((n) => ({ buf: new Float32Array(n + offs), i: 0, lp: 0 }));
    const aps = [225, 556].map((n) => ({ buf: new Float32Array(n + offs), i: 0 }));
    const out = new Float32Array(ch.length);
    for (let s = 0; s < ch.length; s++) {
      const x = ch[s];
      let acc = 0;
      for (const c of combs) {
        const y = c.buf[c.i];
        c.lp = y * (1 - damp) + c.lp * damp;
        c.buf[c.i] = x + c.lp * decay;
        c.i = (c.i + 1) % c.buf.length;
        acc += y;
      }
      acc *= 0.25;
      for (const a of aps) {
        const b = a.buf[a.i];
        const y = -acc + b;
        a.buf[a.i] = acc + b * 0.5;
        a.i = (a.i + 1) % a.buf.length;
        acc = y;
      }
      out[s] = x * (1 - mix) + acc * mix;
    }
    return out;
  };
  return { L: make(t.L, 0), R: make(t.R, 23) };
}

function normalize(t, peak = 0.85) {
  let m = 1e-9;
  for (const ch of [t.L, t.R]) for (const v of ch) m = Math.max(m, Math.abs(v));
  const k = peak / m;
  for (const ch of [t.L, t.R]) for (let i = 0; i < ch.length; i++) ch[i] *= k;
  return t;
}

/** плавное затухание в самом конце — без щелчков на обрезке */
function tail(t, ms = 30) {
  const n = Math.round((ms / 1000) * SR);
  for (const ch of [t.L, t.R]) for (let i = 0; i < n; i++) ch[ch.length - 1 - i] *= i / n;
  return t;
}

function save(name, t) {
  tail(t);
  const n = t.L.length;
  const buf = Buffer.alloc(44 + n * 4);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, t.L[i])) * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, t.R[i])) * 32767), 46 + i * 4);
  }
  writeFileSync(`${OUT}${name}.wav`, buf);
  console.log('♪', name, (n / SR).toFixed(2) + 's');
}

/** добавить моно-сигнал fn(t) в дорожку с панорамой pan(-1..1) начиная с секунды at */
function add(t, at, dur, fn, pan = 0) {
  const s0 = Math.round(at * SR), n = Math.round(dur * SR);
  const gl = Math.cos(((pan + 1) * Math.PI) / 4), gr = Math.sin(((pan + 1) * Math.PI) / 4);
  for (let i = 0; i < n && s0 + i < t.L.length; i++) {
    const v = fn(i / SR, i);
    t.L[s0 + i] += v * gl * Math.SQRT2;
    t.R[s0 + i] += v * gr * Math.SQRT2;
  }
}

/** колокольчик: основной тон + неровные обертоны, мягкая атака */
const bell = (f, decay) => (x) =>
  Math.min(1, x / 0.004) *
  (Math.sin(TAU * f * x) * Math.exp(-x / decay) +
    0.35 * Math.sin(TAU * f * 2.01 * x) * Math.exp(-x / (decay * 0.5)) +
    0.12 * Math.sin(TAU * f * 3.98 * x) * Math.exp(-x / (decay * 0.25)));

/* ---------- звуки ---------- */

// tick — появление строки текста: тонкий, деревянный
{
  const t = track(0.35), r = rng(1), hp = biquad('hp').set(3500);
  add(t, 0, 0.3, (x) => Math.sin(TAU * 2600 * x) * Math.exp(-x / 0.007) * 0.8 + hp.run(r() * 2 - 1) * Math.exp(-x / 0.0015));
  save('tick', normalize(reverb(t, { mix: 0.18, decay: 0.7 }), 0.7));
}

// click — нажатие кнопки
{
  const t = track(0.3), r = rng(2), bp = biquad('bp').set(2200, 1.5);
  add(t, 0, 0.25, (x) =>
    bp.run(r() * 2 - 1) * Math.exp(-x / 0.003) * 1.2 +
    Math.sin(TAU * 1500 * x) * Math.exp(-x / 0.012) * 0.5 +
    Math.sin(TAU * 170 * x) * Math.exp(-x / 0.02) * 0.6);
  save('click', normalize(t, 0.75));
}

// key1..3 — клавиши при наборе в редакторе
for (const [i, f] of [[1, 2400], [2, 2900], [3, 2100]]) {
  const t = track(0.14), r = rng(10 + i), bp = biquad('bp').set(f, 1.2);
  add(t, 0, 0.12, (x) => bp.run(r() * 2 - 1) * Math.exp(-x / 0.004) + Math.sin(TAU * 140 * x) * Math.exp(-x / 0.012) * 0.4);
  save(`key${i}`, normalize(t, 0.6));
}

// pop1..3 — всплывающие плашки (разная высота, чтобы не звучало однообразно)
for (const [i, f0] of [[1, 520], [2, 620], [3, 740]]) {
  const t = track(0.5);
  let ph = 0;
  add(t, 0, 0.3, (x) => {
    const f = f0 * (1 + 0.7 * Math.exp(-x / 0.012));
    ph += (TAU * f) / SR;
    return Math.sin(ph) * Math.exp(-x / 0.05) * Math.min(1, x / 0.002);
  });
  save(`pop${i}`, normalize(reverb(t, { mix: 0.2, decay: 0.72 }), 0.7));
}

// thock — карточки «пользы»: ниже и мягче
{
  const t = track(0.7);
  let ph = 0;
  const lp = biquad('lp').set(1200);
  add(t, 0, 0.4, (x) => {
    const f = 190 * (1 + 0.8 * Math.exp(-x / 0.015));
    ph += (TAU * f) / SR;
    return lp.run(Math.sin(ph) * Math.exp(-x / 0.09) * Math.min(1, x / 0.002) + Math.sin(TAU * 1900 * x) * Math.exp(-x / 0.004) * 0.15);
  });
  save('thock', normalize(reverb(t, { mix: 0.25, decay: 0.78 }), 0.8));
}

// whoosh — переход между сценами: воздух, проходящий слева направо
function whoosh(name, dur, fLo, fHi, seed, bright = 1) {
  const t = track(dur + 0.4), r = rng(seed);
  const bpL = biquad('bp'), bpR = biquad('bp');
  const n = Math.round(dur * SR);
  for (let i = 0; i < n; i++) {
    const p = i / n;
    const env = Math.pow(Math.sin(Math.PI * Math.pow(p, 0.8)), 2);
    const f = fLo + (fHi - fLo) * Math.sin(Math.PI * p);
    if (i % 16 === 0) { bpL.set(f, 1.1); bpR.set(f * 1.08, 1.1); }
    const pan = -0.8 + 1.6 * p;
    const nL = bpL.run(r() * 2 - 1), nR = bpR.run(r() * 2 - 1);
    t.L[i] += nL * env * Math.cos(((pan + 1) * Math.PI) / 4) * bright;
    t.R[i] += nR * env * Math.sin(((pan + 1) * Math.PI) / 4) * bright;
  }
  save(name, normalize(reverb(t, { mix: 0.22, decay: 0.75 }), 0.8));
}
whoosh('whoosh', 0.75, 350, 2600, 21);
whoosh('whoosh-soft', 0.6, 250, 1400, 22, 0.8);
whoosh('swipe', 0.38, 600, 4200, 23);
whoosh('whoosh-long', 1.6, 200, 1800, 24);

// riser — нарастание перед «And for the owner»
{
  const dur = 1.4, t = track(dur + 0.1), r = rng(31), bp = biquad('bp');
  let ph = 0;
  const n = Math.round(dur * SR);
  for (let i = 0; i < n; i++) {
    const p = i / n;
    if (i % 16 === 0) bp.set(200 + 5200 * p * p, 1.4);
    const f = 180 + 620 * p * p;
    ph += (TAU * f) / SR;
    const v = (bp.run(r() * 2 - 1) * 0.9 + Math.sin(ph) * 0.25) * Math.pow(p, 2.2);
    t.L[i] += v; t.R[i] += v;
  }
  save('riser', normalize(reverb(t, { mix: 0.2 }), 0.75));
}

// boom — логотип и финал: глубокий удар с хвостом
{
  const t = track(3), r = rng(41), lp = biquad('lp').set(180);
  let ph = 0;
  add(t, 0, 2.4, (x) => {
    const f = 42 + 30 * Math.exp(-x / 0.08);
    ph += (TAU * f) / SR;
    return Math.sin(ph) * Math.exp(-x / 0.7) * Math.min(1, x / 0.003) + lp.run(r() * 2 - 1) * Math.exp(-x / 0.05) * 1.4;
  });
  save('boom', normalize(reverb(t, { mix: 0.3, decay: 0.86, damp: 0.5 }), 0.9));
}

// shimmer — «искры» вслед за логотипом
{
  const t = track(2.2), r = rng(51);
  for (let k = 0; k < 26; k++) {
    const f = 2000 + r() * 4500, at = r() * 0.9;
    add(t, at, 0.4, bell(f, 0.06 + r() * 0.08), r() * 1.6 - 0.8);
  }
  save('shimmer', normalize(reverb(t, { mix: 0.45, decay: 0.88 }), 0.55));
}

// ding — новое сообщение в чате
{
  const t = track(1.4);
  add(t, 0, 1, bell(1318.5, 0.25), -0.1);
  add(t, 0.09, 1, bell(1760, 0.3), 0.1);
  save('ding', normalize(reverb(t, { mix: 0.3, decay: 0.8 }), 0.6));
}

// success — правильный ответ / «Great work!»
{
  const t = track(1.8);
  [1046.5, 1318.5, 1568, 2093].forEach((f, i) => add(t, i * 0.075, 1.2, bell(f, 0.35), -0.3 + i * 0.2));
  save('success', normalize(reverb(t, { mix: 0.35, decay: 0.84 }), 0.7));
}

// error — неверный ответ: мягкое «бонк», не раздражающее
{
  const t = track(0.5), lp = biquad('lp').set(900);
  let ph = 0;
  add(t, 0, 0.35, (x) => {
    const f = 210 - 50 * Math.min(1, x / 0.15);
    ph += (TAU * f) / SR;
    return lp.run(Math.sin(ph) + 0.3 * Math.sin(ph * 3)) * Math.exp(-x / 0.08) * Math.min(1, x / 0.003);
  });
  save('error', normalize(t, 0.6));
}

// confetti — россыпь крошечных «искр»
{
  const t = track(1.6), r = rng(61);
  for (let k = 0; k < 46; k++) {
    const f = 3000 + r() * 5000, at = Math.pow(r(), 1.6) * 1.1;
    add(t, at, 0.05, (x) => Math.sin(TAU * f * x) * Math.exp(-x / 0.012), r() * 1.8 - 0.9);
  }
  save('confetti', normalize(reverb(t, { mix: 0.3 }), 0.45));
}

// lock — «защёлка» на сцене защиты
{
  const t = track(0.6), r = rng(71), bp = biquad('bp').set(1100, 2);
  const hit = (amp) => (x) => bp.run(r() * 2 - 1) * Math.exp(-x / 0.006) * amp + Math.sin(TAU * 320 * x) * Math.exp(-x / 0.03) * amp * 0.5;
  add(t, 0, 0.12, hit(1));
  add(t, 0.075, 0.2, hit(1.3));
  save('lock', normalize(reverb(t, { mix: 0.2, decay: 0.7 }), 0.75));
}

// pad — тихая атмосферная подложка на весь ролик: мягкие аккорды, медленные переливы
{
  const dur = 86, t = track(dur);
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
  // Dmaj9 → Bm9 → Gmaj9 → Asus2, по 8 секунд
  const chords = [
    [50, 57, 61, 64, 66],
    [47, 54, 57, 61, 62],
    [43, 50, 54, 57, 62],
    [45, 52, 57, 59, 64],
  ];
  const len = 8;
  const lpL = biquad('lp').set(1600), lpR = biquad('lp').set(1500);
  const n = t.L.length;
  const phases = new Float64Array(64);
  for (let i = 0; i < n; i++) {
    const x = i / SR;
    const idx = Math.floor(x / len), local = x - idx * len;
    let sL = 0, sR = 0;
    for (const [j, ci] of [[0, idx], [1, idx - 1]]) {
      if (ci < 0) continue;
      // текущий аккорд нарастает 3 с, предыдущий затухает 3 с
      const g = j === 0 ? Math.min(1, local / 3) : Math.max(0, 1 - local / 3);
      if (g <= 0) continue;
      const ch = chords[ci % chords.length];
      ch.forEach((m, v) => {
        const f = hz(m);
        const k = (ci % 4) * 10 + v * 2;
        phases[k] += (TAU * f * 0.9985) / SR;
        phases[k + 1] += (TAU * f * 1.0015) / SR;
        const trem = 0.85 + 0.15 * Math.sin(TAU * (0.07 + v * 0.013) * x + v);
        const a = Math.sin(phases[k]) + 0.18 * Math.sin(2 * phases[k]);
        const b = Math.sin(phases[k + 1]) + 0.18 * Math.sin(2 * phases[k + 1]);
        sL += a * g * trem * (v === 0 ? 0.9 : 0.55);
        sR += b * g * trem * (v === 0 ? 0.9 : 0.55);
      });
    }
    t.L[i] = lpL.run(sL);
    t.R[i] = lpR.run(sR);
  }
  save('pad', normalize(reverb(t, { mix: 0.35, decay: 0.85, damp: 0.5 }), 0.7));
}
