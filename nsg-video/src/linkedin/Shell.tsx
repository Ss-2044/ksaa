import {AbsoluteFill, Audio, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background} from '../components/Background';
import {fonts} from '../theme';
import {useFonts} from '../Video';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const NAVY = '#16182F';
export const W = 1080;
export const H = 1350;
export const HOOK = 105;
export const BEAT = 165;
export const OUTRO = 105;

export type Beat = {kicker: string; title: string; body: string; Visual: React.FC};
export type Episode = {
  n: string;
  hook: string;
  hookEn: string;
  HookVisual: React.FC;
  beats: Beat[];
  takeaway: string;
  music: string;
  volume?: number;
  trimBefore?: number;
  source: string;
};

export const episodeFrames = (e: Episode) => HOOK + e.beats.length * BEAT + OUTRO;

// Visual stage: the central 960×620 box every beat draws into.
export const Stage: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{position: 'absolute', top: 420, left: 60, width: 960, height: 620, borderRadius: 36, overflow: 'hidden', background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.18)'}}>{children}</div>
);

const Header: React.FC<{n: string; idx: number; total: number}> = ({n, idx, total}) => (
  <div style={{position: 'absolute', top: 60, left: 60, right: 60, display: 'flex', flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center'}}>
    <div style={{display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', gap: 16}}>
      <div dir="rtl" style={{fontFamily: fonts.ar, fontWeight: 700, fontSize: 34, color: '#fff'}}>
        من المدار
      </div>
      <div style={{fontFamily: fonts.en, fontWeight: 700, fontSize: 18, letterSpacing: '0.25em', color: NAVY, background: '#fff', padding: '6px 14px', borderRadius: 8}}>EP {n}</div>
    </div>
    <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
      <Img src={staticFile('nsg-logo.png')} style={{width: 150}} />
    </div>
    <div style={{position: 'absolute', top: 70, right: 0, display: 'flex', flexDirection: 'row-reverse', gap: 8}}>
      {new Array(total).fill(0).map((_, i) => (
        <div key={i} style={{width: i === idx ? 40 : 12, height: 12, borderRadius: 6, background: i <= idx ? '#fff' : 'rgba(255,255,255,0.25)'}} />
      ))}
    </div>
  </div>
);

const BeatView: React.FC<{b: Beat; dur: number}> = ({b, dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame, fps, config: {damping: 200}});
  const out = interpolate(frame, [dur - 10, dur], [1, 0], clamp);
  const body = interpolate(frame, [18, 32], [0, 1], clamp);
  return (
    <AbsoluteFill style={{opacity: out}}>
      <div style={{position: 'absolute', top: 190, left: 60, right: 60, textAlign: 'right', opacity: p, transform: `translateY(${(1 - p) * 20}px)`}}>
        <div dir="rtl" style={{fontFamily: fonts.ar, fontWeight: 600, fontSize: 30, color: 'rgba(255,255,255,0.65)'}}>
          {b.kicker}
        </div>
        <div dir="rtl" style={{fontFamily: fonts.ar, fontWeight: 800, fontSize: 64, color: '#fff', lineHeight: 1.25}}>
          {b.title}
        </div>
      </div>
      <Stage>
        <b.Visual />
      </Stage>
      <div dir="rtl" style={{position: 'absolute', top: 1080, left: 60, right: 60, fontFamily: fonts.ar, fontWeight: 500, fontSize: 42, lineHeight: 1.55, color: '#fff', textAlign: 'right', opacity: body, transform: `translateY(${(1 - body) * 16}px)`}}>
        {b.body}
      </div>
    </AbsoluteFill>
  );
};

const HookView: React.FC<{e: Episode}> = ({e}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - 2, fps, config: {damping: 14}});
  const out = interpolate(frame, [HOOK - 10, HOOK], [1, 0], clamp);
  return (
    <AbsoluteFill style={{opacity: out}}>
      <Stage>
        <e.HookVisual />
      </Stage>
      <div style={{position: 'absolute', top: 1070, left: 60, right: 60, textAlign: 'right', transform: `scale(${0.92 + 0.08 * p})`, opacity: p, transformOrigin: 'right center'}}>
        <div dir="rtl" style={{fontFamily: fonts.ar, fontWeight: 800, fontSize: 66, color: '#fff', lineHeight: 1.3}}>
          {e.hook}
        </div>
        <div style={{fontFamily: fonts.en, fontWeight: 600, fontSize: 22, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.65)', marginTop: 8, textTransform: 'uppercase'}}>{e.hookEn}</div>
      </div>
    </AbsoluteFill>
  );
};

const OutroView: React.FC<{e: Episode}> = ({e}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame, fps, config: {damping: 200}});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 80, background: 'rgba(13,15,34,0.6)'}}>
      <div style={{fontFamily: fonts.en, fontWeight: 700, fontSize: 22, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.6)'}}>KEY TAKEAWAY · الخلاصة</div>
      <div dir="rtl" style={{fontFamily: fonts.ar, fontWeight: 800, fontSize: 64, color: '#fff', textAlign: 'center', lineHeight: 1.4, marginTop: 24, opacity: p, transform: `translateY(${(1 - p) * 20}px)`}}>
        {e.takeaway}
      </div>
      <div style={{width: 140, height: 3, background: '#fff', margin: '60px 0'}} />
      <Img src={staticFile('nsg-logo.png')} style={{width: 360, opacity: p}} />
      <div dir="rtl" style={{fontFamily: fonts.ar, fontSize: 32, color: 'rgba(255,255,255,0.8)', marginTop: 40}}>
        تابعونا لحلقات «من المدار»
      </div>
      <div style={{position: 'absolute', bottom: 40, left: 60, right: 60, textAlign: 'center', fontFamily: fonts.en, fontSize: 16, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5}}>{e.source}</div>
    </AbsoluteFill>
  );
};

export const EpisodeShell: React.FC<{e: Episode}> = ({e}) => {
  useFonts();
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const idx = frame < HOOK ? 0 : Math.min(e.beats.length + 1, 1 + Math.floor((frame - HOOK) / BEAT));
  return (
    <AbsoluteFill>
      <Background />
      <Sequence durationInFrames={HOOK} name="hook">
        <HookView e={e} />
      </Sequence>
      {e.beats.map((b, i) => (
        <Sequence key={i} from={HOOK + i * BEAT} durationInFrames={BEAT} name={`beat-${i + 1}`}>
          <BeatView b={b} dur={BEAT} />
        </Sequence>
      ))}
      <Sequence from={HOOK + e.beats.length * BEAT} name="outro">
        <OutroView e={e} />
      </Sequence>
      <Header n={e.n} idx={idx} total={e.beats.length + 2} />
      <Audio
        src={staticFile(e.music)}
        trimBefore={Math.round((e.trimBefore ?? 0) * fps)}
        volume={(f) => (e.volume ?? 0.4) * interpolate(f, [0, 10, durationInFrames - 30, durationInFrames], [0, 1, 1, 0], clamp)}
      />
    </AbsoluteFill>
  );
};
