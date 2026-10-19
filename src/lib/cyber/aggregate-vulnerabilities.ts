import type {
	KevBaseMetrics,
	LandscapeSignal,
	ObservatoryVulnerability,
} from "../../types/cyber.ts";

const DAY_MS = 86_400_000;

function parseDate(value: string | null): number | null {
	if (!value) return null;
	const timestamp = Date.parse(`${value}T00:00:00Z`);
	return Number.isFinite(timestamp) ? timestamp : null;
}

function isWithinDays(value: string, now: Date, days: number): boolean {
	const timestamp = parseDate(value);
	if (timestamp === null) return false;
	const age = now.getTime() - timestamp;
	return age >= 0 && age <= days * DAY_MS;
}

export function rankByLabel(
	records: readonly ObservatoryVulnerability[],
	field: "vendor" | "product",
	limit = 8,
): Array<{ label: string; count: number }> {
	const groups = new Map<string, { label: string; count: number }>();
	for (const record of records) {
		const label = record[field].trim() || "Unknown";
		const key = label.toLocaleLowerCase("en-US");
		const current = groups.get(key);
		if (current) current.count += 1;
		else groups.set(key, { label, count: 1 });
	}
	return [...groups.values()]
		.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
		.slice(0, limit);
}

export function rankCwes(
	records: readonly ObservatoryVulnerability[],
	limit = 8,
): Array<{ label: string; count: number }> {
	const groups = new Map<string, number>();
	for (const record of records) {
		for (const cwe of new Set(record.cwes)) groups.set(cwe, (groups.get(cwe) ?? 0) + 1);
	}
	return [...groups.entries()]
		.map(([label, count]) => ({ label, count }))
		.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
		.slice(0, limit);
}

export function groupByMonth(
	records: readonly ObservatoryVulnerability[],
): Array<{ period: string; count: number }> {
	const groups = new Map<string, number>();
	for (const record of records) {
		const period = record.dateAdded.slice(0, 7);
		groups.set(period, (groups.get(period) ?? 0) + 1);
	}
	return [...groups.entries()]
		.map(([period, count]) => ({ period, count }))
		.sort((a, b) => a.period.localeCompare(b.period));
}

export function groupByYear(
	records: readonly ObservatoryVulnerability[],
): Array<{ period: string; count: number }> {
	const groups = new Map<string, number>();
	for (const record of records) {
		const period = record.dateAdded.slice(0, 4);
		groups.set(period, (groups.get(period) ?? 0) + 1);
	}
	return [...groups.entries()]
		.map(([period, count]) => ({ period, count }))
		.sort((a, b) => a.period.localeCompare(b.period));
}

export function calculateBaseMetrics(
	records: readonly ObservatoryVulnerability[],
	now = new Date(),
): KevBaseMetrics {
	const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
	let dueSoon30d = 0;
	let overdue = 0;
	for (const record of records) {
		const due = parseDate(record.remediationDueDate);
		if (due === null) continue;
		if (due < today) overdue += 1;
		else if (due <= today + 30 * DAY_MS) dueSoon30d += 1;
	}
	return {
		total: records.length,
		ransomwareKnown: records.filter((item) => item.knownRansomwareUse === "known").length,
		ransomwareUnknown: records.filter((item) => item.knownRansomwareUse === "unknown").length,
		added7d: records.filter((item) => isWithinDays(item.dateAdded, now, 7)).length,
		added30d: records.filter((item) => isWithinDays(item.dateAdded, now, 30)).length,
		added90d: records.filter((item) => isWithinDays(item.dateAdded, now, 90)).length,
		added365d: records.filter((item) => isWithinDays(item.dateAdded, now, 365)).length,
		dueSoon30d,
		overdue,
	};
}

export function buildLandscapeSignals(
	records: readonly ObservatoryVulnerability[],
	limit = 18,
): LandscapeSignal[] {
	const periods = new Map<string, ObservatoryVulnerability[]>();
	for (const record of records) {
		const period = record.dateAdded.slice(0, 7);
		const group = periods.get(period) ?? [];
		group.push(record);
		periods.set(period, group);
	}
	return [...periods.entries()]
		.sort(([a], [b]) => a.localeCompare(b))
		.slice(-limit)
		.map(([period, group]) => ({
			id: `signal-${period}`,
			period,
			count: group.length,
			ransomwareKnown: group.filter((item) => item.knownRansomwareUse === "known").length,
			dominantVendors: rankByLabel(group, "vendor", 3).map((item) => item.label),
		}));
}
