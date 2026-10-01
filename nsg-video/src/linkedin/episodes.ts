import {createElement} from 'react';
import {Episode, EpisodeShell, episodeFrames} from './Shell';
import * as V from './visuals';

const MAC = 'Music: Kevin MacLeod (incompetech.com) · CC BY 4.0';

export const EPISODES: Record<string, Episode> = {
  ep01: {
    n: '01',
    hook: 'كل معلومة تقريباً… لها مكانٌ على الأرض',
    hookEn: 'Almost every piece of information has a place on Earth',
    HookVisual: V.V_Globe,
    beats: [
      {kicker: 'التعريف', title: 'ما هي البيانات الجيومكانية؟', body: 'أي معلومة مرتبطة بموقع على سطح الأرض: ماذا يوجد؟ وأين؟ ومتى؟', Visual: V.V_Equation},
      {kicker: 'المصادر', title: 'من أين تأتي؟', body: 'من الأقمار الصناعية وأنظمة الملاحة والطائرات المسيّرة والمسح الأرضي والحساسات.', Visual: V.V_Sources},
      {kicker: 'الأشكال', title: 'نقاط وخطوط ومساحات… وصور', body: 'البيانات المتجهية ترسم المعالم بدقة، والبيانات الشبكية (الصور) تغطي كل شبر.', Visual: V.V_Forms},
      {kicker: 'الاستخدامات', title: 'أين نستخدمها؟', body: 'في كل قرار يعتمد على المكان: من تخطيط المدن… إلى الاستجابة للطوارئ.', Visual: V.V_Uses},
    ],
    takeaway: 'حين تعرف «أين»… تفهم «لماذا»',
    music: 'music/inspired.mp3',
    volume: 0.3,
    source: `Imagery: NASA (Galileo, ISS) · Map data © OpenStreetMap contributors · ${MAC} — "Inspired"`,
  },
  ep02: {
    n: '02',
    hook: '«صورة فضائية عالية الدقة»… أي دقة نقصد؟',
    hookEn: 'High-resolution satellite image — which resolution?',
    HookVisual: V.V_Question,
    beats: [
      {kicker: '1 · الدقة المكانية', title: 'حجم البكسل على الأرض', body: 'كم متراً يغطي البكسل الواحد؟ كلما صغر البكسل… ظهرت تفاصيل أدق.', Visual: V.V_Spatial},
      {kicker: '2 · الدقة الطيفية', title: 'كم «لوناً» يرى المستشعر؟', body: 'بعض المستشعرات ترى ما بعد الضوء المرئي، مثل الأشعة تحت الحمراء التي تكشف صحة النبات.', Visual: V.V_Spectral},
      {kicker: '3 · الدقة الزمنية', title: 'متى يعود القمر للمكان نفسه؟', body: 'Landsat يعود كل 16 يوماً، وزوج أقمار Sentinel-2 كل 5 أيام عند خط الاستواء.', Visual: V.V_Temporal},
      {kicker: '4 · الدقة الإشعاعية', title: 'كم درجة سطوع يميّز؟', body: 'كلما زادت البتات… رأى المستشعر فروقاً أدق بين الظلال والإضاءة.', Visual: V.V_Radiometric},
    ],
    takeaway: 'الدقة ليست رقماً واحداً… اختر البيانات حسب سؤالك',
    music: 'music/floating-cities.mp3',
    volume: 0.35,
    source: `Imagery: NASA ISS crew photography (pixelation illustrative) · ${MAC} — "Floating Cities"`,
  },
  ep03: {
    n: '03',
    hook: 'كيف نعرف صحة مزرعة… من مئات الكيلومترات؟',
    hookEn: 'How do we check a farm’s health from orbit?',
    HookVisual: V.V_Farm,
    beats: [
      {kicker: 'المبدأ', title: 'النبات الصحي «يلمع» بالأشعة تحت الحمراء', body: 'الكلوروفيل يمتص الضوء الأحمر، بينما تعكس أوراق النبات السليمة الأشعة تحت الحمراء القريبة بقوة.', Visual: V.V_Leaf},
      {kicker: 'المؤشر', title: 'NDVI', body: 'مؤشر بسيط يقارن النطاقين: قيمه من −1 إلى +1، وكلما اقترب من +1 كان الغطاء النباتي أكثف.', Visual: V.V_Formula},
      {kicker: 'مثال', title: 'حقول الجوف من الفضاء', body: 'في صور الألوان الكاذبة يظهر النبات بالأحمر… فتبدو الحقول الدائرية واضحة في قلب الصحراء.', Visual: V.V_Jowf},
      {kicker: 'الاستخدامات', title: 'ماذا نستفيد؟', body: 'متابعة المحاصيل، ورصد الجفاف مبكراً، وترشيد المياه… على مساحات لا يغطيها أي فريق ميداني.', Visual: V.V_AgriUses},
    ],
    takeaway: 'ما لا تراه العين… يقيسه المستشعر',
    music: 'music/clean-soul.mp3',
    volume: 0.4,
    trimBefore: 34,
    source: `Imagery: NASA/JPL (Terra ASTER, Landsat) · ${MAC} — "Clean Soul"`,
  },
  ep04: {
    n: '04',
    hook: 'ماذا تخبرنا أضواء الليل… من الفضاء؟',
    hookEn: 'What do night lights tell us from space?',
    HookVisual: V.V_Night,
    beats: [
      {kicker: 'القياس', title: 'الأقمار تقيس الضوء ليلاً', body: 'مستشعرات حساسة تلتقط أضواء المدن والطرق والمنشآت، لتصنع خرائط مثل «الرخام الأسود» من NASA.', Visual: V.V_Arabia},
      {kicker: 'القراءة', title: 'أين تتركز الحياة؟', body: 'تظهر المدن الكبرى بوضوح، وتظهر الطرق بينها كخيوط من الضوء.', Visual: V.V_Clusters},
      {kicker: 'المعنى', title: 'الضوء مؤشر تقريبي', body: 'يرتبط سطوع الليل غالباً بالكثافة السكانية والنشاط الاقتصادي، لذلك يستخدمه الباحثون مؤشراً مساعداً.', Visual: V.V_Proxy},
      {kicker: 'الاستخدامات', title: 'لماذا يهم؟', body: 'لرصد التوسع العمراني، وتخطيط الكهرباء، وتقدير السكان، ومتابعة التعافي بعد الكوارث.', Visual: V.V_LightUses},
    ],
    takeaway: 'خريطة الضوء… نافذة على حركة الحياة',
    music: 'music/dreams-become-real.mp3',
    volume: 0.4,
    trimBefore: 41,
    source: `Imagery: NASA Black Marble 2016 · NASA ISS crew photography · ${MAC} — "Dreams Become Real"`,
  },
};

export const epFrames = (id: string) => episodeFrames(EPISODES[id]);
export const EpisodeById: React.FC<{id: string}> = ({id}) => createElement(EpisodeShell, {e: EPISODES[id]});
