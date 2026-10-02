import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {AR, clamp, DarkFrame, EN, MAC, Music, NAVY} from './common';

export const PHOTO_FRAMES = 600; // 20 s
type Note = {x: number; y: number; ar: string; side: 'left' | 'right'};
type PhotoDef = {src: string; aspect: number; title: string; where: string; sensor: string; notes: Note[]; fact: string; music: string; trim?: number};

export const PHOTOS: Record<string, PhotoDef> = {
  apollo: {
    src: 'space/apollo17-red-sea.jpg',
    aspect: 1000 / 692,
    title: 'الجزيرة العربية من رحلة Apollo 17',
    where: 'ديسمبر 1972 · في الطريق إلى القمر',
    sensor: 'NASA · AS17-148-22718',
    notes: [
      {x: 0.095, y: 0.39, ar: 'البحر الأحمر', side: 'right'},
      {x: 0.3, y: 0.33, ar: 'الجزيرة العربية', side: 'right'},
      {x: 0.23, y: 0.65, ar: 'القرن الأفريقي', side: 'right'},
    ],
    fact: 'صوّرها رواد الفضاء بكاميرا محمولة باليد أثناء رحلتهم إلى القمر.',
    music: 'music/lightless-dawn.mp3',
    trim: 2,
  },
  wajh: {
    src: 'space/al-wajh-bank.jpg',
    aspect: 1000 / 662,
    title: 'ضفّة الوجه من محطة الفضاء',
    where: 'ديسمبر 2007 · الساحل الشمالي الغربي',
    sensor: 'NASA · ISS016-E-019394',
    notes: [
      {x: 0.52, y: 0.27, ar: 'حواجز مرجانية', side: 'left'},
      {x: 0.72, y: 0.57, ar: 'جزيرة رملية', side: 'left'},
      {x: 0.4, y: 0.75, ar: 'مياه ضحلة فيروزية', side: 'right'},
    ],
    fact: 'تضم المنطقة قرابة 260 نوعاً من المرجان بحسب وصف NASA.',
    music: 'music/spacial-harvest.mp3',
    trim: 2,
  },
  jubail: {
    src: 'space/jubail-night.jpg',
    aspect: 1000 / 666,
    title: 'الجبيل ليلاً من محطة الفضاء',
    where: 'يونيو 2012 · ساحل الخليج العربي',
    sensor: 'NASA · ISS031-E-143143',
    notes: [
      {x: 0.525, y: 0.525, ar: 'دائرة ضوء ساطعة: على الأرجح نشاط معالجة أو إنشاء', side: 'right'},
      {x: 0.56, y: 0.42, ar: 'المنطقة الصناعية: الأكثر سطوعاً', side: 'right'},
      {x: 0.38, y: 0.47, ar: 'المركز السكني والتجاري', side: 'left'},
    ],
    fact: 'منذ 1975 ارتبطت المدينة بصناعات البتروكيماويات والأسمدة والحديد.',
    music: 'music/night-vigil.mp3',
    trim: 1.5,
  },
};

const W = 960;

const PhotoWeekView: React.FC<{p: PhotoDef}> = ({p}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const H = W / p.aspect;
  const zoom = interpolate(frame, [0, PHOTO_FRAMES], [1.0, 1.06]);
  const fact = spring({frame: frame - 430, fps, config: {damping: 200}});
  return (
    <DarkFrame series="صورة الأسبوع" seriesEn="IMAGE OF THE WEEK" source={`Imagery: ${p.sensor} · ${MAC}`}>
      <div style={{position: 'absolute', top: 170, left: 60, right: 60, textAlign: 'right'}}>
        <div dir="rtl" style={{fontFamily: AR, fontWeight: 800, fontSize: 58, color: '#fff', lineHeight: 1.25}}>
          {p.title}
        </div>
        <div dir="rtl" style={{fontFamily: AR, fontSize: 30, color: 'rgba(255,255,255,0.7)', marginTop: 6}}>
          {p.where}
        </div>
      </div>
      <div style={{position: 'absolute', top: 380, left: 60, width: W, height: H, borderRadius: 24, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.5)'}}>
        <Img src={staticFile(p.src)} style={{width: W, height: H, transform: `scale(${zoom})`, transformOrigin: '50% 50%'}} />
        {p.notes.map((n, i) => {
          const at = 60 + i * 110;
          const q = spring({frame: frame - at, fps, config: {damping: 14}});
          const x = (n.x - 0.5) * zoom * W + W / 2;
          const y = (n.y - 0.5) * zoom * H + H / 2;
          return frame >= at ? (
            <div key={i}>
              <div style={{position: 'absolute', left: x - 14, top: y - 14, width: 28, height: 28, borderRadius: '50%', border: '4px solid #FFE9A8', transform: `scale(${q})`, boxShadow: '0 0 0 6px rgba(255,233,168,0.25)'}} />
              <div dir="rtl" style={{position: 'absolute', top: y - 26, [n.side === 'right' ? 'left' : 'right']: n.side === 'right' ? x + 28 : W - x + 28, maxWidth: 420, background: '#fff', color: NAVY, fontFamily: AR, fontWeight: 700, fontSize: 28, padding: '8px 16px', borderRadius: 12, opacity: q, transform: `translateX(${(1 - q) * (n.side === 'right' ? -20 : 20)}px)`}}>
                {n.ar}
              </div>
            </div>
          ) : null;
        })}
      </div>
      <div dir="rtl" style={{position: 'absolute', top: 400 + H + 30, left: 60, right: 60, fontFamily: AR, fontWeight: 600, fontSize: 38, lineHeight: 1.55, color: '#fff', textAlign: 'right', opacity: fact, transform: `translateY(${(1 - fact) * 20}px)`}}>
        {p.fact}
      </div>
      <div style={{position: 'absolute', top: 400 + H + 160, right: 60, fontFamily: EN, fontSize: 18, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.5)', opacity: fact}}>{p.sensor}</div>
      <Music src={p.music} volume={0.35} trimBefore={p.trim} />
    </DarkFrame>
  );
};

export const PhotoWeekById: React.FC<{id: string}> = ({id}) => <PhotoWeekView p={PHOTOS[id]} />;
