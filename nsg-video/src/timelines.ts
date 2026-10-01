export type SceneId =
  | 'logo'
  | 'hook'
  | 'about'
  | 'sectors'
  | 'geo'
  | 'services'
  | 'vision'
  | 'outro';

export type TimelineItem = {id: SceneId; from: number; duration: number};
export type Timeline = TimelineItem[];

// Scenes overlap by 10 frames so each one cross-fades into the next.
const build = (items: [SceneId, number][]): Timeline => {
  const OVERLAP = 10;
  let cursor = 0;
  return items.map(([id, duration], i) => {
    const from = i === 0 ? 0 : cursor - OVERLAP;
    cursor = from + duration;
    return {id, from, duration};
  });
};

export const totalFrames = (t: Timeline) =>
  Math.max(...t.map((s) => s.from + s.duration));

// 30 s @ 30 fps = 900 frames
export const timeline30 = build([
  ['logo', 90],
  ['hook', 160],
  ['about', 180],
  ['sectors', 230],
  ['geo', 170],
  ['outro', 120],
]);

// 60 s @ 30 fps = 1800 frames
export const timeline60 = build([
  ['logo', 90],
  ['hook', 220],
  ['about', 260],
  ['sectors', 330],
  ['geo', 280],
  ['services', 290],
  ['vision', 220],
  ['outro', 180],
]);
