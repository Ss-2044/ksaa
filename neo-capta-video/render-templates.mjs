// Renders every templates/*.json (or the ones whose names start with the given words) to out/templates/.
// Each file: { "id": "<composition id>", "out": "<file name>.mp4", "props": { ... } }
import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';

mkdirSync('out/templates', { recursive: true });
const only = process.argv.slice(2);
for (const file of readdirSync('templates').filter((f) => f.endsWith('.json')).sort()) {
  if (only.length && !only.some((o) => file.startsWith(o))) continue;
  const { id, out, props } = JSON.parse(readFileSync(`templates/${file}`, 'utf8'));
  const propsFile = `out/templates/.props-${file}`;
  writeFileSync(propsFile, JSON.stringify(props));
  execFileSync('npx', ['remotion', 'render', 'src/index.ts', id, `out/templates/${out}`, `--props=${propsFile}`], { stdio: 'inherit' });
}
