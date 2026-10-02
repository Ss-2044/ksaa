import {Composition} from 'remotion';
import {ArcadeConcept} from './concepts/Arcade';
import {ClayConcept} from './concepts/Clay';
import {CoffeeConcept} from './concepts/Coffee';
import {ConstellationConcept} from './concepts/Constellation';
import {CrosswordConcept} from './concepts/Crossword';
import {LiveConcept} from './concepts/Live';
import {NotificationConcept} from './concepts/Notification';
import {PuzzleConcept} from './concepts/Puzzle';
import {TeaserMissingPiece, TeaserTomorrow, TeaserWho} from './concepts/Teasers';
import {TimeHasComeConcept} from './concepts/TimeHasCome';
import {DoorsConcept} from './concepts/Doors';
import {PostcardsConcept} from './concepts/Postcards';
import {ViewfinderConcept} from './concepts/Viewfinder';
import {FlightConcept} from './concepts/Flight';
import {LettersConcept} from './concepts/Letters';
import {SketchConcept} from './concepts/Sketch';
import {WeatherConcept} from './concepts/Weather';
import {DURATION, FPS} from './theme';

// أفكار مختلفة (16:9، 30 ث) — كل واحدة بتصميم وموسيقى خاصة
const CONCEPTS = [
  {id: 'Idea1-Notification', component: NotificationConcept},
  {id: 'Idea2-Constellation', component: ConstellationConcept},
  {id: 'Idea3-Arcade', component: ArcadeConcept},
  {id: 'Idea4-Clay', component: ClayConcept},
  {id: 'Idea5-Weather', component: WeatherConcept},
  {id: 'Idea6-Crossword', component: CrosswordConcept},
  {id: 'Idea7-Puzzle', component: PuzzleConcept},
  {id: 'Idea8-Coffee', component: CoffeeConcept},
  {id: 'Idea10-TimeHasCome', component: TimeHasComeConcept},
  {id: 'Idea11-Doors', component: DoorsConcept},
  {id: 'Idea12-Postcards', component: PostcardsConcept},
  {id: 'Idea13-Viewfinder', component: ViewfinderConcept},
  {id: 'Idea14-Flight', component: FlightConcept},
  {id: 'Idea15-Letters', component: LettersConcept},
  {id: 'Idea16-Sketch', component: SketchConcept},
];

// فكرة عمودية كاملة (9:16، 30 ث)
const VERTICAL = [{id: 'Idea9-LiveStream', component: LiveConcept}];

// مقطعا تشويق عموديان (9:16، 10 ث) للنشر قبل يوم الإعلان
const TEASERS = [
  {id: 'Teaser1-WhoIsIt', component: TeaserWho},
  {id: 'Teaser2-Tomorrow', component: TeaserTomorrow},
  {id: 'Teaser3-MissingPiece', component: TeaserMissingPiece},
];

export const RemotionRoot: React.FC = () => (
  <>
    {CONCEPTS.map((c) => (
      <Composition key={c.id} id={c.id} component={c.component} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} />
    ))}
    {VERTICAL.map((c) => (
      <Composition key={c.id} id={c.id} component={c.component} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} />
    ))}
    {TEASERS.map((c) => (
      <Composition key={c.id} id={c.id} component={c.component} durationInFrames={10 * FPS} fps={FPS} width={1080} height={1920} />
    ))}
  </>
);
