import '@fontsource/ibm-plex-sans-arabic/400.css';
import '@fontsource/ibm-plex-sans-arabic/500.css';
import '@fontsource/ibm-plex-sans-arabic/600.css';
import '@fontsource/ibm-plex-sans-arabic/700.css';
import '@fontsource/montserrat/400.css';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/800.css';
import {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, staticFile, useVideoConfig} from 'remotion';
import {Background} from './components/Background';
import {SceneFade} from './components/SceneFade';
import {About} from './scenes/About';
import {Geo} from './scenes/Geo';
import {Hook} from './scenes/Hook';
import {LogoIntro} from './scenes/LogoIntro';
import {Outro} from './scenes/Outro';
import {Sectors} from './scenes/Sectors';
import {Services} from './scenes/Services';
import {Vision} from './scenes/Vision';
import {SceneId, Timeline} from './timelines';

const SCENES: Record<SceneId, React.FC<{duration: number}>> = {
  logo: LogoIntro,
  hook: Hook,
  about: About,
  sectors: Sectors,
  geo: Geo,
  services: Services,
  vision: Vision,
  outro: Outro,
};

export const useFonts = () => {
  const [handle] = useState(() => delayRender('Loading fonts'));
  useEffect(() => {
    Promise.all([
      document.fonts.load('400 40px "IBM Plex Sans Arabic"', 'عربي'),
      document.fonts.load('500 40px "IBM Plex Sans Arabic"', 'عربي'),
      document.fonts.load('600 40px "IBM Plex Sans Arabic"', 'عربي'),
      document.fonts.load('700 40px "IBM Plex Sans Arabic"', 'عربي'),
      document.fonts.load('400 40px Montserrat', 'A'),
      document.fonts.load('500 40px Montserrat', 'A'),
      document.fonts.load('600 40px Montserrat', 'A'),
      document.fonts.load('700 40px Montserrat', 'A'),
      document.fonts.load('800 40px Montserrat', 'A'),
    ]).finally(() => continueRender(handle));
  }, [handle]);
};

export const NSGVideo: React.FC<{timeline: Timeline}> = ({timeline}) => {
  useFonts();
  const {durationInFrames} = useVideoConfig();
  return (
    <AbsoluteFill>
      <Background />
      {timeline.map(({id, from, duration}, i) => {
        const Scene = SCENES[id];
        const last = i === timeline.length - 1;
        return (
          <Sequence key={id} from={from} durationInFrames={duration} name={id}>
            <SceneFade duration={duration} fadeIn={i === 0 ? 1 : 14} fadeOut={last ? 1 : 14}>
              <Scene duration={duration} />
            </SceneFade>
          </Sequence>
        );
      })}
      <Audio
        src={staticFile('ambient.mp3')}
        volume={(f) =>
          interpolate(f, [0, 30, durationInFrames - 45, durationInFrames], [0, 0.7, 0.7, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
        }
      />
    </AbsoluteFill>
  );
};
