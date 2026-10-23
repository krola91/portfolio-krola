import test from "node:test";
import assert from "node:assert/strict";
import { readFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { adaptEuRepoC, parseCsv, parseGeoDate } from "../../src/data/cyber/geopolitical-risk/adapters/eurepoc.ts";
import { aggregateGeopolitics, retainLatestPerCountry } from "../../src/lib/cyber/geopolitical-risk/aggregate-geopolitics.ts";
import { parseGeoRoute, geoHash } from "../../src/lib/cyber/geopolitical-risk/geo-navigation.ts";
import { parseObservatoryRoute } from "../../src/lib/cyber/observatory-navigation.ts";
import { projectGeo, markerHit, DEFAULT_ORIENTATION } from "../../src/lib/cyber/geopolitical-risk/globe-projection.ts";
import { bayerPixel } from "../../src/lib/cyber/geopolitical-risk/dither.ts";
import { validateGeopolitics } from "../../src/lib/cyber/geopolitical-risk/validate-geopolitics.ts";
import { publishGeoEdition } from "../../src/lib/cyber/geopolitical-risk/dataset-storage.ts";
import { GEO_COUNTRY_PROFILES } from "../../src/data/cyber/geopolitical-risk/country-profiles.ts";
import { GEO_SOURCES } from "../../src/data/cyber/geopolitical-risk/sources.ts";
import type { GeoCoverage, GeoIncident, GeoMetadata, GeoSummary } from "../../src/types/geopolitical-risk.ts";
const coverage: GeoCoverage = { year: 2024, start: "2024-01-01", end: "2024-12-31", coveredMonths: Array.from({ length: 12 }, (_, i) => `2024-${String(i + 1).padStart(2, "0")}`) };
const incident = (id: string, codes: string[], date = "2024-02-10"): GeoIncident => ({ id, datasetId: "eurepoc-1.3.2", ...parseGeoDate(date), victimCountryCodes: codes, unmappedVictimLabels: [], attackTypeIds: ["ransomware"], references: [{ sourceId: "eurepoc-1.3.2" }], attributionReferences: [] });
const directory = "src/data/cyber/geopolitical-risk/generated/";
const load = async () => ({ incidents: JSON.parse(await readFile(`${directory}incidents.normalized.json`, "utf8")) as GeoIncident[], summary: JSON.parse(await readFile(`${directory}summary.json`, "utf8")) as GeoSummary, metadata: JSON.parse(await readFile(`${directory}metadata.json`, "utf8")) as GeoMetadata });

test("CSV parsing preserves quoted line breaks, escapes and duplicate header positions", () => {
  assert.deepEqual(parseCsv('id,name,name\r\n1,"two\nlines","say ""yes"""\r\n'), [["id", "name", "name"], ["1", "two\nlines", 'say "yes"']]);
  const global = 'incident_id,start_date,incident_type,source_url,attribution_source_url,initiator_country,initiator_country\n1,10.02.2024,Ransomware,https://example.org/story,,A,B';
  const receivers = 'id,incident_id,name,country,category,subcategory\na,1,x,France,a,b\nb,1,y,France,a,b\nc,1,z,Germany,a,b';
  const result = adaptEuRepoC(global, receivers); assert.deepEqual(result.validation.duplicateHeaders, ["initiator_country"]); assert.deepEqual(result.incidents[0].victimCountryCodes, ["FR", "DE"]);
  assert.throws(() => adaptEuRepoC(global, receivers.replace("France", "Frnce")), /Unreviewed country label/);
  assert.throws(() => adaptEuRepoC(global, receivers.replace(",1,x", ",9,x")), /Orphan receivers/);
  assert.throws(() => adaptEuRepoC(global.replace("10.02.2024", "31.02.2024"), receivers), /Invalid start_date/);
  assert.throws(() => parseCsv('id\n"unfinished'), /Unterminated/);
});
test("European dates, precision, leap years and unknowns cannot fabricate dates", () => {
  assert.deepEqual(parseGeoDate("29.02.2024"), { startedAt: "2024-02-29", datePrecision: "day" });
  assert.equal(parseGeoDate("29.02.2023").startedAt, null); assert.equal(parseGeoDate("31.04.2024").startedAt, null);
  assert.equal(parseGeoDate("2024").datePrecision, "year"); assert.equal(parseGeoDate("2024-02").datePrecision, "month"); assert.equal(parseGeoDate("Not available").datePrecision, "unknown");
});
test("incident-country pairs deduplicate; a multi-country case remains one global incident", () => {
  const rows = [incident("1", ["US", "US", "FR"]), incident("1", ["US"]), incident("2", ["FR"])];
  const summary = aggregateGeopolitics(rows, coverage); assert.equal(summary.globalIncidentCount, 2);
  assert.equal(summary.countries[0].countryCode, "FR"); assert.equal(summary.countries[0].reportedIncidents, 2); assert.equal(summary.countries[1].reportedIncidents, 1);
});
test("ranking uses full population, has stable ISO tie breaking and always caps at eight", () => {
  const codes = ["US", "FR", "DE", "RU", "GB", "ES", "CA", "IT", "AU", "JP"];
  const summary = aggregateGeopolitics(codes.map((code, i) => incident(String(i), [code])), coverage);
  assert.equal(summary.population.length, 10); assert.equal(summary.countries.length, 8); assert.deepEqual(summary.countries.map((row) => row.countryCode), [...codes].sort().slice(0, 8));
  assert.deepEqual(aggregateGeopolitics([], coverage).countries, []);
});
test("only latest fifty pairs survive, including overlapping country incidents and stable ties", () => {
  const rows = Array.from({ length: 80 }, (_, index) => incident(String(index), ["US", ...(index < 60 ? ["FR"] : [])], `2024-${String(Math.floor(index / 8) + 1).padStart(2, "0")}-${String(index % 8 + 1).padStart(2, "0")}`));
  const retained = retainLatestPerCountry(rows);
  for (const code of ["US", "FR"]) { const actual = retained.filter((row) => row.victimCountryCodes.includes(code)); const expected = rows.filter((row) => row.victimCountryCodes.includes(code)).sort((a, b) => b.startedAt!.localeCompare(a.startedAt!)).slice(0, 50); assert.equal(actual.length, 50); assert.deepEqual(actual.map((row) => row.id), expected.map((row) => row.id)); }
  const summary = aggregateGeopolitics(rows, coverage); assert.equal(summary.countries[0].reportedIncidents, 80); assert.equal(summary.countries[0].retainedIncidents, 50);
  assert.deepEqual(retainLatestPerCountry([...rows].reverse()), retained);
});
test("monthly values distinguish annual precision, covered zero months and missing coverage", () => {
  const rows = [incident("1", ["US"], "2024"), incident("2", ["US"], "2024-02"), incident("3", ["US"], "Not available")];
  const result = aggregateGeopolitics(rows, coverage).countries[0]; assert.equal(result.reportedIncidents, 2); assert.equal(result.undatedForMonthlyCount, 1); assert.equal(result.monthly[0].count, 0); assert.equal(result.monthly[1].count, 1); assert.equal(result.monthlyAverage, 1 / 12);
  const partial = aggregateGeopolitics(rows, { ...coverage, coveredMonths: ["2024-02"] }).countries[0]; assert.equal(partial.monthly[0].count, null); assert.equal(partial.monthly[1].count, 1); assert.equal(partial.monthlyAverage, 1);
  const annual = aggregateGeopolitics([incident("1", ["US"], "2024")], coverage).countries[0]; assert.equal(annual.frequencyStatus, "annual-only"); assert.equal(annual.monthlyAverage, null);
  assert.equal(aggregateGeopolitics([incident("1", ["US"], "2024")], { ...coverage, start: "2024-06-01" }).countries.length, 0);
});
test("geo routes allow only published top countries and preserve old actor and vulnerability bookmarks", () => {
  const top = ["US", "FR"]; assert.equal(parseGeoRoute(geoHash("US", "defense"), top).tab, "defense"); assert.equal(parseGeoRoute("#geopolitics/country/us", top).countryCode, "US");
  for (const hash of ["#geopolitics/country/XX", "#geopolitics/country/AU", "#geopolitics/country/US/unknown", "#geopolitics/country/US/defense/extra"]) assert.equal(parseGeoRoute(hash, top).invalidCountry, true);
  assert.equal(parseObservatoryRoute("#geopolitics", ["belan"], top).module, "geopolitics");
  assert.equal(parseObservatoryRoute("#actor/belan/operations", ["belan"], top).module, "actors");
  assert.equal(parseObservatoryRoute("#records", ["belan"], top).module, "vulnerabilities"); assert.equal(parseObservatoryRoute("", ["belan"], top).module, "actors");
});
test("orthographic markers on rear hemisphere are hidden and cannot be hit", () => {
  const front = projectGeo(0, 0, { latitude: 0, longitude: 0 }); const rear = projectGeo(0, 180, { latitude: 0, longitude: 0 });
  assert.equal(front.visible, true); assert.equal(markerHit(front, 0, 0), true); assert.equal(rear.visible, false); assert.equal(markerHit(rear, 0, 0), false);
  assert.equal(projectGeo(22, -24, DEFAULT_ORIENTATION).visible, true);
  assert.equal(Array.from({ length: 16 }, (_, i) => bayerPixel(.5, i % 4, Math.floor(i / 4))).reduce<number>((a, b) => a + b, 0), 8);
});
test("published edition validates, and corrupt retention, geography, profiles or references fail", async () => {
  const data = await load(); assert.doesNotThrow(() => validateGeopolitics(data.incidents, data.summary, GEO_COUNTRY_PROFILES, GEO_SOURCES, data.metadata));
  assert.throws(() => validateGeopolitics(data.incidents, data.summary, GEO_COUNTRY_PROFILES.slice(1), GEO_SOURCES), /Editorial coverage/);
  const profiles = structuredClone(GEO_COUNTRY_PROFILES); profiles[0].defenses[0].references = []; assert.throws(() => validateGeopolitics(data.incidents, data.summary, profiles, GEO_SOURCES), /Missing evidence/);
  const copy = structuredClone(data.incidents); copy[0].victimCountryCodes = ["ZZ"]; assert.throws(() => validateGeopolitics(copy, data.summary, GEO_COUNTRY_PROFILES, GEO_SOURCES), /Unknown country/);
  const overflow = [...data.incidents, incident("extra", ["US"])]; assert.throws(() => validateGeopolitics(overflow, data.summary, GEO_COUNTRY_PROFILES, GEO_SOURCES), /Retention cap exceeded/);
});
test("failed serialization leaves previous three-file edition intact", async () => {
  const temporary = await mkdtemp(join(tmpdir(), "geo-edition-")); const target = join(temporary, "generated");
  try { await publishGeoEdition(target, { "metadata.json": { version: "old" }, "summary.json": { count: 1 }, "incidents.normalized.json": [] }); const circular: Record<string, unknown> = {}; circular.self = circular; await assert.rejects(publishGeoEdition(target, { "metadata.json": circular })); assert.deepEqual(JSON.parse(await readFile(join(target, "metadata.json"), "utf8")), { version: "old" }); assert.deepEqual(JSON.parse(await readFile(join(target, "summary.json"), "utf8")), { count: 1 }); }
  finally { await rm(temporary, { recursive: true, force: true }); }
});
