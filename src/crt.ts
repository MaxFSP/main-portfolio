export type CrtSettings = { enabled: boolean; scanlines: number; glow: number; allDark: boolean };
export const crtPresets = {
  soft: { enabled: true, scanlines: 20, glow: 25, allDark: true },
  strong: { enabled: true, scanlines: 65, glow: 75, allDark: true },
} satisfies Record<string, CrtSettings>;
export function readCrt(): CrtSettings {
  const fallback = {
    enabled: document.documentElement.dataset.crt !== 'off',
    scanlines: 30,
    glow: 30,
    allDark: false,
  };
  try {
    const value = JSON.parse(localStorage.getItem('portfolio-crt-settings') || 'null');
    if (!value || typeof value !== 'object') return fallback;
    return {
      enabled: typeof value.enabled === 'boolean' ? value.enabled : fallback.enabled,
      scanlines: Number.isFinite(value.scanlines)
        ? Math.max(0, Math.min(100, value.scanlines))
        : 30,
      glow: Number.isFinite(value.glow) ? Math.max(0, Math.min(100, value.glow)) : 30,
      allDark: value.allDark === true,
    };
  } catch {
    return fallback;
  }
}
