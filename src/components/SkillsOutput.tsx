import { getContent, text } from '../localization';
import type { Language } from '../localization';
import { skillProjects } from '../skill-evidence';
import { contributions } from '../contributions';

export default function SkillsOutput({
  language,
  selected,
  run,
}: {
  language: Language;
  selected?: string;
  run: (command: string) => void;
}) {
  const { projects, skillGroups } = getContent(language);
  const t = (en: string, es: string) => text(language, en, es);
  const examples = selected
    ? projects.filter((project) => skillProjects[selected]?.includes(project.id))
    : [];
  const prs = selected
    ? contributions
        .filter((item) => item.status === 'merged' && item.skills.includes(selected))
        .slice(0, 3)
    : [];
  return (
    <div className="skills-output">
      <h2>
        {t('Skills', 'Habilidades')}
        {selected ? ' / ' + selected : ''}
      </h2>
      {!selected ? (
        <>
          <p className="output-comment">
            {t(
              'Select an underlined skill to see where I used it.',
              'Selecciona una habilidad subrayada para ver dónde la usé.',
            )}
          </p>
          {skillGroups.map((group) => (
            <div className="skill-row" key={group.title}>
              <h3>{group.title}</h3>
              <p>
                {group.skills.map((skill, index) => (
                  <span key={skill}>
                    {index > 0 && ', '}
                    {skillProjects[skill] ? (
                      <button className="file-link" onClick={() => run('skills ' + skill)}>
                        {skill}
                      </button>
                    ) : (
                      skill
                    )}
                  </span>
                ))}
              </p>
            </div>
          ))}
        </>
      ) : (
        <>
          <p className="output-comment">
            {t(
              'Project examples from my professional work and public repositories.',
              'Ejemplos de mi trabajo profesional y repositorios públicos.',
            )}
          </p>
          {examples.map((project) => (
            <article className="skill-example" key={project.id}>
              <h3>
                <button className="file-link" onClick={() => run('work ' + project.id)}>
                  {project.title}
                </button>
              </h3>
              <p>{project.description}</p>
              <span className="output-comment">
                {project.type === 'Professional work'
                  ? t('Professional experience / résumé', 'Experiencia profesional / currículum')
                  : t('Public project', 'Proyecto público')}
              </span>
            </article>
          ))}
          {prs.length > 0 && (
            <div className="skill-proof">
              <h3>{t('Merged contribution examples', 'Ejemplos de contribuciones integradas')}</h3>
              {prs.map((item) => (
                <p key={item.url}>
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    {item.repo} #{item.number} / {language === 'es' ? item.summaryEs : item.summary}{' '}
                    ↗
                  </a>
                </p>
              ))}
            </div>
          )}
          <button className="file-link" onClick={() => run('skills')}>
            {t('All skills', 'Todas las habilidades')}
          </button>
        </>
      )}
    </div>
  );
}
