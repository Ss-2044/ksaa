// WCAG contrast check for the brand pairs used in the UI. Fails (exit 1) on any regression.
const L = (h) => {
  const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => { const [x, y] = [L(a), L(b)]; return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const pairs = [
  ["terra-ink text on cream", "#a93f28", "#fbf6ee", 4.5],
  ["terra-ink text on sand", "#a93f28", "#f3eadb", 4.5],
  ["white on terra-btn (primary button)", "#ffffff", "#b8472f", 4.5],
  ["stone body text on cream", "#655b53", "#fbf6ee", 4.5],
  ["stone text on sand", "#655b53", "#f3eadb", 4.5],
  ["sage-ink on sage-wash", "#4f6149", "#e5ebdf", 4.5],
  ["cream on ink", "#fbf6ee", "#231b16", 4.5],
  ["stone-soft on ink", "#b9ada2", "#231b16", 4.5],
  ["terra-soft on ink", "#ee9c82", "#231b16", 4.5],
  ["terra-wash on terra-deep", "#f7e3d8", "#8f3520", 4.5],
  ["terra (large display text only) on cream", "#c8553d", "#fbf6ee", 3],
];
let fail = false;
for (const [name, fg, bg, min] of pairs) {
  const r = ratio(fg, bg);
  const ok = r >= min;
  fail ||= !ok;
  console.log(`${ok ? "✓" : "✗"} ${r.toFixed(2)}:1 (min ${min}) ${name}`);
}
process.exit(fail ? 1 : 0);
