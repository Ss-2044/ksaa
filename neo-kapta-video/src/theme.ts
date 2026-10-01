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

// الإيقاع: 120 BPM → كل ضربة = 15 إطاراً (نصف ثانية)، والموسيقى مبنية على نفس الشبكة
export const BEAT = 15;

// توقيت المشاهد بالإطارات — فكرة «العدّ التنازلي والكشف»
export const SCENES = {
  logos: {from: 0, duration: 3 * FPS},
  countdown: {from: 3 * FPS, duration: 3 * FPS},
  reveal: {from: 6 * FPS, duration: 5 * FPS},
  equation: {from: 11 * FPS, duration: 7 * FPS},
  slam: {from: 18 * FPS, duration: 6 * FPS},
  outro: {from: 24 * FPS, duration: 6 * FPS},
};
