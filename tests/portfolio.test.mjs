import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const url = 'http://127.0.0.1:4179';
let server;
let browser;
let serverOutput = '';

before(async () => {
  server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '4179', '--strictPort'], { stdio: 'pipe' });
  server.stdout.on('data', data => { serverOutput += data.toString(); });
  server.stderr.on('data', data => { serverOutput += data.toString(); });
  let ready = false;
  for (let attempt = 0; attempt < 80; attempt++) {
    if (server.exitCode !== null) throw new Error(`Preview server stopped: ${serverOutput}`);
    try { if ((await fetch(url)).ok) { ready = true; break; } } catch { /* Wait for the server to bind. */ }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.ok(ready, `Preview server did not start: ${serverOutput}`);
  const executablePath = process.env.CHROMIUM_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
  browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox'] });
  mkdirSync('test-results', { recursive: true });
});

after(async () => {
  await browser?.close();
  server?.kill('SIGTERM');
});

async function openPage(t, options = {}) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: 'dark', reducedMotion: 'reduce', ...options });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  t.after(async () => { await context.close(); assert.deepEqual(errors, [], 'No browser runtime errors'); });
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  return { page, context };
}

async function run(page, command) {
  const input = page.getByRole('textbox', { name: 'Terminal command' });
  await input.fill(command);
  await input.press('Enter');
}

function lastOutput(page) { return page.locator('.transcript-entry').last().locator('.command-output'); }

test('production page is a black monospace terminal with identity and clickable work', async t => {
  const { page } = await openPage(t);
  assert.match(await page.title(), /Santiago Paz Farfán/);
  assert.equal(await page.locator('h1').count(), 1);
  assert.equal(await page.locator('html').evaluate(element => getComputedStyle(element).backgroundColor), 'rgb(0, 0, 0)');
  assert.match(await page.locator('.terminal-app').evaluate(element => getComputedStyle(element).fontFamily), /IBM Plex Mono/);
  assert.ok(await page.getByRole('heading', { name: 'Santiago Paz Farfán', exact: true }).isVisible());
  assert.equal(await page.getByRole('button', { name: /^Read / }).count(), 3);
  assert.match(await page.getByRole('log').innerText(), /Public recreations are not available yet/);
  const requests = await page.evaluate(() => performance.getEntriesByType('resource').map(entry => entry.name));
  assert.ok(requests.every(resource => new URL(resource).origin === url), 'All assets are local');
  assert.ok(await page.evaluate(() => document.fonts.check('14px "IBM Plex Mono"')));
  await page.screenshot({ path: 'test-results/terminal-dark.png' });
});

test('black is the default even on light devices; explicit light mode persists', async t => {
  const { page } = await openPage(t, { colorScheme: 'light' });
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
  await page.getByRole('button', { name: 'Switch to light mode', exact: true }).click();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
  await page.reload();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
  assert.equal(await page.locator('html').evaluate(element => getComputedStyle(element).backgroundColor), 'rgb(255, 255, 255)');
  await page.screenshot({ path: 'test-results/terminal-light.png' });
  await run(page, 'theme dark');
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
  await run(page, 'theme invalid');
  assert.match(await lastOutput(page).innerText(), /Usage: theme/);
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
});

test('shell commands return actual resume content', async t => {
  const { page } = await openPage(t);
  for (const [command, expected] of [
    ['help', 'Toggle light / dark'], ['whoami', 'Santiago Paz Farfán'],
    ['skills', 'DynamoDB'], ['experience', 'Dec 2025 — Jun 2026'],
    ['cat experience.txt', 'Expected 2028'], ['contact', 'maximiliano.farfansp@gmail.com'],
  ]) {
    await run(page, command);
    assert.ok((await lastOutput(page).innerText()).includes(expected), command);
  }
  assert.equal(await page.locator('h1').count(), 1, 'One document heading after repeated commands');
});

test('history, draft restoration, completion, Escape, and Ctrl+L work', async t => {
  const { page } = await openPage(t);
  const input = page.getByRole('textbox', { name: 'Terminal command' });
  await run(page, 'whoami');
  await run(page, 'skills');
  await input.fill('unfinished');
  await input.press('ArrowUp');
  assert.equal(await input.inputValue(), 'skills');
  await input.press('ArrowUp');
  assert.equal(await input.inputValue(), 'whoami');
  await input.press('ArrowDown');
  await input.press('ArrowDown');
  assert.equal(await input.inputValue(), 'unfinished');
  await input.fill('who');
  await input.press('Tab');
  assert.equal(await input.inputValue(), 'whoami');
  await input.press('Escape');
  assert.equal(await input.inputValue(), '');
  await input.press('Control+l');
  assert.equal(await page.locator('.transcript-entry').count(), 0);
  await run(page, 'help');
  assert.match(await lastOutput(page).innerText(), /Commands/);
  await run(page, 'clear');
  assert.equal(await page.locator('.transcript-entry').count(), 0);
});

test('virtual directories and cat resolve the correct files', async t => {
  const { page } = await openPage(t);
  await run(page, 'cd work');
  assert.match(await page.locator('.command-form').innerText(), /~\/work/);
  await run(page, 'pwd');
  assert.equal(await lastOutput(page).innerText(), '/home/maxfsp/portfolio/work');
  await run(page, 'ls .');
  assert.match(await lastOutput(page).innerText(), /healthcare-audio.md/);
  await run(page, 'cat healthcare-audio.md');
  assert.match(await lastOutput(page).innerText(), /file integrity/);
  await run(page, 'cd ..');
  await run(page, 'pwd');
  assert.equal(await lastOutput(page).innerText(), '/home/maxfsp/portfolio');
  await run(page, 'cat skills.txt');
  assert.match(await lastOutput(page).innerText(), /PostgreSQL/);
  await run(page, 'cd missing');
  assert.match(await lastOutput(page).innerText(), /no such directory/);
});

test('navigation and filenames read work inline without overlays', async t => {
  const { page } = await openPage(t);
  await page.getByRole('navigation').getByRole('button', { name: 'work', exact: true }).click();
  assert.equal(new URL(page.url()).hash, '#work');
  await page.getByRole('button', { name: 'Read Healthcare audio uploads', exact: true }).last().click();
  const output = lastOutput(page);
  assert.match(await output.innerText(), /file integrity/);
  assert.match(await output.innerText(), /Source code and production data are private/);
  assert.equal(await output.getByRole('link').count(), 0);
  assert.equal(await page.getByRole('dialog').count(), 0);
  await run(page, 'work pearai');
  assert.equal(await lastOutput(page).getByRole('link', { name: /Public contributions/ }).getAttribute('href'), 'https://github.com/MaxFSP');
  await page.screenshot({ path: 'test-results/terminal-work.png' });
});

test('unknown commands, missing files, and markup are handled as plain text', async t => {
  const { page } = await openPage(t);
  for (const command of ['<script>alert(1)</script>', 'constructor']) {
    await run(page, command);
    assert.match(await lastOutput(page).innerText(), /command not found/);
  }
  assert.equal(await page.locator('.command-output script').count(), 0);
  await run(page, 'cat missing.txt');
  assert.match(await lastOutput(page).innerText(), /no such file/);
  await run(page, 'work missing');
  assert.match(await lastOutput(page).innerText(), /no such entry/);
  await run(page, 'ls missing');
  assert.match(await lastOutput(page).innerText(), /no such directory/);
});

test('contact links and clipboard copy use the correct email', async t => {
  const { page, context } = await openPage(t);
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await run(page, 'contact');
  await page.getByRole('button', { name: '[ copy email ]', exact: true }).click();
  await page.getByRole('button', { name: '[ copied ]', exact: true }).waitFor();
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), 'maximiliano.farfansp@gmail.com');
  assert.equal(await lastOutput(page).getByRole('link', { name: '[ send email ]', exact: true }).getAttribute('href'), 'mailto:maximiliano.farfansp@gmail.com');
});

test('clipboard denial leaves a usable email link and clear fallback', async t => {
  const { page } = await openPage(t);
  await page.evaluate(() => Object.defineProperty(navigator.clipboard, 'writeText', { value: () => Promise.reject(new Error('Denied')) }));
  await run(page, 'contact');
  await page.getByRole('button', { name: '[ copy email ]', exact: true }).click();
  await page.getByText('Clipboard unavailable.', { exact: false }).waitFor();
  assert.equal(await lastOutput(page).getByRole('link', { name: profileEmail(), exact: true }).getAttribute('href'), 'mailto:' + profileEmail());
});

function profileEmail() { return 'maximiliano.farfansp@gmail.com'; }

test('resume links download the actual PDF', async t => {
  const { page } = await openPage(t);
  const download = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download résumé', exact: true }).click();
  assert.equal((await download).suggestedFilename(), 'Santiago-Paz-Farfan-Resume.pdf');
  const response = await page.request.get(url + '/resume.pdf');
  assert.equal(response.status(), 200);
  assert.equal((await response.body()).subarray(0, 5).toString(), '%PDF-');
  await run(page, 'resume');
  assert.ok(await lastOutput(page).getByRole('link', { name: 'Download resume.pdf ↓' }).isVisible());
});

test('mobile navigation and project reading work without typing', async t => {
  const { page } = await openPage(t, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await page.getByRole('navigation').getByRole('button', { name: 'work', exact: true }).tap();
  await page.getByRole('button', { name: 'Read Healthcare audio uploads', exact: true }).last().tap();
  assert.match(await lastOutput(page).innerText(), /Healthcare audio uploads/);
  assert.ok(await page.getByRole('textbox', { name: 'Terminal command' }).isVisible());
  await page.getByRole('navigation').getByRole('button', { name: 'contact', exact: true }).tap();
  assert.ok(await lastOutput(page).getByRole('link', { name: /send email/ }).isVisible());
  await page.screenshot({ path: 'test-results/terminal-mobile-contact.png' });
});

test('terminal fits phone through wide-screen widths and short viewports', async t => {
  const { page } = await openPage(t);
  for (const width of [320, 375, 390, 600, 768, 960, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 844 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No horizontal page overflow at ' + width);
    assert.ok(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight), 'No vertical page overflow at ' + width);
    assert.ok(await page.locator('.terminal-scroll').evaluate(element => element.scrollWidth <= element.clientWidth), 'Output fits at ' + width);
  }
  await page.setViewportSize({ width: 390, height: 420 });
  await run(page, 'experience');
  const box = await page.getByRole('textbox', { name: 'Terminal command' }).boundingBox();
  assert.ok(box.y >= 0 && box.y + box.height <= 420, 'Prompt stays above the bottom of a short viewport');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(url);
  await page.screenshot({ path: 'test-results/terminal-mobile.png' });
});

test('direct links load the requested content and keyboard shortcut focuses the prompt', async t => {
  const { page } = await openPage(t);
  await page.goto(url + '/#experience');
  await page.reload();
  assert.match(await lastOutput(page).innerText(), /Expected 2028/);
  await page.getByRole('navigation').getByRole('button', { name: 'help', exact: true }).click();
  await page.keyboard.press('Control+k');
  assert.ok(await page.getByRole('textbox', { name: 'Terminal command' }).evaluate(element => element === document.activeElement));
  await run(page, 'open about');
  assert.equal(new URL(page.url()).hash, '#about');
});

test('long output scrolls inside the terminal and new responses remain readable', async t => {
  const { page } = await openPage(t, { viewport: { width: 390, height: 640 } });
  await run(page, 'experience');
  assert.ok(await page.locator('.terminal-scroll').evaluate(element => element.scrollHeight > element.clientHeight));
  await run(page, 'pwd');
  assert.ok(await lastOutput(page).isVisible());
  const outputBox = await lastOutput(page).boundingBox();
  const inputBox = await page.locator('.input-dock').boundingBox();
  assert.ok(outputBox.y >= 0 && outputBox.y + outputBox.height <= inputBox.y, 'New output is visible above the prompt');
});

for (const theme of ['dark', 'light']) {
  test(theme + ' terminal passes automated WCAG accessibility checks', async t => {
    const { page } = await openPage(t);
    if (theme === 'light') await page.getByRole('button', { name: 'Switch to light mode', exact: true }).click();
    for (const command of [null, 'work healthcare', 'help', 'contact']) {
      if (command) await run(page, command);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      assert.deepEqual(results.violations.map(({ id, nodes }) => ({ id, elements: nodes.map(node => ({ html: node.html, failure: node.failureSummary })) })), []);
    }
  });
}
