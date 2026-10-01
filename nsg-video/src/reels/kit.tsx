import {AbsoluteFill, Audio, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {Sparkle} from '../components/Sparkle';
import {fonts} from '../theme';
import {PENINSULA, project, peninsulaPath} from '../clips/geo';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const NAVY = '#16182F';
export const LAV = '#9DA2E6';

export const Sfx: React.FC<{at: number; src: 'tick' | 'correct' | 'wrong' | 'whoosh' | 'hit'; volume?: number}> = ({at, src, volume = 1}) => (
  <Sequence from={Math.max(0, Math.round(at))} durationInFrames={45} name={`sfx-${src}`}>
    <Audio src={staticFile(`sfx/${src}.wav`)} volume={volume} />
  </Sequence>
);

// Vertical logo sting: sparkle spins in, white disc bursts, logo pops.
export const ReelIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const spin = spring({frame, fps, config: {damping: 12}});
  const burst = interpolate(frame, [22, 40], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const logo = spring({frame: frame - 30, fps, config: {damping: 10, mass: 0.6}});
  const out = interpolate(frame, [78, 90], [1, 0], clamp);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: out}}>
      <div style={{position: 'absolute', width: 1400 * burst, height: 1400 * burst, borderRadius: '50%', border: `${6 * (1 - burst) + 1}px solid #fff`, opacity: 1 - burst}} />
      <div style={{position: 'absolute', transform: `scale(${spin * (1 - burst * 0.8)}) rotate(${(1 - spin) * 270}deg)`, filter: 'drop-shadow(0 0 30px #fff)'}}>
        <Sparkle size={260} />
      </div>
      <Img src={staticFile('nsg-logo.png')} style={{width: 760, transform: `scale(${logo})`, opacity: Math.min(1, logo * 1.4)}} />
      <Sfx at={0} src="whoosh" />
      <Sfx at={28} src="hit" volume={0.8} />
    </AbsoluteFill>
  );
};

// Series chip + progress bar at the top of the reel.
export const ReelHeader: React.FC<{label: string; en: string; progress: number}> = ({label, en, progress}) => (
  <div style={{position: 'absolute', top: 90, left: 70, right: 70}}>
    <div style={{display: 'flex', flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center'}}>
      <div dir="rtl" style={{background: '#fff', color: NAVY, fontFamily: fonts.ar, fontWeight: 700, fontSize: 36, padding: '8px 26px', borderRadius: 999}}>
        {label}
      </div>
      <Img src={staticFile('nsg-logo.png')} style={{width: 170, opacity: 0.9}} />
    </div>
    <div style={{fontFamily: fonts.en, fontSize: 18, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.6)', textAlign: 'right', marginTop: 10}}>{en}</div>
    <div style={{height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.2)', marginTop: 18, overflow: 'hidden'}}>
      <div style={{width: `${progress * 100}%`, height: '100%', background: '#fff'}} />
    </div>
  </div>
);

// Countdown ring: n seconds starting at `from`, ticking every second.
export const Countdown: React.FC<{from: number; seconds: number; size?: number; style?: React.CSSProperties}> = ({from, seconds, size = 200, style}) => {
  const frame = useCurrentFrame();
  const t = frame - from;
  if (t < 0 || t >= seconds * 30) return null;
  const left = seconds - Math.floor(t / 30);
  const frac = 1 - (t % 30) / 30;
  const r = size / 2 - 10;
  const pop = 1 + 0.15 * Math.exp(-(t % 30) / 4);
  return (
    <div style={{width: size, height: size, position: 'relative', ...style}}>
      <svg width={size} height={size} style={{position: 'absolute'}}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.25)" strokeWidth={10} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#fff" strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - frac} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fonts.en, fontWeight: 800, fontSize: size * 0.42, color: '#fff', transform: `scale(${pop})`}}>{left}</div>
    </div>
  );
};

export const countdownTicks = (from: number, seconds: number) => new Array(seconds).fill(0).map((_, i) => <Sfx key={i} at={from + i * 30} src="tick" volume={0.8} />);

// Small peninsula locator with a pulsing pin.
export const MiniMap: React.FC<{lon: number; lat: number; size?: number}> = ({lon, lat, size = 260}) => {
  const frame = useCurrentFrame();
  const W = size;
  const H = size * 0.82;
  const [x, y] = project(lon, lat, W, H);
  const pulse = (frame % 30) / 30;
  return (
    <svg width={W} height={H} style={{background: 'rgba(255,255,255,0.06)', borderRadius: 24}}>
      <path d={peninsulaPath(W, H)} fill="rgba(255,255,255,0.12)" stroke="#fff" strokeWidth={2} />
      <circle cx={x} cy={y} r={8 + pulse * 22} fill="none" stroke="#fff" strokeWidth={2} opacity={1 - pulse} />
      <circle cx={x} cy={y} r={9} fill="#FFE9A8" />
    </svg>
  );
};
export {PENINSULA};

// End call-to-action.
export const ReelCTA: React.FC<{ar: string; en: string; sub?: string}> = ({ar, en, sub}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame, fps, config: {damping: 12}});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 80, background: 'rgba(13,15,34,0.92)'}}>
      <Img src={staticFile('nsg-logo.png')} style={{width: 520, opacity: p}} />
      <div dir="rtl" style={{fontFamily: fonts.ar, fontWeight: 700, fontSize: 76, color: '#fff', textAlign: 'center', marginTop: 90, lineHeight: 1.35, transform: `scale(${0.8 + 0.2 * p})`, opacity: p}}>
        {ar}
      </div>
      <div style={{fontFamily: fonts.en, fontWeight: 600, fontSize: 28, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.7)', marginTop: 16, textAlign: 'center', textTransform: 'uppercase'}}>{en}</div>
      {sub ? (
        <div dir="rtl" style={{marginTop: 60, background: '#fff', color: NAVY, fontFamily: fonts.ar, fontWeight: 700, fontSize: 40, padding: '14px 40px', borderRadius: 999, opacity: interpolate(frame, [20, 32], [0, 1], clamp)}}>
          {sub}
        </div>
      ) : null}
      <Sfx at={0} src="hit" volume={0.7} />
    </AbsoluteFill>
  );
};
