import { searchDocuments } from '../documents';
import type { SearchRequest } from '../documents';
import { text } from '../localization';
import type { Language } from '../localization';

export default function GrepOutput({
  request,
  language,
  open,
}: {
  request: SearchRequest;
  language: Language;
  open: (path: string) => void;
}) {
  const hits = searchDocuments(request, language);
  return (
    <div className="grep-output">
      <p className="output-comment" role="status">
        {hits.length} {text(language, 'matching lines', 'líneas encontradas')}
        {request.target ? ' / ' + request.target : ''}
      </p>
      {!hits.length && (
        <p>
          {text(
            language,
            'No matches. Try grep -i for case-insensitive search.',
            'Sin resultados. Usa grep -i para ignorar mayúsculas.',
          )}
        </p>
      )}
      {hits.map((hit) => (
        <div className="grep-hit" key={hit.path + ':' + hit.line}>
          <button className="file-link" onClick={() => open(hit.path)}>
            {hit.path}:{hit.line}
          </button>
          <span>{hit.text}</span>
        </div>
      ))}
    </div>
  );
}
