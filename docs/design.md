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
maxfsp@portfolio: ~                            resume / theme
run: whoami  work  experience  skills  contact  help
-----------------------------------------------------------
maxfsp@portfolio:~$ whoami

[ASCII initials]   Santiago Paz Farfán
                   Full-stack software engineer
                   location / stack / background / links

maxfsp@portfolio:~$ ls work/

private  healthcare-audio.md    Healthcare infrastructure
private  real-estate.md         Web applications
public   pearai.md              Developer tools

-----------------------------------------------------------
maxfsp@portfolio:~$ [command input]                        ↵
↑↓ history / Tab complete / Ctrl+L clear                 help
```

Names and project descriptions are factual. Project notes open inline as readable command output. Clicking the commands or filenames provides access without requiring visitors to know shell commands. Actual email, GitHub, LinkedIn, and résumé links remain normal browser links.

The prompt stays visible while output scrolls independently, including on mobile. There are no boot delays, fake server statistics, animations, or decorative window controls. Keyboard support includes history with draft restoration, command completion, clearing, and prompt focus. The previous card and modal design was replaced rather than recolored.
