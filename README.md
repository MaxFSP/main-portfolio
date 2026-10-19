# Santiago Paz Farfán — Portfolio

A terminal-inspired personal workspace built with React, TypeScript, and Vite. Includes a working portfolio shell, searchable command menu, light and dark themes, professional work notes, and a downloadable résumé. No backend, API keys, analytics, or external font requests are required.

## Develop

Use Node.js 22.12+ (Node 24 also works).

```sh
npm ci
npm run dev -- --port 5173 --strictPort
```

The development server binds to `0.0.0.0` for cloud development. Use the existing checkout; each cloud task is already isolated, so no Git worktree is needed.

## Build and validate

```sh
npm run build
npm test
npm run preview -- --port 4173 --strictPort
```

`npm test` builds the production site, starts its own preview server on port 4179, and runs 14 browser checks against that production build. It covers shell commands and history, persisted themes, responsive layouts, command navigation, modal focus, mobile navigation, clipboard success and failure, résumé downloads, direct section links, and automated WCAG checks in both themes. Browser screenshots are written to ignored `test-results/`.

The tests use `/usr/bin/chromium` when available. Else install the Playwright browser with `npx playwright install chromium`, or set `CHROMIUM_PATH` to a Chromium executable. Stop any unrelated server using test port 4179 first.

## Add your projects

Edit `src/content.ts` to add or update work notes. The initial professional entries describe contributions from the supplied résumé; their source code is proprietary. No recreation or live demo is presented as available. When independent recreations are ready, add their accurate descriptions and public repository or demo links.

Profile and email live in `src/content.ts`; the LinkedIn URL lives in `src/App.tsx`. Replace `public/resume.pdf` when updating your résumé. Themes and responsive styles live in `src/styles.css`.

## Terminal commands

`help`, `whoami`, `projects`, `experience`, `skills`, `contact`, `theme`, `clear`, and `open <section>` work in the shell. Arrow keys recall command history, and Tab completes an unambiguous command. Ctrl+K or Cmd+K opens the navigation menu. Every section is also accessible through ordinary links and buttons.

## Publish

Run `npm run build` and deploy the generated `dist/` directory to any static host. Relative asset paths support root or subdirectory hosting, including a GitHub Pages project path. The site has no server-side routing or deployment-specific secrets. Pushing to GitHub does not by itself publish a website; configure a static host separately.
