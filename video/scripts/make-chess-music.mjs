// Generates public/chess-music.wav for the "Chess" composition: a dark, dramatic score
// (low drone, chess-clock ticks, 100 BPM pulse) with wooden piece knocks, a capture crash,
// a promotion swell and the checkmate boom, synced to src/chess/timeline.json.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createSynth } from "./synth.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const tl = JSON.parse(fs.readFileSync(path.join(root, "src/chess/timeline.json"), "utf8"));

const FPS = tl.fps;
const seconds = tl.durationInFrames / FPS;
const synth = createSynth({ seconds, fps: FPS, bpm: tl.bpm, seed: 37 });
const { SR, N, L, R, at, add, rnd, beatFrames, beatsBetween, kick, clap, hat, hit, whoosh, riser, ping } = synth;

// Wooden chess piece landing on the board.
const knock = (frame, gain = 0.5) => {
  const s = at(frame);
  let lp = 0;
  for (let i = 0; i < 0.25 * SR; i++) {
    const t = i / SR;
    lp += 0.3 * (rnd() - lp);
    const v = (Math.sin(2 * Math.PI * 190 * t) * 0.8 + Math.sin(2 * Math.PI * 720 * t) * 0.4) * Math.exp(-t * 32) + lp * Math.exp(-t * 90) * 0.6;
    add(s + i, v * gain);
  }
};
// Chess clock: alternating tick / tock.
const tick = (frame, high, gain = 0.12) => {
  const s = at(frame);
  const f = high ? 2400 : 1800;
  for (let i = 0; i < 0.03 * SR; i++) {
    const t = i / SR;
    add(s + i, Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 180) * gain);
  }
};
// Sustained string-like swell (stacked detuned harmonics).
const swell = (from, to, freqs, gain = 0.05) => {
  const s = at(from);
  const e = at(to);
  for (let i = s; i < e && i < N; i++) {
    const p = (i - s) / (e - s);
    const env = Math.sin(Math.PI * Math.min(1, p * 1.2)) ** 1.5;
    const t = i / SR;
    let v = 0;
    for (const f of freqs) v += Math.sin(2 * Math.PI * f * t) + 0.4 * Math.sin(2 * Math.PI * f * 2.003 * t) + 0.2 * Math.sin(2 * Math.PI * f * 3.01 * t);
    add(i, v * env * gain, v * env * gain * 0.95);
  }
};

const { intro, confusion, answer, moves, promotion, mate, outro } = tl;
const moveStart = (k) => moves.from + k * moves.each;
const landFrame = (k) => moveStart(k) + moves.hop;

// Low drone under the board scenes (D minor), brightening to D major at the promotion.
for (let i = 0; i < at(outro.from + 40) && i < N; i++) {
  const t = i / SR;
  const frame = t * FPS;
  const fadeIn = Math.min(1, t / 2);
  const third = frame < promotion.at ? 174.61 : 185;
  const v = Math.sin(2 * Math.PI * 73.42 * t) * 0.6 + Math.sin(2 * Math.PI * 146.83 * t) * 0.3 + Math.sin(2 * Math.PI * third * t) * 0.15 + Math.sin(2 * Math.PI * 220 * t) * 0.12;
  const lfo = 0.75 + 0.25 * Math.sin(2 * Math.PI * 0.2 * t);
  const tail = frame > outro.from ? Math.max(0, 1 - (frame - outro.from) / 40) : 1;
  L[i] += v * 0.05 * fadeIn * lfo * tail;
  R[i] += v * 0.05 * fadeIn * (1.5 - lfo) * tail;
}

// Intro: squares ripple in, the pawn lands.
for (let k = 0; k < 12; k++) tick(intro.squaresTo * (k / 12) + 4, k % 2 === 0, 0.06);
riser(10, intro.pawnDrop, 0.15);
knock(intro.pawnDrop, 0.8);
hit(intro.pawnDrop, 0.5);

// Chess clock ticking from the drop until the plan is revealed; faster and tenser in the confusion.
beatsBetween(intro.pawnDrop + 8, confusion.from, (f, b) => tick(f, b % 2 === 0));
beatsBetween(confusion.from, answer.from, (f, b) => {
  tick(f, b % 2 === 0, 0.14);
  tick(f + beatFrames / 2, b % 2 === 1, 0.08);
});
swell(confusion.from, answer.from + 10, [77.78, 155.56, 164.81], 0.035);
for (let i = 0; i < 12; i++) whoosh(confusion.from + i * 4, 0.25, 0.08, i % 2 === 0);
riser(answer.from - 36, answer.from, 0.22);

// Answer: a hit, then the pulse starts.
hit(answer.from, 0.9);
ping(answer.from + 4, 587.33, 0.1);
beatsBetween(answer.from + 20, promotion.from, (f, b) => {
  kick(f, 0.65);
  hat(f + beatFrames / 2, 0.07);
  if (b % 2 === 1) clap(f, 0.18);
});

// Every move: a lift whoosh and a wooden knock, with a rising note.
const notes = [587.33, 659.25, 698.46, 783.99, 880, 987.77];
for (let k = 0; k < 6; k++) {
  whoosh(moveStart(k), moves.hop / FPS + 0.1, 0.18, k % 2 === 0);
  knock(landFrame(k), 0.9);
  ping(landFrame(k), notes[k], 0.1);
}
// Capture of the competition.
hit(landFrame(2), 0.8);
whoosh(landFrame(2) - 2, 0.7, 0.35, true);

// Promotion: riser, flash hit, bright swell.
riser(promotion.from + 4, promotion.at, 0.3);
hit(promotion.at, 1.2);
swell(promotion.at, promotion.to + 20, [293.66, 369.99, 440, 587.33], 0.03);
[1174.66, 1479.98, 1760].forEach((f, i) => ping(promotion.at + 6 + i * 5, f, 0.08));

// Checkmate: the beam charges, silence, the king falls.
riser(mate.from + 8, mate.topple - 4, 0.28);
knock(mate.topple + 6, 1);
hit(mate.topple, 1.3);
kick(mate.topple, 1);

// Aftermath: the other pieces fall like dominoes, the board lights up, the logo lands.
for (let i = 0; i < 5; i++) knock(mate.domino + i * 6 + 4, 0.55);
for (let k = 0; k < 10; k++) ping(mate.ripple + k * 5, [1174.66, 1318.5, 1479.98, 1760, 1975.53][k % 5], 0.05);
swell(mate.ripple, outro.from, [146.83, 220, 293.66, 369.99], 0.03);
whoosh(mate.rise, 1.6, 0.25, true);
hit(mate.logo, 0.9);
ping(mate.logo + 2, 1174.66, 0.1);

// Outro: final chord.
hit(outro.from, 0.8);
swell(outro.from + 4, outro.from + 150, [146.83, 220, 293.66, 369.99], 0.035);
ping(outro.from + 36, 1174.66, 0.08);

synth.write(path.join(root, "public/chess-music.wav"));
console.log(`public/chess-music.wav written (${seconds}s)`);
