// Renders every composition (AR + EN) to out/*.mp4.
import { execFileSync } from 'node:child_process';

const jobs = [
  ['NeoCapta-AR', 'neo-capta-ar.mp4'],
  ['NeoCapta-EN', 'neo-capta-en.mp4'],
  ['Manifesto-AR', 'manifesto-ar.mp4'],
  ['Manifesto-EN', 'manifesto-en.mp4'],
  ['Journey-AR', 'journey-ar.mp4'],
  ['Journey-EN', 'journey-en.mp4'],
];
const only = process.argv.slice(2);
for (const [id, file] of jobs) {
  if (only.length && !only.some((o) => id.toLowerCase().startsWith(o.toLowerCase()))) continue;
  execFileSync('npx', ['remotion', 'render', 'src/index.ts', id, `out/${file}`], { stdio: 'inherit' });
}
