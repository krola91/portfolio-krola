import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { ACTORS } from "../../src/data/cyber/threat-actors/actors.ts";
import { ACTOR_SOURCES } from "../../src/data/cyber/threat-actors/sources.ts";
import { ACTOR_EXPLAINERS } from "../../src/data/cyber/threat-actors/explainers.ts";
import { EDUCATION_SOURCE_BY_ID, OBSERVATORY_EXPLAINER_BY_ID } from "../../src/data/cyber/observatory-explainers.ts";
import { actorHash, actorIndexHash, DOSSIER_SECTIONS, parseActorRoute } from "../../src/lib/cyber/threat-actors/actor-navigation.ts";
import { actorStatistics, canShowPortrait, getActorClaims } from "../../src/lib/cyber/threat-actors/actor-statistics.ts";
import { DEFAULT_ACTOR_FILTERS, filterActors, normalizeActorText, toActorSearchRecord } from "../../src/lib/cyber/threat-actors/filter-actors.ts";
import { validateActorData } from "../../src/lib/cyber/threat-actors/validate-actor-data.ts";

const records = ACTORS.map(toActorSearchRecord);
const cloneActors = () => structuredClone(ACTORS);
test("ActorDex contains exactly the eight requested unique, validated records", () => {
	assert.doesNotThrow(() => validateActorData(ACTORS, ACTOR_SOURCES));
	assert.deepEqual(ACTORS.map((actor) => actor.id), ["yakubets", "bogachev", "khoroshev", "matveev", "park-jin-hyok", "belan", "polyanin", "dunaev"]);
	assert.equal(ACTORS.length, 8);
	assert.throws(() => validateActorData(ACTORS.slice(1), ACTOR_SOURCES), /Exactly eight/);
	const copy = cloneActors(); copy[0].index = 8; assert.throws(() => validateActorData(copy, ACTOR_SOURCES), /Indices/);
});
test("source references and per-claim legal qualifications cannot silently disappear", () => {
	for (const actor of ACTORS) for (const claim of getActorClaims(actor)) { assert.ok(claim.sourceIds.length); assert.ok(claim.assertion); }
	const copy = cloneActors(); copy[0].summary.sourceIds = []; assert.throws(() => validateActorData(copy, ACTOR_SOURCES), /Incomplete claim/);
	const copy2 = cloneActors(); copy2[0].summary.assertion = "CONVICTED"; assert.throws(() => validateActorData(copy2, ACTOR_SOURCES), /Unsupported judicial claim/);
	const copy3 = cloneActors(); copy3[0].legalActions = copy3[0].legalActions.filter((item) => item.assertion !== "WANTED"); assert.throws(() => validateActorData(copy3, ACTOR_SOURCES), /Wanted without/);
	const badSources = structuredClone(ACTOR_SOURCES); badSources[0].url = "https://example.com/not-an-authority"; assert.throws(() => validateActorData(ACTORS, badSources), /Noncanonical/);
	const qualified = ACTORS[4].associations.find((edge) => edge.attribution === "SECONDARY_ATTRIBUTION");
	assert.equal(qualified?.assertion, "ALLEGED");
});
test("every dossier has a complete, individually sourced case narrative", () => {
	for (const actor of ACTORS) {
		assert.equal(actor.story.length, 3);
		for (const paragraph of actor.story) {
			assert.ok(paragraph.value.split(/\s+/).length >= 40);
			assert.ok(getActorClaims(actor).includes(paragraph));
			assert.ok(paragraph.sourceIds.every((id) => actor.sourceIds.includes(id)));
		}
	}
	const copy = cloneActors(); copy[0].story = [];
	assert.throws(() => validateActorData(copy, ACTOR_SOURCES), /Incomplete case narrative/);
	const copy2 = cloneActors(); copy2[0].story[0].sourceIds = ["unregistered-biography"];
	assert.throws(() => validateActorData(copy2, ACTOR_SOURCES), /Unregistered claim provenance/);
	const copy3 = cloneActors(); copy3[0].story[0].assertion = "CONVICTED";
	assert.throws(() => validateActorData(copy3, ACTOR_SOURCES), /Unsupported judicial claim/);
});
test("normalized search covers names, aliases, case and punctuation", () => {
	assert.equal(normalizeActorText("  LOCKBITSUPP  "), "lockbitsupp");
	assert.equal(normalizeActorText("LK-4D4"), "lk 4d4");
	for (const [search, id] of [["aqua", "yakubets"], ["SLAVIK", "bogachev"], ["LockBitSupp", "khoroshev"], ["wazawaka", "matveev"], ["Pak Kwang Jin", "park-jin-hyok"], ["M4G", "belan"], ["lk-4d4", "polyanin"], ["Vladimir Dunaev", "dunaev"]]) assert.deepEqual(filterActors(records, { ...DEFAULT_ACTOR_FILTERS, search }).map((actor) => actor.id), [id]);
});
test("filters combine, return an empty state and reset without pagination", () => {
	assert.equal(filterActors(records, DEFAULT_ACTOR_FILTERS).length, 8);
	assert.deepEqual(filterActors(records, { ...DEFAULT_ACTOR_FILTERS, legal: "WANTED", activity: "Ransomware", association: "Hive" }).map((actor) => actor.id), ["matveev"]);
	assert.equal(filterActors(records, { ...DEFAULT_ACTOR_FILTERS, legal: "CONVICTED", activity: "Ransomware" }).length, 0);
	assert.equal(filterActors(records, { ...DEFAULT_ACTOR_FILTERS, search: "not-a-curated-record" }).length, 0);
	assert.equal(filterActors(records, { ...DEFAULT_ACTOR_FILTERS, classification: "Ransomware affiliate" }).length, 2);
});
test("deep links restore a dossier, section, index and existing vulnerability anchors", () => {
	const ids = records.map((actor) => actor.id);
	assert.deepEqual(parseActorRoute(actorHash("polyanin", "legal"), ids), { module: "actors", actorId: "polyanin", section: "legal", invalidActor: false });
	assert.equal(parseActorRoute("#actors", ids).actorId, null);
	assert.equal(actorIndexHash("belan"), "#actors/belan");
	assert.deepEqual(parseActorRoute("#actors/park-jin-hyok", ids), { module: "actors", actorId: null, indexActorId: "park-jin-hyok", section: null, invalidActor: false });
	assert.equal(parseActorRoute("#actors/unknown", ids).invalidActor, true);
	assert.equal(parseActorRoute("#actor/no-such-record", ids).invalidActor, true);
	assert.equal(parseActorRoute("#actor/belan/not-a-section", ids).section, null);
	assert.equal(parseActorRoute("#records", ids).module, "vulnerabilities");
	assert.equal(parseActorRoute("", ids).module, "actors");
	assert.equal(parseActorRoute("#vulnerabilities", ids).module, "vulnerabilities");
	assert.deepEqual(DOSSIER_SECTIONS, ["overview", "story", "legal", "sources"]);
	for (const section of ["story", "operations", "associations"]) assert.equal(parseActorRoute(actorHash("yakubets", section), ids).section, "story");
});
test("the dossier replaces the old panels and the Home CTA targets vulnerability intelligence", async () => {
	const dossier = await readFile("src/components/cyber/threat-actors/ActorDossier.astro", "utf8");
	const story = await readFile("src/components/cyber/threat-actors/ActorStory.astro", "utf8");
	const css = await readFile("src/styles/threat-actors.css", "utf8");
	const homeLab = await readFile("src/components/home/the-lab.astro", "utf8");
	assert.match(dossier, /<ActorStory actor=\{actor\}/);
	assert.doesNotMatch(dossier, /ActorTimeline|ActorAssociationGraph/);
	assert.match(story, /SourceRefs ids=\{paragraph.sourceIds\}/);
	assert.match(story, /data-assertion=\{paragraph.assertion\}/);
	assert.match(css, /\.actor-identity \{ position: static; min-width: 0; max-height: none; overflow: visible;/);
	assert.doesNotMatch(css, /actor-timeline|actor-graph|actor-edge-trace/);
	assert.match(homeLab, /href="\/cyber-observatory#vulnerabilities"/);
});
test("user-provided portraits render only from the guarded local image path", () => {
	for (const actor of ACTORS) {
		assert.equal(canShowPortrait(actor.portrait), true);
		assert.match(actor.portrait.localPath ?? "", /^\/images\/cyber\/threat-actors\/[a-z0-9-]+-dither\.webp$/);
		assert.equal(actor.portrait.rightsStatus, "USER_PROVIDED");
	}
	const portrait = { ...ACTORS[0].portrait, rightsStatus: "UNKNOWN" as const };
	assert.equal(canShowPortrait(portrait), false);
	assert.equal(canShowPortrait({ ...portrait, rightsStatus: "VERIFIED", attribution: "Verified rights holder", originalUrl: "https://www.fbi.gov/example" }), true);
	const copy = cloneActors(); copy[0].portrait.localPath = "/images/unsafe.webp"; assert.throws(() => validateActorData(copy, ACTOR_SOURCES), /Nonlocal portrait path/);
	const unattributed = cloneActors(); unattributed[0].portrait.attribution = null; assert.throws(() => validateActorData(unattributed, ACTOR_SOURCES), /Unsafe portrait/);
});
test("malformed dates fail with an actionable validation report rather than RangeError", () => {
	const copy = cloneActors(); copy[0].lastVerifiedAt = "2026-99-99";
	assert.throws(() => validateActorData(copy, ACTOR_SOURCES), /Actor dataset validation failed/);
	const sourceCopy = structuredClone(ACTOR_SOURCES); sourceCopy[0].accessedAt = "2026-02-30";
	assert.throws(() => validateActorData(ACTORS, sourceCopy), /Incomplete source/);
});
test("status statistics are computed, overlapping, and do not imply incarceration", () => {
	const stats = actorStatistics(ACTORS);
	assert.equal(stats.total, 8); assert.equal(stats.sourceCount, 16);
	assert.equal(stats.statuses.find((item) => item.status === "WANTED")?.count, 7);
	assert.equal(stats.statuses.find((item) => item.status === "CONVICTED")?.count, 1);
	const dunaev = ACTORS[7]; assert.ok(dunaev.legalStatus.includes("SENTENCED")); assert.ok(!dunaev.legalStatus.includes("WANTED"));
	assert.match(dunaev.legalActions.at(-1)?.value ?? "", /No current-incarceration claim/);
});
test("all twelve actor explainers reuse the single registry with complete official provenance", () => {
	assert.equal(ACTOR_EXPLAINERS.length, 12);
	for (const item of ACTOR_EXPLAINERS) { assert.ok(OBSERVATORY_EXPLAINER_BY_ID.has(item.id)); for (const sourceId of item.sourceIds) assert.ok(EDUCATION_SOURCE_BY_ID.has(sourceId)); assert.ok(item.limitation && item.howToRead); }
});
test("static interaction contract includes semantic links, keyboard, cleanup and reduced motion", async () => {
	const card = await readFile("src/components/cyber/threat-actors/ActorLedgerPanel.astro", "utf8");
	const controller = await readFile("src/scripts/threat-actor-tracking.ts", "utf8");
	const navigation = await readFile("src/lib/cyber/observatory-navigation.ts", "utf8");
	const css = await readFile("src/styles/threat-actors.css", "utf8");
	const shell = await readFile("src/components/cyber/ObservatoryShell.astro", "utf8");
	assert.match(card, /<a href=\{actorHash/); assert.match(card, /aria-label=\{`Open dossier/);
	assert.match(controller, /event.key === " "/); assert.match(navigation, /hashchange/); assert.match(controller, /returnFocus.focus/);
	assert.match(controller, /lifecycle.abort/); assert.match(css, /prefers-reduced-motion: reduce/); assert.match(css, /animation: none !important/);
	assert.match(card, /role="tabpanel"/); assert.match(controller, /"ArrowLeft", "ArrowRight", "Home", "End"/);
	assert.equal((shell.match(/<CommandPalette/g) ?? []).length, 1); assert.equal((shell.match(/<ExplainerPopover/g) ?? []).length, 1);
});
