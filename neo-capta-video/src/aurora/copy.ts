import type { Lang } from "../lang";

// Aurora follows the first design's flow with fresh lines.
export const auroraCopy: Record<
  Lang,
  { kicker: string; rooted: [string, string]; different: [string, string]; pillarsHead: string }
> = {
  en: {
    kicker: "RIYADH · SAUDI ARABIA",
    rooted: ["Rooted in Riyadh.", "Built for what's next."],
    different: ["Not louder.", "Clearer."],
    pillarsHead: "WHAT WE DO",
  },
  ar: {
    kicker: "الرياض · السعودية",
    rooted: ["جذورنا في الرياض.", "وعيننا على الجاي."],
    different: ["مو أعلى صوت…", "أوضح رؤية."],
    pillarsHead: "وش نسوي",
  },
};
