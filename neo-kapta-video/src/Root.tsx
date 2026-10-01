import {Composition} from 'remotion';
import {PartnershipVideo} from './PartnershipVideo';
import {FPS, DURATION} from './theme';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="PartnershipVideo"
    component={PartnershipVideo}
    durationInFrames={DURATION}
    fps={FPS}
    width={1920}
    height={1080}
  />
);
