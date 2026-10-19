import { getContent } from './localization';
import type { Language } from './localization';

export const filenames: Record<string, string> = {
  healthcare: 'healthcare-audio.md',
  'real-estate': 'real-estate.md',
  pearai: 'pearai.md',
  'linux-installer': 'linux-installer.md',
  pathfinding: 'pathfinding.md',
};
export type PortfolioDocument = {
  path: string;
  title: string;
  lines: string[];
  projectId?: string;
};
export type SearchRequest = { query: string; ignoreCase: boolean; target?: string };
export type SearchHit = { path: string; line: number; text: string; projectId?: string };

export function getDocuments(language: Language): PortfolioDocument[] {
  const { profile, projects, experience, skillGroups } = getContent(language);
  const es = language === 'es';
  return [
    {
      path: 'about.txt',
      title: profile.name,
      lines: [
        profile.name,
        es ? 'Ingeniero de software full-stack' : 'Full-stack software engineer',
        'Houston, Texas',
        '',
        es
          ? 'Más de 3 años desarrollando aplicaciones web y servicios backend.'
          : '3+ years building web applications and backend services.',
        'TypeScript, React, Next.js, Python, AWS',
        es ? 'Español (nativo), inglés (fluido)' : 'Spanish (native), English (fluent)',
        '',
        profile.github,
        profile.linkedin,
      ],
    },
    {
      path: 'experience.txt',
      title: es ? 'Experiencia' : 'Experience',
      lines: [
        es ? '# Experiencia' : '# Experience',
        '',
        ...experience.flatMap((job) => [
          job.company + ' / ' + job.dates,
          job.role,
          ...(job.client ? [job.client] : []),
          job.detail,
          '',
        ]),
        es ? '# Educación' : '# Education',
        es
          ? 'Ingeniería de Sistemas / Escuela Militar de Ingeniería'
          : 'Systems Engineering / Escuela Militar de Ingeniería',
        es
          ? '2024 / Primer puesto, graduado con honores'
          : '2024 / First in class, graduated with honors',
        '',
        'MBA / UNEATLANTICO & UNINI-MX',
        es ? 'En curso / Finalización prevista: 2028' : 'In progress / Expected 2028',
      ],
    },
    {
      path: 'skills.txt',
      title: es ? 'Habilidades' : 'Skills',
      lines: skillGroups.flatMap((group) => ['# ' + group.title, group.skills.join(', '), '']),
    },
    {
      path: 'contact.txt',
      title: es ? 'Contacto' : 'Contact',
      lines: [es ? '# Contacto' : '# Contact', '', profile.email, profile.github, profile.linkedin],
    },
    ...projects.map((project) => ({
      path: 'work/' + filenames[project.id],
      title: project.title,
      projectId: project.id,
      lines: [
        '# ' + project.title,
        project.organization,
        '',
        project.summary,
        '',
        ...project.details.map((detail) => '- ' + detail),
        '',
        project.tags.join(' / '),
        '',
        project.note,
        ...(project.repositories?.length
          ? ['', ...project.repositories.map((repo) => repo.label + ': ' + repo.url)]
          : []),
      ],
    })),
  ];
}

export function resolveDocument(input: string, path: string, language: Language) {
  let name = input
    .trim()
    .replace(/^~\//, '')
    .replace(/^\/home\/maxfsp\/portfolio\//, '');
  if (name.startsWith('./')) name = name.slice(2);
  if (path === '~/work' && !name.startsWith('work/') && !name.startsWith('../'))
    name = 'work/' + name;
  else if (name.startsWith('../')) name = name.slice(3);
  return getDocuments(language).find((document) => document.path === name);
}

export function searchDocuments(request: SearchRequest, language: Language): SearchHit[] {
  const query = request.ignoreCase ? request.query.toLocaleLowerCase(language) : request.query;
  return getDocuments(language)
    .filter(
      (document) =>
        !request.target ||
        (request.target === 'work/'
          ? document.path.startsWith('work/')
          : document.path === request.target),
    )
    .flatMap((document) =>
      document.lines.flatMap((line, index) => {
        const candidate = request.ignoreCase ? line.toLocaleLowerCase(language) : line;
        return candidate.includes(query)
          ? [{ path: document.path, line: index + 1, text: line, projectId: document.projectId }]
          : [];
      }),
    );
}

/** Tokenize quoted arguments; this never invokes a shell or evaluates input. */
export function tokenize(command: string): string[] | null {
  const tokens: string[] = [];
  let value = '';
  let quote = '';
  let started = false;
  for (let index = 0; index < command.length; index++) {
    const char = command[index];
    if (char === '\\' && index + 1 < command.length) {
      value += command[++index];
      started = true;
    } else if (quote) {
      if (char === quote) quote = '';
      else value += char;
    } else if (char === '"' || char === "'") {
      quote = char;
      started = true;
    } else if (/\s/.test(char)) {
      if (started) {
        tokens.push(value);
        value = '';
        started = false;
      }
    } else {
      value += char;
      started = true;
    }
  }
  if (quote) return null;
  if (started) tokens.push(value);
  return tokens;
}
