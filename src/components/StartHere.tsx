import { useEffect, useRef } from 'react';
import { getContent, text } from '../localization';
import type { Language } from '../localization';
import type { ReactNode } from 'react';
import ProjectActions from './ProjectActions';

export default function StartHere({
  step,
  language,
  setStep,
  close,
  run,
  render,
}: {
  step: number;
  language: Language;
  setStep: (step: number) => void;
  close: () => void;
  run: (command: string) => void;
  render: (view: 'about' | 'contributions' | 'contact') => ReactNode;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const t = (en: string, es: string) => text(language, en, es);
  const labels = [
    t('Background', 'Perfil'),
    t('Selected work', 'Trabajo seleccionado'),
    t('Contributions', 'Contribuciones'),
    t('Get in touch', 'Contacto'),
  ];
  const { projects } = getContent(language);
  useEffect(() => {
    body.current?.scrollTo({ top: 0 });
    heading.current?.focus({ preventScroll: true });
  }, [step]);
  return (
    <main
      className="tour-panel"
      aria-label={t('Portfolio walkthrough', 'Recorrido del portafolio')}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          close();
        }
      }}
    >
      <div className="pane-heading">
        <span>{t('start / a quick introduction', 'start / una breve presentación')}</span>
        <button onClick={close} aria-label={t('Close walkthrough', 'Cerrar recorrido')}>
          [ esc ]
        </button>
      </div>
      <nav className="tour-steps" aria-label={t('Walkthrough steps', 'Pasos del recorrido')}>
        {labels.map((label, index) => (
          <button
            key={index}
            onClick={() => setStep(index)}
            aria-current={index === step ? 'step' : undefined}
          >
            <span aria-hidden="true">{index + 1}.</span> {label}
          </button>
        ))}
      </nav>
      <div className="tour-content" ref={body}>
        <h2 className="tour-heading" ref={heading} tabIndex={-1}>
          {labels[step]}
        </h2>
        {step === 0 && (
          <>
            <p className="tour-intro">
              {t(
                'I build web interfaces and backend services with TypeScript, React, Python, and AWS. This is a short route through my work. No terminal knowledge needed.',
                'Desarrollo interfaces web y servicios backend con TypeScript, React, Python y AWS. Este recorrido presenta mi trabajo. No necesitas conocer comandos.',
              )}
            </p>
            {render('about')}
          </>
        )}
        {step === 1 && (
          <div className="tour-work">
            {['pearai', 'healthcare', 'linux-installer'].map((id) => {
              const project = projects.find((item) => item.id === id)!;
              return (
                <article key={id}>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <p className="output-comment">{project.tags.join(' / ')}</p>
                  <ProjectActions project={project} language={language} run={run} showCaseStudy />
                </article>
              );
            })}
            <p className="output-comment">
              {t(
                'Client code is private. Public recreations will be added as working demos are built.',
                'El código de clientes es privado. Las recreaciones se añadirán cuando se desarrollen las demostraciones.',
              )}
            </p>
          </div>
        )}
        {step === 2 && (
          <>
            {render('contributions')}
            <button className="file-link" onClick={() => run('contributions')}>
              {t('Browse the complete verified record', 'Ver el registro verificado completo')}
            </button>
          </>
        )}
        {step === 3 && (
          <>
            {render('contact')}
            <a
              className="tour-resume"
              href={import.meta.env.BASE_URL + 'resume.pdf'}
              download="Santiago-Paz-Farfan-Resume.pdf"
            >
              {t('Download résumé', 'Descargar currículum')} ↓
            </a>
          </>
        )}
      </div>
      <div className="tour-controls">
        <button disabled={step === 0} onClick={() => setStep(step - 1)}>
          {t('Back', 'Atrás')}
        </button>
        <span role="status">
          {step + 1} / {labels.length}
        </span>
        {step < labels.length - 1 ? (
          <button onClick={() => setStep(step + 1)}>{t('Next', 'Siguiente')} →</button>
        ) : (
          <button onClick={close}>{t('Explore the terminal', 'Explorar el terminal')}</button>
        )}
      </div>
    </main>
  );
}
