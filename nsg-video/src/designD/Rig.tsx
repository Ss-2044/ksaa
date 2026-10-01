import {useThree} from '@react-three/fiber';

// Drive the camera every frame (the ThreeCanvas camera prop is only read on mount).
export const Rig: React.FC<{pos: [number, number, number]; look: [number, number, number]; fov?: number}> = ({pos, look, fov}) => {
  const camera = useThree((s) => s.camera) as import('three').PerspectiveCamera;
  camera.position.set(...pos);
  if (fov) camera.fov = fov;
  camera.lookAt(...look);
  camera.updateProjectionMatrix();
  return null;
};

export const lerp3 = (a: number[], b: number[], t: number): [number, number, number] => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

// Piecewise path through keyframes [frame, vec3].
export const path = (frame: number, keys: [number, number[]][], ease: (t: number) => number) => {
  if (frame <= keys[0][0]) return keys[0][1] as [number, number, number];
  for (let i = 0; i < keys.length - 1; i++) {
    const [f0, a] = keys[i];
    const [f1, b] = keys[i + 1];
    if (frame <= f1) return lerp3(a, b, ease((frame - f0) / (f1 - f0)));
  }
  return keys[keys.length - 1][1] as [number, number, number];
};
