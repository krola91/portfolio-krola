import type { GeoDatePrecision, GeoIncident } from "../../../../types/geopolitical-risk.ts";
import { COUNTRY_ALIASES, NON_COUNTRY_LABELS } from "../country-aliases.ts";
import { attackTypeId } from "../taxonomy.ts";

/** RFC 4180 fields, escaped quotes and embedded CR/LF. Header positions remain intact. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []; let row: string[] = []; let value = ""; let quoted = false;
  const input = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (char === '"') { if (quoted && input[i + 1] === '"') { value += '"'; i++; } else if (quoted || !value) quoted = !quoted; else throw new Error("Unexpected CSV quote"); }
    else if (char === "," && !quoted) { row.push(value); value = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) { if (char === "\r" && input[i + 1] === "\n") i++; row.push(value); if (row.some(Boolean)) rows.push(row); row = []; value = ""; }
    else value += char;
  }
  if (quoted) throw new Error("Unterminated CSV field");
  if (value || row.length) { row.push(value); rows.push(row); }
  return rows;
}
export function parseGeoDate(raw: string): { startedAt: string | null; datePrecision: GeoDatePrecision } {
  const value = raw.trim(); let iso = value; let precision: GeoDatePrecision = "day";
  const european = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value);
  if (european) iso = `${european[3]}-${european[2]}-${european[1]}`;
  else if (/^\d{4}$/.test(value)) { iso = value; precision = "year"; }
  else if (/^\d{4}-\d{2}$/.test(value)) { iso = value; precision = "month"; }
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return { startedAt: null, datePrecision: "unknown" };
  const test = precision === "year" ? `${iso}-01-01` : precision === "month" ? `${iso}-01` : iso;
  const date = new Date(`${test}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === test ? { startedAt: iso, datePrecision: precision } : { startedAt: null, datePrecision: "unknown" };
}
const safeUrls = (value: string) => [...new Set(value.split(";").map((url) => url.trim()).filter((url) => { try { return ["https:", "http:"].includes(new URL(url).protocol); } catch { return false; } }))];
export function adaptEuRepoC(globalCsv: string, receiverCsv: string) {
  const [headers, ...rows] = parseCsv(globalCsv); const [receiverHeaders, ...receivers] = parseCsv(receiverCsv);
  if (!headers || !receiverHeaders) throw new Error("Missing CSV headers");
  for (const field of ["incident_id", "start_date", "incident_type", "source_url", "attribution_source_url"]) if (!headers.includes(field)) throw new Error(`Missing global header: ${field}`);
  for (const field of ["id", "incident_id", "country", "category", "subcategory", "name"]) if (!receiverHeaders.includes(field)) throw new Error(`Missing receiver header: ${field}`);
  if (rows.some((row) => row.length !== headers.length) || receivers.some((row) => row.length !== receiverHeaders.length)) throw new Error("CSV row width mismatch");
  const duplicateHeaders = [...new Set(headers.filter((name, i) => headers.indexOf(name) !== i))];
  const read = (row: string[], field: string) => row[headers.indexOf(field)] ?? "";
  const readReceiver = (row: string[], field: string) => row[receiverHeaders.indexOf(field)] ?? "";
  const incidents = new Map<string, GeoIncident>(); let undatedIncidentCount = 0;
  for (const row of rows) {
    const id = read(row, "incident_id").trim(); if (!/^\d+$/.test(id) || incidents.has(id)) throw new Error(`Invalid/duplicate incident ID: ${id}`);
    const rawDate = read(row, "start_date").trim(); const date = parseGeoDate(rawDate);
    if (!date.startedAt) { if (!["", "Not available", "Unknown"].includes(rawDate)) throw new Error(`Invalid start_date: ${id} / ${rawDate}`); undatedIncidentCount++; }
    const refs = (field: string) => safeUrls(read(row, field)).map((url) => ({ sourceId: "eurepoc-1.3.2", locator: `Incident ${id}`, url }));
    incidents.set(id, { id, datasetId: "eurepoc-1.3.2", ...date, victimCountryCodes: [], unmappedVictimLabels: [], attackTypeIds: read(row, "incident_type").split(";").map(attackTypeId).filter(Boolean), references: [{ sourceId: "eurepoc-1.3.2", locator: `Incident ${id}` }, ...refs("source_url")], attributionReferences: refs("attribution_source_url") });
  }
  let orphanReceiverCount = 0; const unmapped = new Set<string>();
  for (const row of receivers) {
    const incident = incidents.get(readReceiver(row, "incident_id").trim()); if (!incident) { orphanReceiverCount++; continue; }
    const label = readReceiver(row, "country").trim(); const code = COUNTRY_ALIASES[label];
    if (code) { if (!incident.victimCountryCodes.includes(code)) incident.victimCountryCodes.push(code); }
    else { if (!NON_COUNTRY_LABELS.has(label)) throw new Error(`Unreviewed country label: ${label}`); if (!incident.unmappedVictimLabels.includes(label)) incident.unmappedVictimLabels.push(label); unmapped.add(label); }
  }
  if (orphanReceiverCount) throw new Error(`Orphan receivers: ${orphanReceiverCount}`);
  return { incidents: [...incidents.values()].sort((a, b) => Number(a.id) - Number(b.id)), validation: { incidentCount: incidents.size, receiverCount: receivers.length, orphanReceiverCount, duplicateHeaders, unmappedLabels: [...unmapped].sort(), invalidDateCount: 0, undatedIncidentCount } };
}
