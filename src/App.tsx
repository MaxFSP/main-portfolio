import { useEffect, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { ArrowDown, ArrowDownToLine, ArrowUpRight, AudioLines, Braces, Check, ChevronRight, CircleHelp, Code2, Command, Copy, ExternalLink, FileCode2, Folder, GitBranch, Github, Globe2, Layers3, Linkedin, Mail, MapPin, Menu, Moon, Send, ShieldCheck, Sun, Terminal, X } from 'lucide-react';
import { experience, profile, projects, skillGroups } from './content';

type Section = 'overview' | 'work' | 'experience' | 'about' | 'contact';
type Output = { command?: string; text: string };
const sections: { id: Section; name: string; icon: typeof Folder }[] = [
  { id: 'overview', name: 'Overview', icon: FileCode2 },
  { id: 'work', name: 'Selected work', icon: Folder },
  { id: 'experience', name: 'Experience', icon: GitBranch },
  { id: 'about', name: 'About me', icon: Braces },
  { id: 'contact', name: 'Get in touch', icon: Mail },
];
const initialOutput: Output[] = [{ text: 'Welcome to my corner of the internet.\nA small shell. A real person behind it.' }];
const linkedin = 'https://www.linkedin.com/in/maximiliano-paz-farf%C3%A1n-741b6b21b/';
const resumeUrl = `${import.meta.env.BASE_URL}resume.pdf`;

function App() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'dark');
  const [active, setActive] = useState<Section>('overview');
  const [menuOpen, setMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState<(typeof projects)[number] | null>(null);
  const [output, setOutput] = useState<Output[]>(initialOutput);
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const terminalInput = useRef<HTMLInputElement>(null);
  const terminalOutput = useRef<HTMLDivElement>(null);
  const palette = useRef<HTMLDialogElement>(null);
  const projectDialog = useRef<HTMLDialogElement>(null);
  const sidebar = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const copyTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#101820' : '#eef2f5');
    try { localStorage.setItem('portfolio-theme', theme); } catch { /* Browsing without storage still supports themes. */ }
  }, [theme]);

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (!projectDialog.current?.open) setPaletteOpen(value => !value);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActive(visible[0].target.id as Section);
    }, { rootMargin: '-8% 0px -58% 0px', threshold: 0 });
    sections.forEach(({ id }) => { const section = document.getElementById(id); if (section) observer.observe(section); });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (paletteOpen) palette.current?.showModal();
    else if (palette.current?.open) palette.current.close();
  }, [paletteOpen]);

  useEffect(() => {
    if (selectedProject) projectDialog.current?.showModal();
    else if (projectDialog.current?.open) projectDialog.current.close();
  }, [selectedProject]);

  useEffect(() => {
    if (terminalOutput.current) terminalOutput.current.scrollTop = terminalOutput.current.scrollHeight;
  }, [output]);

  useEffect(() => () => clearTimeout(copyTimeout.current), []);

  useEffect(() => {
    if (!menuOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    sidebar.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') { setMenuOpen(false); return; }
      if (event.key !== 'Tab') return;
      const controls = Array.from(sidebar.current?.querySelectorAll<HTMLElement>('a[href], button') ?? []);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); previousFocus?.focus({ preventScroll: true }); };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen && !paletteOpen && !selectedProject) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [menuOpen, paletteOpen, selectedProject]);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (sections.some(section => section.id === hash)) {
      setActive(hash as Section);
      document.getElementById(hash)?.scrollIntoView({ behavior: 'instant' });
    }
  }, []);

  function navigate(id: Section) {
    setActive(id);
    setMenuOpen(false);
    setPaletteOpen(false);
    setSearch('');
    document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    window.history.replaceState(null, '', `#${id}`);
  }

  function toggleTheme() { setTheme(value => value === 'dark' ? 'light' : 'dark'); }

  function runCommand(raw: string) {
    const value = raw.trim();
    if (!value) return;
    setCommand('');
    setHistory(items => [...items, value]);
    setHistoryIndex(-1);
    const [name, ...args] = value.toLowerCase().split(/\s+/);
    let result: string;
    switch (name) {
      case 'help': result = 'whoami      Meet Santiago\nprojects    Explore selected work\nexperience  See my experience\nskills      View my toolkit\ncontact     Get in touch\ntheme       Toggle light / dark\nclear       Clear this shell\nopen <section>  Jump to a section'; break;
      case 'whoami': result = `${profile.name}\nFull-stack software engineer · Houston, Texas\n3+ years with TypeScript, React, Python, and AWS.\nSpanish (native) / English (fluent).`; break;
      case 'projects': result = 'Healthcare infrastructure · Professional work\nReal estate applications · Professional work\nPearAI · Open-source contributions\n\nRead the work notes below. Public recreations are still to come.'; navigate('work'); break;
      case 'experience': result = 'CrowdTech            Dec 2025 – Jun 2026\nAssureSoft           Apr 2025 – Dec 2025\nBlacksheep Global    Dec 2024 – Apr 2025\nCrowdTech            May 2023 – Apr 2025'; navigate('experience'); break;
      case 'skills': result = skillGroups.map(group => `${group.title}\n${group.skills.join(' · ')}`).join('\n\n'); break;
      case 'contact': result = `${profile.email}\ngithub.com/MaxFSP\n\nUse the contact links below to say hello.`; navigate('contact'); break;
      case 'theme': toggleTheme(); result = `Switched to ${theme === 'dark' ? 'light' : 'dark'} mode.`; break;
      case 'clear': setOutput([]); return;
      case 'open': {
        const target = args[0] as Section;
        if (sections.some(section => section.id === target)) { navigate(target); result = `Opened ${target}.`; }
        else result = 'Choose a section: overview, work, experience, about, contact.';
        break;
      }
      default: result = `Command not found: ${value}\nType help to see what you can do.`;
    }
    setOutput(items => [...items.slice(-29), { command: value, text: result }]);
  }

  function submitCommand(event: FormEvent) { event.preventDefault(); runCommand(command); }

  function terminalKeys(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      const next = Math.min(historyIndex + 1, history.length - 1);
      if (next >= 0) { setHistoryIndex(next); setCommand(history[history.length - 1 - next]); }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      const next = Math.max(historyIndex - 1, -1);
      setHistoryIndex(next);
      setCommand(next < 0 ? '' : history[history.length - 1 - next]);
    } else if (event.key === 'Tab' && command) {
      const matches = ['help', 'whoami', 'projects', 'experience', 'skills', 'contact', 'theme', 'clear', 'open'].filter(item => item.startsWith(command));
      if (matches.length === 1) { event.preventDefault(); setCommand(matches[0]); }
    }
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true); setCopyError(false);
      clearTimeout(copyTimeout.current);
      copyTimeout.current = setTimeout(() => setCopied(false), 2500);
    } catch { setCopyError(true); }
  }

  const paletteItems = [
    ...sections.map(section => ({ label: section.name, detail: `Go to /${section.id}`, icon: section.icon, action: () => navigate(section.id) })),
    { label: 'Switch theme', detail: `${theme === 'dark' ? 'Light' : 'Dark'} mode`, icon: Sun, action: () => { toggleTheme(); setPaletteOpen(false); } },
    { label: 'Focus terminal', detail: 'Try a command', icon: Terminal, action: () => { setPaletteOpen(false); navigate('overview'); setTimeout(() => terminalInput.current?.focus({ preventScroll: true }), 100); } },
  ].filter(item => `${item.label} ${item.detail}`.toLowerCase().includes(search.toLowerCase()));

  return <>
    <a href="#main" className="skip-link">Skip to content</a>
    <aside ref={sidebar} id="portfolio-sidebar" className={`sidebar ${menuOpen ? 'is-open' : ''}`} aria-label="Portfolio sidebar">
      <button className="icon-button sidebar-close" aria-label="Close navigation" onClick={() => setMenuOpen(false)}><X size={19} /></button>
      <a className="brand" href="#overview" onClick={event => { event.preventDefault(); navigate('overview'); }} aria-label="Santiago Paz Farfán home"><span className="brand-mark"><Terminal size={22} strokeWidth={1.7} /></span><span>spf<span className="brand-dot">.</span><span className="brand-sub">personal workspace</span></span></a>
      <div className="sidebar-label">Explorer</div>
      <nav aria-label="Main navigation" className="main-nav">{sections.map(({ id, name, icon: Icon }) => <a key={id} href={`#${id}`} className={active === id ? 'active' : ''} aria-current={active === id ? 'location' : undefined} onClick={event => { event.preventDefault(); navigate(id); }}><Icon size={17} strokeWidth={1.6} /><span>{name}</span>{active === id && <span className="nav-dot" />}</a>)}</nav>
      <div className="sidebar-note"><span className="note-symbol">{'//'} </span>A place for the things<br />I build, learn, and care about.</div>
      <div className="sidebar-bottom"><a href={profile.github} target="_blank" rel="noreferrer"><Github size={16} />GitHub<ArrowUpRight size={14} /></a><a href={linkedin} target="_blank" rel="noreferrer"><Linkedin size={16} />LinkedIn<ArrowUpRight size={14} /></a><div className="sidebar-location"><Globe2 size={14} /><span>Houston, Texas<span>Local roots. Remote work.</span></span></div></div>
    </aside>
    {menuOpen && <button className="menu-backdrop" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
    <div className="workspace">
      <header className="topbar"><div className="breadcrumbs"><button ref={menuButton} className="icon-button mobile-menu" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-controls="portfolio-sidebar" aria-expanded={menuOpen} onClick={() => setMenuOpen(value => !value)}>{menuOpen ? <X size={19} /> : <Menu size={19} />}</button><Code2 size={17} /><span>portfolio</span><ChevronRight size={13} /><span className="breadcrumb-current">{active}</span></div><div className="topbar-actions"><button className="command-trigger" onClick={() => setPaletteOpen(true)} aria-label="Open command menu"><Command size={14} /><span>Jump to…</span><kbd>Ctrl K</kbd></button><span className="topbar-divider" /><button className="icon-button theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button><a href={resumeUrl} download="Santiago-Paz-Farfan-Resume.pdf" className="resume-link"><ArrowDownToLine size={15} /><span>Résumé</span></a></div></header>
      <main id="main" tabIndex={-1}>
        <section className="hero section-anchor" id="overview" aria-labelledby="hero-heading">
          <div className="hero-intro"><div className="hello"><span className="tiny-cross" aria-hidden="true">✳</span> Santiago Paz Farfán</div><h1 id="hero-heading">Thoughtful interfaces.<br />Reliable systems<span className="heading-period">.</span></h1><p className="hero-description">A full-stack engineer who connects the dots between a good idea and a product people can use.</p><div className="hero-links"><button className="primary-button" onClick={() => navigate('work')}>Explore my work<ArrowDown size={16} /></button><button className="text-button" onClick={() => navigate('contact')}>Let’s talk<ArrowUpRight size={16} /></button></div><div className="hero-meta"><MapPin size={14} /><span>Houston, TX</span><span className="meta-separator" /><span>TypeScript to Python. Frontend to cloud.</span></div></div>
          <div className="terminal-card" aria-label="Interactive portfolio terminal"><div className="terminal-title"><div><Terminal size={14} /><span>meet-santiago.sh</span></div><span className="shell-label">interactive shell</span></div><div className="terminal-body"><div className="terminal-output" ref={terminalOutput} role="log" aria-live="polite" aria-relevant="additions" tabIndex={0}>{output.map((entry, i) => <div className="output-entry" key={i}>{entry.command && <div className="past-command"><span>❯</span> {entry.command}</div>}<div className="output-text">{entry.text}</div></div>)}</div><form className="terminal-form" onSubmit={submitCommand}><span aria-hidden="true">❯</span><input ref={terminalInput} aria-label="Terminal command" placeholder="Type a command…" value={command} onChange={event => setCommand(event.target.value)} onKeyDown={terminalKeys} autoComplete="off" autoCapitalize="none" spellCheck={false} /><button type="submit" className="terminal-submit" aria-label="Run command"><CornerEnter /></button></form></div><div className="terminal-footer"><span>Try <button onClick={() => runCommand('whoami')}>whoami</button> or <button onClick={() => runCommand('help')}>help</button></span><CircleHelp size={13} aria-hidden="true" /></div></div>
        </section>

        <div className="toolbelt" aria-label="Core technologies"><span>My everyday toolkit</span><div><span><Braces size={15} />TypeScript</span><span><AtomIcon />React</span><span><Layers3 size={15} />Next.js</span><span><Code2 size={15} />Python</span><span><CloudIcon />AWS</span></div></div>

        <section className="work-section section-anchor" id="work" aria-labelledby="work-heading"><div className="section-heading"><div><span className="section-path">~/selected-work</span><h2 id="work-heading">A few things I’ve helped build.</h2></div><span className="section-aside">From the interface to the infrastructure.</span></div><div className="project-grid">{projects.map((project, index) => <button key={project.id} className="project-card" onClick={() => setSelectedProject(project)} aria-label={`Read about ${project.category}`}><div className={`project-art art-${project.id}`}><span className="project-type">{project.type === 'Open source' ? <GitBranch size={11} /> : <ShieldCheck size={11} />}{project.type}</span>{index === 0 ? <div className="pipeline-art" aria-hidden="true"><div className="audio-file"><AudioLines size={31} strokeWidth={1.25} /><span>audio.wav</span></div><div className="pipeline-connection"><span /><span /><span /></div><div className="pipeline-node"><ShieldCheck size={23} strokeWidth={1.3} /><span>validate</span></div><div className="pipeline-connection"><span /><span /><span /></div><div className="pipeline-node final-node"><Braces size={23} strokeWidth={1.3} /><span>process</span></div></div> : index === 1 ? <div className="property-art" aria-hidden="true"><div className="mini-app-bar"><span className="mini-logo" />property / insights<span className="mini-app-dot" /></div><div className="mini-app-content"><div className="mini-building"><span /><span /><span /><span /><span /><span /></div><div className="mini-chart"><div className="mini-chart-heading">Market overview</div><div className="chart-bars">{[25, 43, 34, 58, 50, 70, 65, 85].map((height, i) => <i key={i} style={{ height: `${height}%` }} />)}</div><span>Turning data into direction.</span></div></div></div> : <div className="editor-art" aria-hidden="true"><div className="editor-gutter">1<br />2<br />3<br />4</div><div className="editor-code"><span className="code-comment">{'// a little less friction'}</span><br /><span className="code-purple">const</span> betterTools = {'{'}<br />&nbsp; builtWith: <span className="code-string">'community'</span>,<br />{'}'}<span className="editor-cursor" /></div></div>}</div><div className="project-info"><div className="project-category">{project.category}<ArrowUpRight size={16} /></div><h3>{project.title}</h3><p>{project.description}</p><div className="project-tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div></div></button>)}</div><div className="work-note"><GitBranch size={14} /><p>Client work stays private. Independent project recreations will have a home here as I build them.</p></div></section>

        <section className="experience-section section-anchor" id="experience" aria-labelledby="experience-heading"><div className="section-heading"><div><span className="section-path">~/experience</span><h2 id="experience-heading">Built with teams. Shaped by doing.</h2></div><a className="subtle-link" href={resumeUrl} download="Santiago-Paz-Farfan-Resume.pdf">Full résumé<ArrowDownToLine size={14} /></a></div><div className="experience-list">{experience.map((job, index) => <article className="experience-row" key={`${job.company}-${index}`}><div className="experience-company"><span className="timeline-node" /><h3>{job.company}</h3>{job.client && <span>{job.client}</span>}</div><div className="experience-description"><h4>{job.role}</h4><p>{job.detail}</p></div><time>{job.dates}</time></article>)}</div></section>

        <section className="about-section section-anchor" id="about" aria-labelledby="about-heading"><div className="about-copy"><span className="section-path">~/about-me</span><h2 id="about-heading">There’s a person<br />behind the prompt.</h2><p>I’m Santiago, a software engineer based in Houston. I enjoy working across the stack: making an interface feel right, untangling a backend problem, and connecting the two.</p><p>My work has taken me through real estate platforms, healthcare systems, and open-source developer tools. I care about clear communication as much as clear code.</p><div className="languages"><Globe2 size={15} />Spanish, native<span>/</span>English, fluent</div><div className="education"><span className="education-label">Always learning</span><p>Systems Engineering, <span>Escuela Militar de Ingeniería</span><small>Graduated with honors · First in class · 2024</small></p><p>MBA, <span>UNEATLANTICO & UNINI-MX</span><small>In progress · Expected 2028</small></p></div></div><div className="skills-panel"><div className="skills-title"><Braces size={17} /><span>The tools behind the work</span></div>{skillGroups.map(group => <div className="skill-group" key={group.title}><h3>{group.title}</h3><div>{group.skills.map(skill => <span key={skill}>{skill}</span>)}</div></div>)}<div className="skills-footnote">The right tool starts with the right question.</div></div></section>

        <section className="contact-section section-anchor" id="contact" aria-labelledby="contact-heading"><div className="contact-prompt" aria-hidden="true">❯<span>_</span></div><div className="contact-content"><span className="section-path">~/what’s-next</span><h2 id="contact-heading">Good things start<br />with a conversation.</h2><p>Have a project in mind, a role to share, or something interesting to talk about? My inbox is open.</p><div className="contact-actions"><a className="primary-button" href={`mailto:${profile.email}`}>Say hello<Send size={15} /></a><button className="copy-email" onClick={copyEmail}>{copied ? <Check size={15} /> : <Copy size={15} />}<span>{copied ? 'Email copied' : 'Copy email'}</span></button></div><p className="email-address"><a href={`mailto:${profile.email}`}>{profile.email}</a></p><span className="sr-only" role="status">{copied ? 'Email address copied to clipboard.' : copyError ? `Could not copy. Email me at ${profile.email}.` : ''}</span>{copyError && <p className="copy-error">Clipboard unavailable. Select the email address above or use “Say hello.”</p>}</div></section>
        <footer className="footer"><span>Designed with intention. Built by Santiago.</span><div><span>© {new Date().getFullYear()}</span><button onClick={() => navigate('overview')}>Back to top<ArrowUpRight size={13} /></button></div></footer>
      </main>
      <div className="statusbar"><span><span className="status-dot" />All systems personal.</span><div><GitBranch size={12} /><span>main</span><span className="status-divider" /><span>Made for the web</span><span className="encoding">UTF-8</span></div></div>
    </div>

    <dialog ref={palette} className="command-dialog" aria-labelledby="command-heading" onCancel={() => setPaletteOpen(false)} onClose={() => setPaletteOpen(false)} onClick={event => { if (event.target === event.currentTarget) setPaletteOpen(false); }}><div className="palette-search"><Command size={19} /><input id="command-heading" autoFocus placeholder="Where would you like to go?" aria-label="Search commands" value={search} onChange={event => setSearch(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && paletteItems.length) { event.preventDefault(); paletteItems[0].action(); } }} /><button className="dialog-close" onClick={() => setPaletteOpen(false)} aria-label="Close command menu"><X size={18} /></button></div><div className="palette-results">{paletteItems.length ? paletteItems.map(item => <button key={item.label} onClick={item.action}><item.icon size={17} /><span>{item.label}<small>{item.detail}</small></span><ChevronRight size={15} /></button>) : <p className="no-results">No matching commands. Try “work”, “theme”, or “terminal”.</p>}</div><div className="palette-footer"><span>Tab to choose · Enter to open</span><span>Esc to close</span></div></dialog>

    <dialog ref={projectDialog} className="project-dialog" aria-labelledby="project-dialog-heading" onCancel={() => setSelectedProject(null)} onClose={() => setSelectedProject(null)} onClick={event => { if (event.target === event.currentTarget) setSelectedProject(null); }}>{selectedProject && <><div className="project-dialog-top"><span><Folder size={15} />Work notes / {selectedProject.id}</span><button className="dialog-close" aria-label="Close work details" onClick={() => setSelectedProject(null)}><X size={20} /></button></div><div className="project-dialog-content"><span className="section-path">{selectedProject.category}</span><h2 id="project-dialog-heading">{selectedProject.title}</h2><p className="dialog-organization">{selectedProject.organization}</p><p className="dialog-summary">{selectedProject.summary}</p><h3>My contributions</h3><ul>{selectedProject.details.map(detail => <li key={detail}>{detail}</li>)}</ul><div className="project-tags">{selectedProject.tags.map(tag => <span key={tag}>{tag}</span>)}</div><div className="project-disclosure"><ShieldCheck size={19} /><p>{selectedProject.note}</p></div>{selectedProject.type === 'Open source' && <a href={profile.github} target="_blank" rel="noreferrer" className="primary-button">View my GitHub<ExternalLink size={15} /></a>}</div></>}</dialog>
  </>;
}

function CornerEnter() { return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M12 3v6H3m0 0 3-3M3 9l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function AtomIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><ellipse cx="12" cy="12" rx="10" ry="4" /><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" /><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" /><circle cx="12" cy="12" r="1.3" fill="currentColor" /></svg>; }
function CloudIcon() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M7 18a5 5 0 1 1 .5-9.98A6.5 6.5 0 0 1 20 10a4 4 0 0 1-1 8H7Z" /></svg>; }

export default App;
