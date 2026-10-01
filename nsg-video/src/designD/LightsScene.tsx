import {ThreeCanvas} from '@remotion/three';
import {useEffect, useMemo, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import * as THREE from 'three';
import {useTextures} from '../designC/Globe';
import {PENINSULA} from '../clips/geo';
import {CineLine, Grain, Letterbox} from './Cine';
import {path, Rig} from './Rig';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.inOut(Easing.cubic);
// NASA Black Marble 2016, lon 34–56 E / lat 16–33 N, 0.2° cells above background.
type Lights = {cols: number; rows: number; bg: number; max: number; cells: [number, number, number][]};
const inside = (lon: number, lat: number) => {
  let c = false;
  for (let i = 0, j = PENINSULA.length - 1; i < PENINSULA.length; j = i++) {
    const [xi, yi] = PENINSULA[i];
    const [xj, yj] = PENINSULA[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};
const W = 2.2;
const H = 1.7;

const useLights = () => {
  const [handle] = useState(() => delayRender('lights'));
  const [d, setD] = useState<Lights | null>(null);
  useEffect(() => {
    fetch(staticFile('data/arabia-lights.json'))
      .then((r) => r.json())
      .then((j) => {
        setD({...j, cells: j.cells.filter(([x, y]: number[]) => inside(34 + x * 0.2 + 0.1, 33 - y * 0.2 - 0.1))});
        continueRender(handle);
      });
  }, [handle]);
  return d;
};

const Columns: React.FC<{d: Lights; grow: number}> = ({d, grow}) => {
  const mesh = useMemo(() => {
    const g = new THREE.BoxGeometry(1, 1, 1);
    g.translate(0, 0.5, 0);
    const m = new THREE.MeshBasicMaterial({vertexColors: false, toneMapped: false});
    const im = new THREE.InstancedMesh(g, m, d.cells.length);
    const c = new THREE.Color();
    d.cells.forEach(([x, y, v], i) => {
      const k = (v - d.bg) / (d.max - d.bg);
      c.setHSL(0.09 + 0.05 * k, 0.95 - k * 0.55, 0.45 + k * 0.5);
      im.setColorAt(i, c);
    });
    return im;
  }, [d]);
  const o = new THREE.Object3D();
  const cx = 46.7;
  const cy = 24.7;
  d.cells.forEach(([x, y, v], i) => {
    const lon = 34 + x * 0.2 + 0.1;
    const lat = 33 - y * 0.2 - 0.1;
    const k = (v - d.bg) / (d.max - d.bg);
    const dist = Math.hypot(lon - cx, lat - cy) / 15;
    const g = Math.max(0, Math.min(1, grow * 1.6 - dist * 0.6));
    o.position.set(((lon - 34) / 22 - 0.5) * W, 0, ((33 - lat) / 17 - 0.5) * H);
    const hgt = Math.pow(k, 1.3) * 0.28 * g;
    o.scale.set(hgt > 0 ? 0.015 : 0, Math.max(hgt, 1e-6), hgt > 0 ? 0.015 : 0);
    o.updateMatrix();
    mesh.setMatrixAt(i, o.matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
  return <primitive object={mesh} />;
};

export const LightsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const d = useLights();
  const tex = useTextures([staticFile('textures/arabia-day.jpg'), staticFile('textures/arabia-night.jpg')]);
  if (!d || !tex) return null;
  const night = interpolate(frame, [50, 110], [0, 1], {...clamp, easing: ease});
  const grow = interpolate(frame, [240, 360], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const cam = path(
    frame,
    [
      [0, [0, 2.6, 0.001]],
      [200, [0, 2.2, 0.35]],
      [300, [-0.9, 1.0, 1.4]],
      [450, [1.0, 0.75, 1.3]],
    ],
    ease,
  );
  const look = path(frame, [[0, [0, 0, 0]], [300, [0.25, 0, 0]], [450, [0.2, 0.05, -0.05]]], ease);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <ThreeCanvas width={1920} height={1080} camera={{fov: 40, near: 0.01, far: 30}} gl={{antialias: true}}>
        <Rig pos={cam} look={look} />
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[W, H]} />
          <meshBasicMaterial map={tex[0]} transparent opacity={1 - night * 0.85} toneMapped={false} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0005, 0]}>
          <planeGeometry args={[W, H]} />
          <meshBasicMaterial map={tex[1]} transparent opacity={night} toneMapped={false} />
        </mesh>
        <Columns d={d} grow={grow} />
      </ThreeCanvas>
      <Grain />
      <CineLine ar="هذه الجزيرة العربية… في النهار" en="This is the Arabian Peninsula, by day" from={8} to={70} />
      <CineLine ar="وهذه هي… في الليل" en="And this is it, at night" from={78} to={200} />
      <CineLine ar="كل ضوء… يتحوّل إلى رقم" en="Every light becomes a number" from={208} to={300} />
      <CineLine ar="وكل رقم… إلى ارتفاع" en="And every number becomes height" from={308} to={380} />
      <CineLine ar="خريطة الضوء… خريطة الحياة" en="A map of light is a map of life" from={386} to={450} />
      <Letterbox scene="SCENE 03 · NIGHT LIGHTS" coords="NASA BLACK MARBLE 2016 · 0.2° CELLS · HEIGHT = BRIGHTNESS" />
    </AbsoluteFill>
  );
};
