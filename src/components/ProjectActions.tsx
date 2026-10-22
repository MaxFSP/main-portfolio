import type { Project } from '../content';
import { text } from '../localization';
import type { Language } from '../localization';

export default function ProjectActions({
  project,
  language,
  run,
  showCaseStudy = false,
}: {
  project: Project;
  language: Language;
  run: (command: string) => void;
  showCaseStudy?: boolean;
}) {
  const t = (en: string, es: string) => text(language, en, es);
  const source = project.sourceUrl || project.repositories?.[0]?.url;
  const sourceStatus =
    project.type === 'Professional work' ? t('private', 'privado') : t('planned', 'previsto');
  return (
    <div
      className="project-actions"
      role="group"
      aria-label={t('Project actions / ', 'Acciones del proyecto / ') + project.title}
    >
      {showCaseStudy && (
        <button
          className="project-action"
          onClick={() => run('work ' + project.id)}
          aria-label={t('Read case study / ', 'Leer caso / ') + project.title}
        >
          {t('Read case study', 'Leer caso')}
        </button>
      )}
      {source ? (
        <a
          className="project-action"
          href={source}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('View source / ', 'Ver código / ') + project.title}
        >
          {t('View source', 'Ver código')} ↗
        </a>
      ) : (
        <button className="project-action" disabled>
          {t('View source', 'Ver código')} <span>({sourceStatus})</span>
        </button>
      )}
      {project.demoUrl ? (
        <a
          className="project-action"
          href={project.demoUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('Try demo / ', 'Probar demo / ') + project.title}
        >
          {t('Try demo', 'Probar demo')} ↗
        </a>
      ) : (
        <button
          className="project-action"
          disabled
          title={t(
            'The working demo will be linked here when it is ready.',
            'La demostración se enlazará aquí cuando esté lista.',
          )}
        >
          {t('Try demo', 'Probar demo')} <span>({t('planned', 'prevista')})</span>
        </button>
      )}
    </div>
  );
}
