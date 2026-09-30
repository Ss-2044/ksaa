import "@fontsource/cairo/400.css";
import "@fontsource/cairo/700.css";
import "@fontsource/cairo/900.css";
import "@fontsource/montserrat/500.css";
import "@fontsource/montserrat/800.css";
import "@fontsource/caveat/700.css";
import "@fontsource/aref-ruqaa/700.css";

// Palette taken from the club logo (silver / white marks) and the site's deep green.
export const colors = {
  night: "#010D09",
  deep: "#021F15",
  green: "#013220",
  emerald: "#0B6B45",
  mint: "#43D69B",
  silver: "#D5DADF",
  steel: "#8C97A1",
  white: "#F6F8F9",
};

export const fonts = {
  ar: "Cairo, sans-serif",
  en: "Montserrat, sans-serif",
  handEn: "Caveat, cursive",
  handAr: "'Aref Ruqaa', serif",
};

export const fontFamilies = ["Cairo", "Montserrat", "Caveat", "Aref Ruqaa"];

export const silverText: React.CSSProperties = {
  background: `linear-gradient(180deg, ${colors.white} 0%, ${colors.silver} 55%, ${colors.steel} 100%)`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};
