import type { ObservatoryVulnerability, VulnerabilityFilters } from "../../types/cyber.ts";

const RANGE_DAYS = { "7D": 7, "30D": 30, "90D": 90, "1Y": 365 } as const;
const DAY_MS = 86_400_000;

function normalized(value: string): string {
	return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("en-US");
}

export function filterVulnerabilities(
	records: readonly ObservatoryVulnerability[],
	filters: VulnerabilityFilters,
	now = new Date(),
): ObservatoryVulnerability[] {
	const search = normalized(filters.search);
	const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
	const filtered = records.filter((record) => {
		if (filters.range !== "ALL") {
			const added = Date.parse(`${record.dateAdded}T00:00:00Z`);
			const age = now.getTime() - added;
			if (age < 0 || age > RANGE_DAYS[filters.range] * DAY_MS) return false;
		}
		if (search) {
			const haystack = normalized(
				[record.cveId, record.vendor, record.product, record.name, record.description, ...record.cwes].join(" "),
			);
			if (!haystack.includes(search)) return false;
		}
		if (filters.vendor !== "all" && normalized(record.vendor) !== normalized(filters.vendor)) return false;
		if (filters.product !== "all" && normalized(record.product) !== normalized(filters.product)) return false;
		if (filters.ransomware !== "all" && record.knownRansomwareUse !== filters.ransomware) return false;
		if (filters.cwe !== "all" && !record.cwes.some((cwe) => normalized(cwe) === normalized(filters.cwe))) return false;
		const due = record.remediationDueDate ? Date.parse(`${record.remediationDueDate}T00:00:00Z`) : null;
		if (filters.dueDate === "upcoming" && (due === null || due < today)) return false;
		if (filters.dueDate === "overdue" && (due === null || due >= today)) return false;
		if (filters.dueDate === "no-due" && due !== null) return false;
		return true;
	});

	return filtered.sort((a, b) => {
		switch (filters.sort) {
			case "vendor-asc": return a.vendor.localeCompare(b.vendor) || a.cveId.localeCompare(b.cveId);
			case "product-asc": return a.product.localeCompare(b.product) || a.cveId.localeCompare(b.cveId);
			case "cve-asc": return a.cveId.localeCompare(b.cveId);
			case "due-asc": return (a.remediationDueDate ?? "9999-12-31").localeCompare(b.remediationDueDate ?? "9999-12-31");
			default: return b.dateAdded.localeCompare(a.dateAdded) || a.cveId.localeCompare(b.cveId);
		}
	});
}
