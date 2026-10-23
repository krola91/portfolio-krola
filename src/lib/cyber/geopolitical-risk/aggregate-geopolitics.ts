import type { GeoCoverage, GeoCountrySummary, GeoIncident, GeoSummary } from "../../../types/geopolitical-risk.ts";
export function aggregateGeopolitics(incidents: readonly GeoIncident[], coverage: GeoCoverage): GeoSummary {
  const byCountry = new Map<string, Map<string, GeoIncident>>(); const global = new Set<string>();
  for (const incident of incidents) {
    if (!incident.startedAt || incident.startedAt.slice(0, 4) !== String(coverage.year)) continue;
    const start = incident.datePrecision === "year" ? `${incident.startedAt}-01-01` : incident.datePrecision === "month" ? `${incident.startedAt}-01` : incident.startedAt;
    const end = incident.datePrecision === "year" ? `${incident.startedAt}-12-31` : incident.datePrecision === "month" ? new Date(Date.UTC(Number(incident.startedAt.slice(0, 4)), Number(incident.startedAt.slice(5, 7)), 0)).toISOString().slice(0, 10) : incident.startedAt;
    if (start < coverage.start || end > coverage.end) continue;
    global.add(incident.id);
    for (const code of new Set(incident.victimCountryCodes)) { const pool = byCountry.get(code) ?? new Map<string, GeoIncident>(); pool.set(incident.id, incident); byCountry.set(code, pool); }
  }
  const countries = [...byCountry].map(([countryCode, pool]): GeoCountrySummary => {
    const values = [...pool.values()]; const known = values.filter((item) => ["day", "month"].includes(item.datePrecision));
    const monthly = Array.from({ length: 12 }, (_, index) => { const month = `${coverage.year}-${String(index + 1).padStart(2, "0")}`; return { month, count: coverage.coveredMonths.includes(month) ? known.filter((item) => item.startedAt?.startsWith(month)).length : null }; });
    const numerator = monthly.reduce((sum, entry) => sum + (entry.count ?? 0), 0); const months = monthly.filter((entry) => entry.count !== null).length;
    return { countryCode, rank: 0, reportedIncidents: pool.size, retainedIncidents: 0, attackTypeIds: [...new Set(values.flatMap((item) => item.attackTypeIds))].sort(), monthly, frequencyStatus: known.length && months ? "monthly" : "annual-only", undatedForMonthlyCount: values.length - known.length, monthlyNumerator: numerator, coveredMonthCount: months, monthlyAverage: known.length && months ? numerator / months : null };
  }).sort((a, b) => b.reportedIncidents - a.reportedIncidents || a.countryCode.localeCompare(b.countryCode, "en")).map((item, i) => ({ ...item, rank: i + 1 }));
  const retained = retainLatestPerCountry(incidents);
  for (const country of countries) country.retainedIncidents = retained.filter((incident) => incident.victimCountryCodes.includes(country.countryCode) && incident.startedAt?.startsWith(String(coverage.year))).length;
  return { coverage, globalIncidentCount: global.size, population: countries, countries: countries.slice(0, 8) };
}

export const MAX_INCIDENTS_PER_COUNTRY = 50;
/** Retain pairs, not whole multi-victim rows: an incident kept for A must not bypass B's cap. */
export function retainLatestPerCountry(incidents: readonly GeoIncident[], limit = MAX_INCIDENTS_PER_COUNTRY): GeoIncident[] {
  const sorted = [...incidents].sort((a, b) => (b.startedAt ?? "").localeCompare(a.startedAt ?? "") || a.id.localeCompare(b.id, "en", { numeric: true }));
  const counts = new Map<string, number>(); const kept: GeoIncident[] = []; const seen = new Set<string>();
  for (const incident of sorted) {
    if (seen.has(incident.id)) continue; seen.add(incident.id);
    const victimCountryCodes = [...new Set(incident.victimCountryCodes)].filter((code) => (counts.get(code) ?? 0) < limit);
    victimCountryCodes.forEach((code) => counts.set(code, (counts.get(code) ?? 0) + 1));
    if (victimCountryCodes.length) kept.push({ ...incident, victimCountryCodes });
  }
  return kept;
}
