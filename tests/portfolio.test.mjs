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

test('production page loads local assets and accurate portfolio content', async t => {
  const { page } = await openPage(t);
  assert.match(await page.title(), /Santiago Paz Farfán/);
  assert.equal(await page.locator('h1').count(), 1);
  assert.equal(await page.getByRole('button', { name: /^Read about/ }).count(), 3);
  assert.match(await page.locator('#experience').innerText(), /Dec 2025 — Jun 2026/);
  assert.match(await page.locator('#about').innerText(), /Expected 2028/);
  const requests = await page.evaluate(() => performance.getEntriesByType('resource').map(entry => entry.name));
  assert.ok(requests.every(resource => new URL(resource).origin === url), 'All assets are hosted locally');
  assert.ok(await page.evaluate(() => document.fonts.check('14px "Space Grotesk"')));
  await page.screenshot({ path: 'test-results/desktop-dark.png', fullPage: true });
});

test('theme respects system preference and persists a manual choice', async t => {
  const { page } = await openPage(t, { colorScheme: 'light' });
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
  await page.getByRole('button', { name: 'Switch to dark mode', exact: true }).click();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
  await page.reload();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
  await page.getByRole('button', { name: 'Switch to light mode', exact: true }).click();
  await page.screenshot({ path: 'test-results/desktop-light.png', fullPage: true });
});

test('terminal handles help, identity, skills, unknown commands, history, completion, and clear', async t => {
  const { page } = await openPage(t);
  const input = page.getByRole('textbox', { name: 'Terminal command' });
  const log = page.getByRole('log');
  for (const [command, expected] of [['help', 'Toggle light / dark'], ['whoami', 'Santiago Maximiliano Paz Farfán'], ['skills', 'DynamoDB'], ['<script>alert(1)</script>', 'Command not found: <script>alert(1)</script>']]) {
    await input.fill(command);
    await input.press('Enter');
    assert.ok((await log.innerText()).includes(expected));
  }
  await input.press('ArrowUp');
  assert.equal(await input.inputValue(), '<script>alert(1)</script>');
  await input.press('ArrowUp');
  assert.equal(await input.inputValue(), 'skills');
  await input.press('ArrowDown');
  assert.equal(await input.inputValue(), '<script>alert(1)</script>');
  await input.fill('who');
  await input.press('Tab');
  assert.equal(await input.inputValue(), 'whoami');
  await input.fill('clear');
  await input.press('Enter');
  assert.equal(await log.innerText(), '');
});

test('terminal commands navigate to real sections and switch themes', async t => {
  const { page } = await openPage(t);
  const input = page.getByRole('textbox', { name: 'Terminal command' });
  for (const [command, hash] of [['projects', '#work'], ['experience', '#experience'], ['contact', '#contact'], ['open about', '#about']]) {
    await input.fill(command);
    await input.press('Enter');
    assert.equal(new URL(page.url()).hash, hash);
  }
  await input.fill('theme');
  await input.press('Enter');
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
  await input.fill('open missing');
  await input.press('Enter');
  assert.match(await page.getByRole('log').innerText(), /Choose a section/);
});

test('command menu supports search, keyboard activation, Escape, and focus restoration', async t => {
  const { page } = await openPage(t);
  const trigger = page.getByRole('button', { name: 'Open command menu' });
  await trigger.click();
  assert.ok(await page.getByRole('dialog').isVisible());
  const search = page.getByRole('textbox', { name: 'Search commands' });
  assert.ok(await search.evaluate(element => element === document.activeElement));
  await search.fill('zzzzzz');
  assert.ok(await page.getByText('No matching commands.', { exact: false }).isVisible());
  await search.fill('experience');
  await search.press('Enter');
  assert.equal(new URL(page.url()).hash, '#experience');
  assert.equal(await page.getByRole('dialog').count(), 0);
  await trigger.click();
  await page.keyboard.press('Escape');
  assert.ok(await trigger.evaluate(element => element === document.activeElement));
  await page.keyboard.press('Control+k');
  assert.ok(await page.getByRole('dialog').isVisible());
  await page.keyboard.press('Escape');
});

test('work notes explain actual contributions and disclose private client source', async t => {
  const { page } = await openPage(t);
  const trigger = page.getByRole('button', { name: 'Read about Healthcare infrastructure' });
  await trigger.click();
  const dialog = page.getByRole('dialog');
  assert.match(await dialog.innerText(), /file integrity/);
  assert.match(await dialog.innerText(), /Source code and production data are private/);
  assert.equal(await dialog.getByRole('link').count(), 0);
  await page.keyboard.press('Escape');
  assert.ok(await trigger.evaluate(element => element === document.activeElement));
  await page.getByRole('button', { name: 'Read about Developer tools' }).click();
  assert.equal(await page.getByRole('dialog').getByRole('link', { name: 'View my GitHub' }).getAttribute('href'), 'https://github.com/MaxFSP');
  await page.screenshot({ path: 'test-results/work-notes.png' });
  await page.getByRole('button', { name: 'Close work details' }).click();
  assert.equal(await page.getByRole('dialog').count(), 0);
});

test('contact actions copy the correct email and provide a working mailto', async t => {
  const { page, context } = await openPage(t);
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.getByRole('button', { name: 'Copy email', exact: true }).click();
  await page.getByRole('button', { name: 'Email copied' }).waitFor();
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), 'maximiliano.farfansp@gmail.com');
  assert.equal(await page.getByRole('link', { name: 'Say hello' }).getAttribute('href'), 'mailto:maximiliano.farfansp@gmail.com');
});

test('clipboard denial provides an actionable fallback', async t => {
  const { page } = await openPage(t);
  await page.evaluate(() => Object.defineProperty(navigator.clipboard, 'writeText', { value: () => Promise.reject(new Error('Denied')) }));
  await page.getByRole('button', { name: 'Copy email', exact: true }).click();
  await page.getByText('Clipboard unavailable.', { exact: false }).waitFor();
  assert.equal(await page.getByRole('link', { name: 'maximiliano.farfansp@gmail.com', exact: true }).getAttribute('href'), 'mailto:maximiliano.farfansp@gmail.com');
});

test('resume is a real downloadable PDF', async t => {
  const { page } = await openPage(t);
  const download = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Résumé', exact: true }).click();
  assert.equal((await download).suggestedFilename(), 'Santiago-Paz-Farfan-Resume.pdf');
  const response = await page.request.get(`${url}/resume.pdf`);
  assert.equal(response.status(), 200);
  assert.equal((await response.body()).subarray(0, 5).toString(), '%PDF-');
});

test('mobile menu opens, traps focus, closes with Escape, and navigates', async t => {
  const { page } = await openPage(t, { viewport: { width: 390, height: 844 } });
  assert.equal(await page.locator('.sidebar').isVisible(), false);
  const trigger = page.getByRole('button', { name: 'Open navigation', exact: true });
  await trigger.click();
  assert.equal(await page.locator('.sidebar').isVisible(), true);
  assert.equal(await page.locator('.mobile-menu').getAttribute('aria-expanded'), 'true');
  await page.keyboard.press('Shift+Tab');
  assert.ok(await page.locator('.sidebar-bottom a').last().evaluate(element => element === document.activeElement));
  await page.keyboard.press('Tab');
  assert.ok(await page.locator('.sidebar-close').evaluate(element => element === document.activeElement));
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.sidebar').isVisible(), false);
  assert.ok(await trigger.evaluate(element => element === document.activeElement));
  await trigger.click();
  await page.getByRole('navigation').getByRole('link', { name: 'Selected work' }).click();
  assert.equal(new URL(page.url()).hash, '#work');
  assert.equal(await page.locator('.sidebar').isVisible(), false);
  await page.screenshot({ path: 'test-results/mobile.png', fullPage: true });
});

test('layouts fit narrow phones, tablets, laptops, and wide displays', async t => {
  const { page } = await openPage(t);
  for (const width of [320, 375, 390, 700, 768, 960, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    const dimensions = await page.evaluate(() => ({ content: document.documentElement.scrollWidth, viewport: window.innerWidth }));
    assert.ok(dimensions.content <= dimensions.viewport, `No horizontal overflow at ${width}px: ${JSON.stringify(dimensions)}`);
  }
});

test('direct section links and reduced motion are supported', async t => {
  const { page } = await openPage(t);
  await page.goto(`${url}/#about`);
  assert.equal(await page.locator('html').evaluate(element => getComputedStyle(element).scrollBehavior), 'auto');
  await page.waitForFunction(() => document.querySelector('#about').getBoundingClientRect().top < 200);
  assert.equal(new URL(page.url()).hash, '#about');
});

for (const theme of ['dark', 'light']) {
  test(`${theme} theme passes automated WCAG accessibility checks`, async t => {
    const { page } = await openPage(t, { colorScheme: theme });
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    assert.deepEqual(results.violations.map(({ id, nodes }) => ({ id, elements: nodes.map(node => ({ html: node.html, failure: node.failureSummary })) })), []);
    await page.getByRole('button', { name: 'Read about Healthcare infrastructure' }).click();
    const modalResults = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    assert.deepEqual(modalResults.violations.map(({ id, nodes }) => ({ id, elements: nodes.map(node => node.html) })), []);
  });
}
