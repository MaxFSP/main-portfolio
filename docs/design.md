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

IBM Plex Mono is the only typeface. It is hosted locally. The entire layout uses terminal-sized type and character-based spacing.

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
