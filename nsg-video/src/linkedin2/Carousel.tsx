import {AbsoluteFill, Img, staticFile} from 'remotion';
import {InkLogo} from '../designC/InkLogo';
import {LightBg} from '../designC/LightBg';
import {C} from '../designC/theme';
import {useFonts} from '../Video';
import {AR, EN} from './common';

export const SLIDES: {abbr: string; ar: string; def: string}[] = [
  {abbr: 'SAR', ar: 'رادار الفتحة الاصطناعية', def: 'رادار يصوّر الأرض بإرسال موجات واستقبال صداها، ويعمل ليلاً وعبر الغيوم.'},
  {abbr: 'DEM', ar: 'نموذج الارتفاع الرقمي', def: 'شبكة خلايا، في كل خلية ارتفاع سطح الأرض عن مستوى البحر.'},
  {abbr: 'NDVI', ar: 'مؤشر الغطاء النباتي', def: 'قيمة من −1 إلى +1 تقيس كثافة النبات من الأشعة تحت الحمراء والضوء الأحمر.'},
  {abbr: 'GNSS', ar: 'أنظمة الملاحة بالأقمار', def: 'GPS وGalileo وGLONASS وBeiDou… أنظمة تحدد موقعك من إشارات الأقمار.'},
  {abbr: 'GSD', ar: 'المسافة الأرضية للبكسل', def: 'كم يغطي البكسل الواحد على الأرض. كلما صغر الرقم زادت التفاصيل.'},
  {abbr: 'LiDAR', ar: 'الكشف بالضوء', def: 'نبضات ليزر تقيس المسافة، وتبني ملايين النقاط ثلاثية الأبعاد.'},
  {abbr: 'Ortho', ar: 'التصحيح الهندسي', def: 'إزالة تشوه الزاوية والتضاريس لتطابق الصورة الخريطة بدقة.'},
  {abbr: 'Raster', ar: 'البيانات الشبكية', def: 'بيانات على شكل بكسلات، مثل الصور الفضائية ونماذج الارتفاع.'},
  {abbr: 'Vector', ar: 'البيانات المتجهية', def: 'نقاط وخطوط ومساحات تمثل المعالم، مثل الطرق والمباني والحدود.'},
  {abbr: 'Revisit', ar: 'زمن إعادة الزيارة', def: 'المدة بين تصويرين متتاليين للمكان نفسه، مثل 5 أيام لزوج أقمار Sentinel-2.'},
];
export const CAROUSEL_COUNT = SLIDES.length + 2;

export const CarouselSlide: React.FC<{i: number}> = ({i}) => {
  useFonts();
  const total = CAROUSEL_COUNT;
  const Footer = (
    <div style={{position: 'absolute', bottom: 50, left: 70, right: 70, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
      <InkLogo width={150} />
      <div style={{fontFamily: EN, fontWeight: 700, fontSize: 24, color: C.muted}}>
        {i + 1} / {total}
      </div>
    </div>
  );
  if (i === 0)
    return (
      <AbsoluteFill>
        <LightBg />
        <AbsoluteFill style={{padding: 90, justifyContent: 'center'}}>
          <div dir="rtl" style={{fontFamily: AR, fontWeight: 700, fontSize: 40, color: C.accent}}>
            دليل سريع
          </div>
          <div dir="rtl" style={{fontFamily: AR, fontWeight: 800, fontSize: 120, color: C.ink, lineHeight: 1.15, marginTop: 10}}>
            10 مصطلحات
          </div>
          <div dir="rtl" style={{fontFamily: AR, fontWeight: 800, fontSize: 72, color: C.ink, lineHeight: 1.3}}>
            في البيانات الجيومكانية
          </div>
          <div dir="rtl" style={{fontFamily: AR, fontSize: 40, color: C.muted, marginTop: 30}}>
            اسحب لليسار ←
          </div>
          <div style={{position: 'absolute', left: 90, top: 140, width: 300, height: 300, borderRadius: '50%', overflow: 'hidden', border: `6px solid ${C.ink}`}}>
            <Img src={staticFile('space/earth-arabia-galileo.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </div>
        </AbsoluteFill>
        {Footer}
      </AbsoluteFill>
    );
  if (i === total - 1)
    return (
      <AbsoluteFill>
        <LightBg />
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 90}}>
          <InkLogo width={460} />
          <div dir="rtl" style={{fontFamily: AR, fontWeight: 800, fontSize: 64, color: C.ink, textAlign: 'center', marginTop: 80, lineHeight: 1.4}}>
            أي مصطلح تريد أن نشرحه في الحلقات القادمة؟
          </div>
          <div dir="rtl" style={{fontFamily: AR, fontSize: 38, color: C.muted, marginTop: 30}}>
            شاركنا في التعليقات
          </div>
        </AbsoluteFill>
        {Footer}
      </AbsoluteFill>
    );
  const s = SLIDES[i - 1];
  return (
    <AbsoluteFill>
      <LightBg />
      <AbsoluteFill style={{padding: 90, justifyContent: 'center'}}>
        <div style={{fontFamily: EN, fontWeight: 700, fontSize: 30, letterSpacing: '0.3em', color: C.muted}}>{String(i).padStart(2, '0')} / 10</div>
        <div style={{fontFamily: EN, fontWeight: 800, fontSize: 200, color: C.ink, lineHeight: 1.05, marginTop: 10}}>{s.abbr}</div>
        <div dir="rtl" style={{fontFamily: AR, fontWeight: 800, fontSize: 70, color: C.accent, textAlign: 'right', marginTop: 20}}>
          {s.ar}
        </div>
        <div style={{height: 4, width: 160, background: C.ink, margin: '40px 0 40px auto'}} />
        <div dir="rtl" style={{fontFamily: AR, fontWeight: 600, fontSize: 52, color: C.ink, lineHeight: 1.6, textAlign: 'right'}}>
          {s.def}
        </div>
      </AbsoluteFill>
      {Footer}
    </AbsoluteFill>
  );
};
