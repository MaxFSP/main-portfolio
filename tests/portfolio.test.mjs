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
  server = spawn(
    process.execPath,
    [
      'node_modules/vite/bin/vite.js',
      'preview',
      '--host',
      '127.0.0.1',
      '--port',
      '4179',
      '--strictPort',
    ],
    { stdio: 'pipe' },
  );
  server.stdout.on('data', (data) => {
    serverOutput += data.toString();
  });
  server.stderr.on('data', (data) => {
    serverOutput += data.toString();
  });
  let ready = false;
  for (let attempt = 0; attempt < 80; attempt++) {
    if (server.exitCode !== null) throw new Error(`Preview server stopped: ${serverOutput}`);
    try {
      if ((await fetch(url)).ok) {
        ready = true;
        break;
      }
    } catch {
      /* Wait for the server to bind. */
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.ok(ready, `Preview server did not start: ${serverOutput}`);
  const executablePath =
    process.env.CHROMIUM_PATH ||
    (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
  browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox'] });
  mkdirSync('test-results', { recursive: true });
});

after(async () => {
  await browser?.close();
  server?.kill('SIGTERM');
});

async function openPage(t, options = {}) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    colorScheme: 'dark',
    reducedMotion: 'reduce',
    ...options,
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  t.after(async () => {
    await context.close();
    assert.deepEqual(errors, [], 'No browser runtime errors');
  });
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  return { page, context };
}

async function run(page, command) {
  const input = page.getByRole('textbox', { name: /^(Terminal command|Comando del terminal)$/ });
  await input.fill(command);
  await input.press('Enter');
}

function lastOutput(page) {
  return page.locator('.transcript-entry').last().locator('.command-output');
}

test('production page is a black monospace terminal with identity and clickable work', async (t) => {
  const { page } = await openPage(t);
  assert.match(await page.title(), /Santiago Paz Farfán/);
  assert.equal(await page.locator('h1').count(), 1);
  assert.equal(await page.locator('header nav[aria-label="Portfolio commands"]').count(), 1);
  assert.equal(await page.getByText('run:', { exact: true }).count(), 0);
  assert.equal(
    await page.locator('html').evaluate((element) => getComputedStyle(element).backgroundColor),
    'rgb(0, 0, 0)',
  );
  assert.match(
    await page.locator('.terminal-app').evaluate((element) => getComputedStyle(element).fontFamily),
    /IBM Plex Mono/,
  );
  assert.ok(
    await page.getByRole('heading', { name: 'Santiago Paz Farfán', exact: true }).isVisible(),
  );
  assert.equal(await page.getByRole('button', { name: /^Read / }).count(), 5);
  assert.match(await page.getByRole('log').innerText(), /Public recreations are not available yet/);
  const requests = await page.evaluate(() =>
    performance.getEntriesByType('resource').map((entry) => entry.name),
  );
  assert.ok(
    requests.every((resource) => new URL(resource).origin === url),
    'All assets are local',
  );
  assert.ok(await page.evaluate(() => document.fonts.check('14px "IBM Plex Mono"')));
  await page.screenshot({ path: 'test-results/terminal-dark.png' });
});

test('black is the default even on light devices; explicit light mode persists', async (t) => {
  const { page } = await openPage(t, { colorScheme: 'light' });
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
  await page.getByRole('combobox', { name: 'Terminal theme' }).selectOption('light');
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
  await page.reload();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
  assert.equal(
    await page.locator('html').evaluate((element) => getComputedStyle(element).backgroundColor),
    'rgb(255, 255, 255)',
  );
  await page.screenshot({ path: 'test-results/terminal-light.png' });
  await run(page, 'theme dark');
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
  await run(page, 'theme invalid');
  assert.match(await lastOutput(page).innerText(), /Usage: theme/);
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
});

test('shell commands return actual resume content', async (t) => {
  const { page } = await openPage(t);
  for (const [command, expected] of [
    ['help', 'Choose a console theme'],
    ['whoami', 'Santiago Paz Farfán'],
    ['skills', 'DynamoDB'],
    ['experience', 'Dec 2025 — Jun 2026'],
    ['cat experience.txt', 'Expected 2028'],
    ['contact', 'maximiliano.farfansp@gmail.com'],
  ]) {
    await run(page, command);
    assert.ok((await lastOutput(page).innerText()).includes(expected), command);
  }
  assert.equal(await page.locator('h1').count(), 1, 'One document heading after repeated commands');
});

test('history, draft restoration, completion, Escape, and Ctrl+L work', async (t) => {
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

test('virtual directories and cat resolve the correct files', async (t) => {
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

test('navigation and filenames read work inline without overlays', async (t) => {
  const { page } = await openPage(t);
  await page.getByRole('navigation').getByRole('button', { name: 'work', exact: true }).click();
  assert.equal(new URL(page.url()).hash, '#work');
  await page
    .getByRole('button', { name: 'Read Healthcare audio uploads', exact: true })
    .last()
    .click();
  const output = lastOutput(page);
  assert.match(await output.innerText(), /file integrity/);
  assert.match(await output.innerText(), /Source code and production data are private/);
  assert.equal(await output.getByRole('link').count(), 0);
  assert.equal(await page.getByRole('dialog').count(), 0);
  await run(page, 'work pearai');
  assert.equal(
    await lastOutput(page)
      .getByRole('link', { name: 'pearai-app ↗', exact: true })
      .getAttribute('href'),
    'https://github.com/MaxFSP/pearai-app',
  );
  await page.screenshot({ path: 'test-results/terminal-work.png' });
});

test('unknown commands, missing files, and markup are handled as plain text', async (t) => {
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

test('contact links and clipboard copy use the correct email', async (t) => {
  const { page, context } = await openPage(t);
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await run(page, 'contact');
  await page.getByRole('button', { name: '[ copy email ]', exact: true }).click();
  await page.getByRole('button', { name: '[ copied ]', exact: true }).waitFor();
  assert.equal(
    await page.evaluate(() => navigator.clipboard.readText()),
    'maximiliano.farfansp@gmail.com',
  );
  assert.equal(
    await lastOutput(page)
      .getByRole('link', { name: '[ send email ]', exact: true })
      .getAttribute('href'),
    'mailto:maximiliano.farfansp@gmail.com',
  );
});

test('clipboard denial leaves a usable email link and clear fallback', async (t) => {
  const { page } = await openPage(t);
  await page.evaluate(() =>
    Object.defineProperty(navigator.clipboard, 'writeText', {
      value: () => Promise.reject(new Error('Denied')),
    }),
  );
  await run(page, 'contact');
  await page.getByRole('button', { name: '[ copy email ]', exact: true }).click();
  await page.getByText('Clipboard unavailable.', { exact: false }).waitFor();
  assert.equal(
    await lastOutput(page)
      .getByRole('link', { name: profileEmail(), exact: true })
      .getAttribute('href'),
    'mailto:' + profileEmail(),
  );
});

function profileEmail() {
  return 'maximiliano.farfansp@gmail.com';
}

test('resume links download the actual PDF', async (t) => {
  const { page } = await openPage(t);
  const download = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download résumé', exact: true }).click();
  assert.equal((await download).suggestedFilename(), 'Santiago-Paz-Farfan-Resume.pdf');
  const response = await page.request.get(url + '/resume.pdf');
  assert.equal(response.status(), 200);
  assert.equal((await response.body()).subarray(0, 5).toString(), '%PDF-');
  await run(page, 'resume');
  assert.ok(
    await lastOutput(page).getByRole('link', { name: 'Download resume.pdf ↓' }).isVisible(),
  );
});

test('mobile navigation and project reading work without typing', async (t) => {
  const { page } = await openPage(t, {
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  await page.getByRole('navigation').getByRole('button', { name: 'work', exact: true }).tap();
  await page
    .getByRole('button', { name: 'Read Healthcare audio uploads', exact: true })
    .last()
    .tap();
  assert.match(await lastOutput(page).innerText(), /Healthcare audio uploads/);
  assert.ok(await page.getByRole('textbox', { name: 'Terminal command' }).isVisible());
  await page.getByRole('navigation').getByRole('button', { name: 'contact', exact: true }).tap();
  assert.ok(
    await lastOutput(page)
      .getByRole('link', { name: /send email/ })
      .isVisible(),
  );
  await page.screenshot({ path: 'test-results/terminal-mobile-contact.png' });
});

test('terminal fits phone through wide-screen widths and short viewports', async (t) => {
  const { page } = await openPage(t);
  for (const theme of ['dark', 'amber', 'phosphor', 'paper', 'light']) {
    await page.getByRole('combobox', { name: 'Terminal theme' }).selectOption(theme);
    for (const width of [320, 375, 390, 600, 768, 960, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 844 });
      assert.ok(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        theme + ': no horizontal page overflow at ' + width,
      );
      assert.ok(
        await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight),
        theme + ': no vertical page overflow at ' + width,
      );
      assert.ok(
        await page
          .locator('.terminal-scroll')
          .evaluate((element) => element.scrollWidth <= element.clientWidth),
        theme + ': output fits at ' + width,
      );
    }
  }
  await page.setViewportSize({ width: 390, height: 420 });
  await run(page, 'experience');
  const box = await page.getByRole('textbox', { name: 'Terminal command' }).boundingBox();
  assert.ok(
    box.y >= 0 && box.y + box.height <= 420,
    'Prompt stays above the bottom of a short viewport',
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(url);
  await page.screenshot({ path: 'test-results/terminal-mobile.png' });
});

test('direct links load the requested content and keyboard shortcut focuses the prompt', async (t) => {
  const { page } = await openPage(t);
  await page.goto(url + '/#experience');
  await page.reload();
  assert.match(await lastOutput(page).innerText(), /Expected 2028/);
  await page.getByRole('navigation').getByRole('button', { name: 'help', exact: true }).click();
  await page.keyboard.press('Control+k');
  assert.ok(
    await page
      .getByRole('textbox', { name: 'Terminal command' })
      .evaluate((element) => element === document.activeElement),
  );
  await run(page, 'open about');
  assert.equal(new URL(page.url()).hash, '#about');
});

test('long output scrolls inside the terminal and new responses remain readable', async (t) => {
  const { page } = await openPage(t, { viewport: { width: 390, height: 640 } });
  await run(page, 'experience');
  assert.ok(
    await page
      .locator('.terminal-scroll')
      .evaluate((element) => element.scrollHeight > element.clientHeight),
  );
  await run(page, 'pwd');
  assert.ok(await lastOutput(page).isVisible());
  const outputBox = await lastOutput(page).boundingBox();
  const inputBox = await page.locator('.prompt-line').boundingBox();
  assert.ok(
    outputBox.y >= 0 && outputBox.y + outputBox.height <= inputBox.y,
    'New output is visible above the prompt',
  );
  await page.setViewportSize({ width: 320, height: 500 });
  await page.waitForFunction(
    () =>
      document.querySelector('.transcript-entry:last-child .command-output').getBoundingClientRect()
        .bottom <=
      document.querySelector('.prompt-line').getBoundingClientRect().top + 1,
  );
});

for (const theme of ['dark', 'light', 'amber', 'phosphor', 'paper']) {
  test(theme + ' terminal passes automated WCAG accessibility checks', async (t) => {
    const { page } = await openPage(t);
    await page.getByRole('combobox', { name: 'Terminal theme' }).selectOption(theme);
    for (const command of [null, 'work healthcare', 'help', 'contact', 'theme', 'man theme']) {
      if (command) await run(page, command);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      assert.deepEqual(
        results.violations.map(({ id, nodes }) => ({
          id,
          elements: nodes.map((node) => ({ html: node.html, failure: node.failureSummary })),
        })),
        [],
      );
    }
  });
}

test('inline prompt keeps native editing and a block cursor without textbox chrome', async (t) => {
  const { page } = await openPage(t);
  const input = page.getByRole('textbox', { name: 'Terminal command' });
  await input.fill('whoami');
  await input.press('Home');
  await input.press('ArrowRight');
  assert.equal(await input.evaluate((element) => element.selectionStart), 1);
  assert.equal(await page.locator('.block-cursor').textContent(), 'h');
  await input.press('x');
  assert.equal(await input.inputValue(), 'wxhoami');
  await input.press('Backspace');
  assert.equal(await input.inputValue(), 'whoami');
  assert.equal(await input.evaluate((element) => getComputedStyle(element).boxShadow), 'none');
  assert.equal(
    await page
      .locator('.block-cursor')
      .evaluate((element) => getComputedStyle(element).animationName),
    'none',
    'Reduced motion stops cursor blinking',
  );
  await input.fill('cat ' + 'long-command-'.repeat(50) + 'é🦊');
  await input.press('End');
  assert.equal(await input.inputValue(), 'cat ' + 'long-command-'.repeat(50) + 'é🦊');
  assert.ok(
    await input.evaluate((element) => element.scrollLeft > 0),
    'Long commands scroll within the native input',
  );
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
});

test('inline suggestions accept with Right Arrow without interfering with cursor editing', async (t) => {
  const { page } = await openPage(t);
  const input = page.getByRole('textbox', { name: 'Terminal command' });
  await input.fill('exp');
  assert.equal(await page.locator('.ghost-suggestion').textContent(), 'rience');
  await input.press('ArrowRight');
  assert.equal(await input.inputValue(), 'experience');
  await input.press('Home');
  await input.press('ArrowRight');
  assert.equal(await input.evaluate((element) => element.selectionStart), 1);
  assert.equal(await input.inputValue(), 'experience');
  await run(page, 'cat work/pearai.md');
  await input.fill('cat w');
  await input.press('ArrowRight');
  assert.equal(
    await input.inputValue(),
    'cat work/pearai.md',
    'Recent matching history takes priority',
  );
});

test('Tab lists ambiguous completions and keyboard selection fills without executing', async (t) => {
  const { page } = await openPage(t);
  const input = page.getByRole('textbox', { name: 'Terminal command' });
  await input.fill('cat');
  await input.press('Tab');
  const options = page.getByRole('group', { name: 'Command completions' });
  assert.ok(await options.isVisible());
  assert.ok((await options.getByRole('button').count()) > 1);
  const entryCount = await page.locator('.transcript-entry').count();
  await input.press('Tab');
  assert.ok(
    await options
      .getByRole('button')
      .first()
      .evaluate((element) => element === document.activeElement),
  );
  await page.keyboard.press('Enter');
  assert.equal(await input.inputValue(), 'cat about.txt');
  assert.equal(await page.locator('.transcript-entry').count(), entryCount);
  assert.equal(await options.count(), 0);
  await input.fill('cat');
  await input.press('Tab');
  await input.press('Escape');
  assert.equal(await options.count(), 0);
  assert.equal(await input.inputValue(), 'cat');
});

test('Ctrl+R searches, cycles, selects, and cancels session history', async (t) => {
  const { page } = await openPage(t);
  const input = page.getByRole('textbox', { name: 'Terminal command' });
  await run(page, 'cat work/pearai.md');
  await run(page, 'cat work/healthcare-audio.md');
  await input.fill('unfinished draft');
  await input.press('Control+r');
  const search = page.getByRole('textbox', { name: 'Search command history' });
  await search.fill('work/');
  assert.match(await page.locator('.history-search').innerText(), /healthcare-audio/);
  await search.press('Control+r');
  assert.match(await page.locator('.history-search').innerText(), /pearai/);
  await search.press('Enter');
  assert.equal(await input.inputValue(), 'cat work/pearai.md');
  assert.equal(
    await page.locator('.transcript-entry').count(),
    4,
    'Selecting history does not execute it',
  );
  await input.fill('keep this draft');
  await input.press('Control+r');
  await search.fill('missing-history-item');
  assert.match(await page.locator('.history-search').innerText(), /No matching commands/);
  await search.press('Escape');
  assert.equal(await input.inputValue(), 'keep this draft');
});

test('tree renders actual portfolio files and opens notes from both directories', async (t) => {
  const { page } = await openPage(t);
  await run(page, 'tree');
  const tree = lastOutput(page);
  assert.match(await tree.innerText(), /1 directory, 10 files/);
  assert.ok(await tree.getByRole('button', { name: 'about.txt', exact: true }).isVisible());
  await tree.getByRole('button', { name: 'Read PearAI contributions', exact: true }).click();
  assert.match(await lastOutput(page).innerText(), /PearAI contributions/);
  await run(page, 'cd work');
  await run(page, 'tree');
  assert.match(await lastOutput(page).innerText(), /0 directories, 5 files/);
  assert.equal(
    await lastOutput(page).getByRole('button', { name: 'about.txt', exact: true }).count(),
    0,
  );
  await run(page, 'tree missing');
  assert.match(await lastOutput(page).innerText(), /no such directory/);
});

test('history lists real session commands and remains available after clear', async (t) => {
  const { page } = await openPage(t);
  await run(page, 'skills');
  await run(page, 'pwd');
  await run(page, 'clear');
  await run(page, 'history');
  assert.match(
    await lastOutput(page).innerText(),
    /1  skills\n\s*2  pwd\n\s*3  clear\n\s*4  history/,
  );
});

test('all five themes can be selected and restored after reload', async (t) => {
  const { page } = await openPage(t);
  const picker = page.getByRole('combobox', { name: 'Terminal theme' });
  assert.equal(await picker.getByRole('option').count(), 5);
  for (const theme of ['dark', 'amber', 'phosphor', 'paper', 'light']) {
    await picker.selectOption(theme);
    await page.reload();
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('html').getAttribute('data-theme'), theme);
    assert.equal(await picker.inputValue(), theme);
    assert.equal(
      await page.evaluate(() => localStorage.getItem('portfolio-terminal-theme')),
      theme,
    );
    if (theme === 'amber' || theme === 'phosphor') {
      assert.match(
        await page
          .locator('.terminal-scroll')
          .evaluate((element) => getComputedStyle(element).fontFamily),
        /VT323/,
      );
      assert.ok(await page.evaluate(() => document.fonts.check('21px VT323')));
    }
    await page.screenshot({ path: 'test-results/theme-' + theme + '.png' });
  }
});

test('theme commands, aliases, and clickable choices agree with the header', async (t) => {
  const { page } = await openPage(t);
  await run(page, 'theme');
  assert.match(await lastOutput(page).innerText(), /Amber phosphor/);
  await lastOutput(page)
    .getByRole('button', { name: 'Apply Amber CRT theme', exact: true })
    .click();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'amber');
  assert.equal(await page.getByRole('combobox', { name: 'Terminal theme' }).inputValue(), 'amber');
  assert.equal(
    await lastOutput(page)
      .getByRole('button', { name: 'Apply Amber CRT theme', exact: true })
      .getAttribute('aria-pressed'),
    'true',
  );
  for (const [command, expected] of [
    ['theme green', 'phosphor'],
    ['theme black', 'dark'],
    ['theme retro', 'amber'],
    ['theme paper', 'paper'],
    ['theme light', 'light'],
  ]) {
    await run(page, command);
    assert.equal(await page.locator('html').getAttribute('data-theme'), expected);
  }
  await run(page, 'theme constructor');
  assert.match(await lastOutput(page).innerText(), /Usage: theme/);
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
  await run(page, 'theme list');
  assert.equal(
    await lastOutput(page)
      .getByRole('button', { name: /^Apply / })
      .count(),
    5,
  );
  const input = page.getByRole('textbox', { name: 'Terminal command' });
  await input.fill('theme a');
  await input.press('Tab');
  assert.equal(await input.inputValue(), 'theme amber');
});

test('CRT scanlines and glow are optional, static, and persist independently of the palette', async (t) => {
  const { page } = await openPage(t);
  await run(page, 'theme amber');
  assert.equal(
    await page
      .locator('.terminal-app')
      .evaluate((element) => getComputedStyle(element, '::after').pointerEvents),
    'none',
  );
  assert.equal(
    await page
      .locator('.terminal-app')
      .evaluate((element) => getComputedStyle(element, '::after').animationName),
    'none',
  );
  assert.notEqual(
    await page
      .locator('.terminal-scroll')
      .evaluate((element) => getComputedStyle(element).textShadow),
    'none',
  );
  await run(page, 'crt off');
  assert.equal(await page.locator('html').getAttribute('data-crt'), 'off');
  assert.equal(
    await page
      .locator('.terminal-scroll')
      .evaluate((element) => getComputedStyle(element).textShadow),
    'none',
  );
  assert.equal(
    await page
      .locator('.terminal-app')
      .evaluate((element) => getComputedStyle(element, '::after').content),
    'none',
  );
  await page.reload();
  assert.equal(await page.locator('html').getAttribute('data-crt'), 'off');
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'amber');
  await run(page, 'theme phosphor');
  assert.equal(await page.locator('html').getAttribute('data-crt'), 'off');
  await run(page, 'theme');
  await lastOutput(page).getByRole('button', { name: 'CRT effects', exact: true }).click();
  assert.equal(await page.locator('html').getAttribute('data-crt'), 'on');
  await run(page, 'theme dark');
  assert.notEqual(
    await page
      .locator('.terminal-app')
      .evaluate((element) => getComputedStyle(element, '::after').content),
    'none',
  );
  await run(page, 'crt off');
  assert.equal(
    await page
      .locator('.terminal-app')
      .evaluate((element) => getComputedStyle(element, '::after').content),
    'none',
  );
  await run(page, 'crt invalid');
  assert.match(await lastOutput(page).innerText(), /Usage: crt/);
});

test('man pages explain commands, run examples, and handle missing topics', async (t) => {
  const { page } = await openPage(t);
  await run(page, 'man');
  assert.ok(await lastOutput(page).getByRole('heading', { name: 'Manual pages' }).isVisible());
  await lastOutput(page).getByRole('button', { name: 'theme', exact: true }).click();
  assert.match(await lastOutput(page).innerText(), /theme\(1\)/);
  assert.match(
    await lastOutput(page).innerText(),
    /theme \[dark\|amber\|phosphor\|paper\|light\|list\]/,
  );
  await lastOutput(page).getByRole('button', { name: 'theme amber', exact: true }).click();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'amber');
  await run(page, 'man history');
  assert.match(await lastOutput(page).innerText(), /Ctrl\+R/);
  await run(page, 'man missing');
  assert.match(await lastOutput(page).innerText(), /No manual entry for missing/);
  await run(page, 'man constructor');
  assert.match(await lastOutput(page).innerText(), /No manual entry for constructor/);
});

test('!! repeats the expanded command without recursive history entries', async (t) => {
  const { page } = await openPage(t);
  await run(page, '!!');
  assert.match(await lastOutput(page).innerText(), /no previous command/);
  await run(page, 'pwd');
  const expected = await lastOutput(page).innerText();
  await run(page, '!!');
  assert.equal(await lastOutput(page).innerText(), expected);
  await run(page, '!!');
  assert.equal(await lastOutput(page).innerText(), expected);
  await run(page, 'history');
  assert.match(await lastOutput(page).innerText(), /1  pwd\n\s*2  pwd\n\s*3  pwd\n\s*4  history/);
  await run(page, 'man !!');
  assert.match(await lastOutput(page).innerText(), /Run the last command again/);
});

test('less supports paging, literal search, next matches, and keyboard exit', async (t) => {
  const { page } = await openPage(t, { viewport: { width: 390, height: 640 } });
  await run(page, 'less experience.txt');
  const reader = page.getByRole('region', { name: 'File reader', exact: true });
  assert.ok(await reader.isVisible());
  await page.keyboard.press('G');
  await page.waitForFunction(() => document.querySelector('.pager-content').scrollTop > 0);
  await page.keyboard.press('g');
  await page.waitForFunction(() => document.querySelector('.pager-content').scrollTop === 0);
  await page.keyboard.press('/');
  const search = page.getByRole('textbox', { name: 'Search this file' });
  await search.fill('AWS');
  await search.press('Enter');
  assert.match(await page.locator('.pager-search [role="status"]').innerText(), /1\//);
  const first = await page.locator('.selected-match').getAttribute('data-line');
  await page.keyboard.press('n');
  assert.notEqual(await page.locator('.selected-match').getAttribute('data-line'), first);
  await page.keyboard.press('N');
  assert.equal(await page.locator('.selected-match').getAttribute('data-line'), first);
  await page.keyboard.press('/');
  await search.fill('q');
  assert.ok(await reader.isVisible(), 'Typing q in the search box does not exit');
  await search.press('Escape');
  await page.keyboard.press('q');
  assert.equal(await reader.count(), 0);
  await page.waitForFunction(() => document.activeElement?.id === 'command-input');
  assert.ok(
    await page
      .getByRole('textbox', { name: 'Terminal command' })
      .evaluate((element) => element === document.activeElement),
  );
});

test('less resolves relative work files and missing files return useful errors', async (t) => {
  const { page } = await openPage(t);
  await run(page, 'less missing.txt');
  assert.match(await lastOutput(page).innerText(), /no such file/);
  await run(page, 'cd work');
  await run(page, 'less healthcare-audio.md');
  assert.match(await page.locator('.pager-content').innerText(), /file integrity/);
  await page.getByRole('button', { name: 'Close reader' }).click();
  await run(page, 'less ../skills.txt');
  assert.match(await page.locator('.pager-content').innerText(), /DynamoDB/);
  await page.keyboard.press('Escape');
  assert.match(await page.locator('.command-form').innerText(), /~\/work/);
});

test('grep searches actual files, supports phrases and scopes, and opens results', async (t) => {
  const { page } = await openPage(t);
  await run(page, 'grep "AWS Lambda" work/');
  const output = lastOutput(page);
  assert.ok((await output.locator('.grep-hit').count()) > 0);
  assert.ok(
    (await output.locator('.grep-hit .file-link').allTextContents()).every((path) =>
      path.startsWith('work/'),
    ),
  );
  await output.locator('.grep-hit .file-link').first().click();
  assert.ok(await page.getByRole('region', { name: 'File reader' }).isVisible());
  await page.keyboard.press('q');
  await run(page, 'grep -i python skills.txt');
  assert.match(await lastOutput(page).innerText(), /Python/);
  assert.ok(
    (await lastOutput(page).locator('.grep-hit .file-link').allTextContents()).every((path) =>
      path.startsWith('skills.txt:'),
    ),
  );
  await run(page, 'grep impossible-pattern-9284');
  assert.match(await lastOutput(page).innerText(), /0 matching lines/);
});

test('grep handles quotes and markup without evaluating input', async (t) => {
  const { page } = await openPage(t);
  await run(page, 'grep "unfinished phrase');
  assert.match(await lastOutput(page).innerText(), /Usage: grep/);
  await run(page, 'grep -i AWS missing.txt');
  assert.match(await lastOutput(page).innerText(), /no such file/);
  await run(page, 'grep "<script>alert(1)</script>"');
  assert.match(await lastOutput(page).innerText(), /No matches/);
  assert.equal(await page.locator('.grep-output script').count(), 0);
});

test('share copies direct project links that restore project and language after reload', async (t) => {
  const { page, context } = await openPage(t);
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await run(page, 'share healthcare');
  await lastOutput(page).getByText('Project link copied.', { exact: true }).waitFor();
  const link = await page.evaluate(() => navigator.clipboard.readText());
  assert.equal(new URL(link).hash, '#work/healthcare');
  await page.goto(link);
  assert.match(await lastOutput(page).innerText(), /Healthcare audio uploads/);
  assert.equal(await page.locator('.transcript-entry').count(), 1);
  await run(page, 'lang es');
  await run(page, 'share pearai');
  await lastOutput(page).getByText('Enlace del proyecto copiado.', { exact: true }).waitFor();
  const spanish = await page.evaluate(() => navigator.clipboard.readText());
  assert.equal(new URL(spanish).searchParams.get('lang'), 'es');
  await page.goto(spanish);
  assert.equal(await page.locator('html').getAttribute('lang'), 'es');
  assert.match(await lastOutput(page).innerText(), /Contribuciones a PearAI/);
});

test('share keeps a selectable link when clipboard permission is denied', async (t) => {
  const { page } = await openPage(t);
  await page.evaluate(() =>
    Object.defineProperty(navigator.clipboard, 'writeText', {
      value: () => Promise.reject(new Error('Denied')),
    }),
  );
  await run(page, 'share healthcare');
  await lastOutput(page).getByText('Clipboard unavailable.', { exact: false }).waitFor();
  assert.match(await lastOutput(page).getByRole('link').getAttribute('href'), /#work\/healthcare$/);
  await run(page, 'share missing');
  assert.match(await lastOutput(page).innerText(), /Usage: share/);
});

test('session tabs isolate directories, history, output, and unfinished drafts', async (t) => {
  const { page } = await openPage(t);
  await run(page, 'cd work');
  await run(page, 'pwd');
  const input = page.getByRole('textbox', { name: 'Terminal command' });
  await input.fill('first draft');
  await page.getByRole('button', { name: 'New terminal session' }).click();
  assert.equal(await input.inputValue(), '');
  assert.equal(await page.locator('.transcript-entry').count(), 0);
  await run(page, 'skills');
  await run(page, 'pwd');
  assert.equal(await lastOutput(page).innerText(), '/home/maxfsp/portfolio');
  await input.fill('second draft');
  await page.getByRole('tab', { name: /shell 1/ }).click();
  assert.equal(await input.inputValue(), 'first draft');
  assert.match(await page.locator('.command-form').innerText(), /~\/work/);
  await run(page, 'history');
  assert.match(await lastOutput(page).innerText(), /cd work/);
  assert.doesNotMatch(await lastOutput(page).innerText(), /skills/);
  await page.getByRole('tab', { name: /shell 2/ }).click();
  assert.equal(await input.inputValue(), 'second draft');
  await page.keyboard.press('ArrowLeft');
  assert.equal(
    await page.getByRole('tab', { name: /shell 1/ }).getAttribute('aria-selected'),
    'true',
  );
  await page.getByRole('button', { name: 'Close current session' }).click();
  assert.equal(await page.getByRole('tab').count(), 1);
  assert.equal(
    await page.getByRole('button', { name: 'Close current session' }).isDisabled(),
    true,
  );
});

test('tab commands respect the session limit and preserve close-command history', async (t) => {
  const { page } = await openPage(t);
  await run(page, 'tab new research');
  assert.ok(await page.getByRole('tab', { name: /research/ }).isVisible());
  await run(page, 'tab switch 1');
  await run(page, 'tab close 2');
  await run(page, 'history');
  assert.match(await lastOutput(page).innerText(), /tab close 2/);
  for (let index = 0; index < 7; index++)
    await page.getByRole('button', { name: 'New terminal session' }).click();
  assert.equal(await page.getByRole('tab').count(), 8);
  assert.ok(await page.getByRole('button', { name: 'New terminal session' }).isDisabled());
  await run(page, 'tab new extra');
  assert.match(await lastOutput(page).innerText(), /Maximum 8 sessions/);
});

test('optional demo is hidden from normal split and still verifies real chunk integrity', async (t) => {
  const { page } = await openPage(t);
  await run(page, 'split on');
  const lab = page.getByRole('complementary', { name: 'Standalone chunking demo' });
  assert.equal(await lab.count(), 0);
  assert.ok(await page.getByRole('complementary', { name: 'Reference pane' }).isVisible());
  await run(page, 'demo chunks');
  await lab.waitFor();
  assert.ok(await lab.isVisible());
  assert.match(await lastOutput(page).innerText(), /Chunking lab opened/);
  await lab
    .getByRole('textbox', { name: 'Demo payload' })
    .fill('Hola, Santiago. UTF-8: á ñ 🦊 '.repeat(5));
  await lab.getByRole('button', { name: 'Split & verify', exact: true }).click();
  await lab.getByText('Integrity verified', { exact: true }).waitFor();
  const hashes = await lab.locator('.digest').allTextContents();
  assert.equal(hashes[0], hashes[1]);
  assert.match(hashes[0], /^[a-f0-9]{64}$/);
  assert.ok((await lab.locator('.chunk-list > div').count()) > 1);
  await lab.getByRole('checkbox', { name: 'Corrupt last chunk' }).check();
  await lab.getByRole('button', { name: 'Split & verify', exact: true }).click();
  await lab.getByText('Integrity check failed', { exact: true }).waitFor();
  const corrupted = await lab.locator('.digest').allTextContents();
  assert.notEqual(corrupted[0], corrupted[1]);
  await page.screenshot({ path: 'test-results/split-demo.png' });
  await run(page, 'split off');
  assert.equal(await lab.count(), 0);
});

test('mobile split panes stay within the viewport and split state belongs to its session', async (t) => {
  const { page } = await openPage(t, {
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  await page.getByRole('button', { name: 'Toggle split pane' }).tap();
  const terminal = await page.locator('.terminal-scroll').boundingBox();
  const lab = await page.locator('.reference-panel').boundingBox();
  assert.ok(lab.y >= terminal.y + terminal.height - 2, 'Panes stack vertically on mobile');
  await page.getByRole('button', { name: 'New terminal session' }).tap();
  assert.equal(await page.locator('.reference-panel').count(), 0);
  await page.getByRole('tab', { name: /shell 1/ }).tap();
  assert.equal(await page.locator('.reference-panel').count(), 1);
  await page.setViewportSize({ width: 390, height: 420 });
  assert.ok(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight));
  await page.waitForFunction(
    () => !document.querySelector('.reference-panel .pager-controls').textContent.includes('(END)'),
  );
  assert.ok(await page.getByRole('textbox', { name: 'Terminal command' }).isVisible());
});

test('Snake scores, pauses across sessions, resumes, and handles a wall collision', async (t) => {
  const { page } = await openPage(t);
  await run(page, 'snake');
  const game = page.getByRole('region', { name: 'Snake game' });
  await game.getByRole('button', { name: 'Start', exact: true }).click();
  await page.waitForFunction(
    () => /Score: [1-9]/.test(document.querySelector('.snake-score').textContent),
    null,
    { timeout: 5000 },
  );
  await game.getByRole('button', { name: 'Pause', exact: true }).click();
  assert.match(await page.locator('.snake-score').innerText(), /Paused/);
  const board = await page.locator('.snake-board').innerHTML();
  await page.getByRole('button', { name: 'New terminal session' }).click();
  await page.getByRole('tab', { name: /shell 1/ }).click();
  assert.match(await page.locator('.snake-score').innerText(), /Paused/);
  assert.equal(await page.locator('.snake-board').innerHTML(), board);
  await game.getByRole('button', { name: 'Resume', exact: true }).click();
  await page.waitForFunction(
    () => document.querySelector('.snake-score').textContent.includes('Game over'),
    null,
    { timeout: 5000 },
  );
  await page.keyboard.press('r');
  assert.match(await page.locator('.snake-score').innerText(), /Score: 0 \/ Playing/);
  await page.keyboard.press('q');
  assert.equal(await game.count(), 0);
  assert.ok(await page.getByRole('textbox', { name: 'Terminal command' }).isVisible());
});

test('Spanish localizes portfolio documents, search, manuals, controls, and persists', async (t) => {
  const { page } = await openPage(t);
  await run(page, 'lang es');
  assert.equal(await page.locator('html').getAttribute('lang'), 'es');
  await run(page, 'work healthcare');
  assert.match(await lastOutput(page).innerText(), /Carga de audio para una plataforma de salud/);
  assert.match(await lastOutput(page).innerText(), /validación en AWS Lambda/);
  await run(page, 'grep -i integridad');
  assert.match(await lastOutput(page).innerText(), /líneas encontradas/);
  assert.ok((await lastOutput(page).locator('.grep-hit').count()) > 0);
  await run(page, 'less work/healthcare-audio.md');
  assert.ok(await page.getByRole('region', { name: 'Lector de archivos' }).isVisible());
  await page.getByRole('button', { name: 'Cerrar lector' }).click();
  await run(page, 'man less');
  assert.match(await lastOutput(page).innerText(), /Abre un archivo en el lector/);
  await page.reload();
  assert.equal(await page.locator('html').getAttribute('lang'), 'es');
  assert.ok(await page.getByRole('combobox', { name: 'Idioma' }).isVisible());
  await page.getByRole('combobox', { name: 'Idioma' }).selectOption('en');
  assert.equal(await page.locator('html').getAttribute('lang'), 'en');
});

test('CRT has meaningful live presets, independent intensity controls, and persistence', async (t) => {
  const { page } = await openPage(t);
  await run(page, 'crt');
  await lastOutput(page).getByRole('button', { name: 'Soft', exact: true }).click();
  const soft = await page
    .locator('.terminal-scroll')
    .evaluate((element) => getComputedStyle(element).textShadow);
  await lastOutput(page).getByRole('button', { name: 'Strong', exact: true }).click();
  const strong = await page
    .locator('.terminal-scroll')
    .evaluate((element) => getComputedStyle(element).textShadow);
  assert.notEqual(soft, strong);
  assert.notEqual(strong, 'none');
  await lastOutput(page)
    .getByRole('slider', { name: /Scanlines/ })
    .focus();
  await page.keyboard.press('End');
  assert.equal(
    await lastOutput(page)
      .getByRole('slider', { name: /Scanlines/ })
      .inputValue(),
    '100',
  );
  await run(page, 'crt glow 40');
  await page.reload();
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('portfolio-crt-settings')),
  );
  assert.equal(saved.scanlines, 100);
  assert.equal(saved.glow, 40);
  assert.equal(saved.allDark, true);
  await run(page, 'crt glow 200');
  assert.match(await lastOutput(page).innerText(), /Usage: crt/);
  await run(page, 'crt off');
  assert.equal(
    await page
      .locator('.terminal-scroll')
      .evaluate((element) => getComputedStyle(element).textShadow),
    'none',
  );
});

test('new reader, demo, game, and Spanish interfaces pass automated accessibility checks', async (t) => {
  const { page } = await openPage(t);
  const check = async () => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    assert.deepEqual(
      results.violations.map(({ id, nodes }) => ({
        id,
        elements: nodes.map((node) => ({ html: node.html, failure: node.failureSummary })),
      })),
      [],
    );
  };
  await run(page, 'split on');
  await check();
  await run(page, 'less experience.txt');
  await check();
  await page.getByRole('button', { name: 'Close reader' }).click();
  await run(page, 'split off');
  await run(page, 'snake');
  await check();
  await page.getByRole('button', { name: 'Close Snake' }).click();
  await run(page, 'lang es');
  await run(page, 'work');
  await check();
  await run(page, 'crt');
  await check();
});

test('shell renaming preserves drafts, output, directory, and history with visible controls', async (t) => {
  const { page } = await openPage(t);
  await run(page, 'cd work');
  await run(page, 'pwd');
  const output = await page.locator('.transcript').innerText();
  await page.locator('#command-input').fill('unfinished draft');
  await page.getByRole('button', { name: 'Rename current session' }).click();
  const name = page.getByRole('textbox', { name: 'Shell name' });
  await name.fill('Client Work');
  await name.press('Enter');
  assert.ok(await page.getByRole('tab', { name: /Client Work/ }).isVisible());
  assert.equal(await page.locator('#command-input').inputValue(), 'unfinished draft');
  assert.equal(await page.locator('.transcript').innerText(), output);
  assert.match(await page.locator('.command-form').innerText(), /~\/work/);
  await page.getByRole('tab', { name: /Client Work/ }).press('F2');
  await name.fill('   ');
  await name.press('Enter');
  assert.match(await page.getByRole('alert').innerText(), /1–24/);
  await name.fill('Discard this');
  await name.press('Escape');
  assert.equal(await name.count(), 0);
  assert.ok(await page.getByRole('tab', { name: /Client Work/ }).isVisible());
  await run(page, 'history');
  assert.match(await lastOutput(page).innerText(), /cd work\n.*pwd/);
});

test('tab rename preserves case, validates names, and double-click targets the chosen shell', async (t) => {
  const { page } = await openPage(t);
  await run(page, 'tab rename "Main Work"');
  assert.ok(await page.getByRole('tab', { name: /Main Work/ }).isVisible());
  await run(page, 'tab rename');
  assert.match(await lastOutput(page).innerText(), /Usage: tab rename/);
  await run(page, 'tab rename ' + 'x'.repeat(25));
  assert.match(await lastOutput(page).innerText(), /1–24/);
  await run(page, 'tab new second');
  await page.getByRole('tab', { name: /Main Work/ }).dblclick();
  const name = page.getByRole('textbox', { name: 'Shell name' });
  await name.fill('Review');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  assert.equal(
    await page.getByRole('tab', { name: /Review/ }).getAttribute('aria-selected'),
    'true',
  );
  assert.ok(await page.getByRole('tab', { name: /second/ }).isVisible());
  await run(page, 'tab switch 2');
  await run(page, 'tab switch review');
  assert.equal(
    await page.getByRole('tab', { name: /Review/ }).getAttribute('aria-selected'),
    'true',
  );
});

test('split references are searchable and session-specific without replacing terminal output', async (t) => {
  const { page } = await openPage(t);
  await run(page, 'skills');
  await run(page, 'split experience.txt');
  const reference = page.getByRole('complementary', { name: 'Reference pane' });
  assert.match(await reference.innerText(), /Experience/);
  assert.match(await page.locator('.transcript').innerText(), /DynamoDB/);
  assert.ok(
    await page.locator('#command-input').evaluate((element) => element === document.activeElement),
  );
  await reference.getByRole('button', { name: '/ search', exact: true }).click();
  const search = reference.getByRole('textbox', { name: 'Search this file' });
  await search.fill('AWS');
  await search.press('Enter');
  assert.ok((await reference.locator('mark').count()) > 0);
  await page.getByRole('combobox', { name: 'Reference file' }).selectOption('contact.txt');
  assert.match(await reference.innerText(), /@/);
  await page.getByRole('button', { name: 'New terminal session' }).click();
  await run(page, 'split skills.txt');
  await page.getByRole('tab', { name: /shell 1/ }).click();
  assert.equal(
    await page.getByRole('combobox', { name: 'Reference file' }).inputValue(),
    'contact.txt',
  );
  await run(page, 'split missing.txt');
  assert.match(await lastOutput(page).innerText(), /no such file/);
  assert.equal(
    await page.getByRole('combobox', { name: 'Reference file' }).inputValue(),
    'contact.txt',
  );
  await reference.getByRole('button', { name: 'Close reference pane' }).click();
  assert.equal(await reference.count(), 0);
  await page.waitForFunction(() => document.activeElement?.id === 'command-input');
});

test('project split pins that note and Spanish rename controls fit a phone', async (t) => {
  const { page } = await openPage(t, { viewport: { width: 390, height: 720 } });
  await run(page, 'work pearai');
  await page.getByRole('button', { name: '[ split ]', exact: true }).click();
  assert.equal(
    await page.getByRole('combobox', { name: 'Reference file' }).inputValue(),
    'work/pearai.md',
  );
  await run(page, 'lang es');
  await page.getByRole('button', { name: 'Renombrar sesión actual' }).click();
  await page.getByRole('textbox', { name: 'Nombre de sesión' }).fill('Investigación');
  await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
    .then((result) => assert.deepEqual(result.violations, []));
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.getByRole('button', { name: 'Guardar', exact: true }).click();
  assert.ok(await page.getByRole('tab', { name: /Investigación/ }).isVisible());
  assert.ok(await page.getByRole('combobox', { name: 'Archivo de referencia' }).isVisible());
});

test('public work links verified MaxFSP repositories and stays available in files and Spanish', async (t) => {
  const { page } = await openPage(t);
  await run(page, 'work');
  const work = lastOutput(page);
  assert.ok(
    await work
      .getByRole('button', { name: 'Read PearAI Linux installer', exact: true })
      .isVisible(),
  );
  assert.ok(
    await work
      .getByRole('button', { name: 'Read A* pathfinding with UI', exact: true })
      .isVisible(),
  );
  await run(page, 'work pearai');
  const repositories = lastOutput(page).getByRole('group', { name: 'Project repositories' });
  assert.deepEqual(
    await repositories.getByRole('link').evaluateAll((links) => links.map((link) => link.href)),
    [
      'https://github.com/MaxFSP/pearai-app',
      'https://github.com/MaxFSP/pearai-submodule',
      'https://github.com/MaxFSP/pear-landing-page',
      'https://github.com/MaxFSP/pearai-documentation',
    ],
  );
  await run(page, 'work linux-installer');
  assert.equal(
    await lastOutput(page)
      .getByRole('link', { name: 'PearAI-linux-installer ↗' })
      .getAttribute('href'),
    'https://github.com/MaxFSP/PearAI-linux-installer',
  );
  await run(page, 'work pathfinding');
  assert.equal(
    await lastOutput(page)
      .getByRole('link', { name: 'A-star-pathfinding-with-UI ↗' })
      .getAttribute('href'),
    'https://github.com/MaxFSP/A-star-pathfinding-with-UI',
  );
  await page.reload();
  assert.match(await lastOutput(page).innerText(), /Pygame/);
  await run(page, 'less work/pathfinding.md');
  assert.match(
    await page.locator('.pager-content').innerText(),
    /https:\/\/github.com\/MaxFSP\/A-star-pathfinding-with-UI/,
  );
  await page.getByRole('button', { name: 'Close reader' }).click();
  await run(page, 'lang es');
  await run(page, 'work linux-installer');
  assert.match(await lastOutput(page).innerText(), /Instalador de PearAI para Linux/);
  assert.equal(
    await lastOutput(page).getByRole('link').getAttribute('href'),
    'https://github.com/MaxFSP/PearAI-linux-installer',
  );
});

test('header profile logos remain accessible and visible at phone widths in both languages', async (t) => {
  const { page } = await openPage(t);
  const header = page.locator('header');
  const github = header.getByRole('link', { name: 'GitHub profile', exact: true });
  const linkedin = header.getByRole('link', { name: 'LinkedIn profile', exact: true });
  assert.equal(await github.getAttribute('href'), 'https://github.com/MaxFSP');
  assert.equal(
    await linkedin.getAttribute('href'),
    'https://www.linkedin.com/in/maximiliano-paz-farf%C3%A1n-741b6b21b/',
  );
  assert.equal(await github.locator('svg').count(), 1);
  assert.equal(await linkedin.locator('svg').count(), 1);
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    for (const link of [github, linkedin]) {
      assert.ok(await link.isVisible());
      const box = await link.boundingBox();
      assert.ok(box.x >= 0 && box.x + box.width <= width);
      assert.equal(await link.getAttribute('target'), '_blank');
      assert.match(await link.getAttribute('rel'), /noopener/);
    }
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  }
  await run(page, 'lang es');
  assert.ok(await header.getByRole('link', { name: 'Perfil de GitHub' }).isVisible());
  assert.ok(await header.getByRole('link', { name: 'Perfil de LinkedIn' }).isVisible());
});
