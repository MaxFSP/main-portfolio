import type { Dispatch, SetStateAction } from 'react';
import { crtPresets } from '../crt';
import type { CrtSettings } from '../crt';
import { text } from '../localization';
import type { Language } from '../localization';

export default function CrtControls({
  settings,
  setSettings,
  language,
  isLight,
  preview,
}: {
  settings: CrtSettings;
  setSettings: Dispatch<SetStateAction<CrtSettings>>;
  language: Language;
  isLight: boolean;
  preview: () => void;
}) {
  return (
    <div className="crt-controls">
      <h2>{text(language, 'CRT controls', 'Controles CRT')}</h2>
      <p className="output-comment">
        {text(
          language,
          'Tune the screen live. Scanlines are static; the screen never flickers.',
          'Ajusta la pantalla en tiempo real. Las líneas son estáticas; la pantalla no parpadea.',
        )}
      </p>
      <div className="crt-presets">
        <button
          className="terminal-button"
          aria-pressed={!settings.enabled}
          onClick={() => setSettings((value) => ({ ...value, enabled: false }))}
        >
          {text(language, 'Off', 'Desactivado')}
        </button>
        <button className="terminal-button" onClick={() => setSettings(crtPresets.soft)}>
          {text(language, 'Soft', 'Suave')}
        </button>
        <button className="terminal-button" onClick={() => setSettings(crtPresets.strong)}>
          {text(language, 'Strong', 'Intenso')}
        </button>
      </div>
      <label className="crt-range">
        <span>{text(language, 'Scanlines', 'Líneas de escaneo')}</span>
        <input
          type="range"
          min="0"
          max="100"
          value={settings.scanlines}
          onChange={(event) =>
            setSettings((value) => ({
              ...value,
              scanlines: Number(event.target.value),
              enabled: true,
              allDark: true,
            }))
          }
        />
        <output>{settings.scanlines}%</output>
      </label>
      <label className="crt-range">
        <span>{text(language, 'Phosphor glow', 'Brillo del fósforo')}</span>
        <input
          type="range"
          min="0"
          max="100"
          value={settings.glow}
          onChange={(event) =>
            setSettings((value) => ({
              ...value,
              glow: Number(event.target.value),
              enabled: true,
              allDark: true,
            }))
          }
        />
        <output>{settings.glow}%</output>
      </label>
      <p className="output-comment">
        {text(
          language,
          'CLI: crt soft · crt strong · crt scanlines 60 · crt glow 40 · crt off',
          'CLI: crt soft · crt strong · crt scanlines 60 · crt glow 40 · crt off',
        )}
      </p>
      {isLight && (
        <p>
          {text(
            language,
            'Choose a dark screen to preview CRT effects.',
            'Elige una pantalla oscura para ver los efectos CRT.',
          )}{' '}
          <button className="file-link" onClick={preview}>
            {text(language, 'Preview Amber CRT', 'Ver CRT ámbar')}
          </button>
        </p>
      )}
    </div>
  );
}
