import React from 'react';
import { Composition } from 'remotion';
import { NeoCapta, DURATION, FPS } from './NeoCapta';
import { Manifesto, MANIFESTO_DURATION } from './Manifesto';
import { Journey, JOURNEY_DURATION } from './Journey';

const VIDEOS = [
  { id: 'NeoCapta', component: NeoCapta, duration: DURATION },
  { id: 'Manifesto', component: Manifesto, duration: MANIFESTO_DURATION },
  { id: 'Journey', component: Journey, duration: JOURNEY_DURATION },
] as const;

export const RemotionRoot: React.FC = () => (
  <>
    {VIDEOS.flatMap(({ id, component, duration }) =>
      (['ar', 'en'] as const).map((lang) => (
        <Composition
          key={`${id}-${lang}`}
          id={`${id}-${lang.toUpperCase()}`}
          component={component}
          durationInFrames={duration}
          fps={FPS}
          width={1920}
          height={1080}
          defaultProps={{ lang }}
        />
      )),
    )}
  </>
);
