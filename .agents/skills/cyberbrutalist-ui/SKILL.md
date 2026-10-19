---
name: cyberbrutalist-ui
description: Diseña y construye webs, landing pages, portfolios, aplicaciones SaaS y dashboards con estética Cyberpunk, Cyberbrutalism, hacking editorial y Pixel Dithering. Úsala cuando el usuario pida interfaces futuristas, terminales visuales, dashboards oscuros, brutalismo digital, gráficos HUD, imágenes tramadas, efectos glitch controlados o paletas neón.
---

# Cyberbrutalist UI

Diseñar interfaces cyberpunk y cyberbrutalistas funcionales, legibles, responsive y accesibles.

La estética debe surgir de una estructura clara, tipografía contundente, contraste alto, modularidad técnica y ornamentación controlada. No convertir cada elemento en una terminal ni llenar toda la pantalla de efectos.

## Resultado esperado

Cuando se solicite construir una interfaz:

1. Inspeccionar el proyecto y respetar su framework, arquitectura y convenciones.
2. Identificar el tipo de producto y su tarea principal.
3. Elegir una única dirección visual dominante.
4. Definir tokens antes de diseñar componentes.
5. Construir primero la jerarquía y después la decoración.
6. Implementar estados interactivos y responsive.
7. Validar accesibilidad, contraste, densidad y navegación.
8. Entregar una interfaz funcional, no una maqueta puramente decorativa.

## Direcciones visuales

Elegir un preset principal. No combinar todos los colores neón simultáneamente.

### Acid Terminal

Adecuado para:

- Portfolios.
- Herramientas creativas.
- Inteligencia artificial.
- Ciberseguridad.
- Música.
- Productos experimentales.

Características:

- Fondo negro carbón.
- Blanco cálido para contenido.
- Lima ácido como único acento dominante.
- Tipografía display condensada.
- Tipografía monoespaciada para etiquetas, navegación y metadatos.
- Bordes rectos.
- Retículas visibles.
- Pequeños marcadores técnicos.
- Dithering blanco, verde o monocromo.

### Blue Command Center

Adecuado para:

- Analítica.
- Observabilidad.
- Infraestructura.
- Monitorización.
- Datos.
- Seguridad.
- Inteligencia operativa.

Características:

- Azul noche con paneles azul petróleo.
- Cian eléctrico como señal principal.
- Rojo reservado para errores, pérdidas o amenazas.
- Retículas finas.
- Gráficos densos.
- Composición HUD.
- Menor brutalismo tipográfico.
- Mayor precisión instrumental.

### Magenta Underground

Adecuado para:

- Gaming.
- Cultura.
- Festivales.
- Música.
- Comunidades.
- Moda.
- Estudios creativos.

Características:

- Negro profundo.
- Magenta como acento principal.
- Lima usado únicamente como acento secundario.
- Tipografía display agresiva.
- Collage.
- Pintura.
- Texturas de impresión.
- Grano.
- Glitch expresivo.
- Contenido organizado mediante una cuadrícula consistente.

### Monochrome Hacker

Adecuado para:

- Estudios experimentales.
- Portfolios.
- Proyectos artísticos.
- Herramientas técnicas.
- Productos de seguridad.
- Experiencias narrativas.

Características:

- Negro y blanco con verde terminal opcional.
- Imágenes bitonales con ordered dithering.
- Texto monoespaciado.
- Cursores.
- Etiquetas de sistema.
- Glitch limitado a títulos, transiciones o estados especiales.
- Formas simples.
- Bordes de 1 px.
- Composición editorial.

## Principios obligatorios

### Función antes que ruido

Cada elemento decorativo debe cumplir al menos una función:

- Reforzar la jerarquía.
- Separar zonas.
- Indicar un estado.
- Dirigir la mirada.
- Comunicar identidad.
- Añadir contexto.

Eliminar cualquier elemento que no cumpla al menos una de estas funciones.

### Regla 70/20/10

Distribución visual recomendada:

- 70% superficies neutrales.
- 20% superficies elevadas, bordes y divisiones.
- 10% color de señal.

En dashboards densos, reducir el color de señal a un 5–8%.

### Presupuesto de efectos

Por viewport utilizar como máximo:

- Una imagen protagonista procesada.
- Un patrón de fondo.
- Un efecto glitch activo.
- Dos familias de detalles técnicos.
- Un color neón dominante.
- Un glow principal.

### Brutalismo controlado

El brutalismo debe aparecer principalmente en:

- Titulares.
- Cortes de sección.
- Bordes.
- Numeración.
- Botones principales.
- Bloques promocionales.
- Mensajes de estado.
- Divisores editoriales.

Las tablas, formularios, filtros, gráficas y datos deben permanecer claros y predecibles.

## Tokens base

Usar variables semánticas. No distribuir colores hexadecimales arbitrarios por los componentes.

```css
:root {
  color-scheme: dark;

  --bg-canvas: #080a08;
  --bg-surface: #0e110f;
  --bg-elevated: #151916;
  --bg-overlay: rgb(8 10 8 / 84%);
  --bg-inverse: #eef0e9;

  --text-primary: #f1f3ec;
  --text-secondary: #a6ada4;
  --text-muted: #697168;
  --text-disabled: #4c514b;
  --text-inverse: #090b09;

  --accent: #b7ff00;
  --accent-hover: #ceff4a;
  --accent-active: #9ee000;
  --accent-soft: rgb(183 255 0 / 12%);

  --accent-cyan: #00e5ff;
  --accent-magenta: #ff168f;

  --success: #70ff66;
  --warning: #ffc857;
  --danger: #ff4057;
  --info: #48c7ff;

  --border-subtle: rgb(238 240 233 / 10%);
  --border-default: rgb(238 240 233 / 22%);
  --border-strong: rgb(238 240 233 / 48%);
  --border-inverse: rgb(9 11 9 / 28%);

  --grid-line: rgb(238 240 233 / 7%);
  --focus-ring: #ffffff;

  --radius-none: 0;
  --radius-xs: 2px;
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 20px;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;
  --space-9: 96px;
  --space-10: 128px;

  --container: 1440px;
  --content-reading: 720px;

  --shadow-panel: 0 16px 50px rgb(0 0 0 / 32%);
  --shadow-floating: 0 24px 80px rgb(0 0 0 / 48%);
  --glow-accent: 0 0 24px rgb(183 255 0 / 18%);
  --glow-cyan: 0 0 28px rgb(0 229 255 / 18%);
  --glow-magenta: 0 0 28px rgb(255 22 143 / 18%);

  --duration-fast: 120ms;
  --duration-base: 220ms;
  --duration-slow: 420ms;

  --ease-out: cubic-bezier(.2, .8, .2, 1);
  --ease-sharp: cubic-bezier(.4, 0, .2, 1);
}
```

Para temas claros cyberbrutalistas:

```css
[data-theme="light"] {
  color-scheme: light;

  --bg-canvas: #efefe9;
  --bg-surface: #f8f8f2;
  --bg-elevated: #ffffff;
  --bg-overlay: rgb(239 239 233 / 88%);
  --bg-inverse: #090a08;

  --text-primary: #090a08;
  --text-secondary: #44483f;
  --text-muted: #6c7168;
  --text-disabled: #9b9f98;
  --text-inverse: #f2f3ed;

  --border-subtle: rgb(9 10 8 / 12%);
  --border-default: rgb(9 10 8 / 30%);
  --border-strong: rgb(9 10 8 / 58%);
  --grid-line: rgb(9 10 8 / 8%);

  --focus-ring: #090a08;
}
```

No utilizar negro absoluto y blanco absoluto para grandes superficies salvo en el preset Monochrome Hacker.

## Tipografía

Utilizar un máximo de tres roles tipográficos.

### Tipografía display

Opciones:

- Archivo Black.
- Anton.
- Bebas Neue.
- Chakra Petch.
- Space Grotesk.
- Sora ExtraBold.

Utilizar en:

- Hero.
- Títulos de sección.
- Cifras promocionales.
- Mensajes de sistema importantes.
- Campañas.
- Numeración editorial.

Pesos:

- Entre 700 y 900.
- Preferir 800.
- No simular pesos que la fuente no incluya.

Tratamiento recomendado:

```css
.display {
  font-family: "Archivo Black", "Arial Narrow", sans-serif;
  font-weight: 900;
  font-size: clamp(3.5rem, 10vw, 9rem);
  line-height: .84;
  letter-spacing: -.055em;
  text-transform: uppercase;
  text-wrap: balance;
}
```

### Tipografía de interfaz

Opciones:

- Space Grotesk.
- Inter.
- IBM Plex Sans.
- Geist.
- Manrope.

Pesos:

- 400 para contenido.
- 500 para controles.
- 600 para navegación y subtítulos.
- 700 para métricas y énfasis.

No utilizar peso 300 en texto pequeño sobre fondos oscuros.

### Tipografía técnica o monoespaciada

Opciones:

- IBM Plex Mono.
- JetBrains Mono.
- Space Mono.
- Azeret Mono.
- Share Tech Mono.

Utilizar en:

- Eyebrows.
- Etiquetas.
- IDs.
- Breadcrumbs.
- Fechas.
- Estados.
- Código.
- Ejes de gráficas.
- Tablas densas.
- Coordenadas.
- Mensajes del sistema.

```css
.label-tech {
  font-family: "IBM Plex Mono", monospace;
  font-size: .6875rem;
  font-weight: 500;
  line-height: 1.3;
  letter-spacing: .08em;
  text-transform: uppercase;
}
```

### Escala recomendada

```css
:root {
  --text-xs: clamp(.68rem, .65rem + .1vw, .75rem);
  --text-sm: clamp(.78rem, .74rem + .15vw, .875rem);
  --text-body: clamp(.95rem, .9rem + .2vw, 1.0625rem);
  --text-lead: clamp(1.1rem, 1rem + .45vw, 1.4rem);
  --text-h3: clamp(1.45rem, 1.1rem + 1.4vw, 2.4rem);
  --text-h2: clamp(2.2rem, 1.4rem + 3.5vw, 5rem);
  --text-hero: clamp(3.6rem, 1.7rem + 8vw, 10rem);
}
```

Mantener párrafos entre 45 y 72 caracteres por línea.

## Cuadrícula y layout

### Web editorial

- Contenedor máximo: 1440–1600 px.
- Padding desktop: 32–64 px.
- Padding tablet: 24–32 px.
- Padding móvil: 16–20 px.
- Grid desktop: 12 columnas.
- Grid tablet: 8 columnas.
- Grid móvil: 4 columnas.
- Gap: 16–24 px.
- Separaciones grandes: 64–128 px.

La asimetría debe estar anclada a una cuadrícula coherente.

```css
.page-container {
  width: min(100% - 32px, var(--container));
  margin-inline: auto;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: clamp(16px, 2vw, 24px);
}
```

### Dashboard

Layout desktop recomendado:

```css
.dashboard-shell {
  display: grid;
  grid-template-columns: 248px minmax(0, 1fr) 304px;
  min-height: 100dvh;
}
```

Variantes:

- Sin activity rail: `240px minmax(0, 1fr)`.
- Dashboard técnico: sidebar de 208–224 px.
- Modo compacto: sidebar de 72–80 px.
- Contenido: grid de 12 columnas.
- KPI pequeño: 3 columnas.
- Gráfico medio: 6 columnas.
- Gráfico protagonista: 8 columnas.
- Activity feed: 4 columnas.

En tablet, ocultar el rail derecho antes de colapsar la navegación.

En móvil:

- Utilizar una columna.
- Convertir la navegación en drawer.
- Mostrar KPIs en carrusel o grid de dos columnas.
- Ofrecer scroll horizontal o versión condensada de tablas.
- Colocar filtros avanzados dentro de un sheet.
- Ordenar por prioridad y no por la posición de escritorio.

## Superficies, divs y separadores

Cada `div` debe representar una agrupación real.

Evitar wrappers sin función semántica, visual o estructural.

### Panel base

```css
.panel {
  position: relative;
  min-width: 0;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  overflow: clip;
}
```

### Panel cyberbrutalista

```css
.panel-cyber {
  position: relative;
  background:
    linear-gradient(var(--grid-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid-line) 1px, transparent 1px),
    var(--bg-surface);
  background-size: 32px 32px;
  border: 1px solid var(--border-default);
  border-radius: 0;
}
```

### Esquinas técnicas

Añadir esquinas o retículas con pseudoelementos, no mediante nodos vacíos.

```css
.tech-frame::before,
.tech-frame::after {
  content: "";
  position: absolute;
  width: 14px;
  height: 14px;
  pointer-events: none;
}

.tech-frame::before {
  inset: -1px auto auto -1px;
  border-top: 2px solid var(--accent);
  border-left: 2px solid var(--accent);
}

.tech-frame::after {
  inset: auto -1px -1px auto;
  border-right: 2px solid var(--accent);
  border-bottom: 2px solid var(--accent);
}
```

No aplicar glow a todos los paneles. Reservarlo para selección, foco o datos críticos.

## Cards

Una card debe tener:

- Contexto o etiqueta.
- Contenido principal.
- Acción o estado.
- Espaciado interno consistente.
- Estado hover.
- Estado focus.
- Estado loading.
- Estado vacío.
- Estado error cuando corresponda.

### Card KPI

Características:

- Altura aproximada: 132–176 px.
- Padding: 16–24 px.
- Etiqueta mono de 11–12 px.
- Métrica de 28–44 px.
- Peso de métrica entre 650 y 800.
- Comparación dentro de un badge pequeño.
- Sparkline secundaria.
- Periodo o unidad visibles.
- Máximo de cuatro estilos diferentes de KPI por pantalla.

```css
.metric-card {
  display: grid;
  align-content: space-between;
  min-height: 148px;
  padding: 20px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
}

.metric-card__value {
  font-size: clamp(1.8rem, 3vw, 2.75rem);
  font-weight: 750;
  line-height: 1;
  letter-spacing: -.04em;
  font-variant-numeric: tabular-nums;
}
```

### Card de proyecto

Características:

- Imagen en relación 16:10 o 4:3.
- Número de índice visible.
- Tipo de proyecto en mono.
- Título de 18–24 px.
- Descripción breve.
- Hover mediante desplazamiento de 2–4 px.
- Cambio de borde o revelado de acción.
- No depender exclusivamente del hover.

### Card promocional

Puede utilizar una superficie completa:

- Lima.
- Magenta.
- Cian.
- Blanco cálido.

Mantener el texto en negro y reducir otros efectos.

### Jerarquía de bordes

- `subtle`: divisiones internas.
- `default`: cards y campos.
- `strong`: selección.
- `accent`: foco o llamada principal.
- `danger`: error real.

## Hero section

El hero debe responder inmediatamente:

- Qué es.
- Para quién.
- Qué beneficio ofrece.
- Qué acción debe realizarse.

### Hero split

En desktop:

- Texto: 5–6 columnas.
- Visual: 6–7 columnas.
- Altura mínima: `min(860px, calc(100dvh - var(--nav-height)))`.
- Titular: 2–5 líneas.
- CTA principal.
- CTA secundaria.
- Eyebrow técnica.
- Visual procesado con dithering, escaneo o recorte modular.

```css
.hero {
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
  min-height: min(860px, calc(100dvh - 72px));
  border-bottom: 1px solid var(--border-default);
}

.hero__content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: clamp(32px, 6vw, 88px);
}
```

### Hero editorial

- El titular ocupa entre 60% y 85% del ancho.
- La imagen puede invadir parcialmente el grid.
- Los metadatos se sitúan en los extremos.
- Utilizar gran contraste de escala.
- Evitar centrar todos los elementos.
- Utilizar numeración o coordenadas como detalles secundarios.

### Hero para dashboards

No utilizar un hero publicitario dentro del producto.

Sustituirlo por:

- Título de vista.
- Breadcrumb.
- Rango temporal.
- Acción principal.
- Uno o dos indicadores de contexto.
- Filtros principales.

## Navegación y menú

### Landing page

- Altura: 64–80 px.
- Logo a la izquierda.
- Navegación central o alineada al inicio.
- CTA a la derecha.
- Texto mono de 11–13 px.
- Estado activo con subrayado, bloque de color o marcador `[01]`.
- Navegación sticky únicamente cuando beneficie recorridos largos.

```css
.site-header {
  position: sticky;
  top: 0;
  z-index: 50;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  min-height: 72px;
  padding-inline: clamp(16px, 4vw, 48px);
  background: rgb(8 10 8 / 88%);
  border-bottom: 1px solid var(--border-subtle);
  backdrop-filter: blur(14px);
}
```

### Dashboard sidebar

Estructura:

1. Marca.
2. Workspace o selector contextual.
3. Navegación principal.
4. Grupos secundarios.
5. Perfil.
6. Ayuda.

Reglas:

- Item: 40–48 px de alto.
- Iconos: 16–20 px.
- Área clicable mínima: 44 px.
- Estado activo con fondo suave y línea de señal.
- No depender únicamente del color.
- Mantener visible el label en desktop.
- Añadir tooltips al modo colapsado.
- Permitir navegación completa con teclado.

### Menú móvil

- Utilizar drawer completo o sheet.
- Bloquear el scroll de fondo.
- Mantener el foco dentro del panel.
- Cerrar con Escape.
- Restaurar el foco al disparador.
- Mostrar la acción principal sin obligar a hacer scroll.
- Añadir botón de cierre con nombre accesible.

## Footer

### Footer editorial

- Borde superior fuerte.
- CTA grande de cierre.
- Contacto, navegación y redes en columnas.
- Metadata legal en tipografía mono.
- Repetir el color de acento una última vez.
- Puede utilizar marquee.
- El marquee debe detenerse con `prefers-reduced-motion`.

### Footer dashboard

- Debe ser discreto.
- Mostrar versión, entorno, estado o enlaces de soporte.
- No competir con el contenido operativo.
- Evitar CTA promocionales dentro de herramientas internas.

## Formularios y controles

Alturas recomendadas:

- Compacto: 36 px.
- Normal: 44 px.
- Prominente: 52 px.

Estados obligatorios:

- Default.
- Hover.
- Focus-visible.
- Disabled.
- Loading.
- Error.
- Success cuando sea útil.

```css
.control {
  min-height: 44px;
  padding-inline: 14px;
  color: var(--text-primary);
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xs);
}

.control:hover {
  border-color: var(--border-strong);
}

.control:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 3px;
  border-color: var(--accent);
}

.control:disabled {
  cursor: not-allowed;
  color: var(--text-disabled);
  opacity: .6;
}
```

Utilizar placeholders como ayuda secundaria, nunca como única etiqueta.

Los botones principales pueden ser rectangulares y duros. Mantener iconos y texto alineados. Evitar formas irregulares que reduzcan el área interactiva.

## Botones

### Botón primario

```css
.button-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 44px;
  padding-inline: 18px;
  color: var(--text-inverse);
  font-weight: 700;
  background: var(--accent);
  border: 1px solid var(--accent);
  border-radius: var(--radius-xs);
  transition:
    background var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.button-primary:hover {
  background: var(--accent-hover);
  transform: translateY(-2px);
}

.button-primary:active {
  background: var(--accent-active);
  transform: translateY(0);
}
```

### Botón secundario

- Fondo transparente.
- Borde `border-default`.
- Texto principal.
- Hover mediante fondo elevado o cambio de borde.
- No competir con el CTA principal.

### Botón técnico

- Tipografía mono.
- Texto uppercase.
- Altura compacta.
- Puede incluir índices, flechas o corchetes.
- Utilizarlo para filtros, tabs o acciones secundarias.

## Datos y dashboards

### Prioridad visual

1. Estado crítico.
2. Métrica principal.
3. Tendencia.
4. Comparación.
5. Detalle.
6. Ornamentación.

### Gráficos

- Utilizar el color neón para la serie principal.
- Mostrar series secundarias en blanco, gris o tonos reducidos.
- Reservar el rojo para pérdidas, alertas o errores.
- Cuadrícula con 6–12% de opacidad.
- Etiquetas mono de 10–12 px.
- Tooltips accesibles por teclado.
- Añadir unidad y periodo.
- No utilizar efectos 3D para datos cuantitativos.
- No simular precisión mediante decoraciones HUD.
- No confiar exclusivamente en diferencias de color.

### Tablas

- Header sticky cuando exista scroll largo.
- Números alineados a la derecha.
- Valores tabulares con `font-variant-numeric: tabular-nums`.
- Acciones secundarias al final.
- Densidad conmutable si el volumen lo justifica.
- Estados, filtros y ordenamiento visibles.
- No ocultar datos importantes detrás del hover.
- Añadir caption o nombre accesible.
- Mantener headers correctamente asociados.

### Telemetría estética

Se permiten:

- IDs.
- Coordenadas.
- Barras segmentadas.
- Timestamps.
- Estados del sistema.
- Retículas.
- Crosshairs.
- Scanlines discretas.
- Progreso de procesos.

Los datos ficticios decorativos deben distinguirse claramente de la información real.

## Pixel dithering e imágenes hacking

Priorizar procesamiento real sobre filtros CSS genéricos.

### Proceso recomendado

1. Recortar la imagen con un punto focal claro.
2. Convertirla a escala de grises.
3. Aumentar el contraste.
4. Reducir la resolución.
5. Aplicar Bayer ordered dithering o Floyd–Steinberg.
6. Remapear negro, transparencia y color de señal.
7. Reescalar con `image-rendering: pixelated`.
8. Añadir glitch únicamente si mejora la narrativa.

### Estilos

#### Ordered Bayer

- Técnico.
- Geométrico.
- Estable.
- Adecuado para retratos, objetos y fondos instrumentales.

#### Floyd–Steinberg

- Orgánico.
- Fotográfico.
- Irregular.
- Adecuado para retratos y escenas.

#### Halftone

- Editorial.
- Impreso.
- Adecuado para posters, portadas y cards promocionales.

#### Threshold puro

- Agresivo.
- Minimalista.
- Adecuado para logos, siluetas y overlays.

#### Scanline displacement

- Adecuado para transmisión, hacking y estados de conexión.
- Aplicar por zonas.
- Evitar distorsionar completamente el sujeto.

#### RGB split

- Reservado para interacción, transición o error.
- No mantenerlo activo durante toda la experiencia.

### Reglas de imagen

- Mantener el rostro u objeto reconocible.
- No aplicar dithering al texto.
- Proporcionar una imagen alternativa si el efecto reduce la comprensión.
- Evitar parpadeos.
- Mantener `alt` descriptivo.
- Usar `alt=""` en imágenes puramente ornamentales.
- No sacrificar el contenido por el estilo.

### CSS complementario

```css
.pixel-image {
  image-rendering: pixelated;
  filter: grayscale(1) contrast(1.3);
}

.scanlines {
  position: relative;
}

.scanlines::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0 3px,
    rgb(0 0 0 / 14%) 3px 4px
  );
  mix-blend-mode: multiply;
}
```

No utilizar una overlay de scanlines con opacidad superior al 18% sobre contenido legible.

## Fondos y texturas

Los fondos pueden incluir:

- Retícula fina.
- Ruido monocromático.
- Scanlines.
- Gradiente radial leve.
- Bloom controlado.
- Textura de impresión.
- Marcas de registro.
- Coordenadas.
- Bordes técnicos.

No utilizar simultáneamente todos estos recursos.

```css
.cyber-grid {
  background-color: var(--bg-canvas);
  background-image:
    linear-gradient(var(--grid-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
  background-size: 40px 40px;
}

.cyber-vignette {
  background:
    radial-gradient(
      circle at 70% 20%,
      rgb(183 255 0 / 9%),
      transparent 34%
    ),
    var(--bg-canvas);
}
```

## Iconografía y detalles gráficos

- Preferir iconos outline consistentes.
- Grosor recomendado: 1.5–2 px.
- Añadir símbolos como `+`, `×`, `/`, `//`, `[ ]`, coordenadas o índices con moderación.
- Utilizar flechas diagonales para enlaces externos o proyectos.
- Utilizar códigos de barras y QR únicamente cuando sean funcionales o claramente decorativos.
- Evitar mezclar más de dos librerías de iconos.
- Mantener iconos alineados ópticamente.
- Añadir labels accesibles a iconos interactivos.

## Movimiento

Duraciones:

- Microinteracción: 100–160 ms.
- Panel o drawer: 180–280 ms.
- Transición editorial: 300–500 ms.

Movimientos adecuados:

- Revelado por máscara.
- Líneas que se extienden.
- Cambio breve de threshold.
- Contadores.
- Parallax leve en el hero.
- Scan de un panel seleccionado.
- Aparición escalonada moderada.
- Desplazamiento de 2–4 px en hover.

Evitar:

- Glitch continuo.
- Texto temblando.
- Parallax fuerte.
- Autoplay con sonido.
- Animaciones que impidan leer.
- Flashing.
- Efectos que se reproduzcan sin pausa.

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
  }
}
```

## Responsive

Breakpoints orientativos:

- Móvil: menos de 640 px.
- Tablet: 640–1023 px.
- Desktop: 1024–1439 px.
- Wide: 1440 px o más.

No resolver responsive reduciendo toda la interfaz proporcionalmente.

En móvil:

- Simplificar ornamentos.
- Reducir el tamaño del titular, no su contraste.
- Mantener el CTA visible.
- Convertir grids complejos en secuencias.
- Ocultar telemetría decorativa antes que contenido.
- Permitir que métricas importantes ocupen todo el ancho.
- Preservar targets táctiles de 44 × 44 px.
- Evitar titulares que produzcan overflow.
- Mantener navegación accesible.
- Mostrar primero la información crítica.

```css
@media (max-width: 1023px) {
  .dashboard-shell {
    grid-template-columns: 80px minmax(0, 1fr);
  }

  .dashboard-rail {
    display: none;
  }
}

@media (max-width: 639px) {
  .dashboard-shell,
  .hero {
    grid-template-columns: 1fr;
  }

  .dashboard-sidebar {
    display: none;
  }

  .content-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
```

## Accesibilidad

Objetivos mínimos:

- WCAG AA para texto y controles.
- Contraste 4.5:1 para texto normal.
- Contraste 3:1 para texto grande.
- Contraste 3:1 para elementos gráficos relevantes.
- Foco visible.
- Navegación completa por teclado.
- Orden semántico correcto.
- Landmarks HTML.
- Un único `h1`.
- Jerarquía de títulos sin saltos arbitrarios.
- Estados no comunicados únicamente mediante color.
- Gráficos con resumen textual.
- Respeto por `prefers-reduced-motion`.
- Compatibilidad con zoom al 200%.
- Áreas táctiles de al menos 44 × 44 px.

No colocar:

- Texto pequeño lima sobre blanco.
- Texto cian fino sobre fondos luminosos.
- Texto sobre imágenes sin overlay suficiente.
- Información importante únicamente en tooltips.
- Texto esencial dentro de imágenes.

## Implementación

## Perfil de referencia: Krola Portfolio

Cuando la petición sea continuar, reproducir o derivar el portafolio Krola de diseño web con IA y ciberseguridad, leer [references/krola-portfolio.md](references/krola-portfolio.md) antes de proponer o editar la interfaz.

Este perfil registra la arquitectura, las proporciones, los tokens, los estados y el movimiento que ya forman parte del lenguaje del proyecto. Es un patrón de referencia para ese portafolio y sus derivaciones; no sustituye la elección de dirección visual para productos ajenos.

Para los botones de Home de Krola, aplicar el contrato **Retro Terminal Chassis** del perfil: cara lime, texto negro monospace con `>_`, borde negro grueso y chasis negro desplazado con contorno blanco y corte diagonal superior derecho. Esta regla local reemplaza los CTA antiguos con trama o degradado, sin cambiar los controles del Observatory.

La paleta local Krola usa carbón mate `--color-section-surface: #171717` en Process, Work y The Lab, y azul secundario `--color-signal-blue: #008BFF` para sus índices y los acentos antes celestes de Vulnerability Intelligence. Mantener lime en CTA/selección y conservar los colores semánticos de alerta; consultar el perfil para sus usos concretos.

Preferir HTML semántico:

- `header`.
- `nav`.
- `main`.
- `section`.
- `article`.
- `aside`.
- `footer`.
- `button`.
- `table`.
- `form`.
- `label`.

Evitar convertir elementos interactivos en `div` con listeners.

### React

Si el proyecto utiliza React:

- Separar shell, primitives y componentes de dominio.
- Evitar componentes monolíticos.
- Representar variantes mediante props semánticas.
- Centralizar tokens.
- Mantener datos mock fuera del JSX visual.
- Utilizar SVG o una librería de charts para gráficas reales.
- Mantener efectos decorativos separados del contenido.
- No introducir dependencias si CSS o SVG nativo resuelven el problema.

Estructura sugerida:

```text
src/
  components/
    cyber/
      Button
      Panel
      TechFrame
      StatusBadge
      DitherImage
      MetricCard
      TerminalLabel
    dashboard/
      DashboardShell
      Sidebar
      CommandBar
      MetricGrid
      ChartPanel
      ActivityFeed
  styles/
    tokens.css
    cyber-effects.css
    typography.css
```

## Flujo de trabajo

### 1. Descubrimiento

Determinar:

- Producto.
- Audiencia.
- Acción principal.
- Densidad.
- Contenido disponible.
- Framework.
- Preferencia de tema.
- Preset visual.

Preguntar únicamente cuando una decisión cambie materialmente el resultado.

### 2. Arquitectura

Antes del detalle visual, definir:

- Sitemap o rutas.
- Jerarquía de secciones.
- Layout principal.
- Navegación.
- Estados vacíos.
- Loading.
- Error.
- Prioridad móvil.

### 3. Sistema visual

Definir:

- Un preset.
- Un color neón principal.
- Tipografías.
- Escala.
- Grid.
- Radios.
- Bordes.
- Densidad.
- Presupuesto de efectos.

### 4. Construcción

Orden recomendado:

1. Shell.
2. Navegación.
3. Hero o header de vista.
4. Contenido principal.
5. Cards y gráficos.
6. Formularios.
7. Footer.
8. Estados.
9. Efectos.
10. Responsive.
11. Accesibilidad.

### 5. Validación

Comprobar:

- Jerarquía perceptible en cinco segundos.
- CTA principal inequívoca.
- Texto legible.
- Datos comprensibles sin decoración.
- Ausencia de overflow accidental.
- Menú operable.
- Componentes con focus.
- Mobile usable.
- Reducción de movimiento.
- Consistencia de tokens.
- Estados vacíos, loading y error.
- Contraste adecuado.
- Orden de tabulación correcto.

## Anti-patrones

No entregar:

- Fondos con gradientes púrpura genéricos.
- Todos los bordes brillando.
- Exceso de glassmorphism.
- Texto ilegible por glitch.
- Cinco colores neón compitiendo.
- Cards con radios inconsistentes.
- Headers centrados por defecto.
- Dashboards llenos de datos ficticios sin estructura.
- Terminales falsas para cualquier contenido.
- Métricas sin unidad, período o contexto.
- Decoración HUD que parezca información real.
- Imágenes sin relación con el producto.
- Una simple página oscura presentada como cyberpunk.
- Responsive basado únicamente en `scale()`.
- Texto excesivamente pequeño para parecer técnico.
- Animaciones permanentes.
- Componentes interactivos sin foco visible.
- Tablas convertidas en bloques ilegibles.
- Efectos que impidan identificar las acciones.

## Criterio de finalización

Una entrega está terminada cuando:

- La funcionalidad solicitada existe.
- La dirección visual es reconocible y coherente.
- La paleta utiliza tokens.
- Tipografía, pesos y escalas son consistentes.
- Hero, menú, cards, layout y footer responden al contenido.
- El dashboard establece prioridad visual real.
- Los efectos de dithering y glitch son selectivos.
- Existen estados interactivos.
- La interfaz funciona con teclado.
- El layout funciona en móvil, tablet y desktop.
- No existen errores visibles.
- No hay placeholders rotos.
- No hay contenido desbordado.
- Las gráficas comunican datos correctamente.
- El color de señal se usa de manera controlada.
- La decoración no compite con las tareas principales.

## Formato de respuesta

Al completar una implementación, resumir:

- Dirección visual elegida.
- Componentes construidos.
- Decisiones principales de tipografía.
- Decisiones principales de color.
- Comportamiento responsive.
- Tratamiento de imágenes y dithering.
- Validaciones realizadas.
- Archivos principales modificados.

No describir la interfaz como completada si no fue ejecutada o validada.
