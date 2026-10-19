import Pager from './Pager';
import { getDocuments } from '../documents';
import { text } from '../localization';
import type { Language } from '../localization';

export default function ReferencePane({
  file,
  language,
  onChange,
  onClose,
}: {
  file: string;
  language: Language;
  onChange: (file: string) => void;
  onClose: () => void;
}) {
  const documents = getDocuments(language);
  const document = documents.find((item) => item.path === file) || documents[1];
  return (
    <aside
      className="reference-panel"
      aria-label={text(language, 'Reference pane', 'Panel de referencia')}
    >
      <label className="reference-picker">
        {text(language, 'reference', 'referencia')}
        <select
          aria-label={text(language, 'Reference file', 'Archivo de referencia')}
          value={document.path}
          onChange={(event) => onChange(event.target.value)}
        >
          {documents.map((item) => (
            <option key={item.path} value={item.path}>
              {item.path}
            </option>
          ))}
        </select>
      </label>
      <Pager
        document={document}
        language={language}
        onClose={onClose}
        autoFocus={false}
        label={text(language, 'Reference file reader', 'Lector de referencia')}
        closeLabel={text(language, 'Close reference pane', 'Cerrar panel de referencia')}
      />
    </aside>
  );
}
