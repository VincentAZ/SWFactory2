// Visual smoke test: drives the built app through every mode and captures screenshots.
// Usage: node scripts/shoot.mjs [baseUrl] [outDir]
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

const base = process.argv[2] ?? 'http://localhost:4173/';
const out = process.argv[3] ?? '/tmp/sw-shots';
fs.mkdirSync(out, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: 'new',
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--hide-scrollbars'],
});
const page = await browser.newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`[${m.type()}] ${m.text()}`); });
page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function shot(name, w = 1600, hgt = 1000) {
  await page.setViewport({ width: w, height: hgt, deviceScaleFactor: 1 });
  await wait(400);
  await page.screenshot({ path: `${out}/${name}.png` });
  console.log('shot', name);
}
async function goto(q = '') {
  await page.goto(base + q, { waitUntil: 'networkidle0' });
  await wait(3500);
}

// 1. onboarding (fresh)
await page.setViewport({ width: 1600, height: 1000 });
await goto('');
await page.evaluate(() => localStorage.clear());
await goto('');
await shot('01-onboarding');
await page.click('.onboard__actions .btn:nth-child(2)');
await wait(800);
await shot('02-explore-simple');

// 2. inspector
await page.evaluate(() => { window.__stackworks.store.set({ complexity: 3 }); });
await wait(1200);
await page.evaluate(() => { document.querySelector('.dockitem:nth-of-type(1)'); });
await goto('?focus=backend');
await wait(2500);
await shot('03-inspector-backend');
await page.click('.tab:nth-child(4)');
await wait(300);
await shot('04-inspector-ask');
await page.click('.tab:nth-child(5)');
await wait(300);
await shot('05-inspector-quiz');

// 3. explode + xray
await page.evaluate(() => { window.__stackworks.store.set({ selected: null, panelOpen: false, explode: 1, xray: true }); window.__stackworks.scene.preset('overview'); });
await wait(2500);
await shot('06-exploded-xray');
await page.evaluate(() => { window.__stackworks.store.set({ explode: 0, xray: false }); });

// 4. tour
await goto('?mode=tours&level=3');
await page.evaluate(() => window.__stackworks.tourPlayer.start('big-picture'));
await wait(1800);
await shot('07-tour-start');
await page.evaluate(() => window.__stackworks.tourPlayer.goTo(3));
await wait(4000);
await shot('08-tour-backend');

// 5. scenario
await goto('?mode=scenarios&level=3');
await shot('09-scenarios-list');
await page.evaluate(() => window.__stackworks.scenarioPlayer.start('ai-chat', { autoplay: true }));
await wait(9000);
await shot('10-scenario-running');

// 6. decisions
await goto('?mode=decisions&level=3');
await page.click('.modepanel:not([hidden]) .cards .card:nth-child(2)');
await wait(400);
await page.click('.modepanel:not([hidden]) .options .option:nth-child(3)');
await wait(3500);
await shot('11-decision');

// 7. blueprint
await goto('?mode=blueprint&level=3');
await page.type('.form input:nth-of-type(1)', 'Bloom');
await page.click('.features .feat:nth-child(1)');
await page.click('.features .feat:nth-child(3)');
await wait(2500);
await shot('12-blueprint');
await page.click('.bp__actions .btn');
await wait(500);
await shot('13-blueprint-brief');

// 8. learn
await goto('?mode=learn&level=3');
await shot('14-learn');

// 9. search
await goto('?level=2');
await page.keyboard.press('/');
await wait(300);
await page.keyboard.type('token');
await wait(300);
await shot('15-search');

// 10. mobile
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
await goto('?focus=database&level=2');
await shot('16-mobile-inspector', 390, 844);
await page.evaluate(() => window.__stackworks.store.set({ selected: null, panelOpen: false }));
await wait(600);
await shot('17-mobile-overview', 390, 844);

// 11. packets in flight (closeup)
await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 1 });
await goto('?mode=scenarios&level=3');
await page.evaluate(() => { window.__stackworks.store.set({ dockOpen: false }); window.__stackworks.scenarioPlayer.start('checkout', { autoplay: true }); });
await wait(2500);
await page.evaluate(() => window.__stackworks.scenarioPlayer.goTo(3));
await wait(2200);
await shot('18-packets');

const fps = await page.evaluate(() => window.__stackworks.scene.fps());
console.log('fps (swiftshader)', fps.toFixed(1));
console.log('console errors/warnings:', errors.length);
for (const e of errors.slice(0, 20)) console.log('  ', e);
await browser.close();
