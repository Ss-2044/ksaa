import {Composition} from 'remotion';
import {ArcadeConcept} from './concepts/Arcade';
import {ClayConcept} from './concepts/Clay';
import {ConstellationConcept} from './concepts/Constellation';
import {CrosswordConcept} from './concepts/Crossword';
import {NotificationConcept} from './concepts/Notification';
import {TeaserTomorrow, TeaserWho} from './concepts/Teasers';
import {WeatherConcept} from './concepts/Weather';
import {DURATION, FPS} from './theme';

// ست أفكار مختلفة (16:9، 30 ث) — كل واحدة بتصميم وموسيقى خاصة
const CONCEPTS = [
  {id: 'Idea1-Notification', component: NotificationConcept},
  {id: 'Idea2-Constellation', component: ConstellationConcept},
  {id: 'Idea3-Arcade', component: ArcadeConcept},
  {id: 'Idea4-Clay', component: ClayConcept},
  {id: 'Idea5-Weather', component: WeatherConcept},
  {id: 'Idea6-Crossword', component: CrosswordConcept},
];

// مقطعا تشويق عموديان (9:16، 10 ث) للنشر قبل يوم الإعلان
const TEASERS = [
  {id: 'Teaser1-WhoIsIt', component: TeaserWho},
  {id: 'Teaser2-Tomorrow', component: TeaserTomorrow},
];

export const RemotionRoot: React.FC = () => (
  <>
    {CONCEPTS.map((c) => (
      <Composition key={c.id} id={c.id} component={c.component} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} />
    ))}
    {TEASERS.map((c) => (
      <Composition key={c.id} id={c.id} component={c.component} durationInFrames={10 * FPS} fps={FPS} width={1080} height={1920} />
    ))}
  </>
);
