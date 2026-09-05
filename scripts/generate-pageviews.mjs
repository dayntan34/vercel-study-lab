#!/usr/bin/env node
/**
 * Loads pages in a real Chromium so the @vercel/analytics and
 * @vercel/speed-insights beacons actually fire. Plain curl traffic will not
 * populate the Analytics or Speed Insights tabs, because both depend on
 * client-side JavaScript and real Core Web Vitals measurements.
 *
 * Usage:  node scripts/generate-pageviews.mjs [sessions]
 */

import { chromium, devices } from 'playwright';

const SITES = {
  next: {
    base: 'https://next-lab-acme-415b1.vercel.app',
    paths: ['/', '/isr', '/dynamic', '/flags', '/'],
  },
  static: {
    base: 'https://static-lab-acme-415b1.vercel.app',
    paths: ['/', '/about', '/'],
  },
  vite: {
    base: 'https://vite-lab-acme-415b1.vercel.app',
    paths: ['/', '/deep/link', '/'],
  },
};

const site = SITES[process.argv[3] ?? 'next'];
if (!site) {
  console.error(`Unknown site. Options: ${Object.keys(SITES).join(', ')}`);
  process.exit(1);
}
const { base: BASE, paths: PATHS } = site;

const PROFILES = [
  { name: 'Desktop Chrome', ...devices['Desktop Chrome'] },
  { name: 'Desktop Safari', ...devices['Desktop Safari'] },
  { name: 'iPhone 15', ...devices['iPhone 15'] },
  { name: 'Pixel 7', ...devices['Pixel 7'] },
  { name: 'iPad Pro 11', ...devices['iPad Pro 11'] },
];

const REFERRERS = [
  'https://www.google.com/',
  'https://news.ycombinator.com/',
  'https://github.com/dayntan34/vercel-study-lab',
  '',
];

const LOCALES = ['en-US', 'en-GB', 'si-LK', 'de-DE'];

const sessions = Number(process.argv[2] ?? 12);
const pick = (a) => a[Math.floor(Math.random() * a.length)];

// Vercel's analytics script refuses to run when it detects automation:
//   if (navigator.webdriver || navigator.userAgent.includes("Headless")) return;
// Both signals have to be masked or no beacon is ever sent.
const browser = await chromium.launch({
  args: ['--disable-blink-features=AutomationControlled'],
});

let beacons = { view: 0, vitals: 0 };
let pages = 0;

for (let s = 0; s < sessions; s++) {
  const profile = pick(PROFILES);
  const context = await browser.newContext({
    ...profile,
    // Strip "HeadlessChrome" out of the UA string.
    userAgent: (profile.userAgent ?? '').replace(/HeadlessChrome/g, 'Chrome'),
    locale: pick(LOCALES),
    timezoneId: pick(['America/New_York', 'Europe/London', 'Asia/Colombo']),
  });

  await context.addInitScript(() => {
    Object.defineProperty(Navigator.prototype, 'webdriver', {
      get: () => false,
      configurable: true,
    });
  });

  // Vercel serves the analytics + speed-insights beacons from randomised
  // path prefixes (e.g. /784cefd45c605c7a/event) so ad blockers cannot match
  // on "/_vercel/insights". Match both the legacy and obfuscated shapes.
  context.on('request', (req) => {
    const path = new URL(req.url()).pathname;
    const obfuscated = /^\/[0-9a-f]{12,}\//.test(path);
    // Pageviews go to /view, custom events to /event, vitals to /vitals.
    if (/\/(view|event)$/.test(path) && (obfuscated || path.includes('/insights/')))
      beacons.view++;
    if (/\/vitals$/.test(path) && (obfuscated || path.includes('/speed-insights/')))
      beacons.vitals++;
  });

  const page = await context.newPage();
  const referer = pick(REFERRERS);

  // Visit 2–4 pages per session so Analytics shows multi-page journeys.
  const visits = 2 + Math.floor(Math.random() * 3);
  for (let v = 0; v < visits; v++) {
    const path = pick(PATHS);
    try {
      await page.goto(`${BASE}${path}`, {
        waitUntil: 'networkidle',
        timeout: 45000,
        referer: v === 0 && referer ? referer : undefined,
      });
      pages++;

      // Scroll and click so interaction vitals (INP/CLS) have something real.
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
      await page.waitForTimeout(700 + Math.random() * 900);
    } catch (e) {
      console.warn(`  session ${s} ${path}: ${e.message.split('\n')[0]}`);
    }
  }

  // Speed Insights flushes vitals on visibility change / unload.
  await page.evaluate(() =>
    document.dispatchEvent(new Event('visibilitychange'))
  );
  await page.waitForTimeout(1200);
  await context.close();

  process.stdout.write(
    `  session ${s + 1}/${sessions} (${profile.name})            \r`
  );
}

await browser.close();

console.log(`\nLoaded ${pages} page views across ${sessions} sessions`);
console.log(`  analytics beacons:      ${beacons.view}`);
console.log(`  speed-insights beacons: ${beacons.vitals}`);
