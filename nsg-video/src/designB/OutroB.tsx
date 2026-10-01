import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fonts} from '../theme';

// Final impact: logo slams in on the downbeat, rings ripple, the chord rings out.
export const OutroB: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame, fps, config: {damping: 12, mass: 0.6}});
  const flash = interpolate(frame, [0, 2, 16], [0.9, 0.9, 0], {extrapolateRight: 'clamp'});
  const tag = spring({frame: frame - 20, fps, config: {damping: 200}});
  const fade = interpolate(frame, [duration - 18, duration], [1, 0], {extrapolateLeft: 'clamp'});
  const words = ['نربط', 'نرصد', 'نرشد'];
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', background: '#0D0F22', opacity: fade}}>
      {[0, 1, 2, 3].map((i) => {
        const r = ((frame * 6 + i * 220) % 900) + 200;
        return (
          <div
            key={i}
            style={{position: 'absolute', width: r * 2, height: r * 2, borderRadius: '50%', border: '1.5px solid #fff', opacity: 0.25 * (1 - (r - 200) / 900)}}
          />
        );
      })}
      <Img src={staticFile('nsg-logo.png')} style={{width: 640, transform: `scale(${0.6 + 0.4 * p})`, opacity: Math.min(1, p * 1.5)}} />
      <div dir="rtl" style={{display: 'flex', gap: 40, marginTop: 50, opacity: tag, transform: `translateY(${(1 - tag) * 20}px)`}}>
        {words.map((w, i) => (
          <div key={w} style={{fontFamily: fonts.ar, fontWeight: 700, fontSize: 56, color: '#fff', padding: '4px 26px', borderInlineStart: i ? '2px solid rgba(255,255,255,0.4)' : undefined}}>
            {w}
          </div>
        ))}
      </div>
      <div style={{fontFamily: fonts.en, fontWeight: 600, fontSize: 24, letterSpacing: '0.4em', color: 'rgba(255,255,255,0.7)', marginTop: 16, opacity: tag}}>
        CONNECT · OBSERVE · NAVIGATE
      </div>
      <AbsoluteFill style={{background: '#fff', opacity: flash}} />
    </AbsoluteFill>
  );
};
