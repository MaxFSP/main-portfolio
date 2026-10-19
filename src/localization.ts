import { experience, profile, projects, skillGroups } from './content';

export type Language = 'en' | 'es';
export const text = (language: Language, en: string, es: string) => (language === 'es' ? es : en);

const projectTranslations = [
  {
    title: 'Carga de audio para una plataforma de salud',
    category: 'Infraestructura de salud',
    description: 'Carga de audio por lotes, procesamiento sin servidor y controles de acceso.',
    summary:
      'Los archivos de audio grandes superaban el límite de las solicitudes GraphQL. Implementé un flujo de carga por lotes y validación en AWS Lambda para comprobar la integridad de los archivos antes de enviarlos a un modelo de IA propietario.',
    details: [
      'Desarrollé servicios de AWS Lambda para la plataforma.',
      'Implementé control de acceso basado en roles con PostgreSQL y Amazon Verified Permissions.',
      'Evalué herramientas de desarrollo asistido por IA y creé demostraciones técnicas para el equipo.',
    ],
    note: 'El código y los datos de producción son privados. Todavía no hay una recreación pública disponible.',
  },
  {
    title: 'Aplicaciones para el sector inmobiliario',
    category: 'Aplicaciones web',
    description: 'Interfaces adaptables y flujos de datos sin servidor para equipos inmobiliarios.',
    summary:
      'En CrowdTech desarrollé aplicaciones con React y Next.js, conecté interfaces a APIs GraphQL y trabajé con los equipos de producto y diseño en componentes reutilizables.',
    details: [
      'Utilicé renderizado en el servidor, regeneración estática incremental y optimización de rendimiento para mejorar el SEO y la velocidad.',
      'Gestioné flujos de CI/CD y despliegues de aplicaciones alojadas en AWS.',
      'En Blacksheep Global desarrollé un backend sin servidor con GraphQL, AWS Lambda y DynamoDB para análisis inmobiliario.',
    ],
    note: 'Son experiencias profesionales distintas. Las aplicaciones y su código pertenecen a los clientes; estas notas describen únicamente mis contribuciones.',
  },
  {
    title: 'Contribuciones a PearAI',
    category: 'Herramientas de desarrollo',
    description: 'Contribuciones de código abierto al editor, backend, sitio web y documentación.',
    summary:
      'Contribuí al editor de escritorio, backend, sitio web y documentación de PearAI para la versión 1.0.0.',
    details: [
      'Corregí atajos de teclado del chatbot y problemas de interfaz.',
      'Actualicé endpoints de autenticación.',
      'Colaboré con las compilaciones para Linux basadas en Docker.',
    ],
    note: 'Contribuciones de código abierto de agosto de 2024 a julio de 2025. Mi historial público está disponible en GitHub.',
  },
];
const jobDetails = [
  'Aplicaciones React y Next.js, integraciones GraphQL, revisión de código y despliegues en AWS.',
  'Procesamiento de audio para una plataforma de salud, servicios AWS Lambda y controles de acceso.',
  'Backends GraphQL sin servidor y flujos de datos para análisis inmobiliario.',
  'Interfaces adaptables, componentes reutilizables, renderizado en el servidor y optimización de rendimiento.',
];
const dates = [
  'Dic 2025 — Jun 2026',
  'Abr 2025 — Dic 2025',
  'Dic 2024 — Abr 2025',
  'May 2023 — Abr 2025',
];

export function getContent(language: Language) {
  return {
    profile,
    projects:
      language === 'en'
        ? projects
        : projects.map((project, index) => ({ ...project, ...projectTranslations[index] })),
    experience:
      language === 'en'
        ? experience
        : experience.map((job, index) => ({
            ...job,
            detail: jobDetails[index],
            dates: dates[index],
            role:
              index === 2
                ? 'Ingeniero de software · Contrato a tiempo parcial'
                : 'Ingeniero de software',
            client: job.client ? 'Cliente: Raintree Systems' : undefined,
          })),
    skillGroups:
      language === 'en'
        ? skillGroups
        : skillGroups.map((group, index) => ({
            ...group,
            title: ['Interfaces', 'Servicios y datos', 'Herramientas y pruebas'][index],
          })),
  };
}

export function initialLanguage(): Language {
  const query = new URLSearchParams(window.location.search).get('lang');
  if (query === 'en' || query === 'es') return query;
  try {
    return localStorage.getItem('portfolio-language') === 'es' ? 'es' : 'en';
  } catch {
    return 'en';
  }
}
