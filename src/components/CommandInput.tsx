import { useLayoutEffect, useState } from 'react';
import type { KeyboardEvent, RefObject } from 'react';

type Props = {
  value: string;
  suggestion: string;
  inputRef: RefObject<HTMLInputElement | null>;
  searching: boolean;
  onChange: (value: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
};

/** Keep native editing, selection, and mobile input beneath a terminal-style caret. */
export default function CommandInput({ value, suggestion, inputRef, searching, onChange, onKeyDown }: Props) {
  const [caret, setCaret] = useState(value.length);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [focused, setFocused] = useState(false);
  const [selection, setSelection] = useState(false);

  function syncSelection() {
    const element = inputRef.current;
    if (!element) return;
    setCaret(element.selectionStart ?? value.length);
    setSelection(element.selectionStart !== element.selectionEnd);
    setScrollLeft(element.scrollLeft);
  }

  useLayoutEffect(syncSelection, [value]);

  const position = Math.min(caret, value.length);
  const character = Array.from(value.slice(position))[0] || '';
  const suffix = position === value.length && !selection && focused ? suggestion.slice(value.length) : '';

  return <div className={'terminal-input ' + (focused ? 'is-focused' : '') + (selection ? 'has-selection' : '')}>
    <div className="input-mirror" aria-hidden="true">
      <span className="input-mirror-content" style={{ transform: 'translateX(-' + scrollLeft + 'px)' }}>
        <span>{value.slice(0, position)}</span>
        <span className="block-cursor">{character || suffix[0] || '\u00a0'}</span>
        <span>{value.slice(position + character.length)}</span>
        <span className="ghost-suggestion">{character ? '' : suffix.slice(1)}</span>
      </span>
    </div>
    <input
      id="command-input"
      ref={inputRef}
      aria-label={searching ? 'Search command history' : 'Terminal command'}
      aria-describedby="input-help"
      value={value}
      onChange={event => { onChange(event.target.value); syncSelection(); }}
      onKeyDown={onKeyDown}
      onSelect={syncSelection}
      onScroll={syncSelection}
      onFocus={() => { setFocused(true); syncSelection(); }}
      onBlur={() => setFocused(false)}
      autoComplete="off"
      autoCapitalize="none"
      autoCorrect="off"
      spellCheck={false}
      enterKeyHint={searching ? 'done' : 'go'}
    />
  </div>;
}
