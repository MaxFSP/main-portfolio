type Manual = { synopsis: string; description: string; examples: string[]; notes?: string };

export const manuals: Record<string, Manual> = {
  whoami: {
    synopsis: 'whoami',
    description: 'Show my name, background, location, and profile links.',
    examples: ['whoami'],
  },
  work: {
    synopsis: 'work [healthcare|real-estate|pearai]',
    description: 'List my professional work and open-source contributions, or read a specific note.',
    examples: ['work', 'work healthcare', 'work pearai'],
    notes: 'Client code is private. Independent recreations are not available yet.',
  },
  experience: {
    synopsis: 'experience',
    description: 'Read my employment history, responsibilities, and education.',
    examples: ['experience'],
  },
  skills: {
    synopsis: 'skills',
    description: 'List languages, frameworks, infrastructure, and testing tools from my résumé.',
    examples: ['skills'],
  },
  contact: {
    synopsis: 'contact',
    description: 'Show my email address, GitHub, and LinkedIn. The email can be copied or opened in your mail app.',
    examples: ['contact'],
  },
  resume: {
    synopsis: 'resume',
    description: 'Show a link to download my actual résumé as a PDF.',
    examples: ['resume'],
  },
  theme: {
    synopsis: 'theme [dark|amber|phosphor|paper|light|list]',
    description: 'List the available themes, or apply one. You can also choose a theme from the header. Your choice is saved on this browser.',
    examples: ['theme', 'theme amber', 'theme phosphor', 'theme paper', 'theme dark'],
    notes: 'Aliases: black = dark, green = phosphor, retro = amber. CRT themes use a locally bundled pixel typeface. Run crt off to remove scanlines and glow.',
  },
  crt: {
    synopsis: 'crt [on|off]',
    description: 'Enable or disable static scanlines and phosphor glow in the amber and green CRT themes. With no argument, show the current setting.',
    examples: ['crt', 'crt off', 'crt on'],
    notes: 'This preference is saved independently from the theme. Effects appear only in CRT themes. There is no screen flicker or moving scanline.',
  },
  tree: {
    synopsis: 'tree [work|.|~]',
    description: 'Display the portfolio files as a clickable directory tree. With no argument, use the current directory.',
    examples: ['tree', 'tree work'],
  },
  ls: {
    synopsis: 'ls [work|.|~]',
    description: 'List the current directory. At the portfolio root, show commands and available files. Inside work, list the work notes.',
    examples: ['ls', 'ls work/'],
  },
  cat: {
    synopsis: 'cat <filename>',
    description: 'Read a portfolio file as terminal output. Work-note paths can be read from the root or from the work directory.',
    examples: ['cat about.txt', 'cat skills.txt', 'cat work/healthcare-audio.md'],
    notes: 'These are portfolio documents. This command has no access to your computer or a server filesystem.',
  },
  cd: {
    synopsis: 'cd [work|..|~]',
    description: 'Move between the portfolio root and the work directory. The prompt reflects the current path.',
    examples: ['cd work', 'cd ..'],
  },
  pwd: {
    synopsis: 'pwd',
    description: 'Print the current path in this portfolio’s virtual filesystem.',
    examples: ['pwd'],
  },
  history: {
    synopsis: 'history',
    description: 'List commands from this session. History stays in memory and is cleared when the page reloads.',
    examples: ['history'],
    notes: 'Use ↑ / ↓ to recall commands. Ctrl+R starts reverse search; repeat it to cycle matches. Enter selects a match for editing. Escape restores the draft. !! repeats the last command.',
  },
  '!!': {
    synopsis: '!!',
    description: 'Run the last command again. The expanded command is added to history. If the session has no commands, display an error.',
    examples: ['!!'],
  },
  clear: {
    synopsis: 'clear',
    description: 'Clear terminal output while keeping command history and your current directory. Ctrl+L does the same when the prompt has focus.',
    examples: ['clear'],
  },
  help: {
    synopsis: 'help',
    description: 'Show available commands, clickable files, and keyboard shortcuts.',
    examples: ['help'],
  },
  man: {
    synopsis: 'man [command]',
    description: 'List the manual pages or read a command’s syntax, behavior, and examples. Click an example to run it.',
    examples: ['man', 'man theme', 'man history', 'man tree'],
  },
};
