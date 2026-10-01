import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {Background} from '../components/Background';
import {LogoIntro} from '../scenes/LogoIntro';
import {useFonts} from '../Video';
import {BackgroundB} from '../designB/BackgroundB';
import {IntroB} from '../designB/IntroB';
import {DataLayers} from './DataLayers';
import {EndCard} from './EndCard';
import {OrbitCoverage} from './OrbitCoverage';
import {PixelJourney} from './PixelJourney';
import {ZoomDescent} from './ZoomDescent';

export const CLIP_FRAMES = 600; // 20 s: 3 s logo + 15 s story + 2 s end card
const INTRO = 90;
const END = 60;

const STORIES = {
  pixel: {Body: PixelJourney, intro: 'A', bg: 'A', endAr: 'كل بكسل… يحكي قصة', endEn: 'Every pixel tells a story'},
  zoom: {Body: ZoomDescent, intro: 'B', bg: 'A', endAr: 'نرى الأرض كما لم تُرَ من قبل', endEn: 'See Earth like never before'},
  orbit: {Body: OrbitCoverage, intro: 'A', bg: 'B', endAr: 'عينٌ لا تنام… في المدار', endEn: 'An eye in orbit that never sleeps'},
  layers: {Body: DataLayers, intro: 'B', bg: 'B', endAr: 'البيانات الجيومكانية… أساس كل قرار', endEn: 'Geospatial data powers every decision'},
} as const;

export type StoryId = keyof typeof STORIES;

export const Clip: React.FC<{story: StoryId}> = ({story}) => {
  useFonts();
  const s = STORIES[story];
  const Intro = s.intro === 'A' ? LogoIntro : IntroB;
  return (
    <AbsoluteFill>
      {s.bg === 'A' ? <Background /> : <BackgroundB />}
      <Sequence durationInFrames={INTRO} name="logo">
        <Intro duration={INTRO} />
      </Sequence>
      <Sequence from={INTRO} durationInFrames={CLIP_FRAMES - INTRO - END} name="story">
        <s.Body />
      </Sequence>
      <Sequence from={CLIP_FRAMES - END} durationInFrames={END} name="end">
        <EndCard ar={s.endAr} en={s.endEn} />
      </Sequence>
      <Audio src={staticFile(`music-clip-${story}.mp3`)} />
    </AbsoluteFill>
  );
};
