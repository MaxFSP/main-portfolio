export type Direction = 'up' | 'down' | 'left' | 'right';
export type Point = { x: number; y: number };
export type SnakeGame = {
  body: Point[];
  food: Point;
  direction: Direction;
  score: number;
  phase: 'ready' | 'running' | 'paused' | 'over' | 'won';
};
export const boardSize = 16;
export function createGame(): SnakeGame {
  return {
    body: [
      { x: 8, y: 8 },
      { x: 7, y: 8 },
      { x: 6, y: 8 },
    ],
    food: { x: 11, y: 8 },
    direction: 'right',
    score: 0,
    phase: 'ready',
  };
}
export function advanceGame(game: SnakeGame, requested?: Direction): SnakeGame {
  if (game.phase !== 'running') return game;
  const opposite: Record<Direction, Direction> = {
    up: 'down',
    down: 'up',
    left: 'right',
    right: 'left',
  };
  const direction =
    requested && opposite[game.direction] !== requested ? requested : game.direction;
  const delta = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[direction];
  const head = { x: game.body[0].x + delta[0], y: game.body[0].y + delta[1] };
  const growing = head.x === game.food.x && head.y === game.food.y;
  const obstacles = growing ? game.body : game.body.slice(0, -1);
  if (
    head.x < 0 ||
    head.y < 0 ||
    head.x >= boardSize ||
    head.y >= boardSize ||
    obstacles.some((part) => part.x === head.x && part.y === head.y)
  )
    return { ...game, phase: 'over' };
  const body = [head, ...game.body];
  if (!growing) body.pop();
  if (!growing) return { ...game, body, direction };
  const available: Point[] = [];
  for (let y = 0; y < boardSize; y++)
    for (let x = 0; x < boardSize; x++)
      if (!body.some((part) => part.x === x && part.y === y)) available.push({ x, y });
  return {
    ...game,
    body,
    direction,
    score: game.score + 1,
    food: available.length ? available[Math.floor(Math.random() * available.length)] : game.food,
    phase: available.length ? 'running' : 'won',
  };
}
