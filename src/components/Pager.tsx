import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { PortfolioDocument } from '../documents';
import { text } from '../localization';
import type { Language } from '../localization';

export default function Pager({
  document,
  language,
  onClose,
  autoFocus = true,
  label,
  closeLabel,
}: {
  document: PortfolioDocument;
  language: Language;
  onClose: () => void;
  autoFocus?: boolean;
  label?: string;
  closeLabel?: string;
}) {
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [matchIndex, setMatchIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const content = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const matches = query
    ? document.lines.flatMap((line, index) =>
        line.toLocaleLowerCase(language).includes(query.toLocaleLowerCase(language)) ? [index] : [],
      )
    : [];
  const selected = matches.length ? matches[matchIndex % matches.length] : -1;
  function updateProgress() {
    const element = content.current;
    if (element)
      setProgress(
        Math.min(
          100,
          Math.round(
            ((element.scrollTop + element.clientHeight) / Math.max(1, element.scrollHeight)) * 100,
          ),
        ),
      );
  }
  useEffect(() => {
    setQuery('');
    setMatchIndex(0);
    setSearchOpen(false);
    content.current?.scrollTo({ top: 0 });
    if (autoFocus) content.current?.focus();
    updateProgress();
  }, [document.path, language, autoFocus]);
  useEffect(() => {
    const area = content.current;
    if (!area) return;
    const observer = new ResizeObserver(updateProgress);
    observer.observe(area);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (selected >= 0)
      content.current
        ?.querySelector('[data-line="' + selected + '"]')
        ?.scrollIntoView({ block: 'center' });
  }, [selected, query]);
  function startSearch() {
    setSearchOpen(true);
    requestAnimationFrame(() => search.current?.focus());
  }
  function moveMatch(delta: number) {
    if (matches.length) setMatchIndex((index) => (index + delta + matches.length) % matches.length);
  }
  function keys(event: KeyboardEvent) {
    if ((event.target as HTMLElement).closest('input,button,select')) return;
    const area = content.current;
    const actions: Record<string, () => void> = {
      q: onClose,
      Q: onClose,
      Escape: onClose,
      '/': startSearch,
      j: () => area?.scrollBy({ top: 36 }),
      ArrowDown: () => area?.scrollBy({ top: 36 }),
      k: () => area?.scrollBy({ top: -36 }),
      ArrowUp: () => area?.scrollBy({ top: -36 }),
      ' ': () => area?.scrollBy({ top: area.clientHeight * 0.85 }),
      PageDown: () => area?.scrollBy({ top: area.clientHeight * 0.85 }),
      PageUp: () => area?.scrollBy({ top: -area.clientHeight * 0.85 }),
      g: () => area?.scrollTo({ top: 0 }),
      Home: () => area?.scrollTo({ top: 0 }),
      G: () => area?.scrollTo({ top: area.scrollHeight }),
      End: () => area?.scrollTo({ top: area.scrollHeight }),
      n: () => moveMatch(1),
      N: () => moveMatch(-1),
    };
    if (Object.hasOwn(actions, event.key)) {
      event.preventDefault();
      actions[event.key]();
    }
  }
  return (
    <section
      className="pager-panel"
      aria-label={label || text(language, 'File reader', 'Lector de archivos')}
      onKeyDown={keys}
    >
      <div className="pane-heading">
        <span>less / {document.path}</span>
        <button
          onClick={onClose}
          aria-label={closeLabel || text(language, 'Close reader', 'Cerrar lector')}
        >
          [ q ]
        </button>
      </div>
      <div
        ref={content}
        className="pager-content"
        tabIndex={0}
        onScroll={updateProgress}
        aria-label={document.title}
      >
        {document.lines.map((line, index) => {
          const position = query
            ? line.toLocaleLowerCase(language).indexOf(query.toLocaleLowerCase(language))
            : -1;
          return (
            <div
              key={index}
              data-line={index}
              className={'reader-line ' + (selected === index ? 'selected-match' : '')}
            >
              <span className="reader-number" aria-hidden="true">
                {index + 1}
              </span>
              <span>
                {position < 0 ? (
                  line || '\u00a0'
                ) : (
                  <>
                    {line.slice(0, position)}
                    <mark>{line.slice(position, position + query.length)}</mark>
                    {line.slice(position + query.length)}
                  </>
                )}
              </span>
            </div>
          );
        })}
      </div>
      {searchOpen && (
        <form
          className="pager-search"
          onSubmit={(event) => {
            event.preventDefault();
            setMatchIndex(0);
            content.current?.focus();
          }}
        >
          <span aria-hidden="true">/</span>
          <input
            ref={search}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setMatchIndex(0);
            }}
            aria-label={text(language, 'Search this file', 'Buscar en este archivo')}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                setSearchOpen(false);
                content.current?.focus();
              }
            }}
          />
          <span role="status">
            {matches.length
              ? (matchIndex % matches.length) + 1 + '/' + matches.length
              : text(language, 'No matches', 'Sin resultados')}
          </span>
        </form>
      )}
      <div className="pager-controls">
        <span>
          {progress >= 100 ? '(END)' : progress + '%'}{' '}
          <span className="footer-detail">/ j k / n N</span>
        </span>
        <div>
          <button
            onClick={() =>
              content.current?.scrollBy({ top: -(content.current?.clientHeight || 200) * 0.85 })
            }
            aria-label={text(language, 'Previous page', 'Página anterior')}
          >
            ↑
          </button>
          <button
            onClick={() =>
              content.current?.scrollBy({ top: (content.current?.clientHeight || 200) * 0.85 })
            }
            aria-label={text(language, 'Next page', 'Página siguiente')}
          >
            ↓
          </button>
          <button onClick={startSearch}>{text(language, '/ search', '/ buscar')}</button>
          {query && (
            <button onClick={() => moveMatch(1)}>
              {text(language, 'next match', 'siguiente')}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
