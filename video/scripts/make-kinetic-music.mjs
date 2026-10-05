// Soundtracks for the «حركة» kinetic-type series (scripts/studio.mjs). Every cut lands on a beat.
//   seconds   – phonk: cowbell riff, sliding 808, trap hats; a countdown hit on 3-2-1
//   notthis   – drum & bass: two-step breaks, reese bass; a buzzer on ✕ and a bright stab on ✓
//   manifesto – boom-bap: dusty kick/snare, piano stabs, a stab on every word, strings at the end
//   node scripts/make-kinetic-music.mjs [name]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createStudio } from "./studio.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const CLIPS = JSON.parse(fs.readFileSync(path.join(root, "src/kinetic/clips.json"), "utf8"));
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const studioFor = (c, seed) => {
  const s = createStudio({ seconds: (c.beats * 60) / c.bpm, fps: 30, bpm: c.bpm, seed });
  const bf = 1800 / c.bpm;
  return { s, bf, F: (b) => b * bf };
};

const tracks = {
  seconds: () => {
    const c = CLIPS.seconds;
    const { s, F } = studioFor(c, 1401);
    const cow = (f, m, g = 0.07) => s.bell(f, hz(m), g, { ratio: 1.48, index: 2.2, dec: 0.22, send: 0.25 });
    const riff = [74, 74, 77, 74, 72, 74, 70, 72];
    const bass = [38, 38, 41, 36];
    for (let b = 0; b < c.endAt; b++) {
      const f = F(b);
      if (b % 4 === 0) s.k808(f, hz(bass[(b / 4) % 4] - 12), 0.9, 0.55, b % 8 === 4 ? hz(bass[(b / 4) % 4] - 7) : null);
      if (b % 4 === 2) s.snare(f, 0.32), s.clap(f, 0.18);
      s.hat(f, 0.06);
      s.hat(f + F(0.5), 0.05);
      if (b % 4 === 3) s.hatRoll(f, f + F(1), 6, 0.04);
      cow(f, riff[b % 8]);
      cow(f + F(0.5), riff[(b + 3) % 8] - 12, 0.04);
    }
    // countdown hits
    [8, 10, 12].forEach((b, i) => (s.impact(F(b), 0.6 + i * 0.2), s.tick(F(b), 3000 - i * 600, 0.15)));
    s.noiseSweep(F(6), F(8), { gain: 0.2 });
    s.whoosh(F(7.5), 0.3, 0.25, true); // the swipe
    s.impact(F(c.endAt), 1);
    s.supersaw(F(c.endAt), F(c.beats), [hz(50), hz(57), hz(62), hz(65)], 0.014, { cutoff: 0.04, attack: 0.02, release: 1 });
    s.k808(F(c.endAt), hz(26), 2, 0.6);
    return { s, file: c.music, mix: { duckDepth: 0.45 } };
  },

  notthis: () => {
    const c = CLIPS.notthis;
    const { s, F } = studioFor(c, 1411);
    // two-step break: kick 1, snare 2, kick 2.5, snare 4 (per 4-beat bar)
    for (let b = 0; b < c.endAt; b += 4) {
      const f = F(b);
      s.kick(f, 0.85);
      s.snare(f + F(1), 0.4, 0.2);
      s.kick(f + F(2.5), 0.7);
      s.snare(f + F(3), 0.4, 0.2);
      for (let h = 0; h < 8; h++) s.hat(f + F(h * 0.5), h % 2 ? 0.05 : 0.07);
      // reese bass
      const root = [38, 38, 36, 41][(b / 4) % 4];
      s.supersaw(f, f + F(4), [hz(root - 12), hz(root - 12) * 1.008], 0.03, { cutoff: 0.012, attack: 0.01, release: 0.1 });
    }
    s.supersaw(0, F(c.endAt), [hz(62), hz(65), hz(69)], 0.006, { cutoff: 0.02, attack: 2 });
    c.shots.forEach((sh) => {
      const f = F(sh.b);
      if (sh.mark === "x") {
        s.pluck(f, hz(40), 0.3, { bright: 1, decay: 0.993 });
        s.pluck(f, hz(41), 0.3, { bright: 1, decay: 0.993 });
        s.noiseSweep(f + F(1.4), f + F(1.8), { up: false, gain: 0.18 }); // the strike
      } else if (sh.mark === "check") {
        [74, 78, 81, 86].forEach((m, i) => s.bell(f + i, hz(m), 0.06, { ratio: 2, index: 0.8, dec: 0.7 }));
        s.impact(f, 0.4);
      }
    });
    s.noiseSweep(F(36), F(40), { gain: 0.25 });
    s.impact(F(40), 0.9);
    s.impact(F(c.endAt), 1);
    s.supersaw(F(c.endAt), F(c.beats), [hz(50), hz(57), hz(62), hz(66)], 0.014, { cutoff: 0.04, attack: 0.02, release: 1 });
    return { s, file: c.music, mix: { duckDepth: 0.5 } };
  },

  manifesto: () => {
    const c = CLIPS.manifesto;
    const { s, F } = studioFor(c, 1421);
    s.vinyl(0, F(c.beats), 0.03);
    const chords = [[57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 55, 59]];
    for (let b = 0; b < c.endAt; b++) {
      const f = F(b);
      // boom-bap: kick 1 & 3.5ish, snare 2 & 4, swung hats
      if (b % 4 === 0) s.kick(f, 0.85);
      if (b % 4 === 2) s.kick(f + F(0.5), 0.6);
      if (b % 2 === 1) s.snare(f, 0.38, 0.3);
      s.hat(f, 0.05);
      s.hat(f + F(0.58), 0.035);
      if (b % 4 === 0) s.rhodes(f, chords[(b / 4) % 4].map(hz), 0.9, 0.05);
      if (b % 4 === 0) s.sub(f, hz(chords[(b / 4) % 4][0] - 24), 0.6, 0.2);
    }
    // a stab on every word
    c.shots.forEach((sh, i) => s.bell(F(sh.b), hz(76 + ((i * 5) % 12)), 0.05, { ratio: 3, index: 1.2, dec: 0.35 }));
    // the five steps get a rising piano
    [9, 10, 11, 12, 13].forEach((b, i) => s.rhodes(F(b), [hz(64 + i * 2), hz(67 + i * 2), hz(71 + i * 2)], 0.5, 0.05));
    s.whoosh(F(14.5), 0.4, 0.2, true);
    // strings swell into the end
    s.supersaw(F(17), F(c.beats), [hz(57), hz(64), hz(69), hz(72)], 0.014, { cutoff: 0.05, attack: 2, release: 1.5 });
    s.impact(F(c.endAt), 1);
    return { s, file: c.music, mix: { duckDepth: 0.35 } };
  },
};

const only = process.argv[2];
for (const [name, build] of Object.entries(tracks)) {
  if (only && only !== name) continue;
  const { s, file, mix } = build();
  s.write(path.join(root, "public", file), mix);
  console.log(`public/${file} written`);
}
