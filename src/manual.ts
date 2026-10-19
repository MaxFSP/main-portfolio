import type { Language } from './localization';
type Manual = { synopsis: string; description: string; examples: string[]; notes?: string };

export const manuals: Record<string, Manual> = {
  whoami: {
    synopsis: 'whoami',
    description: 'Show my name, background, location, and profile links.',
    examples: ['whoami'],
  },
  work: {
    synopsis: 'work [healthcare|real-estate|pearai]',
    description:
      'List my professional work and open-source contributions, or read a specific note.',
    examples: ['work', 'work healthcare', 'work pearai'],
    notes: 'Client code is private. Independent recreations are not available yet.',
  },
  experience: {
    synopsis: 'experience',
    description: 'Read my employment history, responsibilities, and education.',
    examples: ['experience'],
  },
  skills: {
    synopsis: 'skills',
    description: 'List languages, frameworks, infrastructure, and testing tools from my résumé.',
    examples: ['skills'],
  },
  contact: {
    synopsis: 'contact',
    description:
      'Show my email address, GitHub, and LinkedIn. The email can be copied or opened in your mail app.',
    examples: ['contact'],
  },
  resume: {
    synopsis: 'resume',
    description: 'Show a link to download my actual résumé as a PDF.',
    examples: ['resume'],
  },
  theme: {
    synopsis: 'theme [dark|amber|phosphor|paper|light|list]',
    description:
      'List the available themes, or apply one. You can also choose a theme from the header. Your choice is saved on this browser.',
    examples: ['theme', 'theme amber', 'theme phosphor', 'theme paper', 'theme dark'],
    notes:
      'Aliases: black = dark, green = phosphor, retro = amber. CRT themes use a locally bundled pixel typeface. Run crt off to remove scanlines and glow.',
  },
  crt: {
    synopsis: 'crt [on|off|soft|strong|scanlines 0..100|glow 0..100]',
    description:
      'Open live screen controls, apply a preset, or tune scanline and glow intensity. Explicit presets also work on the Black theme. Preferences are saved independently from the theme.',
    examples: ['crt', 'crt soft', 'crt strong', 'crt scanlines 60', 'crt glow 40', 'crt off'],
    notes:
      'Light and Paper remain clean. Scanlines are static: no screen flicker or moving scanline. Reduced motion disables cursor blinking.',
  },
  tree: {
    synopsis: 'tree [work|.|~]',
    description:
      'Display the portfolio files as a clickable directory tree. With no argument, use the current directory.',
    examples: ['tree', 'tree work'],
  },
  ls: {
    synopsis: 'ls [work|.|~]',
    description:
      'List the current directory. At the portfolio root, show commands and available files. Inside work, list the work notes.',
    examples: ['ls', 'ls work/'],
  },
  cat: {
    synopsis: 'cat <filename>',
    description:
      'Read a portfolio file as terminal output. Work-note paths can be read from the root or from the work directory.',
    examples: ['cat about.txt', 'cat skills.txt', 'cat work/healthcare-audio.md'],
    notes:
      'These are portfolio documents. This command has no access to your computer or a server filesystem.',
  },
  cd: {
    synopsis: 'cd [work|..|~]',
    description:
      'Move between the portfolio root and the work directory. The prompt reflects the current path.',
    examples: ['cd work', 'cd ..'],
  },
  pwd: {
    synopsis: 'pwd',
    description: 'Print the current path in this portfolio’s virtual filesystem.',
    examples: ['pwd'],
  },
  history: {
    synopsis: 'history',
    description:
      'List commands from this session. History stays in memory and is cleared when the page reloads.',
    examples: ['history'],
    notes:
      'Use ↑ / ↓ to recall commands. Ctrl+R starts reverse search; repeat it to cycle matches. Enter selects a match for editing. Escape restores the draft. !! repeats the last command.',
  },
  less: {
    synopsis: 'less <file>',
    description:
      'Open a portfolio file in a full-pane reader. Use j/k or arrows to scroll, Space for a page, g/G for start/end, / to search, and n/N for the next or previous matching line. Q or Escape returns to the prompt.',
    examples: ['less experience.txt', 'less work/healthcare-audio.md'],
    notes:
      'Touch-friendly page and search controls are also available. Typing Q inside the search field does not exit the reader.',
  },
  grep: {
    synopsis: 'grep [-i] <text> [file|work/]',
    description:
      'Search literal text across portfolio documents. Use quotes for phrases and -i to ignore case. Results show file paths and line numbers; click a result to open its file.',
    examples: ['grep -i AWS', 'grep "AWS Lambda" work/', 'grep -i python skills.txt'],
    notes:
      'This searches actual portfolio content in the selected language. It does not evaluate regular expressions or access external files.',
  },
  share: {
    synopsis: 'share [healthcare|real-estate|pearai]',
    description:
      'Copy a direct link to a project note. With no argument, use the last project opened in this session. The link includes the selected language and opens the correct note after reload.',
    examples: ['share healthcare', 'share pearai'],
    notes: 'If clipboard access is denied, the link remains visible and selectable.',
  },
  split: {
    synopsis: 'split [on|off]',
    description:
      'Open project notes beside a standalone chunking demo. Split UTF-8 sample text into blocks, compute SHA-256 digests, reassemble it, and check integrity. You can deliberately corrupt a byte to test the failure path.',
    examples: ['split on', 'split off'],
    notes:
      'This is an independent browser example, not proprietary client code or a finished project recreation. It makes no network uploads. On phones, the panes stack vertically.',
  },
  tab: {
    synopsis: 'tab [list|new <name>|switch <id>|close <id>]',
    description:
      'Open and switch between up to eight independent terminal sessions. Each keeps its own history, directory, draft input, output, reader, split setting, and game. Theme and language are shared.',
    examples: ['tab list', 'tab new notes', 'tab switch 1'],
    notes:
      'The header controls also create, switch, and close sessions. Arrow keys switch focused tabs. The last session stays open. Sessions are held in memory and reset on reload.',
  },
  snake: {
    synopsis: 'snake',
    description:
      'Play Snake using arrow keys or WASD. Eat food to score. Avoid the walls and your own body. Space pauses, R restarts, and Q or Escape exits. Direction buttons support touch.',
    examples: ['snake'],
    notes:
      'Games pause when the browser tab is hidden or you switch sessions. Returning to that session preserves the board. Start and resume are explicit actions.',
  },
  lang: {
    synopsis: 'lang [en|es]',
    description:
      'Switch portfolio content, file search, work notes, readers, and interface labels between English and Spanish. The language picker in the header does the same. Command names and file paths stay unchanged.',
    examples: ['lang es', 'lang en'],
    notes:
      'Your choice is saved in this browser. A shared project link can explicitly select its language.',
  },
  '!!': {
    synopsis: '!!',
    description:
      'Run the last command again. The expanded command is added to history. If the session has no commands, display an error.',
    examples: ['!!'],
  },
  clear: {
    synopsis: 'clear',
    description:
      'Clear terminal output while keeping command history and your current directory. Ctrl+L does the same when the prompt has focus.',
    examples: ['clear'],
  },
  help: {
    synopsis: 'help',
    description: 'Show available commands, clickable files, and keyboard shortcuts.',
    examples: ['help'],
  },
  man: {
    synopsis: 'man [command]',
    description:
      'List the manual pages or read a command’s syntax, behavior, and examples. Click an example to run it.',
    examples: ['man', 'man theme', 'man history', 'man tree'],
  },
};

const spanish: Record<string, Partial<Manual>> = {
  whoami: { description: 'Muestra mi nombre, trayectoria, ubicación y enlaces de perfil.' },
  work: {
    description:
      'Lista mi trabajo profesional y contribuciones de código abierto, o abre una nota específica.',
    notes:
      'El código de los clientes es privado. Todavía no hay recreaciones públicas disponibles.',
  },
  experience: { description: 'Muestra mi experiencia laboral, responsabilidades y educación.' },
  skills: {
    description:
      'Lista lenguajes, frameworks, infraestructura y herramientas de pruebas de mi currículum.',
  },
  contact: {
    description:
      'Muestra mi correo, GitHub y LinkedIn. Puedes copiar el correo o abrirlo en tu aplicación de correo.',
  },
  resume: { description: 'Muestra un enlace para descargar mi currículum en PDF.' },
  theme: {
    description:
      'Lista los temas o aplica uno. También puedes usar el selector de la cabecera. La elección se guarda en este navegador.',
    notes:
      'Alias: black = dark, green = phosphor, retro = amber. Los temas CRT usan una fuente de píxeles local. Ejecuta crt para ajustar los efectos.',
  },
  crt: {
    description:
      'Abre los controles de pantalla, aplica un ajuste o cambia la intensidad de las líneas y del brillo. Los ajustes explícitos también funcionan con el tema Negro. Se guardan independientemente del tema.',
    notes:
      'Claro y Papel no reciben efectos. Las líneas son estáticas, sin parpadeos. El movimiento reducido desactiva el cursor intermitente.',
  },
  tree: {
    description:
      'Muestra los archivos del portafolio como un árbol interactivo. Sin argumentos, usa el directorio actual.',
  },
  ls: {
    description:
      'Lista el directorio actual. En la raíz muestra comandos y archivos; dentro de work muestra las notas de trabajo.',
  },
  cat: {
    description:
      'Lee un archivo del portafolio. Las notas se pueden abrir desde la raíz o desde el directorio work.',
    notes:
      'Son documentos del portafolio. El comando no tiene acceso a tu equipo ni a archivos de un servidor.',
  },
  cd: {
    description:
      'Cambia entre la raíz del portafolio y el directorio work. El indicador muestra la ruta actual.',
  },
  pwd: { description: 'Muestra la ruta actual en el sistema de archivos virtual del portafolio.' },
  history: {
    description:
      'Lista los comandos de esta sesión. El historial se guarda en memoria y se borra al recargar.',
    notes:
      '↑ / ↓ recuperan comandos. Ctrl+R busca en el historial; repítelo para cambiar de resultado. Enter selecciona y Escape recupera el borrador. !! repite el último comando.',
  },
  '!!': {
    description:
      'Ejecuta de nuevo el último comando. El comando expandido se guarda en el historial. Si no hay comandos anteriores, muestra un error.',
  },
  clear: {
    description:
      'Limpia la salida y conserva el historial y el directorio. Ctrl+L hace lo mismo con el indicador enfocado.',
  },
  help: { description: 'Muestra los comandos, archivos interactivos y atajos de teclado.' },
  man: {
    description:
      'Lista los manuales o muestra la sintaxis, comportamiento y ejemplos de un comando. Haz clic en un ejemplo para ejecutarlo.',
  },
  less: {
    description:
      'Abre un archivo en el lector. Usa j/k o flechas para desplazar, Espacio para avanzar una página, g/G para inicio/final, / para buscar y n/N para cambiar de resultado. Q o Escape vuelve al indicador.',
    notes:
      'También hay botones para pantallas táctiles. Escribir Q en la búsqueda no cierra el lector.',
  },
  grep: {
    description:
      'Busca texto literal en los documentos. Usa comillas para frases y -i para ignorar mayúsculas. Los resultados incluyen ruta y número de línea; haz clic para abrir el archivo.',
    notes:
      'Busca el contenido real en el idioma seleccionado. No evalúa expresiones regulares ni accede a archivos externos.',
  },
  share: {
    description:
      'Copia un enlace directo a una nota. Sin argumentos, usa el último proyecto abierto en esta sesión. El enlace incluye el idioma y abre la nota correcta al recargar.',
    notes: 'Si no se permite copiar, el enlace sigue visible para seleccionarlo.',
  },
  split: {
    description:
      'Abre notas junto a una demostración independiente de fragmentación: divide texto UTF-8, calcula SHA-256, lo reensambla y verifica su integridad. Puedes alterar un byte para probar el fallo.',
    notes:
      'Es un ejemplo del navegador, no código de un cliente ni una recreación terminada. No realiza cargas de red. En móviles los paneles se apilan.',
  },
  tab: {
    description:
      'Abre hasta ocho sesiones independientes. Cada una conserva historial, directorio, borrador, salida, lector, panel dividido y juego. El tema y el idioma son compartidos.',
    notes:
      'Los controles superiores crean, cambian y cierran sesiones. Las flechas cambian las pestañas enfocadas. La última sesión permanece abierta. Se reinician al recargar.',
  },
  snake: {
    description:
      'Juega con flechas o WASD. Come para sumar puntos y evita las paredes y tu cuerpo. Espacio pausa, R reinicia y Q o Escape sale. Hay controles táctiles.',
    notes:
      'El juego se pausa al ocultar el navegador o cambiar de sesión. Al volver conserva el tablero. Iniciar y continuar son acciones explícitas.',
  },
  lang: {
    description:
      'Cambia el contenido, búsqueda, notas, lector e interfaz entre inglés y español. También puedes usar el selector superior. Los comandos y rutas no cambian.',
    notes:
      'La preferencia se guarda en el navegador. Los enlaces compartidos pueden elegir el idioma explícitamente.',
  },
};

export function getManuals(language: Language): Record<string, Manual> {
  if (language === 'en') return manuals;
  return Object.fromEntries(
    Object.entries(manuals).map(([name, page]) => [name, { ...page, ...spanish[name] }]),
  );
}
