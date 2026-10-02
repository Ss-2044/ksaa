import {Composition} from 'remotion';
import {NSGVideo} from './Video';
import {FPS} from './theme';
import {timeline30, timeline60, totalFrames} from './timelines';
import {NSGVideoB} from './designB/VideoB';
import {Clip, STORIES, StoryId, clipFrames} from './clips/Clip';
import {VerticalClip} from './clips/Vertical';
import {REELS, ReelById, reelFrames} from './reels/reels';
import {EPISODES, EpisodeById, epFrames} from './linkedin/episodes';
import {GLOSS_FRAMES, GlossaryById, TERMS} from './linkedin2/Glossary';
import {PHOTO_FRAMES, PHOTOS, PhotoWeekById} from './linkedin2/PhotoWeek';
import {AltitudeLadder, CHART_FRAMES, LandsatTimeline} from './linkedin2/Charts';
import {QAPlate, QALive, QA_FRAMES} from './linkedin2/QA';
import {CarouselSlide} from './linkedin2/Carousel';
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
      {/* Short story clips — space & geospatial data (20 s each) */}
      {(Object.keys(STORIES) as StoryId[]).map((story) => (
        <Composition
          key={story}
          id={`Clip-${story}`}
          component={Clip}
          durationInFrames={clipFrames(story)}
          fps={FPS}
          width={1920}
          height={1080}
          defaultProps={{story}}
        />
      ))}
      {/* LinkedIn 4:5 educational series «من المدار» */}
      {Object.keys(EPISODES).map((id) => (
        <Composition key={`li-${id}`} id={`LinkedIn-${id}`} component={EpisodeById} durationInFrames={epFrames(id)} fps={FPS} width={1080} height={1350} defaultProps={{id}} />
      ))}
      {/* LinkedIn formats, batch 2 */}
      {Object.keys(TERMS).map((id) => (
        <Composition key={`g-${id}`} id={`Term-${id}`} component={GlossaryById} durationInFrames={GLOSS_FRAMES} fps={FPS} width={1080} height={1350} defaultProps={{id}} />
      ))}
      {Object.keys(PHOTOS).map((id) => (
        <Composition key={`p-${id}`} id={`Photo-${id}`} component={PhotoWeekById} durationInFrames={PHOTO_FRAMES} fps={FPS} width={1080} height={1350} defaultProps={{id}} />
      ))}
      <Composition id="Chart-landsat" component={LandsatTimeline} durationInFrames={CHART_FRAMES} fps={FPS} width={1080} height={1350} />
      <Composition id="Chart-altitudes" component={AltitudeLadder} durationInFrames={CHART_FRAMES} fps={FPS} width={1080} height={1350} />
      <Composition id="QA-plate" component={QAPlate} durationInFrames={QA_FRAMES} fps={FPS} width={1080} height={1350} />
      <Composition id="QA-live" component={QALive} durationInFrames={QA_FRAMES} fps={FPS} width={1080} height={1350} />
      <Composition id="Carousel" component={CarouselSlide} durationInFrames={1} fps={FPS} width={1080} height={1350} defaultProps={{i: 0}} />
      {/* Native 9:16 interactive reels */}
      {Object.keys(REELS).map((id) => (
        <Composition key={`reel-${id}`} id={`Reel-${id}`} component={ReelById} durationInFrames={reelFrames(id)} fps={FPS} width={1080} height={1920} defaultProps={{id}} />
      ))}
      {/* 9:16 versions of every clip */}
      {(Object.keys(STORIES) as StoryId[]).map((story) => (
        <Composition
          key={`v-${story}`}
          id={`Vertical-${story}`}
          component={VerticalClip}
          durationInFrames={clipFrames(story)}
          fps={FPS}
          width={1080}
          height={1920}
          defaultProps={{story}}
        />
      ))}
    </>
  );
};
