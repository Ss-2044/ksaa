// Minimal Rubik's cube model: 26 cubies with a position and an orientation matrix.
// Coordinates follow CSS 3D (x right, y down, z towards the viewer) so matrices can go straight into matrix3d().
export type Axis = "x" | "y" | "z";
export type Move = { axis: Axis; layer: -1 | 0 | 1; dir: 1 | -1 };
export type M3 = number[][];
export type Cubie = { home: [number, number, number]; pos: [number, number, number]; rot: M3 };

export const I3: M3 = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];

export const rotation = (axis: Axis, deg: number): M3 => {
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  if (axis === "x") return [[1, 0, 0], [0, c, -s], [0, s, c]];
  if (axis === "y") return [[c, 0, s], [0, 1, 0], [-s, 0, c]];
  return [[c, -s, 0], [s, c, 0], [0, 0, 1]];
};

export const mul = (a: M3, b: M3): M3 => a.map((row) => [0, 1, 2].map((j) => row[0] * b[0][j] + row[1] * b[1][j] + row[2] * b[2][j]));
const apply = (m: M3, v: number[]) => m.map((row) => Math.round(row[0] * v[0] + row[1] * v[1] + row[2] * v[2])) as [number, number, number];
const idx = { x: 0, y: 1, z: 2 };

export const solved = (): Cubie[] => {
  const out: Cubie[] = [];
  for (const x of [-1, 0, 1]) {
    for (const y of [-1, 0, 1]) {
      for (const z of [-1, 0, 1]) {
        if (x === 0 && y === 0 && z === 0) continue;
        out.push({ home: [x, y, z], pos: [x, y, z], rot: I3 });
      }
    }
  }
  return out;
};

export const inLayer = (c: Cubie, m: Move) => c.pos[idx[m.axis]] === m.layer;

export const applyMove = (cubes: Cubie[], m: Move): Cubie[] => {
  const r = rotation(m.axis, 90 * m.dir);
  return cubes.map((c) => (inLayer(c, m) ? { ...c, pos: apply(r, c.pos), rot: mul(r, c.rot) } : c));
};

export const invert = (moves: Move[]): Move[] => [...moves].reverse().map((m) => ({ ...m, dir: (m.dir * -1) as 1 | -1 }));

// CSS matrix3d is column-major: rotation columns first, then the translation.
export const matrix3d = (r: M3, t: number[]) =>
  `matrix3d(${r[0][0]},${r[1][0]},${r[2][0]},0,${r[0][1]},${r[1][1]},${r[2][1]},0,${r[0][2]},${r[1][2]},${r[2][2]},0,${t[0]},${t[1]},${t[2]},1)`;
