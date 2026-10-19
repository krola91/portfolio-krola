import type { ActorRoute } from "../../../types/threat-actors.ts";
export const DOSSIER_SECTIONS = ["overview", "story", "legal", "sources"] as const;
export function parseActorRoute(hash: string, knownIds: readonly string[]): ActorRoute {
	const raw = hash.replace(/^#/, "");
	if (raw === "vulnerabilities" || ["overview", "records", "methodology"].includes(raw)) return { module: "vulnerabilities", actorId: null, section: raw === "vulnerabilities" ? null : raw, invalidActor: false };
	const [prefix, actorId, section] = raw.split("/");
	// Keep existing bookmarks useful after replacing the timeline and graph.
	const dossierSection = ["operations", "associations"].includes(section) ? "story" : section;
	if (prefix === "actor") return { module: "actors", actorId: knownIds.includes(actorId) ? actorId : null, section: DOSSIER_SECTIONS.some((item) => item === dossierSection) ? dossierSection : null, invalidActor: !knownIds.includes(actorId) };
	if (prefix === "actors" && actorId) return { module: "actors", actorId: null, indexActorId: knownIds.includes(actorId) ? actorId : null, section: null, invalidActor: !knownIds.includes(actorId) };
	return { module: "actors", actorId: null, section: ["actors-methodology", "actors-sources"].includes(raw) ? raw : null, invalidActor: false };
}
export const actorHash = (id: string, section?: string) => `#actor/${encodeURIComponent(id)}${section ? `/${section}` : ""}`;
export const actorIndexHash = (id: string) => `#actors/${encodeURIComponent(id)}`;
