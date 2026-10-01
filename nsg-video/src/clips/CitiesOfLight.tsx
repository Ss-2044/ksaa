import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Caption} from './Caption';
import {Chip, KenBurns} from './Photo';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Night lights from the ISS, then the same city as map data.
const LightsToMap: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < 285) return null;
  const op = interpolate(frame, [285, 300], [0, 1], clamp);
  const r = interpolate(frame, [300, 400], [0, 140], clamp);
  const photo = interpolate(frame, [300, 400], [1, 0.35], clamp);
  return (
    <AbsoluteFill style={{opacity: op}}>
      <Img src={staticFile('space/riyadh-night.jpg')} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: photo, transform: `scale(${interpolate(frame, [285, 450], [1.15, 1.3])})`}} />
      <AbsoluteFill style={{background: 'rgba(22,24,47,0.35)'}} />
      <Img
        src={staticFile('maps/riyadh-lines-z13.png')}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${interpolate(frame, [285, 450], [1.05, 1.2])})`,
          WebkitMaskImage: `radial-gradient(circle at 50% 50%, #000 ${r * 0.7}%, transparent ${r}%)`,
          filter: 'drop-shadow(0 0 6px rgba(157,162,230,0.8))',
        }}
      />
    </AbsoluteFill>
  );
};

export const CitiesOfLight: React.FC = () => (
  <AbsoluteFill style={{background: '#05060F'}}>
    <KenBurns src="space/riyadh-night.jpg" from={0} to={165} zoom={[1.0, 1.18]} pan={[[2, 0], [-2, 1]]} grade={0.05} />
    <KenBurns src="space/sw-saudi-night.jpg" from={150} to={300} zoom={[1.1, 1.0]} pan={[[-3, 0], [3, 0]]} grade={0.05} />
    <LightsToMap />
    <Chip ar="الرياض ليلاً" en="ISS · Expedition 33" from={0} to={160} corner="tr" />
    <Chip ar="جنوب غرب المملكة ليلاً" en="ISS · Expedition 36" from={155} to={295} corner="tr" />
    <Chip ar="بيانات الخريطة" en="© OpenStreetMap contributors" from={300} to={450} corner="tr" />
    <Caption ar="حين يحلّ الليل… تتكلم الأضواء" en="When night falls, the lights speak" from={6} to={150} pos="bottom" size={72} />
    <Caption ar="جدة · مكة · الطائف… من محطة الفضاء الدولية" en="Jeddah · Makkah · Taif — from the ISS" from={160} to={292} pos="bottom" size={58} />
    <Caption ar="وكل ضوء… نقطة على الخريطة" en="And every light is a point on the map" from={305} to={450} pos="bottom" size={66} />
  </AbsoluteFill>
);
