import { createHash } from "node:crypto";
import { calculateBaseMetrics } from "../../../lib/cyber/aggregate-vulnerabilities.ts";
import type { KevDataset, KevDatasetMetadata, ObservatoryVulnerability } from "../../../types/cyber.ts";

export const CISA_KEV_URL = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json";
export const CISA_KEV_RETENTION_LIMIT = 250;

type CisaKevEntry = {
	cveID: string;
	vendorProject: string;
	product: string;
	vulnerabilityName: string;
	dateAdded: string;
	shortDescription: string;
	requiredAction: string;
	dueDate: string;
	knownRansomwareCampaignUse: string;
	notes?: string;
	cwes?: string[];
};

type CisaKevFeed = {
	title: string;
	catalogVersion: string;
	dateReleased: string;
	count: number;
	vulnerabilities: unknown[];
};

const CVE_PATTERN = /^CVE-\d{4}-\d{4,}$/i;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isIsoDate(value: string): boolean {
	if (!DATE_PATTERN.test(value)) return false;
	const parsed = new Date(`${value}T00:00:00Z`);
	return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(record: Record<string, unknown>, key: string): string | null {
	const value = record[key];
	return typeof value === "string" && value.trim() ? value.trim() : null;
}

function parseFeed(payload: unknown): CisaKevFeed {
	if (!isRecord(payload)) throw new Error("CISA KEV: top-level payload is not an object.");
	const title = requiredString(payload, "title");
	const catalogVersion = requiredString(payload, "catalogVersion");
	const dateReleased = requiredString(payload, "dateReleased");
	const count = payload.count;
	const vulnerabilities = payload.vulnerabilities;
	if (!title || !catalogVersion || !dateReleased || !Number.isInteger(count) || !Array.isArray(vulnerabilities)) {
		throw new Error("CISA KEV: incompatible top-level schema.");
	}
	if (!Number.isFinite(Date.parse(dateReleased))) throw new Error("CISA KEV: invalid dateReleased.");
	return { title, catalogVersion, dateReleased, count: count as number, vulnerabilities };
}

function parseEntry(value: unknown): CisaKevEntry | null {
	if (!isRecord(value)) return null;
	const cveID = requiredString(value, "cveID");
	const vendorProject = requiredString(value, "vendorProject");
	const product = requiredString(value, "product");
	const vulnerabilityName = requiredString(value, "vulnerabilityName");
	const dateAdded = requiredString(value, "dateAdded");
	const shortDescription = requiredString(value, "shortDescription");
	const requiredAction = requiredString(value, "requiredAction");
	const dueDate = requiredString(value, "dueDate");
	const knownRansomwareCampaignUse = requiredString(value, "knownRansomwareCampaignUse");
	if (
		!cveID || !CVE_PATTERN.test(cveID) || !vendorProject || !product || !vulnerabilityName ||
		!dateAdded || !isIsoDate(dateAdded) || !shortDescription || !requiredAction ||
		!dueDate || !isIsoDate(dueDate) || !knownRansomwareCampaignUse
	) return null;
	const notes = typeof value.notes === "string" && value.notes.trim() ? value.notes.trim() : undefined;
	const cwes = Array.isArray(value.cwes)
		? value.cwes.filter((item): item is string => typeof item === "string" && item.trim().length > 0).map((item) => item.trim())
		: undefined;
	return {
		cveID: cveID.toUpperCase(), vendorProject, product, vulnerabilityName, dateAdded,
		shortDescription, requiredAction, dueDate, knownRansomwareCampaignUse, notes, cwes,
	};
}

function toDomain(entry: CisaKevEntry): ObservatoryVulnerability {
	return {
		id: entry.cveID,
		cveId: entry.cveID,
		vendor: entry.vendorProject,
		product: entry.product,
		name: entry.vulnerabilityName,
		description: entry.shortDescription,
		dateAdded: entry.dateAdded,
		remediationDueDate: entry.dueDate || null,
		requiredAction: entry.requiredAction,
		knownRansomwareUse: entry.knownRansomwareCampaignUse.toLocaleLowerCase("en-US") === "known" ? "known" : "unknown",
		cwes: [...new Set(entry.cwes ?? [])].sort(),
		notes: entry.notes ?? null,
	};
}

export function parseCisaKevJson(body: string): unknown {
	try { return JSON.parse(body) as unknown; }
	catch { throw new Error("CISA KEV returned invalid JSON."); }
}

export function computeNormalizedHash(vulnerabilities: readonly ObservatoryVulnerability[]): string {
	return createHash("sha256").update(JSON.stringify(vulnerabilities)).digest("hex");
}

function retainLatestRecords(
	vulnerabilities: Iterable<ObservatoryVulnerability>,
): ObservatoryVulnerability[] {
	const byCve = new Map<string, ObservatoryVulnerability>();
	for (const vulnerability of vulnerabilities) byCve.set(vulnerability.cveId, vulnerability);
	return [...byCve.values()]
		.sort((a, b) => b.dateAdded.localeCompare(a.dateAdded) || a.cveId.localeCompare(b.cveId))
		.slice(0, CISA_KEV_RETENTION_LIMIT);
}

function compareDatasets(
	current: readonly ObservatoryVulnerability[],
	previous?: KevDataset | null,
): Pick<KevDatasetMetadata, "newCount" | "removedCount" | "modifiedCount" | "ransomwareStatusChanges" | "dueDateChanges" | "notesChanges" | "requiredActionChanges"> {
	if (!previous) {
		return { newCount: current.length, removedCount: 0, modifiedCount: 0, ransomwareStatusChanges: 0, dueDateChanges: 0, notesChanges: 0, requiredActionChanges: 0 };
	}
	const before = new Map(previous.vulnerabilities.map((item) => [item.cveId, item]));
	const after = new Map(current.map((item) => [item.cveId, item]));
	let newCount = 0;
	let modifiedCount = 0;
	let ransomwareStatusChanges = 0;
	let dueDateChanges = 0;
	let notesChanges = 0;
	let requiredActionChanges = 0;
	for (const [cve, item] of after) {
		const old = before.get(cve);
		if (!old) { newCount += 1; continue; }
		if (JSON.stringify(old) !== JSON.stringify(item)) modifiedCount += 1;
		if (old.knownRansomwareUse !== item.knownRansomwareUse) ransomwareStatusChanges += 1;
		if (old.remediationDueDate !== item.remediationDueDate) dueDateChanges += 1;
		if (old.notes !== item.notes) notesChanges += 1;
		if (old.requiredAction !== item.requiredAction) requiredActionChanges += 1;
	}
	let removedCount = 0;
	for (const cve of before.keys()) if (!after.has(cve)) removedCount += 1;
	return { newCount, removedCount, modifiedCount, ransomwareStatusChanges, dueDateChanges, notesChanges, requiredActionChanges };
}

export function normalizeCisaKevPayload(
	payload: unknown,
	syncedAt: string,
	previous?: KevDataset | null,
): KevDataset {
	if (!Number.isFinite(Date.parse(syncedAt))) throw new Error("CISA KEV: syncedAt must be an ISO date.");
	const feed = parseFeed(payload);
	const unique = new Map<string, ObservatoryVulnerability>();
	let rejectedCount = 0;
	let duplicateCount = 0;
	let unknownEnumCount = 0;
	for (const raw of feed.vulnerabilities) {
		const parsed = parseEntry(raw);
		if (!parsed) { rejectedCount += 1; continue; }
		if (unique.has(parsed.cveID)) { duplicateCount += 1; continue; }
		if (!["known", "unknown"].includes(parsed.knownRansomwareCampaignUse.toLocaleLowerCase("en-US"))) unknownEnumCount += 1;
		unique.set(parsed.cveID, toDomain(parsed));
	}
	const sourceValidCount = unique.size;
	// Every sync rebuilds one rolling snapshot from the official feed. Existing CVEs are
	// replaced by their current CISA representation, new CVEs enter by date, and records
	// outside the newest 250 are discarded instead of accumulating locally.
	const vulnerabilities = retainLatestRecords(unique.values());
	const validCount = vulnerabilities.length;
	const receivedCount = feed.vulnerabilities.length;
	const integrity = rejectedCount > 0 || unknownEnumCount > 0 || feed.count !== receivedCount || sourceValidCount + rejectedCount + duplicateCount !== receivedCount
		? "partial" as const : "verified" as const;
	const changes = compareDatasets(vulnerabilities, previous);
	return {
		metadata: {
			sourceName: feed.title,
			sourceUrl: CISA_KEV_URL,
			catalogVersion: feed.catalogVersion,
			dateReleased: feed.dateReleased,
			syncedAt,
			declaredCount: feed.count,
			receivedCount,
			sourceValidCount,
			retentionLimit: CISA_KEV_RETENTION_LIMIT,
			validCount,
			rejectedCount,
			duplicateCount,
			unknownEnumCount,
			hash: computeNormalizedHash(vulnerabilities),
			integrity,
			...changes,
		},
		baseMetrics: calculateBaseMetrics(vulnerabilities, new Date(feed.dateReleased)),
		vulnerabilities,
	};
}

export function validateNormalizedDataset(value: unknown): asserts value is KevDataset {
	if (!isRecord(value) || !isRecord(value.metadata) || !isRecord(value.baseMetrics) || !Array.isArray(value.vulnerabilities)) {
		throw new Error("Snapshot: incompatible structure.");
	}
	const metadata = value.metadata;
	if (
		typeof metadata.validCount !== "number" || metadata.validCount !== value.vulnerabilities.length ||
		typeof metadata.sourceValidCount !== "number" || metadata.sourceValidCount < metadata.validCount ||
		metadata.retentionLimit !== CISA_KEV_RETENTION_LIMIT || metadata.validCount > CISA_KEV_RETENTION_LIMIT ||
		typeof metadata.hash !== "string" || typeof metadata.sourceUrl !== "string" ||
		metadata.sourceUrl !== CISA_KEV_URL
	) throw new Error("Snapshot: metadata validation failed.");
	const records: ObservatoryVulnerability[] = [];
	const seenCves = new Set<string>();
	for (const record of value.vulnerabilities) {
		if (
			!isRecord(record) || typeof record.cveId !== "string" || !CVE_PATTERN.test(record.cveId) ||
			typeof record.dateAdded !== "string" || !isIsoDate(record.dateAdded) ||
			!Array.isArray(record.cwes) || seenCves.has(record.cveId)
		) {
			throw new Error("Snapshot: invalid normalized record.");
		}
		seenCves.add(record.cveId);
		records.push(record as ObservatoryVulnerability);
	}
	for (let index = 1; index < records.length; index += 1) {
		const previous = records[index - 1];
		const current = records[index];
		if (previous.dateAdded < current.dateAdded || (previous.dateAdded === current.dateAdded && previous.cveId > current.cveId)) {
			throw new Error("Snapshot: records are not ordered by most recent date.");
		}
	}
	if (computeNormalizedHash(records) !== metadata.hash) throw new Error("Snapshot: content hash mismatch.");
}
