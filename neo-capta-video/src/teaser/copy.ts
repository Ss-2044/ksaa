import type { Lang } from "../lang";

// Teaser story: a question, glimpses of what is hidden, the desert, the build, the reveal.
export const teaserCopy: Record<
  Lang,
  { signal: string; question: string[]; glimpseKicker: string; glimpses: string[]; horizon: string; coming: string; soon: string }
> = {
  en: {
    signal: "SIGNAL DETECTED",
    question: ["What", "if", "you", "saw", "everything?"],
    glimpseKicker: "HIDDEN IN PLAIN SIGHT",
    glimpses: ["TRENDS", "PEOPLE", "PATTERNS", "SIGNALS"],
    horizon: "It started in the desert.",
    coming: "Something different is coming.",
    soon: "COMING SOON",
  },
  ar: {
    signal: "تم رصد إشارة",
    question: ["وش", "لو", "تشوف", "كل", "شي؟"],
    glimpseKicker: "مخفي قدّام عينك",
    glimpses: ["الترندات", "الناس", "الأنماط", "الإشارات"],
    horizon: "البداية كانت من الصحراء.",
    coming: "شي مختلف… جاي.",
    soon: "قريبًا",
  },
};
