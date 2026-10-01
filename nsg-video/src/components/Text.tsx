import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, fonts} from '../theme';

const useReveal = (delay: number) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping: 200, mass: 0.8}});
};

// Arabic is animated word by word (never letter by letter, which would break the joining).
export const ArabicText: React.FC<{
  text: string;
  delay?: number;
  size?: number;
  weight?: number;
  color?: string;
  stagger?: number;
}> = ({text, delay = 0, size = 72, weight = 700, color = colors.white, stagger = 4}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const words = text.split(' ');
  return (
    <div
      dir="rtl"
      style={{
        fontFamily: fonts.ar,
        fontSize: size,
        fontWeight: weight,
        color,
        lineHeight: 1.45,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: `0 ${size * 0.28}px`,
      }}
    >
      {words.map((w, i) => {
        const p = spring({frame: frame - delay - i * stagger, fps, config: {damping: 200, mass: 0.7}});
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity: p,
              transform: `translateY(${(1 - p) * 40}px)`,
              filter: `blur(${(1 - p) * 8}px)`,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

export const EnglishText: React.FC<{
  text: string;
  delay?: number;
  size?: number;
  weight?: number;
  color?: string;
  uppercase?: boolean;
}> = ({text, delay = 0, size = 34, weight = 500, color = colors.muted, uppercase = true}) => {
  const p = useReveal(delay);
  const spacing = interpolate(p, [0, 1], [0.6, uppercase ? 0.18 : 0.02]);
  return (
    <div
      style={{
        fontFamily: fonts.en,
        fontSize: size,
        fontWeight: weight,
        color,
        textAlign: 'center',
        letterSpacing: `${spacing}em`,
        textTransform: uppercase ? 'uppercase' : 'none',
        opacity: p,
        transform: `translateY(${(1 - p) * 20}px)`,
      }}
    >
      {text}
    </div>
  );
};

export const Divider: React.FC<{delay?: number; width?: number}> = ({delay = 0, width = 260}) => {
  const p = useReveal(delay);
  return (
    <div
      style={{
        width: width * p,
        height: 2,
        margin: '22px auto',
        background: `linear-gradient(90deg, transparent, ${colors.white}, transparent)`,
        opacity: 0.7,
      }}
    />
  );
};
