// Generates public/passport-music.wav for the "Passport" composition: a bright 120 BPM
// groove (marimba plucks, claps, kick) with stamp thuds, page flips, an airport chime
// and result pings, synced to src/passport/timeline.json.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createSynth } from "./synth.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const tl = JSON.parse(fs.readFileSync(path.join(root, "src/passport/timeline.json"), "utf8"));

const FPS = tl.fps;
const seconds = tl.durationInFrames / FPS;
const synth = createSynth({ seconds, fps: FPS, bpm: tl.bpm, seed: 23 });
const { SR, N, L, R, at, add, beatFrames, beatsBetween, kick, clap, hat, bass, hit, whoosh, riser, click, ping } = synth;

// Marimba-like pluck.
const pluck = (frame, freq, gain = 0.14) => {
  const s = at(frame);
  for (let i = 0; i < 0.6 * SR; i++) {
    const t = i / SR;
    const v = (Math.sin(2 * Math.PI * freq * t) + 0.3 * Math.sin(2 * Math.PI * freq * 4 * t) * Math.exp(-t * 30)) * Math.exp(-t * 9) * gain;
    add(s + i, v * 0.9, v);
  }
};
// Rubber stamp: dull thud + paper slap.
const stamp = (frame, gain = 0.9) => {
  kick(frame, gain);
  clap(frame, 0.25 * gain);
  hit(frame, 0.45 * gain);
};
// Three-tone airport announcement chime.
const chime = (frame) => {
  [784, 659.25, 523.25].forEach((f, i) => ping(frame + i * 12, f, 0.2));
};

// Bright pad: C - G - Am - F
const chords = [
  [130.81, 261.63, 329.63, 392],
  [98, 246.94, 293.66, 392],
  [110, 261.63, 329.63, 440],
  [87.31, 261.63, 349.23, 440],
];
const chordFrames = beatFrames * 8;
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const c = chords[Math.floor((t * FPS) / chordFrames) % 4];
  const master = Math.min(1, t / 1) * Math.min(1, (seconds - t) / 3);
  let v = 0;
  for (const f of c) v += Math.sin(2 * Math.PI * f * t) + 0.2 * Math.sin(2 * Math.PI * f * 3.001 * t);
  const lfo = 0.75 + 0.25 * Math.sin(2 * Math.PI * 0.5 * t);
  L[i] += v * 0.012 * master * lfo;
  R[i] += v * 0.012 * master * (1.5 - lfo);
}
const chordAt = (frame) => chords[Math.floor(frame / chordFrames) % 4];
// Arpeggio on 8th notes using the current chord.
const arp = (from, to, gain = 0.12) => {
  for (let k = 0; from + (k * beatFrames) / 2 < to; k++) {
    const f = from + (k * beatFrames) / 2;
    const c = chordAt(f);
    pluck(f, c[1 + (k % 3)] * (k % 4 === 3 ? 2 : 1), gain);
  }
};
const groove = (from, to, { claps = true, hats = true, bassOn = true, kickGain = 0.75 } = {}) =>
  beatsBetween(from, to, (f, b) => {
    kick(f, kickGain);
    if (hats) hat(f + beatFrames / 2, 0.09);
    if (claps && b % 2 === 1) clap(f, 0.28);
    if (bassOn) bass(f, chordAt(f)[0] / 2, 0.35, 0.22);
  });

const { opening, passport, arrivals, welcome, outro } = tl;

// 1. opening: plucks, then the beat drops on the headline
hit(opening.from, 0.7);
arp(opening.from, opening.from + opening.splitAt, 0.1);
hit(opening.from + opening.splitAt, 0.8);
groove(opening.from + opening.splitAt, opening.from + opening.duration, { bassOn: false });
arp(opening.from + opening.splitAt, opening.from + opening.duration);

// 2. passport: cover drops, opens, page flips, five stamps, "complete"
whoosh(passport.from - 8, 0.5, 0.4, false);
groove(passport.from, passport.from + passport.openAt - 6, { claps: false });
arp(passport.from, passport.from + passport.fullAt - 10, 0.09);
whoosh(passport.from + passport.openAt, 0.8, 0.45, true);
hit(passport.from + passport.openAt + 20, 0.5);
groove(passport.from + passport.openAt, passport.from + passport.fullAt - 16);
whoosh(passport.from + passport.flipAt, 0.6, 0.4, true);
for (let i = 0; i < 5; i++) stamp(passport.from + passport.stampsFrom + i * passport.stampGap);
riser(passport.from + passport.fullAt - 30, passport.from + passport.fullAt - 1, 0.25);
stamp(passport.from + passport.fullAt, 1.2);
groove(passport.from + passport.fullAt + 15, passport.from + passport.duration);

// 3. arrivals: chime, groove, a tick + ping per landing
chime(arrivals.from + 4);
groove(arrivals.from + 30, arrivals.from + arrivals.duration);
arp(arrivals.from + 30, arrivals.from + arrivals.duration, 0.1);
for (let r = 0; r < 5; r++) {
  const f = arrivals.from + arrivals.firstRow + r * arrivals.rowGap;
  whoosh(f - 18, 0.35, 0.15, false);
  for (let k = 0; k < 6; k++) click(f + k * 3, 0.07);
  ping(f, [1046.5, 1174.66, 1318.5, 1568, 1760][r], 0.13);
}

// 4. welcome sign: swing in, half-time
whoosh(welcome.from - 6, 0.6, 0.45, false);
hit(welcome.from + 6, 0.8);
beatsBetween(welcome.from + 10, welcome.from + welcome.duration - 20, (f, b) => {
  if (b % 2 === 0) kick(f, 0.6);
  hat(f + beatFrames / 2, 0.06);
});
arp(welcome.from + 10, welcome.from + welcome.duration, 0.08);
riser(welcome.from + welcome.duration - 30, outro.from, 0.25);

// 5. outro: final stamp-like hit, resolving chord
stamp(outro.from + 6, 1.1);
[261.63, 329.63, 392, 523.25].forEach((f, i) => pluck(outro.from + 30 + i * 4, f, 0.14));
ping(outro.from + 50, 2093, 0.06);

synth.write(path.join(root, "public/passport-music.wav"));
console.log(`public/passport-music.wav written (${seconds}s)`);
