import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const FPS = 30;

// Palette sampled from the Neo Capta logo and website.
export const colors = {
  bg: "#0b0b14",
  bgDeep: "#07070d",
  glow: "#25205e",
  indigo: "#4a4fb0", // "NEO" in the logo
  lavender: "#8b7fff", // accent on the website
  white: "#f1f0f5",
  muted: "#8d8ba3",
  line: "rgba(241, 240, 245, 0.14)",
};

export const fonts = {
  ar: "Plex Arabic",
  display: "Archivo",
  mono: "Plex Mono",
};

const faces: [string, string, string][] = [
  [fonts.ar, "ibm-plex-sans-arabic-arabic-400-normal.woff2", "400"],
  [fonts.ar, "ibm-plex-sans-arabic-arabic-500-normal.woff2", "500"],
  [fonts.ar, "ibm-plex-sans-arabic-arabic-700-normal.woff2", "700"],
  [fonts.display, "archivo-latin-800-normal.woff2", "800"],
  [fonts.display, "archivo-latin-900-normal.woff2", "900"],
  [fonts.mono, "ibm-plex-mono-latin-500-normal.woff2", "500"],
];

for (const [family, file, weight] of faces) {
  loadFont({ family, url: staticFile(`fonts/${file}`), weight });
}
