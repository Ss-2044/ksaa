import {ThreeCanvas} from '@remotion/three';
import {useMemo} from 'react';
import {AbsoluteFill, interpolate, random, staticFile, useCurrentFrame, Easing} from 'remotion';
import * as THREE from 'three';
import {earthFrag, earthVert, faceAngles, latLon, useTextures} from '../designC/Globe';
import {CineLine, Grain, Letterbox} from './Cine';
import {path, Rig} from './Rig';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.inOut(Easing.cubic);
const ALT = 1.085; // satellite orbit radius (Earth = 1)

const panelTexture = () => {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 128;
  const g = c.getContext('2d')!;
  g.fillStyle = '#121a4a';
  g.fillRect(0, 0, 256, 128);
  g.strokeStyle = '#8fa0ff';
  g.globalAlpha = 0.55;
  for (let x = 0; x <= 256; x += 16) {
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, 128);
    g.stroke();
  }
  for (let y = 0; y <= 128; y += 16) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(256, y);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

const Satellite: React.FC<{beam: number; frame: number}> = ({beam, frame}) => {
  const panel = useMemo(panelTexture, []);
  return (
    <group position={[0, 0, ALT]}>
      {/* bus with gold foil */}
      <mesh>
        <boxGeometry args={[0.009, 0.009, 0.013]} />
        <meshStandardMaterial color="#C9A24A" metalness={0.55} roughness={0.35} emissive="#3a2a08" />
      </mesh>
      {/* solar wings */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * 0.007, 0, 0]}>
            <boxGeometry args={[0.004, 0.001, 0.001]} />
            <meshStandardMaterial color="#cccccc" />
          </mesh>
          <mesh position={[s * 0.026, 0, 0]} rotation={[0.35, 0, 0]}>
            <boxGeometry args={[0.032, 0.0006, 0.012]} />
            <meshStandardMaterial map={panel} metalness={0.3} roughness={0.4} emissive="#0b1240" />
          </mesh>
        </group>
      ))}
      {/* antenna dish pointing to Earth */}
      <mesh position={[0, 0, -0.011]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.004, 0.001, 0.003, 24]} />
        <meshStandardMaterial color="#e8e8f0" metalness={0.2} roughness={0.3} />
      </mesh>
      {/* sensor beam to the ground */}
      <mesh position={[0, 0, -(ALT - 1) / 2 - 0.006]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.011 + 0.002 * Math.sin(frame / 6), ALT - 1 - 0.012, 32, 1, true]} />
        <meshBasicMaterial color="#9DB0FF" transparent opacity={0.1 * beam} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <pointLight color="#ffd88a" intensity={0.15} distance={0.1} />
    </group>
  );
};

export const SatelliteScene: React.FC = () => {
  const frame = useCurrentFrame();
  const tex = useTextures([staticFile('textures/earth-day-hd.jpg'), staticFile('textures/earth-night.jpg'), staticFile('textures/earth-clouds.jpg')]);
  const mat = useMemo(
    () =>
      tex
        ? new THREE.ShaderMaterial({uniforms: {day: {value: tex[0]}, night: {value: tex[1]}, sun: {value: new THREE.Vector3(2, 0.6, 1.2)}, nightBoost: {value: 1.8}}, vertexShader: earthVert, fragmentShader: earthFrag})
        : null,
    [tex],
  );
  const stars = useMemo(() => {
    const a = new Float32Array(2400 * 3);
    for (let i = 0; i < 2400; i++) {
      const u = random(`su${i}`) * 2 - 1;
      const th = random(`st${i}`) * Math.PI * 2;
      const r = Math.sqrt(1 - u * u) * 12;
      a.set([Math.cos(th) * r, u * 12, Math.sin(th) * r], i * 3);
    }
    return a;
  }, []);
  if (!tex || !mat) return null;
  // Earth turns under the satellite: the ground track crosses Arabia.
  const lon = interpolate(frame, [0, 450], [36, 52]);
  const lat = interpolate(frame, [0, 450], [28, 22]);
  const f = faceAngles(lat, lon);
  const beam = interpolate(frame, [220, 250, 440, 450], [0, 1, 1, 0], clamp);
  const cam = path(
    frame,
    [
      [0, [0.35, 0.18, 1.55]],
      [140, [0.08, 0.035, 1.16]],
      [240, [-0.07, 0.04, 1.16]],
      [340, [-0.04, -0.07, 1.19]],
      [450, [0.0, -0.16, 1.32]],
    ],
    ease,
  );
  const look = path(frame, [[0, [0, 0, 1.06]], [240, [0, 0, ALT]], [450, [0, 0.02, 1.0]]], ease);
  // downlink: pulses from the satellite to Riyadh
  const ry = latLon(24.7, 46.7, 1.001);
  const downlink = interpolate(frame, [340, 360], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <ThreeCanvas width={1920} height={1080} camera={{fov: 35, near: 0.001, far: 20}} gl={{antialias: true}}>
        <Rig pos={cam} look={look} />
        <ambientLight intensity={0.25} />
        <directionalLight position={[2, 0.6, 1.2]} intensity={2.4} />
        <group rotation={[f.rotX, 0, 0]}>
          <group rotation={[0, f.rotY, 0]}>
            <mesh material={mat}>
              <sphereGeometry args={[1, 192, 192]} />
            </mesh>
            <mesh rotation={[0, frame * 0.0004, 0]}>
              <sphereGeometry args={[1.004, 128, 128]} />
              <meshLambertMaterial alphaMap={tex[2]} transparent opacity={0.6} color="#ffffff" depthWrite={false} />
            </mesh>
            {downlink > 0
              ? [0, 1, 2, 3].map((k) => {
                  const t = ((frame * 0.02 + k / 4) % 1) * downlink;
                  return (
                    <mesh key={k} position={ry}>
                      <sphereGeometry args={[0.0025 + 0.004 * (1 - t), 12, 12]} />
                      <meshBasicMaterial color="#FFE9A8" transparent opacity={1 - t} />
                    </mesh>
                  );
                })
              : null}
          </group>
        </group>
        <Satellite beam={beam} frame={frame} />
        {/* stars */}
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[stars, 3]} />
          </bufferGeometry>
          <pointsMaterial color="#ffffff" size={0.03} sizeAttenuation transparent opacity={0.7} />
        </points>
      </ThreeCanvas>
      <Grain />
      <CineLine ar="على ارتفاع مئات الكيلومترات…" en="Hundreds of kilometres above" from={10} to={120} />
      <CineLine ar="عينٌ لا ترمش" en="An eye that never blinks" from={128} to={225} />
      <CineLine ar="تمسح الأرض… شريطاً بعد شريط" en="Scanning the Earth, strip by strip" from={232} to={338} />
      <CineLine ar="وترسل ما تراه… إلى الأرض" en="And sending what it sees back to Earth" from={346} to={450} />
      <Letterbox scene="SCENE 01 · ORBIT" coords={`ALT ≈ 500 KM · ${lat.toFixed(2)}° N · ${lon.toFixed(2)}° E`} />
    </AbsoluteFill>
  );
};
