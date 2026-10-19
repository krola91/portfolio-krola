import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { EXPLAINER_SOURCES, getExplainerSourceLabel, VULNERABILITY_EXPLAINERS } from "../../src/data/cyber/vulnerability-explainers.ts";

test("educational registry has unique, complete concepts and primary HTTPS sources", () => {
	const ids = VULNERABILITY_EXPLAINERS.map((explainer) => explainer.id);
	assert.equal(new Set(ids).size, ids.length);
	assert.ok(VULNERABILITY_EXPLAINERS.length >= 18);
	for (const explainer of VULNERABILITY_EXPLAINERS) {
		assert.ok(explainer.id.trim());
		assert.ok(explainer.conceptNumber.trim());
		assert.ok(explainer.title.trim());
		assert.ok(explainer.shortDefinition.trim());
		assert.ok(explainer.purpose.trim());
		assert.ok(explainer.howToRead.trim());
		assert.ok(explainer.limitation.trim());
		assert.ok(explainer.sourceIds.length > 0);
		for (const sourceId of explainer.sourceIds) assert.ok(EXPLAINER_SOURCES[sourceId]);
	}
	const urls = Object.values(EXPLAINER_SOURCES).map((source) => source.url);
	assert.equal(new Set(urls).size, urls.length);
	assert.ok(urls.every((url) => url.startsWith("https://")));
});

test("source-kind rules prevent ambiguous attribution", () => {
	for (const explainer of VULNERABILITY_EXPLAINERS) {
		if (explainer.sourceKind === "MITRE_CWE") assert.ok(explainer.sourceIds.includes("mitre-cwe"));
		if (explainer.sourceKind === "CISA_DIRECTIVE") assert.ok(explainer.sourceIds.includes("cisa-bod-22-01"));
		if (explainer.sourceKind === "OBSERVATORY_DERIVED") assert.match(getExplainerSourceLabel(explainer), /^DERIVED BY OBSERVATORY/);
	}
});

test("every rendered explainer panel has one trigger and a registry entry", async () => {
	const files = [
		"src/components/cyber/vulnerability/VulnerabilityDashboard.astro",
		"src/components/cyber/CveInspector.astro",
	];
	const source = (await Promise.all(files.map((file) => readFile(file, "utf8")))).join("\n");
	const panels = [...source.matchAll(/data-explainer-panel="([^"]+)"/g)].map((match) => match[1]);
	const triggers = [...source.matchAll(/explainerId="([^"]+)"/g)].map((match) => match[1]);
	const registered = new Set<string>(VULNERABILITY_EXPLAINERS.map((explainer) => explainer.id));
	assert.ok(panels.length > 0);
	assert.deepEqual([...panels].sort(), [...triggers].sort());
	assert.ok(panels.every((id) => registered.has(id)));
	assert.equal(new Set(panels).size, panels.length);
});
