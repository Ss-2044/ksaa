import type { Lang } from "../lang";

// Blink story: look closer, find meaning in the noise, new eyes, don't blink.
export const blinkCopy: Record<
  Lang,
  {
    look: string[];
    noiseLead: string;
    noiseFind: [string, string];
    noiseWords: string[];
    orbit: [string, string];
    blink: [string, string];
    dontBlink: string;
  }
> = {
  en: {
    look: ["Look.", "Look closer.", "Closer."],
    noiseLead: "In all the noise,",
    noiseFind: ["we find ", "meaning."],
    noiseWords: ["likes", "views", "trends", "ads", "clicks", "reach", "hype", "followers", "algorithms", "reels", "hashtags", "impressions", "buzz", "viral", "CPM", "shares", "scroll", "noise"],
    orbit: ["New eyes", "for your brand."],
    blink: ["Most brands blink.", "We don't."],
    dontBlink: "Don't blink.",
  },
  ar: {
    look: ["شوف.", "شوف أقرب.", "أقرب."],
    noiseLead: "وسط كل هالضجيج،",
    noiseFind: ["نلقى ", "المعنى."],
    noiseWords: ["لايكات", "مشاهدات", "ترندات", "إعلانات", "نقرات", "وصول", "هبّة", "متابعين", "خوارزميات", "ريلز", "هاشتاقات", "انطباعات", "تفاعل", "فيرال", "مشاركات", "تمرير", "ضجيج", "حملات"],
    orbit: ["عيون جديدة", "لعلامتك."],
    blink: ["أغلب العلامات ترمش.", "إحنا لا."],
    dontBlink: "لا ترمش.",
  },
};
