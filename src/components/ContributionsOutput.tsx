import { contributions, contributionCommits, contributionReviewDate } from '../contributions';
import type { Contribution } from '../contributions';
import { text } from '../localization';
import type { Language } from '../localization';

export default function ContributionsOutput({
  language,
  compact = false,
  filter = 'all',
}: {
  language: Language;
  compact?: boolean;
  filter?: string;
}) {
  const t = (en: string, es: string) => text(language, en, es);
  const visible = contributions.filter((item) => filter === 'all' || item.status === filter);
  const highlights = visible.filter((item) => item.featured);
  function row(item: Contribution) {
    return (
      <article className="contribution-row" key={item.url}>
        <div className="contribution-meta">
          <span>
            {item.repo} / #{item.number}
          </span>
          <span className={'contribution-state state-' + item.status}>
            {item.status === 'merged'
              ? t('merged', 'integrado')
              : item.status === 'open'
                ? t('open proposal', 'propuesta abierta')
                : t('closed', 'cerrado')}
          </span>
        </div>
        <h3>
          <a href={item.url} target="_blank" rel="noopener noreferrer">
            {item.title} ↗
          </a>
        </h3>
        <p>{language === 'es' ? item.summaryEs : item.summary}</p>
        <p className="output-comment">
          {item.skills.join(' / ')} /{' '}
          <time dateTime={item.mergedAt || item.createdAt}>{item.mergedAt || item.createdAt}</time>
        </p>
      </article>
    );
  }
  return (
    <div className="contributions-output">
      <h2>{t('PearAI / contribution evidence', 'PearAI / contribuciones verificadas')}</h2>
      <p className="output-comment">
        {contributions.filter((item) => item.status === 'merged').length}{' '}
        {t('merged PRs', 'PR integrados')} /{' '}
        {contributions.filter((item) => item.status === 'open').length}{' '}
        {t('open proposal', 'propuesta abierta')} / {t('reviewed', 'revisado')}{' '}
        <time dateTime={contributionReviewDate}>{contributionReviewDate}</time>
      </p>
      <p>
        {t(
          'Public changes authored as MaxFSP, linked to their upstream pull requests.',
          'Cambios públicos de MaxFSP, enlazados a los pull requests originales.',
        )}
      </p>
      {(filter === 'all' ? highlights : visible).map(row)}
      {!compact && (
        <>
          <details className="contribution-archive">
            <summary>
              {t('All verified pull requests', 'Todos los pull requests verificados')} (
              {visible.length})
            </summary>
            {visible.length ? (
              visible.map(row)
            ) : (
              <p>
                {t(
                  'No pull requests in this state in the reviewed snapshot.',
                  'No hay pull requests con este estado en la revisión.',
                )}
              </p>
            )}
          </details>
          <details className="contribution-archive">
            <summary>
              {t('Commit history attributed to MaxFSP', 'Historial de commits atribuido a MaxFSP')}{' '}
              ({contributionCommits.length})
            </summary>
            <p className="output-comment">
              {t(
                'Includes merges and rewritten history; these records are not additional PRs or separate features.',
                'Incluye merges e historial reescrito; estos registros no son PR ni funciones adicionales.',
              )}
            </p>
            <ul className="commit-history">
              {contributionCommits.map((commit) => (
                <li key={commit.url}>
                  <a href={commit.url} target="_blank" rel="noopener noreferrer">
                    {commit.sha.slice(0, 7)} / {commit.title} ↗
                  </a>
                  <span className="output-comment">
                    {commit.repo} / {commit.date}
                  </span>
                </li>
              ))}
            </ul>
          </details>
        </>
      )}
    </div>
  );
}
