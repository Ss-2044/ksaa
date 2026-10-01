// ألوان مأخوذة من الشعارين
export const COLORS = {
  // نيو كابتا
  neoBlue: '#3D4FC4',
  neoBlueLight: '#6F7FF0',
  neoWhite: '#E9E9EE',
  neoBlack: '#05060A',
  // شركة الدرعية
  copper: '#B97A57',
  copperLight: '#D9A47F',
  sand: '#EEE7DE',
  // خلفية متدرجة
  navy: '#0B1036',
};

export const FPS = 30;
export const DURATION = 30 * FPS; // 30 ثانية

export const FONT = "'Cairo', sans-serif";
export const SIGNATURE_AR = "'Aref Ruqaa', serif";
export const SIGNATURE_EN = "'Great Vibes', cursive";

// توقيت المشاهد بالإطارات
export const SCENES = {
  logos: {from: 0, duration: 3 * FPS},
  announce: {from: 3 * FPS, duration: 4 * FPS},
  heritage: {from: 7 * FPS, duration: 5 * FPS},
  services: {from: 12 * FPS, duration: 6 * FPS},
  story: {from: 18 * FPS, duration: 4 * FPS},
  signature: {from: 22 * FPS, duration: 5 * FPS},
  outro: {from: 27 * FPS, duration: 3 * FPS},
};
