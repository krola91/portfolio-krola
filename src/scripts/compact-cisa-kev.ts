import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { CISA_KEV_RETENTION_LIMIT, computeNormalizedHash, validateNormalizedDataset } from "../data/cyber/adapters/cisa-kev.ts";
import { calculateBaseMetrics } from "../lib/cyber/aggregate-vulnerabilities.ts";
import { writeJsonAtomically } from "../lib/cyber/atomic-dataset.ts";
import type { KevDataset } from "../types/cyber.ts";

const snapshotPath = fileURLToPath(new URL("../data/cyber/generated/cisa-kev.json", import.meta.url));
const existing = JSON.parse(await readFile(snapshotPath, "utf8")) as KevDataset;
if (!Array.isArray(existing.vulnerabilities) || !existing.metadata || !existing.metadata.dateReleased) {
	throw new Error("Cannot compact an incompatible CISA KEV snapshot.");
}

const ordered = [...existing.vulnerabilities].sort(
	(a, b) => b.dateAdded.localeCompare(a.dateAdded) || a.cveId.localeCompare(b.cveId),
);
const vulnerabilities = ordered.slice(0, CISA_KEV_RETENTION_LIMIT);
const sourceValidCount = existing.metadata.sourceValidCount ?? existing.metadata.validCount;
const compacted: KevDataset = {
	metadata: {
		...existing.metadata,
		sourceValidCount,
		retentionLimit: CISA_KEV_RETENTION_LIMIT,
		validCount: vulnerabilities.length,
		hash: computeNormalizedHash(vulnerabilities),
	},
	baseMetrics: calculateBaseMetrics(vulnerabilities, new Date(existing.metadata.dateReleased)),
	vulnerabilities,
};

validateNormalizedDataset(compacted);
await writeJsonAtomically(snapshotPath, compacted);
console.log(`CISA KEV snapshot compacted | ${compacted.metadata.validCount} most recent records retained`);
