import { useState } from 'react';
import { text } from '../localization';
import type { Language } from '../localization';

type Result = {
  chunks: { bytes: number; hash: string }[];
  original: string;
  restored: string;
  bytes: number;
};
async function digest(bytes: Uint8Array) {
  const value = await crypto.subtle.digest('SHA-256', new Uint8Array(bytes).buffer);
  return Array.from(new Uint8Array(value), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
export default function ChunkLab({
  language,
  onClose,
}: {
  language: Language;
  onClose: () => void;
}) {
  const [payload, setPayload] = useState(
    'A standalone chunking example. Split this UTF-8 text into smaller blocks, reassemble them, and compare their SHA-256 hashes.',
  );
  const [size, setSize] = useState(32);
  const [corrupt, setCorrupt] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function verify() {
    setBusy(true);
    setError('');
    setResult(null);
    try {
      const bytes = new TextEncoder().encode(payload);
      const pieces = Array.from({ length: Math.ceil(bytes.length / size) }, (_, index) =>
        bytes.slice(index * size, (index + 1) * size),
      );
      const chunks = await Promise.all(
        pieces.map(async (chunk) => ({ bytes: chunk.length, hash: await digest(chunk) })),
      );
      const reassembled = new Uint8Array(bytes.length);
      let offset = 0;
      for (const piece of pieces) {
        reassembled.set(piece, offset);
        offset += piece.length;
      }
      if (corrupt && reassembled.length) reassembled[reassembled.length - 1] ^= 1;
      setResult({
        chunks,
        original: await digest(bytes),
        restored: await digest(reassembled),
        bytes: bytes.length,
      });
    } catch {
      setError(
        text(
          language,
          'SHA-256 is unavailable. Open this site over HTTPS and retry.',
          'SHA-256 no está disponible. Abre el sitio mediante HTTPS e inténtalo de nuevo.',
        ),
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <aside
      className="lab-panel"
      aria-label={text(
        language,
        'Standalone chunking demo',
        'Demostración independiente de fragmentación',
      )}
    >
      <div className="pane-heading">
        <span>chunk-lab.ts</span>
        <button
          onClick={onClose}
          aria-label={text(language, 'Close split pane', 'Cerrar panel dividido')}
        >
          [ × ]
        </button>
      </div>
      <div className="lab-content">
        <h2>{text(language, 'Chunk & verify', 'Dividir y verificar')}</h2>
        <p className="output-comment">
          {text(
            language,
            'Standalone browser demo. Uses sample text, not client code. No network uploads.',
            'Demostración independiente en el navegador. Usa texto de ejemplo, no código del cliente. No realiza cargas de red.',
          )}
        </p>
        <label className="lab-field">
          {text(language, 'Payload', 'Contenido')}
          <textarea
            aria-label={text(language, 'Demo payload', 'Contenido de ejemplo')}
            value={payload}
            maxLength={4096}
            disabled={busy}
            onChange={(event) => {
              setPayload(event.target.value);
              setResult(null);
            }}
            rows={5}
          />
        </label>
        <div className="lab-options">
          <label>
            {text(language, 'Chunk size', 'Tamaño del bloque')}{' '}
            <select
              value={size}
              disabled={busy}
              onChange={(event) => {
                setSize(Number(event.target.value));
                setResult(null);
              }}
            >
              {[16, 32, 64, 128].map((value) => (
                <option key={value} value={value}>
                  {value} B
                </option>
              ))}
            </select>
          </label>
          <label>
            <input
              type="checkbox"
              checked={corrupt}
              disabled={busy}
              onChange={(event) => {
                setCorrupt(event.target.checked);
                setResult(null);
              }}
            />
            {text(language, 'Corrupt last chunk', 'Alterar último bloque')}
          </label>
        </div>
        <button className="terminal-button" disabled={busy || !payload.length} onClick={verify}>
          {busy
            ? text(language, 'Verifying…', 'Verificando…')
            : text(language, 'Split & verify', 'Dividir y verificar')}
        </button>
        {error && <p role="alert">{error}</p>}
        {result && (
          <div className="lab-result">
            <p
              role="status"
              className={
                result.original === result.restored ? 'verification-ok' : 'verification-failed'
              }
            >
              {result.original === result.restored
                ? text(language, 'Integrity verified', 'Integridad verificada')
                : text(language, 'Integrity check failed', 'La verificación de integridad falló')}
            </p>
            <p>
              {result.bytes} B / {result.chunks.length} {text(language, 'chunks', 'bloques')}
            </p>
            <div className="chunk-list">
              {result.chunks.slice(0, 12).map((chunk, index) => (
                <div key={index}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <span>{chunk.bytes} B</span>
                  <code>{chunk.hash.slice(0, 12)}</code>
                </div>
              ))}
            </div>
            {result.chunks.length > 12 && (
              <p className="output-comment">
                {text(
                  language,
                  'Showing the first 12 chunks.',
                  'Se muestran los primeros 12 bloques.',
                )}
              </p>
            )}
            <h3>SHA-256 / {text(language, 'original', 'original')}</h3>
            <code className="digest">{result.original}</code>
            <h3>SHA-256 / {text(language, 'reassembled', 'reensamblado')}</h3>
            <code className="digest">{result.restored}</code>
          </div>
        )}
      </div>
    </aside>
  );
}
