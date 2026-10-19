export const profile = {
  name: 'Santiago Maximiliano Paz Farfán',
  email: 'maximiliano.farfansp@gmail.com',
  github: 'https://github.com/MaxFSP',
  linkedin: 'https://www.linkedin.com/in/maximiliano-paz-farf%C3%A1n-741b6b21b/',
};

type Project = {
  id: string;
  title: string;
  category: string;
  organization: string;
  description: string;
  tags: string[];
  type: 'Professional work' | 'Open source' | 'Public project';
  summary: string;
  details: string[];
  note: string;
  repositories?: { label: string; url: string }[];
};

export const projects: Project[] = [
  {
    id: 'healthcare',
    title: 'Healthcare audio uploads',
    category: 'Healthcare infrastructure',
    organization: 'AssureSoft · Raintree Systems',
    description:
      'Batched audio uploads, serverless processing, and access controls for a healthcare platform.',
    tags: ['Python', 'AWS Lambda', 'GraphQL'],
    type: 'Professional work',
    summary:
      'Large audio files exceeded the platform’s GraphQL request limits. I built a batched upload flow and AWS Lambda validation to check file integrity before forwarding audio to a proprietary AI model.',
    details: [
      'Developed AWS Lambda services for the platform.',
      'Implemented role-based access control using PostgreSQL and Amazon Verified Permissions.',
      'Evaluated AI-assisted development tools and built technical demos for engineers.',
    ],
    note: 'Source code and production data are private. A public recreation is not available yet.',
  },
  {
    id: 'real-estate',
    title: 'Real estate applications',
    category: 'Web applications',
    organization: 'CrowdTech & Blacksheep Global',
    description: 'Responsive interfaces and serverless data flows for real estate teams.',
    tags: ['Next.js', 'TypeScript', 'AWS'],
    type: 'Professional work',
    summary:
      'At CrowdTech, I built React and Next.js applications, connected interfaces to GraphQL APIs, and worked with product and design teams on reusable components.',
    details: [
      'Used server-side rendering, incremental static regeneration, and performance tuning to support SEO and page speed.',
      'Managed CI/CD and release workflows for AWS-hosted applications.',
      'At Blacksheep Global, built a serverless backend with GraphQL, AWS Lambda, and DynamoDB for real estate analytics.',
    ],
    note: 'These are separate professional engagements. Client applications and source code are proprietary; the descriptions share only the scope of my contributions.',
  },
  {
    id: 'pearai',
    title: 'PearAI contributions',
    category: 'Developer tools',
    organization: 'PearAI',
    description:
      'Open-source contributions across an AI code editor, backend, website, and documentation.',
    tags: ['React', 'Electron', 'FastAPI'],
    type: 'Open source',
    summary:
      'Contributed to PearAI across its desktop app, backend, website, and documentation repositories in support of the 1.0.0 release.',
    details: [
      'Fixed chatbot keyboard shortcuts and interface issues.',
      'Updated authentication endpoints.',
      'Supported Docker-based Linux builds.',
    ],
    note: 'Open-source contributions from August 2024 to July 2025. My working repositories are linked below.',
    repositories: [
      { label: 'pearai-app', url: 'https://github.com/MaxFSP/pearai-app' },
      { label: 'pearai-submodule', url: 'https://github.com/MaxFSP/pearai-submodule' },
      { label: 'pear-landing-page', url: 'https://github.com/MaxFSP/pear-landing-page' },
      { label: 'pearai-documentation', url: 'https://github.com/MaxFSP/pearai-documentation' },
    ],
  },
  {
    id: 'linux-installer',
    title: 'PearAI Linux installer',
    category: 'Linux tooling',
    organization: 'MaxFSP / PearAI-linux-installer',
    description: 'Shell scripts for installing, configuring, and removing PearAI on Linux.',
    tags: ['Bash', 'Linux'],
    type: 'Public project',
    summary:
      'Installation scripts and utilities for setting up PearAI on Linux, with desktop integration and URL handling.',
    details: [
      'Installation and uninstallation scripts.',
      'Desktop entries for launching PearAI.',
      'URL handler registration and configuration utilities.',
    ],
    note: 'Public repository. Setup requirements and usage are documented in its README.',
    repositories: [
      { label: 'PearAI-linux-installer', url: 'https://github.com/MaxFSP/PearAI-linux-installer' },
    ],
  },
  {
    id: 'pathfinding',
    title: 'A* pathfinding with UI',
    category: 'Algorithms & visualization',
    organization: 'MaxFSP / A-star-pathfinding-with-UI',
    description: 'A Python and Pygame project for exploring grid-based pathfinding.',
    tags: ['Python', 'Pygame', 'A*'],
    type: 'Public project',
    summary:
      'A grid-based pathfinding project with a Pygame interface and visual states for exploring the A* algorithm.',
    details: [
      'Grid cells represent start, end, barriers, and path states.',
      'Uses a priority queue for the pathfinding search.',
      'Python source and UI assets are available in the repository.',
    ],
    note: 'Public Python project. The repository contains the source and assets for running it locally.',
    repositories: [
      {
        label: 'A-star-pathfinding-with-UI',
        url: 'https://github.com/MaxFSP/A-star-pathfinding-with-UI',
      },
    ],
  },
];

export const experience = [
  {
    company: 'CrowdTech',
    role: 'Software Engineer',
    dates: 'Dec 2025 — Jun 2026',
    detail:
      'React and Next.js applications, GraphQL integrations, peer reviews, and AWS release workflows.',
  },
  {
    company: 'AssureSoft',
    client: 'Client: Raintree Systems',
    role: 'Software Engineer',
    dates: 'Apr 2025 — Dec 2025',
    detail: 'Healthcare audio processing, AWS Lambda services, and fine-grained access controls.',
  },
  {
    company: 'Blacksheep Global',
    role: 'Software Engineer · Part-time contract',
    dates: 'Dec 2024 — Apr 2025',
    detail: 'Serverless GraphQL backends and real estate analytics data flows.',
  },
  {
    company: 'CrowdTech',
    role: 'Software Engineer',
    dates: 'May 2023 — Apr 2025',
    detail:
      'Responsive interfaces, reusable components, server-side rendering, and performance tuning.',
  },
];

export const skillGroups = [
  {
    title: 'Interfaces',
    skills: ['TypeScript', 'React', 'Next.js', 'Redux', 'Tailwind CSS', 'React Native'],
  },
  {
    title: 'Services & data',
    skills: ['Python', 'Node.js', 'NestJS', 'FastAPI', 'GraphQL', 'PostgreSQL', 'DynamoDB'],
  },
  {
    title: 'Tools & testing',
    skills: ['AWS', 'Docker', 'Git', 'Linux', 'Jest', 'Vitest', 'CI/CD'],
  },
];
