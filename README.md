# Santiago Paz Farfán — Terminal portfolio

A browser-based portfolio shell built with React, TypeScript, and Vite. Black is the default. Work notes, experience, skills, and contact information are rendered as terminal output. Light mode is an explicit option. Fonts are local, and there is no backend or API-key requirement.

## Develop

Use Node.js 22.12+ (Node 24 also works).

```sh
npm ci
npm run dev -- --port 5173 --strictPort
```

The development server binds to `0.0.0.0`. Use the existing checkout; each cloud task is already isolated, so no Git worktree is needed.

## Build and validate

```sh
npm run build
npm test
npm run preview -- --port 4173 --strictPort
```

`npm test` builds production assets, starts a temporary preview on port 4179, and runs 22 browser checks. These cover the pure-black default, persisted explicit themes, shell commands, directory and file handling, history and draft restoration, completion, inline suggestions, reverse history search, native text editing, file-tree navigation, keyboard shortcuts, clickable mobile navigation, clipboard success and failure, actual PDF downloads, direct links, scrolling, viewport sizes, and WCAG scans of both themes. Screenshots are saved to ignored `test-results/`.

Tests use `/usr/bin/chromium` when available. Otherwise use `npx playwright install chromium`, or set `CHROMIUM_PATH` to an installed executable. Port 4179 must be available.

## Commands

- `whoami` or `about`: name, background, and profile links.
- `work` or `ls work/`: professional work and open-source contributions.
- `work healthcare`, `work real-estate`, `work pearai`: read a work note.
- `experience`, `skills`, `contact`, `resume`: corresponding content.
- `ls`, `pwd`, `cd work`, `cd ..`, `cat <filename>`: navigate portfolio files.
- `theme`, `theme dark`, `theme light`: change appearance.
- `tree` or `tree work`: browse clickable files in a directory tree.
- `history`: list commands from the current session.
- `clear`: clear scrollback.
- `help`: commands and clickable filenames.

The inline prompt uses native text editing beneath a block cursor. Arrow keys recall command history and restore an unfinished draft. Right Arrow accepts a suggested command when the cursor is at the end. Tab completes a unique match or lists multiple choices; press Tab again to focus the choices and Enter to select one. Ctrl+R searches session history; repeat it to cycle matches, Enter selects a command for editing, and Escape restores the draft. Escape also dismisses completions or clears the input. Ctrl+L clears output when the prompt is focused; Ctrl+K or Cmd+K focuses the prompt. Cursor blinking stops when reduced motion is requested. All content can also be opened by clicking commands and filenames. This is a portfolio command interpreter, not a server shell.

## Content

Edit `src/content.ts` for work notes, profile links, skills, and employment history. Professional client source is private. Public recreations have not been presented as finished or available. Add accurate public repository or demo links when those projects exist.

Replace `public/resume.pdf` when updating your résumé. The shell and command handling live in `src/App.tsx`; the native input and cursor renderer live in `src/components/CommandInput.tsx`; appearance lives in `src/styles.css`.

## Cloudflare

Use `npm run build` as the build command and `dist` as the output directory. No runtime secrets or server-side routing are required. The user has deployed the project to Cloudflare; changes to `main` can trigger their connected deployment. Cloud deployment success must be verified separately from a local build or Git push.
