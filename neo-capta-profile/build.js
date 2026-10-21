// Builds neo-capta-profile.pptx — Neo Capta company profile (Arabic, RTL).
// Run: node build.js   (assets come from make_assets.py)
const path = require('path');
const pptxgen = require('pptxgenjs');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const sharp = require('sharp');
const fa = require('react-icons/fa6');
const { applyTheme } = require(process.env.PPTX_SKILL
  ? path.join(process.env.PPTX_SKILL, 'scripts/apply_theme.js')
  : './apply_theme.js');

const A = (f) => path.join(__dirname, 'assets', f);
const OUT = path.join(__dirname, 'neo-capta-profile.pptx');

const THEME = {
  name: 'Neo Capta',
  headFontFace: 'Arial',
  bodyFontFace: 'Arial',
  colors: {
    dk1: '0A1033', // ink navy
    lt1: 'FFFFFF',
    dk2: '17246B', // deep brand navy
    lt2: 'F3F4F8', // paper
    accent1: '3B4CC0', // brand blue
    accent2: '7486F2', // light brand blue
    accent3: 'E8E9EE', // logo white
    accent4: '05081A', // near black
    accent5: 'FF5A7A', // reaction pink
    accent6: '8C93B8', // muted text
    hlink: '3B4CC0',
    folHlink: '7486F2',
  },
};

const AR = { rtlMode: true, lang: 'ar-SA', align: 'right' };
const W = 13.333;
const M = 0.6; // outer margin

async function icon(name, color = '#FFFFFF') {
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(fa[name], { color, size: 256 }));
  const buf = await sharp(Buffer.from(svg)).resize(256, 256).png().toBuffer();
  return 'image/png;base64,' + buf.toString('base64');
}

async function main() {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_WIDE';
  pres.title = 'Neo Capta — الملف التعريفي';
  pres.author = 'Neo Capta';
  pres.company = 'Neo Capta';
  pres.rtlMode = true;
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  const C = pres.SchemeColor;

  /* ------------------------------------------------------------ layouts */

  pres.defineSlideMaster({
    title: 'COVER',
    background: { path: A('bg-cover.jpg') },
    objects: [
      { placeholder: { options: { name: 'title', type: 'title', x: 6.6, y: 2.35, w: 6.13, h: 1.7, fontSize: 40, bold: true, color: C.background1, valign: 'top', ...AR }, text: '' } },
      { placeholder: { options: { name: 'body', type: 'body', x: 6.6, y: 4.1, w: 6.13, h: 0.7, fontSize: 22, bold: true, color: C.accent2, valign: 'top', ...AR }, text: '' } },
    ],
  });

  pres.defineSlideMaster({
    title: 'CONTENT',
    background: { color: C.background1 },
    objects: [
      { image: { x: 0, y: 0, w: W, h: 7.5, path: A('halftone-corner.png') } },
      { image: { x: M, y: 6.78, w: 0.8, h: (0.8 * 1548) / 2136, path: A('logo-light-bg.png') } },
      { placeholder: { options: { name: 'title', type: 'title', x: M, y: 0.45, w: W - 2 * M, h: 0.85, fontSize: 36, bold: true, color: C.text1, valign: 'middle', ...AR }, text: '' } },
    ],
    slideNumber: { x: W - M - 0.6, y: 6.85, w: 0.6, h: 0.35, fontSize: 11, color: C.accent6, align: 'right' },
  });

  pres.defineSlideMaster({
    title: 'DARK',
    background: { path: A('bg-quote.jpg') },
    objects: [
      { placeholder: { options: { name: 'title', type: 'title', x: 1.2, y: 2.45, w: W - 2.4, h: 2.2, fontSize: 48, lineSpacingMultiple: 1.3, bold: true, color: C.background1, align: 'center', valign: 'middle', rtlMode: true, lang: 'ar-SA' }, text: '' } },
    ],
  });

  pres.defineSlideMaster({
    title: 'CLOSE',
    background: { path: A('bg-close.jpg') },
    objects: [
      { placeholder: { options: { name: 'title', type: 'title', x: 6.6, y: 1.55, w: 6.13, h: 1.1, fontSize: 40, bold: true, color: C.background1, valign: 'middle', ...AR }, text: '' } },
    ],
  });

  const kicker = (slide, text, dark = false) =>
    slide.addText(text, {
      x: M, y: 0.6, w: 4, h: 0.5, margin: 0, fontSize: 12, bold: true, charSpacing: 4,
      color: dark ? C.accent2 : C.accent1, align: 'left', valign: 'middle', isTextBox: true, objectName: 'Kicker',
    });

  const iconCircle = async (slide, name, x, y, d, objectName, fill = C.accent1) => {
    slide.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { color: fill, width: 0 }, objectName: `${objectName} circle` });
    const pad = d * 0.27;
    slide.addImage({ data: await icon(name), x: x + pad, y: y + pad, w: d - 2 * pad, h: d - 2 * pad, objectName: `${objectName} icon` });
  };

  const imgShadow = () => ({ type: 'outer', color: '0A1033', blur: 12, offset: 4, angle: 90, opacity: 0.25 });

  /* ------------------------------------------------------------ 1. cover */

  pres.addSection({ title: 'البداية' });
  {
    const s = pres.addSlide({ masterName: 'COVER', sectionTitle: 'البداية' });
    s.addImage({ path: A('logo-dark-bg.png'), x: 0.95, y: 1.7, w: 5.1, h: (5.1 * 1548) / 2136, objectName: 'Logo' });
    s.addText('الملف التعريفي', { x: 6.6, y: 1.6, w: 6.13, h: 0.5, margin: 0, fontSize: 18, bold: true, color: C.accent2, ...AR, isTextBox: true, objectName: 'Eyebrow' });
    s.addText('وكالة تسويق وإعلان وصناعة محتوى', { placeholder: 'title' });
    s.addText('فكرتك. تأثيرنا.', { placeholder: 'body' });
    s.addText('MARKETING  •  ADVERTISING  •  CONTENT', { x: 6.6, y: 5.55, w: 6.13, h: 0.4, margin: 0, fontSize: 12, charSpacing: 3, color: C.accent3, align: 'right', isTextBox: true, objectName: 'Services' });
    s.addNotes('افتتاحية: Neo Capta وكالة تسويق وإعلان وصناعة محتوى. الشعار: فكرتك. تأثيرنا.');
  }

  /* ------------------------------------------------------------ 2. about */

  {
    const s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'البداية' });
    kicker(s, 'ABOUT US');
    s.addText('من نحن', { placeholder: 'title' });
    s.addImage({ path: A('still-intro.jpg'), x: M, y: 1.75, w: 6.0, h: 3.375, shadow: imgShadow(), objectName: 'Intro still' });
    s.addText('نحوّل الأفكار إلى قصص… والقصص إلى تأثير.', { x: 7.05, y: 1.75, w: 5.68, h: 1.1, margin: 0, fontSize: 26, bold: true, color: C.accent1, valign: 'top', ...AR, isTextBox: true, objectName: 'Lead' });
    s.addText(
      'Neo Capta وكالة تسويق وإعلان وصناعة محتوى. نشتغل مع العلامات التجارية من أول فكرة لين تشوف أثرها: نفهم الجمهور، نبني الرسالة، ونصنع محتوى يوقّف التمرير ويخلّي الناس تتكلم عنك.',
      { x: 7.05, y: 2.95, w: 5.68, h: 1.9, margin: 0, fontSize: 16, color: C.text1, valign: 'top', paraSpaceAfter: 6, ...AR, isTextBox: true, objectName: 'About body' },
    );
    const pills = ['تسويق', 'إعلان', 'محتوى'];
    pills.forEach((p, i) => {
      const w = 1.55;
      const x = W - M - w - i * (w + 0.25);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 4.6, w, h: 0.55, rectRadius: 0.27, fill: { color: C.background2 }, line: { color: C.accent2, width: 1 }, objectName: `Pill ${i + 1}` });
      s.addText(p, { x, y: 4.6, w, h: 0.55, margin: 0, fontSize: 16, bold: true, color: C.accent1, align: 'center', valign: 'middle', rtlMode: true, lang: 'ar-SA', isTextBox: true, objectName: `Pill ${i + 1} text` });
    });
    s.addNotes('نبذة عن الوكالة. الصورة لقطة من فيديو «من الفكرة إلى التأثير».');
  }

  /* --------------------------------------------- 3. vision / mission / values */

  {
    const s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'البداية' });
    kicker(s, 'VISION  •  MISSION  •  VALUES');
    s.addText('رؤيتنا ورسالتنا وقيمنا', { placeholder: 'title' });
    const cards = [
      { icon: 'FaEye', h: 'رؤيتنا', t: 'أن نكون الشريك الأول لكل علامة تبي تترك أثر حقيقي في جمهورها.' },
      { icon: 'FaCompass', h: 'رسالتنا', t: 'نصنع محتوى ذكي وجميل يوصل للناس الصح، ويحقق نتائج تقدر تقيسها.' },
      { icon: 'FaGem', h: 'قيمنا', t: 'الإبداع، والوضوح، والالتزام، والنتائج قبل كل شي.' },
    ];
    const cw = 3.75;
    const gap = (W - 2 * M - 3 * cw) / 2;
    for (let i = 0; i < 3; i++) {
      const c = cards[i];
      const x = W - M - cw - i * (cw + gap); // right-to-left reading order
      const y = 1.75;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: cw, h: 3.9, rectRadius: 0.18, fill: { color: C.background2 }, line: { color: C.background2, width: 0 }, objectName: `Card ${i + 1}` });
      await iconCircle(s, c.icon, x + cw - 0.4 - 0.95, y + 0.45, 0.95, `Card ${i + 1}`);
      s.addText(c.h, { x: x + 0.4, y: y + 1.65, w: cw - 0.8, h: 0.6, margin: 0, fontSize: 24, bold: true, color: C.text1, ...AR, isTextBox: true, objectName: `Card ${i + 1} title` });
      s.addText(c.t, { x: x + 0.4, y: y + 2.35, w: cw - 0.8, h: 1.7, margin: 0, fontSize: 16, color: C.text1, valign: 'top', ...AR, isTextBox: true, objectName: `Card ${i + 1} body` });
    }
    s.addNotes('صياغة مقترحة للرؤية والرسالة والقيم — راجعها مع الإدارة قبل الاعتماد.');
  }

  /* ------------------------------------------------------------ 4. services */

  pres.addSection({ title: 'الخدمات' });
  {
    const s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'الخدمات' });
    kicker(s, 'WHAT WE DO');
    s.addText('خدماتنا', { placeholder: 'title' });
    const items = [
      { icon: 'FaBullseye', h: 'التسويق الرقمي', t: 'نوصّل علامتك للجمهور الصح، في الوقت الصح.' },
      { icon: 'FaBullhorn', h: 'الإعلانات المدفوعة', t: 'حملات مدروسة… وكل ريال يشتغل لصالحك.' },
      { icon: 'FaPenNib', h: 'صناعة المحتوى', t: 'كتابة وتصوير وقصص تنشاف وتنحفظ.' },
      { icon: 'FaPalette', h: 'الهوية البصرية', t: 'شعار وألوان وشكل يعرفك فيه الكل.' },
      { icon: 'FaMobileScreenButton', h: 'إدارة الحسابات', t: 'حضور ثابت ومتابعة يومية على كل المنصات.' },
      { icon: 'FaFilm', h: 'الفيديو والموشن', t: 'إعلانات متحركة وفيديوهات قصيرة لكل منصة.' },
    ];
    const cw = 3.8;
    const ch = 2.3;
    const gx = (W - 2 * M - 3 * cw) / 2;
    for (let i = 0; i < items.length; i++) {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = W - M - cw - col * (cw + gx);
      const y = 1.6 + row * (ch + 0.3);
      const it = items[i];
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: cw, h: ch, rectRadius: 0.14, fill: { color: C.background1 }, line: { color: 'DDE0EA', width: 1 }, shadow: { type: 'outer', color: '0A1033', blur: 10, offset: 3, angle: 90, opacity: 0.1 }, objectName: `Service ${i + 1}` });
      await iconCircle(s, it.icon, x + cw - 0.35 - 0.8, y + 0.35, 0.8, `Service ${i + 1}`);
      s.addText(it.h, { x: x + 0.35, y: y + 0.38, w: cw - 0.35 - 1.3, h: 0.7, margin: 0, fontSize: 20, bold: true, color: C.text1, valign: 'middle', ...AR, isTextBox: true, objectName: `Service ${i + 1} title` });
      s.addText(it.t, { x: x + 0.35, y: y + 1.35, w: cw - 0.7, h: 0.75, margin: 0, fontSize: 15, color: C.text1, valign: 'top', ...AR, isTextBox: true, objectName: `Service ${i + 1} body` });
    }
    s.addNotes('ست خدمات رئيسية. يمكن تعديل الأسماء حسب العروض الفعلية للوكالة.');
  }

  /* ------------------------------------------------------------ 5. process */

  {
    const s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'الخدمات' });
    kicker(s, 'HOW WE WORK');
    s.addText('كيف نشتغل', { placeholder: 'title' });
    const steps = [
      { n: '01', h: 'نفهم جمهورك', t: 'بحث وتحليل للسوق والمنافسين، ورؤى واضحة عن جمهورك.' },
      { n: '02', h: 'نبني الاستراتيجية', t: 'أهداف ورسائل وقنوات… خطة تعرف وش تبي توصل له.' },
      { n: '03', h: 'نصنع المحتوى', t: 'كتابة وتصميم وفيديو بهوية وحدة على كل منصة.' },
      { n: '04', h: 'نطلق ونقيس', t: 'نشغّل الحملات، نتابع النتائج، ونطوّر باستمرار.' },
    ];
    const colW = 2.75;
    const gap = (W - 2 * M - 4 * colW) / 3;
    const lineY = 2.55;
    s.addShape(pres.shapes.LINE, { x: M + colW / 2, y: lineY, w: W - 2 * M - colW, h: 0, line: { color: C.accent2, width: 2, dashType: 'dash' }, objectName: 'Process line' });
    for (let i = 0; i < 4; i++) {
      const x = W - M - colW - i * (colW + gap);
      const cx = x + colW / 2;
      const d = 1.1;
      s.addShape(pres.shapes.OVAL, { x: cx - d / 2, y: lineY - d / 2, w: d, h: d, fill: { color: i === 3 ? C.accent1 : C.background1 }, line: { color: C.accent1, width: 2.5 }, objectName: `Step ${i + 1} circle` });
      s.addText(steps[i].n, { x: cx - d / 2, y: lineY - d / 2, w: d, h: d, margin: 0, fontSize: 26, bold: true, color: i === 3 ? C.background1 : C.accent1, align: 'center', valign: 'middle', isTextBox: true, objectName: `Step ${i + 1} number` });
      s.addText(steps[i].h, { x, y: 3.45, w: colW, h: 0.6, margin: 0, fontSize: 21, bold: true, color: C.text1, ...AR, align: 'center', isTextBox: true, objectName: `Step ${i + 1} title` });
      s.addText(steps[i].t, { x, y: 4.1, w: colW, h: 1.3, margin: 0, fontSize: 15, color: C.text1, valign: 'top', ...AR, align: 'center', isTextBox: true, objectName: `Step ${i + 1} body` });
    }
    s.addText('شريكك من الفكرة إلى الإطلاق.', { x: M, y: 5.75, w: W - 2 * M, h: 0.55, margin: 0, fontSize: 20, bold: true, color: C.accent1, ...AR, align: 'center', isTextBox: true, objectName: 'Process tagline' });
    s.addNotes('أربع مراحل تُقرأ من اليمين لليسار.');
  }

  /* ------------------------------------------------------------ 6. why us */

  {
    const s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'الخدمات' });
    kicker(s, 'WHY NEO CAPTA');
    s.addText('ليش Neo Capta؟', { placeholder: 'title' });
    s.addImage({ path: A('still-scroll.jpg'), x: M, y: 1.65, w: 5.6, h: 3.15, shadow: imgShadow(), objectName: 'Scroll still' });
    s.addText('من فيديو «وقّف التمرير»', { x: M, y: 4.9, w: 5.6, h: 0.35, margin: 0, fontSize: 11, color: C.accent6, ...AR, isTextBox: true, objectName: 'Still caption' });
    const rows = [
      { icon: 'FaHandPointer', h: 'محتوى يوقّف التمرير', t: 'نصمم لأول ثانيتين… لأنها اللي تقرر إذا الناس بتكمل.' },
      { icon: 'FaUsers', h: 'فريق واحد لكل شي', t: 'من الفكرة والكتابة لين التصميم والنشر والتحليل، تحت سقف واحد.' },
      { icon: 'FaChartLine', h: 'نتائج تقدر تقيسها', t: 'نحدد الأهداف من البداية، ونرجع لك بتقارير واضحة.' },
    ];
    for (let i = 0; i < rows.length; i++) {
      const y = 1.65 + i * 1.5;
      await iconCircle(s, rows[i].icon, W - M - 0.85, y, 0.85, `Why ${i + 1}`);
      s.addText(rows[i].h, { x: 6.75, y: y - 0.02, w: 5.98 - 1.15, h: 0.5, margin: 0, fontSize: 20, bold: true, color: C.text1, ...AR, isTextBox: true, objectName: `Why ${i + 1} title` });
      s.addText(rows[i].t, { x: 6.75, y: y + 0.5, w: 5.98 - 1.15, h: 0.8, margin: 0, fontSize: 15, color: C.text1, valign: 'top', ...AR, isTextBox: true, objectName: `Why ${i + 1} body` });
    }
    s.addNotes('ثلاث نقاط تميّز. الصورة من فيديو «وقّف التمرير».');
  }

  /* ------------------------------------------------------------ 7. work */

  pres.addSection({ title: 'أعمالنا' });
  {
    const s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'أعمالنا' });
    kicker(s, 'OUR WORK');
    s.addText('نماذج من أعمالنا', { placeholder: 'title' });
    const cap = (text, x, y, w) =>
      s.addText(text, { x, y, w, h: 0.3, margin: 0, fontSize: 11, color: C.accent6, ...AR, isTextBox: true, objectName: `Caption ${text}` });
    // Row 1 — three wide films
    const r1 = [
      ['still-story.jpg', '«وش نقول؟» — قصة'],
      ['still-manifesto.jpg', '«حرّك علامتك» — مانيفستو'],
      ['still-journey.jpg', '«رحلة علامتك» — مراحل العمل'],
    ];
    const w1 = (W - 2 * M - 2 * 0.3) / 3;
    const h1 = (w1 * 9) / 16;
    r1.forEach(([img, label], i) => {
      const x = W - M - w1 - i * (w1 + 0.3);
      s.addImage({ path: A(img), x, y: 1.5, w: w1, h: h1, shadow: imgShadow(), objectName: `Work ${label}` });
      cap(label, x, 1.5 + h1 + 0.08, w1);
    });
    // Row 2 — vertical, squares and a light-theme wide piece
    const y2 = 1.5 + h1 + 0.55;
    const h2 = 6.55 - 0.4 - y2;
    const row2 = [
      ['still-brief.jpg', '«البريف» — طولي', (h2 * 9) / 16],
      ['still-grid.jpg', '«شبكة المحتوى» — مربّع', h2],
      ['still-countdown.jpg', '«العد التنازلي» — مربّع', h2],
      ['still-editorial.jpg', '«يُحكى عنه» — ستايل فاتح', (h2 * 16) / 9],
    ];
    const total = row2.reduce((a, r) => a + r[2], 0);
    const g2 = (W - 2 * M - total) / (row2.length - 1);
    let x = W - M;
    row2.forEach(([img, label, w]) => {
      x -= w;
      s.addImage({ path: A(img), x, y: y2, w, h: h2, shadow: imgShadow(), objectName: `Work ${label}` });
      const cw = Math.max(w, 1.6);
      cap(label, x + w - cw, y2 + h2 + 0.08, cw);
      x -= g2;
    });
    s.addNotes('لقطات من فيديوهات Neo Capta المنتجة: عربي وإنقليزي بعدة مقاسات.');
  }

  /* ------------------------------------------------------------ 8. formats */

  {
    const s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'أعمالنا' });
    kicker(s, 'EVERY SCREEN');
    s.addText('مقاس لكل منصة', { placeholder: 'title' });
    const H = 3.4;
    const fmts = [
      { img: 'still-rush.jpg', w: (H * 16) / 9, ratio: '16:9', h: 'عريض', t: 'يوتيوب، والمواقع، وشاشات العرض' },
      { img: 'still-before-after.jpg', w: (H * 9) / 16, ratio: '9:16', h: 'طولي', t: 'ريلز، وتيك توك، والستوري' },
      { img: 'still-carousel.jpg', w: H, ratio: '1:1', h: 'مربّع', t: 'بوستات انستقرام ولينكدإن' },
    ];
    const total = fmts.reduce((a, f) => a + f.w, 0);
    const gap = (W - 2 * M - total) / 2;
    let x = W - M;
    fmts.forEach((f, i) => {
      x -= f.w;
      s.addImage({ path: A(f.img), x, y: 1.55, w: f.w, h: H, shadow: imgShadow(), objectName: `Format ${f.ratio}` });
      const tw = Math.max(f.w, 2.6);
      const tx = x + f.w / 2 - tw / 2;
      s.addText([
        { text: f.ratio + '  ', options: { bold: true, color: C.accent1 } },
        { text: f.h, options: { bold: true, color: C.text1 } },
      ], { x: tx, y: 5.1, w: tw, h: 0.5, margin: 0, fontSize: 20, align: 'center', rtlMode: true, lang: 'ar-SA', isTextBox: true, objectName: `Format ${f.ratio} title` });
      s.addText(f.t, { x: tx, y: 5.6, w: tw, h: 0.5, margin: 0, fontSize: 15, color: C.text1, align: 'center', rtlMode: true, lang: 'ar-SA', isTextBox: true, objectName: `Format ${f.ratio} body` });
      x -= gap;
    });
    s.addText('وكل محتوى نسلّمه بالعربي والإنقليزي.', { x: M, y: 6.25, w: W - 2 * M, h: 0.4, margin: 0, fontSize: 15, bold: true, color: C.accent1, ...AR, align: 'center', isTextBox: true, objectName: 'Formats note' });
    s.addNotes('نفس الفكرة تُنتج بثلاثة مقاسات وبلغتين.');
  }

  /* ------------------------------------------------------------ 9. quote */

  pres.addSection({ title: 'التواصل' });
  {
    const s = pres.addSlide({ masterName: 'DARK', sectionTitle: 'التواصل' });
    s.addImage({ path: A('runner-white.png'), x: W / 2 - 0.55, y: 1.45, w: 1.1, h: (1.1 * 373) / 436, objectName: 'Runner mark' });
    s.addText([
      { text: 'نصنع المحتوى اللي', options: { breakLine: true } },
      { text: 'يوقّف التمرير.', options: { color: C.accent2 } },
    ], { placeholder: 'title' });
    s.addText('WE MAKE THE CONTENT THAT STOPS THE SCROLL', { x: 1.2, y: 4.85, w: W - 2.4, h: 0.4, margin: 0, fontSize: 13, charSpacing: 4, color: C.accent3, align: 'center', isTextBox: true, objectName: 'Quote English' });
    s.addNotes('جملة الختام قبل التواصل.');
  }

  /* ------------------------------------------------------------ 10. contact */

  {
    const s = pres.addSlide({ masterName: 'CLOSE', sectionTitle: 'التواصل' });
    s.addImage({ path: A('logo-dark-bg.png'), x: 0.95, y: 1.7, w: 4.6, h: (4.6 * 1548) / 2136, objectName: 'Logo' });
    s.addText('خلّنا نبدأ قصتك', { placeholder: 'title' });
    s.addText('فكرتك. تأثيرنا.', { x: 6.6, y: 2.7, w: 6.13, h: 0.55, margin: 0, fontSize: 22, bold: true, color: C.accent2, ...AR, isTextBox: true, objectName: 'Tagline' });
    const rows = [
      ['FaEnvelope', 'البريد: [أضف البريد الإلكتروني]'],
      ['FaPhone', 'الجوال: [أضف رقم التواصل]'],
      ['FaGlobe', 'الموقع: [أضف رابط الموقع]'],
      ['FaInstagram', 'سوشال: [أضف الحسابات]'],
    ];
    for (let i = 0; i < rows.length; i++) {
      const y = 3.65 + i * 0.68;
      await iconCircle(s, rows[i][0], W - M - 0.5, y, 0.5, `Contact ${i + 1}`, C.accent1);
      s.addText(rows[i][1], { x: 6.6, y, w: 6.13 - 0.7, h: 0.5, margin: 0, fontSize: 16, color: C.accent3, valign: 'middle', ...AR, isTextBox: true, objectName: `Contact ${i + 1} text` });
    }
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
