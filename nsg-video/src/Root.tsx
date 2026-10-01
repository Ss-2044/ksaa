import {Composition} from 'remotion';
import {NSGVideo} from './Video';
import {FPS} from './theme';
import {timeline30, timeline60, totalFrames} from './timelines';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="NSG30"
        component={NSGVideo}
        durationInFrames={totalFrames(timeline30)}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{timeline: timeline30}}
      />
      <Composition
        id="NSG60"
        component={NSGVideo}
        durationInFrames={totalFrames(timeline60)}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{timeline: timeline60}}
      />
    </>
  );
};
