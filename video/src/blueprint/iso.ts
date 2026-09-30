// Isometric projection helpers for the tower drawing (units -> pixels).
export const U = 62;
export const ORIGIN = { x: 540, y: 1560 };
const C = Math.cos(Math.PI / 6);

export type P = { x: number; y: number };
export const proj = (x: number, y: number, z: number, o = ORIGIN): P => ({
  x: o.x + (x - y) * U * C,
  y: o.y + (x + y) * U * 0.5 - z * U,
});

export type Box = { x: number; y: number; z: number; w: number; d: number; h: number };
export const centered = (w: number, d: number, z: number, h: number, cx = 0, cy = 0): Box => ({ x: cx - w / 2, y: cy - d / 2, z, w, d, h });

export const faces = (b: Box, o = ORIGIN) => {
  const zt = b.z + b.h;
  const pts = (arr: [number, number, number][]) => arr.map(([x, y, z]) => proj(x, y, z, o));
  return {
    top: pts([[b.x, b.y, zt], [b.x + b.w, b.y, zt], [b.x + b.w, b.y + b.d, zt], [b.x, b.y + b.d, zt]]),
    left: pts([[b.x, b.y + b.d, b.z], [b.x + b.w, b.y + b.d, b.z], [b.x + b.w, b.y + b.d, zt], [b.x, b.y + b.d, zt]]),
    right: pts([[b.x + b.w, b.y, b.z], [b.x + b.w, b.y + b.d, b.z], [b.x + b.w, b.y + b.d, zt], [b.x + b.w, b.y, zt]]),
  };
};

// All 12 edges; the three meeting at the hidden back-bottom corner are flagged as hidden.
export const edges = (b: Box, o = ORIGIN) => {
  const X = [b.x, b.x + b.w];
  const Y = [b.y, b.y + b.d];
  const Z = [b.z, b.z + b.h];
  const out: { a: P; b: P; hidden: boolean }[] = [];
  const hiddenCorner = (i: number, j: number, k: number) => i === 0 && j === 0 && k === 0;
  for (const j of [0, 1]) for (const k of [0, 1]) out.push({ a: proj(X[0], Y[j], Z[k], o), b: proj(X[1], Y[j], Z[k], o), hidden: hiddenCorner(0, j, k) });
  for (const i of [0, 1]) for (const k of [0, 1]) out.push({ a: proj(X[i], Y[0], Z[k], o), b: proj(X[i], Y[1], Z[k], o), hidden: hiddenCorner(i, 0, k) });
  for (const i of [0, 1]) for (const j of [0, 1]) out.push({ a: proj(X[i], Y[j], Z[0], o), b: proj(X[i], Y[j], Z[1], o), hidden: hiddenCorner(i, j, 0) });
  return out;
};

export const poly = (pts: P[]) => pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
