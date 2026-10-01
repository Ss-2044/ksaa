import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useVideoConfig} from 'remotion';
import {Background} from '../components/Background';
import {LogoIntro} from '../scenes/LogoIntro';
import {useFonts} from '../Video';
import {BackgroundB} from '../designB/BackgroundB';
import {IntroB} from '../designB/IntroB';
import {CitiesOfLight} from './CitiesOfLight';
import {DataLayers, TT_BEAT} from './DataLayers';
import {EarthMemory} from './EarthMemory';
import {EndCard} from './EndCard';
import {ImageToMap} from './ImageToMap';
import {OrbitArt} from './OrbitArt';
import {OrbitCoverage} from './OrbitCoverage';
import {PixelJourney} from './PixelJourney';
import {ZoomDescent} from './ZoomDescent';

const INTRO = 90;
const MAC = 'Music: Kevin MacLeod (incompetech.com) · Licensed under CC BY 4.0';

type Story = {
  Body: React.FC;
  intro: 'A' | 'B';
  bg: 'A' | 'B';
  endAr: string;
  endEn: string;
  story?: number; // story frames (default 450)
  end?: number; // end-card frames (default 60)
  music: string;
  trimBefore?: number; // seconds skipped at the start of the track
  credit?: string;
};

export const STORIES = {
  pixel: {Body: PixelJourney, intro: 'A', bg: 'A', endAr: 'كل بكسل… يحكي قصة', endEn: 'Every pixel tells a story', music: 'music-clip-pixel.mp3'},
  zoom: {Body: ZoomDescent, intro: 'B', bg: 'A', endAr: 'نرى الأرض كما لم تُرَ من قبل', endEn: 'See Earth like never before', music: 'music-clip-zoom.mp3'},
  orbit: {Body: OrbitCoverage, intro: 'A', bg: 'B', endAr: 'عينٌ لا تنام… في المدار', endEn: 'An eye in orbit that never sleeps', music: 'music-clip-orbit.mp3'},
  // story ends on beat 28 of "Tech Talk", so the end card lands on a downbeat
  layers: {
    Body: DataLayers,
    intro: 'B',
    bg: 'B',
    endAr: 'البيانات الجيومكانية… أساس كل قرار',
    endEn: 'Geospatial data powers every decision',
    story: Math.round(28 * TT_BEAT),
    end: Math.round(4 * TT_BEAT),
    music: 'music/tech-talk.mp3',
    trimBefore: 17.17 - 3, // the track's drop (17.17 s) lands as the logo ends
    credit: `Map layers are illustrative · ${MAC} — "Tech Talk"`,
  },
  memory: {
    Body: EarthMemory,
    intro: 'A',
    bg: 'A',
    endAr: 'صورة اليوم… سجلّ الغد',
    endEn: "Today's image is tomorrow's record",
    music: 'music/inspired.mp3',
    credit: `Imagery: NASA/JPL (Terra ASTER, Landsat) · ${MAC} — "Inspired"`,
  },
  night: {
    Body: CitiesOfLight,
    intro: 'B',
    bg: 'A',
    endAr: 'نقرأ المدن… من الفضاء',
    endEn: 'Reading cities from space',
    music: 'music/floating-cities.mp3',
    credit: `Imagery: NASA ISS crew photography · Map data © OpenStreetMap contributors · ${MAC} — "Floating Cities"`,
  },
  art: {
    Body: OrbitArt,
    intro: 'A',
    bg: 'A',
    endAr: 'الأرض… أجمل من الأعلى',
    endEn: 'Earth looks best from above',
    music: 'music/lightless-dawn.mp3',
    trimBefore: 2,
    credit: `Imagery: NASA (Galileo, Terra, Landsat 7, ISS, EarthKAM) · ${MAC} — "Lightless Dawn"`,
  },
  map: {
    Body: ImageToMap,
    intro: 'B',
    bg: 'B',
    endAr: 'من المدار… إلى الشارع',
    endEn: 'From orbit to street',
    music: 'music/rising-game.mp3',
    credit: `Imagery: NASA ISS crew photography · Map data © OpenStreetMap contributors · ${MAC} — "Rising Game"`,
  },
} satisfies Record<string, Story>;

export type StoryId = keyof typeof STORIES;

export const clipFrames = (id: StoryId) => {
  const s: Story = STORIES[id];
  return INTRO + (s.story ?? 450) + (s.end ?? 60);
};

export const Clip: React.FC<{story: StoryId}> = ({story}) => {
  useFonts();
  const {fps, durationInFrames} = useVideoConfig();
  const s: Story = STORIES[story];
  const body = s.story ?? 450;
  const Intro = s.intro === 'A' ? LogoIntro : IntroB;
  return (
    <AbsoluteFill>
      {s.bg === 'A' ? <Background /> : <BackgroundB />}
      <Sequence durationInFrames={INTRO} name="logo">
        <Intro duration={INTRO} />
      </Sequence>
      <Sequence from={INTRO} durationInFrames={body} name="story">
        <s.Body />
      </Sequence>
      <Sequence from={INTRO + body} name="end">
        <EndCard ar={s.endAr} en={s.endEn} credit={s.credit} />
      </Sequence>
      <Audio
        src={staticFile(s.music)}
        trimBefore={Math.round((s.trimBefore ?? 0) * fps)}
        volume={(f) => interpolate(f, [0, 8, durationInFrames - 30, durationInFrames], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
      />
    </AbsoluteFill>
  );
};
