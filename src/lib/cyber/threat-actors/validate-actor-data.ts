import { LEGAL_ASSERTIONS } from "../../../types/threat-actors.ts";
import type { ActorSource, ThreatActor } from "../../../types/threat-actors.ts";
import { getActorClaims } from "./actor-statistics.ts";
import { normalizeActorText } from "./filter-actors.ts";

const dateValid = (value: string) => {
	const date = new Date(`${value}T00:00:00Z`);
	return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
};
const officialHost = (source: ActorSource) => ({ FBI: ["www.fbi.gov"], DOJ: ["www.justice.gov"], OFAC: ["home.treasury.gov", "ofac.treasury.gov"], COURT: ["www.uscourts.gov"], NCA: ["www.nationalcrimeagency.gov.uk"], STATE_DEPARTMENT: ["www.state.gov", "2021-2025.state.gov"] }[source.kind]).includes(new URL(source.url).hostname);
export function validateActorData(actors: readonly ThreatActor[], sources: readonly ActorSource[]): void {
	const errors: string[] = [];
	const registry = new Map(sources.map((source) => [source.id, source]));
	if (actors.length !== 8) errors.push("Exactly eight actors required");
	if (new Set(actors.map((actor) => actor.id)).size !== actors.length) errors.push("Duplicate actor ID");
	if (actors.map((actor) => actor.index).sort().join(",") !== "1,2,3,4,5,6,7,8") errors.push("Indices must be unique 1–8");
	if (registry.size !== sources.length) errors.push("Duplicate source ID");
	for (const source of sources) {
		try { if (new URL(source.url).protocol !== "https:" || !officialHost(source)) errors.push(`Noncanonical HTTPS source: ${source.id}`); } catch { errors.push(`Invalid URL: ${source.id}`); }
		if (!source.title.trim() || !source.organization.trim() || !dateValid(source.accessedAt) || (source.publishedAt && !dateValid(source.publishedAt))) errors.push(`Incomplete source: ${source.id}`);
	}
	for (const actor of actors) {
		const prefix = actor.id;
		if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(prefix) || !actor.displayName.trim() || !dateValid(actor.lastVerifiedAt)) errors.push(`Invalid identity/date: ${prefix}`);
		if (!actor.sourceIds.length || !actor.identitySourceIds.length) errors.push(`Missing official identity source: ${prefix}`);
		for (const id of [...actor.sourceIds, ...actor.identitySourceIds]) if (!registry.has(id)) errors.push(`Unknown source: ${id}`);
		if (actor.identitySourceIds.some((id) => !actor.sourceIds.includes(id))) errors.push(`Identity source outside actor registry: ${prefix}`);
		if (!actor.legalStatus.length || new Set(actor.legalStatus).size !== actor.legalStatus.length) errors.push(`Empty/duplicate legal status: ${prefix}`);
		if (actor.story.length < 3) errors.push(`Incomplete case narrative: ${prefix}`);
		const claims = getActorClaims(actor);
		if (new Set(claims.map((claim) => claim.id)).size !== claims.length) errors.push(`Duplicate claim: ${prefix}`);
		const aliases = actor.aliases.map((alias) => normalizeActorText(alias.value));
		if (aliases.some((alias) => !alias) || new Set(aliases).size !== aliases.length) errors.push(`Empty/duplicate normalized alias: ${prefix}`);
		for (const claim of claims) {
			if (!claim.value.trim() || !claim.label.trim() || !LEGAL_ASSERTIONS.includes(claim.assertion) || !claim.sourceIds.length) errors.push(`Incomplete claim: ${claim.id}`);
			for (const id of claim.sourceIds) if (!registry.has(id) || !actor.sourceIds.includes(id)) errors.push(`Unregistered claim provenance: ${claim.id} / ${id}`);
			if (["CONVICTED", "PLEADED_GUILTY", "SENTENCED"].includes(claim.assertion) && !claim.sourceIds.some((id) => registry.get(id)?.judicialOutcome && ["DOJ", "COURT"].includes(registry.get(id)?.kind ?? ""))) errors.push(`Unsupported judicial claim: ${claim.id}`);
		}
		for (const status of actor.legalStatus) {
			if (!LEGAL_ASSERTIONS.includes(status)) errors.push(`Invalid legal status: ${prefix}`);
			const actions = actor.legalActions.filter((action) => action.assertion === status);
			if (!actions.length) errors.push(`Legal status without action: ${prefix} / ${status}`);
			if (status === "WANTED" && !actions.some((action) => action.sourceIds.some((id) => registry.get(id)?.currentWantedNotice && registry.get(id)?.accessedAt === actor.lastVerifiedAt))) errors.push(`Wanted without reviewed authority notice: ${prefix}`);
		}
		for (const edge of actor.associations) {
			if (!["ALIAS", "GROUP", "MALWARE", "CAMPAIGN", "SECTOR"].includes(edge.kind) || !["OFFICIALLY_ALLEGED", "CONFIRMED_BY_CONVICTION", "SECONDARY_ATTRIBUTION", "DOCUMENTED_BY_SOURCE"].includes(edge.attribution)) errors.push(`Invalid association type: ${edge.id}`);
			if (edge.attribution === "CONFIRMED_BY_CONVICTION" && edge.assertion !== "CONVICTED") errors.push(`Overstated association: ${edge.id}`);
			if (edge.attribution === "OFFICIALLY_ALLEGED" && edge.assertion !== "ALLEGED") errors.push(`Unqualified allegation: ${edge.id}`);
			if (edge.attribution === "DOCUMENTED_BY_SOURCE" && edge.assertion !== "DOCUMENTED") errors.push(`Unqualified documented edge: ${edge.id}`);
			if (edge.attribution === "SECONDARY_ATTRIBUTION" && !["DOCUMENTED", "ALLEGED"].includes(edge.assertion)) errors.push(`Overstated private attribution: ${edge.id}`);
		}
		for (const event of actor.operations) if (!dateValid(event.date)) errors.push(`Invalid operation date: ${event.id}`);
		for (const action of actor.legalActions) if (action.date && !dateValid(action.date)) errors.push(`Invalid legal date: ${action.id}`);
		const verifiedPortrait = actor.portrait.rightsStatus === "VERIFIED" && !!actor.portrait.sourceId && !!actor.portrait.attribution && actor.portrait.originalUrl?.startsWith("https://");
		const userProvidedPortrait = actor.portrait.rightsStatus === "USER_PROVIDED" && !!actor.portrait.attribution && !actor.portrait.originalUrl;
		if (actor.portrait.localPath && !verifiedPortrait && !userProvidedPortrait) errors.push(`Unsafe portrait: ${prefix}`);
		if (actor.portrait.localPath && (!actor.portrait.localPath.startsWith("/images/cyber/threat-actors/") || actor.portrait.localPath.includes(".."))) errors.push(`Nonlocal portrait path: ${prefix}`);
		if (actor.portrait.sourceId && !actor.sourceIds.includes(actor.portrait.sourceId)) errors.push(`Unknown portrait source: ${prefix}`);
	}
	if (errors.length) throw new Error(`Actor dataset validation failed:\n${errors.join("\n")}`);
}
