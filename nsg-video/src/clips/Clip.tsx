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
import {CloudShadow} from './CloudShadow';
import {Coastline} from './Coastline';
import {PixelCounter} from './PixelCounter';
import {RiyadhGrows} from './RiyadhGrows';
import {RoadOfLight} from './RoadOfLight';

const INTRO = 90;
const MAC = 'Music: Kevin MacLeod (incompetech.com) · Licensed under CC BY 4.0';

type Story = {
  Body: React.FC;
  titleAr: string; // used by the 9:16 version header
  titleEn: string;
  volume?: number;
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
  pixel: {titleAr: 'رحلة بكسل',
    titleEn: "Journey of a pixel",
    Body: PixelJourney, intro: 'A', bg: 'A', endAr: 'كل بكسل… يحكي قصة', endEn: 'Every pixel tells a story', music: 'music-clip-pixel.mp3'},
  zoom: {titleAr: 'من 36,000 كم إلى نصف متر',
    titleEn: "From 36,000 km to 0.5 m",
    Body: ZoomDescent, intro: 'B', bg: 'A', endAr: 'نرى الأرض كما لم تُرَ من قبل', endEn: 'See Earth like never before', music: 'music-clip-zoom.mp3'},
  orbit: {titleAr: '90 دقيقة',
    titleEn: "90 minutes",
    Body: OrbitCoverage, intro: 'A', bg: 'B', endAr: 'عينٌ لا تنام… في المدار', endEn: 'An eye in orbit that never sleeps', music: 'music-clip-orbit.mp3'},
  // story ends on beat 28 of "Tech Talk", so the end card lands on a downbeat
  layers: {
    titleAr: 'طبقات',
    titleEn: "Layers",
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
    titleAr: 'ذاكرة الأرض',
    titleEn: "Earth's memory",
    Body: EarthMemory,
    intro: 'A',
    bg: 'A',
    endAr: 'صورة اليوم… سجلّ الغد',
    endEn: "Today's image is tomorrow's record",
    music: 'music/inspired.mp3',
    credit: `Imagery: NASA/JPL (Terra ASTER, Landsat) · ${MAC} — "Inspired"`,
  },
  night: {
    titleAr: 'مدن من نور',
    titleEn: "Cities of light",
    Body: CitiesOfLight,
    intro: 'B',
    bg: 'A',
    endAr: 'نقرأ المدن… من الفضاء',
    endEn: 'Reading cities from space',
    music: 'music/floating-cities.mp3',
    credit: `Imagery: NASA ISS crew photography · Map data © OpenStreetMap contributors · ${MAC} — "Floating Cities"`,
  },
  art: {
    titleAr: 'لوحات من المدار',
    titleEn: "Art from orbit",
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
    titleAr: 'من المدار إلى الشارع',
    titleEn: "From orbit to street",
    Body: ImageToMap,
    intro: 'B',
    bg: 'B',
    endAr: 'من المدار… إلى الشارع',
    endEn: 'From orbit to street',
    music: 'music/rising-game.mp3',
    credit: `Imagery: NASA ISS crew photography · Map data © OpenStreetMap contributors · ${MAC} — "Rising Game"`,
  },
  riyadh: {
    titleAr: 'الرياض تكبر',
    titleEn: 'Riyadh grows',
    Body: RiyadhGrows,
    intro: 'B',
    bg: 'A',
    endAr: 'الصورة الفضائية… شاهدٌ على النمو',
    endEn: 'Satellite imagery bears witness to growth',
    music: 'music/movement-proposition.mp3',
    volume: 0.8,
    credit: `Imagery: NASA/JPL PIA11087 (Landsat MSS 1972, Landsat TM 1990, ASTER 2000) · ${MAC} — "Movement Proposition"`,
  },
  pixels: {
    titleAr: 'عدّاد البكسلات',
    titleEn: 'The pixel counter',
    Body: PixelCounter,
    intro: 'A',
    bg: 'B',
    endAr: 'كل بكسل… معلومة',
    endEn: 'Every pixel is information',
    music: 'music/digital-lemonade.mp3',
    credit: `Figures computed from an area of ≈2.15 million km² · Imagery: NASA ISS crew photography · ${MAC} — "Digital Lemonade"`,
  },
  cloud: {
    titleAr: 'ظلّ الغيمة',
    titleEn: "A cloud's shadow",
    Body: CloudShadow,
    intro: 'A',
    bg: 'A',
    endAr: 'في الصورة الفضائية… لا شيء بلا معنى',
    endEn: 'In a satellite image, nothing is without meaning',
    music: 'music/dreams-become-real.mp3',
    trimBefore: 41,
    credit: `Imagery: USGS/NASA Landsat 7 · ${MAC} — "Dreams Become Real"`,
  },
  coast: {
    titleAr: 'خط الساحل',
    titleEn: 'The coastline',
    Body: Coastline,
    intro: 'B',
    bg: 'A',
    endAr: 'ساحلٌ من ألوان… يُقرأ من الفضاء',
    endEn: 'A coast of colour, read from space',
    music: 'music/spacial-harvest.mp3',
    trimBefore: 2,
    credit: `Imagery: NASA (Apollo 17, ISS crew photography) · ${MAC} — "Spacial Harvest"`,
  },
  road: {
    titleAr: 'طريق من الضوء',
    titleEn: 'A road of light',
    Body: RoadOfLight,
    intro: 'A',
    bg: 'A',
    endAr: 'كل طريق… خطٌّ من نور على الخريطة',
    endEn: 'Every road is a line of light on the map',
    music: 'music/equatorial-complex.mp3',
    credit: `Imagery: NASA ISS crew photography · Route is illustrative · ${MAC} — "Equatorial Complex"`,
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
        volume={(f) => (s.volume ?? 1) * interpolate(f, [0, 8, durationInFrames - 30, durationInFrames], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
      />
    </AbsoluteFill>
  );
};
