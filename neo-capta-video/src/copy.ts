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
