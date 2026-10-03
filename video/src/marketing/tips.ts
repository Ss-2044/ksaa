// Marketing tips series: short, savable, Arabic-first reels.
export type Point = { title: string; en: string; body: string; good?: boolean };
export type Tip = {
  id: string;
  hook: string; // big question that opens the reel
  hookHl: number[];
  title: string;
  titleEn: string;
  points: Point[];
  cta: string;
  ctaEn: string;
  music: string;
};

export const TIP_TIMING = { hook: 0, title: 90, points: 160, each: 140, fps: 30 } as const;
export const tipCtaFrom = TIP_TIMING.points + 3 * TIP_TIMING.each; // 580
export const tipLength = tipCtaFrom + 170; // 750 = 25s

export const tips: Tip[] = [
  {
    id: "TipMistakes",
    hook: "إعلانك ما يجيب نتيجة؟",
    hookHl: [2, 3],
    title: "3 أخطاء تقتل إعلانك",
    titleEn: "3 mistakes killing your ad",
    points: [
      { title: "تكلم الكل", en: "Talking to everyone", body: "اللي يكلم الكل… ما يكلم أحد. حدد جمهورك قبل لا تصمم." },
      { title: "أول 3 ثواني ضايعة", en: "Wasting the first 3 seconds", body: "إذا ما مسكت الانتباه من البداية… راح." },
      { title: "ما فيه دعوة واضحة", en: "No clear call-to-action", body: "قول له وش يسوي: اطلب، احجز، تواصل." },
    ],
    cta: "تبي إعلان يجيب نتيجة؟",
    ctaEn: "Ads that actually perform.",
    music: "tip-mistakes-music.wav",
  },
  {
    id: "TipBrand",
    hook: "تحسب الهوية = شعار؟",
    hookHl: [3],
    title: "الهوية مو بس شعار",
    titleEn: "A brand is more than a logo",
    points: [
      { title: "الصوت", en: "Voice", body: "طريقة كلامك مع عميلك هي شخصيتك.", good: true },
      { title: "الألوان والخطوط", en: "Colors & type", body: "ثابتة في كل مكان… عشان يعرفك من أول نظرة.", good: true },
      { title: "التجربة", en: "Experience", body: "كل لمسة مع عميلك… هي هويتك.", good: true },
    ],
    cta: "نبني لك هوية تنعرف فيها",
    ctaEn: "Brands people remember.",
    music: "tip-brand-music.wav",
  },
  {
    id: "TipQuestions",
    hook: "بتطلق حملة؟ لحظة!",
    hookHl: [2],
    title: "3 أسئلة قبل تطلق حملتك",
    titleEn: "3 questions before you launch",
    points: [
      { title: "مين جمهورك بالضبط؟", en: "Who exactly is it for?", body: "العمر، المدينة، الاهتمام… كل ما كان أدق، كان أوفر.", good: true },
      { title: "وش تبيه يسوي؟", en: "What should they do?", body: "يشتري؟ يسجل؟ يزور؟ هدف واحد واضح.", good: true },
      { title: "كيف تقيس النجاح؟", en: "How will you measure it?", body: "حط رقم قبل البداية… عشان تعرف وصلت ولا لا.", good: true },
    ],
    cta: "خلنا نخطط حملتك صح",
    ctaEn: "Campaigns with a direction.",
    music: "tip-questions-music.wav",
  },
];
