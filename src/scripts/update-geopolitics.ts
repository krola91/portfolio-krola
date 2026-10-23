import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { adaptEuRepoC } from "../data/cyber/geopolitical-risk/adapters/eurepoc.ts";
import { GEO_COUNTRY_PROFILES } from "../data/cyber/geopolitical-risk/country-profiles.ts";
import { GEO_SOURCES, GEO_REVIEWED_AT } from "../data/cyber/geopolitical-risk/sources.ts";
import { aggregateGeopolitics, retainLatestPerCountry, MAX_INCIDENTS_PER_COUNTRY } from "../lib/cyber/geopolitical-risk/aggregate-geopolitics.ts";
import { validateGeopolitics } from "../lib/cyber/geopolitical-risk/validate-geopolitics.ts";
import { publishGeoEdition } from "../lib/cyber/geopolitical-risk/dataset-storage.ts";
import type { GeoCoverage, GeoMetadata } from "../types/geopolitical-risk.ts";

const cache = resolve(".cache/geopolitics");
const transport = [
  { local: "global.csv", name: "eurepoc_global_dataset_1_3.csv", md5: "46d5006f6211d15c87fccb5a38b66626" },
  { local: "receivers.csv", name: "eurepoc_receiver_dataset_1.3.csv", md5: "9368db87b618c3b70a245302b3c66d97" },
];
const digest = (value: string | Buffer, algorithm = "sha256") => createHash(algorithm).update(value).digest("hex");
try {
  const downloaded: Buffer[] = [];
  if (process.argv.includes("--download")) {
    const latest = await fetch("https://zenodo.org/api/records/14965395/versions/latest");
    if (!latest.ok) throw new Error(`Zenodo metadata HTTP ${latest.status}`);
    const record = await latest.json() as { id: number; metadata: { version: string; license: { id: string } } };
    if (record.id !== 14965395 || record.metadata.version !== "1.3.2" || record.metadata.license.id !== "cc-by-nc-4.0") throw new Error("Source edition/license changed. Review schema, permission and country profiles before changing the pin.");
    for (const file of transport) {
      const response = await fetch(`https://zenodo.org/api/records/14965395/files/${file.name}/content`);
      if (!response.ok) throw new Error(`EuRepoC download HTTP ${response.status}`);
      const bytes = Buffer.from(await response.arrayBuffer()); if (digest(bytes, "md5") !== file.md5) throw new Error(`Transport checksum mismatch: ${file.name}`);
      downloaded.push(bytes);
    }
  }
  const option = (flag: string, fallback: string) => { const index = process.argv.indexOf(flag); return index >= 0 ? process.argv[index + 1] : fallback; };
  const global = downloaded[0] ?? await readFile(option("--global", resolve(cache, "global.csv")));
  const receivers = downloaded[1] ?? await readFile(option("--receivers", resolve(cache, "receivers.csv")));
  const buffers = [global, receivers];
  const sourceFiles = transport.map((file, index) => { const md5 = digest(buffers[index], "md5"); if (md5 !== file.md5) throw new Error(`Pinned CSV checksum mismatch: ${file.name}`); return { name: file.name, md5, sha256: digest(buffers[index]) }; });
  const adapted = adaptEuRepoC(global.toString("utf8"), receivers.toString("utf8"));
  const coverage: GeoCoverage = { start: "2024-01-01", end: "2024-12-31", year: 2024, coveredMonths: Array.from({ length: 12 }, (_, i) => `2024-${String(i + 1).padStart(2, "0")}`) };
  const summary = aggregateGeopolitics(adapted.incidents, coverage);
  const retained = retainLatestPerCountry(adapted.incidents);
  const metadata: GeoMetadata = {
    datasetId: "eurepoc-1.3.2", sourceKind: "RESEARCH_DATASET", version: "1.3.2", sourceUrl: "https://zenodo.org/records/14965395",
    licenseId: "CC-BY-NC-4.0", attribution: "Zettl-Schabath, K. et al. (2025). Global Dataset of Cyber Incidents (1.3.2). EuRepoC. https://doi.org/10.5281/zenodo.14965395. Local normalized and capped derivative.",
    generatedAt: new Date().toISOString(), sourceCheckedAt: GEO_REVIEWED_AT, coverage, corpusStart: "2000-01-01", corpusEnd: "2024-12-31",
    hash: digest(JSON.stringify(retained)), summaryHash: digest(JSON.stringify(summary)), sourceFiles, validation: adapted.validation,
    retention: { maxPerCountry: MAX_INCIDENTS_PER_COUNTRY, retainedIncidents: retained.length, retainedCountryPairs: retained.reduce((sum, item) => sum + item.victimCountryCodes.length, 0) },
  };
  validateGeopolitics(retained, summary, GEO_COUNTRY_PROFILES, GEO_SOURCES, metadata);
  await publishGeoEdition(resolve("src/data/cyber/geopolitical-risk/generated"), { "metadata.json": metadata, "summary.json": summary, "incidents.normalized.json": retained });
  console.log(JSON.stringify({ status: "published", sourceIncidents: adapted.incidents.length, retainedIncidents: retained.length, maxPerCountry: MAX_INCIDENTS_PER_COUNTRY, year: coverage.year, top: summary.countries.map((country) => `${country.countryCode}: ${country.reportedIncidents} (${country.retainedIncidents} retained)`) }, null, 2));
} catch (error) { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; }
