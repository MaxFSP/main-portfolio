import { profile } from '../content';
import { text } from '../localization';
import type { Language } from '../localization';

export default function ProfileLinks({ language }: { language: Language }) {
  return (
    <div className="profile-links">
      <a
        className="profile-icon"
        href={profile.github}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={text(language, 'GitHub profile', 'Perfil de GitHub')}
        title="GitHub / MaxFSP"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor">
          <path d="M12 .75a11.25 11.25 0 0 0-3.56 21.92c.56.1.77-.24.77-.54v-2.1c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 1.72 2.64 1.22 3.28.93.1-.73.39-1.22.71-1.5-2.5-.28-5.13-1.25-5.13-5.56 0-1.23.44-2.23 1.16-3.02-.12-.28-.5-1.43.11-2.98 0 0 .95-.3 3.1 1.15a10.8 10.8 0 0 1 5.63 0c2.15-1.46 3.1-1.15 3.1-1.15.61 1.55.23 2.7.11 2.98.72.79 1.16 1.79 1.16 3.02 0 4.32-2.64 5.27-5.15 5.55.4.35.76 1.04.76 2.1v3.1c0 .3.21.65.78.54A11.25 11.25 0 0 0 12 .75Z" />
        </svg>
      </a>
      <a
        className="profile-icon"
        href={profile.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={text(language, 'LinkedIn profile', 'Perfil de LinkedIn')}
        title="LinkedIn / Santiago Paz Farfán"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor">
          <path d="M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96c0 .84.69 1.52 1.55 1.52h16.9c.86 0 1.55-.68 1.55-1.52V3.52c0-.84-.69-1.52-1.55-1.52ZM7.93 18.75H4.98V9.2h2.95v9.55ZM6.45 7.9a1.71 1.71 0 1 1 0-3.42 1.71 1.71 0 0 1 0 3.42Zm12.3 10.85H15.8V14.1c0-1.11-.02-2.54-1.55-2.54-1.55 0-1.79 1.21-1.79 2.46v4.73H9.51V9.2h2.83v1.31h.04c.39-.74 1.36-1.52 2.79-1.52 2.98 0 3.53 1.96 3.53 4.51v5.25Z" />
        </svg>
      </a>
    </div>
  );
}
