// Renders every composition (AR + EN) to out/*.mp4.
import { execFileSync } from 'node:child_process';

const jobs = [
  ['NeoCapta-AR', 'neo-capta-ar.mp4'],
  ['NeoCapta-EN', 'neo-capta-en.mp4'],
  ['Manifesto-AR', 'manifesto-ar.mp4'],
  ['Manifesto-EN', 'manifesto-en.mp4'],
  ['Journey-AR', 'journey-ar.mp4'],
  ['Journey-EN', 'journey-en.mp4'],
  ['BeforeAfter-AR', 'vertical-before-after-ar.mp4'],
  ['BeforeAfter-EN', 'vertical-before-after-en.mp4'],
  ['Brief-AR', 'vertical-brief-ar.mp4'],
  ['Brief-EN', 'vertical-brief-en.mp4'],
  ['Sting-AR', 'vertical-sting-ar.mp4'],
  ['Sting-EN', 'vertical-sting-en.mp4'],
  ['Countdown-AR', 'square-countdown-ar.mp4'],
  ['Countdown-EN', 'square-countdown-en.mp4'],
  ['Grid-AR', 'square-grid-ar.mp4'],
  ['Grid-EN', 'square-grid-en.mp4'],
  ['Carousel-AR', 'square-carousel-ar.mp4'],
  ['Carousel-EN', 'square-carousel-en.mp4'],
  ['Story-AR', 'story-ar.mp4'],
  ['Story-EN', 'story-en.mp4'],
  ['StoryVertical-AR', 'vertical-story-ar.mp4'],
  ['StoryVertical-EN', 'vertical-story-en.mp4'],
  ['StorySquare-AR', 'square-story-ar.mp4'],
  ['StorySquare-EN', 'square-story-en.mp4'],
];
const only = process.argv.slice(2);
for (const [id, file] of jobs) {
  if (only.length && !only.some((o) => id.toLowerCase().startsWith(o.toLowerCase()))) continue;
  execFileSync('npx', ['remotion', 'render', 'src/index.ts', id, `out/${file}`], { stdio: 'inherit' });
}
