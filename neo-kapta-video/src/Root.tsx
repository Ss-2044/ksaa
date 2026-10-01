import {Composition} from 'remotion';
import {ArcadeConcept} from './concepts/Arcade';
import {ConstellationConcept} from './concepts/Constellation';
import {NotificationConcept} from './concepts/Notification';
import {DURATION, FPS} from './theme';

// ثلاث أفكار مختلفة — كل واحدة فيديو مستقل بموسيقى خاصة
const CONCEPTS = [
  {id: 'Idea1-Notification', component: NotificationConcept},
  {id: 'Idea2-Constellation', component: ConstellationConcept},
  {id: 'Idea3-Arcade', component: ArcadeConcept},
];

export const RemotionRoot: React.FC = () => (
  <>
    {CONCEPTS.map((c) => (
      <Composition key={c.id} id={c.id} component={c.component} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} />
    ))}
  </>
);
