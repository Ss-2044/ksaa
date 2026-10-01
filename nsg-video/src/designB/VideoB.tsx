import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useVideoConfig} from 'remotion';
import {useFonts} from '../Video';
import {AboutB} from './AboutB';
import {BackgroundB} from './BackgroundB';
import {GeoB} from './GeoB';
import {IntroB} from './IntroB';
import {KineticB} from './KineticB';
import {OutroB} from './OutroB';
import {PillarsB} from './PillarsB';
import {ServicesB} from './ServicesB';
import {SceneBId, TimelineB} from './timelinesB';
import {VisionB} from './VisionB';

const SCENES: Record<SceneBId, React.FC<{duration: number}>> = {
  intro: IntroB,
  kinetic: KineticB,
  about: AboutB,
  pillars: PillarsB,
  geo: GeoB,
  services: ServicesB,
  vision: VisionB,
  outro: OutroB,
};

export const NSGVideoB: React.FC<{timeline: TimelineB; music: string}> = ({timeline, music}) => {
  useFonts();
  const {durationInFrames} = useVideoConfig();
  return (
    <AbsoluteFill>
      <BackgroundB />
      {timeline.map(({id, from, duration}) => {
        const Scene = SCENES[id];
        return (
          <Sequence key={id} from={from} durationInFrames={duration} name={id}>
            <Scene duration={duration} />
          </Sequence>
        );
      })}
      <Audio
        src={staticFile(music)}
        volume={(f) => interpolate(f, [durationInFrames - 10, durationInFrames], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
      />
    </AbsoluteFill>
  );
};
