import React from 'react';
import { Composition } from 'remotion';
import { NeoCapta, DURATION, FPS } from './NeoCapta';
import { Manifesto, MANIFESTO_DURATION } from './Manifesto';
import { Journey, JOURNEY_DURATION } from './Journey';
import { BeforeAfter, BEFORE_AFTER_DURATION } from './BeforeAfter';
import { Brief, BRIEF_DURATION } from './Brief';
import { Sting, STING_DURATION } from './Sting';
import { Countdown, COUNTDOWN_DURATION } from './Countdown';
import { Grid, GRID_DURATION } from './Grid';
import { Carousel, CAROUSEL_DURATION } from './Carousel';
import { Story, STORY_DURATION } from './Story';
import { Scroll, SCROLL_DURATION } from './Scroll';
import { BlankPage, BLANK_PAGE_DURATION } from './BlankPage';

const WIDE = { width: 1920, height: 1080 };
const VERTICAL = { width: 1080, height: 1920 };
const SQUARE = { width: 1080, height: 1080 };

const VIDEOS = [
  { id: 'NeoCapta', component: NeoCapta, duration: DURATION, size: WIDE },
  { id: 'Manifesto', component: Manifesto, duration: MANIFESTO_DURATION, size: WIDE },
  { id: 'Journey', component: Journey, duration: JOURNEY_DURATION, size: WIDE },
  { id: 'BeforeAfter', component: BeforeAfter, duration: BEFORE_AFTER_DURATION, size: VERTICAL },
  { id: 'Brief', component: Brief, duration: BRIEF_DURATION, size: VERTICAL },
  { id: 'Sting', component: Sting, duration: STING_DURATION, size: VERTICAL },
  { id: 'Countdown', component: Countdown, duration: COUNTDOWN_DURATION, size: SQUARE },
  { id: 'Grid', component: Grid, duration: GRID_DURATION, size: SQUARE },
  { id: 'Carousel', component: Carousel, duration: CAROUSEL_DURATION, size: SQUARE },
  { id: 'Story', component: Story, duration: STORY_DURATION, size: WIDE },
  { id: 'StoryVertical', component: Story, duration: STORY_DURATION, size: VERTICAL },
  { id: 'StorySquare', component: Story, duration: STORY_DURATION, size: SQUARE },
  { id: 'Scroll', component: Scroll, duration: SCROLL_DURATION, size: WIDE },
  { id: 'ScrollVertical', component: Scroll, duration: SCROLL_DURATION, size: VERTICAL },
  { id: 'ScrollSquare', component: Scroll, duration: SCROLL_DURATION, size: SQUARE },
  { id: 'BlankPage', component: BlankPage, duration: BLANK_PAGE_DURATION, size: WIDE },
  { id: 'BlankPageVertical', component: BlankPage, duration: BLANK_PAGE_DURATION, size: VERTICAL },
  { id: 'BlankPageSquare', component: BlankPage, duration: BLANK_PAGE_DURATION, size: SQUARE },
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
