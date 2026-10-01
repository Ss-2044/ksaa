import {ThreeCanvas} from '@remotion/three';
import {useEffect, useMemo, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import * as THREE from 'three';

// lat/lon → position on three.js SphereGeometry (matches its equirectangular UVs).
export const latLon = (lat: number, lon: number, r = 1): [number, number, number] => {
  const phi = ((lon + 180) / 360) * Math.PI * 2;
  const theta = ((90 - lat) / 180) * Math.PI;
  return [-Math.cos(phi) * Math.sin(theta) * r, Math.cos(theta) * r, Math.sin(phi) * Math.sin(theta) * r];
};

// Rotations that bring (lat, lon) to face a camera on +Z.
export const faceAngles = (lat: number, lon: number) => {
  const [x, y, z] = latLon(lat, lon);
  const a = Math.atan2(-x, z);
  const z2 = -x * Math.sin(a) + z * Math.cos(a);
  const b = Math.atan2(y, z2);
  return {rotY: a, rotX: b};
};

const useTextures = (urls: string[]) => {
  const [handle] = useState(() => delayRender('textures'));
  const [tex, setTex] = useState<THREE.Texture[] | null>(null);
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    Promise.all(urls.map((u) => loader.loadAsync(u))).then((t) => {
      t.forEach((x) => {
        x.colorSpace = THREE.SRGBColorSpace;
        x.anisotropy = 8;
      });
      setTex(t);
      continueRender(handle);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return tex;
};

const earthVert = `
varying vec2 vUv; varying vec3 vN;
void main(){ vUv = uv; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
const earthFrag = `
uniform sampler2D day; uniform sampler2D night; uniform vec3 sun; uniform float nightBoost;
varying vec2 vUv; varying vec3 vN;
void main(){
  float l = dot(normalize(vN), normalize(sun));
  vec3 d = texture2D(day, vUv).rgb * (0.25 + 0.95 * max(l, 0.0));
  vec3 n = texture2D(night, vUv).rgb * nightBoost * vec3(1.0, 0.85, 0.6);
  float m = smoothstep(-0.12, 0.18, l);
  gl_FragColor = vec4(mix(n, d, m), 1.0);
  #include <colorspace_fragment>
}`;
const atmoFrag = `
uniform vec3 color; varying vec3 vN; varying vec3 vView;
void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vView))), 5.0); gl_FragColor = vec4(color, f * 0.75); }`;
const atmoVert = `
varying vec3 vN; varying vec3 vView;
void main(){ vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position,1.0); vView = -mv.xyz; gl_Position = projectionMatrix * mv; }`;

export type Pin = {lat: number; lon: number; on: number};

export const Globe: React.FC<{
  width: number;
  height: number;
  rotX: number;
  rotY: number;
  camZ: number;
  sun: [number, number, number];
  nightBoost?: number;
  cloudRot?: number;
  cloudOpacity?: number;
  pins?: Pin[];
  orbits?: {radius: number; tilt: number; phase: number; opacity: number; sats: number}[];
  atmosphere?: string;
  lineColor?: string;
}> = ({width, height, rotX, rotY, camZ, sun, nightBoost = 1.6, cloudRot = 0, cloudOpacity = 0.55, pins = [], orbits = [], atmosphere = '#8FB4FF', lineColor = '#16182F'}) => {
  const tex = useTextures([staticFile('textures/earth-day.jpg'), staticFile('textures/earth-night.jpg'), staticFile('textures/earth-clouds.jpg')]);
  const earthMat = useMemo(
    () =>
      tex
        ? new THREE.ShaderMaterial({
            uniforms: {day: {value: tex[0]}, night: {value: tex[1]}, sun: {value: new THREE.Vector3(...sun)}, nightBoost: {value: nightBoost}},
            vertexShader: earthVert,
            fragmentShader: earthFrag,
          })
        : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tex],
  );
  if (earthMat) {
    earthMat.uniforms.sun.value.set(...sun);
    earthMat.uniforms.nightBoost.value = nightBoost;
  }
  const atmoMat = useMemo(
    () => new THREE.ShaderMaterial({uniforms: {color: {value: new THREE.Color(atmosphere)}}, vertexShader: atmoVert, fragmentShader: atmoFrag, transparent: true, side: THREE.BackSide, depthWrite: false}),
    [atmosphere],
  );
  if (!tex || !earthMat) return null; // mount the canvas only once textures exist (ThreeCanvas renders on frame change)
  return (
    <ThreeCanvas width={width} height={height} camera={{position: [0, 0, camZ], fov: 30}} gl={{antialias: true, alpha: true}}>
      {orbits.map((o, i) => (
        <group key={i} rotation={[o.tilt, 0, 0.35]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[o.radius, 0.004, 8, 256]} />
            <meshBasicMaterial color={lineColor} transparent opacity={o.opacity} />
          </mesh>
          {new Array(o.sats).fill(0).map((_, k) => {
            const a = o.phase + (k / o.sats) * Math.PI * 2;
            return (
              <mesh key={k} position={[Math.cos(a) * o.radius, 0, Math.sin(a) * o.radius]}>
                <boxGeometry args={[0.035, 0.035, 0.035]} />
                <meshBasicMaterial color={lineColor} transparent opacity={o.opacity} />
              </mesh>
            );
          })}
        </group>
      ))}
      <group rotation={[rotX, 0, 0]}>
        <group rotation={[0, rotY, 0]}>
          {earthMat ? (
            <mesh material={earthMat}>
              <sphereGeometry args={[1, 128, 128]} />
            </mesh>
          ) : null}
          {tex ? (
            <mesh rotation={[0, cloudRot, 0]}>
              <sphereGeometry args={[1.008, 96, 96]} />
              <meshLambertMaterial alphaMap={tex[2]} transparent opacity={cloudOpacity} color="#ffffff" depthWrite={false} />
            </mesh>
          ) : null}
          {pins.map((p, i) => (
            <mesh key={i} position={latLon(p.lat, p.lon, 1.012)} scale={p.on}>
              <sphereGeometry args={[0.012, 16, 16]} />
              <meshBasicMaterial color="#FFE9A8" />
            </mesh>
          ))}
        </group>
      </group>
      <mesh material={atmoMat} scale={1.03}>
        <sphereGeometry args={[1, 64, 64]} />
      </mesh>
      <ambientLight intensity={0.6} />
      <directionalLight position={sun} intensity={2.2} />
    </ThreeCanvas>
  );
};
