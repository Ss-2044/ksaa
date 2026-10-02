import {AbsoluteFill, Audio, Img, interpolate, staticFile, useVideoConfig} from 'remotion';
import {Background} from '../components/Background';
import {fonts} from '../theme';
import {useFonts} from '../Video';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const NAVY = '#16182F';
export const SERIES = '#7C83FF'; // validated single-series chart colour on the navy surface
export const AR = fonts.ar;
export const EN = fonts.en;
export const MAC = 'Music: Kevin MacLeod (incompetech.com) · CC BY 4.0';

export const Music: React.FC<{src: string; volume?: number; trimBefore?: number}> = ({src, volume = 0.3, trimBefore = 0}) => {
  const {fps, durationInFrames} = useVideoConfig();
  return <Audio src={staticFile(src)} trimBefore={Math.round(trimBefore * fps)} volume={(f) => volume * interpolate(f, [0, 10, durationInFrames - 25, durationInFrames], [0, 1, 1, 0], clamp)} />;
};

// Dark LinkedIn frame shared by "photo of the week", "by the numbers" and "common question".
export const DarkFrame: React.FC<{series: string; seriesEn: string; children: React.ReactNode; source: string}> = ({series, seriesEn, children, source}) => {
  useFonts();
  return (
    <AbsoluteFill>
      <Background />
      <div style={{position: 'absolute', top: 60, left: 60, right: 60, display: 'flex', flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', gap: 14}}>
          <div dir="rtl" style={{fontFamily: AR, fontWeight: 800, fontSize: 34, color: NAVY, background: '#fff', padding: '4px 18px', borderRadius: 10}}>
            {series}
          </div>
          <div style={{fontFamily: EN, fontWeight: 600, fontSize: 16, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.6)'}}>{seriesEn}</div>
        </div>
        <Img src={staticFile('nsg-logo.png')} style={{width: 150}} />
      </div>
      {children}
      <div style={{position: 'absolute', bottom: 26, left: 60, right: 60, textAlign: 'center', fontFamily: EN, fontSize: 15, color: 'rgba(255,255,255,0.45)'}}>{source}</div>
    </AbsoluteFill>
  );
};
