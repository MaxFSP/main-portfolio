# Design direction

The portfolio is a personal developer workspace: a quiet explorer, a readable document, and a real interactive shell. The content comes from Santiago’s résumé. Client work is presented as contribution notes; future recreations are not represented as finished projects.

## Tokens

Dark palette: workspace `#101820`, sidebar `#0c131a`, text `#e7edf2`, powder blue `#aed1ee`, sage `#a9c7b9`, lavender `#c2afd5`.

Light palette: workspace `#f5f7f9`, sidebar `#eaf0f4`, text `#1e3445`, ink blue `#2d6288`, sage `#3e7061`, lavender `#76588a`.

Space Grotesk carries the headings and readable prose. IBM Plex Mono is reserved for the shell, file paths, and compact technical information. Both are bundled locally. Blue is the primary interaction color; sage and lavender distinguish the project illustrations.

## Layout

```text
┌──────────┬──────────────────────────────────────┐
│ Explorer │ breadcrumb           commands/theme │
│          ├──────────────────────┬───────────────┤
│ overview │ name + introduction  │ working shell │
│ work     ├──────────────────────┴───────────────┤
│ history  │ everyday toolkit                     │
│ about    ├────────────┬────────────┬────────────┤
│ contact  │ healthcare │ real estate│ open source│
│          ├────────────┴────────────┴────────────┤
│ socials  │ experience / about / contact          │
└──────────┴──────────────────────────────────────┘
```

Content is left aligned. Mobile turns the explorer into a keyboard-accessible drawer and stacks the shell and work notes. The main navigation remains usable without knowing any terminal commands.

## Review and restraint

A green-on-black terminal would be an obvious default for this brief. The palette instead takes its cues from a calm code editor, with a separate paper-like light theme. The shell is the main interactive element; there is no fake boot sequence, typewriter delay, decorative animation, or terminal gate before the content. The three project illustrations describe the actual subjects: audio validation, property analytics, and developer tooling.

Transitions answer user actions. Reduced motion is respected. Native dialogs provide keyboard dismissal and focus restoration. Client confidentiality appears beside the work instead of being hidden behind unavailable demo buttons.
