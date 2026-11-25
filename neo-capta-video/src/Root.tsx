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
import { Editorial, EDITORIAL_DURATION } from './Editorial';
import { Rush, RUSH_DURATION } from './Rush';
import { Pitch, PITCH_DURATION } from './Pitch';
import { FirstStory, FIRST_STORY_DURATION } from './FirstStory';
import { MahdOpening, MAHD_OPENING_DURATION } from './MahdOpening';
import { MahdCampaign, MAHD_CAMPAIGN_DURATION } from './MahdCampaign';
import { MahdCountdown, MahdToday, MAHD_TEASER_DURATION } from './MahdTeasers';
import { MahdCase, MAHD_CASE_DURATION } from './MahdCase';
import { AdBreakdown, BA_DURATION, BeforeAfterTpl, BREAKDOWN_DURATION, PITCH_TPL_DURATION, PitchTemplate, Tip, TIP_DURATION } from './Templates';
import tip1 from '../templates/tip-1.json';
import baMahd from '../templates/before-after-mahd.json';
import breakdownMahd from '../templates/breakdown-mahd.json';
import pitchMahd from '../templates/pitch-mahd.json';

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
  { id: 'Editorial', component: Editorial, duration: EDITORIAL_DURATION, size: WIDE },
  { id: 'EditorialVertical', component: Editorial, duration: EDITORIAL_DURATION, size: VERTICAL },
  { id: 'EditorialSquare', component: Editorial, duration: EDITORIAL_DURATION, size: SQUARE },
  { id: 'Rush', component: Rush, duration: RUSH_DURATION, size: WIDE },
  { id: 'RushVertical', component: Rush, duration: RUSH_DURATION, size: VERTICAL },
  { id: 'RushSquare', component: Rush, duration: RUSH_DURATION, size: SQUARE },
  // Client videos — Arabic only.
  { id: 'Pitch', component: Pitch, duration: PITCH_DURATION, size: WIDE, langs: ['ar'] },
  { id: 'PitchVertical', component: Pitch, duration: PITCH_DURATION, size: VERTICAL, langs: ['ar'] },
  { id: 'FirstStory', component: FirstStory, duration: FIRST_STORY_DURATION, size: WIDE, langs: ['ar'] },
  { id: 'FirstStoryVertical', component: FirstStory, duration: FIRST_STORY_DURATION, size: VERTICAL, langs: ['ar'] },
  // Mahd («محض») opening campaign.
  { id: 'MahdOpening', component: MahdOpening, duration: MAHD_OPENING_DURATION, size: VERTICAL, langs: ['ar'] },
  { id: 'MahdCampaign', component: MahdCampaign, duration: MAHD_CAMPAIGN_DURATION, size: VERTICAL, langs: ['ar'] },
  { id: 'MahdTeaser3', component: MahdCountdown, duration: MAHD_TEASER_DURATION, size: VERTICAL, langs: ['ar'], props: { days: 3 } },
  { id: 'MahdTeaser2', component: MahdCountdown, duration: MAHD_TEASER_DURATION, size: VERTICAL, langs: ['ar'], props: { days: 2 } },
  { id: 'MahdTeaser1', component: MahdCountdown, duration: MAHD_TEASER_DURATION, size: VERTICAL, langs: ['ar'], props: { days: 1 } },
  { id: 'MahdToday', component: MahdToday, duration: MAHD_TEASER_DURATION, size: VERTICAL, langs: ['ar'] },
  { id: 'MahdCase', component: MahdCase, duration: MAHD_CASE_DURATION, size: WIDE, langs: ['ar'] },
  { id: 'MahdCaseVertical', component: MahdCase, duration: MAHD_CASE_DURATION, size: VERTICAL, langs: ['ar'] },
  // Reusable templates — default props are the examples in templates/*.json.
  { id: 'Tip', component: Tip, duration: TIP_DURATION, size: VERTICAL, langs: ['ar'], props: tip1.props },
  { id: 'BeforeAfterTpl', component: BeforeAfterTpl, duration: BA_DURATION, size: VERTICAL, langs: ['ar'], props: baMahd.props },
  { id: 'AdBreakdown', component: AdBreakdown, duration: BREAKDOWN_DURATION, size: VERTICAL, langs: ['ar'], props: breakdownMahd.props },
  { id: 'PitchTemplate', component: PitchTemplate, duration: PITCH_TPL_DURATION, size: VERTICAL, langs: ['ar'], props: pitchMahd.props },
] as const;

export const RemotionRoot: React.FC = () => (
  <>
    {VIDEOS.flatMap((v) =>
      ('langs' in v ? v.langs : (['ar', 'en'] as const)).map((lang) => (
        <Composition
          key={`${v.id}-${lang}`}
          id={`${v.id}-${lang.toUpperCase()}`}
          component={v.component as React.FC<any>}
          durationInFrames={v.duration}
          fps={FPS}
          width={v.size.width}
          height={v.size.height}
          defaultProps={{ lang, ...('props' in v ? v.props : {}) }}
        />
      )),
    )}
  </>
);
