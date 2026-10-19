import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { validateNormalizedDataset } from "../data/cyber/adapters/cisa-kev.ts";
import type { KevDataset } from "../types/cyber.ts";

const snapshotPath = fileURLToPath(new URL("../data/cyber/generated/cisa-kev.json", import.meta.url));

try {
	const parsed: unknown = JSON.parse(await readFile(snapshotPath, "utf8"));
	validateNormalizedDataset(parsed);
	const dataset = parsed as KevDataset;
	console.log(`Snapshot valid | ${dataset.metadata.catalogVersion} | ${dataset.metadata.validCount} records | ${dataset.metadata.hash.slice(0, 12)}`);
} catch (error) {
	console.error(`Snapshot invalid: ${(error as Error).message}`);
	process.exitCode = 1;
}
