# Phase 03 — Threat Actor Tracking

Implementación del módulo **02**, dentro de `/cyber-observatory`. Revisión del
dataset: **2026-09-17 UTC**. No se creó una aplicación ni una ruta independiente.
La implementación inicial no cambió Home; el ajuste del 18 de septiembre
actualiza únicamente el destino de TRY NOW en The Lab.

## Autoridad visual y componentes reutilizados

Se leyeron `AGENTS.md`, `DESIGN.md`, la skill `cyberbrutalist-ui` y su referencia
`references/krola-portfolio.md`. Para Astro se consultaron las guías oficiales de
componentes y estilos.

La navegación anterior contenía botones de módulos que solo emitían avisos.
Ahora alterna dos vistas del mismo shell mediante hash, manteniendo sus estados:

- 01: Vulnerability Intelligence / CISA KEV ONLINE.
- 02: Threat Actor Tracking / ACTOR INDEX ONLINE; vista inicial sin hash.
- 03: Geopolitical Risk / LOCKED.
- 04: Malware Analysis / QUEUED.

Se reutilizan `ObservatoryShell`, `ObservatoryHeader`, `ObservatoryNavigation`,
`CommandPalette`, `ExplainerTrigger`, `ExplainerPopover`, los patrones de
`intel-panel`, `filter-console`, el boot, la textura ambiental y el inspector CVE
existente. Hay una sola paleta de comandos y un solo modal educativo.

Los colores derivan de los tokens existentes `--obs-*`: carbón, lime, blanco
roto, gris frío, ámbar para alegaciones y azul informativo `#008BFF`, a través de
`--obs-cyan` / `--color-signal-blue`. No se introdujo una paleta adicional. Orbitron
define nombres y encabezados, Lexend el contenido y Josefin Sans los registros.
La metadata nueva no baja de 12 px; texto de contenido de 14 px o más.

## Ocho perfiles y evidencia

Todos tienen `lastVerifiedAt: 2026-09-17`. Las etiquetas describen registros
públicos revisados, no una auditoría exhaustiva de expedientes judiciales ni un
estado de custodia en tiempo real. Los cargos y notices no son condenas.

| Registro | Persona | Etiquetas del dataset | Fuentes oficiales |
| --- | --- | --- | --- |
| 01 | Maksim Viktorovich Yakubets | WANTED · CHARGED | [FBI](https://www.fbi.gov/wanted/cyber/maksim-viktorovich-yakubets), [DOJ / Zeus y Bugat](https://www.justice.gov/archives/opa/pr/russian-national-charged-decade-long-series-hacking-and-bank-fraud-offenses-resulting-tens) |
| 02 | Evgeniy Mikhailovich Bogachev | WANTED · CHARGED | [FBI](https://www.fbi.gov/wanted/cyber/evgeniy-mikhailovich-bogachev), [DOJ / GameOver Zeus](https://www.justice.gov/archives/opa/pr/us-leads-multi-national-action-against-gameover-zeus-botnet-and-cryptolocker-ransomware) |
| 03 | Dimitry Yuryevich Khoroshev | WANTED · CHARGED · SANCTIONED | [DOJ / cargos](https://www.justice.gov/archives/opa/pr/us-charges-russian-national-developing-and-operating-lockbit-ransomware), [DOJ / registro LockBit](https://www.justice.gov/usao-nj/lockbit), [Treasury / OFAC](https://home.treasury.gov/news/press-releases/jy2326) |
| 04 | Mikhail Pavlovich Matveev | WANTED · CHARGED | [FBI](https://www.fbi.gov/wanted/cyber/mikhail-pavlovich-matveev), [DOJ / infraestructura crítica](https://www.justice.gov/archives/opa/pr/russian-national-charged-ransomware-attacks-against-critical-infrastructure) |
| 05 | Park Jin Hyok | WANTED · CHARGED | [FBI](https://www.fbi.gov/wanted/cyber/park-jin-hyok), [DOJ / caso de tres programadores](https://www.justice.gov/archives/opa/pr/three-north-korean-military-hackers-indicted-wide-ranging-scheme-commit-cyberattacks-and) |
| 06 | Alexsey Belan | WANTED · CHARGED | [FBI](https://www.fbi.gov/wanted/cyber/alexsey-belan), [DOJ / Yahoo](https://www.justice.gov/archives/opa/pr/us-charges-russian-fsb-officers-and-their-criminal-conspirators-hacking-yahoo-and-millions) |
| 07 | Yevgeniy Igorevich Polyanin | WANTED · CHARGED | [FBI](https://www.fbi.gov/wanted/cyber/yevgeniy-igorevich-polyanin), [DOJ / acusación separada de REvil](https://www.justice.gov/usao-ndtx/pr/ukrainian-arrested-and-charged-ransomware-attack-kaseya) |
| 08 | Vladimir Dunaev | PLEADED GUILTY · CONVICTED · SENTENCED | [DOJ / resultado judicial de TrickBot](https://www.justice.gov/archives/opa/pr/russian-national-sentenced-involvement-development-and-deployment-trickbot-malware) |

Las 16 fuentes tienen organización, título, URL HTTPS, fecha de publicación
cuando consta y fecha de consulta. Cada afirmación material enlaza su evidencia
en el dossier; el Source Log lista las afirmaciones cubiertas por cada registro.

Decisiones de calificación:

- Khoroshev: Wanted se sustenta en el registro DOJ que lo enumera como
  `Fugitive`. Esa página puede rezagarse; no se presenta como localizador o feed
  actual de custodia. Sanctioned registra la designación anunciada en 2024, no
  una consulta actual de cumplimiento contra una lista de sanciones.
- Polyanin: la ficha FBI revisada todavía lo describe expresamente como wanted.
  No se verificó un resultado judicial posterior para él en las fuentes
  revisadas. No se le atribuye el ataque Kaseya acusado a otro defendant.
- Dunaev: se distingue la declaración de culpabilidad del 30 de noviembre de
  2023 y la sentencia del 24 de enero de 2024: cinco años y cuatro meses. La
  etiqueta Convicted deriva del plea seguido de sentencia, no de un veredicto
  de juicio. No se afirma que continúe encarcelado.
- Park: Lazarus Group / APT38 aparece como terminología utilizada por
  investigadores privados, tal como lo califica el FBI. Las actuaciones de la
  conspiración no se convierten automáticamente en actos individuales.
- Belan: la asociación con funcionarios FSB acusados no lo presenta a él como
  funcionario ni convierte su nacionalidad en prueba de patrocinio estatal.
- Las recompensas de Yakubets, Bogachev y Belan se muestran únicamente porque
  aparecen en notices FBI revisados, con sus condiciones sujetas a la
  autoridad. Un comunicado archivado no se usa como prueba de oferta actual.

Los conceptos legales utilizan también [el glosario de U.S. Courts](https://www.uscourts.gov/glossary)
y [las preguntas frecuentes de OFAC](https://ofac.treasury.gov/faqs/1).

## Retratos, atribución y derechos

Los ocho perfiles muestran assets entregados por la propietaria del proyecto y
registrados como `USER_PROVIDED`. Se procesaron localmente a un recorte común
3:2 de 720 × 480 px, blanco y negro de tres tonos, tramado Bayer y escalado por
vecino más cercano. No se generaron rostros con IA ni se enlazan imágenes
externas en tiempo de ejecución.

La atribución `User-provided project asset` describe su procedencia dentro del
proyecto; las fichas oficiales respaldan la identidad y los hechos, pero no se
presentan como licencia de las fotografías. Si un retrato deja de estar
disponible o no pasa la validación, el componente conserva su marcador SVG
abstracto como fallback seguro.

El renderer y la validación solo permiten rutas bajo
`/images/cyber/threat-actors/`. Los assets externos con derechos verificados
siguen requiriendo `VERIFIED`, fuente, atribución y URL original HTTPS.

## Experiencia e interacciones

- ActorDex con ocho cards numeradas, nombre, alias, estado legal, clasificación,
  asociación, caso principal, impacto, fuentes y enlace `OPEN DOSSIER`.
- Cuatro columnas en escritorio amplio; dos en tablet y escritorio estrecho
  donde la barra lateral limita el espacio; una en móvil. Las filas desktop y
  tablet mantienen dimensiones uniformes.
- Barrido breve del retrato, contraste y metadata adicional al hover o focus.
  La información principal y el CTA no dependen del hover; en móvil las
  etiquetas adicionales permanecen visibles.
- Nombre y aliases normalizados para búsqueda; filtros combinables de estado,
  especialización, grupo/malware y actividad. Los facets muestran conteos y
  deshabilitan combinaciones sin registros, con estado vacío y reset.
- Enlaces semánticos, `Enter` / `Space`, focus visible, retorno al control de
  origen y enlace de salto al módulo activo sin alterar el hash del dossier.
- Dossier con navegación Overview, Story, Legal Record y Source Log. El
  registro lateral de identidad fluye con el documento, sin sticky, altura
  máxima ni scroll interno; en móvil se apila. Fechas y controles info pueden
  ajustarse al ancho disponible sin desbordar.
- Una sola sección narrativa sustituye Operations Timeline y Association
  Graph. Cada perfil cuenta la persona/caso, los métodos documentados y la
  respuesta judicial en tres párrafos con referencias y calificadores.
  Contenido Lexend de 16 px, ancho del panel y sin animaciones
  adicionales ni datos biográficos inventados.
- Las operaciones y asociaciones estructuradas siguen respaldando las cards,
  filtros y Source Log; ya no se representan como timeline o grafo en el dossier.
- Operational Footprint describe víctimas y sectores, no ubicación del actor.
  La ilustración orbital es esquemática y se rotula como tal, sin coordenadas.
- Source Log expandible, fechas, cobertura y links externos con
  `noopener noreferrer`. No ejecuta consultas automáticas a las autoridades.
- Paleta existente ampliada con módulos, índice, búsqueda, ocho perfiles por
  nombre o alias, metodología y Source Log; teclado de flechas y Enter.
- Doce explainers añadidos al registro compartido: Wanted, Charged, Convicted,
  Sanctioned, RaaS, Botnet, State-sponsored activity alleged, Operational
  footprint, Official source, Private attribution, Association graph y Last
  verified. La definición de Association graph permanece en el registro pero
  su antiguo panel/disparador fue retirado. Los explainers visibles se abren
  con click/tap y **solo se cierran con la X**, manteniendo
  el diseño previo. El hint se elimina al abrir/cerrar.

La adaptación de Human Ledger conserva retrato/marker lateral, nombre
dominante, navegación por vistas y composición modular. Biometría, pasaporte y
localización se sustituyen por capacidades documentadas, evidencia legal y
alcance de víctimas. Los diagramas no simulan observación en vivo.

## Navegación compartible

### Actor Index — dashboard tabulado (18 septiembre)

La antigua cuadrícula se reemplaza por un solo marco FUI basado en Human Ledger:
ocho pestañas angulares, rail de acciones, archivo lateral, identidad dominante,
dos columnas de información de caso y un registro de evidencia a la derecha.
Cada ficha conserva nombre, alias, estado, clasificación, asociación principal,
caso, impacto y fuentes; incorpora las capacidades, nacionalidad y alcance que
ya existían en el dataset. No se agregan hechos personales ni fuentes nuevas.

`ActorLedgerPanel.astro` y `actor-ledger.css` implementan la composición. Orbitron
define los nombres; Lexend y Josefin Sans organizan datos compactos de 12–13 px.
Lime señala selección/acción, Signal Blue los marcos y referencias, gris el texto.
El marcador abstracto sustituye fotografías sin derechos verificados. El campo
de curvas se identifica como esquema, no ubicación ni seguimiento en vivo.

Las pestañas usan `tablist` / `tab` / `tabpanel`, un único tab stop y selección
con flechas, Home, End, Enter o Space. `#actors/{id}` comparte la ficha; `#actor/{id}`
mantiene el dossier completo. Búsqueda y filtros se abren desde el pie del marco;
los ocho tabs permanecen visibles, con los no coincidentes deshabilitados.
Un estado vacío permite resetear sin modificar el dataset. Metodología y Source
Log general reemplazan la vista al abrirse y ofrecen regreso al dashboard;
ya no alargan el índice por debajo. Los dossiers no cambian su contenido.

La ficha completa se valida sin scroll ni solapamientos en desktop 1024×768,
1366×768 y 1440×900. El rail global se compacta solo en el índice a 901–1200 px.
En móvil y con ventanas muy bajas, el contenido se apila con scroll de página,
preservando el tamaño de lectura y sin introducir scroll dentro de las fichas.

Ejemplos:

```text
/cyber-observatory                 → ActorDex
/cyber-observatory#actors          → ActorDex
/cyber-observatory#actor/polyanin  → dossier
/cyber-observatory#actor/polyanin/story → historia documentada
/cyber-observatory#actor/dunaev/legal → legal record
/cyber-observatory#actors-sources  → Source Log general
/cyber-observatory#vulnerabilities → módulo 01
```

Recargar y usar atrás/adelante conserva el expediente. Los anchors previos
`#overview`, `#records` y `#methodology` siguen abriendo el módulo CISA. Un ID de
actor desconocido muestra el índice y un aviso accesible; no fabrica un perfil.
Los bookmarks antiguos `/operations` y `/associations` llevan a Story. El CTA
TRY NOW de Home enlaza `/cyber-observatory#vulnerabilities`, por lo que abre
Vulnerability Intelligence, sin alterar el módulo por defecto de la URL sin hash.

## Datos, validación y límites

El dataset está en TypeScript local, separado del registro de fuentes y la UI.
Se valida al importar en dev/build. La validación rechaza:

- Cantidad diferente de ocho, IDs/índices duplicados e identidad incompleta.
- Fuentes desconocidas, URLs no canónicas o sin HTTPS y fechas inválidas.
- Afirmaciones sin fuente, estados sin acción sustentada y alias duplicados.
- Historias incompletas, párrafos sin fuentes o con calificaciones judiciales
  no respaldadas; sus afirmaciones también forman parte del Source Log.
- Wanted sin notice revisado; resultados judiciales sin evidencia judicial.
- Relaciones sin calificación coherente y fotografías sin permisos.

La validación comprueba estructura y trazabilidad, **no verifica automáticamente
la veracidad de una página externa**. Las revisiones futuras son editoriales:
revisar fuentes, actualizar calificadores y fechas, ejecutar checks y rebuild.
No existe crawler, base de datos, endpoint externo de actores, agente de IA ni
sincronización automática.

Se excluyen scores subjetivos, ranking universal, detalles familiares,
biometría, domicilio, IP, ubicación actual, custodia no confirmada y datos
inventados para rellenar paneles. Nacionalidad se muestra solo donde se utilizó
una afirmación oficial explícita; no se infiere de alias o asociaciones.

## Archivos

Creación:

```text
src/types/threat-actors.ts
src/data/cyber/threat-actors/{actors,sources,stories,explainers}.ts
src/data/cyber/observatory-explainers.ts
src/lib/cyber/threat-actors/{actor-navigation,actor-statistics,filter-actors,validate-actor-data}.ts
src/components/cyber/threat-actors/
  ThreatActorDashboard.astro
  ActorLedgerPanel.astro
  ActorPortrait.astro
  ActorFilters.astro
  ActorDossier.astro
  ActorStory.astro
  ActorLegalRecord.astro
  ActorSourceLog.astro
  SourceRefs.astro
src/scripts/threat-actor-tracking.ts
src/styles/threat-actors.css
tests/cyber/threat-actors.test.ts
docs/phase-03-threat-actor-tracking.md
```

Modificación:

```text
src/types/cyber.ts
src/data/cyber/observatory-modules.ts
src/components/cyber/{ObservatoryShell,ObservatoryHeader,ObservatoryNavigation,CommandPalette}.astro
src/components/cyber/vulnerability/VulnerabilityDashboard.astro
src/pages/cyber-observatory.astro
src/layouts/BaseLayout.astro
src/scripts/cyber-observatory.ts
src/styles/cyber-observatory.css
src/components/home/the-lab.astro (destino del CTA, ajuste 2026-09-18)
tests/cyber/{domain,explainers}.test.ts
package.json
package-lock.json
tsconfig.json
```

Se añadió `npm run check`, con `@astrojs/check`, TypeScript y tipos de Node como
dependencias de desarrollo. Dos ajustes de tipado en tests previos eliminan un
import sin uso y amplían correctamente un Set de IDs. No se editó `dist/` ni
`node_modules/` manualmente; `dist/` solo se generó con Astro.

El wrapper de BaseLayout permanece `main` en Home; en el observatorio es `div`
porque ObservatoryShell ya define su único landmark `main`, evitando anidarlos.

## Verificación

Comandos reproducibles:

```text
npm test
npm run check
npm run data:check:cisa
npm run build
```

Resultados de la implementación inicial (2026-09-17):

- Tests: **26/26**, incluidos ocho registros, aliases, filtros combinados/reset,
  deep links, procedencia, calificación legal, fechas, derechos y explainers.
- Astro / TypeScript: **0 errores, 0 warnings, 0 hints**.
- Build: correcto; siguen existiendo solo dos páginas, index y cyber-observatory.
- CISA: snapshot validado de 250 registros; no se ejecutó una sincronización.
- Lint: el repositorio no tiene un comando o configuración de lint; no se
  reporta como ejecutado ni se introduce una herramienta de lint ajena al scope.

QA de navegador realizada en preview temporal **127.0.0.1:4323**, separado de
los puertos de trabajo 4321/4322:

| Prueba | Resultado |
| --- | --- |
| Desktop 1440 × 1000 | Cuatro columnas; ocho cards; dimensiones uniformes; sin overflow horizontal |
| Tablet 768 × 1024 | Dos columnas y filtros reordenados, sin overflow |
| Móvil 390 × 844 | Una columna, dossier apilado, grafo/source log legibles, controles info de 44 px |
| Nombre / alias y facets | LockBitSupp encuentra Khoroshev; Convicted encuentra Dunaev; alternativas con cero registros deshabilitadas |
| Vacío y reset | Mensaje visible; reset restituye los ocho perfiles |
| URL y navegación | Apertura/retorno, sección legal, reload y atrás/adelante restauran el dossier |
| Teclado | Enter y Space abren; retorno restaura focus; skip link conserva expediente |
| Comandos | Alias adicional lucky12345, flechas y Enter abren Bogachev |
| Educación | Click/tap abre; Escape no cierra; X cierra y el hint no persiste |
| Source Log | Expandible, muestra cobertura, fecha y URL canónica; links seguros |
| Movimiento | Toggle ambient motion produce animation none; guards prefers-reduced-motion verificados en código/tests |
| Regresión CISA | 250 registros, vendor Microsoft → 39, reset → 250, inspector CVE operativo |
| Consola | Sin errores ni warnings de la aplicación en la revisión |

No había infraestructura E2E; se usaron tests de dominio/contrato y QA manual de
navegador. No se cambió la preferencia de movimiento del sistema operativo:
la cobertura de `prefers-reduced-motion` es por reglas/contrato y la comprobación
de modo sin animación en la interfaz. El dato `lastVerifiedAt` requiere revisión
humana y no debe actualizarse automáticamente en cada build.

## Ajuste de dossiers — 2026-09-18

- Retirados los componentes `ActorTimeline.astro`, `ActorAssociationGraph.astro`
  y sus estilos/animación de aristas; sustituidos por `ActorStory.astro`.
- Ocho historias originales en `stories.ts`, redactadas a partir de los ocho
  comunicados DOJ enlazados arriba, consultados de nuevo para esta edición.
  Se distingue la actuación conjunta de las acciones individuales y se
  mantienen los calificadores de acusación, plea y sentencia. El lugar de
  nacimiento de Belan solo se incluye porque DOJ lo documenta expresamente.
  No se inventan edades, infancia, motivaciones, cifras ni hechos policiales.
- La revisión de los estados Wanted y de las demás fuentes sigue fechada
  2026-09-17; esta edición narrativa no simula una nueva revisión de custodia.
- `npm test`: **28/28**; `npm run check`: **0 errores, 0 warnings, 0 hints**;
  `npm run build`: correcto, dos páginas; `npm run data:check:cisa`: **250**.
- QA en preview temporal `127.0.0.1:4323`: los ocho dossiers muestran tres
  párrafos y ningún panel de timeline/grafo. OFFICIAL IDENTITY tiene
  `overflow: visible`, altura automática y todos sus datos accesibles mediante
  el scroll normal de la página. Sin overflow horizontal en 1440 × 1000,
  1024 × 768 y 390 × 844; texto narrativo de 16 px y navegación Story operativa.
- Click real en TRY NOW desde Home: hash `#vulnerabilities`, módulo 01 activo,
  Vulnerability Observatory visible y **250 de 250 registros**.
