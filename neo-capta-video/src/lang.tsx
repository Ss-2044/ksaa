import { createContext, useContext } from "react";
import { colors, fonts } from "./theme";
import { displayAr, displayEn } from "./ui";

export type Lang = "ar" | "en";

export const LangContext = createContext<Lang>("en");

/** Which video's story is being told; the Lens design has its own copy. */
export type Design = "halftone" | "lens";
export const DesignContext = createContext<Design>("halftone");

const copy = {
  en: {
    pill: "MARKETING INTELLIGENCE · RIYADH",
    tagline: ["We see", "the ", "unseen."],
    desertKicker: "RIYADH · 24.71° N  46.67° E",
    desert: ["Born in", "the ", "desert."],
    old: "Traditional marketing.",
    fresh: ["Marketing,", "reimagined."],
    ideas: ["New ideas.", "Real intelligence."],
    pillars: ["Strategy", "Creators", "Content", "Performance", "Intelligence"],
    footer: "NEO CAPTA · MARKETING INTELLIGENCE · RIYADH",
    hook: ["We see", "the ", "unseen."],
  },
  ar: {
    pill: "ذكاء تسويقي · الرياض",
    tagline: ["نرى", "ما ", "لا يُرى"],
    desertKicker: "من الرمل تعلّمنا الصبر والرؤية",
    desert: ["جينا من", "قلب ", "الصحراء"],
    old: "التسويق التقليدي",
    fresh: ["تسويق", "بشكل مختلف"],
    ideas: ["أفكار جديدة.", "ذكاء حقيقي."],
    pillars: ["استراتيجية", "صنّاع محتوى", "محتوى", "أداء", "ذكاء"],
    footer: "نيو كابتا · ذكاء تسويقي · الرياض",
    hook: ["نرى", "ما ", "لا يُرى"],
  },
};

// Lens story: others see the surface, we see what is underneath.
// The official line ("tagline") is kept for the outro.
const lensCopy: Record<Lang, Partial<(typeof copy)["en"]>> = {
  en: {
    hook: ["They see data.", "We see ", "people."],
    desertKicker: "SURVEY 001 · RIYADH",
    desert: ["Others see sand.", "We see ", "signals."],
    old: "Guesswork.",
    fresh: ["Less noise.", "More signal."],
    ideas: ["Five lenses.", "One vision."],
  },
  ar: {
    hook: ["هم يشوفون أرقام.", "وإحنا نشوف ", "الناس."],
    desertKicker: "مسح ٠٠١ · الرياض",
    desert: ["غيرنا يشوف رمل.", "وإحنا نشوف ", "إشارات."],
    old: "التخمين.",
    fresh: ["ضجيج أقل.", "وضوح أكثر."],
    ideas: ["خمس عدسات.", "ورؤية وحدة."],
  },
};

/** Current language, its copy, and the matching text direction and styles. */
export const useLang = () => {
  const lang = useContext(LangContext);
  const design = useContext(DesignContext);
  const ar = lang === "ar";
  return {
    lang,
    t: design === "lens" ? { ...copy[lang], ...lensCopy[lang] } : copy[lang],
    dir: (ar ? "rtl" : "ltr") as "rtl" | "ltr",
    display: ar ? displayAr : displayEn,
    // Arabic runs larger to match the optical size of the heavy Latin face.
    scale: ar ? 1.1 : 1,
    small: {
      fontFamily: ar ? fonts.ar : fonts.mono,
      fontSize: ar ? 32 : 24,
      letterSpacing: ar ? 0 : "0.2em",
      color: colors.muted,
    } as React.CSSProperties,
  };
};
