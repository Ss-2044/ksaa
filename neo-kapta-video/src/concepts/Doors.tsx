// الفكرة 11: «الأبواب النجدية» — باب نجدي ملوّن ينفتح فتعبر الكاميرا إلى مكان في الدرعية،
// ثم باب آخر… وآخر باب ينفتح على ضوء نيو كابتا الأزرق: «باب جديد يُفتح… شراكة استراتيجية»
import React from 'react';
import {AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {DiriyahLogo, NeoLogo} from '../components';
import {COLORS, FONT} from '../theme';
import {DiriyahImage, SLOTS, Slot} from './diriyah';
import {clamp, useFonts} from './shared';

const W = 600; // عرض فتحة الباب
const H = 860;
const WALL = '#a8724f';

// درفة باب نجدي خشبي بنقوش مثلثات ملوّنة ومسامير
const Leaf: React.FC<{side: 'l' | 'r'; finale?: boolean; children?: React.ReactNode}> = ({side, finale, children}) => {
  const w = W / 2;
  const colors = finale ? [COLORS.neoBlue, COLORS.copper, COLORS.sand] : ['#2f6f8f', '#c9452f', '#e8c35a'];
  const bands = [90, 300, 560, 770];
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <svg width={w} height={H}>
        <rect width={w} height={H} fill="#6b3e22" />
        {new Array(8).fill(0).map((_, i) => (
          <rect key={i} x={i * (w / 8)} y={0} width={2} height={H} fill="#4f2c17" opacity={0.6} />
        ))}
        {bands.map((y, b) => (
          <g key={b}>
            <rect x={0} y={y} width={w} height={70} fill="#f1e4cc" />
            {new Array(10).fill(0).map((_, i) => (
              <path
                key={i}
                d={`M${i * (w / 10)} ${y + 66} l${w / 20} -56 l${w / 20} 56 Z`}
                fill={colors[(i + b) % 3]}
              />
            ))}
          </g>
        ))}
        {new Array(6).fill(0).map((_, r) =>
          new Array(3).fill(0).map((__, c) => (
            <circle key={`${r}-${c}`} cx={50 + c * 100} cy={200 + r * 95} r={5} fill="#d9b27a" />
          ))
        )}
        <rect x={side === 'l' ? w - 6 : 0} y={0} width={6} height={H} fill="#3a2010" />
      </svg>
      {children ? (
        <div style={{position: 'absolute', top: 360, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>{children}</div>
      ) : null}
    </div>
  );
};

// جدار طيني حول فتحة الباب
const WallWithDoor: React.FC<{open: number; finale?: boolean; logos?: boolean; behind: React.ReactNode}> = ({open, finale, logos, behind}) => (
  <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
    <div style={{position: 'relative', width: W, height: H, perspective: 1600}}>
      <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>{behind}</div>
      <div style={{position: 'absolute', left: 0, top: 0, width: W / 2, height: H, transformOrigin: 'left center', transform: `rotateY(${-open * 105}deg)`}}>
        <Leaf side="l" finale={finale}>{logos ? <NeoLogo size={200} /> : null}</Leaf>
      </div>
      <div style={{position: 'absolute', right: 0, top: 0, width: W / 2, height: H, transformOrigin: 'right center', transform: `rotateY(${open * 105}deg)`}}>
        <Leaf side="r" finale={finale}>{logos ? <DiriyahLogo size={200} /> : null}</Leaf>
      </div>
      {/* الجدار: ظل ضخم يحيط بالفتحة */}
      <div style={{position: 'absolute', inset: -24, border: '24px solid #8a5a3e', boxShadow: `0 0 0 3000px ${WALL}`, pointerEvents: 'none'}} />
      {/* شرفات مثلثة فوق الباب */}
      <svg width={W + 200} height={60} style={{position: 'absolute', top: -110, left: -100}}>
        {new Array(16).fill(0).map((_, i) => (
          <path key={i} d={`M${i * 50} 56 l25 -46 l25 46 Z`} fill="#8a5a3e" />
        ))}
      </svg>
    </div>
  </AbsoluteFill>
);

type Room = {slot?: Slot; ar: string; en: string};
const ROOMS: Room[] = [
  {slot: 'turaif-sunset', ar: 'خلف كل باب… حكاية', en: 'BEHIND EVERY DOOR, A STORY'},
  {slot: 'bujairi-terrace', ar: 'البجيري… نبض الدرعية', en: 'AL BUJAIRI, THE HEART OF DIRIYAH'},
  {slot: 'wadi-hanifa', ar: 'الدرعية… مستقبل يُبنى', en: 'DIRIYAH, A FUTURE IN THE MAKING'},
  {ar: 'باب جديد يُفتح…', en: 'A NEW DOOR OPENS'},
];
const ROOM_START = 90;
const ROOM_LEN = 180;

const BlueWorld: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 50%, ${COLORS.neoBlueLight}, ${COLORS.neoBlue} 35%, ${COLORS.navy} 75%)`}}>
      <AbsoluteFill
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.6) 2px, transparent 2.5px)',
          backgroundSize: '28px 28px',
          backgroundPosition: `${f}px ${f * 0.5}px`,
          opacity: 0.35,
        }}
      />
    </AbsoluteFill>
  );
};

export const DoorsConcept: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const out = interpolate(f, [880, 900], [1, 0], clamp);

  let scene: React.ReactNode;
  if (f < ROOM_START) {
    // 0–3 ث: الباب مغلق وعليه الشعاران
    const p = spring({frame: f, fps, config: {damping: 15}});
    scene = (
      <AbsoluteFill style={{transform: `scale(${1.15 - p * 0.15})`}}>
        <WallWithDoor open={0} logos behind={null} />
      </AbsoluteFill>
    );
  } else if (f < ROOM_START + ROOMS.length * ROOM_LEN) {
    const idx = Math.floor((f - ROOM_START) / ROOM_LEN);
    const t = f - ROOM_START - idx * ROOM_LEN;
    const room = ROOMS[idx];
    const finale = !room.slot;
    const prev = idx > 0 ? ROOMS[idx - 1] : null;
    const open = interpolate(t, [15, 50], [0, 1], clamp);
    const zoom = interpolate(t, [50, 85], [1, 3.4], clamp);
    const doorFade = interpolate(t, [70, 85], [1, 0], clamp);
    const appear = interpolate(t, [0, 14], [0, 1], clamp); // الباب الجديد يظهر فوق المكان السابق
    const photoZoom = interpolate(t, [50, ROOM_LEN], [1.15, 1.0], clamp);
    const behind = finale ? <BlueWorld /> : <DiriyahImage slot={room.slot!} />;
    const behindDoor = finale ? <BlueWorld /> : <DiriyahImage slot={room.slot!} w={W} h={H} />;
    const capO = interpolate(t, [88, 105, ROOM_LEN - 12, ROOM_LEN], [0, 1, 1, 0], clamp);
    const partner = spring({frame: t - 100, fps, config: {damping: 12}});
    scene = (
      <AbsoluteFill>
        {/* المكان بعد العبور */}
        <AbsoluteFill style={{transform: `scale(${photoZoom})`, opacity: 1 - doorFade}}>{behind}</AbsoluteFill>
        {/* المكان السابق خلف الباب الجديد */}
        {prev?.slot && doorFade > 0 ? (
          <AbsoluteFill style={{opacity: (1 - appear) * doorFade}}>
            <DiriyahImage slot={prev.slot} />
          </AbsoluteFill>
        ) : null}
        {doorFade > 0 ? (
          <AbsoluteFill style={{opacity: doorFade * appear, transform: `scale(${zoom})`}}>
            <WallWithDoor open={open} finale={finale} behind={behindDoor} />
          </AbsoluteFill>
        ) : null}
        <AbsoluteFill style={{background: 'linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.65) 100%)', opacity: 1 - doorFade}} />
        {!finale ? (
          <div style={{position: 'absolute', bottom: 100, right: 120, textAlign: 'right', fontFamily: FONT, opacity: capO}}>
            <div dir="rtl" style={{fontSize: 30, fontWeight: 700, color: COLORS.sand, letterSpacing: 2}}>
              📍 {SLOTS[room.slot!].ar}
            </div>
            <div dir="rtl" style={{fontSize: 96, fontWeight: 900, color: '#fff', textShadow: '0 4px 30px rgba(0,0,0,0.7)'}}>{room.ar}</div>
            <div style={{fontSize: 32, letterSpacing: 8, color: COLORS.sand}}>{room.en}</div>
          </div>
        ) : (
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', fontFamily: FONT, opacity: capO}}>
            <div dir="rtl" style={{fontSize: 70, fontWeight: 700, color: COLORS.sand}}>{room.ar}</div>
            <div dir="rtl" style={{fontSize: 170, fontWeight: 900, color: '#fff', transform: `scale(${partner})`, textShadow: '0 0 60px rgba(255,255,255,0.5)'}}>
              شراكة استراتيجية
            </div>
            <div style={{fontSize: 44, letterSpacing: 14, color: '#fff', opacity: partner}}>STRATEGIC PARTNERSHIP</div>
            <div dir="rtl" style={{fontSize: 40, fontWeight: 700, color: COLORS.sand, marginTop: 20, opacity: partner}}>
              نيو كابتا × شركة الدرعية · تسويق · دعاية · إعلان
            </div>
          </AbsoluteFill>
        )}
      </AbsoluteFill>
    );
  } else {
    // 27–30 ث: الختام — الباب يُغلق على الشعارين من جديد
    const t = f - (ROOM_START + ROOMS.length * ROOM_LEN);
    const close = interpolate(t, [0, 30], [1, 0], clamp);
    const txt = interpolate(t, [30, 50], [0, 1], clamp);
    scene = (
      <AbsoluteFill>
        <AbsoluteFill style={{transform: 'scale(0.82) translateY(-60px)'}}>
          <WallWithDoor open={close} logos finale behind={<BlueWorld />} />
        </AbsoluteFill>
        <div style={{position: 'absolute', bottom: 40, width: '100%', textAlign: 'center', fontFamily: FONT, opacity: txt}}>
          <div style={{fontSize: 56, fontWeight: 900, color: '#fff', textShadow: '0 4px 20px #000'}}>Neo Capta × Diriyah Company</div>
        </div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{background: WALL, opacity: out}}>
      <Audio src={staticFile('music-doors.wav')} />
      {scene}
    </AbsoluteFill>
  );
};
