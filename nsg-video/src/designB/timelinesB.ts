export type SceneBId = 'intro' | 'kinetic' | 'about' | 'pillars' | 'geo' | 'services' | 'vision' | 'outro';
export type TimelineB = {id: SceneBId; from: number; duration: number}[];

// Hard cuts on the beat (all durations are multiples of 15 frames).
const build = (items: [SceneBId, number][]): TimelineB => {
  let cursor = 0;
  return items.map(([id, duration]) => {
    const item = {id, from: cursor, duration};
    cursor += duration;
    return item;
  });
};

export const totalB = (t: TimelineB) => t.reduce((a, s) => a + s.duration, 0);

export const timelineB30 = build([
  ['intro', 90],
  ['kinetic', 120],
  ['about', 150],
  ['pillars', 240],
  ['geo', 180],
  ['outro', 120],
]);

export const timelineB60 = build([
  ['intro', 90],
  ['kinetic', 180],
  ['about', 210],
  ['pillars', 330],
  ['geo', 270],
  ['services', 300],
  ['vision', 300],
  ['outro', 120],
]);
