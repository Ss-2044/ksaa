// Soundtracks for the "launch" series, built on scripts/studio.mjs (richer instruments,
// sidechain and reverb) so they sound clearly different from the earlier tracks.
// Each video gets its own genre:
//   countdown  – cinematic trailer (braams, taiko, ticking clock, impacts)
//   diamond    – crystalline ambient (FM glass bells, shimmer pads)
//   bridge     – uplifting indie (strummed guitar, claps, four-on-the-floor)
//   balloon    – dreamy (supersaw pads, oud-like plucks, burner roars)
//   painting   – lo-fi hip-hop (vinyl, swung drums, e-piano, brush strokes)
//   fireworks  – festival EDM (build-up, drop, sidechained chords, whistles and booms)
//   action     – blockbuster orchestral (pizzicato, brass stabs, clapper, applause)
//   node scripts/make-launch-music.mjs [name]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createStudio } from "./studio.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const load = (name) => JSON.parse(fs.readFileSync(path.join(root, `src/games/${name}/timeline.json`), "utf8"));
const studio = (tl, seed) => createStudio({ seconds: tl.durationInFrames / tl.fps, fps: tl.fps, bpm: tl.bpm, seed });
const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
const chord = (root, kind = "min") => (kind === "min" ? [0, 3, 7] : kind === "maj" ? [0, 4, 7] : [0, 5, 7]).map((i) => hz(root + i));

const tracks = {
  countdown: () => {
    const tl = load("countdown");
    const s = studio(tl, 211);
    const { pad, hold, control, count, launch, outro } = tl;
    const tickClock = (from, to, step) => {
      for (let f = from; f < to; f += step) s.tick(f, 3000, 0.07);
    };
    s.supersaw(0, launch.ignite, chord(38, "min"), 0.012, { cutoff: 0.02, attack: 2 });
    s.braam(pad.from + 10, 43.65, 4, 0.05);
    tickClock(pad.from + 20, control.from, s.beat);
    s.braam(hold.from + 10, 41.2, 3.5, 0.05);
    s.noiseSweep(control.from - 20, control.from, { gain: 0.2 });
    s.impact(control.from, 0.7);
    // the count: one taiko hit + rising braam per number, clock getting faster
    for (let k = 0; k < 5; k++) {
      const f = count.from + k * count.each;
      s.taiko(f, 0.9);
      s.taiko(f + s.beat * 1.5, 0.45);
      s.braam(f + 4, 43.65 * Math.pow(2, k / 12), 1.8, 0.04 + k * 0.006);
      tickClock(f, f + count.each, s.beat / (1 + k * 0.5));
      s.bell(f + 20, hz(74 + k * 2), 0.06, { ratio: 2, index: 1.2, dec: 2 });
    }
    s.snareRoll(launch.ignite - 50, launch.ignite, 0.35);
    s.noiseSweep(launch.ignite - 60, launch.ignite, { gain: 0.3 });
    // ignition + liftoff
    s.impact(launch.ignite, 1.3);
    s.noiseSweep(launch.ignite, launch.to, { up: false, gain: 0.5, send: 0.2 });
    s.braam(launch.lift, 32.7, 5, 0.07);
    s.supersaw(launch.lift, outro.from + outro.duration, chord(50, "maj"), 0.018, { cutoff: 0.05, attack: 1.2 });
    s.beatsBetween(launch.lift + 20, outro.from, (f, b) => {
      s.taiko(f, b % 2 ? 0.4 : 0.7);
      if (b % 4 === 3) s.snare(f + s.beat / 2, 0.3);
    });
    s.impact(outro.from, 0.8);
    return { s, file: "countdown-music.wav", mix: { duckDepth: 0.2 } };
  },

  diamond: () => {
    const tl = load("diamond");
    const s = studio(tl, 223);
    const { rough, hidden, tool, cuts, shine, outro } = tl;
    const scale = [0, 2, 4, 7, 9, 12, 14, 16].map((i) => hz(69 + i));
    s.supersaw(0, outro.from + outro.duration, chord(45, "min"), 0.008, { cutoff: 0.015, attack: 3 });
    // sparse glass notes while the stone is rough
    [0, 3, 5, 2].forEach((n, i) => s.bell(rough.from + 20 + i * 18, scale[n], 0.05, { ratio: 3.5, index: 2, dec: 1.5 }));
    s.supersaw(hidden.from, tool.from, [hz(45), hz(46)], 0.01, { cutoff: 0.02 });
    s.whoosh(tool.from, 0.8, 0.2, true);
    s.chime(tool.from + 20, 0.1);
    // each cut: laser zap (falling glass tone), chips, then a rising arpeggio of glass bells
    for (let k = 0; k < 5; k++) {
      const f = cuts.from + k * cuts.each;
      s.noiseSweep(f, f + cuts.laser, { gain: 0.12 });
      s.crackle(f + cuts.laser - 4, 0.4, 0.01, 0.12, 0.5);
      for (let i = 0; i < 4 + k; i++) s.bell(f + cuts.laser + i * 4, scale[(i + k) % 8] * (i > 4 ? 2 : 1), 0.05, { ratio: 3.5, index: 2.5, dec: 1.8 });
      s.sub(f + cuts.laser, hz(33 + k), 0.8, 0.12);
    }
    // brilliance: shimmering chord + sparkle bells + soft pulse
    s.impact(shine.from, 0.5);
    s.supersaw(shine.from, outro.from + outro.duration, chord(57, "maj").concat([hz(64 + 12)]), 0.014, { cutoff: 0.06, attack: 0.8 });
    for (let i = 0; i < 24; i++) s.bell(shine.from + 10 + i * 7, scale[(i * 5) % 8] * 2, 0.035, { ratio: 3.5, index: 1.5, dec: 2.5 });
    s.beatsBetween(shine.from + 20, outro.from + 60, (f) => s.kick(f, 0.35, { tone: 45 }));
    return { s, file: "diamond-music.wav", mix: { duckDepth: 0.35, reverbLevel: 1.3 } };
  },

  bridge: () => {
    const tl = load("bridge");
    const s = studio(tl, 227);
    const { gap, apart, towers, build, cross, outro } = tl;
    const prog = [chord(55, "maj"), chord(52, "min"), chord(48, "maj"), chord(50, "maj")]; // G Em C D
    const guitar = (c) => [c[0] / 2, c[0], c[1], c[2], c[0] * 2];
    // intro: gentle picked guitar
    for (let i = 0; i < 8; i++) s.pluck(gap.from + 10 + i * s.beat / 2, guitar(prog[0])[i % 5], 0.16, { decay: 0.997, bright: 0.4, send: 0.3 });
    for (let i = 0; i < 8; i++) s.pluck(apart.from + 10 + i * s.beat / 2, guitar(prog[1])[i % 5], 0.14, { decay: 0.997, bright: 0.3, send: 0.3 });
    s.noiseSweep(towers.from - 20, towers.from + 10, { gain: 0.15 });
    s.impact(towers.from + 10, 0.5);
    // build: strummed chords, claps, kick on every beat, bass — one layer more per span
    s.beatsBetween(build.from, cross.arrive + 60, (f, b) => {
      const c = prog[Math.floor(b / 4) % 4];
      const layers = Math.min(5, Math.floor((f - build.from) / build.each) + 1);
      if (b % 2 === 0) s.strum(f, guitar(c), 0.1, true);
      else s.strum(f + s.beat / 2, guitar(c), 0.07, false);
      if (layers >= 2) s.kick(f, 0.7);
      if (layers >= 3 && b % 2 === 1) s.clap(f, 0.3);
      if (layers >= 3) s.hat(f + s.beat / 2, 0.07);
      if (layers >= 4) s.sub(f, c[0] / 4, 0.35, 0.28);
      if (layers >= 5) s.bell(f + s.beat / 2, c[2] * 2, 0.03, { ratio: 2, index: 1, dec: 3 });
    });
    for (let k = 0; k < 5; k++) {
      const f = build.from + k * build.each;
      s.whoosh(f, 0.4, 0.2, false);
      s.impact(f + 16, 0.35);
    }
    // crossing: build-up then a big arrival with cheers
    s.snareRoll(cross.from, cross.arrive, 0.25);
    s.impact(cross.arrive, 1);
    s.applause(cross.arrive, 3, 0.35);
    s.supersaw(cross.arrive, outro.from + outro.duration, prog[0].map((x) => x * 2), 0.024, { cutoff: 0.06 });
    s.beatsBetween(cross.arrive, outro.from + 90, (f, b) => {
      s.strum(f, guitar(prog[b % 4]), 0.07, b % 2 === 0);
      s.kick(f, 0.5);
    });
    return { s, file: "bridge-music.wav", mix: { duckDepth: 0.45 } };
  },

  balloon: () => {
    const tl = load("balloon");
    const s = studio(tl, 229);
    const { ground, stuck, fire, rise, above, outro } = tl;
    // Hijaz on D for the oud-like line
    const hijaz = [62, 63, 66, 67, 69, 70, 72, 74].map(hz);
    s.supersaw(0, rise.from, chord(50, "min"), 0.012, { cutoff: 0.025, attack: 2 });
    [0, 2, 3, 4, 3, 2, 1, 0].forEach((n, i) => s.pluck(ground.from + 20 + i * 9, hijaz[n] / 2, 0.18, { decay: 0.995, bright: 0.7 }));
    s.supersaw(stuck.from, fire.from, [hz(50), hz(51)], 0.01, { cutoff: 0.02 });
    s.burner(fire.from + 20, 1.6, 0.35);
    s.impact(fire.from + 24, 0.4);
    // rising: every burn roars, the pad opens, the oud answers, a slow half-time groove
    for (let k = 0; k < 5; k++) {
      const f = rise.from + k * rise.each;
      s.burner(f, 1.1, 0.3);
      s.supersaw(f, f + rise.each, chord(50 + [0, 3, 5, 7, 10][k], k % 2 ? "maj" : "min"), 0.012 + k * 0.002, { cutoff: 0.03 + k * 0.012, attack: 0.6 });
      [0, 2, 4, 5, 7].forEach((n, i) => s.pluck(f + 20 + i * 6, hijaz[(n + k) % 8], 0.14, { decay: 0.996, bright: 0.6, pan: (i - 2) * 0.2 }));
    }
    s.beatsBetween(rise.from, above.from, (f, b) => {
      if (b % 2 === 0) s.kick(f, 0.5, { tone: 44 });
      if (b % 4 === 2) s.snare(f, 0.18, 0.4);
    });
    // above the clouds: wide, bright and calm
    s.impact(above.from, 0.6);
    s.supersaw(above.from, outro.from + outro.duration, chord(62, "maj").concat([hz(69 + 12)]), 0.016, { cutoff: 0.08, attack: 1 });
    for (let i = 0; i < 10; i++) s.bell(above.from + 20 + i * 14, hijaz[(i * 3) % 8] * 2, 0.04, { ratio: 2, index: 1, dec: 2 });
    return { s, file: "balloon-music.wav", mix: { duckDepth: 0.3, reverbLevel: 1.2 } };
  },

  painting: () => {
    const tl = load("painting");
    const s = studio(tl, 233);
    const { blank, lost, brush, strokes, reveal, outro } = tl;
    const prog = [
      [hz(57), hz(60), hz(64), hz(67)], // Am7
      [hz(55), hz(59), hz(62), hz(65)], // G7-ish
      [hz(53), hz(57), hz(60), hz(64)], // Fmaj7
      [hz(52), hz(55), hz(59), hz(62)], // Em7
    ];
    s.vinyl(0, outro.from + outro.duration, 0.04);
    // lo-fi: e-piano chords, swung drums, lazy bass
    s.beatsBetween(blank.from, outro.from + outro.duration, (f, b) => {
      const c = prog[Math.floor(b / 4) % 4];
      if (b % 4 === 0) s.rhodes(f, c, 2.4, 0.05);
      if (b % 4 === 2) s.rhodes(f + s.beat * 0.66, [c[1] * 2, c[3] * 2], 0.8, 0.03);
      const drums = f >= brush.from || f < lost.from;
      if (drums) {
        if (b % 4 === 0) s.kick(f, 0.55, { tone: 48 });
        if (b % 4 === 3) s.kick(f + s.beat * 0.66, 0.4, { tone: 48 });
        if (b % 2 === 1) s.snare(f, 0.22, 0.2);
        s.hat(f + s.beat * 0.62, 0.05);
        s.hat(f, 0.035);
        s.sub(f, c[0] / 2, 0.4, 0.18);
      }
    });
    // brush strokes over the beat
    for (let k = 0; k < 5; k++) {
      const f = strokes.from + k * strokes.each;
      s.brush(f, strokes.draw / tl.fps, 0.14);
      s.bell(f + strokes.draw, prog[k % 4][2] * 2, 0.04, { ratio: 1.01, index: 0.8, dec: 2.5 });
    }
    s.brush(reveal.paint, 50 / tl.fps, 0.18);
    s.chime(reveal.paint + 50, 0.08);
    return { s, file: "painting-music.wav", mix: { duckDepth: 0.5, reverbLevel: 0.8 } };
  },

  fireworks: () => {
    const tl = load("fireworks");
    const s = studio(tl, 239);
    const { spark, fizzle, fuse, shells, finale, outro } = tl;
    const prog = [chord(57, "min"), chord(53, "maj"), chord(48, "maj"), chord(55, "maj")]; // Am F C G
    // intro: filtered pad, two fizzles
    s.supersaw(0, fuse.from, prog[0], 0.012, { cutoff: 0.02, attack: 1.5 });
    s.whistle(spark.from + 20, 1.2, 0.04, 800, 1400);
    s.whistle(fizzle.from + 20, 1.2, 0.04, 800, 1300);
    // the fuse: crackling fizz + build-up
    s.crackle(fuse.from + 10, (fuse.to - fuse.from) / tl.fps, 0.01, 0.12, 0.2);
    s.noiseSweep(fuse.from, shells.from, { gain: 0.25 });
    s.snareRoll(fuse.from + 20, shells.from, 0.3);
    // drop: four-on-the-floor with pumping chords; each shell whistles up and booms
    s.beatsBetween(shells.from, outro.from, (f, b) => {
      const c = prog[Math.floor(b / 4) % 4];
      s.kick(f, 0.9);
      s.hat(f + s.beat / 2, 0.09, b % 4 === 3);
      if (b % 2 === 1) s.clap(f, 0.32);
      if (b % 4 === 0) s.supersaw(f, f + s.beat * 4, c.map((x) => x * 2), 0.02, { cutoff: 0.12, attack: 0.01, release: 0.1 });
      s.sub(f + s.beat / 2, c[0] / 2, 0.25, 0.25);
    });
    for (let k = 0; k < 5; k++) {
      const f = shells.from + k * shells.each;
      s.whistle(f, shells.rise / tl.fps, 0.05, 700, 2600);
      s.boom(f + shells.rise, 0.9);
    }
    // finale volley + impact on the logo
    for (let i = 0; i < 8; i++) s.boom(finale.from + i * 5, 0.4);
    s.noiseSweep(finale.from, finale.logo, { gain: 0.3 });
    s.impact(finale.logo, 1.3);
    s.crackle(finale.logo, 2.5, 0.01, 0.2, 0.5);
    s.applause(finale.logo + 5, 3, 0.3);
    return { s, file: "fireworks-music.wav", mix: { duckDepth: 0.7 } };
  },

  action: () => {
    const tl = load("action");
    const s = studio(tl, 241);
    const { script, notyet, lights, takes, premiere, outro } = tl;
    const pizz = (f, midi, g = 0.16) => s.pluck(f, hz(midi), g, { decay: 0.985, bright: 0.8, send: 0.35 });
    // sneaky pizzicato bassline under the script
    const line = [45, 48, 52, 48, 45, 44, 45, 52];
    s.beatsBetween(script.from + 10, lights.from, (f, b) => pizz(f, line[b % 8] + 12));
    s.projector(notyet.from, lights.from, 0.03);
    s.supersaw(notyet.from, lights.from, [hz(45), hz(46)], 0.008, { cutoff: 0.02 });
    // lights on: two big clunks, then the takes with a driving orchestral groove
    s.impact(lights.from + 5, 0.6);
    s.impact(lights.from + 20, 0.6);
    s.beatsBetween(takes.from, premiere.from, (f, b) => {
      pizz(f, line[b % 8] + 12, 0.14);
      pizz(f + s.beat / 2, line[(b + 3) % 8] + 24, 0.08);
      s.taiko(f, b % 2 ? 0.35 : 0.55);
      if (b % 2 === 1) s.snare(f, 0.2, 0.3);
      s.hat(f + s.beat / 2, 0.05);
    });
    for (let k = 0; k < 5; k++) {
      const f = takes.from + k * takes.each;
      s.clapper(f + 16, 0.6);
      s.braam(f + 16, hz(33 + [0, 3, 5, 7, 10][k]), 1.2, 0.03);
    }
    // ACTION! then the premiere: fanfare chords + applause + camera flashes
    s.clapper(premiere.action, 0.8);
    s.impact(premiere.action + 2, 1);
    s.supersaw(premiere.screen, outro.from + outro.duration, chord(50, "maj").concat([hz(62 + 12)]), 0.02, { cutoff: 0.07, attack: 0.1 });
    [0, 4, 7, 12].forEach((i, n) => s.braam(premiere.screen + n * 6, hz(50 + i) / 2, 1.5, 0.03));
    s.applause(premiere.screen, 4, 0.4);
    for (let i = 0; i < 8; i++) s.tick(premiere.screen + 8 + i * 6, 5000, 0.12);
    return { s, file: "action-music.wav", mix: { duckDepth: 0.2 } };
  },
};

const only = process.argv[2];
for (const [name, build] of Object.entries(tracks)) {
  if (only && only !== name) continue;
  const { s, file, mix } = build();
  s.write(path.join(root, "public", file), mix);
  console.log(`public/${file} written`);
}
