# Geopolitical Risk — edición local

Módulo 03 del Cyber Intelligence Observatory. Interfaz en inglés: ranking de ocho
países, globo geográfico con dither y una ficha con ataques/frecuencia y defensa.

## Fuente, cobertura y licencia

- EuRepoC, **Global Dataset of Cyber Incidents 1.3.2**, publicado el 4 de marzo de
  2025: <https://zenodo.org/records/14965395>.
- La página oficial y su endpoint de última versión se comprobaron el
  **23 de octubre de 2026**. La versión estable seguía siendo 1.3.2.
- Corpus de la fuente: 2000–2024. Comparación fija: 1 enero–31 diciembre de 2024.
- Clase: `RESEARCH_DATASET`. Unidad: incidente distinto por país víctima.
- Licencia: **CC BY-NC 4.0**. Atribución: Zettl-Schabath, K. et al. (2025),
  EuRepoC, DOI `10.5281/zenodo.14965395`. La normalización y el recorte son
  modificaciones locales identificadas en metadata. La licencia no concede
  reutilización comercial sin restricciones; antes de desplegar en un contexto
  comercial se deben resolver los permisos aplicables con el titular.
- El CSV verificado tiene **3.414 filas**, frente a las 3.416 anunciadas en la
  página de la publicación. Los hashes MD5 coinciden con Zenodo. No se inventan
  las dos filas ausentes. Hay 92 filas sin fecha de inicio disponible; no se
  asignan arbitrariamente al período. En 2024 se cuentan 700 incidentes distintos
  globales fechados, algunos con varias víctimas nacionales.

## Retención solicitada: máximo 50 incidentes por país

La clasificación y los agregados mensuales se calculan sobre **todo el CSV**
durante la importación. Después se conserva solo el par incidente/país entre los
50 más recientes de ese país, en todo el corpus. Fechas desconocidas quedan al
final; empates de fecha se resuelven por ID numérico ascendente.

Un incidente conservado para A no conserva automáticamente su asociación con B:
esa asociación debe pasar también el límite de B. El corpus local es una muestra
recortada y no debe usarse para reconstruir totales originales. Las fichas indican
el tamaño conservado y diferencian ese tamaño del total estadístico anual.

`summary.json` guarda los agregados calculados antes del recorte, incluida la
población nacional necesaria para comprobar el orden. Ninguna posición o cifra se
mantiene manualmente. Hay 1.767 incidentes únicos en la muestra inicial; ningún
país tiene más de 50 asociaciones. Los transportes descargados por el actualizador
se procesan en memoria y no se publican ni se conservan como CSV completos.

## Normalización y frecuencia

- Parser RFC 4180 con comillas escapadas y saltos dentro de campos.
- Cabeceras repetidas permanecen en sus posiciones: `initiator_country` e
  `initiator_category`. No se convierten silenciosamente en claves duplicadas.
- Fechas europeas `DD.MM.YYYY` e ISO se validan contra el calendario real.
  Precisión anual y mensual explícitas; `Not available` conserva ausencia.
- Las víctimas proceden del receiver CSV unido por `incident_id`, no de listas
  paralelas de iniciadores o nacionalidades de actores.
- `country-aliases.ts` contiene equivalencias exactas versionadas. `XK` es la
  excepción documentada para Kosovo. Territorios con código propio no se
  fusionan con su metrópoli. Regiones, organizaciones y etiquetas desconocidas
  permanecen sin asignar. Una etiqueta nueva no revisada bloquea la actualización.
- Fuentes del incidente y fuentes de atribución quedan separadas. Solo se
  admiten enlaces HTTP(S), sin ejecutar ni inyectar HTML de la fuente.
- Un incidente cuenta una vez para un país, aunque tenga varias entidades
  receptoras. Un caso multinacional cuenta una vez en cada país afectado.
- Descendente por total; empates por ISO ascendente; máximo ocho, incluso en el
  corte. La selección no filtra ni reordena la clasificación.
- Los doce meses de 2024 tienen cobertura declarada. Cero significa ningún
  registro de la fuente en ese mes; sin cobertura es `null`/N/A. La precisión
  anual se excluye del numerador mensual. El promedio es numerador fechado /
  meses cubiertos; no se convierte en «un ataque cada X segundos».

Top inicial calculado: US 177, FR 52, DE 51, RU 27, GB 26, ES 23, CA 20, IT 17.
Estas cifras son agregados; US, FR y DE conservan solo 50 registros locales cada
uno. Los demás conservan como máximo 50 considerando también años anteriores.

## Archivos y actualización

- `sources.ts`: procedencia estadística y fuentes primarias de cada defensa.
- `country-profiles.ts`: texto editorial, alcance, tipo de evidencia y fecha de
  revisión. Los cuatro patrones de ataque están documentados en los países del
  top de esta edición y no representan categorías mutuamente excluyentes.
- `generated/metadata.json`: cobertura, licencia, hashes y validación.
- `generated/summary.json`: población agregada, top ocho y frecuencia mensual.
- `generated/incidents.normalized.json`: muestra limitada, solo para Node/build.

```sh
npm run data:update:geopolitics -- --download
npm run data:check:geopolitics
```

Importación de transportes locales con los hashes de la versión fijada:

```sh
npm run data:update:geopolitics -- --global /ruta/global.csv --receivers /ruta/receivers.csv
```

El actualizador comprueba versión/licencia y hashes, adapta, agrega y valida
perfiles antes de publicar. Una nueva versión exige revisión explícita del pin,
esquema, cobertura, condiciones y contenido editorial. Si cambia el top, la
validación indica los países que necesitan ficha y conserva la edición anterior.

La publicación prepara tres archivos en un directorio temporal y cambia la
edición completa, con restauración de la anterior si falla el cambio. No ejecutar
una publicación de datos simultáneamente con un build. La comprobación offline
verifica hashes del derivado, límite, coherencia temporal, top, referencias y
perfiles. Los totales de registros descartados solo se pueden volver a calcular
descargando o importando de nuevo los CSV con los hashes registrados.

## Cartografía y navegador

Natural Earth Admin 0 a 1:110m, tag del repositorio `v5.1.2`, dominio público.
El preprocesado une 177 geometrías de tierra, respeta huecos y produce una máscara
de 720×360 con bits compactados. No dibuja fronteras políticas. El README de la
publicación web del shapefile indica 5.1.1; aquí se fija y registra expresamente
el tag 5.1.2 del repositorio GeoJSON.

```sh
# Guardar el GeoJSON de la URL registrada en provenance.json en:
# .cache/geopolitics/natural-earth.geojson
npm run data:prepare:geopolitics
```

Canvas 2D proyecta puntos de la esfera con orientación ortográfica. Muestrea la
cartografía, calcula iluminación en un buffer de baja resolución, aplica Bayer
4×4 y reescala sin suavizado. El fallback SVG usa el mismo procesamiento. La
máscara pesa aproximadamente 43 KB; la geometría completa no llega al navegador.
Los marcadores DOM son posiciones representativas, no coordenadas de ataques.

El renderizador se importa al abrir el módulo. Dibuja bajo demanda, sin giro
ambiental, con orientación de selección breve. Detiene frames, observers y
listeners activos al ocultarse. Respeta `motion-off`, movimiento reducido y
pestañas ocultas. La lista y los perfiles HTML siguen disponibles si fallan
canvas o JavaScript. El browser recibe solo el resumen pequeño y los ocho
perfiles, nunca el corpus normalizado.
