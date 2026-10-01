import {ThreeCanvas} from '@remotion/three';
import {useEffect, useMemo, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import * as THREE from 'three';
import {CineLine, Grain, Letterbox} from './Cine';
import {path, Rig} from './Rig';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.inOut(Easing.cubic);
// AWS Terrain Tiles (terrarium), z10 mosaic: lon 41.48–42.89 E, lat 17.64–18.65 N, resampled to 320×240.
const GW = 320;
const GH = 240;
const SX = 4; // plane width (west→east)
const SZ = 3; // plane depth (north→south)
const EXAG = 0.24 / 3000; // world units per metre (≈3× vertical exaggeration)
const toXZ = (u: number, v: number): [number, number] => [(u - 0.5) * SX, (v - 0.5) * SZ];
const SAWDA = toXZ((42.367 - 41.484) / 1.406, (18.646 - 18.267) / 1.002);
const ABHA = toXZ((42.505 - 41.484) / 1.406, (18.646 - 18.216) / 1.002);

const vert = `
attribute float elev; varying float vE; varying vec3 vN; varying vec3 vP;
void main(){ vE = elev; vN = normalize(normal); vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
const frag = `
uniform float scan; uniform float contour; uniform vec3 sun;
varying float vE; varying vec3 vN; varying vec3 vP;
vec3 ramp(float e){
  vec3 c0 = vec3(0.09,0.10,0.20); vec3 c1 = vec3(0.17,0.18,0.30); vec3 c2 = vec3(0.29,0.31,0.53);
  vec3 c3 = vec3(0.55,0.58,0.84); vec3 c4 = vec3(0.97,0.97,1.0);
  if (e < 300.0) return mix(c0, c1, e/300.0);
  if (e < 1200.0) return mix(c1, c2, (e-300.0)/900.0);
  if (e < 2200.0) return mix(c2, c3, (e-1200.0)/1000.0);
  return mix(c3, c4, clamp((e-2200.0)/800.0, 0.0, 1.0));
}
void main(){
  float l = max(dot(normalize(vN), normalize(sun)), 0.0);
  vec3 col = ramp(vE) * (0.35 + 0.85 * l);
  float f = fract(vE / 200.0);
  float w = fwidth(vE / 200.0) * 1.2;
  float line = 1.0 - smoothstep(0.0, w, min(f, 1.0 - f));
  col = mix(col, vec3(1.0), line * 0.45 * contour * step(5.0, vE));
  float d = abs(vP.x - scan);
  col += vec3(0.55,0.62,1.0) * exp(-d * 22.0) * 0.9;
  if (vE < 2.0) col = vec3(0.05,0.06,0.14) + 0.03 * sin(vP.z * 60.0);
  gl_FragColor = vec4(col, 1.0);
}`;

const useDem = () => {
  const [handle] = useState(() => delayRender('dem'));
  const [dem, setDem] = useState<Float32Array | null>(null);
  useEffect(() => {
    fetch(staticFile('data/asir-dem-320x240.f32'))
      .then((r) => r.arrayBuffer())
      .then((b) => {
        setDem(new Float32Array(b));
        continueRender(handle);
      });
  }, [handle]);
  return dem;
};

const Terrain: React.FC<{dem: Float32Array; scan: number; contour: number}> = ({dem, scan, contour}) => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(SX, SZ, GW - 1, GH - 1);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const elev = new Float32Array(GW * GH);
    for (let i = 0; i < GW * GH; i++) {
      const e = dem[i];
      elev[i] = e;
      pos.setY(i, e * EXAG);
    }
    g.setAttribute('elev', new THREE.BufferAttribute(elev, 1));
    g.computeVertexNormals();
    return g;
  }, [dem]);
  const mat = useMemo(() => new THREE.ShaderMaterial({uniforms: {scan: {value: 0}, contour: {value: 0}, sun: {value: new THREE.Vector3(-0.6, 0.8, 0.4)}}, vertexShader: vert, fragmentShader: frag, extensions: {derivatives: true} as never}), []);
  mat.uniforms.scan.value = scan;
  mat.uniforms.contour.value = contour;
  return <mesh geometry={geo} material={mat} />;
};

const Pin: React.FC<{x: number; z: number; h: number; on: number}> = ({x, z, h, on}) => (
  <group position={[x, h, z]} scale={on}>
    <mesh position={[0, 0.08, 0]}>
      <cylinderGeometry args={[0.003, 0.003, 0.16, 8]} />
      <meshBasicMaterial color="#ffffff" />
    </mesh>
    <mesh position={[0, 0.17, 0]}>
      <sphereGeometry args={[0.018, 16, 16]} />
      <meshBasicMaterial color="#FFE9A8" />
    </mesh>
  </group>
);

export const TerrainScene: React.FC = () => {
  const frame = useCurrentFrame();
  const dem = useDem();
  if (!dem) return null;
  const hAt = (x: number, z: number) => {
    const u = Math.round(((x / SX) + 0.5) * (GW - 1));
    const v = Math.round(((z / SZ) + 0.5) * (GH - 1));
    return dem[v * GW + u] * EXAG;
  };
  const cam = path(
    frame,
    [
      [0, [-2.4, 1.1, 1.8]],
      [150, [-1.1, 0.55, 0.8]],
      [260, [-0.05, 0.45, 0.45]],
      [360, [0.9, 0.6, 0.5]],
      [450, [1.8, 1.3, 1.5]],
    ],
    ease,
  );
  const look = path(frame, [[0, [0.2, 0.15, -0.2]], [260, [SAWDA[0], 0.15, SAWDA[1]]], [450, [0.3, 0.2, -0.2]]], ease);
  const scan = interpolate(frame, [20, 200], [-2.2, 2.2], clamp);
  const contour = interpolate(frame, [230, 270], [0, 1], clamp);
  const pins = interpolate(frame, [160, 190], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))});
  return (
    <AbsoluteFill style={{background: '#05060F'}}>
      <ThreeCanvas width={1920} height={1080} camera={{fov: 40, near: 0.01, far: 50}} gl={{antialias: true}}>
        <Rig pos={cam} look={look} />
        <fog attach="fog" args={['#05060F', 3, 7]} />
        <Terrain dem={dem} scan={scan} contour={contour} />
        <Pin x={SAWDA[0]} z={SAWDA[1]} h={hAt(SAWDA[0], SAWDA[1])} on={pins} />
        <Pin x={ABHA[0]} z={ABHA[1]} h={hAt(ABHA[0], ABHA[1])} on={pins * 0.8} />
      </ThreeCanvas>
      <Grain />
      <CineLine ar="مرتفعات عسير… كما يراها القمر الصناعي" en="The Asir highlands, as a satellite sees them" from={8} to={140} />
      <CineLine ar="من ساحل تهامة… إلى قمم تقارب 3,000 متر" en="From the Tihama coast to peaks near 3,000 m" from={148} to={240} />
      <CineLine ar="كل خط… ارتفاعٌ جديد كل 200 متر" en="Each line marks another 200 metres of height" from={248} to={350} />
      <CineLine ar="نموذج ارتفاع رقمي… من بيانات حقيقية" en="A digital elevation model, from real data" from={358} to={450} />
      <Letterbox scene="SCENE 02 · TERRAIN" coords="ASIR · 18.1° N 42.2° E · DEM · CONTOURS 200 M · PINS: JABAL SAWDA · ABHA" />
    </AbsoluteFill>
  );
};
