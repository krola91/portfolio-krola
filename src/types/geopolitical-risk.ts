export type GeoDatePrecision = "day" | "month" | "year" | "unknown";
export type GeoSource = { id: string; publisher: string; title: string; url: string; publishedAt: string | null; accessedAt: string; version: string | null; licenseId: string | null; };
export type GeoReference = { sourceId: string; locator?: string; url?: string; };
export type GeoClaim = { text: string; references: GeoReference[]; };
export type GeoIncident = {
  id: string; datasetId: string; startedAt: string | null; datePrecision: GeoDatePrecision;
  victimCountryCodes: string[]; unmappedVictimLabels: string[]; attackTypeIds: string[];
  references: GeoReference[]; attributionReferences: GeoReference[];
};
export type GeoCoverage = { start: string; end: string; year: number; coveredMonths: string[]; };
export type GeoCountrySummary = {
  countryCode: string; rank: number; reportedIncidents: number;
  retainedIncidents: number;
  attackTypeIds: string[];
  monthly: { month: string; count: number | null }[];
  frequencyStatus: "monthly" | "annual-only" | "unavailable";
  undatedForMonthlyCount: number; monthlyNumerator: number; coveredMonthCount: number; monthlyAverage: number | null;
};
export type GeoDefenseMeasure = GeoClaim & { kind: "documented-program" | "official-guidance" | "documented-response"; scope: string; };
export type GeoCountryProfile = {
  countryCode: string; reviewedAt: string;
  attackTypes: { id: string; label: string; explanation: GeoClaim }[];
  frequencyContext?: GeoClaim;
  leadAgency: (GeoClaim & { name: string; officialUrl: string }) | null;
  defenses: GeoDefenseMeasure[]; response: GeoDefenseMeasure[];
  featuredCase?: GeoClaim & { occurredAt: string; datePrecision: GeoDatePrecision };
};
export type GeoMetadata = {
  datasetId: string; sourceKind: "RESEARCH_DATASET"; version: string; sourceUrl: string;
  licenseId: string; attribution: string; generatedAt: string; sourceCheckedAt: string;
  coverage: GeoCoverage; corpusStart: string; corpusEnd: string; hash: string; summaryHash: string;
  sourceFiles: { name: string; sha256: string; md5: string }[];
  retention: { maxPerCountry: number; retainedIncidents: number; retainedCountryPairs: number; };
  validation: { incidentCount: number; receiverCount: number; orphanReceiverCount: number; duplicateHeaders: string[]; unmappedLabels: string[]; invalidDateCount: number; undatedIncidentCount: number; };
};
export type GeoSummary = { coverage: GeoCoverage; globalIncidentCount: number; population: GeoCountrySummary[]; countries: GeoCountrySummary[]; };
export type GeoRoute = { countryCode: string | null; tab: "attacks" | "defense"; invalidCountry: boolean; };
export type GeoPosition = { code: string; name: string; latitude: number; longitude: number; };
