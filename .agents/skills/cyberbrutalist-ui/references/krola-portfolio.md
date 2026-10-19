# Krola Portfolio — Perfil de interfaz

Usar este perfil al continuar el proyecto `krola-portafolio`, o cuando el usuario pida explícitamente una variante de su portafolio de diseño web con IA y ciberseguridad. Es una instantánea de sus decisiones de diseño; respetar las solicitudes nuevas del usuario cuando contradigan este documento.

## Dirección y objetivo

- Dirección dominante: **Acid Terminal** con acento electric-lime, base azul/carbón y detalles técnicos limpios.
- Objetivo: mostrar capacidad de diseño web, dirección artística asistida por IA y criterio de ciberseguridad sin convertir la página en una terminal ficticia.
- Sensación: editorial, precisa y experimental. La ornamentación debe orientar, indicar estados o estructurar contenido.
- Densidad: secciones compactas, bordes rectos, áreas vacías intencionales y una única pieza visual protagonista por sección.

## Tokens y tipografía del proyecto

Usar los tokens existentes en `src/styles/global.css` y mantenerlos alineados con `DESIGN.md`:

| Rol | Token / fuente | Uso |
| --- | --- | --- |
| Canvas | `--color-dark` `#010207` | Fondo del documento y hero |
| Sección | `--color-section-surface` `#171717` | Fondo compartido de Process, Work y The Lab |
| Superficie azul | `--color-blue`, `--color-neutral-blue` | Video, visuales y profundidad |
| Texto | `--color-grey` | Texto legible y líneas de interfaz |
| Señal secundaria | `--color-lime` | Estados, micro-copy, etiquetas |
| Señal primaria | `--color-electric-lime` | CTA, selección y brackets |
| Display | Orbitron | `h1`, encabezados de sección, títulos de proyecto |
| Cuerpo | Lexend | Párrafos y contenido legible |
| Acción Home | Monospace de sistema | Texto negro uppercase con `>_` en botones lime |
| Técnica | Josefin Sans | Índices, metadata, labels y estados |

Mantener la jerarquía de color próxima a 70/20/10: superficies neutrales predominantes, bordes/superficies elevadas secundarias y lima reservado para estados o énfasis.

## Acento secundario: Signal Blue

- `--color-signal-blue: #008BFF` complementa el lime sin competir con los CTA; usarlo en /01, /02 y /03 de los encabezados Home.
- Process, Work y The Lab usan carbón mate plano `--color-section-surface: #171717`; no aplicar brillo o gradientes al fondo compartido ni convertirlo en negro puro.
- Vulnerability Intelligence reemplaza todos los acentos celestes anteriores por este azul: `--obs-cyan` referencia el token compartido y sus bordes, fondos suaves y sombras derivan de él conservando sus opacidades.
- Mantener los botones Home lime, el texto gris/blanco y las alertas rojo/ámbar. No cambiar las superficies azul oscuro del hero.

## Arquitectura de página

La portada usa `BaseLayout` con un navbar global, el crawler decorativo y un `main` formado por las secciones en este orden:

1. `Hero`
2. `Process`
3. `Work`
4. `TheLab`

Cada sección debe tener un `id`, un `aria-labelledby` y un `h2` claro. Los títulos siguen el patrón de índice azul `--color-signal-blue` (`/01`, `/02`, `/03`) seguido por el nombre gris en Orbitron. No añadir secciones, rutas o acciones no solicitadas.

## Navbar de estado

- Posición absoluta sobre el hero; no genera una franja opaca.
- Retícula 15 / 70 / 15: icono de mira y texto de especialidad a la izquierda, espacio técnico central, disponibilidad a la derecha.
- El texto `AI WEB DESIGNER - CYBERSEC` usa scramble breve y se estabiliza antes de repetirse; el fallback de movimiento reducido muestra el texto sin animación.
- `AVAILABLE FOR FREELANCE` termina con un punto lime que pulsa suavemente.
- Mantener padding lateral compacto y evitar cualquier overflow horizontal.

## Hero

- Hero a altura de viewport con `background_hero.mp4` en autoplay silenciado, loop y `playsinline`.
- Dos columnas equilibradas en desktop: izquierda oscura semitransparente para contenido, derecha azul neutra semitransparente para la pieza visual. En móvil se apilan sin perder el orden.
- Columna izquierda: H1 Orbitron en tres líneas — `DESIGN`, `BEYOND` (electric-lime), `LIMITS` —, copy de valor y CTA futurista lime.
- El CTA usa el contrato compartido Retro Terminal Chassis descrito abajo; no utilizar la antigua trama cuadriculada ni borde degradado.
- Columna derecha: calavera a escala amplia, sombra de profundidad y float lento. En hover se cambia a la versión wireframe y se permite un glitch blanco muy breve; las capas de glitch no deben ocultar la imagen base de forma sostenida.
- El rótulo vertical `CAROLINA VALLEJO AI WEB DESIGNER - CYBERSECURITY` usa Orbitron gris y un divisor vertical fino como detalle editorial.
- Los ornamentos orbitales, si se usan, permanecen secundarios y no deben competir con el titular ni con el CTA.

## Process

- Fondo `#171717`, bordes superior e inferior grises de baja intensidad y contenedor máximo de 1600px.
- Encabezado `/01 THE PROCESS` en Orbitron.
- Cinco pasos: `Discovery`, `Architecture`, `AI build`, `Technical / LLM`, `Deployment`.
- Desktop: cinco columnas con separadores verticales. Tablet: dos columnas con separadores correctos. Móvil: pila con separadores horizontales.
- Cada paso contiene icono monocromo, fase/índice técnico, título Josefin Sans en electric-lime y una descripción Lexend gris.
- El componente es informativo: no aplicar hover, glitch ni botones decorativos a cada paso.

## Work: selector de proyectos

- Fondo `#171717`, sección compacta, bordes finos y sin cuadrícula decorativa de fondo.
- Cabecera: `/02 DIFFERENT DESIGNS, DIFFERENT TARGETS`, con registro `SELECTED WORK // 04 DIRECTIONS`.
- Desktop: tres columnas del mismo peso:
  1. Introducción editorial: label técnico, H3 Orbitron y párrafo breve que explica que cada sistema responde a una audiencia/objetivo distinto.
  2. Card activa: registro, estado `SELECTED` con punto pulsante, una imagen 16:10 compacta, título, descripción limitada y CTA `SHOW MORE`.
  3. Selector: tres cards comprimidas sin imagen ni descripción, cada una con índice, categoría, título y `SELECT NOW` con punto estático.
- Al seleccionar una card comprimida, sus datos pasan a la card central y la card antes activa vuelve al selector. Conservar keyboard focus y un anuncio `aria-live` sobre la card activa.
- Solo la card activa recibe el hover completo: desplazamiento de 2–4px, zoom muy sutil y una pasada única de glitch. Las compactas solo cambian discretamente borde/fondo para confirmar que son seleccionables.
- Mantener los corner brackets mediante pseudoelementos y el color lime solo para la selección, título alterno o acción.
- Tablet: la introducción abarca las dos columnas superiores; card activa y selector quedan debajo. Móvil: pila lineal con card activa primero.

## The Lab

- Fondo `#171717`, encabezado `/03 THE-LAB` y estado de sistema experimental.
- Un solo panel `35 / 65` en desktop: copia del proyecto a la izquierda y dashboard a la derecha; se apila en móvil.
- Copia: meta `EXP_01 / AI FORENSICS`, eyebrow de prototipo, título Orbitron fragmentado con `BANK TRANSFER` lime, descripción y tres capacidades numeradas.
- La acción `TRY NOW` usa Retro Terminal Chassis y conserva su enlace al Observatory y build id técnico a la derecha.
- Visual: cabecera de dashboard, imagen `example-dashboard.jpg` dentro de un marco técnico, scanlines de baja opacidad, telemetría inferior y glitch de una sola ejecución al hover.
- Las esquinas técnicas delimitan el panel y el marco de dashboard. Una única retícula de fondo puede vivir dentro del panel, no en toda la sección.

## Botones Home: Retro Terminal Chassis

- Todos los botones y enlaces CTA de Hero, Work y The Lab comparten `terminal-button` y `terminal-button__face`, definidos en `src/styles/global.css`. Process no necesita acciones nuevas.
- Cara plana rectangular `--color-lime` (`#d2ef28`), borde negro 4px y contorno blanco 1px. Texto negro uppercase, monospace de sistema (Cascadia Code / Consolas), precedido por `>_` decorativo con `aria-hidden`.
- Chasis negro plano proyectado 10px a derecha y abajo, contorno blanco fino y corte diagonal superior derecho. Sin radios, glow, gradientes ni retículas en el botón.
- Hover desplaza 2px arriba/izquierda; active 2px abajo/derecha. Foco blanco claramente visible, target mínimo 44px y movimiento reducido sin desplazamiento.
- Los selectores comprimidos de Work usan el mismo acabado, conservando metadata, título, punto estático y comportamiento de intercambio de proyectos; texto y punto en negro para contraste.
- Reservar espacio para la capa posterior y permitir el ajuste de labels en móvil. Conservar textos, enlaces y atributos de interacción. No extender esta regla a los controles del Cyber Observatory.

## Movimiento y estados compartidos

- El documento usa `scroll-behavior: smooth`.
- Las secciones entran una vez con `bounce-in-fwd` mediante `IntersectionObserver`; no reiniciar la animación al salir y volver a entrar.
- Reservar glitch para una interacción puntual: calavera del hero, imagen activa de Work o dashboard de The Lab. Nunca mantener más de un glitch simultáneo en el viewport.
- Float lento solo para la calavera; no hacer flotar cards, texto o botones.
- Todos los componentes animados deben incluir `prefers-reduced-motion`: detener loops, esconder capas glitch y conservar contenido estático legible.
- Los hover deben durar aproximadamente 140–420ms y desplazarse como máximo 4px, salvo el float ambiental del hero.

## Crawler decorativo

- `escorp.png` se muestra como un layer fijo no interactivo y sigue al puntero con distancia y easing, sin movimientos autónomos bruscos.
- Debe ignorar input táctil, permanecer por detrás del navbar y no impedir clicks.
- Con movimiento reducido se fija como adorno estático en una esquina.
- Mantenerlo pequeño y con una sombra azul muy sutil; no duplicarlo ni convertirlo en un CTA.

## Responsive y control de calidad

- Desktop: 1024px o más; tablet: 640–1023px; móvil: menos de 640px.
- En móvil, priorizar contenido sobre ornamentos: apilar layouts, reducir metadata no esencial y conservar botones de al menos 44px de alto.
- Usar `minmax(0, ...)`, `overflow: clip` o `overflow-x: clip` para evitar barras horizontales.
- Mantener texto de cuerpo cerca de 16px; metadata puede bajar a 12px, pero no menos.
- Todo control interactivo debe ser un `button` o `a` semántico, tener `focus-visible` y no depender solo del color para comunicar estado.
- Antes de cerrar cambios, comprobar compilación de Astro y que no haya desbordamiento, capas decorativas rotas o motion que perjudique la lectura.
