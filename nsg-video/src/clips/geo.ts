// Simplified outline of the Arabian Peninsula (lon, lat) — stylised, not a boundary reference.
export const PENINSULA: [number, number][] = [
  [35.0, 29.5], [36.6, 26.2], [37.6, 24.2], [39.1, 21.6], [40.4, 19.8], [41.6, 17.6], [42.8, 15.4], [43.4, 12.7],
  [45.0, 12.9], [47.6, 13.8], [49.5, 14.6], [52.2, 15.6], [54.9, 17.0], [56.7, 18.3], [57.8, 19.6], [58.6, 20.6],
  [59.8, 22.5], [58.8, 23.6], [57.2, 24.4], [56.4, 25.6], [56.3, 26.3], [55.5, 25.5], [54.4, 24.3], [52.6, 24.1],
  [51.6, 24.3], [51.6, 25.9], [51.2, 26.1], [50.8, 24.9], [50.2, 25.8], [49.6, 26.9], [48.6, 27.9], [48.0, 29.3],
  [47.7, 30.0], [46.5, 29.1], [44.7, 29.2], [42.0, 31.1], [39.2, 32.2], [37.0, 31.4], [38.0, 30.0], [36.6, 29.3],
];
export const BOUNDS = {lon: [33, 61] as const, lat: [11, 34] as const};
export const RIYADH: [number, number] = [46.7, 24.7];

export const project = (lon: number, lat: number, w: number, h: number) => [
  ((lon - BOUNDS.lon[0]) / (BOUNDS.lon[1] - BOUNDS.lon[0])) * w,
  (1 - (lat - BOUNDS.lat[0]) / (BOUNDS.lat[1] - BOUNDS.lat[0])) * h,
];

export const peninsulaPath = (w: number, h: number) =>
  PENINSULA.map(([lo, la], i) => {
    const [x, y] = project(lo, la, w, h);
    return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ') + ' Z';

// A deterministic "satellite image" field in [0,1]: dunes + wadis + a city grid.
export const field = (x: number, y: number) => {
  let v = 0.45 + 0.18 * Math.sin(6 * x + 2.5 * y) + 0.12 * Math.sin(13 * x - 9 * y + 1) + 0.07 * Math.sin(31 * x + 17 * y);
  const cx = x - 0.62;
  const cy = y - 0.45;
  const city = Math.exp(-(cx * cx + cy * cy) * 18);
  const grid = (Math.abs(((x * 14) % 1) - 0.5) < 0.06 || Math.abs(((y * 14) % 1) - 0.5) < 0.06) ? 1 : 0;
  v = v * (1 - city) + city * (0.55 + 0.45 * grid);
  const wadi = Math.abs(y - 0.3 - 0.12 * Math.sin(x * 7)) < 0.025 ? -0.35 : 0;
  return Math.max(0, Math.min(1, v + wadi));
};

const PAL = [
  [13, 15, 34],
  [44, 45, 67],
  [110, 116, 184],
  [190, 194, 240],
  [255, 255, 255],
];
export const shade = (v: number) => {
  const t = v * (PAL.length - 1);
  const i = Math.min(PAL.length - 2, Math.floor(t));
  const f = t - i;
  const c = PAL[i].map((a, k) => Math.round(a + (PAL[i + 1][k] - a) * f));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
};
