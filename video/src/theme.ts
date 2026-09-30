import "@fontsource/cairo/400.css";
import "@fontsource/cairo/700.css";
import "@fontsource/cairo/900.css";
import "@fontsource/montserrat/500.css";
import "@fontsource/montserrat/800.css";
import "@fontsource/caveat/700.css";
import "@fontsource/aref-ruqaa/700.css";
import "@fontsource/playfair-display/700.css";
import "@fontsource/playfair-display/400-italic.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/700.css";

// NEO CAPTA palette: royal blue "NEO", silver-white "CAPTA", black halftone background.
export const colors = {
  night: "#02030A",
  deep: "#060A1E",
  navy: "#0A1033",
  royal: "#344499",
  accent: "#5E78FF",
  silver: "#E4E6EE",
  steel: "#8A90A8",
  white: "#F7F8FC",
};

export const fonts = {
  ar: "Cairo, sans-serif",
  en: "Montserrat, sans-serif",
  handEn: "Caveat, cursive",
  handAr: "'Aref Ruqaa', serif",
  serif: "'Playfair Display', serif",
  mono: "'IBM Plex Mono', monospace",
};

export const fontFamilies = ["Cairo", "Montserrat", "Caveat", "Aref Ruqaa", "Playfair Display", "IBM Plex Mono"];

export const silverText: React.CSSProperties = {
  background: `linear-gradient(180deg, ${colors.white} 0%, ${colors.silver} 55%, ${colors.steel} 100%)`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

// Light editorial palette for the "Passport" video (paper, ink, brand blues).
export const light = {
  paper: "#F2F1EC",
  paperDeep: "#E4E2D9",
  ink: "#0A0D1F",
  muted: "#6B6F80",
  royal: "#344499",
  cover: "#1C2566",
  accent: "#5E78FF",
};

// Blueprint palette for the "Blueprint" video.
export const blueprint = {
  paper: "#0E3183",
  paperDeep: "#0A2566",
  line: "#EAF1FF",
  faint: "rgba(234,241,255,0.18)",
  top: "#E4ECFF",
  left: "#9DB1EE",
  right: "#6A83D6",
  window: "#1A2E78",
  lit: "#FFE7A3",
  night: "#040817",
};
