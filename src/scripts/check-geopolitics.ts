import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { GEO_COUNTRY_PROFILES } from "../data/cyber/geopolitical-risk/country-profiles.ts";
import { GEO_SOURCES } from "../data/cyber/geopolitical-risk/sources.ts";
import { validateGeopolitics } from "../lib/cyber/geopolitical-risk/validate-geopolitics.ts";
import type { GeoIncident, GeoMetadata, GeoSummary } from "../types/geopolitical-risk.ts";
try {
  const directory = "src/data/cyber/geopolitical-risk/generated/";
  const metadata = JSON.parse(await readFile(`${directory}metadata.json`, "utf8")) as GeoMetadata;
  const summary = JSON.parse(await readFile(`${directory}summary.json`, "utf8")) as GeoSummary;
  const incidents = JSON.parse(await readFile(`${directory}incidents.normalized.json`, "utf8")) as GeoIncident[];
  const digest = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
  if (digest(incidents) !== metadata.hash || digest(summary) !== metadata.summaryHash) throw new Error("Snapshot hash mismatch");
  validateGeopolitics(incidents, summary, GEO_COUNTRY_PROFILES, GEO_SOURCES, metadata);
  console.log(`Geopolitics verified offline: ${summary.countries.length} profiles; ${metadata.validation.incidentCount} source records; ${incidents.length} retained records; at most ${metadata.retention.maxPerCountry} per country; ${summary.coverage.year}.`);
} catch (error) { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; }
