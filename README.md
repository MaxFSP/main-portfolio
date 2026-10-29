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

`npm test` builds production assets, starts a temporary preview on port 4179, and runs 59 browser checks. These cover the pure-black default, all five persisted themes and optional CRT effects, shell commands, directory and file handling, history and draft restoration, completion, inline suggestions, reverse history search, native text editing, file-tree navigation, keyboard shortcuts, clickable mobile navigation, clipboard success and failure, actual PDF downloads, direct links, scrolling, viewport sizes, command manuals, last-command expansion, file reading and search, independent sessions, shared links, Spanish content, real hash verification and failure handling, Snake gameplay, live CRT controls, and WCAG scans of all five themes and the new interfaces. Screenshots are saved to ignored `test-results/`.

Tests use `/usr/bin/chromium` when available. Otherwise use `npx playwright install chromium`, or set `CHROMIUM_PATH` to an installed executable. Port 4179 must be available.

## Commands

- `start` (or `tour`): open the four-step Start here walkthrough: background, selected case studies, verified PearAI work, and contact. Use Back/Next or select a step; Escape returns to the terminal. Each shell keeps its own open step. The bare site URL opens Start here by default; direct content links bypass the walkthrough. Closing it uses #terminal, so refreshing keeps the terminal open. #start reopens the introduction; new shells start at a prompt.
- `contributions [all|merged|open|closed]`: browse the reviewed PearAI record. Four merged highlights lead to all 16 verified authored PRs and a separately labelled 34-record attributed commit history. Review scope, sources, and gaps are recorded in [the contribution review](docs/pearai-contributions.md). This is a static snapshot reviewed on 2026-10-22, not a live GitHub feed.

- `whoami` or `about`: name, background, and profile links.
- `work` or `ls work/`: professional work and open-source contributions.
- `work healthcare`, `work real-estate`, `work pearai`, `work linux-installer`, `work pathfinding`: read a work note. Public notes include direct MaxFSP repository links.
- `experience`, `skills`, `contact`, `resume`: corresponding content. `skills React`, `skills Python`, and `skills AWS` connect skills to project examples; mapped skills are clickable. Public merged evidence is distinguished from résumé-based professional experience.
- `ls`, `pwd`, `cd work`, `cd ..`, `cat <filename>`: navigate portfolio files.
- `theme` or `theme list`: list themes with clickable choices. The header picker also switches themes.
- `theme dark`, `theme light`, `theme amber`, `theme phosphor`, `theme paper`: apply a theme. Aliases: `black`, `green`, and `retro`.
- `crt`: open live scanline and glow controls. `crt soft`, `crt strong`, `crt scanlines 60`, `crt glow 40`, and `crt off` work from the prompt. Explicit effects also work on Black. Settings persist; Light and Paper remain clean.
- `man` or `man <command>`: read command syntax, behavior, and runnable examples.
- `!!`: repeat the last command. History records the expanded command, rather than the expansion token.
- `tree` or `tree work`: browse clickable files in a directory tree.
- `history`: list commands from the current session.
- `less <file>`: open a full-pane reader; j/k or arrows scroll, Space pages, g/G jump to start/end, / searches, n/N cycle matching lines, and q or Escape exits. Search fields keep ordinary typing behavior.
- `grep [-i] <text> [file|work/]`: search literal text in the actual portfolio documents. Quote phrases. Results include file paths and line numbers; click one to read the file.
- `share <project>`: copy a direct project link, including the selected language. Clipboard failure leaves a visible, selectable link. With no argument, use this session’s last project.
- `tab new <name>`, `tab list`, `tab rename <name>`, `tab switch <id>`, `tab close <id>`: manage up to eight independent sessions. Rename also works through the visible rename control, double-click, or F2 on a tab. Names preserve case and accept 1–24 characters; renaming keeps drafts, history, and directory. The session bar supports the same actions. Arrow keys switch focused tabs. Each session retains its own input, directory, history, output, mode, split setting, and Snake board. Sessions reset on reload; the last session stays open.
- `split on` / `split off`: pin or close a searchable file reference beside the terminal. `split experience.txt` opens a specific file; a selector switches files without changing terminal output. Each shell remembers its file. Project split buttons pin the relevant note. The panes stack on phones.
- `demo chunks`: explicitly open the optional chunking lab. It is hidden from the normal split view and loads only when requested. `split on` returns to file reference.
- `snake`: start the game view. Enter or Start begins; arrows/WASD move, Space pauses, R restarts, and q/Escape exits. Touch controls are included. Games pause when hidden or when switching sessions.
- `lang en` / `lang es`: translate the portfolio, documents, search, reader, manuals, and UI. The header has a language picker. Language is shared across sessions and persists.
- `clear`: clear scrollback.
- `help`: commands and clickable filenames.

The inline prompt uses native text editing beneath a block cursor. Arrow keys recall command history and restore an unfinished draft. Right Arrow accepts a suggested command when the cursor is at the end. Tab completes a unique match or lists multiple choices; press Tab again to focus the choices and Enter to select one. Ctrl+R searches session history; repeat it to cycle matches, Enter selects a command for editing, and Escape restores the draft. Escape also dismisses completions or clears the input. Ctrl+L clears output when the prompt is focused; Ctrl+K or Cmd+K focuses the prompt. Cursor blinking stops when reduced motion is requested. All content can also be opened by clicking commands and filenames. This is a portfolio command interpreter, not a server shell.

## Content

Edit `src/content.ts` for work notes, profile links, skills, and employment history. The header includes accessible GitHub and LinkedIn logo links at desktop and phone widths. Public work includes PearAI contribution repositories, the Linux installer, and the Python/Pygame A* project. Repository descriptions were checked against their public README or source. Repository links are static, so the portfolio needs no GitHub API or token. Professional client source is private. Public recreations have not been presented as finished or available. Add accurate public repository or demo links when those projects exist.

Project pages and selected work in Start here share the same action controls. Existing public repositories enable View source. Client source is marked private; unavailable demos retain a hidden, disabled Try demo (planned) button in the component. They do not appear visually or in the accessibility tree. Add a real `demoUrl` to a project in `src/content.ts` to enable its demo link everywhere. Optional `sourceUrl` can link an independent public recreation when it is ready; otherwise the first repository supplies the source action. No placeholder destinations are published.

Replace `public/resume.pdf` when updating your résumé. The command router and layout live in `src/App.tsx`; output rendering is in `src/PortfolioOutput.tsx`. `src/documents.ts` supplies the reader and search from the same localized content. `src/localization.ts` contains the Spanish content. Verified contribution records live in `src/contributions.ts`; skill-to-project mappings in `src/skill-evidence.ts`. Start here uses the same content and contact actions as terminal output. Case studies separate context, contribution, and qualitative result without invented metrics. Session state lives in `src/hooks/useSessions.ts`; reader, reference pane, demo, game, tabs, and input are separate components. `src/snake-engine.ts` contains game rules. Appearance lives in `src/styles.css`, theme metadata in `src/themes.ts`, CRT preferences in `src/crt.ts`, and manuals in `src/manual.ts`. IBM Plex Mono and VT323 are bundled locally.

## Standalone demo

The optional `demo chunks` pane is a browser demonstration using sample text, not a proprietary client recreation. It stays out of the normal split view. It splits UTF-8 sample text into selectable byte-sized blocks, computes SHA-256 digests, reassembles the bytes, and compares digests. The corruption checkbox changes a byte in the reconstructed payload, so the failure state exercises an actual mismatch. It makes no network uploads, accepts at most 4096 characters, and needs Web Crypto over HTTPS or localhost.

## Cloudflare

Use `npm run build` as the build command and `dist` as the output directory. No runtime secrets or server-side routing are required. The user has deployed the project to Cloudflare; changes to `main` can trigger their connected deployment. Cloud deployment success must be verified separately from a local build or Git push.
