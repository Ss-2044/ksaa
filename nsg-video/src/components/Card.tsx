import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, fonts} from '../theme';

export const Card: React.FC<{
  ar: string;
  en: string;
  descAr?: string;
  delay: number;
  icon?: React.ReactNode;
  width?: number;
  minHeight?: number;
}> = ({ar, en, descAr, delay, icon, width = 470, minHeight = 460}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: {damping: 18, mass: 0.8}});
  return (
    <div
      style={{
        width,
        minHeight,
        boxSizing: 'border-box',
        padding: '36px 30px',
        borderRadius: 28,
        border: '1.5px solid rgba(255,255,255,0.22)',
        background: 'linear-gradient(160deg, rgba(255,255,255,0.10), rgba(255,255,255,0.02))',
        boxShadow: '0 30px 80px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
        opacity: Math.min(1, p),
        transform: `translateY(${(1 - p) * 120}px) scale(${0.9 + 0.1 * p})`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      {icon ? <div style={{height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{icon}</div> : null}
      <div dir="rtl" style={{fontFamily: fonts.ar, fontSize: 40, fontWeight: 700, color: colors.white, lineHeight: 1.35}}>
        {ar}
      </div>
      <div style={{fontFamily: fonts.en, fontSize: 22, fontWeight: 600, letterSpacing: '0.08em', color: colors.muted, marginTop: 10, textTransform: 'uppercase'}}>
        {en}
      </div>
      {descAr ? (
        <div dir="rtl" style={{fontFamily: fonts.ar, fontSize: 26, color: colors.muted, marginTop: 16, lineHeight: 1.5}}>
          {descAr}
        </div>
      ) : null}
    </div>
  );
};
