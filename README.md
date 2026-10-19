# Santiago Paz Farfán — Terminal portfolio

A browser-based portfolio shell built with React, TypeScript, and Vite. Black is the default. Work notes, experience, skills, and contact information are rendered as terminal output. Five themes are available: Black, Light, Amber CRT, Green CRT, and Paper. The retro consoles use a pixel typeface and optional static scanlines and glow. Fonts are local, and there is no backend or API-key requirement.

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

`npm test` builds production assets, starts a temporary preview on port 4179, and runs 30 browser checks. These cover the pure-black default, all five persisted themes and optional CRT effects, shell commands, directory and file handling, history and draft restoration, completion, inline suggestions, reverse history search, native text editing, file-tree navigation, keyboard shortcuts, clickable mobile navigation, clipboard success and failure, actual PDF downloads, direct links, scrolling, viewport sizes, command manuals, last-command expansion, and WCAG scans of all five themes. Screenshots are saved to ignored `test-results/`.

Tests use `/usr/bin/chromium` when available. Otherwise use `npx playwright install chromium`, or set `CHROMIUM_PATH` to an installed executable. Port 4179 must be available.

## Commands

- `whoami` or `about`: name, background, and profile links.
- `work` or `ls work/`: professional work and open-source contributions.
- `work healthcare`, `work real-estate`, `work pearai`: read a work note.
- `experience`, `skills`, `contact`, `resume`: corresponding content.
- `ls`, `pwd`, `cd work`, `cd ..`, `cat <filename>`: navigate portfolio files.
- `theme` or `theme list`: list themes with clickable choices. The header picker also switches themes.
- `theme dark`, `theme light`, `theme amber`, `theme phosphor`, `theme paper`: apply a theme. Aliases: `black`, `green`, and `retro`.
- `crt`, `crt on`, `crt off`: inspect or change static scanlines and glow. This preference is stored independently and only affects the two CRT themes.
- `man` or `man <command>`: read command syntax, behavior, and runnable examples.
- `!!`: repeat the last command. History records the expanded command, rather than the expansion token.
- `tree` or `tree work`: browse clickable files in a directory tree.
- `history`: list commands from the current session.
- `clear`: clear scrollback.
- `help`: commands and clickable filenames.

The inline prompt uses native text editing beneath a block cursor. Arrow keys recall command history and restore an unfinished draft. Right Arrow accepts a suggested command when the cursor is at the end. Tab completes a unique match or lists multiple choices; press Tab again to focus the choices and Enter to select one. Ctrl+R searches session history; repeat it to cycle matches, Enter selects a command for editing, and Escape restores the draft. Escape also dismisses completions or clears the input. Ctrl+L clears output when the prompt is focused; Ctrl+K or Cmd+K focuses the prompt. Cursor blinking stops when reduced motion is requested. All content can also be opened by clicking commands and filenames. This is a portfolio command interpreter, not a server shell.

## Content

Edit `src/content.ts` for work notes, profile links, skills, and employment history. Professional client source is private. Public recreations have not been presented as finished or available. Add accurate public repository or demo links when those projects exist.

Replace `public/resume.pdf` when updating your résumé. The shell and command handling live in `src/App.tsx`; the native input and cursor renderer live in `src/components/CommandInput.tsx`; appearance lives in `src/styles.css`. Theme metadata and aliases are in `src/themes.ts`; manuals are in `src/manual.ts`. Both IBM Plex Mono and VT323 are bundled locally.

## Cloudflare

Use `npm run build` as the build command and `dist` as the output directory. No runtime secrets or server-side routing are required. The user has deployed the project to Cloudflare; changes to `main` can trigger their connected deployment. Cloud deployment success must be verified separately from a local build or Git push.
