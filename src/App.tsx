import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { profile } from './content';
import CommandInput from './components/CommandInput';
import PortfolioOutput from './PortfolioOutput';
import Pager from './components/Pager';
import ReferencePane from './components/ReferencePane';
import Snake from './components/Snake';
import SessionTabs from './components/SessionTabs';
import ProfileLinks from './components/ProfileLinks';
import StartHere from './components/StartHere';
import { resolveSkill, skillProjects } from './skill-evidence';
import { useSessions } from './hooks/useSessions';
import type { Entry, View } from './hooks/useSessions';
import { filenames, getDocuments, resolveDocument, tokenize } from './documents';
import type { SearchRequest } from './documents';
import { getContent, initialLanguage, text } from './localization';
import type { Language } from './localization';
import { crtPresets, readCrt } from './crt';
import { manuals } from './manual';
import { resolveTheme, themes } from './themes';
import type { Theme } from './themes';

const resumeUrl = import.meta.env.BASE_URL + 'resume.pdf';
const ChunkLab = lazy(() => import('./components/ChunkLab'));
const commands = ['whoami', 'work', 'experience', 'skills', 'contact', 'help'];
const completionOptions = [
  ...commands,
  'start',
  'tour',
  'contributions',
  'contributions merged',
  'contributions open',
  ...Object.keys(skillProjects).map((skill) => 'skills ' + skill),
  'about',
  'ls',
  'pwd',
  'resume',
  'theme',
  ...themes.map((theme) => 'theme ' + theme.id),
  'crt on',
  'crt off',
  'crt soft',
  'crt strong',
  'clear',
  'tree',
  'history',
  '!!',
  'snake',
  'split on',
  'split off',
  'demo chunks',
  'tab new',
  'tab list',
  'tab close',
  'tab rename ',
  'lang en',
  'lang es',
  ...Object.keys(filenames).map((id) => 'share ' + id),
  'grep ',
  'man',
  ...Object.keys(manuals).map((command) => 'man ' + command),
  ...[
    'about.txt',
    'experience.txt',
    'skills.txt',
    'contact.txt',
    ...Object.values(filenames).map((file) => 'work/' + file),
  ].flatMap((file) => ['cat ' + file, 'less ' + file]),
  'cd work',
  'cd ..',
];
const themeKey = 'portfolio-terminal-theme';

function initialEntries(): Entry[] {
  const hash = window.location.hash.slice(1);
  const project = Object.keys(filenames).find((id) => hash === 'work/' + id);
  if (project)
    return [
      { id: 0, command: 'cat work/' + filenames[project], path: '~', view: 'project', project },
    ];
  const routes: Record<string, View> = {
    about: 'about',
    overview: 'about',
    work: 'work',
    experience: 'experience',
    skills: 'skills',
    contact: 'contact',
    contributions: 'contributions',
  };
  const view = Object.hasOwn(routes, hash) ? routes[hash] : undefined;
  if (view) return [{ id: 0, command: view === 'about' ? 'whoami' : view, path: '~', view }];
  return [
    { id: 0, command: 'whoami', path: '~', view: 'about' },
    { id: 1, command: 'ls work/', path: '~', view: 'work' },
  ];
}

function Prompt({ path = '~' }: { path?: string }) {
  return (
    <span className="prompt">
      <span className="prompt-user">maxfsp</span>
      <span className="prompt-host">@portfolio</span>
      <span className="prompt-colon">:</span>
      <span className="prompt-path">{path}</span>
      <span className="prompt-dollar">$</span>
    </span>
  );
}

function App() {
  const [theme, setTheme] = useState<Theme>(
    () => resolveTheme(document.documentElement.dataset.theme || '') || 'dark',
  );
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [crtSettings, setCrtSettings] = useState(readCrt);
  const {
    sessions,
    session,
    activeId,
    createSession,
    closeSession,
    renameSession,
    switchSession,
    setEntries,
    setInput,
    setHistory,
    setHistoryIndex,
    setDraft,
    setCompletions,
    setSearching,
    setSearchDraft,
    setSearchIndex,
    setPath,
    setMode,
    setSplit,
    setSplitFile,
    setSplitDemo,
    setSnake,
  } = useSessions(initialEntries);
  const {
    entries,
    input,
    history,
    historyIndex,
    draft,
    completions,
    searching,
    searchDraft,
    searchIndex,
    path,
    mode,
    split,
    splitFile,
    splitDemo,
    snake,
  } = session;
  const { projects } = getContent(language);
  const t = (en: string, es: string) => text(language, en, es);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLElement>(null);
  const nextId = useRef(2);
  const shouldScroll = useRef(false);
  const copyTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const scrollPositions = useRef<Record<number, number>>({});
  const scrollSizes = useRef<Record<number, { height: number; total: number }>>({});
  const followOutput = useRef<Record<number, boolean>>({});
  const matches = [...history]
    .reverse()
    .filter(
      (command, index, all) =>
        all.indexOf(command) === index && command.toLowerCase().includes(input.toLowerCase()),
    );
  const searchMatch = matches[searchIndex % Math.max(matches.length, 1)];
  const availableCompletions =
    path === '~/work'
      ? [
          ...completionOptions,
          ...Object.values(filenames).flatMap((file) => ['cat ' + file, 'less ' + file]),
        ]
      : completionOptions;
  const suggestion =
    !searching && input
      ? [...history].reverse().find((command) => command.startsWith(input) && command !== input) ||
        availableCompletions.find((command) => command.startsWith(input) && command !== input) ||
        ''
      : '';

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', themes.find((item) => item.id === theme)?.background || '#000000');
    try {
      localStorage.setItem(themeKey, theme);
    } catch {
      /* Themes also work without storage. */
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.crt = crtSettings.enabled ? 'on' : 'off';
    document.documentElement.dataset.crtAll = crtSettings.allDark ? 'on' : 'off';
    document.documentElement.style.setProperty(
      '--crt-scanline-opacity',
      String(crtSettings.scanlines * 0.0024),
    );
    document.documentElement.style.setProperty('--crt-glow', String(crtSettings.glow));
    try {
      localStorage.setItem('portfolio-crt-effects', crtSettings.enabled ? 'on' : 'off');
      localStorage.setItem('portfolio-crt-settings', JSON.stringify(crtSettings));
    } catch {
      /* Settings work without storage. */
    }
  }, [crtSettings]);

  useEffect(() => {
    document.documentElement.lang = language;
    try {
      localStorage.setItem('portfolio-language', language);
    } catch {
      /* Language also works without storage. */
    }
    const url = new URL(window.location.href);
    if (url.searchParams.has('lang')) {
      url.searchParams.set('lang', language);
      window.history.replaceState(null, '', url);
    }
  }, [language]);

  useEffect(() => {
    function onHashChange() {
      const hash = window.location.hash.slice(1);
      if (
        ![
          'about',
          'overview',
          'work',
          'experience',
          'skills',
          'contact',
          'contributions',
          ...Object.keys(filenames).map((id) => 'work/' + id),
        ].includes(hash)
      )
        return;
      const entry = initialEntries()[0];
      shouldScroll.current = true;
      setMode(null);
      setEntries((items) => [...items.slice(-49), { ...entry, id: nextId.current++ }]);
    }
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [setEntries, setMode]);

  useLayoutEffect(() => {
    const area = scrollRef.current;
    if (!area) return;
    area.scrollTop = scrollPositions.current[activeId] || 0;
    scrollSizes.current[activeId] = { height: area.clientHeight, total: area.scrollHeight };
    if (followOutput.current[activeId] === undefined)
      followOutput.current[activeId] = area.scrollHeight <= area.clientHeight;
  }, [activeId, mode]);

  useEffect(() => {
    const area = scrollRef.current;
    if (!area) return;
    const observer = new ResizeObserver(() => {
      if (followOutput.current[activeId]) area.scrollTop = area.scrollHeight;
      scrollSizes.current[activeId] = { height: area.clientHeight, total: area.scrollHeight };
    });
    observer.observe(area);
    for (const selector of ['.transcript', '.prompt-line']) {
      const element = area.querySelector(selector);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [activeId, mode]);

  useEffect(() => {
    if (!shouldScroll.current) return;
    shouldScroll.current = false;
    const area = scrollRef.current;
    if (area) area.scrollTop = area.scrollHeight;
  }, [entries]);

  useEffect(() => {
    if (window.matchMedia('(pointer: fine)').matches)
      inputRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    function onKey(event: globalThis.KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setMode(null);
        requestAnimationFrame(() => inputRef.current?.focus());
      }
    }
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [setMode]);

  useEffect(() => () => clearTimeout(copyTimeout.current), []);

  function append(
    command: string,
    view: View,
    message?: string,
    project?: string,
    search?: SearchRequest,
  ) {
    shouldScroll.current = true;
    followOutput.current[activeId] = true;
    const id = nextId.current++;
    setEntries((items) => [
      ...items.slice(-49),
      { id, command, path, view, message, project, search },
    ]);
    if (view === 'project' && project) window.history.replaceState(null, '', '#work/' + project);
    else if (['about', 'work', 'experience', 'skills', 'contact', 'contributions'].includes(view))
      window.history.replaceState(null, '', '#' + view);
    return id;
  }

  function closeMode() {
    setMode(null);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  async function copyProjectLink(entry: Entry) {
    try {
      await navigator.clipboard.writeText(entry.message || '');
      setEntries((items) =>
        items.map((item) => (item.id === entry.id ? { ...item, copyStatus: 'copied' } : item)),
      );
    } catch {
      setEntries((items) =>
        items.map((item) => (item.id === entry.id ? { ...item, copyStatus: 'failed' } : item)),
      );
    }
  }

  function run(raw: string) {
    const requested = raw.trim();
    if (!requested) return;
    const command = requested === '!!' ? history.at(-1) : requested;
    setHistoryIndex(-1);
    setInput('');
    setDraft('');
    setCompletions([]);
    setSearching(false);
    setMode(null);
    if (!command) {
      append(
        requested,
        'text',
        t(
          '!!: no previous command in this session.',
          '!!: no hay un comando anterior en esta sesión.',
        ),
      );
      return;
    }
    setHistory((items) => [...items, command]);
    const normalized = command.toLowerCase().replace(/\s+/g, ' ');
    const [name, ...args] = normalized.split(' ');
    const argument = args.join(' ');
    if (name === 'start' || name === 'tour') {
      if (argument) {
        append(command, 'text', 'Usage: start');
        return;
      }
      append(command, 'text');
      setMode({ type: 'tour', step: 0 });
      return;
    }
    if (name === 'contributions') {
      if (argument && !['all', 'merged', 'open', 'closed'].includes(argument)) {
        append(command, 'text', 'Usage: contributions [all|merged|open|closed]');
        return;
      }
      append(command, 'contributions', argument || undefined);
      return;
    }
    if (name === 'skills' && argument) {
      const selected = resolveSkill(argument);
      if (!selected) {
        append(
          command,
          'text',
          t(
            'No linked examples for that skill. Run skills to see the list.',
            'No hay ejemplos enlazados para esa habilidad. Ejecuta skills para ver la lista.',
          ),
        );
        return;
      }
      append(command, 'skills', selected);
      return;
    }
    if (name === 'lang') {
      if (!['en', 'es'].includes(argument)) {
        append(
          command,
          'text',
          t(
            'Usage: lang [en|es]. Current language: English.',
            'Uso: lang [en|es]. Idioma actual: español.',
          ),
        );
        return;
      }
      setLanguage(argument as Language);
      append(command, 'text', argument === 'es' ? 'Idioma: español.' : 'Language: English.');
      return;
    }
    if (name === 'tab') {
      const [action, ...targetParts] = args;
      const target = targetParts.join(' ');
      if (action === 'rename') {
        const rawName = command.replace(/^tab\s+rename(?:\s+|$)/i, '').trim();
        const tokens = tokenize(rawName);
        const newName = tokens?.join(' ') || '';
        if (!tokens || !renameSession(activeId, newName)) {
          append(
            command,
            'text',
            t(
              'Usage: tab rename <name> (1–24 characters).',
              'Uso: tab rename <nombre> (1–24 caracteres).',
            ),
          );
        } else append(command, 'text', t('Shell renamed: ', 'Sesión renombrada: ') + newName);
        return;
      }
      if (!action || action === 'list') {
        append(
          command,
          'text',
          sessions
            .map(
              (item) =>
                (item.id === activeId ? '* ' : '  ') +
                item.id +
                '  ' +
                item.name +
                '  ' +
                item.path,
            )
            .join('\n'),
        );
        return;
      }
      if (action === 'new') {
        if (!createSession(target || undefined))
          append(
            command,
            'text',
            t(
              'Maximum 8 sessions. Close one before opening another.',
              'Máximo 8 sesiones. Cierra una antes de abrir otra.',
            ),
          );
        else {
          append(command, 'text');
          requestAnimationFrame(() => inputRef.current?.focus());
        }
        return;
      }
      const chosen = target
        ? sessions.find((item) => String(item.id) === target || item.name.toLowerCase() === target)
        : session;
      if (action === 'switch' && chosen) {
        append(command, 'text');
        switchSession(chosen.id);
        return;
      }
      if (action === 'close' && chosen) {
        if (!closeSession(chosen.id))
          append(
            command,
            'text',
            t('The last session stays open.', 'La última sesión permanece abierta.'),
          );
        else append(command, 'text');
        return;
      }
      append(command, 'text', 'Usage: tab [list|new <name>|rename <name>|switch <id>|close <id>]');
      return;
    }
    if (name === 'less') {
      const file = resolveDocument(argument, path, language);
      if (!file) {
        append(
          command,
          'text',
          t('less: no such file: ', 'less: no existe el archivo: ') + argument,
        );
        return;
      }
      append(command, 'text');
      setMode({ type: 'pager', path: file.path });
      return;
    }
    if (name === 'grep') {
      const tokens = tokenize(command);
      const values = tokens?.slice(1) || [];
      const ignoreCase = values[0] === '-i';
      if (ignoreCase) values.shift();
      if (
        !tokens ||
        values.length < 1 ||
        values.length > 2 ||
        !values[0] ||
        values[0].startsWith('-')
      ) {
        append(command, 'text', 'Usage: grep [-i] <text> [file|work/]');
        return;
      }
      let target: string | undefined;
      if (values[1]) {
        if (['work', 'work/', '~/work', '~/work/'].includes(values[1])) target = 'work/';
        else {
          const file = resolveDocument(values[1], path, language);
          if (!file) {
            append(
              command,
              'text',
              t('grep: no such file: ', 'grep: no existe el archivo: ') + values[1],
            );
            return;
          }
          target = file.path;
        }
      }
      append(command, 'grep', undefined, undefined, { query: values[0], ignoreCase, target });
      return;
    }
    if (name === 'share') {
      const candidate =
        argument.replace(/^(~\/)?work\//, '').replace(/\.md$/, '') ||
        [...entries].reverse().find((item) => item.project)?.project;
      const project = projects.find(
        (item) => item.id === candidate || filenames[item.id].replace('.md', '') === candidate,
      );
      if (!project) {
        append(command, 'text', 'Usage: share [' + Object.keys(filenames).join('|') + ']');
        return;
      }
      const url = new URL(window.location.pathname, window.location.origin);
      url.searchParams.set('lang', language);
      url.hash = 'work/' + project.id;
      const id = append(command, 'share', url.href, project.id);
      void copyProjectLink({
        id,
        command,
        path,
        view: 'share',
        message: url.href,
        project: project.id,
      });
      return;
    }
    if (name === 'snake') {
      append(command, 'text');
      setMode({ type: 'snake' });
      return;
    }
    if (name === 'split') {
      const file =
        argument && !['on', 'off'].includes(argument)
          ? resolveDocument(argument, path, language)
          : undefined;
      if (argument && !['on', 'off'].includes(argument) && !file) {
        append(
          command,
          'text',
          t(
            'split: no such file. Usage: split [on|off|file]',
            'split: no existe el archivo. Uso: split [on|off|archivo]',
          ),
        );
        return;
      }
      const enabled = file ? true : argument ? argument === 'on' : !split;
      setSplit(enabled);
      if (enabled) {
        setSplitDemo(false);
        if (file) setSplitFile(file.path);
        append(
          command,
          'text',
          t('Reference open: ', 'Referencia abierta: ') + (file?.path || splitFile),
        );
      } else append(command, 'text', t('Split pane closed.', 'Panel dividido cerrado.'));
      return;
    }
    if (name === 'demo') {
      if (argument !== 'chunks') {
        append(command, 'text', 'Usage: demo chunks');
        return;
      }
      setSplit(true);
      setSplitDemo(true);
      append(
        command,
        'text',
        t(
          'Chunking lab opened. Use split on to return to file reference.',
          'Laboratorio abierto. Usa split on para volver a la referencia de archivos.',
        ),
      );
      return;
    }
    if (name === 'clear') {
      setEntries([]);
      return;
    }
    if (name === 'theme' || name === 'themes') {
      if (!argument || argument === 'list') {
        append(command, 'themes');
        return;
      }
      const choice = resolveTheme(argument);
      if (!choice) {
        append(command, 'text', 'Usage: theme [dark|amber|phosphor|paper|light|list]');
        return;
      }
      setTheme(choice);
      append(
        command,
        'text',
        'Theme: ' +
          themes.find((item) => item.id === choice)?.label +
          (choice === 'amber' || choice === 'phosphor'
            ? '\nUse crt off to remove scanlines and glow.'
            : ''),
      );
      return;
    }
    if (name === 'crt') {
      if (!argument) {
        append(command, 'crt');
        return;
      }
      if (argument === 'soft' || argument === 'strong') setCrtSettings(crtPresets[argument]);
      else if (argument === 'on' || argument === 'off')
        setCrtSettings((value) => ({ ...value, enabled: argument === 'on', allDark: true }));
      else if (
        ['scanlines', 'glow'].includes(args[0]) &&
        args.length === 2 &&
        /^\d+$/.test(args[1]) &&
        Number(args[1]) <= 100
      )
        setCrtSettings((value) => ({
          ...value,
          [args[0]]: Number(args[1]),
          enabled: true,
          allDark: true,
        }));
      else {
        append(command, 'text', 'Usage: crt [on|off|soft|strong|scanlines 0..100|glow 0..100]');
        return;
      }
      append(command, 'crt');
      return;
    }
    if (name === 'man') {
      if (argument && !Object.hasOwn(manuals, argument)) {
        append(
          command,
          'text',
          'No manual entry for ' + argument + '. Run man to list available pages.',
        );
        return;
      }
      append(command, 'manual', argument || undefined);
      return;
    }
    if (name === 'pwd') {
      append(command, 'text', '/home/maxfsp/portfolio' + (path === '~/work' ? '/work' : ''));
      return;
    }
    if (name === 'history') {
      append(
        command,
        'text',
        [...history, command]
          .map((item, index) => String(index + 1).padStart(3) + '  ' + item)
          .join('\n'),
      );
      return;
    }
    if (name === 'tree') {
      if (argument && !['work', 'work/', '~/work', '~/work/', '.', '~', '~/'].includes(argument)) {
        append(command, 'text', 'tree: no such directory: ' + argument);
        return;
      }
      append(
        command,
        'tree',
        argument.includes('work') || ((!argument || argument === '.') && path === '~/work')
          ? 'work'
          : 'root',
      );
      return;
    }
    if (name === 'cd') {
      if (['work', 'work/', '~/work', '~/work/'].includes(argument)) {
        setPath('~/work');
        append(command, 'text');
      } else if (['', '~', '..', '../', '/', '~/'].includes(argument)) {
        setPath('~');
        append(command, 'text');
      } else
        append(
          command,
          'text',
          'cd: no such directory: ' + argument + '\nAvailable directory: ~/work',
        );
      return;
    }
    const candidate =
      (name === 'cat' || name === 'work') && argument
        ? argument.replace(/^(~\/)?work\//, '').replace(/\.md$/, '')
        : '';
    const selected = projects.find(
      (project) =>
        project.id === candidate || filenames[project.id].replace('.md', '') === candidate,
    );
    if (selected) {
      append(command, 'project', undefined, selected.id);
      return;
    }
    if (name === 'work' && argument) {
      append(
        command,
        'text',
        'work: no such entry: ' + argument + '\nRun ls work/ to see available files.',
      );
      return;
    }
    if (name === 'cat' && argument === 'resume.pdf') {
      append(command, 'resume');
      return;
    }
    if (name === 'ls') {
      if (argument && !['work', 'work/', '~/work', '~/work/', '.', '~', '~/'].includes(argument)) {
        append(command, 'text', 'ls: no such directory: ' + argument);
        return;
      }
      append(
        command,
        argument.includes('work') || ((!argument || argument === '.') && path === '~/work')
          ? 'work'
          : 'help',
      );
      return;
    }
    const file =
      name === 'cat'
        ? argument.replace(/^~\//, '').replace(/\.txt$/, '')
        : name === 'open'
          ? argument
          : name;
    const views: Record<string, View> = {
      whoami: 'about',
      about: 'about',
      overview: 'about',
      work: 'work',
      projects: 'work',
      experience: 'experience',
      skills: 'skills',
      contact: 'contact',
      help: 'help',
      resume: 'resume',
    };
    if (Object.hasOwn(views, file)) {
      append(command, views[file]);
      return;
    }
    append(
      command,
      'text',
      name === 'cat'
        ? 'cat: no such file: ' + argument + '\nRun ls to see available files.'
        : name === 'open'
          ? 'Choose a section: about, work, experience, skills, contact.'
          : command + ': command not found\nRun help to see available commands.',
    );
  }

  function updateInput(value: string) {
    setInput(value);
    setCompletions([]);
    setSearchIndex(0);
  }

  function selectHistory() {
    setInput(searchMatch || searchDraft);
    setSearching(false);
    setSearchIndex(0);
    setHistoryIndex(-1);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (searching) selectHistory();
    else run(input);
    inputRef.current?.focus({ preventScroll: true });
  }

  function inputKeys(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return;
    if (event.ctrlKey && event.key.toLowerCase() === 'r') {
      event.preventDefault();
      setCompletions([]);
      if (!searching) {
        setSearchDraft(input);
        setInput('');
        setSearchIndex(0);
        setSearching(true);
      } else setSearchIndex((index) => index + 1);
      return;
    }
    if (searching) {
      if (event.key === 'Escape' || (event.ctrlKey && event.key.toLowerCase() === 'g')) {
        event.preventDefault();
        setInput(searchDraft);
        setSearching(false);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        selectHistory();
      }
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'l') {
      event.preventDefault();
      setEntries([]);
      setCompletions([]);
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setCompletions([]);
      if (historyIndex === -1) setDraft(input);
      const next = Math.min(historyIndex + 1, history.length - 1);
      if (next >= 0) {
        setHistoryIndex(next);
        setInput(history[history.length - 1 - next]);
      }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setCompletions([]);
      const next = Math.max(historyIndex - 1, -1);
      setHistoryIndex(next);
      setInput(next < 0 ? draft : history[history.length - 1 - next]);
    } else if (event.key === 'Tab' && input) {
      if (event.shiftKey) return;
      if (completions.length) {
        event.preventDefault();
        scrollRef.current?.querySelector<HTMLButtonElement>('.completion-options button')?.focus();
        return;
      }
      const options = availableCompletions.filter((command) =>
        command.startsWith(input.toLowerCase()),
      );
      if (options.length) {
        event.preventDefault();
        if (options.length === 1) {
          setInput(options[0]);
          setCompletions([]);
        } else setCompletions(options);
      }
    } else if (
      event.key === 'ArrowRight' &&
      suggestion &&
      event.currentTarget.selectionStart === input.length &&
      event.currentTarget.selectionEnd === input.length
    ) {
      event.preventDefault();
      setInput(suggestion);
      setCompletions([]);
    } else if (event.key === 'Escape') {
      if (completions.length) setCompletions([]);
      else {
        setInput('');
        setHistoryIndex(-1);
      }
    }
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setCopyError(false);
      clearTimeout(copyTimeout.current);
      copyTimeout.current = setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopyError(true);
    }
  }

  const activeDocument =
    mode?.type === 'pager'
      ? getDocuments(language).find((item) => item.path === mode.path)
      : undefined;

  function renderOutput(entry: Entry, compactContributions = false) {
    return (
      <PortfolioOutput
        entry={entry}
        language={language}
        theme={theme}
        setTheme={setTheme}
        crtSettings={crtSettings}
        setCrtSettings={setCrtSettings}
        run={run}
        copyEmail={copyEmail}
        copied={copied}
        copyError={copyError}
        copyProjectLink={copyProjectLink}
        compactContributions={compactContributions}
      />
    );
  }

  return (
    <div className="terminal-app">
      <h1 className="sr-only">
        Santiago Paz Farfán — {t('terminal portfolio', 'portafolio en terminal')}
      </h1>
      <a href="#command-input" className="skip-link" onClick={closeMode}>
        {t('Skip to command prompt', 'Ir al comando')}
      </a>
      <header className="window-bar">
        <span className="window-title">
          <span aria-hidden="true">&gt;_</span>
          <span>
            maxfsp<span className="title-host">@portfolio</span>
          </span>
        </span>
        <nav className="command-nav" aria-label="Portfolio commands">
          <button className="start-button" onClick={() => run('start')}>
            {t('Start here', 'Empieza aquí')}
          </button>
          {commands.map((command) => (
            <button key={command} onClick={() => run(command)}>
              {command}
            </button>
          ))}
        </nav>
        <div className="window-actions">
          <a
            className="header-resume"
            href={resumeUrl}
            download="Santiago-Paz-Farfan-Resume.pdf"
            aria-label={t('Download résumé', 'Descargar currículum')}
          >
            {t('resume', 'CV')} ↓
          </a>
          <select
            className="language-picker"
            aria-label={t('Language', 'Idioma')}
            value={language}
            onChange={(event) => setLanguage(event.target.value as Language)}
          >
            <option value="en">EN</option>
            <option value="es">ES</option>
          </select>
          <select
            className="theme-picker"
            aria-label={t('Terminal theme', 'Tema del terminal')}
            value={theme}
            onChange={(event) => {
              const choice = resolveTheme(event.target.value);
              if (choice) setTheme(choice);
            }}
          >
            {themes.map((item) => (
              <option key={item.id} value={item.id}>
                {language === 'es' ? item.labelEs : item.label}
              </option>
            ))}
          </select>
          <ProfileLinks language={language} />
        </div>
      </header>
      <SessionTabs
        sessions={sessions}
        activeId={activeId}
        select={switchSession}
        create={() => {
          createSession();
          requestAnimationFrame(() => inputRef.current?.focus());
        }}
        close={() => closeSession(activeId)}
        rename={renameSession}
        split={split}
        toggleSplit={() => run(split ? 'split off' : 'split on')}
        language={language}
      />
      <div
        id="session-panel"
        className={'workspace-panels ' + (split ? 'is-split' : '')}
        role="tabpanel"
        aria-labelledby={'session-tab-' + activeId}
      >
        {activeDocument ? (
          <Pager document={activeDocument} language={language} onClose={closeMode} />
        ) : mode?.type === 'snake' ? (
          <Snake game={snake} setGame={setSnake} language={language} onClose={closeMode} />
        ) : mode?.type === 'tour' ? (
          <StartHere
            step={mode.step}
            language={language}
            setStep={(step) => setMode({ type: 'tour', step })}
            close={closeMode}
            run={run}
            render={(view) => renderOutput({ id: -1, command: '', path, view }, true)}
          />
        ) : (
          <main
            className="terminal-scroll"
            ref={scrollRef}
            aria-label={t('Terminal output', 'Salida del terminal')}
            tabIndex={0}
            onScroll={(event) => {
              const area = event.currentTarget;
              const previous = scrollSizes.current[activeId];
              if (
                !previous ||
                (previous.height === area.clientHeight && previous.total === area.scrollHeight)
              )
                followOutput.current[activeId] =
                  area.scrollHeight - area.scrollTop - area.clientHeight < 32;
              scrollSizes.current[activeId] = {
                height: area.clientHeight,
                total: area.scrollHeight,
              };
              scrollPositions.current[activeId] = area.scrollTop;
            }}
            onClick={(event) => {
              if (event.target === event.currentTarget && !window.getSelection()?.toString())
                inputRef.current?.focus();
            }}
          >
            <div className="transcript" role="log" aria-live="polite" aria-relevant="additions">
              {entries.map((entry) => (
                <section className="transcript-entry" key={entry.id}>
                  <div className="command-echo">
                    <Prompt path={entry.path} />
                    <span>{entry.command}</span>
                  </div>
                  <div className="command-output">{renderOutput(entry)}</div>
                </section>
              ))}
            </div>
            <div className="prompt-line">
              <form className="command-form" onSubmit={submit}>
                {searching ? (
                  <span className="search-label">(reverse-i-search):</span>
                ) : (
                  <Prompt path={path} />
                )}
                <CommandInput
                  value={input}
                  suggestion={suggestion}
                  inputRef={inputRef}
                  searching={searching}
                  onChange={updateInput}
                  onKeyDown={inputKeys}
                  language={language}
                />
                <button
                  type="submit"
                  className="run-button"
                  aria-label={
                    searching
                      ? t('Select history command', 'Seleccionar comando anterior')
                      : t('Run command', 'Ejecutar comando')
                  }
                >
                  ↵
                </button>
              </form>
              {searching && (
                <div className="history-search" role="status">
                  <span>
                    {searchMatch ||
                      (input
                        ? t('No matching commands.', 'No hay comandos coincidentes.')
                        : t('No commands in this session.', 'No hay comandos en esta sesión.'))}
                  </span>
                  <small>
                    {t(
                      'Enter select / Esc cancel / Ctrl+R previous',
                      'Enter selecciona / Esc cancela / Ctrl+R anterior',
                    )}
                  </small>
                </div>
              )}
              {completions.length > 0 && (
                <div
                  className="completion-options"
                  role="group"
                  aria-label="Command completions"
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                      setCompletions([]);
                      inputRef.current?.focus();
                    }
                  }}
                >
                  {completions.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setInput(option);
                        setCompletions([]);
                        inputRef.current?.focus();
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </main>
        )}
        {split &&
          (splitDemo ? (
            <Suspense
              fallback={
                <aside className="lab-panel" aria-busy="true">
                  {t('Loading lab…', 'Cargando laboratorio…')}
                </aside>
              }
            >
              <ChunkLab
                language={language}
                onClose={() => {
                  setSplit(false);
                  requestAnimationFrame(() => inputRef.current?.focus());
                }}
              />
            </Suspense>
          ) : (
            <ReferencePane
              file={splitFile}
              language={language}
              onChange={setSplitFile}
              onClose={() => {
                setSplit(false);
                requestAnimationFrame(() => inputRef.current?.focus());
              }}
            />
          ))}
      </div>
      <footer id="input-help" className="terminal-foot">
        <span>
          {mode?.type === 'pager' ? (
            t('j/k scroll / / search / q exit', 'j/k desplaza / / busca / q sale')
          ) : mode?.type === 'snake' ? (
            t('Arrows / Space pause / q exit', 'Flechas / Espacio pausa / q sale')
          ) : mode?.type === 'tour' ? (
            t('Select a step / Esc return to terminal', 'Elige un paso / Esc vuelve al terminal')
          ) : (
            <>
              {t('Tab complete / ↑↓ history', 'Tab completa / ↑↓ historial')}{' '}
              <span className="footer-detail">
                {t('/ Ctrl+R search / Ctrl+L clear', '/ Ctrl+R busca / Ctrl+L limpia')}
              </span>
            </>
          )}
        </span>
        <button onClick={() => run('help')}>help</button>
      </footer>
    </div>
  );
}

export default App;
