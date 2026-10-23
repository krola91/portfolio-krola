import type { GeoClaim, GeoCountryProfile, GeoIncident, GeoMetadata, GeoSource, GeoSummary } from "../../../types/geopolitical-risk.ts";
import { VALID_COUNTRY_CODES } from "../../../data/cyber/geopolitical-risk/country-aliases.ts";
import { parseGeoDate } from "../../../data/cyber/geopolitical-risk/adapters/eurepoc.ts";
import { MAX_INCIDENTS_PER_COUNTRY } from "./aggregate-geopolitics.ts";
import { GEO_POSITIONS } from "../../../data/cyber/geopolitical-risk/country-profiles.ts";

export function validateGeopolitics(incidents: readonly GeoIncident[], summary: GeoSummary, profiles: readonly GeoCountryProfile[], sources: readonly GeoSource[], metadata?: GeoMetadata): void {
  const errors: string[] = []; const sourceIds = new Set(sources.map((item) => item.id));
  const urlValid = (value: string, httpsOnly = false) => { try { return (httpsOnly ? ["https:"] : ["http:", "https:"]).includes(new URL(value).protocol); } catch { return false; } };
  if (sourceIds.size !== sources.length) errors.push("Duplicate source IDs");
  for (const source of sources) if (!urlValid(source.url, true) || !source.publisher || !source.title || parseGeoDate(source.accessedAt).datePrecision !== "day") errors.push(`Invalid source: ${source.id}`);
  const referencesValid = (claim: GeoClaim, label: string) => {
    if (!claim.text.trim() || !claim.references.length) errors.push(`Missing evidence: ${label}`);
    for (const ref of claim.references) if (!sourceIds.has(ref.sourceId) || (ref.url && !urlValid(ref.url))) errors.push(`Orphan/unsafe reference: ${label}`);
  };
  const counts = new Map<string, number>(); const incidentIds = new Set<string>();
  for (const incident of incidents) {
    if (!incident.id || incidentIds.has(incident.id)) errors.push(`Duplicate/missing incident ID: ${incident.id}`); incidentIds.add(incident.id);
    if (!incident.victimCountryCodes.length || new Set(incident.victimCountryCodes).size !== incident.victimCountryCodes.length) errors.push(`Invalid country pairs: ${incident.id}`);
    if (incident.startedAt && parseGeoDate(incident.startedAt).datePrecision !== incident.datePrecision) errors.push(`Invalid incident date: ${incident.id}`);
    if (!incident.startedAt && incident.datePrecision !== "unknown") errors.push(`Unknown date precision: ${incident.id}`);
    for (const code of incident.victimCountryCodes) { if (!VALID_COUNTRY_CODES.has(code)) errors.push(`Unknown country: ${code}`); counts.set(code, (counts.get(code) ?? 0) + 1); }
    referencesValid({ text: incident.id, references: [...incident.references, ...incident.attributionReferences] }, incident.id);
  }
  for (const [code, count] of counts) if (count > MAX_INCIDENTS_PER_COUNTRY) errors.push(`Retention cap exceeded: ${code} / ${count}`);
  const { coverage } = summary;
  if (parseGeoDate(coverage.start).datePrecision !== "day" || parseGeoDate(coverage.end).datePrecision !== "day" || coverage.start > coverage.end || !coverage.start.startsWith(String(coverage.year)) || !coverage.end.startsWith(String(coverage.year))) errors.push("Invalid coverage");
  if (new Set(coverage.coveredMonths).size !== coverage.coveredMonths.length || coverage.coveredMonths.some((month) => parseGeoDate(month).datePrecision !== "month" || `${month}-01` < coverage.start || `${month}-01` > coverage.end)) errors.push("Invalid covered months");
  const ordered = [...summary.population].sort((a, b) => b.reportedIncidents - a.reportedIncidents || a.countryCode.localeCompare(b.countryCode, "en"));
  if (new Set(ordered.map((item) => item.countryCode)).size !== ordered.length) errors.push("Duplicate population country");
  if (JSON.stringify(summary.countries) !== JSON.stringify(ordered.slice(0, 8))) errors.push("Top eight differs from full-population ranking");
  for (let index = 0; index < ordered.length; index++) {
    const country = ordered[index];
    if (!VALID_COUNTRY_CODES.has(country.countryCode) || country.rank !== index + 1 || !Number.isInteger(country.reportedIncidents) || country.reportedIncidents < 1 || country.reportedIncidents > summary.globalIncidentCount) errors.push(`Invalid country total/rank: ${country.countryCode}`);
    if (country.monthly.length !== 12 || new Set(country.monthly.map((item) => item.month)).size !== 12) errors.push(`Invalid monthly series: ${country.countryCode}`);
    for (const [monthIndex, month] of country.monthly.entries()) {
      if (month.month !== `${coverage.year}-${String(monthIndex + 1).padStart(2, "0")}` || (coverage.coveredMonths.includes(month.month) ? month.count === null || !Number.isInteger(month.count) || month.count < 0 : month.count !== null)) errors.push(`Invalid monthly coverage/value: ${country.countryCode}`);
    }
    const numerator = country.monthly.reduce((sum, item) => sum + (item.count ?? 0), 0);
    if (country.monthlyNumerator !== numerator || country.coveredMonthCount !== coverage.coveredMonths.length || numerator + country.undatedForMonthlyCount > country.reportedIncidents || (country.monthlyAverage !== null && country.monthlyAverage !== numerator / country.coveredMonthCount)) errors.push(`Incoherent frequency: ${country.countryCode}`);
    const retained = incidents.filter((incident) => incident.victimCountryCodes.includes(country.countryCode) && incident.startedAt?.startsWith(String(coverage.year))).length;
    if (country.retainedIncidents !== retained || country.retainedIncidents > MAX_INCIDENTS_PER_COUNTRY) errors.push(`Incoherent retained sample: ${country.countryCode}`);
  }
  const top = new Set(summary.countries.map((item) => item.countryCode)); const profileIds = new Set(profiles.map((item) => item.countryCode));
  if (profileIds.size !== profiles.length || top.size !== profileIds.size || [...top].some((code) => !profileIds.has(code))) errors.push(`Editorial coverage does not match top eight. Required: ${[...top].join(", ")}`);
  for (const profile of profiles) {
    const position = GEO_POSITIONS.find((item) => item.code === profile.countryCode);
    if (!position || !Number.isFinite(position.latitude) || !Number.isFinite(position.longitude) || Math.abs(position.latitude) > 90 || Math.abs(position.longitude) > 180) errors.push(`Missing/invalid representative position: ${profile.countryCode}`);
    if (parseGeoDate(profile.reviewedAt).datePrecision !== "day") errors.push(`Invalid review date: ${profile.countryCode}`);
    if (profile.leadAgency) { referencesValid(profile.leadAgency, `${profile.countryCode} agency`); if (!urlValid(profile.leadAgency.officialUrl, true)) errors.push(`Invalid agency link: ${profile.countryCode}`); }
    const observedTypes = summary.countries.find((country) => country.countryCode === profile.countryCode)?.attackTypeIds ?? [];
    profile.attackTypes.forEach((item) => { referencesValid(item.explanation, `${profile.countryCode} attack ${item.id}`); if (!observedTypes.includes(item.id)) errors.push(`Attack category unsupported by edition: ${profile.countryCode} / ${item.id}`); });
    for (const measure of [...profile.defenses, ...profile.response]) { referencesValid(measure, `${profile.countryCode} defense`); if (!measure.scope.trim() || !["documented-program", "official-guidance", "documented-response"].includes(measure.kind)) errors.push(`Missing scope/kind: ${profile.countryCode}`); }
    if (profile.frequencyContext) referencesValid(profile.frequencyContext, profile.countryCode);
    if (profile.featuredCase) referencesValid(profile.featuredCase, profile.countryCode);
  }
  if (metadata && (metadata.licenseId !== "CC-BY-NC-4.0" || metadata.sourceKind !== "RESEARCH_DATASET" || metadata.retention.maxPerCountry !== MAX_INCIDENTS_PER_COUNTRY || metadata.retention.retainedIncidents !== incidents.length || metadata.retention.retainedCountryPairs !== [...counts.values()].reduce((a, b) => a + b, 0))) errors.push("Invalid license/source/retention metadata");
  if (errors.length) throw new Error(`Geopolitics validation failed:\n${errors.join("\n")}`);
}
