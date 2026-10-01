import {Composition} from 'remotion';
import {NSGVideo} from './Video';
import {FPS} from './theme';
import {timeline30, timeline60, totalFrames} from './timelines';
import {NSGVideoB} from './designB/VideoB';
import {timelineB30, timelineB60, totalB} from './designB/timelinesB';

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
      {/* Design B — kinetic / editorial, beat-synced to original music */}
      <Composition
        id="NSG30B"
        component={NSGVideoB}
        durationInFrames={totalB(timelineB30)}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{timeline: timelineB30, music: 'music-b-30.mp3'}}
      />
      <Composition
        id="NSG60B"
        component={NSGVideoB}
        durationInFrames={totalB(timelineB60)}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{timeline: timelineB60, music: 'music-b-60.mp3'}}
      />
    </>
  );
};
