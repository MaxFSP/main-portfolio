export const themes = [
  { id: 'dark', label: 'Black', description: 'White on black. The original terminal.', background: '#000000' },
  { id: 'amber', label: 'Amber CRT', description: 'Amber phosphor, pixel type, and soft scanlines.', background: '#0e0b05' },
  { id: 'phosphor', label: 'Green CRT', description: 'Green phosphor with a classic console typeface.', background: '#020a04' },
  { id: 'paper', label: 'Paper', description: 'Dark ink on warm paper.', background: '#f1e9d7' },
  { id: 'light', label: 'Light', description: 'Black on white.', background: '#ffffff' },
] as const;

export type Theme = (typeof themes)[number]['id'];

export function resolveTheme(value: string): Theme | undefined {
  if (value === 'black') return 'dark';
  if (value === 'green') return 'phosphor';
  if (value === 'retro') return 'amber';
  return themes.find(theme => theme.id === value)?.id;
}
