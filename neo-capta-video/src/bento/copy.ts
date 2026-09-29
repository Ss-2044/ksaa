import type { Lang } from "../lang";

// Bento story: ask the real question, get a human answer, meet the team, ask smarter.
export const bentoCopy: Record<
  Lang,
  {
    ask: string;
    question: string;
    insightLabel: string;
    insight: [string, string];
    chartLabel: string;
    focusLabel: string;
    signalsLabel: string;
    chips: string[];
    city: string;
    team: [string, string];
    smarter: [string, string];
  }
> = {
  en: {
    ask: "NEO CAPTA · ASK",
    question: "What does my audience really want?",
    insightLabel: "INSIGHT",
    insight: ["They don't want ads.", "They want stories."],
    chartLabel: "INTEREST",
    focusLabel: "FOCUS",
    signalsLabel: "SIGNALS",
    chips: ["#stories", "#people", "#culture", "#trust"],
    city: "RIYADH",
    team: ["One team. ", "Five superpowers."],
    smarter: ["Smarter questions.", "Sharper answers."],
  },
  ar: {
    ask: "نيو كابتا · اسأل",
    question: "وش يبي جمهوري فعلاً؟",
    insightLabel: "الخلاصة",
    insight: ["ما يبون إعلانات.", "يبون قصص."],
    chartLabel: "الاهتمام",
    focusLabel: "التركيز",
    signalsLabel: "الإشارات",
    chips: ["#قصص", "#ناس", "#ثقافة", "#ثقة"],
    city: "الرياض",
    team: ["فريق واحد. ", "خمس قدرات."],
    smarter: ["أسئلة أذكى.", "إجابات أوضح."],
  },
};
