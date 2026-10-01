import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {fonts} from '../theme';
import {BAR} from './Cine';

export const EndCardD: React.FC<{ar: string; en: string; credit?: string}> = ({ar, en, credit}) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [0, 16], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: '#000', alignItems: 'center', justifyContent: 'center', opacity: op}}>
      <Img src={staticFile('nsg-logo.png')} style={{width: 420}} />
      <div style={{width: 1, height: 70, background: 'rgba(255,255,255,0.5)', margin: '30px 0'}} />
      <div dir="rtl" style={{fontFamily: fonts.ar, fontWeight: 500, fontSize: 50, color: '#fff'}}>
        {ar}
      </div>
      <div style={{fontFamily: fonts.en, fontWeight: 400, fontSize: 17, letterSpacing: '0.55em', color: 'rgba(255,255,255,0.7)', marginTop: 12, textTransform: 'uppercase'}}>{en}</div>
      {credit ? <div style={{position: 'absolute', bottom: BAR / 2 - 8, left: 0, right: 0, textAlign: 'center', fontFamily: fonts.en, fontSize: 14, color: 'rgba(255,255,255,0.45)'}}>{credit}</div> : null}
    </AbsoluteFill>
  );
};
