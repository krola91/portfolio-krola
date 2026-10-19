import { EXPLAINER_SOURCES, getExplainerSourceLabel, VULNERABILITY_EXPLAINERS } from "./vulnerability-explainers.ts";
import { ACTOR_EXPLAINERS, ACTOR_EXPLAINER_SOURCES } from "./threat-actors/explainers.ts";
import { ACTOR_SOURCES } from "./threat-actors/sources.ts";
import type { ActorExplainer } from "./threat-actors/explainers.ts";
import type { VulnerabilityExplainer } from "../../types/cyber.ts";
export type ObservatoryExplainer = VulnerabilityExplainer | ActorExplainer;
export const OBSERVATORY_EXPLAINER_BY_ID = new Map<string, ObservatoryExplainer>([...VULNERABILITY_EXPLAINERS, ...ACTOR_EXPLAINERS].map((item) => [item.id, item]));
export const EDUCATION_SOURCE_BY_ID = new Map<string, { label: string; url: string }>([
	...Object.values(EXPLAINER_SOURCES).map((item) => [item.id, item] as const),
	...ACTOR_EXPLAINER_SOURCES.map((item) => [item.id, item] as const),
	...ACTOR_SOURCES.map((item) => [item.id, { label: `${item.kind} — ${item.title}`, url: item.url }] as const),
]);
export const getObservatorySourceLabel = (explainer: ObservatoryExplainer) => {
	if (explainer.sourceKind === "ACTOR_DERIVED") return "DERIVED BY OBSERVATORY // REVIEWED OFFICIAL RECORDS";
	if (explainer.sourceKind === "ACTOR_DEFINITION") return "SOURCE // OFFICIAL LEGAL / CASE CONTEXT";
	return getExplainerSourceLabel(explainer as VulnerabilityExplainer);
};
