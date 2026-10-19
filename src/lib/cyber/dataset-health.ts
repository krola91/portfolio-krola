import type { DatasetIntegrity, KevDatasetMetadata } from "../../types/cyber.ts";

export function getDatasetIntegrity(
	metadata: KevDatasetMetadata | null | undefined,
	now = new Date(),
	staleAfterDays = 7,
): DatasetIntegrity {
	if (!metadata || metadata.validCount <= 0) return "unavailable";
	const releasedAt = Date.parse(metadata.dateReleased);
	if (!Number.isFinite(releasedAt)) return "unavailable";
	if (now.getTime() - releasedAt > staleAfterDays * 86_400_000) return "stale";
	if (
		metadata.integrity === "partial" ||
		metadata.rejectedCount > 0 ||
		metadata.unknownEnumCount > 0 ||
		metadata.sourceValidCount + metadata.rejectedCount + metadata.duplicateCount !== metadata.receivedCount
	) return "partial";
	return "verified";
}
