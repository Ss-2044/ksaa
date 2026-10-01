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

// توقيت المشاهد بالإطارات — فكرة «مراسم التوقيع»
export const SCENES = {
  logos: {from: 0, duration: 3 * FPS},
  announce: {from: 3 * FPS, duration: 6 * FPS},
  signing: {from: 9 * FPS, duration: 6 * FPS},
  union: {from: 15 * FPS, duration: 6 * FPS},
  tagline: {from: 21 * FPS, duration: 5 * FPS},
  outro: {from: 26 * FPS, duration: 4 * FPS},
};

// لحظات ختم الشعارين على الاتفاقية (إطارات داخل مشهد التوقيع) — تُستخدم أيضاً في الموسيقى
export const SEAL_FRAMES = [100, 118];
