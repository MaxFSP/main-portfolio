import { useEffect, useRef } from 'react';
import type { Dispatch, KeyboardEvent, SetStateAction } from 'react';
import { advanceGame, boardSize, createGame } from '../snake-engine';
import type { Direction, SnakeGame } from '../snake-engine';
import { text } from '../localization';
import type { Language } from '../localization';

export default function Snake({
  game,
  setGame,
  language,
  onClose,
}: {
  game: SnakeGame;
  setGame: Dispatch<SetStateAction<SnakeGame>>;
  language: Language;
  onClose: () => void;
}) {
  const board = useRef<HTMLElement>(null);
  const queued = useRef<Direction | undefined>(undefined);
  useEffect(() => {
    board.current?.focus();
    const pause = () => {
      if (document.hidden)
        setGame((value) => (value.phase === 'running' ? { ...value, phase: 'paused' } : value));
    };
    document.addEventListener('visibilitychange', pause);
    return () => {
      document.removeEventListener('visibilitychange', pause);
      setGame((value) => (value.phase === 'running' ? { ...value, phase: 'paused' } : value));
    };
  }, [setGame]);
  useEffect(() => {
    if (game.phase !== 'running') return;
    const timer = setInterval(() => {
      const direction = queued.current;
      queued.current = undefined;
      setGame((value) => advanceGame(value, direction));
    }, 160);
    return () => clearInterval(timer);
  }, [game.phase, setGame]);
  function start() {
    queued.current = undefined;
    setGame((value) =>
      value.phase === 'paused'
        ? { ...value, phase: 'running' }
        : { ...createGame(), phase: 'running' },
    );
    board.current?.focus();
  }
  function turn(direction: Direction) {
    if (!queued.current) queued.current = direction;
    board.current?.focus();
  }
  function pause() {
    setGame((value) => ({
      ...value,
      phase:
        value.phase === 'running' ? 'paused' : value.phase === 'paused' ? 'running' : value.phase,
    }));
  }
  function keys(event: KeyboardEvent) {
    if ((event.target as HTMLElement).closest('button')) return;
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    const directions: Record<string, Direction> = {
      ArrowUp: 'up',
      w: 'up',
      ArrowDown: 'down',
      s: 'down',
      ArrowLeft: 'left',
      a: 'left',
      ArrowRight: 'right',
      d: 'right',
    };
    if (Object.hasOwn(directions, key)) {
      event.preventDefault();
      turn(directions[key]);
    } else if (key === 'q' || key === 'Escape') {
      event.preventDefault();
      onClose();
    } else if (key === ' ') {
      event.preventDefault();
      pause();
    } else if (key === 'r') {
      event.preventDefault();
      queued.current = undefined;
      setGame({ ...createGame(), phase: 'running' });
    } else if (key === 'Enter') {
      event.preventDefault();
      start();
    }
  }
  const phase = {
    ready: text(language, 'Ready', 'Listo'),
    running: text(language, 'Playing', 'Jugando'),
    paused: text(language, 'Paused', 'Pausado'),
    over: text(language, 'Game over', 'Fin del juego'),
    won: text(language, 'Board completed', 'Tablero completado'),
  }[game.phase];
  return (
    <section
      className="snake-panel"
      tabIndex={0}
      ref={board}
      onKeyDown={keys}
      aria-label={text(language, 'Snake game', 'Juego de Snake')}
    >
      <div className="pane-heading">
        <span>snake / {phase}</span>
        <button onClick={onClose} aria-label={text(language, 'Close Snake', 'Cerrar Snake')}>
          [ q ]
        </button>
      </div>
      <div className="snake-content">
        <div className="snake-score" role="status">
          {text(language, 'Score', 'Puntos')}: {game.score} / {phase}
        </div>
        <svg
          className="snake-board"
          viewBox={'0 0 ' + boardSize * 10 + ' ' + boardSize * 10}
          role="img"
          aria-label={text(language, 'Snake board', 'Tablero de Snake')}
        >
          <rect width="160" height="160" fill="var(--bg)" />
          {Array.from({ length: boardSize + 1 }, (_, index) => (
            <path
              key={index}
              d={'M' + index * 10 + ' 0V160M0 ' + index * 10 + 'H160'}
              stroke="var(--line)"
              strokeWidth=".25"
            />
          ))}
          <rect
            x={game.food.x * 10 + 2}
            y={game.food.y * 10 + 2}
            width="6"
            height="6"
            fill="var(--bright)"
          />
          {game.body.map((part, index) => (
            <rect
              key={index}
              x={part.x * 10 + 1}
              y={part.y * 10 + 1}
              width="8"
              height="8"
              fill={index === 0 ? 'var(--bright)' : 'var(--prompt)'}
            />
          ))}
        </svg>
        <div className="snake-actions">
          <button className="terminal-button" onClick={start}>
            {game.phase === 'paused'
              ? text(language, 'Resume', 'Continuar')
              : game.phase === 'running'
                ? text(language, 'Restart', 'Reiniciar')
                : text(language, 'Start', 'Iniciar')}
          </button>
          <button className="terminal-button" onClick={pause} disabled={game.phase !== 'running'}>
            {text(language, 'Pause', 'Pausar')}
          </button>
        </div>
        <div
          className="snake-directions"
          aria-label={text(language, 'Direction controls', 'Controles de dirección')}
        >
          <button onClick={() => turn('up')} aria-label={text(language, 'Move up', 'Mover arriba')}>
            ↑
          </button>
          <div>
            <button
              onClick={() => turn('left')}
              aria-label={text(language, 'Move left', 'Mover izquierda')}
            >
              ←
            </button>
            <button
              onClick={() => turn('down')}
              aria-label={text(language, 'Move down', 'Mover abajo')}
            >
              ↓
            </button>
            <button
              onClick={() => turn('right')}
              aria-label={text(language, 'Move right', 'Mover derecha')}
            >
              →
            </button>
          </div>
        </div>
        <p className="output-comment">
          {text(
            language,
            'Arrows / WASD move · Space pauses · R restarts · Q exits',
            'Flechas / WASD para mover · Espacio pausa · R reinicia · Q sale',
          )}
        </p>
      </div>
    </section>
  );
}
