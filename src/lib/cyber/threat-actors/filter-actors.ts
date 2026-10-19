import type { ActorFilters, ActorSearchRecord, ThreatActor } from "../../../types/threat-actors.ts";

export const DEFAULT_ACTOR_FILTERS: ActorFilters = { search: "", legal: "all", classification: "all", association: "all", activity: "all" };
export const normalizeActorText = (value: string) => value.normalize("NFKC").toLocaleLowerCase("en-US").replace(/[^\p{L}\p{N}]+/gu, " ").trim().replace(/\s+/g, " ");
export const toActorSearchRecord = (actor: ThreatActor): ActorSearchRecord => ({
	id: actor.id, displayName: actor.displayName, aliases: actor.aliases.map((alias) => alias.value), legalStatus: actor.legalStatus,
	classification: actor.classification.value, associations: actor.associations.filter((item) => item.kind === "GROUP" || item.kind === "MALWARE").map((item) => item.label), activities: actor.activities,
});
export function filterActors<T extends ActorSearchRecord>(actors: readonly T[], filters: ActorFilters): T[] {
	const term = normalizeActorText(filters.search);
	return actors.filter((actor) => (!term || normalizeActorText([actor.displayName, ...actor.aliases].join(" ")).includes(term))
		&& (filters.legal === "all" || actor.legalStatus.some((status) => status === filters.legal))
		&& (filters.classification === "all" || actor.classification === filters.classification)
		&& (filters.association === "all" || actor.associations.includes(filters.association))
		&& (filters.activity === "all" || actor.activities.includes(filters.activity)));
}
