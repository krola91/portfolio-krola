import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { normalizeCisaKevPayload, parseCisaKevJson, validateNormalizedDataset } from "../../src/data/cyber/adapters/cisa-kev.ts";
import { calculateBaseMetrics, groupByMonth, groupByYear, rankByLabel, rankCwes } from "../../src/lib/cyber/aggregate-vulnerabilities.ts";
import { writeJsonAtomically } from "../../src/lib/cyber/atomic-dataset.ts";
import { getDatasetIntegrity } from "../../src/lib/cyber/dataset-health.ts";
import { filterVulnerabilities } from "../../src/lib/cyber/filter-vulnerabilities.ts";
import type { VulnerabilityFilters } from "../../src/types/cyber.ts";

function entry(overrides: Record<string, unknown> = {}) {
	return {
		cveID: "CVE-2026-12345",
		vendorProject: "Acme",
		product: "Portal",
		vulnerabilityName: "Unicode injection – análisis",
		dateAdded: "2026-09-10",
		shortDescription: "A valid KEV description.",
		requiredAction: "Apply vendor mitigations.",
		dueDate: "2026-10-01",
		knownRansomwareCampaignUse: "Known",
		notes: "https://example.invalid/advisory",
		cwes: ["CWE-79"],
		...overrides,
	};
}

function feed(vulnerabilities: unknown[]) {
	return {
		title: "CISA Catalog of Known Exploited Vulnerabilities",
		catalogVersion: "2026.09.14",
		dateReleased: "2026-09-14T19:00:02.426Z",
		count: vulnerabilities.length,
		vulnerabilities,
	};
}

function dataset(records: unknown[]) {
	return normalizeCisaKevPayload(feed(records), "2026-09-14T20:00:00.000Z");
}

test("adapter preserves official text and maps ransomware status", () => {
	const result = dataset([entry()]);
	assert.equal(result.vulnerabilities[0].name, "Unicode injection – análisis");
	assert.equal(result.vulnerabilities[0].knownRansomwareUse, "known");
	assert.deepEqual(result.vulnerabilities[0].cwes, ["CWE-79"]);
	validateNormalizedDataset(result);
});

test("adapter treats non-Known ransomware as unknown and accepts missing CWE", () => {
	const result = dataset([entry({ knownRansomwareCampaignUse: "Unknown", cwes: undefined })]);
	assert.equal(result.vulnerabilities[0].knownRansomwareUse, "unknown");
	assert.deepEqual(result.vulnerabilities[0].cwes, []);
});

test("adapter rejects malformed records and deduplicates deterministically", () => {
	const result = dataset([
		entry({ cveID: "invalid" }),
		entry(),
		entry(),
		entry({ cveID: "CVE-2026-99999", dateAdded: "2026-09-12" }),
	]);
	assert.equal(result.metadata.rejectedCount, 1);
	assert.equal(result.metadata.duplicateCount, 1);
	assert.equal(result.metadata.integrity, "partial");
	assert.deepEqual(result.vulnerabilities.map((item) => item.cveId), ["CVE-2026-99999", "CVE-2026-12345"]);
});

test("adapter fails closed on an incompatible top-level schema", () => {
	assert.throws(() => normalizeCisaKevPayload({ vulnerabilities: [] }, "2026-09-14T20:00:00.000Z"), /incompatible/);
});

test("pipeline detects invalid JSON before normalization", () => {
	assert.throws(() => parseCisaKevJson("{not-json"), /invalid JSON/);
});

test("normalization is deterministic for a fixed sync instant", () => {
	const first = dataset([entry(), entry({ cveID: "CVE-2026-99999" })]);
	const second = dataset([entry(), entry({ cveID: "CVE-2026-99999" })]);
	assert.deepEqual(second, first);
});

test("normalization retains only the 250 most recent valid records", () => {
	const recent = Array.from({ length: 250 }, (_, index) => entry({
		cveID: `CVE-2026-${String(10000 + index)}`,
		dateAdded: "2026-09-10",
	}));
	const result = dataset([...recent, entry({ cveID: "CVE-2020-0001", dateAdded: "2025-01-01" })]);
	assert.equal(result.metadata.sourceValidCount, 251);
	assert.equal(result.metadata.retentionLimit, 250);
	assert.equal(result.metadata.validCount, 250);
	assert.equal(result.vulnerabilities.length, 250);
	assert.equal(result.vulnerabilities.some((item) => item.cveId === "CVE-2020-0001"), false);
	assert.equal(result.metadata.integrity, "verified");
});

test("consecutive syncs upsert CVEs and keep a non-accumulating 250-record window", () => {
	const initialRecords = Array.from({ length: 250 }, (_, index) => entry({
		cveID: `CVE-2026-${String(10000 + index)}`,
		dateAdded: "2026-09-10",
	}));
	const previous = dataset(initialRecords);
	const nextFeed = [
		entry({ cveID: "CVE-2026-99999", dateAdded: "2026-09-11", product: "New signal" }),
		...initialRecords.map((record, index) => index === 0 ? { ...record, product: "Updated portal" } : record),
	];
	const result = normalizeCisaKevPayload(feed(nextFeed), "2026-09-15T20:00:00.000Z", previous);

	assert.equal(result.vulnerabilities.length, 250);
	assert.equal(new Set(result.vulnerabilities.map((item) => item.cveId)).size, 250);
	assert.equal(result.vulnerabilities[0].cveId, "CVE-2026-99999");
	assert.equal(result.vulnerabilities.find((item) => item.cveId === "CVE-2026-10000")?.product, "Updated portal");
	assert.equal(result.vulnerabilities.some((item) => item.cveId === "CVE-2026-10249"), false);
	assert.equal(result.metadata.newCount, 1);
	assert.equal(result.metadata.removedCount, 1);
	assert.equal(result.metadata.modifiedCount, 1);
});

test("rankings and base metrics use only defensible KEV fields", () => {
	const records = dataset([
		entry(),
		entry({ cveID: "CVE-2026-99999", vendorProject: "ACME", cwes: ["CWE-79", "CWE-89"], knownRansomwareCampaignUse: "Unknown" }),
	]).vulnerabilities;
	assert.deepEqual(rankByLabel(records, "vendor"), [{ label: "Acme", count: 2 }]);
	assert.deepEqual(rankCwes(records), [{ label: "CWE-79", count: 2 }, { label: "CWE-89", count: 1 }]);
	const metrics = calculateBaseMetrics(records, new Date("2026-09-14T20:00:00Z"));
	assert.equal(metrics.ransomwareKnown, 1);
	assert.equal(metrics.ransomwareUnknown, 1);
	assert.equal(metrics.added7d, 2);
	assert.deepEqual(groupByMonth(records), [{ period: "2026-09", count: 2 }]);
	assert.deepEqual(groupByYear(records), [{ period: "2026", count: 2 }]);
});

test("filtering combines dimensions without mutating source order", () => {
	const records = dataset([
		entry(),
		entry({ cveID: "CVE-2026-99999", vendorProject: "Other", product: "Edge", knownRansomwareCampaignUse: "Unknown", cwes: ["CWE-89"] }),
	]).vulnerabilities;
	const original = records.map((item) => item.cveId);
	const filters: VulnerabilityFilters = {
		search: "portal", range: "30D", vendor: "Acme", product: "all", ransomware: "known",
		cwe: "CWE-79", dueDate: "upcoming", sort: "vendor-asc",
	};
	assert.deepEqual(filterVulnerabilities(records, filters, new Date("2026-09-14T20:00:00Z")).map((item) => item.cveId), ["CVE-2026-12345"]);
	assert.deepEqual(records.map((item) => item.cveId), original);
});

test("dataset health exposes verified, partial and stale states", () => {
	const result = dataset([entry()]);
	assert.equal(getDatasetIntegrity(result.metadata, new Date("2026-09-15T00:00:00Z")), "verified");
	assert.equal(getDatasetIntegrity({ ...result.metadata, rejectedCount: 1 }, new Date("2026-09-15T00:00:00Z")), "partial");
	assert.equal(getDatasetIntegrity(result.metadata, new Date("2026-10-15T00:00:00Z")), "stale");
});

test("atomic writer replaces a snapshot only after a complete temporary write", async () => {
	const directory = await mkdtemp(join(tmpdir(), "kev-atomic-"));
	const target = join(directory, "snapshot.json");
	try {
		await writeFile(target, '{"old":true}\n', "utf8");
		await writeJsonAtomically(target, { current: true });
		assert.deepEqual(JSON.parse(await readFile(target, "utf8")), { current: true });
	} finally {
		await rm(directory, { recursive: true, force: true });
	}
});

test("atomic writer preserves the last snapshot when serialization fails", async () => {
	const directory = await mkdtemp(join(tmpdir(), "kev-preserve-"));
	const target = join(directory, "snapshot.json");
	try {
		await writeFile(target, '{"lastValid":true}\n', "utf8");
		await assert.rejects(writeJsonAtomically(target, { unsupported: 1n }));
		assert.deepEqual(JSON.parse(await readFile(target, "utf8")), { lastValid: true });
	} finally {
		await rm(directory, { recursive: true, force: true });
	}
});
