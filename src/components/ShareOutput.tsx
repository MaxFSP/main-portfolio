import { text } from '../localization';
import type { Language } from '../localization';
export default function ShareOutput({
  url,
  status,
  copy,
  language,
}: {
  url: string;
  status?: 'copied' | 'failed';
  copy: () => void;
  language: Language;
}) {
  return (
    <div className="share-output">
      <a href={url}>{url}</a>
      <button className="terminal-button" onClick={copy}>
        {text(language, 'Copy project link', 'Copiar enlace del proyecto')}
      </button>
      <p className="output-comment" role="status">
        {status === 'copied'
          ? text(language, 'Project link copied.', 'Enlace del proyecto copiado.')
          : status === 'failed'
            ? text(
                language,
                'Clipboard unavailable. Select the link above to copy it.',
                'El portapapeles no está disponible. Selecciona el enlace de arriba para copiarlo.',
              )
            : text(
                language,
                'Creating a direct project link…',
                'Creando un enlace directo al proyecto…',
              )}
      </p>
    </div>
  );
}
