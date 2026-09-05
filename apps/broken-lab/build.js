import { mkdir, writeFile } from 'node:fs/promises';

// Toggled by the BREAK_THE_BUILD environment variable in project settings.
// When set to "1" this script exits non-zero so the dashboard shows a
// failed deployment with a real build log to read.
const shouldBreak = process.env.BREAK_THE_BUILD === '1';

console.log('▲ broken-lab build starting');
console.log(`  node        ${process.version}`);
console.log(`  VERCEL_ENV  ${process.env.VERCEL_ENV ?? 'local'}`);
console.log(`  BREAK       ${process.env.BREAK_THE_BUILD ?? 'unset'}`);

console.log('  step 1/3  resolving configuration');
console.log('  step 2/3  compiling assets');

if (shouldBreak) {
  console.error('');
  console.error('  ✗ step 3/3  bundling failed');
  console.error('');
  console.error('  Error: Cannot resolve module "@studylab/pricing-engine"');
  console.error('    imported from src/checkout.js:4:1');
  console.error('');
  console.error('  The package is listed in the import graph but missing from');
  console.error('  package.json dependencies. Install it or remove the import.');
  console.error('');
  process.exit(1);
}

await mkdir('dist', { recursive: true });
await writeFile(
  'dist/index.html',
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>broken-lab — Vercel Study Lab</title>
    <style>
      :root { color-scheme: dark; }
      body {
        font-family: ui-sans-serif, -apple-system, sans-serif;
        background: #0a0a0a; color: #ededed; margin: 0;
      }
      main { max-width: 720px; margin: 0 auto; padding: 48px 24px; }
      .ok { color: #4ade80; }
      code { background: #1c1c1c; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
    </style>
  </head>
  <body>
    <main>
      <h1>broken-lab</h1>
      <p class="ok">✓ This build succeeded.</p>
      <p>
        Built at <code>${new Date().toISOString()}</code> with a custom build
        command rather than a detected framework.
      </p>
      <p>
        Flipping <code>BREAK_THE_BUILD</code> to <code>1</code> in project
        settings makes the next deployment fail, which is how the failed
        deployment in this project's history was produced.
      </p>
    </main>
  </body>
</html>
`
);

console.log('  step 3/3  wrote dist/index.html');
console.log('▲ broken-lab build complete');
