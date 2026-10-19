import { getManuals } from '../manual';
import { text } from '../localization';
import type { Language } from '../localization';

export default function ManualPage({
  name,
  run,
  language,
}: {
  name?: string;
  run: (command: string) => void;
  language: Language;
}) {
  const manuals = getManuals(language);
  const t = (en: string, es: string) => text(language, en, es);
  if (!name)
    return (
      <div className="manual-index">
        <h2>{t('Manual pages', 'Manuales')}</h2>
        <p className="output-comment">
          {t(
            'Read a page with man <command>, or select one below.',
            'Lee un manual con man <comando> o elige uno de la lista.',
          )}
        </p>
        <div className="manual-links">
          {Object.keys(manuals).map((command) => (
            <button className="file-link" key={command} onClick={() => run('man ' + command)}>
              {command}
            </button>
          ))}
        </div>
      </div>
    );

  const page = Object.hasOwn(manuals, name) ? manuals[name] : undefined;
  if (!page) return <p>No manual entry for {name}. Run man to list available pages.</p>;

  return (
    <article className="manual-page">
      <div className="manual-heading">
        <h2>{name}(1)</h2>
        <span>{t('Portfolio manual', 'Manual del portafolio')}</span>
      </div>
      <h3>{t('Usage', 'Uso')}</h3>
      <p>{page.synopsis}</p>
      <h3>{t('Description', 'Descripción')}</h3>
      <p>{page.description}</p>
      <h3>{t('Examples', 'Ejemplos')}</h3>
      <div className="manual-examples">
        {page.examples.map((example) => (
          <button className="file-link" key={example} onClick={() => run(example)}>
            {example}
          </button>
        ))}
      </div>
      {page.notes && (
        <>
          <h3>{t('Notes', 'Notas')}</h3>
          <p className="output-comment">{page.notes}</p>
        </>
      )}
    </article>
  );
}
