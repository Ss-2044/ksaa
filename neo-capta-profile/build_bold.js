// Builds neo-capta-profile-bold.pptx — second take on the Neo Capta profile:
// dark throughout, big type, full-bleed stills, fewer words. Arabic, RTL.
// Run: node build_bold.js   (assets from make_assets.py + make_assets_bold.py)
const path = require('path');
const pptxgen = require('pptxgenjs');
const { applyTheme } = require('./apply_theme.js');

const A = (f) => path.join(__dirname, 'assets', f);
const OUT = path.join(__dirname, 'neo-capta-profile-bold.pptx');

const THEME = {
  name: 'Neo Capta Bold',
  headFontFace: 'Arial',
  bodyFontFace: 'Arial',
  colors: {
    dk1: '05081A',
    lt1: 'FFFFFF',
    dk2: '17246B',
    lt2: 'E8E9EE',
    accent1: '3B4CC0',
    accent2: '7486F2',
    accent3: 'E8E9EE',
    accent4: '0A1033',
    accent5: 'FF5A7A',
    accent6: '8C93B8',
    hlink: '7486F2',
    folHlink: '3B4CC0',
  },
};

const AR = { rtlMode: true, lang: 'ar-SA', align: 'right' };
const W = 13.333;
const H = 7.5;
const M = 0.6;
const LOGO_RATIO = 1548 / 2136;

async function main() {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_WIDE';
  pres.title = 'Neo Capta — الملف التعريفي';
  pres.author = 'Neo Capta';
  pres.company = 'Neo Capta';
  pres.rtlMode = true;
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  const C = pres.SchemeColor;

  const footer = [
    { image: { x: M, y: 6.78, w: 0.8, h: 0.8 * LOGO_RATIO, path: A('logo-dark-bg.png') } },
  ];
  const slideNumber = { x: W - M - 0.6, y: 6.85, w: 0.6, h: 0.35, fontSize: 11, color: C.accent6, align: 'right' };

  // Dark content frame with a title.
  pres.defineSlideMaster({
    title: 'BOLD_TITLE',
    background: { path: A('bg-plain.jpg') },
    objects: [
      ...footer,
      { placeholder: { options: { name: 'title', type: 'title', x: M, y: 0.5, w: W - 2 * M, h: 1.0, fontSize: 40, bold: true, color: C.background1, valign: 'middle', ...AR }, text: '' } },
    ],
    slideNumber,
  });

  // Full-bleed frame: each slide sets its own background image.
  pres.defineSlideMaster({
    title: 'BOLD_FULL',
    background: { color: C.text1 },
    objects: [...footer],
    slideNumber,
  });

  const kicker = (slide, text, x, y, w, align = 'right') =>
    slide.addText(text, { x, y, w, h: 0.6, margin: 0, fontSize: 15, bold: true, charSpacing: /[\u0600-\u06FF]/.test(text) ? 0 : 3, color: C.accent2, align, rtlMode: align === 'right', lang: 'ar-SA', valign: 'middle', isTextBox: true, objectName: 'Kicker' });

  const shadow = () => ({ type: 'outer', color: '000000', blur: 14, offset: 4, angle: 90, opacity: 0.45 });

  const outlined = (slide, text, opts) =>
    slide.addText(text, {
      margin: 0, bold: true, color: C.accent2, isTextBox: true, ...opts,
    });

  /* ------------------------------------------------------------ 1. cover */

  pres.addSection({ title: 'البداية' });
  {
    const s = pres.addSlide({ masterName: 'BOLD_FULL', sectionTitle: 'البداية' });
    s.background = { path: A('hero-cover.jpg') };
    kicker(s, 'NEO CAPTA  —  الملف التعريفي', 6.4, 1.55, 6.33);
    s.addText([
      { text: 'فكرتك.', options: { color: C.background1, breakLine: true } },
      { text: 'تأثيرنا.', options: { color: C.accent2 } },
    ], { x: 6.4, y: 2.1, w: 6.33, h: 2.8, margin: 0, fontSize: 80, bold: true, valign: 'top', lineSpacingMultiple: 1.05, ...AR, isTextBox: true, objectName: 'Cover headline' });
    s.addText('وكالة تسويق وإعلان وصناعة محتوى', { x: 6.4, y: 5.05, w: 6.33, h: 0.6, margin: 0, fontSize: 24, color: C.background2, ...AR, isTextBox: true, objectName: 'Cover subtitle' });
    s.addNotes('غلاف: الشعار من فيديو «من الفكرة إلى التأثير»، والعنوان هو شعار الوكالة.');
  }

  /* ------------------------------------------------------- 2. the problem */

  {
    const s = pres.addSlide({ masterName: 'BOLD_FULL', sectionTitle: 'البداية' });
    s.background = { path: A('bg-cover.jpg') };
    const lines = [
      ['السوق مزدحم.', C.accent6, 44],
      ['الجميع يتكلم.', C.background2, 54],
      ['وقليلون فقط يُسمَعون.', C.accent2, 66],
    ];
    let y = 1.35;
    lines.forEach(([t, color, size], i) => {
      const h = size / 72 * 1.45;
      s.addText(t, { x: M, y, w: W - 2 * M, h, margin: 0, fontSize: size, bold: true, color, ...AR, isTextBox: true, objectName: `Problem line ${i + 1}` });
      y += h + 0.25;
    });
    s.addText('ودورنا نخلّي علامتك منهم.', { x: M, y: y + 0.15, w: W - 2 * M, h: 0.6, margin: 0, fontSize: 22, color: C.background1, ...AR, isTextBox: true, objectName: 'Problem answer' });
    s.addNotes('المشكلة اللي نحلها: زحمة المحتوى. مأخوذة من فيديو «حرّك علامتك».');
  }

  /* ------------------------------------------------------------ 3. about */

  {
    const s = pres.addSlide({ masterName: 'BOLD_FULL', sectionTitle: 'البداية' });
    s.background = { path: A('hero-about.jpg') };
    kicker(s, 'من نحن', 7.2, 0.85, 5.53);
    s.addText('نحوّل الأفكار إلى قصص… والقصص إلى تأثير.', { x: 7.2, y: 1.5, w: 5.53, h: 2.25, margin: 0, fontSize: 36, bold: true, color: C.background1, valign: 'top', ...AR, isTextBox: true, objectName: 'About headline' });
    s.addText(
      'Neo Capta وكالة تسويق وإعلان وصناعة محتوى. نمسك علامتك من أول فكرة: نفهم جمهورها، نبني رسالتها، ونصنع لها محتوى يوقّف التمرير ويخلّي الناس تتكلم.',
      { x: 7.2, y: 3.95, w: 5.53, h: 1.5, margin: 0, fontSize: 16, color: C.background2, valign: 'top', ...AR, isTextBox: true, objectName: 'About body' },
    );
    s.addText('تسويق   ·   إعلان   ·   محتوى', { x: 7.2, y: 5.6, w: 5.53, h: 0.55, margin: 0, fontSize: 22, bold: true, color: C.accent2, ...AR, isTextBox: true, objectName: 'About pillars' });
    s.addNotes('نبذة قصيرة. الخلفية من فيديو «رحلة علامتك».');
  }

  /* ---------------------------------------------------------- 4. pillars */

  pres.addSection({ title: 'وش نسوي' });
  {
    const s = pres.addSlide({ masterName: 'BOLD_TITLE', sectionTitle: 'وش نسوي' });
    s.addText('ثلاث كلمات تختصرنا', { placeholder: 'title' });
    const cols = [
      { w: 'تسويق', items: ['استراتيجية التسويق', 'التسويق الرقمي', 'تحليل الجمهور والمنافسين'] },
      { w: 'إعلان', items: ['الحملات الإعلانية', 'الإعلانات المدفوعة', 'متابعة الأداء والنتائج'] },
      { w: 'محتوى', items: ['كتابة المحتوى', 'التصميم والهوية البصرية', 'الفيديو والموشن', 'إدارة الحسابات'] },
    ];
    const gap = 0.5;
    const cw = (W - 2 * M - 2 * gap) / 3;
    cols.forEach((c, i) => {
      const x = W - M - cw - i * (cw + gap);
      outlined(s, `0${i + 1}`, { x, y: 1.75, w: cw, h: 0.9, fontSize: 54, align: 'right', objectName: `Pillar ${i + 1} number` });
      s.addText(c.w, { x, y: 2.7, w: cw, h: 1.1, margin: 0, fontSize: 60, bold: true, color: C.background1, ...AR, isTextBox: true, objectName: `Pillar ${i + 1} word` });
      s.addText(
        c.items.map((t, k) => ({ text: t, options: { breakLine: k < c.items.length - 1 } })),
        { x, y: 4.0, w: cw, h: 2.4, margin: 0, fontSize: 17, color: C.background2, valign: 'top', paraSpaceAfter: 8, ...AR, isTextBox: true, objectName: `Pillar ${i + 1} list` },
      );
      if (i < 2) {
        s.addShape(pres.shapes.LINE, { x: x - gap / 2, y: 1.85, w: 0, h: 4.4, line: { color: '2A3570', width: 1 }, objectName: `Pillar divider ${i + 1}` });
      }
    });
    s.addNotes('الأعمدة الثلاثة للخدمات. عدّل البنود حسب العروض الفعلية.');
  }

  /* ---------------------------------------------------------- 5. process */

  {
    const s = pres.addSlide({ masterName: 'BOLD_TITLE', sectionTitle: 'وش نسوي' });
    s.addText('من الفكرة… إلى الإطلاق', { placeholder: 'title' });
    const steps = [
      ['نفهم', 'جمهورك وسوقك ومنافسيك قبل أي كلمة.'],
      ['نخطط', 'أهداف ورسائل وقنوات واضحة.'],
      ['نصنع', 'كتابة وتصميم وفيديو بهوية وحدة.'],
      ['نطلق', 'ونقيس النتائج… ونطوّر باستمرار.'],
    ];
    const gap = 0.35;
    const cw = (W - 2 * M - 3 * gap) / 4;
    steps.forEach(([h, t], i) => {
      const x = W - M - cw - i * (cw + gap);
      const last = i === 3;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.8, w: cw, h: 4.5, rectRadius: 0.12, fill: { color: last ? C.accent1 : '0E1640' }, line: { color: last ? C.accent1 : '232E6B', width: 1 }, objectName: `Step ${i + 1} panel` });
      outlined(s, `0${i + 1}`, { x: x + 0.3, y: 2.05, w: cw - 0.6, h: 1.4, fontSize: 88, align: 'right', color: last ? C.background1 : C.accent2, objectName: `Step ${i + 1} number` });
      s.addText(h, { x: x + 0.3, y: 3.75, w: cw - 0.6, h: 0.9, margin: 0, fontSize: 40, bold: true, color: C.background1, ...AR, isTextBox: true, objectName: `Step ${i + 1} title` });
      s.addText(t, { x: x + 0.3, y: 4.75, w: cw - 0.6, h: 1.3, margin: 0, fontSize: 16, color: last ? C.background1 : C.background2, valign: 'top', ...AR, isTextBox: true, objectName: `Step ${i + 1} body` });
    });
    s.addNotes('أربع مراحل، تُقرأ من اليمين لليسار.');
  }

  /* ------------------------------------------------------------- 6. work */

  pres.addSection({ title: 'شغلنا' });
  {
    const s = pres.addSlide({ masterName: 'BOLD_TITLE', sectionTitle: 'شغلنا' });
    s.addText('شغلنا يتكلم', { placeholder: 'title' });
    const bigW = 7.75;
    const bigH = (bigW * 9) / 16;
    const smallH = (bigH - 0.2) / 2;
    const smallW = (smallH * 16) / 9;
    const total = bigW + 0.3 + smallW;
    const right = W - (W - total) / 2;
    const y = 1.7;
    s.addImage({ path: A('work-rush.jpg'), x: right - bigW, y, w: bigW, h: bigH, shadow: shadow(), objectName: 'Work rush' });
    s.addImage({ path: A('work-impact.jpg'), x: right - total, y, w: smallW, h: smallH, shadow: shadow(), objectName: 'Work impact' });
    s.addImage({ path: A('work-blank.jpg'), x: right - total, y: y + smallH + 0.2, w: smallW, h: smallH, shadow: shadow(), objectName: 'Work blank page' });
    const cap = (t, x, w) => s.addText(t, { x, y: y + bigH + 0.12, w, h: 0.35, margin: 0, fontSize: 12, color: C.accent6, ...AR, isTextBox: true, objectName: `Caption ${t}` });
    cap('«سرعة» — قطعات على الإيقاع', right - bigW, bigW);
    cap('«وش نقول؟» و«الصفحة الفاضية»', right - total, smallW);
    s.addNotes('لقطات من فيديوهات منتجة لـ Neo Capta.');
  }

  {
    const s = pres.addSlide({ masterName: 'BOLD_TITLE', sectionTitle: 'شغلنا' });
    s.addText('لكل شاشة… نسخة', { placeholder: 'title' });
    const vh = 4.1;
    const vw = (vh * 9) / 16;
    const sq = 3.4;
    const items = [
      { img: 'work-sting.jpg', w: vw, h: vh, label: '9:16 — ريلز وستوري' },
      { img: 'work-carousel.jpg', w: sq, h: sq, label: '1:1 — بوستات' },
      { img: 'work-story-v.jpg', w: vw, h: vh, label: '9:16 — تيك توك' },
    ];
    const gap = 0.6;
    const total = items.reduce((a, it) => a + it.w, 0) + gap * (items.length - 1);
    let x = W - (W - total) / 2;
    const base = 1.6 + vh;
    items.forEach((it, i) => {
      x -= it.w;
      s.addImage({ path: A(it.img), x, y: base - it.h, w: it.w, h: it.h, shadow: shadow(), objectName: `Format ${i + 1}` });
      s.addText(it.label, { x: x - 0.4, y: base + 0.15, w: it.w + 0.8, h: 0.4, margin: 0, fontSize: 14, bold: true, color: C.background2, align: 'center', rtlMode: true, lang: 'ar-SA', isTextBox: true, objectName: `Format ${i + 1} label` });
      x -= gap;
    });
    s.addText('وكل نسخة بالعربي والإنقليزي.', { x: M, y: 6.3, w: W - 2 * M, h: 0.45, margin: 0, fontSize: 18, bold: true, color: C.accent2, align: 'center', rtlMode: true, lang: 'ar-SA', isTextBox: true, objectName: 'Formats note' });
    s.addNotes('نفس الفكرة بعدة مقاسات ولغتين.');
  }

  /* ---------------------------------------------------------- 7. why us */

  {
    const s = pres.addSlide({ masterName: 'BOLD_TITLE', sectionTitle: 'شغلنا' });
    s.addText('ليش Neo Capta؟', { placeholder: 'title' });
    const rows = [
      ['نصمم لأول ثانيتين.', 'لأنها اللي تقرر إذا الناس بتوقف… أو تكمل تمرير.'],
      ['فريق واحد، من الفكرة للنتيجة.', 'كتابة وتصميم وفيديو ونشر وتحليل… تحت سقف واحد.'],
      ['أرقام قبل الكلام.', 'نحدد الأهداف من البداية، ونرجع لك بتقارير واضحة.'],
    ];
    rows.forEach(([h, t], i) => {
      const y = 1.75 + i * 1.6;
      outlined(s, `0${i + 1}`, { x: W - M - 1.5, y: y - 0.05, w: 1.5, h: 1.2, fontSize: 72, align: 'right', objectName: `Why ${i + 1} number` });
      s.addText(h, { x: M, y, w: W - 2 * M - 1.8, h: 0.65, margin: 0, fontSize: 30, bold: true, color: C.background1, ...AR, isTextBox: true, objectName: `Why ${i + 1} title` });
      s.addText(t, { x: M, y: y + 0.68, w: W - 2 * M - 1.8, h: 0.5, margin: 0, fontSize: 17, color: C.background2, ...AR, isTextBox: true, objectName: `Why ${i + 1} body` });
    });
    s.addNotes('ثلاث نقاط تميّز.');
  }

  /* ------------------------------------------------------------ 8. quote */

  pres.addSection({ title: 'يلا نبدأ' });
  {
    const s = pres.addSlide({ masterName: 'BOLD_FULL', sectionTitle: 'يلا نبدأ' });
    s.background = { path: A('bg-close.jpg') };
    s.addText([
      { text: 'لا نصنع محتوى فقط…', options: { color: C.background2, breakLine: true } },
      { text: 'نصنع تأثيرًا.', options: { color: C.accent2 } },
    ], { x: M, y: 2.2, w: W - 2 * M, h: 3.0, margin: 0, fontSize: 66, bold: true, align: 'center', valign: 'middle', lineSpacingMultiple: 1.15, rtlMode: true, lang: 'ar-SA', isTextBox: true, objectName: 'Quote' });
    s.addNotes('جملة الختام من فيديو «من الفكرة إلى التأثير».');
  }

  /* ---------------------------------------------------------- 9. contact */

  {
    const s = pres.addSlide({ masterName: 'BOLD_FULL', sectionTitle: 'يلا نبدأ' });
    s.background = { path: A('bg-plain.jpg') };
    s.addImage({ path: A('logo-dark-bg.png'), x: 1.0, y: 1.9, w: 4.4, h: 4.4 * LOGO_RATIO, objectName: 'Logo' });
    s.addText('يلا نبدأ.', { x: 6.4, y: 1.5, w: 6.33, h: 1.4, margin: 0, fontSize: 80, bold: true, color: C.background1, ...AR, isTextBox: true, objectName: 'CTA' });
    s.addText('عندك فكرة؟ إحنا نكمّل القصة.', { x: 6.4, y: 2.95, w: 6.33, h: 0.6, margin: 0, fontSize: 24, color: C.accent2, bold: true, ...AR, isTextBox: true, objectName: 'CTA sub' });
    const rows = [
      ['البريد', '[أضف البريد الإلكتروني]'],
      ['الجوال', '[أضف رقم التواصل]'],
      ['الموقع', '[أضف رابط الموقع]'],
      ['سوشال', '[أضف الحسابات]'],
    ];
    rows.forEach(([k, v], i) => {
      const y = 3.95 + i * 0.6;
      s.addText([
        { text: k + '   ', options: { bold: true, color: C.accent2 } },
        { text: v, options: { color: C.background2 } },
      ], { x: 6.4, y, w: 6.33, h: 0.5, margin: 0, fontSize: 18, valign: 'middle', ...AR, isTextBox: true, objectName: `Contact ${k}` });
    });
    s.addNotes('عبّئ بيانات التواصل الفعلية مكان الأقواس.');
  }

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log('wrote', OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
