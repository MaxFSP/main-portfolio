import { useEffect, useRef, useState } from 'react';
import type { Session } from '../hooks/useSessions';
import { text } from '../localization';
import type { Language } from '../localization';

export default function SessionTabs({
  sessions,
  activeId,
  select,
  create,
  close,
  split,
  toggleSplit,
  language,
  rename,
}: {
  sessions: Session[];
  activeId: number;
  select: (id: number) => void;
  create: () => void;
  close: () => void;
  split: boolean;
  toggleSplit: () => void;
  language: Language;
  rename: (id: number, name: string) => boolean;
}) {
  const tabs = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState(false);
  const nameInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setEditing(false);
    setError(false);
  }, [activeId]);
  useEffect(() => {
    if (editing) {
      nameInput.current?.focus();
      nameInput.current?.select();
    }
  }, [editing]);
  function startRename(id = activeId) {
    select(id);
    setName(sessions.find((item) => item.id === id)?.name || '');
    setError(false);
    // Wait for a changed active tab before opening its editor.
    requestAnimationFrame(() => setEditing(true));
  }
  function finishRename() {
    setEditing(false);
    focus(activeId);
  }
  function focus(id: number) {
    select(id);
    requestAnimationFrame(() =>
      tabs.current?.querySelector<HTMLButtonElement>('[data-session="' + id + '"]')?.focus(),
    );
  }
  return (
    <div className="session-strip">
      <div className="session-bar">
        <div
          className="session-tabs"
          role="tablist"
          aria-label={text(language, 'Terminal sessions', 'Sesiones del terminal')}
          ref={tabs}
        >
          {sessions.map((session, index) => (
            <button
              key={session.id}
              role="tab"
              aria-selected={session.id === activeId}
              aria-controls="session-panel"
              id={'session-tab-' + session.id}
              data-session={session.id}
              tabIndex={session.id === activeId ? 0 : -1}
              onClick={() => select(session.id)}
              onDoubleClick={() => startRename(session.id)}
              title={text(
                language,
                'Double-click or press F2 to rename',
                'Doble clic o F2 para renombrar',
              )}
              onKeyDown={(event) => {
                if (event.key === 'F2') {
                  event.preventDefault();
                  startRename(session.id);
                } else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
                  event.preventDefault();
                  focus(
                    sessions[
                      (index + (event.key === 'ArrowRight' ? 1 : sessions.length - 1)) %
                        sessions.length
                    ].id,
                  );
                } else if (event.key === 'Home') {
                  event.preventDefault();
                  focus(sessions[0].id);
                } else if (event.key === 'End') {
                  event.preventDefault();
                  focus(sessions[sessions.length - 1].id);
                }
              }}
            >
              <span className="tab-id">{session.id.toString().padStart(2, '0')}</span>{' '}
              {session.name}
            </button>
          ))}
        </div>
        <div className="session-actions">
          <button
            aria-label={text(language, 'Rename current session', 'Renombrar sesión actual')}
            onClick={() => startRename()}
          >
            [ {text(language, 'rename', 'nombre')} ]
          </button>
          <button
            aria-label={text(language, 'Toggle split pane', 'Alternar panel dividido')}
            aria-pressed={split}
            onClick={toggleSplit}
          >
            [ split ]
          </button>
          <button
            aria-label={text(language, 'Close current session', 'Cerrar sesión actual')}
            disabled={sessions.length === 1}
            onClick={close}
          >
            ×
          </button>
          <button
            aria-label={text(language, 'New terminal session', 'Nueva sesión del terminal')}
            disabled={sessions.length >= 8}
            onClick={create}
          >
            +
          </button>
        </div>
      </div>
      {editing && (
        <form
          className="session-rename"
          onSubmit={(event) => {
            event.preventDefault();
            if (rename(activeId, name)) finishRename();
            else setError(true);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              finishRename();
            }
          }}
        >
          <label htmlFor="session-name">{text(language, 'Shell name', 'Nombre de sesión')}</label>
          <input
            id="session-name"
            ref={nameInput}
            value={name}
            maxLength={24}
            aria-invalid={error}
            aria-describedby={error ? 'rename-error' : undefined}
            onChange={(event) => {
              setName(event.target.value);
              setError(false);
            }}
            autoComplete="off"
          />
          <button type="submit">{text(language, 'Save', 'Guardar')}</button>
          <button type="button" onClick={finishRename}>
            {text(language, 'Cancel', 'Cancelar')}
          </button>
          {error && (
            <span id="rename-error" role="alert">
              {text(language, 'Use 1–24 characters.', 'Usa entre 1 y 24 caracteres.')}
            </span>
          )}
        </form>
      )}
    </div>
  );
}
