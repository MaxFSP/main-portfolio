export const skillProjects: Record<string, string[]> = {
  TypeScript: ['real-estate', 'pearai'],
  React: ['real-estate', 'pearai'],
  'Next.js': ['real-estate', 'pearai'],
  Python: ['healthcare', 'pathfinding'],
  AWS: ['healthcare', 'real-estate'],
  'AWS Lambda': ['healthcare', 'real-estate'],
  GraphQL: ['healthcare', 'real-estate'],
  PostgreSQL: ['healthcare'],
  DynamoDB: ['real-estate'],
  Linux: ['linux-installer', 'pearai'],
  Bash: ['linux-installer'],
  Electron: ['pearai'],
  CSS: ['pearai'],
  'CI/CD': ['real-estate'],
  Pygame: ['pathfinding'],
};
export function resolveSkill(value: string) {
  return Object.keys(skillProjects).find((skill) => skill.toLowerCase() === value.toLowerCase());
}
