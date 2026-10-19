import { useRef } from 'react';
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
}: {
  sessions: Session[];
  activeId: number;
  select: (id: number) => void;
  create: () => void;
  close: () => void;
  split: boolean;
  toggleSplit: () => void;
  language: Language;
}) {
  const tabs = useRef<HTMLDivElement>(null);
  function focus(id: number) {
    select(id);
    requestAnimationFrame(() =>
      tabs.current?.querySelector<HTMLButtonElement>('[data-session="' + id + '"]')?.focus(),
    );
  }
  return (
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
            onKeyDown={(event) => {
              if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
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
            <span className="tab-id">{session.id.toString().padStart(2, '0')}</span> {session.name}
          </button>
        ))}
      </div>
      <div className="session-actions">
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
  );
}
