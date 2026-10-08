import React from 'react';
import { Composition } from 'remotion';
import { NeoCapta, DURATION, FPS } from './NeoCapta';
import { Manifesto, MANIFESTO_DURATION } from './Manifesto';
import { Journey, JOURNEY_DURATION } from './Journey';
import { BeforeAfter, BEFORE_AFTER_DURATION } from './BeforeAfter';
import { Brief, BRIEF_DURATION } from './Brief';
import { Sting, STING_DURATION } from './Sting';

const WIDE = { width: 1920, height: 1080 };
const VERTICAL = { width: 1080, height: 1920 };

const VIDEOS = [
  { id: 'NeoCapta', component: NeoCapta, duration: DURATION, size: WIDE },
  { id: 'Manifesto', component: Manifesto, duration: MANIFESTO_DURATION, size: WIDE },
  { id: 'Journey', component: Journey, duration: JOURNEY_DURATION, size: WIDE },
  { id: 'BeforeAfter', component: BeforeAfter, duration: BEFORE_AFTER_DURATION, size: VERTICAL },
  { id: 'Brief', component: Brief, duration: BRIEF_DURATION, size: VERTICAL },
  { id: 'Sting', component: Sting, duration: STING_DURATION, size: VERTICAL },
] as const;

export const RemotionRoot: React.FC = () => (
  <>
    {VIDEOS.flatMap(({ id, component, duration, size }) =>
      (['ar', 'en'] as const).map((lang) => (
        <Composition
          key={`${id}-${lang}`}
          id={`${id}-${lang.toUpperCase()}`}
          component={component}
          durationInFrames={duration}
          fps={FPS}
          width={size.width}
          height={size.height}
          defaultProps={{ lang }}
        />
      )),
    )}
  </>
);
