import { useCallback, useMemo, useRef, useState } from 'react';
import type { SetStateAction } from 'react';
import { createGame } from '../snake-engine';
import type { SnakeGame } from '../snake-engine';
import type { SearchRequest } from '../documents';

export type View =
  | 'about'
  | 'work'
  | 'experience'
  | 'skills'
  | 'contact'
  | 'help'
  | 'project'
  | 'resume'
  | 'tree'
  | 'themes'
  | 'manual'
  | 'grep'
  | 'share'
  | 'crt'
  | 'contributions'
  | 'text';
export type Entry = {
  id: number;
  command: string;
  path: string;
  view: View;
  project?: string;
  message?: string;
  search?: SearchRequest;
  copyStatus?: 'copied' | 'failed';
};
export type Mode =
  | { type: 'pager'; path: string }
  | { type: 'snake' }
  | { type: 'tour'; step: number }
  | null;
export type Session = {
  id: number;
  name: string;
  entries: Entry[];
  input: string;
  history: string[];
  historyIndex: number;
  draft: string;
  completions: string[];
  searching: boolean;
  searchDraft: string;
  searchIndex: number;
  path: string;
  mode: Mode;
  split: boolean;
  splitFile: string;
  splitDemo: boolean;
  snake: SnakeGame;
};
function makeSession(id: number, entries: Entry[] = [], name?: string): Session {
  return {
    id,
    name: name || 'shell ' + id,
    entries,
    input: '',
    history: [],
    historyIndex: -1,
    draft: '',
    completions: [],
    searching: false,
    searchDraft: '',
    searchIndex: 0,
    path: '~',
    mode: null,
    split: false,
    splitFile: 'experience.txt',
    splitDemo: false,
    snake: createGame(),
  };
}

export function useSessions(initial: () => Entry[]) {
  const [sessions, setSessions] = useState<Session[]>(() => [makeSession(1, initial())]);
  const [activeId, setActiveId] = useState(1);
  const nextId = useRef(2);
  const session = sessions.find((item) => item.id === activeId) || sessions[0];
  const setters = useMemo(() => {
    function setter<K extends keyof Session>(key: K) {
      return (value: SetStateAction<Session[K]>) =>
        setSessions((items) =>
          items.map((item) =>
            item.id === activeId
              ? {
                  ...item,
                  [key]:
                    typeof value === 'function'
                      ? (value as (previous: Session[K]) => Session[K])(item[key])
                      : value,
                }
              : item,
          ),
        );
    }
    return {
      setEntries: setter('entries'),
      setInput: setter('input'),
      setHistory: setter('history'),
      setHistoryIndex: setter('historyIndex'),
      setDraft: setter('draft'),
      setCompletions: setter('completions'),
      setSearching: setter('searching'),
      setSearchDraft: setter('searchDraft'),
      setSearchIndex: setter('searchIndex'),
      setPath: setter('path'),
      setMode: setter('mode'),
      setSplit: setter('split'),
      setSplitFile: setter('splitFile'),
      setSplitDemo: setter('splitDemo'),
      setSnake: setter('snake'),
    };
  }, [activeId]);

  const create = useCallback(
    (name?: string) => {
      if (sessions.length >= 8) return false;
      const id = nextId.current++;
      setSessions((items) => [...items, makeSession(id, [], name?.slice(0, 24))]);
      setActiveId(id);
      return true;
    },
    [sessions.length],
  );
  const close = useCallback(
    (id: number) => {
      if (sessions.length === 1 || !sessions.some((item) => item.id === id)) return false;
      const remaining = sessions.filter((item) => item.id !== id);
      if (activeId === id)
        setActiveId(
          remaining[
            Math.min(
              sessions.findIndex((item) => item.id === id),
              remaining.length - 1,
            )
          ].id,
        );
      setSessions((items) => items.filter((item) => item.id !== id));
      return true;
    },
    [activeId, sessions],
  );
  return {
    sessions,
    session,
    activeId,
    switchSession: setActiveId,
    createSession: create,
    closeSession: close,
    renameSession: (id: number, name: string) => {
      const trimmed = name.trim();
      if (
        !trimmed ||
        trimmed.length > 24 ||
        /[\x00-\x1f\x7f]/.test(trimmed) ||
        !sessions.some((item) => item.id === id)
      )
        return false;
      setSessions((items) =>
        items.map((item) => (item.id === id ? { ...item, name: trimmed } : item)),
      );
      return true;
    },
    ...setters,
  };
}
