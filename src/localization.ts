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
    outcome:
      'Entregué un flujo de carga por lotes con validación de integridad antes de enviar el audio al procesamiento de IA.',
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
    outcome:
      'Entregué interfaces web, flujos de despliegue y servicios de datos sin servidor en estas experiencias inmobiliarias separadas.',
  },
  {
    title: 'Contribuciones a PearAI',
    category: 'Herramientas de desarrollo',
    description: 'Contribuciones de código abierto al editor, backend, sitio web y documentación.',
    summary:
      'Contribuí al editor, extensión, sitio web y documentación de PearAI: lanzamiento de v1, descargas para Linux, comportamiento del chat e interfaces adaptables.',
    details: [
      'Preparé el sitio para v1, eliminando restricciones de espera y actualizando descargas, precios y navegación móvil.',
      'Añadí descargas y guías para Linux, incluyendo procesadores antiguos y NixOS.',
      'Corregí la interfaz de nueva ventana, el chat según el espacio de trabajo y la distribución de la extensión.',
      'Corregí la documentación de atajos y adapté los videos de documentación a móviles.',
    ],
    note: 'El currículum abarca mi colaboración de agosto de 2024 a julio de 2025. Esta revisión pública se realizó el 22 de octubre de 2026.',
    outcome:
      'Se integraron cambios en cuatro repositorios originales. La página de problemas conocidos sigue como propuesta abierta y se muestra por separado.',
  },
  {
    title: 'Instalador de PearAI para Linux',
    category: 'Herramientas para Linux',
    description: 'Scripts para instalar, configurar y desinstalar PearAI en Linux.',
    summary:
      'Scripts y utilidades para configurar PearAI en Linux, con integración de escritorio y manejo de enlaces.',
    details: [
      'Scripts de instalación y desinstalación.',
      'Accesos de escritorio para iniciar PearAI.',
      'Registro del manejador de enlaces y utilidades de configuración.',
    ],
    note: 'Repositorio público. Los requisitos y el uso están documentados en su README.',
  },
  {
    title: 'Búsqueda de rutas A* con interfaz',
    category: 'Algoritmos y visualización',
    description: 'Proyecto en Python y Pygame para explorar rutas en una cuadrícula.',
    summary:
      'Proyecto de búsqueda de rutas en una cuadrícula con una interfaz Pygame y estados visuales para explorar el algoritmo A*.',
    details: [
      'Las celdas representan inicio, destino, obstáculos y rutas.',
      'Usa una cola de prioridad en la búsqueda.',
      'El código Python y los recursos de la interfaz están disponibles en el repositorio.',
    ],
    note: 'Proyecto público en Python. El repositorio contiene el código y los recursos para ejecutarlo localmente.',
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
