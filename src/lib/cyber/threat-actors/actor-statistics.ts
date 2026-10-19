import type { ThreatActor } from "../../../types/threat-actors.ts";
export const legalLabel = (value: string) => value.replaceAll("_", " ");
export const actorStatistics = (actors: readonly ThreatActor[]) => ({
	total: actors.length, sourceCount: new Set(actors.flatMap((actor) => [...actor.sourceIds])).size,
	lastVerified: actors.map((actor) => actor.lastVerifiedAt).sort()[0] ?? null,
	statuses: [...new Set(actors.flatMap((actor) => [...actor.legalStatus]))].map((status) => ({ status, count: actors.filter((actor) => actor.legalStatus.includes(status)).length })),
});
export const canShowPortrait = (portrait: ThreatActor["portrait"]) => {
	const hasLocalAsset = !!portrait.localPath && !!portrait.attribution;
	if (portrait.rightsStatus === "USER_PROVIDED") return hasLocalAsset;
	return portrait.rightsStatus === "VERIFIED" && hasLocalAsset && !!portrait.sourceId && !!portrait.originalUrl;
};
export const getActorClaims = (actor: ThreatActor) => [actor.summary, actor.classification, actor.documentedImpact, ...actor.story, ...actor.aliases, ...(actor.nationality ? [actor.nationality] : []), ...actor.capabilities, ...actor.associations, ...actor.operations, ...actor.footprint, ...actor.legalActions];
