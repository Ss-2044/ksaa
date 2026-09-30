// Generates the soundtracks for the game-themed videos (src/games/*/timeline.json):
//   node scripts/make-games-music.mjs            -> all tracks
//   node scripts/make-games-music.mjs kaboot     -> just one
// Each track is a short score plus sound effects placed on that video's timeline.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createSynth } from "./synth.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const load = (name) => JSON.parse(fs.readFileSync(path.join(root, `src/games/${name}/timeline.json`), "utf8"));

// Extra instruments shared by the game tracks.
const extras = (s) => {
  const { SR, at, add, rnd, kick } = s;
  return {
    // Card snapped onto the table.
    cardSnap: (frame, gain = 0.35) => {
      const st = at(frame);
      let hp = 0;
      for (let i = 0; i < 0.08 * SR; i++) {
        const n = rnd();
        hp = 0.7 * hp + 0.3 * n;
        add(st + i, (n - hp) * Math.exp(-(i / SR) * 60) * gain);
      }
    },
    // Short plucked note.
    pluck: (frame, freq, gain = 0.12) => {
      const st = at(frame);
      for (let i = 0; i < 0.7 * SR; i++) {
        const t = i / SR;
        const v = (Math.sin(2 * Math.PI * freq * t) + 0.3 * Math.sin(2 * Math.PI * freq * 3 * t) * Math.exp(-t * 25)) * Math.exp(-t * 7) * gain;
        add(st + i, v * 0.9, v);
      }
    },
    // Sustained pad chord between two frames.
    pad: (from, to, freqs, gain = 0.02) => {
      const s0 = at(from);
      const s1 = at(to);
      for (let i = s0; i < s1; i++) {
        const t = i / SR;
        const p = (i - s0) / (s1 - s0);
        const env = Math.min(1, p * 6) * Math.min(1, (1 - p) * 6);
        let v = 0;
        for (const f of freqs) v += Math.sin(2 * Math.PI * f * t) + 0.25 * Math.sin(2 * Math.PI * f * 2.003 * t);
        add(i, v * env * gain, v * env * gain * 0.95);
      }
    },
    // Heavy metallic latch.
    latch: (frame, gain = 0.6) => {
      const st = at(frame);
      for (let i = 0; i < 0.5 * SR; i++) {
        const t = i / SR;
        let v = 0;
        [180, 410, 870, 1530].forEach((f, k) => (v += (Math.sin(2 * Math.PI * f * t) * Math.exp(-t * (14 + k * 6))) / (k + 1)));
        add(st + i, v * gain);
      }
      kick(frame, gain);
    },
    // Wind / air (slow filtered noise).
    wind: (from, len, gain = 0.15) => {
      const st = at(from);
      let lp = 0;
      for (let i = 0; i < len * SR; i++) {
        const p = i / (len * SR);
        lp += (0.01 + 0.02 * Math.sin(p * 9)) * (rnd() - lp);
        add(st + i, lp * gain * 4 * Math.min(1, p * 5) * Math.min(1, (1 - p) * 5));
      }
    },
    // Droplet: short falling sine.
    plip: (frame, gain = 0.2) => {
      const st = at(frame);
      for (let i = 0; i < 0.15 * SR; i++) {
        const t = i / SR;
        add(st + i, Math.sin(2 * Math.PI * (1400 - t * 5000) * t) * Math.exp(-t * 30) * gain);
      }
    },
    // Darbuka: low "doum" and bright "tak".
    doum: (frame, gain = 0.5) => {
      const st = at(frame);
      for (let i = 0; i < 0.3 * SR; i++) {
        const t = i / SR;
        add(st + i, Math.sin(2 * Math.PI * (90 + 60 * Math.exp(-t * 20)) * t) * Math.exp(-t * 9) * gain);
      }
    },
    tak: (frame, gain = 0.25) => {
      const st = at(frame);
      let hp = 0;
      for (let i = 0; i < 0.06 * SR; i++) {
        const n = rnd();
        hp = 0.4 * hp + 0.6 * n;
        add(st + i, ((n - hp) * 0.6 + Math.sin(2 * Math.PI * 900 * (i / SR)) * 0.5) * Math.exp(-(i / SR) * 60) * gain);
      }
    },
    // Engine: buzzy tone gliding between two pitches.
    engine: (from, to, f0, f1, gain = 0.08) => {
      const s0 = at(from);
      const s1 = at(to);
      let ph = 0;
      for (let i = s0; i < s1; i++) {
        const p = (i - s0) / (s1 - s0);
        const f = f0 + (f1 - f0) * p * p;
        ph += (2 * Math.PI * f) / SR;
        const v = Math.sin(ph) + 0.5 * Math.sin(2 * ph) + 0.33 * Math.sin(3 * ph) + 0.25 * Math.sin(4 * ph);
        add(i, v * gain * Math.min(1, p * 20) * Math.min(1, (1 - p) * 20));
      }
    },
    // Liquid pour: bubbly band-limited noise.
    liquid: (from, len, gain = 0.2) => {
      const st = at(from);
      let lp = 0;
      let lp2 = 0;
      for (let i = 0; i < len * SR; i++) {
        const t = i / SR;
        lp += 0.2 * (rnd() - lp);
        lp2 += 0.05 * (lp - lp2);
        const bub = 0.6 + 0.4 * Math.sin(2 * Math.PI * (9 + 3 * Math.sin(t * 5)) * t);
        add(st + i, (lp - lp2) * bub * gain * 3 * Math.min(1, t * 20) * Math.min(1, (len - t) * 10));
      }
    },
    // Crowd roar (filtered noise swell).
    crowd: (from, len, gain = 0.25) => {
      const st = at(from);
      let lp = 0;
      let lp2 = 0;
      for (let i = 0; i < len * SR; i++) {
        const p = i / (len * SR);
        lp += 0.08 * (rnd() - lp);
        lp2 += 0.02 * (lp - lp2);
        const env = Math.min(1, p * 8) * Math.pow(1 - p, 1.5);
        add(st + i, (lp - lp2) * env * gain * 3, (lp - lp2) * env * gain * 2.8);
      }
    },
  };
};

const tracks = {
  kaboot: () => {
    const tl = load("kaboot");
    const s = createSynth({ seconds: tl.durationInFrames / tl.fps, fps: tl.fps, bpm: tl.bpm, seed: 71 });
    const x = extras(s);
    const { beatFrames, beatsBetween, kick, clap, hat, bass, hit, whoosh, riser, ping } = s;
    const { intro, chaos, hand, tricks, kaboot, outro } = tl;
    // Arabic-flavoured scale (Hijaz on D): D Eb F# G A Bb C
    const hijaz = [293.66, 311.13, 369.99, 392, 440, 466.16, 523.25, 587.33];
    x.pad(0, outro.from + 60, [146.83, 220, 293.66], 0.018);
    whoosh(intro.from + 2, 0.6, 0.3, false);
    x.cardSnap(intro.from + 16, 0.5);
    [0, 2, 4, 3].forEach((n, i) => x.pluck(intro.from + 24 + i * 12, hijaz[n], 0.1));
    // chaos: flurry of card snaps and whooshes
    for (let i = 0; i < 26; i++) x.cardSnap(chaos.from + i * 1.5 + 6, 0.18);
    for (let i = 0; i < 6; i++) whoosh(chaos.from + i * 16, 0.35, 0.18, i % 2 === 0);
    riser(chaos.to - 40, hand.gather, 0.2);
    // hand: shuffle, then deal
    hit(hand.gather, 0.7);
    for (let i = 0; i < 5; i++) x.cardSnap(hand.deal + i * 5, 0.35);
    // tricks: groove + snaps + a winning ping per trick
    beatsBetween(tricks.from, kaboot.from - 8, (f, b) => {
      kick(f, 0.7);
      hat(f + beatFrames / 2, 0.08);
      if (b % 2 === 1) clap(f, 0.25);
      if (b % 2 === 0) bass(f, 73.42, 0.35, 0.2);
      x.pluck(f + beatFrames / 2, hijaz[(b * 3) % hijaz.length], 0.06);
    });
    for (let k = 0; k < tricks.count; k++) {
      const t0 = tricks.from + k * tricks.each;
      tricks.opp.forEach((d) => x.cardSnap(t0 + d + 8, 0.3));
      x.cardSnap(t0 + tricks.ours + 10, 0.5);
      whoosh(t0 + tricks.win, 0.4, 0.2, false);
      ping(t0 + tricks.win + 8, hijaz[k + 2] * 2, 0.1);
    }
    // kaboot!
    riser(kaboot.from - 36, kaboot.from, 0.3);
    hit(kaboot.from, 1.3);
    kick(kaboot.from, 1);
    for (let i = 0; i < 14; i++) x.cardSnap(kaboot.from + 2 + i, 0.2);
    whoosh(kaboot.flip - 14, 0.6, 0.35, true);
    hit(kaboot.flip + 16, 0.7);
    [0, 2, 4, 7].forEach((n, i) => x.pluck(kaboot.flip + 18 + i * 4, hijaz[n] * 2, 0.08));
    hit(outro.from, 0.7);
    x.pad(outro.from, outro.from + outro.duration, [146.83, 220, 293.66, 369.99], 0.025);
    return { s, file: "kaboot-music.wav" };
  },
  vault: () => {
    const tl = load("vault");
    const s = createSynth({ seconds: tl.durationInFrames / tl.fps, fps: tl.fps, bpm: tl.bpm, seed: 83 });
    const x = extras(s);
    const { at, add, SR, beatFrames, beatsBetween, kick, clap, hat, bass, hit, whoosh, riser, click, ping } = s;
    const { intro, locked, answer, code, open, outro } = tl;
    // Low buzzer for the "locked" lamp.
    const buzz = (frame, gain = 0.08) => {
      const st = at(frame);
      for (let i = 0; i < 0.2 * SR; i++) {
        const t = i / SR;
        add(st + i, Math.sign(Math.sin(2 * Math.PI * 110 * t)) * Math.exp(-t * 6) * gain);
      }
    };
    x.pad(0, open.door + 20, [55, 82.41, 110, 130.81], 0.02);
    whoosh(intro.from + 10, 1.4, 0.2, true);
    hit(intro.from + 30, 0.6);
    // locked: frantic ticks, buzzer on every lamp flash
    for (let f = locked.from; f < answer.from; f += 2) click(f, 0.06);
    for (let f = locked.from; f < answer.from; f += 14) buzz(f);
    // answer: reset + clean hit
    hit(answer.from, 0.8);
    ping(answer.from + 4, 440, 0.1);
    // code: slow pulse, dial ticks while turning, a latch on every number
    beatsBetween(code.from, open.from, (f, b) => {
      kick(f, 0.55);
      hat(f + beatFrames / 2, 0.06);
      if (b % 2 === 1) clap(f, 0.16);
      if (b % 2 === 0) bass(f, 55, 0.4, 0.2);
    });
    code.values.forEach((_, k) => {
      const st = code.from + k * code.each;
      for (let f = st; f < st + code.turn; f += 1.5) click(f, 0.05);
      x.latch(st + code.turn, 0.5);
      ping(st + code.turn + 2, [440, 493.88, 523.25, 587.33, 659.25][k], 0.1);
    });
    // open: wheel ratchet, bolts, heavy door + swell
    for (let f = open.wheel; f < open.bolts; f += 2.5) click(f, 0.09);
    for (let i = 0; i < 8; i++) x.latch(open.bolts + i * 1.5, 0.25);
    riser(open.bolts, open.door, 0.25);
    whoosh(open.door, 1.8, 0.4, true);
    hit(open.door + 10, 1.2);
    x.pad(open.door + 10, outro.from + outro.duration, [220, 277.18, 329.63, 440], 0.028);
    [880, 1108.73, 1318.51].forEach((f, i) => ping(open.door + 20 + i * 6, f, 0.08));
    hit(outro.from, 0.7);
    return { s, file: "vault-music.wav" };
  },
  domino: () => {
    const tl = load("domino");
    const s = createSynth({ seconds: tl.durationInFrames / tl.fps, fps: tl.fps, bpm: tl.bpm, seed: 97 });
    const x = extras(s);
    const { at, add, SR, rnd, beatFrames, beatsBetween, kick, clap, hat, bass, hit, whoosh, riser, ping } = s;
    const { intro, scatter, align, chain, overview, giant, outro } = tl;
    // Domino tap: pitch drops as the tiles grow.
    const tap = (frame, size, gain = 0.4) => {
      const st = at(frame);
      const f = 1400 / Math.sqrt(size);
      let lp = 0;
      for (let i = 0; i < 0.3 * SR; i++) {
        const t = i / SR;
        lp += 0.35 * (rnd() - lp);
        add(st + i, (Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 40) + lp * Math.exp(-t * 120) * 0.5) * gain);
      }
    };
    // same tile timing as the video
    const tiles = [];
    let t = chain.push;
    for (let i = 0; i < chain.count; i++) {
      const h = Math.pow(chain.grow, i);
      const dur = 12 * Math.sqrt(h);
      tiles.push({ start: t, dur, size: h });
      t += dur * 0.62;
    }
    x.pad(0, overview.from, [98, 146.83, 196], 0.016);
    tap(intro.from + 20, 1, 0.5);
    ping(intro.from + 24, 784, 0.08);
    for (let i = 1; i < 8; i++) tap(scatter.from + i * 5 + 14, 1 + i * 0.2, 0.3);
    tap(scatter.loneFall + 12, 1, 0.6);
    x.pad(scatter.loneFall + 12, align.from, [92.5, 138.59], 0.02); // an empty, unresolved moment
    for (let i = 0; i < 16; i++) tap(align.from + i * 3 + 30, 1.2, 0.18);
    riser(align.to - 30, chain.push, 0.22);
    // the chain: taps accelerate into a groove
    tiles.forEach((tt, i) => tap(tt.start + tt.dur * 0.64, tt.size, 0.35 + i * 0.03));
    beatsBetween(chain.push, overview.from, (f, b) => {
      kick(f, 0.7);
      hat(f + beatFrames / 2, 0.08);
      if (b % 2 === 1) clap(f, 0.25);
      bass(f, [49, 49, 55, 58.27][Math.floor(b / 4) % 4], 0.35, 0.22);
    });
    chain.milestones.forEach((m, k) => ping(tiles[m].start + 2, [523.25, 587.33, 659.25, 783.99, 880][k], 0.1));
    kick(tiles[tiles.length - 1].start + tiles[tiles.length - 1].dur, 1);
    hit(tiles[tiles.length - 1].start + tiles[tiles.length - 1].dur, 0.9);
    // overview + the giant tile
    x.pad(overview.from, outro.from + 60, [98, 146.83, 196, 246.94], 0.024);
    whoosh(giant.from, 0.8, 0.3, false);
    riser(giant.from + 5, giant.fall + 30, 0.3);
    hit(giant.fall + 34, 1.4);
    kick(giant.fall + 34, 1.1);
    hit(outro.from, 0.6);
    return { s, file: "domino-music.wav" };
  },
  football: () => {
    const tl = load("football");
    const s = createSynth({ seconds: tl.durationInFrames / tl.fps, fps: tl.fps, bpm: tl.bpm, seed: 101 });
    const x = extras(s);
    const { at, add, SR, beatFrames, beatsBetween, kick, clap, hat, bass, hit, whoosh, riser, scribble, ping } = s;
    const { intro, lost, plan, passes, shot, outro } = tl;
    // Referee whistle: trilled high tone.
    const whistle = (frame, len = 0.5, gain = 0.1) => {
      const st = at(frame);
      for (let i = 0; i < len * SR; i++) {
        const t = i / SR;
        const f = 2900 + Math.sin(2 * Math.PI * 28 * t) * 120;
        const env = Math.min(1, t * 40) * Math.min(1, (len - t) * 20);
        add(st + i, Math.sin(2 * Math.PI * f * t) * env * gain);
      }
    };
    const ballKick = (frame, gain = 0.6) => {
      kick(frame, gain);
      const st = at(frame);
      for (let i = 0; i < 0.05 * SR; i++) add(st + i, Math.sin(i * 0.4) * Math.exp(-(i / SR) * 90) * gain * 0.4);
    };
    // chalk drawing the pitch, then the stadium murmur underneath everything
    scribble(4, intro.pitchTo, 0.05);
    x.crowd(0, outro.from / tl.fps, 0.06);
    whistle(intro.pitchTo + 4, 0.35);
    whistle(intro.pitchTo + 20, 0.6);
    // lost: aimless bounces
    for (let i = 0; i < 7; i++) ballKick(lost.from + i * 14, 0.3);
    x.pad(lost.from, plan.from, [110, 116.54, 164.81], 0.02);
    // plan: chalk arrows
    scribble(plan.from + 10, plan.to - 10, 0.06);
    hit(plan.from, 0.6);
    // passes: driving groove, a kick per pass, crowd lifts each time
    beatsBetween(passes.from, shot.kick - 8, (f, b) => {
      kick(f, 0.7);
      hat(f + beatFrames / 2, 0.09);
      if (b % 2 === 1) clap(f, 0.3);
      bass(f, [55, 55, 65.41, 73.42][Math.floor(b / 4) % 4], 0.3, 0.22);
    });
    for (let k = 0; k < 5; k++) {
      const st = passes.from + k * passes.each;
      ballKick(st, 0.7);
      whoosh(st, passes.travel / tl.fps + 0.1, 0.2, k % 2 === 0);
      x.crowd(st + passes.travel, 1.4, 0.12 + k * 0.02);
      ping(st + passes.travel, [523.25, 587.33, 659.25, 783.99, 880][k], 0.07);
    }
    // the shot: silence, slow-mo riser, GOAL
    riser(shot.from - 10, shot.goal, 0.3);
    ballKick(shot.kick, 1);
    whoosh(shot.kick, (shot.goal - shot.kick) / tl.fps, 0.35, false);
    hit(shot.goal, 1.3);
    x.crowd(shot.goal, 3.5, 0.55);
    whistle(shot.goal + 30, 0.25);
    whistle(shot.goal + 40, 0.25);
    whistle(shot.goal + 50, 0.9);
    x.pad(shot.goal, outro.from + outro.duration, [110, 138.59, 164.81, 220], 0.024);
    hit(outro.from, 0.6);
    return { s, file: "football-music.wav" };
  },
  rubik: () => {
    const tl = load("rubik");
    const s = createSynth({ seconds: tl.durationInFrames / tl.fps, fps: tl.fps, bpm: tl.bpm, seed: 113 });
    const x = extras(s);
    const { at, add, SR, rnd, beatFrames, beatsBetween, kick, clap, hat, bass, hit, whoosh, riser, click, ping } = s;
    const { intro, chaos, answer, solve, reveal, outro } = tl;
    // Plastic layer turning: a short ratchet, then a snap as it settles.
    const twist = (frame, len, gain = 0.3) => {
      for (let f = frame; f < frame + len; f += 2) click(f, gain * 0.25);
      const st = at(frame + len);
      let hp = 0;
      for (let i = 0; i < 0.06 * SR; i++) {
        const n = rnd();
        hp = 0.5 * hp + 0.5 * n;
        add(st + i, ((n - hp) * 0.8 + Math.sin(i * 0.25) * 0.5) * Math.exp(-(i / SR) * 70) * gain);
      }
    };
    x.pad(0, reveal.face, [110, 164.81, 220], 0.016);
    whoosh(intro.from + 4, 0.9, 0.3, false);
    hit(intro.from + 22, 0.5);
    // chaos: rapid twists
    for (let i = 0; i < 8; i++) twist(chaos.movesFrom + i * chaos.each, chaos.each - 1, 0.3);
    x.pad(chaos.from, answer.from, [103.83, 110, 155.56], 0.02);
    // answer: calm hit
    hit(answer.from, 0.7);
    ping(answer.from + 4, 659.25, 0.1);
    // solve: steady groove, one twist per service
    beatsBetween(solve.from, reveal.from, (f, b) => {
      kick(f, 0.65);
      hat(f + beatFrames / 2, 0.08);
      if (b % 2 === 1) clap(f, 0.24);
      bass(f, [55, 55, 49, 61.74][Math.floor(b / 4) % 4], 0.35, 0.2);
    });
    for (let k = 0; k < 5; k++) {
      const st = solve.from + k * solve.each;
      twist(st, solve.turn, 0.45);
      ping(st + solve.turn, [659.25, 739.99, 830.61, 880, 987.77][k], 0.1);
    }
    // reveal: the cube turns to face us, the logo locks in
    whoosh(reveal.from, 1.2, 0.3, true);
    riser(reveal.from, reveal.face, 0.28);
    hit(reveal.face, 1.2);
    x.pad(reveal.face, outro.from + outro.duration, [220, 277.18, 329.63, 440], 0.026);
    [1318.51, 1661.22, 1975.53].forEach((f, i) => ping(reveal.face + 4 + i * 5, f, 0.07));
    hit(outro.from, 0.6);
    return { s, file: "rubik-music.wav" };
  },
  stars: () => {
    const tl = load("stars");
    const s = createSynth({ seconds: tl.durationInFrames / tl.fps, fps: tl.fps, bpm: tl.bpm, seed: 131 });
    const x = extras(s);
    const { hit, whoosh, riser, ping } = s;
    const { sky, lost, link, north, outro } = tl;
    const hijaz = [293.66, 311.13, 369.99, 392, 440, 466.16, 523.25, 587.33];
    // calm: long pads, a slow oud-like melody, bells on each linked star
    x.pad(0, lost.from + 10, [146.83, 220, 293.66], 0.02);
    x.pad(lost.from, link.from + 10, [146.83, 155.56, 220], 0.02);
    x.pad(link.from, outro.from + outro.duration, [146.83, 220, 293.66, 369.99], 0.022);
    x.wind(0, tl.durationInFrames / tl.fps, 0.05);
    [0, 2, 4, 3, 2, 1, 0].forEach((n, i) => x.pluck(sky.from + 20 + i * 14, hijaz[n], 0.08));
    for (let k = 0; k < 5; k++) {
      const f = link.from + k * link.each;
      ping(f + 28, [587.33, 659.25, 739.99, 880, 987.77][k], 0.12);
      x.pluck(f + 30, hijaz[(k * 2) % 8] / 2, 0.08);
    }
    riser(north.from, north.logo, 0.15);
    hit(north.logo, 0.6);
    [1174.66, 1479.98, 1760, 2349.32].forEach((f, i) => ping(north.logo + 4 + i * 6, f, 0.06));
    whoosh(north.shoot, 0.8, 0.2, false);
    ping(north.shoot + 20, 2637, 0.05);
    return { s, file: "stars-music.wav" };
  },
  sadu: () => {
    const tl = load("sadu");
    const s = createSynth({ seconds: tl.durationInFrames / tl.fps, fps: tl.fps, bpm: tl.bpm, seed: 137 });
    const x = extras(s);
    const { beatFrames, beatsBetween, hit, whoosh, riser, ping, bass } = s;
    const { tangle, lost, warp, weave, finish, outro } = tl;
    const hijaz = [220, 233.08, 277.18, 293.66, 329.63, 349.23, 392, 440];
    x.pad(0, outro.from + outro.duration, [110, 164.81, 220], 0.018);
    for (let i = 0; i < 18; i++) whoosh(tangle.from + i * 3, 0.25, 0.05, i % 2 === 0);
    x.pad(lost.from, warp.from, [110, 116.54, 164.81], 0.02);
    // warp: threads snap straight
    for (let i = 0; i < 18; i++) x.tak(warp.from + i * 2, 0.12);
    hit(warp.to, 0.5);
    // weaving: darbuka maqsum rhythm + a loom beat every two rows
    const rows = 5 * weave.rowsPerBand;
    const end = weave.from + rows * weave.rowFrames;
    beatsBetween(weave.from, end, (f, b) => {
      const bar = b % 4;
      if (bar === 0) x.doum(f, 0.45);
      if (bar === 1 || bar === 3) x.tak(f, 0.22);
      x.tak(f + beatFrames / 2, 0.12);
      if (bar === 2) x.doum(f + beatFrames / 2, 0.35);
      if (b % 2 === 0) bass(f, 55, 0.4, 0.18);
      x.pluck(f + beatFrames / 2, hijaz[(b * 3) % 8], 0.07);
    });
    for (let r = 0; r < rows; r += 2) x.latch(weave.from + r * weave.rowFrames, 0.12);
    for (let b = 0; b < 5; b++) ping(weave.from + (b + 1) * weave.rowsPerBand * weave.rowFrames, hijaz[b + 3] * 2, 0.1);
    riser(end - 10, finish.logo, 0.2);
    hit(finish.logo, 0.9);
    [0, 2, 4, 7].forEach((n, i) => x.pluck(finish.logo + 10 + i * 5, hijaz[n] * 2, 0.08));
    return { s, file: "sadu-music.wav" };
  },
  falcon: () => {
    const tl = load("falcon");
    const s = createSynth({ seconds: tl.durationInFrames / tl.fps, fps: tl.fps, bpm: tl.bpm, seed: 139 });
    const x = extras(s);
    const { at, add, SR, beatFrames, beatsBetween, kick, hat, hit, whoosh, riser, ping } = s;
    const { perch, blind, unhood, circles, dive, outro } = tl;
    const bells = (frame) => [2637, 3136, 2793.83].forEach((f, i) => ping(frame + i * 3, f, 0.05));
    x.wind(0, tl.durationInFrames / tl.fps, 0.1);
    x.pad(0, unhood.from + 20, [98, 146.83, 196], 0.02);
    bells(perch.from + 40);
    x.pad(blind.from, unhood.from, [98, 103.83, 146.83], 0.02);
    // unhood: bells, a bright hit
    bells(unhood.from + 12);
    hit(unhood.from + 40, 0.7);
    ping(unhood.from + 44, 1174.66, 0.08);
    // circling: wingbeats + rising pulse
    for (let f = circles.from - 16; f < dive.from; f += 9) whoosh(f, 0.25, 0.12, f % 18 === 0);
    beatsBetween(circles.from, dive.from, (f, b) => {
      kick(f, 0.45 + b * 0.01);
      hat(f + beatFrames / 2, 0.06);
    });
    x.pad(circles.from, dive.hit, [146.83, 220, 293.66, 349.23], 0.022);
    for (let k = 0; k < 5; k++) ping(circles.from + k * circles.each + 6, [587.33, 659.25, 698.46, 783.99, 880][k], 0.09);
    // dive: descending whistle into the strike
    const s0 = at(dive.from);
    const s1 = at(dive.hit);
    let ph = 0;
    for (let i = s0; i < s1; i++) {
      const p = (i - s0) / (s1 - s0);
      ph += (2 * Math.PI * (1800 - 1300 * p)) / SR;
      add(i, Math.sin(ph) * 0.05 * p);
    }
    riser(dive.from - 10, dive.hit, 0.3);
    hit(dive.hit, 1.3);
    kick(dive.hit, 1);
    x.pad(dive.hit, outro.from + outro.duration, [146.83, 220, 293.66, 369.99], 0.026);
    bells(dive.hit + 20);
    return { s, file: "falcon-music.wav" };
  },
  calligraphy: () => {
    const tl = load("calligraphy");
    const s = createSynth({ seconds: tl.durationInFrames / tl.fps, fps: tl.fps, bpm: tl.bpm, seed: 149 });
    const x = extras(s);
    const { hit, ping, scribble } = s;
    const { drop, blot, write, flourish, logo, outro } = tl;
    // calm and airy: a single drop, soft pads, pen scratching, gentle notes
    x.pad(0, blot.to, [174.61, 261.63, 349.23], 0.016);
    x.plip(drop.splat, 0.3);
    x.pad(blot.from, write.from + 10, [174.61, 185, 261.63], 0.016);
    x.pad(write.from, outro.from + outro.duration, [174.61, 261.63, 349.23, 440], 0.02);
    scribble(write.from + 10, write.to, 0.035);
    for (let k = 0; k < 5; k++) {
      const f = write.from + 20 + k * write.noteEach;
      x.pluck(f, [523.25, 587.33, 659.25, 698.46, 783.99][k], 0.07);
    }
    scribble(flourish.from, flourish.to - 30, 0.03);
    [0, 1, 2].forEach((i) => ping(flourish.from + 40 + i * 10, [880, 1046.5, 1318.51][i], 0.05));
    hit(logo.from + 20, 0.4);
    [698.46, 880, 1046.5, 1396.91].forEach((f, i) => x.pluck(logo.from + 24 + i * 6, f, 0.07));
    return { s, file: "calligraphy-music.wav" };
  },
  pitstop: () => {
    const tl = load("pitstop");
    const s = createSynth({ seconds: tl.durationInFrames / tl.fps, fps: tl.fps, bpm: tl.bpm, seed: 151 });
    const x = extras(s);
    const { beatFrames, beatsBetween, kick, clap, hat, bass, hit, whoosh, riser, click, ping } = s;
    const { stalled, lost, crew, stop, race, outro } = tl;
    // sputtering engine, then silence
    for (let i = 0; i < 5; i++) x.engine(stalled.from + i * 18, stalled.from + i * 18 + 10, 60, 45, 0.06);
    x.pad(lost.from, crew.from, [110, 116.54], 0.018);
    // crew in: clap-count, car rolls in
    hit(crew.from, 0.6);
    x.engine(stop.arrive, stop.start, 140, 70, 0.07);
    // the stop: pounding groove, an air-wrench burst per action
    beatsBetween(stop.start, stop.go, (f, b) => {
      kick(f, 0.8);
      hat(f + beatFrames / 2, 0.1);
      if (b % 2 === 1) clap(f, 0.3);
      bass(f, 55, 0.2, 0.2);
    });
    for (let k = 0; k < 5; k++) {
      const f = stop.start + k * stop.each;
      for (let i = 0; i < 10; i++) click(f + 4 + i * 1.2, 0.12);
      x.engine(f + 4, f + 18, 900, 1400, 0.03);
      x.latch(f + 30, 0.35);
      ping(f + 30, [659.25, 739.99, 830.61, 880, 987.77][k], 0.08);
    }
    // GO: launch
    hit(stop.go, 1.1);
    x.engine(stop.go, race.from + 40, 120, 520, 0.09);
    whoosh(stop.go + 6, 1.2, 0.4, false);
    beatsBetween(race.from, race.finish, (f, b) => {
      kick(f, 0.9);
      hat(f + beatFrames / 2, 0.1);
      hat(f + beatFrames / 4, 0.05);
      if (b % 2 === 1) clap(f, 0.32);
    });
    riser(race.finish - 30, race.finish, 0.3);
    hit(race.finish, 1.3);
    x.crowd(race.finish, 3, 0.4);
    x.pad(race.finish, outro.from + outro.duration, [110, 138.59, 164.81, 220], 0.024);
    return { s, file: "pitstop-music.wav" };
  },
  gears: () => {
    const tl = load("gears");
    const s = createSynth({ seconds: tl.durationInFrames / tl.fps, fps: tl.fps, bpm: tl.bpm, seed: 157 });
    const x = extras(s);
    const { beatFrames, beatsBetween, kick, clap, hat, bass, hit, riser, click, ping } = s;
    const { alone, lost, mesh, machine, outro } = tl;
    // one gear ticking alone, then racing with nothing to drive
    for (let f = alone.from + 10; f < lost.from; f += 6) click(f, 0.08);
    for (let f = lost.from; f < mesh.from; f += 2) click(f, 0.07);
    x.pad(lost.from, mesh.from, [98, 103.83, 146.83], 0.02);
    // each link: slide, clunk, and the groove grows
    for (let k = 0; k < 5; k++) {
      const f = mesh.from + k * mesh.each;
      x.latch(f + 18, 0.55);
      ping(f + 20, [392, 440, 493.88, 523.25, 587.33][k], 0.09);
    }
    beatsBetween(mesh.from + 18, machine.to, (f, b) => {
      const layer = Math.min(5, Math.floor((f - mesh.from) / mesh.each) + 1);
      kick(f, 0.6);
      if (layer >= 2) hat(f + beatFrames / 2, 0.08);
      if (layer >= 3 && b % 2 === 1) clap(f, 0.25);
      if (layer >= 4) bass(f, [49, 49, 55, 58.27][Math.floor(b / 4) % 4], 0.3, 0.2);
      if (layer >= 5) click(f + beatFrames / 4, 0.05);
    });
    riser(machine.from, machine.engage + 18, 0.28);
    hit(machine.engage + 18, 1.2);
    x.latch(machine.engage + 18, 0.8);
    x.pad(machine.engage + 18, outro.from + outro.duration, [98, 146.83, 196, 246.94], 0.024);
    return { s, file: "gears-music.wav" };
  },
  dallah: () => {
    const tl = load("dallah");
    const s = createSynth({ seconds: tl.durationInFrames / tl.fps, fps: tl.fps, bpm: tl.bpm, seed: 163 });
    const x = extras(s);
    const { beatFrames, beatsBetween, hit, whoosh, ping } = s;
    const { empty, lost, enter, pour, serve, outro } = tl;
    const hijaz = [196, 207.65, 246.94, 261.63, 293.66, 311.13, 349.23, 392];
    x.pad(0, outro.from + outro.duration, [98, 146.83, 196], 0.018);
    ping(empty.from + 30, 2093, 0.05); // cup set down
    for (let i = 0; i < 6; i++) x.tak(lost.from + i * 16, 0.1);
    whoosh(enter.from, 0.8, 0.2, false);
    // pouring: a clink and a pour per service, gentle darbuka underneath
    beatsBetween(pour.from, serve.from, (f, b) => {
      if (b % 4 === 0) x.doum(f, 0.35);
      if (b % 4 === 2) x.tak(f, 0.18);
      x.tak(f + beatFrames / 2, 0.08);
      x.pluck(f, hijaz[(b * 5) % 8], 0.06);
    });
    for (let k = 0; k < 5; k++) {
      const f = pour.from + k * pour.each;
      x.liquid(f + 8, (pour.flow - 4) / tl.fps, 0.25);
      ping(f + pour.flow + 6, 2349.32, 0.05);
    }
    whoosh(serve.from, 1, 0.25, true);
    hit(serve.top, 0.7);
    [0, 2, 4, 7].forEach((n, i) => x.pluck(serve.top + 10 + i * 5, hijaz[n] * 2, 0.08));
    return { s, file: "dallah-music.wav" };
  },
  lens: () => {
    const tl = load("lens");
    const s = createSynth({ seconds: tl.durationInFrames / tl.fps, fps: tl.fps, bpm: tl.bpm, seed: 167 });
    const x = extras(s);
    const { beatFrames, beatsBetween, kick, clap, hat, bass, hit, riser, click, ping, shutter } = s;
    const { blur, lost, answer, rings, shutter: sh, reveal, outro } = tl;
    x.pad(0, answer.from, [110, 164.81, 220], 0.018);
    // focus hunting: motor whirr clicks
    for (let f = lost.from; f < answer.from; f += 3) click(f, 0.06);
    hit(answer.from, 0.6);
    beatsBetween(rings.from, sh.at, (f, b) => {
      kick(f, 0.6);
      hat(f + beatFrames / 2, 0.07);
      if (b % 2 === 1) clap(f, 0.2);
      bass(f, [55, 55, 61.74, 65.41][Math.floor(b / 4) % 4], 0.35, 0.18);
    });
    for (let k = 0; k < 5; k++) {
      const f = rings.from + k * rings.each;
      for (let i = 0; i < rings.turn; i += 2) click(f + i, 0.07);
      ping(f + rings.turn, [659.25, 739.99, 830.61, 987.77, 1108.73][k], 0.1);
    }
    x.pad(rings.from, reveal.to, [220, 277.18, 329.63], 0.02);
    riser(sh.at - 30, sh.at, 0.25);
    shutter(sh.at + 4, 0.6);
    hit(sh.at + 6, 1);
    x.pad(reveal.from, outro.from + outro.duration, [220, 277.18, 329.63, 440], 0.026);
    return { s, file: "lens-music.wav" };
  },
  radio: () => {
    const tl = load("radio");
    const s = createSynth({ seconds: tl.durationInFrames / tl.fps, fps: tl.fps, bpm: tl.bpm, seed: 173 });
    const x = extras(s);
    const { at, add, SR, rnd, beatFrames, beatsBetween, kick, clap, hat, bass, hit, whoosh, ping } = s;
    const { lost, answer, tune, broadcast, outro } = tl;
    // static that thins out with every station tuned
    const s0 = at(0);
    const s1 = at(broadcast.from);
    for (let i = s0; i < s1; i++) {
      const frame = (i / SR) * tl.fps;
      const tuned = tune.freqs.filter((_, k) => frame >= tune.from + k * tune.each + tune.move).length;
      const lvl = Math.max(0.03, 1 - tuned * 0.2) * 0.07 * (frame >= lost.from && frame < answer.from ? 1.4 : 1);
      add(i, rnd() * lvl);
    }
    // the station tone gets purer and a groove comes in
    tune.freqs.forEach((f, k) => {
      const t0 = tune.from + k * tune.each + tune.move;
      ping(t0, 330 + k * 55, 0.12);
      x.pad(t0, t0 + tune.each - tune.move, [110 + k * 13.75, 165 + k * 20.6], 0.012 + k * 0.004);
    });
    beatsBetween(tune.from + tune.each * 2, broadcast.from, (f, b) => {
      kick(f, 0.55);
      hat(f + beatFrames / 2, 0.07);
      if (b % 2 === 1) clap(f, 0.2);
    });
    // on air: full mix, big hit, waves
    hit(broadcast.from, 1.1);
    whoosh(broadcast.from, 1.5, 0.35, true);
    beatsBetween(broadcast.from + 10, outro.from, (f, b) => {
      kick(f, 0.8);
      hat(f + beatFrames / 2, 0.1);
      hat(f + beatFrames / 4, 0.05);
      if (b % 2 === 1) clap(f, 0.3);
      bass(f, [55, 55, 65.41, 73.42][Math.floor(b / 4) % 4], 0.35, 0.22);
    });
    x.pad(broadcast.from, outro.from + outro.duration, [220, 277.18, 329.63, 440], 0.024);
    return { s, file: "radio-music.wav" };
  },
  lighthouse: () => {
    const tl = load("lighthouse");
    const s = createSynth({ seconds: tl.durationInFrames / tl.fps, fps: tl.fps, bpm: tl.bpm, seed: 179 });
    const x = extras(s);
    const { at, add, SR, hit, riser, ping, kick } = s;
    const { storm, lost, light, path, harbor, outro } = tl;
    // sea + rain, easing off once the light is on
    x.wind(0, light.to / tl.fps, 0.22);
    x.wind(light.to / tl.fps - 0.5, (outro.from - light.to) / tl.fps, 0.08);
    for (let f = 0; f < light.to; f += 45) x.crowd(f, 1.6, 0.05); // wave crashes
    x.pad(0, light.on, [73.42, 77.78, 110], 0.022);
    // foghorn
    const horn = (frame, len = 1.4) => {
      const st2 = at(frame);
      for (let i = 0; i < len * SR; i++) {
        const t = i / SR;
        const env = Math.min(1, t * 4) * Math.min(1, (len - t) * 3);
        add(st2 + i, (Math.sin(2 * Math.PI * 82 * t) + 0.5 * Math.sin(2 * Math.PI * 164 * t) + 0.25 * Math.sin(2 * Math.PI * 246 * t)) * env * 0.07);
      }
    };
    horn(storm.from + 30);
    horn(lost.from + 40);
    // the light: a hit and a warm chord that carries the rest
    hit(light.on, 0.9);
    x.pad(light.on, outro.from + outro.duration, [146.83, 220, 293.66, 369.99], 0.024);
    for (let k = 0; k < 5; k++) {
      const f = path.from + k * path.each + 30;
      ping(f, [587.33, 659.25, 739.99, 880, 987.77][k], 0.1);
      kick(f, 0.35);
    }
    riser(harbor.from, harbor.arrive, 0.25);
    hit(harbor.arrive, 1);
    [1174.66, 1479.98, 1760].forEach((f, i) => ping(harbor.arrive + 6 + i * 6, f, 0.07));
    return { s, file: "lighthouse-music.wav" };
  },
  compass: () => {
    const tl = load("compass");
    const s = createSynth({ seconds: tl.durationInFrames / tl.fps, fps: tl.fps, bpm: tl.bpm, seed: 181 });
    const x = extras(s);
    const { beatFrames, beatsBetween, kick, hat, hit, riser, click, ping } = s;
    const { spin, lost, answer, steps, settle, outro } = tl;
    // the needle's rattle: fast while spinning, slowing with every step
    for (let f = spin.from; f < lost.from; f += 4) click(f, 0.07);
    for (let f = lost.from; f < answer.from; f += 1.5) click(f, 0.06);
    x.pad(0, answer.from, [98, 103.83, 146.83], 0.02);
    hit(answer.from, 0.6);
    for (let k = 0; k < 5; k++) {
      const f0 = steps.from + k * steps.each;
      for (let f = f0; f < f0 + steps.each; f += 3 + k * 2) click(f, 0.05);
      x.latch(f0 + 20, 0.3);
      ping(f0 + 22, [392, 440, 493.88, 523.25, 587.33][k], 0.1);
    }
    beatsBetween(steps.from, settle.lock, (f) => {
      kick(f, 0.5);
      hat(f + beatFrames / 2, 0.06);
    });
    x.pad(steps.from, settle.lock, [196, 246.94, 293.66], 0.018);
    riser(settle.from, settle.lock, 0.25);
    hit(settle.lock, 1.1);
    x.latch(settle.lock, 0.6);
    x.pad(settle.lock, outro.from + outro.duration, [196, 246.94, 293.66, 392], 0.026);
    return { s, file: "compass-music.wav" };
  },
  palm: () => {
    const tl = load("palm");
    const s = createSynth({ seconds: tl.durationInFrames / tl.fps, fps: tl.fps, bpm: tl.bpm, seed: 191 });
    const x = extras(s);
    const { beatFrames, beatsBetween, hit, whoosh, riser, ping, bass } = s;
    const { lost, water, grow, harvest, outro } = tl;
    const hijaz = [196, 207.65, 246.94, 261.63, 293.66, 311.13, 349.23, 392];
    x.wind(0, water.from / tl.fps, 0.08);
    x.pad(0, water.drop, [98, 146.83], 0.016);
    x.pad(lost.from, water.drop, [98, 103.83], 0.018);
    x.plip(water.drop, 0.35);
    hit(water.drop + 2, 0.5);
    // growth: rising darbuka groove and an ascending melody, one phrase per stage
    beatsBetween(grow.from, harvest.from, (f, b) => {
      if (b % 4 === 0) x.doum(f, 0.4);
      if (b % 4 === 2) x.tak(f, 0.2);
      x.tak(f + beatFrames / 2, 0.08);
      if (b % 2 === 0) bass(f, 49, 0.4, 0.16);
    });
    for (let k = 0; k < 5; k++) {
      const f = grow.from + k * grow.each;
      whoosh(f, 1.3, 0.12, k % 2 === 0);
      [0, 2, 4].forEach((n, i) => x.pluck(f + 10 + i * 6, hijaz[(n + k) % 8] * (k > 2 ? 2 : 1), 0.08));
      x.pad(f, f + grow.each, [98 * (1 + k * 0.125), 146.83, 196], 0.014 + k * 0.003);
    }
    riser(harvest.from - 20, harvest.from + 20, 0.25);
    hit(harvest.from + 20, 1);
    x.pad(harvest.from + 20, outro.from + outro.duration, [196, 246.94, 293.66, 392], 0.026);
    [0, 2, 4, 7].forEach((n, i) => ping(harvest.from + 26 + i * 5, hijaz[n] * 4, 0.06));
    return { s, file: "palm-music.wav" };
  },
  maestro: () => {
    const tl = load("maestro");
    const s = createSynth({ seconds: tl.durationInFrames / tl.fps, fps: tl.fps, bpm: tl.bpm, seed: 193 });
    const x = extras(s);
    const { rnd, beatFrames, beatsBetween, kick, clap, hat, bass, hit, riser, ping } = s;
    const { noise, lost, baton, sections, finale, outro } = tl;
    const scale = [261.63, 293.66, 329.63, 349.23, 392, 440, 493.88, 523.25];
    // cacophony: random notes from every instrument at once
    for (let f = noise.from + 5; f < baton.from; f += 2) x.pluck(f, scale[Math.floor(((rnd() + 1) / 2) * 8)] * (rnd() > 0 ? 1 : 0.5), 0.05);
    for (let f = lost.from; f < baton.from; f += 7) kick(f + ((rnd() + 1) / 2) * 3, 0.25);
    // baton raised: silence, a breath
    riser(baton.from, baton.up + 20, 0.15);
    // each section adds its layer on the same beat
    const chords = [[130.81, 196, 261.63], [110, 164.81, 220], [87.31, 130.81, 174.61], [98, 146.83, 196]];
    const chordAt = (b) => chords[Math.floor(b / 4) % 4];
    beatsBetween(sections.from, finale.hit, (f, b) => {
      const n = Math.min(5, Math.floor((f - sections.from) / sections.each) + 1);
      const c = chordAt(b);
      if (b % 4 === 0) x.pad(f, f + beatFrames * 4, c, 0.018); // strings
      if (n >= 2) x.pluck(f + beatFrames / 2, c[2] * 2, 0.07); // keys
      if (n >= 3) {
        kick(f, 0.6);
        if (b % 2 === 1) clap(f, 0.22);
        hat(f + beatFrames / 2, 0.06);
      }
      if (n >= 4 && b % 2 === 0) x.pad(f, f + beatFrames * 0.6, [c[0] * 2, c[1] * 2], 0.03); // brass stab
      if (n >= 5) x.pluck(f, scale[(b * 3) % 8] * 2, 0.07); // lead
      bass(f, c[0] / 2, 0.35, 0.16);
    });
    for (let k = 0; k < 5; k++) ping(sections.from + k * sections.each + 10, [523.25, 587.33, 659.25, 783.99, 880][k], 0.08);
    riser(finale.from, finale.hit, 0.3);
    hit(finale.hit, 1.3);
    kick(finale.hit, 1);
    x.pad(finale.hit, outro.from + outro.duration, [130.81, 196, 261.63, 329.63, 392], 0.028);
    return { s, file: "maestro-music.wav" };
  },
  notify: () => {
    const tl = load("notify");
    const s = createSynth({ seconds: tl.durationInFrames / tl.fps, fps: tl.fps, bpm: tl.bpm, seed: 197 });
    const x = extras(s);
    const { beatFrames, beatsBetween, kick, clap, hat, bass, hit, whoosh, riser, click, ping } = s;
    const { lost, answer, steps, viral, outro } = tl;
    const ding = (f, g = 0.1) => {
      ping(f, 1318.51, g);
      ping(f + 3, 1760, g * 0.8);
    };
    // typing, then an empty silence
    for (let f = 12; f < 50; f += 7) click(f, 0.1);
    x.pad(lost.from, answer.from, [110, 116.54], 0.016);
    hit(answer.from, 0.6);
    // building the idea: upbeat pop groove, a swipe per screen
    beatsBetween(steps.from, viral.from, (f, b) => {
      kick(f, 0.7);
      hat(f + beatFrames / 2, 0.08);
      if (b % 2 === 1) clap(f, 0.28);
      bass(f, [55, 55, 49, 61.74][Math.floor(b / 4) % 4], 0.3, 0.2);
    });
    for (let k = 0; k < 5; k++) {
      whoosh(steps.from + k * steps.each - 4, 0.3, 0.2, true);
      ding(steps.from + k * steps.each + 20, 0.07);
    }
    // viral: dings pile up faster and faster
    riser(viral.from - 30, viral.from, 0.25);
    hit(viral.from, 1);
    for (let i = 0; i < 14; i++) ding(viral.from + i * 7, 0.08);
    beatsBetween(viral.from, outro.from, (f, b) => {
      kick(f, 0.85);
      hat(f + beatFrames / 2, 0.1);
      hat(f + beatFrames / 4, 0.05);
      if (b % 2 === 1) clap(f, 0.32);
      bass(f, [55, 55, 65.41, 73.42][Math.floor(b / 4) % 4], 0.3, 0.22);
    });
    x.pad(viral.from, outro.from + outro.duration, [220, 277.18, 329.63, 440], 0.022);
    return { s, file: "notify-music.wav" };
  },
};

const only = process.argv[2];
for (const [name, build] of Object.entries(tracks)) {
  if (only && only !== name) continue;
  const { s, file } = build();
  s.write(path.join(root, "public", file));
  console.log(`public/${file} written`);
}
