import type { Dispatch, SetStateAction } from 'react';
import { profile } from './content';
import { getContent, text } from './localization';
import type { Language } from './localization';
import { filenames } from './documents';
import type { Entry } from './hooks/useSessions';
import { themes } from './themes';
import type { Theme } from './themes';
import type { CrtSettings } from './crt';
import ManualPage from './components/ManualPage';
import CrtControls from './components/CrtControls';
import GrepOutput from './components/GrepOutput';
import ShareOutput from './components/ShareOutput';
import ContributionsOutput from './components/ContributionsOutput';
import SkillsOutput from './components/SkillsOutput';
const resumeUrl = import.meta.env.BASE_URL + 'resume.pdf';
const ascii = [
  '   _____ ____  ______',
  '  / ___// __ \\/ ____/',
  '  \\__ \\/ /_/ / /_   ',
  ' ___/ / ____/ __/   ',
  '/____/_/   /_/      ',
].join('\n');
type Props = {
  entry: Entry;
  language: Language;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  crtSettings: CrtSettings;
  setCrtSettings: Dispatch<SetStateAction<CrtSettings>>;
  run: (command: string) => void;
  copyEmail: () => void;
  copied: boolean;
  copyError: boolean;
  copyProjectLink: (entry: Entry) => void;
  compactContributions?: boolean;
};

export default function PortfolioOutput({
  entry,
  language,
  theme,
  setTheme,
  crtSettings,
  setCrtSettings,
  run,
  copyEmail,
  copied,
  copyError,
  copyProjectLink,
  compactContributions = false,
}: Props) {
  const { projects, experience } = getContent(language);
  const t = (en: string, es: string) => text(language, en, es);
  const crtEffects = crtSettings.enabled;
  const setCrtEffects = (value: SetStateAction<boolean>) =>
    setCrtSettings((previous) => ({
      ...previous,
      enabled: typeof value === 'function' ? value(previous.enabled) : value,
      allDark: true,
    }));
  const commandButton = (command: string, label?: string) => (
    <button className="file-link" onClick={() => run(command)}>
      {label || command}
    </button>
  );
  switch (entry.view) {
    case 'about':
      return (
        <div className="identity">
          <pre className="ascii-logo" aria-hidden="true">
            {ascii}
          </pre>
          <div className="identity-details">
            <h2 className="identity-name">Santiago Paz Farfán</h2>
            <p className="identity-role">
              {t('Full-stack software engineer', 'Ingeniero de software full-stack')}
            </p>
            <dl>
              <div>
                <dt>{t('based in', 'ubicación')}</dt>
                <dd>Houston, Texas</dd>
              </div>
              <div>
                <dt>stack</dt>
                <dd>TypeScript, React, Next.js, Python, AWS</dd>
              </div>
              <div>
                <dt>{t('experience', 'experiencia')}</dt>
                <dd>
                  {t(
                    '3+ years / web applications & backend services',
                    'Más de 3 años / aplicaciones web y servicios backend',
                  )}
                </dd>
              </div>
              <div>
                <dt>{t('languages', 'idiomas')}</dt>
                <dd>
                  {t('Spanish (native), English (fluent)', 'Español (nativo), inglés (fluido)')}
                </dd>
              </div>
            </dl>
            <div className="identity-links">
              {!compactContributions && (
                <button className="file-link start-link" onClick={() => run('start')}>
                  {t('Start here', 'Empieza aquí')}
                </button>
              )}
              <a href={profile.github} target="_blank" rel="noreferrer">
                github ↗
              </a>
              <a href={profile.linkedin} target="_blank" rel="noreferrer">
                linkedin ↗
              </a>
              <a href={resumeUrl} download="Santiago-Paz-Farfan-Resume.pdf">
                resume.pdf ↓
              </a>
            </div>
          </div>
        </div>
      );
    case 'work':
      return (
        <div className="work-output">
          <p className="output-comment">
            {t(
              'Professional work and open-source contributions.',
              'Trabajo profesional y contribuciones de código abierto.',
            )}
          </p>
          <div className="file-list">
            {projects.map((project) => (
              <div className="file-row" key={project.id}>
                <span className="file-permission">
                  {project.type === 'Professional work'
                    ? t('private', 'privado')
                    : t('public ', 'público')}
                </span>
                <button
                  className="file-link"
                  onClick={() => run('cat work/' + filenames[project.id])}
                  aria-label={t('Read ', 'Leer ') + project.title}
                >
                  {filenames[project.id]}
                </button>
                <span className="file-description">{project.category}</span>
              </div>
            ))}
          </div>
          <p className="output-comment work-disclosure">
            {t(
              'Client source is private. Public recreations are not available yet.',
              'El código de los clientes es privado. Todavía no hay recreaciones públicas disponibles.',
            )}
          </p>
          <p className="file-hint">
            {t('Click a filename to read it, or type ', 'Haz clic en un archivo o ejecuta ')}
            <span>work healthcare</span>.
          </p>
        </div>
      );
    case 'experience':
      return (
        <div className="experience-output">
          <h2>{t('Experience', 'Experiencia')}</h2>
          {experience.map((job, index) => (
            <article className="job" key={job.company + index}>
              <div className="job-heading">
                <h3>{job.company}</h3>
                <span>{job.dates}</span>
              </div>
              <p className="job-role">
                {job.role}
                {job.client ? ' / ' + job.client : ''}
              </p>
              <p>{job.detail}</p>
            </article>
          ))}
          <div className="education-output">
            <h3>{t('Education', 'Educación')}</h3>
            <p>
              {t(
                'Systems Engineering / Escuela Militar de Ingeniería',
                'Ingeniería de Sistemas / Escuela Militar de Ingeniería',
              )}
            </p>
            <p className="output-comment">
              {t(
                '2024 / First in class, graduated with honors',
                '2024 / Primer puesto, graduado con honores',
              )}
            </p>
            <p>MBA / UNEATLANTICO & UNINI-MX</p>
            <p className="output-comment">
              {t('In progress / Expected 2028', 'En curso / Finalización prevista: 2028')}
            </p>
          </div>
        </div>
      );
    case 'skills':
      return <SkillsOutput language={language} selected={entry.message} run={run} />;
    case 'contributions':
      return (
        <ContributionsOutput
          language={language}
          compact={compactContributions}
          filter={entry.message}
        />
      );
    case 'contact':
      return (
        <div className="contact-output">
          <h2>{t('Contact', 'Contacto')}</h2>
          <dl>
            <div>
              <dt>email</dt>
              <dd>
                <a href={'mailto:' + profile.email}>{profile.email}</a>
              </dd>
            </div>
            <div>
              <dt>github</dt>
              <dd>
                <a href={profile.github} target="_blank" rel="noreferrer">
                  github.com/MaxFSP ↗
                </a>
              </dd>
            </div>
            <div>
              <dt>linkedin</dt>
              <dd>
                <a href={profile.linkedin} target="_blank" rel="noreferrer">
                  Santiago Paz Farfán ↗
                </a>
              </dd>
            </div>
          </dl>
          <div className="contact-controls">
            <a href={'mailto:' + profile.email}>[ {t('send email', 'enviar correo')} ]</a>
            <button onClick={copyEmail}>
              [ {copied ? t('copied', 'copiado') : t('copy email', 'copiar correo')} ]
            </button>
          </div>
          <p className="copy-status" role="status">
            {copied
              ? t('Email copied to clipboard.', 'Correo copiado al portapapeles.')
              : copyError
                ? t(
                    'Clipboard unavailable. Select the email address above or use send email.',
                    'El portapapeles no está disponible. Selecciona la dirección o usa enviar correo.',
                  )
                : ''}
          </p>
        </div>
      );
    case 'project': {
      const project = projects.find((item) => item.id === entry.project);
      if (!project) return <p>File not found. Run ls work/.</p>;
      return (
        <article className="project-output">
          <p className="output-comment">{'# ' + filenames[project.id]}</p>
          <h2>{project.title}</h2>
          <p className="project-organization">{project.organization}</p>
          <h3 className="case-heading">{t('Context', 'Contexto')}</h3>
          <p>{project.summary}</p>
          <h3 className="case-heading">{t('My work', 'Mi trabajo')}</h3>
          <ul>
            {project.details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
          {project.outcome && (
            <>
              <h3 className="case-heading">{t('Result', 'Resultado')}</h3>
              <p>{project.outcome}</p>
            </>
          )}
          <div className="project-tools">
            {commandButton('less work/' + filenames[project.id], '[ less ]')}
            {commandButton('share ' + project.id, '[ share ]')}
            {commandButton('split work/' + filenames[project.id], '[ split ]')}
          </div>
          <p className="project-stack">{project.tags.join(' / ')}</p>
          <p className="project-note">{project.note}</p>
          {project.id === 'pearai' && (
            <div className="project-evidence">
              <ContributionsOutput language={language} compact />
              <button className="file-link" onClick={() => run('contributions')}>
                {t('All verified contributions', 'Todas las contribuciones verificadas')}
              </button>
            </div>
          )}
          {project.repositories && (
            <div
              className="repository-links"
              role="group"
              aria-label={t('Project repositories', 'Repositorios del proyecto')}
            >
              {project.repositories.map((repo) => (
                <a key={repo.url} href={repo.url} target="_blank" rel="noopener noreferrer">
                  {repo.label} ↗
                </a>
              ))}
            </div>
          )}
        </article>
      );
    }
    case 'resume':
      return (
        <div className="resume-output">
          <a href={resumeUrl} download="Santiago-Paz-Farfan-Resume.pdf">
            {t('Download resume.pdf ↓', 'Descargar resume.pdf ↓')}
          </a>
          <span className="output-comment">Santiago Maximiliano Paz Farfán / PDF</span>
        </div>
      );
    case 'manual':
      return <ManualPage name={entry.message} run={run} language={language} />;
    case 'themes':
      return (
        <div className="themes-output">
          <h2>{t('Themes', 'Temas')}</h2>
          <p className="output-comment">
            {t(
              'Select one below, use the header picker, or run theme <name>.',
              'Selecciona un tema, usa el selector de la cabecera o ejecuta theme <nombre>.',
            )}
          </p>
          <div className="theme-list">
            {themes.map((item) => (
              <div className="theme-row" key={item.id}>
                <button
                  aria-label={
                    language === 'es'
                      ? 'Aplicar tema ' + item.labelEs
                      : 'Apply ' + item.label + ' theme'
                  }
                  aria-pressed={theme === item.id}
                  onClick={() => setTheme(item.id)}
                >
                  <span aria-hidden="true">{theme === item.id ? '[x]' : '[ ]'}</span> {item.id}
                </button>
                <span>{language === 'es' ? item.descriptionEs : item.description}</span>
              </div>
            ))}
          </div>
          <button
            className="effects-toggle"
            aria-label={t('CRT effects', 'Efectos CRT')}
            aria-pressed={crtEffects}
            onClick={() => setCrtEffects((value) => !value)}
          >
            [{crtEffects ? 'x' : ' '}] {t('CRT effects', 'Efectos CRT')}:{' '}
            {crtEffects ? 'on' : 'off'}
          </button>
          <p className="output-comment">
            {t(
              'Static screen effects. Run crt for live presets and intensity controls.',
              'Efectos estáticos en pantallas oscuras. Ejecuta crt para ajustar la intensidad.',
            )}
          </p>
        </div>
      );
    case 'tree': {
      const workOnly = entry.message === 'work';
      return (
        <div className="tree-output">
          <p>{workOnly ? 'work/' : '.'}</p>
          {!workOnly && (
            <>
              {['about', 'experience', 'skills', 'contact'].map((file) => (
                <div className="tree-row" key={file}>
                  <span aria-hidden="true">├── </span>
                  <button className="file-link" onClick={() => run('cat ' + file + '.txt')}>
                    {file}.txt
                  </button>
                </div>
              ))}
              <div className="tree-row">
                <span aria-hidden="true">├── </span>
                <a href={resumeUrl} download="Santiago-Paz-Farfan-Resume.pdf">
                  resume.pdf
                </a>
              </div>
              <div className="tree-row">
                <span aria-hidden="true">└── </span>
                <button className="file-link" onClick={() => run('tree work')}>
                  work/
                </button>
              </div>
            </>
          )}
          {projects.map((project, index) => (
            <div className={'tree-row ' + (!workOnly ? 'tree-child' : '')} key={project.id}>
              <span aria-hidden="true">{index === projects.length - 1 ? '└── ' : '├── '}</span>
              <button
                className="file-link"
                aria-label={t('Read ', 'Leer ') + project.title}
                onClick={() => run('cat work/' + filenames[project.id])}
              >
                {filenames[project.id]}
              </button>
            </div>
          ))}
          <p className="output-comment tree-summary">
            {workOnly ? t('0 directories', '0 directorios') : t('1 directory', '1 directorio')},{' '}
            {projects.length + (workOnly ? 0 : 5)} {t('files', 'archivos')}
          </p>
        </div>
      );
    }
    case 'grep':
      return entry.search ? (
        <GrepOutput
          request={entry.search}
          language={language}
          open={(path) => run('less ' + path)}
        />
      ) : null;
    case 'share':
      return (
        <ShareOutput
          url={entry.message || ''}
          status={entry.copyStatus}
          copy={() => copyProjectLink(entry)}
          language={language}
        />
      );
    case 'crt':
      return (
        <CrtControls
          settings={crtSettings}
          setSettings={setCrtSettings}
          language={language}
          isLight={theme === 'light' || theme === 'paper'}
          preview={() => setTheme('amber')}
        />
      );
    case 'help':
      return (
        <div className="help-output">
          <h2>{t('Commands', 'Comandos')}</h2>
          <div className="help-grid">
            {[
              ['start', 'A guided introduction to my work', 'Un recorrido por mi trabajo'],
              [
                'contributions',
                'Verified PearAI pull requests',
                'Pull requests verificados de PearAI',
              ],
              ['whoami', 'Name, location, and background', 'Nombre, ubicación y trayectoria'],
              [
                'work',
                'Professional work and contributions',
                'Trabajo profesional y contribuciones',
              ],
              ['experience', 'Employment and education', 'Experiencia y educación'],
              [
                'skills',
                'Languages, frameworks, and tools',
                'Lenguajes, frameworks y herramientas',
              ],
              ['contact', 'Email and profiles', 'Correo y perfiles'],
              ['resume', 'Download my résumé', 'Descargar mi currículum'],
              ['less experience.txt', 'Searchable file reader', 'Lector de archivos con búsqueda'],
              ['grep -i AWS', 'Search portfolio files', 'Buscar en el portafolio'],
              ['tree', 'Browse the portfolio files', 'Explorar los archivos'],
              ['share healthcare', 'Copy a direct project link', 'Copiar enlace de un proyecto'],
              ['split on', 'Pin a file beside the terminal', 'Fijar un archivo junto al terminal'],
              ['tab new', 'Open an independent session', 'Abrir una sesión independiente'],
              ['tab rename Notes', 'Rename this shell', 'Renombrar esta sesión'],
              ['snake', 'Play Snake', 'Jugar Snake'],
              [language === 'en' ? 'lang es' : 'lang en', 'Switch to Spanish', 'Cambiar a inglés'],
              ['history', 'Commands from this session', 'Comandos de esta sesión'],
              ['theme', 'Choose a console theme', 'Elegir un tema'],
              ['crt', 'Live CRT controls and presets', 'Controles CRT y ajustes en vivo'],
              ['man', 'Read command manuals', 'Leer manuales'],
              ['!!', 'Repeat the last command', 'Repetir el último comando'],
              ['clear', 'Clear the terminal', 'Limpiar el terminal'],
            ].map(([command, en, es]) => (
              <div key={command}>
                {commandButton(command)}
                <span>{t(en, es)}</span>
              </div>
            ))}
          </div>
          <p className="output-comment">
            {t(
              'Also: ls, pwd, cd work, cd .., cat <filename>',
              'También: ls, pwd, cd work, cd .., cat <archivo>',
            )}
          </p>
          <div className="available-files">
            <span className="output-comment">{t('Files:', 'Archivos:')}</span>
            {['about', 'experience', 'skills', 'contact'].map((file) => (
              <button className="file-link" key={file} onClick={() => run('cat ' + file + '.txt')}>
                {file}.txt
              </button>
            ))}
            {commandButton('work', 'work/')}
          </div>
          <p className="output-comment">
            {t(
              '↑ / ↓ history · → accept suggestion · Tab complete · Ctrl+R search',
              '↑ / ↓ historial · → aceptar sugerencia · Tab completar · Ctrl+R buscar',
            )}
            <br />
            {t(
              'Ctrl+L clear · Ctrl/Cmd+K focus prompt',
              'Ctrl+L limpiar · Ctrl/Cmd+K ir al comando',
            )}
          </p>
        </div>
      );
    case 'text':
      return entry.message ? <p className="plain-output">{entry.message}</p> : null;
  }
}
