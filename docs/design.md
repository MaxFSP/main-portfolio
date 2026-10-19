# Terminal design

The page is a terminal, with commands, a scrollback buffer, inline text output, and a persistent input prompt. There is no landing-page hero, sidebar, project-card grid, simulated dashboard, or marketing copy.

## Tokens

- Black `#000000`: default canvas, including on devices set to light appearance.
- White `#f1f1f1`: headings, filenames, and ASCII initials.
- Gray `#d4d4d4`: body text.
- Gray `#949494`: metadata and secondary output.
- Charcoal `#242424`: terminal boundaries.
- Muted green `#b5cba8`: the shell username only.

Optional light mode inverts the same interface onto white with dark text. The terminal stores its explicit theme preference separately from the previous design, so previous browser settings do not override the new black default.

IBM Plex Mono is the default typeface; the optional CRT themes use VT323. Both are hosted locally. The entire layout uses terminal-sized type and character-based spacing.

## Structure

```text
>_ maxfsp  whoami work experience skills contact help  resume/theme
-----------------------------------------------------------
maxfsp@portfolio:~$ whoami

[ASCII initials]   Santiago Paz Farfán
                   Full-stack software engineer
                   location / stack / background / links

maxfsp@portfolio:~$ ls work/

private  healthcare-audio.md    Healthcare infrastructure
private  real-estate.md         Web applications
public   pearai.md              Developer tools

maxfsp@portfolio:~$ █                                      ↵

-----------------------------------------------------------
Tab complete / ↑↓ history / Ctrl+R search / Ctrl+L clear
```

Names and project descriptions are factual. Project notes open inline as readable command output. Clicking the commands or filenames provides access without requiring visitors to know shell commands. Actual email, GitHub, LinkedIn, and résumé links remain normal browser links.

Commands live in the top header. The input is a prompt in the same terminal canvas, immediately after command output, without a separate panel or underline. It sticks to the bottom when output is longer than the viewport. A block cursor follows native caret movement; typing, selection, paste, horizontal scrolling, and mobile keyboards remain native. Inline suggestions favor recent commands. Tab shows ambiguous matches, Ctrl+R searches session history, and tree renders clickable portfolio files. The cursor blinks only with focus and respects reduced motion. There are no boot delays, fake server statistics, or decorative window controls.

## Optional console themes

Black remains the default. Amber CRT uses amber phosphor on a warm black canvas; Green CRT uses green phosphor on a dark green-black canvas. Both use the locally bundled VT323 pixel font at a larger size than IBM Plex Mono. Header controls remain in IBM Plex Mono. Paper uses dark ink on warm paper; Light remains black on white.

A native theme picker sits in the existing header. Running theme shows a plain text list of the same choices. Preferences restore before rendering, and previously saved Black or Light choices remain valid. Static scanlines and soft glow can be disabled with crt off, separately from the selected theme. The overlay ignores pointer input; it never flickers or animates. Cursor blinking still respects reduced motion.

Command manuals use inline text output and clickable examples. History expansion supports !! without executing arbitrary JavaScript or server commands.

## Sessions and tools

The session strip lives below the combined header. Each tab owns its own scrollback, draft, working directory, history, mode, split setting, and Snake board. Theme and language are global. The app caps in-memory sessions at eight. Closing the last session is disabled. Rename works through the visible control, double-click, F2, or tab rename. An inline editor supports Enter to save and Escape to cancel, and preserves shell state.

The file reader replaces the terminal pane while open; search and line numbers operate on the actual localized documents. Grep uses the same document source, and result paths open the reader. Shared links restore the project and selected language.

Split mode pins a searchable portfolio file beside the terminal so visitors can keep a note in view while browsing other output. A compact file picker switches the reference; each shell remembers its selection. Project split buttons pin the relevant note. The optional UTF-8 chunking lab is hidden behind demo chunks and loaded on demand. On smaller screens, two independently scrollable panes stack within the viewport. Snake uses the current palette, includes touch controls, and pauses across sessions and hidden browser tabs.

Text spacing is tighter: fewer blank lines between commands, smaller margins in work notes, and more compact leading. New output follows the prompt on resize while a reader who scrolls back keeps their place.

CRT now has live presets and separate scanline/glow strengths. Explicit presets can affect Black without changing its palette; Light and Paper stay clean. Effects remain static and ignore pointer input. There are no flicker effects.
