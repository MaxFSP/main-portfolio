import { useEffect, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { experience, profile, projects, skillGroups } from './content';

type View = 'about' | 'work' | 'experience' | 'skills' | 'contact' | 'help' | 'project' | 'resume' | 'text';
type Entry = { id: number; command: string; path: string; view: View; project?: string; message?: string };
type Theme = 'dark' | 'light';
const resumeUrl = import.meta.env.BASE_URL + 'resume.pdf';
const commands = ['whoami', 'work', 'experience', 'skills', 'contact', 'help'];
const completionOptions = [...commands, 'about', 'ls', 'pwd', 'resume', 'theme', 'clear', 'cat about.txt', 'cat experience.txt', 'cat skills.txt', 'cat contact.txt', 'cat work/healthcare-audio.md', 'cat work/real-estate.md', 'cat work/pearai.md', 'cd work', 'cd ..'];
const filenames: Record<string, string> = { healthcare: 'healthcare-audio.md', 'real-estate': 'real-estate.md', pearai: 'pearai.md' };
const ascii = ["   _____ ____  ______", "  / ___// __ \\/ ____/", "  \\__ \\/ /_/ / /_   ", " ___/ / ____/ __/   ", "/____/_/   /_/      "].join('\n');
const themeKey = 'portfolio-terminal-theme';

function initialEntries(): Entry[] {
  const hash = window.location.hash.slice(1);
  const routes: Record<string, View> = { about: 'about', overview: 'about', work: 'work', experience: 'experience', skills: 'skills', contact: 'contact' };
  const view = Object.hasOwn(routes, hash) ? routes[hash] : undefined;
  if (view) return [{ id: 0, command: view === 'about' ? 'whoami' : view, path: '~', view }];
  return [
    { id: 0, command: 'whoami', path: '~', view: 'about' },
    { id: 1, command: 'ls work/', path: '~', view: 'work' },
  ];
}

function Prompt({ path = '~' }: { path?: string }) {
  return <span className="prompt"><span className="prompt-user">maxfsp</span><span className="prompt-host">@portfolio</span><span className="prompt-colon">:</span><span className="prompt-path">{path}</span><span className="prompt-dollar">$</span></span>;
}

function App() {
  const [theme, setTheme] = useState<Theme>(() => document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [draft, setDraft] = useState('');
  const [path, setPath] = useState('~');
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLElement>(null);
  const nextId = useRef(2);
  const shouldScroll = useRef(false);
  const copyTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#000000' : '#ffffff');
    try { localStorage.setItem(themeKey, theme); } catch { /* Themes also work without storage. */ }
  }, [theme]);

  useEffect(() => {
    if (!shouldScroll.current) return;
    shouldScroll.current = false;
    const area = scrollRef.current;
    const last = area?.querySelector<HTMLElement>('.transcript-entry:last-child');
    if (area && last) area.scrollTop = last.offsetTop - 24;
  }, [entries]);

  useEffect(() => {
    function onKey(event: globalThis.KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); clearTimeout(copyTimeout.current); };
  }, []);

  function toggleTheme() { setTheme(value => value === 'dark' ? 'light' : 'dark'); }

  function append(command: string, view: View, message?: string, project?: string) {
    shouldScroll.current = true;
    setEntries(items => [...items.slice(-49), { id: nextId.current++, command, path, view, message, project }]);
    if (['about', 'work', 'experience', 'skills', 'contact'].includes(view)) window.history.replaceState(null, '', '#' + view);
  }

  function run(raw: string) {
    const command = raw.trim();
    if (!command) return;
    setHistory(items => [...items, command]);
    setHistoryIndex(-1);
    setInput('');
    setDraft('');
    const normalized = command.toLowerCase().replace(/\s+/g, ' ');
    const [name, ...args] = normalized.split(' ');
    const argument = args.join(' ');
    if (name === 'clear') { setEntries([]); return; }
    if (name === 'theme') {
      if (argument && !['dark', 'light'].includes(argument)) { append(command, 'text', 'Usage: theme [dark|light]'); return; }
      const choice = argument ? argument as Theme : theme === 'dark' ? 'light' : 'dark';
      setTheme(choice);
      append(command, 'text', 'Theme: ' + choice);
      return;
    }
    if (name === 'pwd') { append(command, 'text', '/home/maxfsp/portfolio' + (path === '~/work' ? '/work' : '')); return; }
    if (name === 'cd') {
      if (['work', 'work/', '~/work', '~/work/'].includes(argument)) { setPath('~/work'); append(command, 'text'); }
      else if (['', '~', '..', '../', '/', '~/'].includes(argument)) { setPath('~'); append(command, 'text'); }
      else append(command, 'text', 'cd: no such directory: ' + argument + '\nAvailable directory: ~/work');
      return;
    }
    const candidate = (name === 'cat' || name === 'work') && argument ? argument.replace(/^(~\/)?work\//, '').replace(/\.md$/, '') : '';
    const selected = projects.find(project => project.id === candidate || filenames[project.id].replace('.md', '') === candidate);
    if (selected) { append(command, 'project', undefined, selected.id); return; }
    if (name === 'work' && argument) { append(command, 'text', 'work: no such entry: ' + argument + '\nRun ls work/ to see available files.'); return; }
    if (name === 'cat' && argument === 'resume.pdf') { append(command, 'resume'); return; }
    if (name === 'ls') {
      if (argument && !['work', 'work/', '~/work', '~/work/', '.', '~', '~/'].includes(argument)) { append(command, 'text', 'ls: no such directory: ' + argument); return; }
      append(command, argument.includes('work') || ((!argument || argument === '.') && path === '~/work') ? 'work' : 'help');
      return;
    }
    const file = name === 'cat' ? argument.replace(/^~\//, '').replace(/\.txt$/, '') : name === 'open' ? argument : name;
    const views: Record<string, View> = { whoami: 'about', about: 'about', overview: 'about', work: 'work', projects: 'work', experience: 'experience', skills: 'skills', contact: 'contact', help: 'help', resume: 'resume' };
    if (Object.hasOwn(views, file)) { append(command, views[file]); return; }
    append(command, 'text', name === 'cat' ? 'cat: no such file: ' + argument + '\nRun ls to see available files.' : name === 'open' ? 'Choose a section: about, work, experience, skills, contact.' : command + ': command not found\nRun help to see available commands.');
  }

  function submit(event: FormEvent) { event.preventDefault(); run(input); }

  function inputKeys(event: KeyboardEvent<HTMLInputElement>) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'l') {
      event.preventDefault(); setEntries([]); return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (historyIndex === -1) setDraft(input);
      const next = Math.min(historyIndex + 1, history.length - 1);
      if (next >= 0) { setHistoryIndex(next); setInput(history[history.length - 1 - next]); }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      const next = Math.max(historyIndex - 1, -1);
      setHistoryIndex(next);
      setInput(next < 0 ? draft : history[history.length - 1 - next]);
    } else if (event.key === 'Tab' && input) {
      const matches = completionOptions.filter(command => command.startsWith(input.toLowerCase()));
      if (matches.length === 1) { event.preventDefault(); setInput(matches[0]); }
    } else if (event.key === 'Escape') { setInput(''); setHistoryIndex(-1); }
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true); setCopyError(false);
      clearTimeout(copyTimeout.current);
      copyTimeout.current = setTimeout(() => setCopied(false), 2500);
    } catch { setCopyError(true); }
  }

  function commandButton(command: string, label?: string) {
    return <button className="file-link" onClick={() => run(command)}>{label || command}</button>;
  }

  function renderOutput(entry: Entry) {
    switch (entry.view) {
      case 'about': return <div className="identity"><pre className="ascii-logo" aria-hidden="true">{ascii}</pre><div className="identity-details"><h2 className="identity-name">Santiago Paz Farfán</h2><p className="identity-role">Full-stack software engineer</p><dl><div><dt>based in</dt><dd>Houston, Texas</dd></div><div><dt>stack</dt><dd>TypeScript, React, Next.js, Python, AWS</dd></div><div><dt>experience</dt><dd>3+ years / web applications & backend services</dd></div><div><dt>languages</dt><dd>Spanish (native), English (fluent)</dd></div></dl><div className="identity-links"><a href={profile.github} target="_blank" rel="noreferrer">github ↗</a><a href={profile.linkedin} target="_blank" rel="noreferrer">linkedin ↗</a><a href={resumeUrl} download="Santiago-Paz-Farfan-Resume.pdf">resume.pdf ↓</a></div></div></div>;
      case 'work': return <div className="work-output"><p className="output-comment">Professional work and open-source contributions.</p><div className="file-list">{projects.map(project => <div className="file-row" key={project.id}><span className="file-permission">{project.type === 'Open source' ? 'public ' : 'private'}</span><button className="file-link" onClick={() => run('cat work/' + filenames[project.id])} aria-label={'Read ' + project.title}>{filenames[project.id]}</button><span className="file-description">{project.category}</span></div>)}</div><p className="output-comment work-disclosure">Client source is private. Public recreations are not available yet.</p><p className="file-hint">Click a filename to read it, or type <span>work healthcare</span>.</p></div>;
      case 'experience': return <div className="experience-output"><h2>Experience</h2>{experience.map((job, index) => <article className="job" key={job.company + index}><div className="job-heading"><h3>{job.company}</h3><span>{job.dates}</span></div><p className="job-role">{job.role}{job.client ? ' / ' + job.client : ''}</p><p>{job.detail}</p></article>)}<div className="education-output"><h3>Education</h3><p>Systems Engineering / Escuela Militar de Ingeniería</p><p className="output-comment">2024 / First in class, graduated with honors</p><p>MBA / UNEATLANTICO & UNINI-MX</p><p className="output-comment">In progress / Expected 2028</p></div></div>;
      case 'skills': return <div className="skills-output"><h2>Skills</h2>{skillGroups.map(group => <div className="skill-row" key={group.title}><h3>{group.title}</h3><p>{group.skills.join(', ')}</p></div>)}</div>;
      case 'contact': return <div className="contact-output"><h2>Contact</h2><dl><div><dt>email</dt><dd><a href={'mailto:' + profile.email}>{profile.email}</a></dd></div><div><dt>github</dt><dd><a href={profile.github} target="_blank" rel="noreferrer">github.com/MaxFSP ↗</a></dd></div><div><dt>linkedin</dt><dd><a href={profile.linkedin} target="_blank" rel="noreferrer">Santiago Paz Farfán ↗</a></dd></div></dl><div className="contact-controls"><a href={'mailto:' + profile.email}>[ send email ]</a><button onClick={copyEmail}>[ {copied ? 'copied' : 'copy email'} ]</button></div><p className="copy-status" role="status">{copied ? 'Email copied to clipboard.' : copyError ? 'Clipboard unavailable. Select the email address above or use send email.' : ''}</p></div>;
      case 'project': {
        const project = projects.find(item => item.id === entry.project);
        if (!project) return <p>File not found. Run ls work/.</p>;
        return <article className="project-output"><p className="output-comment">{'# ' + filenames[project.id]}</p><h2>{project.title}</h2><p className="project-organization">{project.organization}</p><p>{project.summary}</p><ul>{project.details.map(detail => <li key={detail}>{detail}</li>)}</ul><p className="project-stack">{project.tags.join(' / ')}</p><p className="project-note">{project.note}</p>{project.type === 'Open source' && <a href={profile.github} target="_blank" rel="noreferrer">Public contributions on GitHub ↗</a>}</article>;
      }
      case 'resume': return <div className="resume-output"><a href={resumeUrl} download="Santiago-Paz-Farfan-Resume.pdf">Download resume.pdf ↓</a><span className="output-comment">Santiago Maximiliano Paz Farfán / PDF</span></div>;
      case 'help': return <div className="help-output"><h2>Commands</h2><div className="help-grid">{[
        ['whoami', 'Name, location, and background'], ['work', 'Professional work and contributions'], ['experience', 'Employment and education'], ['skills', 'Languages, frameworks, and tools'], ['contact', 'Email and profiles'], ['resume', 'Download my résumé'], ['theme', 'Toggle light / dark'], ['clear', 'Clear the terminal'],
      ].map(([command, description]) => <div key={command}>{commandButton(command)}<span>{description}</span></div>)}</div><p className="output-comment">Also: ls, pwd, cd work, cd .., cat &lt;filename&gt;</p><div className="available-files"><span className="output-comment">Files:</span>{['about', 'experience', 'skills', 'contact'].map(file => <button className="file-link" key={file} onClick={() => run('cat ' + file + '.txt')}>{file}.txt</button>)}{commandButton('work', 'work/')}</div><p className="output-comment">↑ / ↓ history · Tab complete · Ctrl+L clear · Ctrl/Cmd+K focus prompt</p></div>;
      case 'text': return entry.message ? <p className="plain-output">{entry.message}</p> : null;
    }
  }

  return <div className="terminal-app">
    <a href="#command-input" className="skip-link">Skip to command prompt</a>
    <header className="window-bar"><span className="window-title"><span aria-hidden="true">&gt;_</span> maxfsp@portfolio: {path}</span><div className="window-actions"><a href={profile.github} target="_blank" rel="noreferrer">github ↗</a><a href={resumeUrl} download="Santiago-Paz-Farfan-Resume.pdf" aria-label="Download résumé">resume ↓</a><button onClick={toggleTheme} aria-label={'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' mode'}>[ {theme === 'dark' ? 'light' : 'dark'} ]</button></div></header>
    <nav className="command-nav" aria-label="Portfolio commands"><span className="nav-label">run:</span>{commands.map(command => <button key={command} onClick={() => run(command)}>{command}</button>)}</nav>
    <main className="terminal-scroll" ref={scrollRef} aria-label="Terminal output" tabIndex={0}><h1 className="sr-only">Santiago Paz Farfán — terminal portfolio</h1><div className="transcript" role="log" aria-live="polite" aria-relevant="additions">{entries.map(entry => <section className="transcript-entry" key={entry.id}><div className="command-echo"><Prompt path={entry.path} /><span>{entry.command}</span></div><div className="command-output">{renderOutput(entry)}</div></section>)}{entries.length === 0 && <p className="empty-terminal">Type a command below. {commandButton('help')}</p>}</div></main>
    <div className="input-dock"><form className="command-form" onSubmit={submit}><label htmlFor="command-input" className="sr-only">Terminal command</label><Prompt path={path} /><input id="command-input" ref={inputRef} value={input} onChange={event => setInput(event.target.value)} onKeyDown={inputKeys} autoComplete="off" autoCapitalize="none" spellCheck={false} placeholder="type help" aria-describedby="input-help" /><button type="submit" className="run-button" aria-label="Run command">↵</button></form><footer id="input-help" className="terminal-foot"><span>↑↓ history <span className="footer-detail">/ Tab complete / Ctrl+L clear</span></span><button onClick={() => run('help')}>help</button></footer></div>
  </div>;
}

export default App;
