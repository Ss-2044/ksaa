import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Caption} from './Caption';
import {Chip, KenBurns} from './Photo';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const Galileo: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame > 100) return null;
  const op = interpolate(frame, [0, 12, 86, 100], [0, 1, 1, 0], clamp);
  const s = interpolate(frame, [0, 100], [0.8, 1.25]);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: op}}>
      <Img src={staticFile('space/earth-arabia-galileo.jpg')} style={{height: 900, transform: `scale(${s})`, WebkitMaskImage: 'radial-gradient(circle at 50% 50%, #000 52%, transparent 70%)'}} />
    </AbsoluteFill>
  );
};

// A gallery of the peninsula's landscapes, each shot labelled with place + satellite.
export const OrbitArt: React.FC = () => (
  <AbsoluteFill>
    <Galileo />
    <KenBurns src="space/rub-al-khali.jpg" from={88} to={195} zoom={[1.0, 1.12]} pan={[[0, 8], [0, -8]]} grade={0.15} />
    <KenBurns src="space/empty-quarter-sharurah.jpg" from={183} to={292} zoom={[1.25, 1.05]} grade={0.15} />
    <KenBurns src="space/rub-al-khali-iss.jpg" from={280} to={375} zoom={[1.05, 1.2]} pan={[[3, 0], [-3, 0]]} grade={0.15} />
    <KenBurns src="space/sulayyil-pivots.jpg" from={363} to={450} zoom={[1.0, 1.15]} pan={[[0, 0], [2, -2]]} grade={0.15} />
    <Chip ar="الأرض من نصف مليون كم" en="Galileo · 1992" from={0} to={96} corner="tr" />
    <Chip ar="الربع الخالي" en="NASA Terra" from={92} to={192} corner="tr" />
    <Chip ar="شرورة" en="Landsat 7" from={187} to={288} corner="tr" />
    <Chip ar="الربع الخالي" en="ISS · Expedition 27" from={284} to={372} corner="tr" />
    <Chip ar="السليّل" en="NASA EarthKAM" from={367} to={450} corner="tr" />
    <Caption ar="من نصف مليون كيلومتر… تظهر جزيرتنا" en="From half a million km — our peninsula" from={6} to={92} pos="bottom" size={62} />
    <Caption ar="الربع الخالي… أكبر بحر رملي في العالم" en="Rub' al Khali — the largest sand sea on Earth" from={96} to={190} pos="bottom" size={62} />
    <Caption ar="الريح ترسم… والقمر الصناعي يوثّق" en="The wind draws. The satellite records." from={190} to={286} pos="bottom" size={62} />
    <Caption ar="كثبان حمراء… وسبخات رمادية زرقاء" en="Red dunes, blue-grey salt flats" from={288} to={370} pos="bottom" size={62} />
    <Caption ar="وعلى حافة الصحراء… تولد الحياة" en="And at the desert's edge, life begins" from={372} to={450} pos="bottom" size={62} />
  </AbsoluteFill>
);
