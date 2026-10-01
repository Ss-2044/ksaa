import '@fontsource/cairo/400.css';
import '@fontsource/cairo/700.css';
import '@fontsource/cairo/900.css';
import '@fontsource/press-start-2p/400.css';
import {useEffect, useState} from 'react';
import {continueRender, delayRender, random} from 'remotion';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// ينتظر تحميل الخطوط قبل تصيير أي إطار
export const useFonts = () => {
  const [handle] = useState(() => delayRender('Loading fonts'));
  useEffect(() => {
    Promise.all([
      document.fonts.load(`900 40px Cairo`, 'نيو'),
      document.fonts.load(`700 40px Cairo`, 'نيو'),
      document.fonts.load(`400 40px Cairo`, 'Neo'),
      document.fonts.load(`400 20px 'Press Start 2P'`, 'NEO'),
    ]).then(() => continueRender(handle));
  }, [handle]);
};

// نقاط عشوائية ثابتة (نجوم، قصاصات…)
export const seeded = (n: number, key: string) =>
  new Array(n).fill(0).map((_, i) => ({
    x: random(`${key}x${i}`),
    y: random(`${key}y${i}`),
    a: random(`${key}a${i}`),
    b: random(`${key}b${i}`),
  }));
