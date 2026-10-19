export const themes = [
  {
    id: 'dark',
    label: 'Black',
    labelEs: 'Negro',
    description: 'White on black. The original terminal.',
    descriptionEs: 'Blanco sobre negro. El terminal original.',
    background: '#000000',
  },
  {
    id: 'amber',
    label: 'Amber CRT',
    labelEs: 'CRT ámbar',
    description: 'Amber phosphor, pixel type, and soft scanlines.',
    descriptionEs: 'Fósforo ámbar, tipografía de píxeles y líneas suaves.',
    background: '#0e0b05',
  },
  {
    id: 'phosphor',
    label: 'Green CRT',
    labelEs: 'CRT verde',
    description: 'Green phosphor with a classic console typeface.',
    descriptionEs: 'Fósforo verde con tipografía de consola clásica.',
    background: '#020a04',
  },
  {
    id: 'paper',
    label: 'Paper',
    labelEs: 'Papel',
    description: 'Dark ink on warm paper.',
    descriptionEs: 'Tinta oscura sobre papel cálido.',
    background: '#f1e9d7',
  },
  {
    id: 'light',
    label: 'Light',
    labelEs: 'Claro',
    description: 'Black on white.',
    descriptionEs: 'Negro sobre blanco.',
    background: '#ffffff',
  },
] as const;

export type Theme = (typeof themes)[number]['id'];

export function resolveTheme(value: string): Theme | undefined {
  if (value === 'black') return 'dark';
  if (value === 'green') return 'phosphor';
  if (value === 'retro') return 'amber';
  return themes.find((theme) => theme.id === value)?.id;
}
