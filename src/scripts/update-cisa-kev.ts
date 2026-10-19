import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { CISA_KEV_URL, normalizeCisaKevPayload, parseCisaKevJson, validateNormalizedDataset } from "../data/cyber/adapters/cisa-kev.ts";
import { writeJsonAtomically } from "../lib/cyber/atomic-dataset.ts";
import type { KevDataset } from "../types/cyber.ts";

const SNAPSHOT_URL = new URL("../data/cyber/generated/cisa-kev.json", import.meta.url);
const SNAPSHOT_PATH = fileURLToPath(SNAPSHOT_URL);
const MAX_BYTES = 15 * 1024 * 1024;

async function readPrevious(): Promise<KevDataset | null> {
	try {
		const parsed: unknown = JSON.parse(await readFile(SNAPSHOT_PATH, "utf8"));
		validateNormalizedDataset(parsed);
		return parsed;
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
		throw error;
	}
}

async function fetchOfficialFeed(): Promise<unknown> {
	if (new URL(CISA_KEV_URL).protocol !== "https:") throw new Error("Refusing non-HTTPS CISA endpoint.");
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 20_000);
	try {
		const response = await fetch(CISA_KEV_URL, {
			signal: controller.signal,
			headers: { accept: "application/json", "user-agent": "krola-cyber-observatory/1.0" },
		});
		if (!response.ok) throw new Error(`CISA KEV request failed: ${response.status} ${response.statusText}`);
		const declaredLength = Number(response.headers.get("content-length") ?? 0);
		if (declaredLength > MAX_BYTES) throw new Error("CISA KEV response exceeds size limit.");
		const body = await response.text();
		if (Buffer.byteLength(body, "utf8") > MAX_BYTES) throw new Error("CISA KEV response exceeds size limit.");
		return parseCisaKevJson(body);
	} finally {
		clearTimeout(timeout);
	}
}

try {
	const previous = await readPrevious();
	const payload = await fetchOfficialFeed();
	const dataset = normalizeCisaKevPayload(payload, new Date().toISOString(), previous);
	validateNormalizedDataset(dataset);
	await writeJsonAtomically(SNAPSHOT_PATH, dataset);
console.log(`CISA KEV SYNC
SOURCE RECORDS       ${dataset.metadata.receivedCount}
SOURCE VALID         ${dataset.metadata.sourceValidCount}
RETAINED WINDOW      ${dataset.metadata.validCount}/${dataset.metadata.retentionLimit}
REJECTED RECORDS     ${dataset.metadata.rejectedCount}
DUPLICATES           ${dataset.metadata.duplicateCount}
UNKNOWN ENUMS        ${dataset.metadata.unknownEnumCount}
CATALOG VERSION      ${dataset.metadata.catalogVersion}
SYNCED AT            ${dataset.metadata.syncedAt}
WINDOW DIFF          +${dataset.metadata.newCount} -${dataset.metadata.removedCount} ~${dataset.metadata.modifiedCount}
FIELD CHANGES        ransomware:${dataset.metadata.ransomwareStatusChanges} due:${dataset.metadata.dueDateChanges} notes:${dataset.metadata.notesChanges} action:${dataset.metadata.requiredActionChanges}
STATUS               SUCCESS`);
} catch (error) {
	console.error(`CISA KEV update aborted; previous snapshot preserved. ${(error as Error).message}`);
	process.exitCode = 1;
}
