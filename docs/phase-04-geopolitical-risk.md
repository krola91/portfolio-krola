# Fase 04 — Geopolitical Risk

## Alcance implementado

Módulo 03 integrado en `/cyber-observatory`. Dirección Acid Terminal: superficie
casi negra, globo monocromo, selección lima y Signal Blue técnico del sistema.
Orbitron, Lexend y los roles técnicos existentes; sin nuevas dependencias UI.

La pantalla inicial tiene ranking y globo. Un país abre un único drawer modal
con `ATTACKS & FREQUENCY` / `CYBER DEFENSE`, cierre, Escape, tabs con flechas y
retorno de foco. Las fuentes quedan en un desplegable. `ABOUT THE DATA` agrupa
método, licencia y tres conceptos del sistema compartido de explicadores.

No se agregan filtros avanzados, timeline global, tira de métricas ni registro de
incidentes. Los máximos 50 registros recientes por país se aplican a la retención
local; el top y frecuencia anual se calculan antes del recorte y están rotulados.

## Datos

EuRepoC 1.3.2; año 2024; incidentes reportados distintos por país víctima.
Fecha de consulta: 2026-10-23. Top: Estados Unidos, Francia, Alemania, Rusia,
Reino Unido, España, Canadá e Italia. Fuente de investigación con sesgos de
publicación y selección, sin equivalencia a telemetría global o riesgo futuro.

El CSV contiene 3.414 incidentes; su página anuncia 3.416. Los MD5 coinciden con
la metadata oficial. Se preserva esa diferencia. Se retienen 1.767 incidentes
únicos con un máximo de 50 pares por país. La UI no descarga ese corpus.

La licencia de la fuente es CC BY-NC 4.0. Esta entrega es local y no presupone
autorización para una publicación comercial del derivado. Procedencia, atribución
y procedimiento: `src/data/cyber/geopolitical-risk/README.md`.

Las fichas citan CISA, CERT-FR/ANSSI, BSI/CERT-Bund, NKTsKI, NCSC, INCIBE-CERT,
el Canadian Centre for Cyber Security y documentación parlamentaria italiana
para las funciones de ACN/CSIRT Italia. Alcances y guías se distinguen de
implantación universal. Algunas páginas primarias bloquean la lectura directa;
se consultaron también sus textos indexados y PDFs oficiales. No se afirma haber
comprobado la efectividad real de servicios o la adopción en toda una nación.

## Navegación y arquitectura

El coordinador `src/lib/cyber/observatory-navigation.ts` es el único responsable
de vistas, hashchange, cabecera, fuente, navegación activa y skip link. Actores
conserva su controlador de dominio. Vulnerabilidades conserva sus filtros y datos.

- `#geopolitics`: ranking y globo, ficha cerrada.
- `#geopolitics/country/US`: ataques y frecuencia.
- `#geopolitics/country/US/defense`: defensa.

Un país fuera del top muestra aviso y mantiene la vista global. Se conservan los
bookmarks de actores y vulnerabilidades. La paleta abre el módulo o un país; `/`
abre la paleta dentro de Geopolitical Risk. Actores sigue siendo el estado inicial
sin fragmento. Malware Analysis permanece fuera del alcance.

Se respetan los seis componentes y capas solicitadas. El globo usa Canvas 2D,
cartografía Natural Earth, buffer de luminancia, Bayer 4×4 y nearest-neighbour.
Controles DOM y listado equivalentes; fallback SVG y perfiles progresivos con
`details`. El renderer se carga bajo demanda y carece de loop ambiental.

La referencia compositiva está en
`docs/references/geopolitical-risk/command-reference.jpg`.

## Verificación

Baseline: Astro Check sin diagnósticos; 27 de 28 pruebas pasaron en el sandbox.
La prueba de renombrado atómico falló por permisos temporales. Ejecutada fuera
del sandbox, junto con las nuevas pruebas, pasó.

Comandos de verificación:

```sh
npm run check
npm test
npm run data:check:geopolitics
npm run build
```

Las pruebas de dominio cubren CSV, cabeceras duplicadas, fechas europeas,
precisión, deduplicación, top máximo, retención por pares, frecuencia, rutas,
hemisferio oculto, referencias, perfiles y preservación de la edición anterior.

`tests/cyber/geopolitical-risk.browser.mjs` verifica la interfaz con Playwright
y un navegador Chromium instalado. Acepta `KROLA_QA_PLAYWRIGHT`,
`KROLA_QA_BROWSER_EXE` y `KROLA_QA_URL` para rutas locales. Capturas y resultados
temporales se guardan en `.cache/geopolitics/qa/`. La revisión se sirve en 4323,
sin usar el servidor del usuario en 4321.

Resultado final, 23 de octubre de 2026:

- `npm run check`: 81 archivos, cero errores, advertencias o hints.
- `npm test`: 38 pruebas aprobadas.
- `npm run data:check:geopolitics`: ocho perfiles, hashes y límite de 50 por país
  verificados offline.
- `npm run build`: dos páginas estáticas, build correcto y sin consultas externas.
- Chrome aislado en localhost:4323: ocho fichas, pestañas, foco, Escape,
  marcadores, arrastre, botones de giro/reset, historial, recarga y paleta.
- Layouts 360, 768, 1280 y 1440 px, sin desbordamiento horizontal ni ranking
  fuera de su marco. Título y pestaña activa visibles después del cambio de tamaño.
- Viewport CSS equivalente a zoom 200% y preferencia de movimiento reducido.
- Fallback sin JavaScript con perfiles `details` operables por teclado; fallback
  estático con canvas deshabilitado y fichas funcionales.
- Regresiones: selección/dossier de Belan, búsqueda Cisco (17/250) y paginación
  de vulnerabilidades. Ningún error de runtime del navegador.

El renderer diferido pesa 5,8 KB sin comprimir; la máscara, unos 43 KB. El corpus
normalizado, de aproximadamente 3,1 MB, no se importa en ningún script del navegador.
Los CSV temporales usados para preparar esta edición se descartan; pueden
recuperarse con el actualizador y los hashes fijados.
