import { continueRender, delayRender, staticFile } from 'remotion';

const FACES: [family: string, file: string, weight: string, range?: string][] = [
  ['Cairo', 'cairo-arabic-400-normal.woff2', '400', 'U+0600-06FF,U+0750-077F,U+08A0-08FF,U+FB50-FDFF,U+FE70-FEFF'],
  ['Cairo', 'cairo-arabic-700-normal.woff2', '700', 'U+0600-06FF,U+0750-077F,U+08A0-08FF,U+FB50-FDFF,U+FE70-FEFF'],
  ['Cairo', 'cairo-arabic-900-normal.woff2', '900', 'U+0600-06FF,U+0750-077F,U+08A0-08FF,U+FB50-FDFF,U+FE70-FEFF'],
  ['Cairo', 'cairo-latin-400-normal.woff2', '400', 'U+0000-024F,U+2000-206F'],
  ['Cairo', 'cairo-latin-700-normal.woff2', '700', 'U+0000-024F,U+2000-206F'],
  ['Cairo', 'cairo-latin-900-normal.woff2', '900', 'U+0000-024F,U+2000-206F'],
  ['Montserrat', 'montserrat-latin-300-normal.woff2', '300'],
  ['Montserrat', 'montserrat-latin-500-normal.woff2', '500'],
  ['Montserrat', 'montserrat-latin-700-normal.woff2', '700'],
  ['Montserrat', 'montserrat-latin-800-normal.woff2', '800'],
];

let loaded = false;

export const loadFonts = () => {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  const handle = delayRender('Loading fonts');
  Promise.all(
    FACES.map(([family, file, weight, unicodeRange]) => {
      const face = new FontFace(family, `url(${staticFile(`fonts/${file}`)}) format('woff2')`, {
        weight,
        ...(unicodeRange ? { unicodeRange } : {}),
      });
      document.fonts.add(face);
      return face.load();
    }),
  )
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
};
