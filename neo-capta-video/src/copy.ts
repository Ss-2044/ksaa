export type Lang = 'ar' | 'en';

export type Copy = {
  start: string;
  words: string[];
  glimpses: string[];
  notOnly: string;
  impact: string;
  impactHighlight: string;
  services: string;
  final: [string, string];
};

export const COPY: Record<Lang, Copy> = {
  ar: {
    start: 'كل شيء يبدأ بفكرة.',
    words: ['فكرة', 'قصة', 'محتوى', 'تأثير'],
    glimpses: ['إعلان', 'شاشة جوال', 'حملة', 'كتابة', 'تصميم', 'محتوى سوشال ميديا'],
    notOnly: 'لا نصنع محتوى فقط.',
    impact: 'نصنع تأثيرًا.',
    impactHighlight: 'تأثيرًا.',
    services: 'تسويق  •  إعلان  •  محتوى',
    final: ['فكرتك.', 'تأثيرنا.'],
  },
  en: {
    start: 'Everything starts with an idea.',
    words: ['IDEA', 'STORY', 'CONTENT', 'IMPACT'],
    glimpses: ['Advertising', 'Mobile', 'Campaigns', 'Copywriting', 'Design', 'Social Media'],
    notOnly: "We don't just make content.",
    impact: 'We make impact.',
    impactHighlight: 'impact.',
    services: 'Marketing  •  Advertising  •  Content',
    final: ['Your idea.', 'Our impact.'],
  },
};

/* ------------------------------------------------ "Move your brand" manifesto */

export type ManifestoCopy = {
  noise: string[];
  loud: string;
  talking: string;
  heard: string;
  heardHighlight: string;
  slams: [string, string, string];
  forward: string;
  forwardHighlight: string;
  services: string;
  tagline: string;
  taglineHighlight: string;
};

export const MANIFESTO: Record<Lang, ManifestoCopy> = {
  ar: {
    noise: ['عرض', 'خصم', 'جديد', 'الآن', 'اشترِ', 'إعلان', '#ترند', 'حصري', 'مجانًا', 'اضغط', 'تابع', 'لايك', 'شارك', 'عاجل', 'وفّر', 'لا تفوّت'],
    loud: 'السوق مزدحم.',
    talking: 'الجميع يتكلم.',
    heard: 'وقليلون فقط يُسمَعون.',
    heardHighlight: 'يُسمَعون.',
    slams: ['انتباه.', 'تفاعل.', 'ولاء.'],
    forward: 'نحرّك علامتك للأمام.',
    forwardHighlight: 'للأمام.',
    services: 'تسويق  •  إعلان  •  محتوى',
    tagline: 'فكرتك. تأثيرنا.',
    taglineHighlight: 'تأثيرنا.',
  },
  en: {
    noise: ['SALE', 'NEW', 'BUY NOW', '#AD', 'CLICK', '50% OFF', 'FREE', 'LIMITED', 'TRENDING', 'LIKE', 'SHARE', 'FOLLOW', 'DEAL', 'HOT', 'SWIPE UP', 'LAST CHANCE'],
    loud: 'The market is loud.',
    talking: 'Everyone is talking.',
    heard: 'Few are heard.',
    heardHighlight: 'heard.',
    slams: ['Attention.', 'Engagement.', 'Loyalty.'],
    forward: 'We move your brand forward.',
    forwardHighlight: 'forward.',
    services: 'Marketing  •  Advertising  •  Content',
    tagline: 'Your idea. Our impact.',
    taglineHighlight: 'impact.',
  },
};

/* ------------------------------------------------------ "The journey" process */

export type JourneyCopy = {
  title: string;
  steps: { title: string; sub: string }[];
  tagline: string;
  taglineHighlight: string;
  services: string;
};

export const JOURNEY: Record<Lang, JourneyCopy> = {
  ar: {
    title: 'رحلة علامتك معنا',
    steps: [
      { title: 'نفهم جمهورك', sub: 'بحث  •  تحليل  •  رؤى' },
      { title: 'نبني الاستراتيجية', sub: 'أهداف  •  رسائل  •  قنوات' },
      { title: 'نصنع المحتوى', sub: 'كتابة  •  تصميم  •  فيديو' },
      { title: 'نطلق ونقيس', sub: 'حملات  •  نتائج  •  تطوير' },
    ],
    tagline: 'شريكك من الفكرة إلى الإطلاق.',
    taglineHighlight: 'الإطلاق.',
    services: 'تسويق  •  إعلان  •  محتوى',
  },
  en: {
    title: "Your brand's journey with us",
    steps: [
      { title: 'We understand your audience', sub: 'Research  •  Analysis  •  Insight' },
      { title: 'We build the strategy', sub: 'Goals  •  Messaging  •  Channels' },
      { title: 'We create the content', sub: 'Copy  •  Design  •  Video' },
      { title: 'We launch & measure', sub: 'Campaigns  •  Results  •  Growth' },
    ],
    tagline: 'Your partner from idea to launch.',
    taglineHighlight: 'launch.',
    services: 'Marketing  •  Advertising  •  Content',
  },
};

/* -------------------------------------------- vertical: "Before / After" */

export type BeforeAfterCopy = {
  intro: string;
  before: string;
  after: string;
  postHeadline: string;
  postCta: string;
  brand: string;
  same: string;
  different: string;
  differentHighlight: string;
  services: string;
  tagline: string;
  taglineHighlight: string;
};

export const BEFORE_AFTER: Record<Lang, BeforeAfterCopy> = {
  ar: {
    intro: 'محتوى عادي…',
    before: 'قبل',
    after: 'بعد',
    postHeadline: 'اكتشف الفرق',
    postCta: 'اطلب الآن',
    brand: 'علامتك',
    same: 'نفس الفكرة…',
    different: 'بأثر مختلف.',
    differentHighlight: 'مختلف.',
    services: 'تسويق  •  إعلان  •  محتوى',
    tagline: 'فكرتك. تأثيرنا.',
    taglineHighlight: 'تأثيرنا.',
  },
  en: {
    intro: 'Ordinary content…',
    before: 'BEFORE',
    after: 'AFTER',
    postHeadline: 'Feel the difference',
    postCta: 'Shop now',
    brand: 'yourbrand',
    same: 'Same idea…',
    different: 'Different impact.',
    differentHighlight: 'impact.',
    services: 'Marketing  •  Advertising  •  Content',
    tagline: 'Your idea. Our impact.',
    taglineHighlight: 'impact.',
  },
};

/* ---------------------------------------------- vertical: "The brief" chat */

export type BriefCopy = {
  contact: string;
  status: string;
  clientMsg: string;
  replyMsg: string;
  outputs: string[];
  fromTo: string;
  fromToHighlight: string;
  services: string;
  tagline: string;
  taglineHighlight: string;
};

export const BRIEF: Record<Lang, BriefCopy> = {
  ar: {
    contact: 'Neo Capta',
    status: 'متصل الآن',
    clientMsg: 'عندي فكرة… وأبيها توصل للناس.',
    replyMsg: 'خلّها علينا.',
    outputs: ['حملة إعلانية', 'تصاميم سوشال', 'كتابة محتوى', 'تصميم هوية', 'إدارة حسابات', 'محتوى جوال'],
    fromTo: 'من رسالة… إلى حملة كاملة.',
    fromToHighlight: 'كاملة.',
    services: 'تسويق  •  إعلان  •  محتوى',
    tagline: 'فكرتك. تأثيرنا.',
    taglineHighlight: 'تأثيرنا.',
  },
  en: {
    contact: 'Neo Capta',
    status: 'online',
    clientMsg: 'I have an idea… and I want people to feel it.',
    replyMsg: 'Leave it to us.',
    outputs: ['Ad campaigns', 'Social design', 'Copywriting', 'Brand identity', 'Account management', 'Mobile content'],
    fromTo: 'From one message… to a full campaign.',
    fromToHighlight: 'campaign.',
    services: 'Marketing  •  Advertising  •  Content',
    tagline: 'Your idea. Our impact.',
    taglineHighlight: 'impact.',
  },
};

/* ---------------------------------------------- vertical: logo sting */

export const STING: Record<Lang, { services: string }> = {
  ar: { services: 'تسويق  •  إعلان  •  محتوى' },
  en: { services: 'Marketing  •  Advertising  •  Content' },
};
