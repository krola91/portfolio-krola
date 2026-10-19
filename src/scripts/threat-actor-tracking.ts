import { actorHash, actorIndexHash, parseActorRoute } from "../lib/cyber/threat-actors/actor-navigation";
import { DEFAULT_ACTOR_FILTERS, filterActors } from "../lib/cyber/threat-actors/filter-actors";
import type { ActorFilters, ActorSearchRecord } from "../types/threat-actors";

/** Astro owns all content. This controller only changes visibility, URL and focus. */
export function initThreatActorTracking(root: HTMLElement) {
	const lifecycle = new AbortController();
	const query = <T extends Element>(selector: string) => root.querySelector<T>(selector);
	const all = <T extends Element>(selector: string) => [...root.querySelectorAll<T>(selector)];
	const tabs = all<HTMLButtonElement>("[data-actor-tab]");
	const panels = all<HTMLElement>("[data-actor-panel]");
	const dossiers = all<HTMLElement>("[data-actor-dossier]");
	const records = tabs.map((tab) => JSON.parse(tab.dataset.actorSearch ?? "{}") as ActorSearchRecord);
	const knownIds = records.map((record) => record.id);
	const form = query<HTMLFormElement>("[data-actor-filter-form]");
	const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
	let activeModule: "actors" | "vulnerabilities" = "actors";
	let activeId: string | null = null;
	let activeReference: string | null = null;
	let returnFocus: HTMLElement | null = null;
	let calibrated = false;
	let selectedIndexId = knownIds[0] ?? "";
	let availableIds = new Set(knownIds);
	const selectIndex = (id: string) => {
		selectedIndexId = availableIds.has(id) ? id : [...availableIds][0] ?? "";
		tabs.forEach((tab) => { const selected = tab.dataset.actorTab === selectedIndexId; tab.setAttribute("aria-selected", String(selected)); tab.tabIndex = selected ? 0 : -1; tab.disabled = !availableIds.has(tab.dataset.actorTab ?? ""); });
		panels.forEach((panel) => { panel.hidden = panel.dataset.actorPanel !== selectedIndexId; });
		const announcement = query<HTMLElement>("[data-actor-announcement]"); if (announcement && selectedIndexId) announcement.textContent = `Actor record selected: ${records.find((actor) => actor.id === selectedIndexId)?.displayName}.`;
	};
	const timers = new Set<number>();
	const later = (callback: () => void, delay: number) => { const id = window.setTimeout(() => { timers.delete(id); callback(); }, delay); timers.add(id); };
	const behavior = (): ScrollBehavior => reducedMotion.matches || root.classList.contains("motion-off") ? "instant" : "smooth";
	const calibrateIndex = () => {
		const boot = query<HTMLElement>("[data-boot-sequence]");
		if (activeModule !== "actors" || activeId || calibrated || (boot && !boot.classList.contains("is-complete"))) return;
		calibrated = true;
		const grid = query<HTMLElement>("[data-actor-ledger]");
		grid?.classList.add("is-calibrating"); later(() => grid?.classList.remove("is-calibrating"), 1100);
	};
	const readFilters = (): ActorFilters => {
		if (!form) return { ...DEFAULT_ACTOR_FILTERS };
		const data = new FormData(form);
		return { search: String(data.get("search") ?? ""), legal: String(data.get("legal") ?? "all"), classification: String(data.get("classification") ?? "all"), association: String(data.get("association") ?? "all"), activity: String(data.get("activity") ?? "all") };
	};
	const renderFilters = (syncRoute = false) => {
		const filters = readFilters(); const matches = filterActors(records, filters); const visibleIds = new Set(matches.map((actor) => actor.id));
		availableIds = visibleIds; selectIndex(selectedIndexId);
		if (syncRoute && selectedIndexId) window.history.replaceState(window.history.state, "", actorIndexHash(selectedIndexId));
		const summary = query<HTMLElement>("[data-actor-result-summary]"); if (summary) summary.textContent = `${matches.length} of ${records.length} profiles available`;
		const empty = query<HTMLElement>("[data-actor-empty]"); if (empty) empty.hidden = matches.length > 0;
		for (const facet of ["legal", "classification", "association", "activity"] as const) {
			const select = form?.elements.namedItem(facet); if (!(select instanceof HTMLSelectElement)) continue;
			const pool = filterActors(records, { ...filters, [facet]: "all" });
			for (const option of select.options) {
				const label = option.dataset.baseLabel ?? option.textContent ?? option.value; option.dataset.baseLabel = label;
				const count = option.value === "all" ? pool.length : filterActors(pool, { ...DEFAULT_ACTOR_FILTERS, [facet]: option.value }).length;
				option.textContent = `${label} (${count})`; option.disabled = option.value !== "all" && count === 0 && option.value !== select.value;
			}
		}
	};
	const applyRoute = (focus = true) => {
		const route = parseActorRoute(window.location.hash, knownIds); const previousId = activeId; const previousModule = activeModule;
		activeModule = route.module; activeId = route.actorId;
		all<HTMLElement>("[data-module-view]").forEach((view) => { view.hidden = view.dataset.moduleView !== route.module; });
		const reference = !route.actorId && ["actors-methodology", "actors-sources"].includes(route.section ?? "") ? route.section : null;
		const previousReference = activeReference; activeReference = reference;
		const index = query<HTMLElement>("[data-actor-index]"); if (index) index.hidden = route.actorId !== null || reference !== null;
		all<HTMLElement>("[data-actor-reference]").forEach((view) => { view.hidden = view.dataset.actorReference !== reference; });
		if (route.module === "actors" && route.indexActorId) selectIndex(route.indexActorId);
		else if (route.module === "actors" && route.actorId) selectIndex(route.actorId);
		for (const dossier of dossiers) {
			const selected = route.module === "actors" && dossier.dataset.actorDossier === route.actorId; dossier.hidden = !selected;
			if (selected && previousId !== route.actorId && !reducedMotion.matches) { dossier.classList.add("is-opening"); later(() => dossier.classList.remove("is-opening"), 700); }
			for (const link of dossier.querySelectorAll<HTMLAnchorElement>("[data-dossier-section]")) { if (link.dataset.dossierSection === (route.section ?? "overview")) link.setAttribute("aria-current", "location"); else link.removeAttribute("aria-current"); }
		}
		all<HTMLElement>("[data-module-key]").forEach((button) => { const selected = button.dataset.moduleKey === route.module; button.classList.toggle("is-active", selected); if (selected) button.setAttribute("aria-current", "page"); else button.removeAttribute("aria-current"); });
		all<HTMLElement>("[data-source-module]").forEach((element) => { element.hidden = element.dataset.sourceModule !== route.module; });
		const subtitle = query<HTMLElement>("[data-header-subtitle]"); if (subtitle) subtitle.textContent = route.module === "actors" ? "LAB/EXP-002 · Curated actor evidence interface" : "LAB/EXP-001 · CISA KEV evidence interface";
		const skip = query<HTMLAnchorElement>(".skip-link"); if (skip) skip.href = route.module === "actors" ? (route.actorId ? `#dossier-${route.actorId}` : "#actor-index-title") : "#vulnerability-title";
		calibrateIndex();
		const announcement = query<HTMLElement>("[data-actor-announcement]"); if (announcement) announcement.textContent = route.invalidActor ? "Unknown record. Showing the curated actor index." : route.actorId ? `Dossier opened: ${records.find((actor) => actor.id === route.actorId)?.displayName}. Public sourced records only.` : reference ? "Actor reference view opened." : `Actor record selected: ${records.find((actor) => actor.id === selectedIndexId)?.displayName ?? "No matching records"}.`;
		if (route.section) { const targetId = route.actorId ? `${route.actorId}-${route.section}` : route.section; query<HTMLElement>(`[id='${targetId}']`)?.scrollIntoView({ behavior: behavior(), block: "start" }); }
		else if (focus || previousModule !== route.module) window.scrollTo({ top: 0, behavior: "instant" });
		if (focus && (previousId !== route.actorId || previousModule !== route.module || previousReference !== reference)) {
			if (reference) { const heading = query<HTMLElement>(`[data-actor-reference='${reference}'] h2`); heading?.setAttribute("tabindex", "-1"); heading?.focus({ preventScroll: true }); }
			else if (previousId && !route.actorId && !reference && route.module === "actors" && returnFocus?.isConnected && !returnFocus.closest("[hidden]")) { returnFocus.focus({ preventScroll: true }); }
			else query<HTMLElement>(route.actorId ? `#dossier-${route.actorId}` : route.module === "actors" ? "#actor-index-title" : "#vulnerability-title")?.focus({ preventScroll: true });
		}
	};
	const navigate = (hash: string) => { if (window.location.hash === hash) applyRoute(true); else window.location.hash = hash; };
	const searchActors = () => { navigate("#actors"); later(() => { const popup = query<HTMLDetailsElement>("[data-actor-filter-popup]"); if (popup) popup.open = true; query<HTMLInputElement>("[data-actor-search-input]")?.focus({ preventScroll: true }); }, 80); };
	root.addEventListener("click", (event) => {
		const target = event.target; if (!(target instanceof Element)) return;
		const skip = target.closest<HTMLAnchorElement>(".skip-link");
		if (skip) { event.preventDefault(); const heading = query<HTMLElement>(skip.hash); heading?.scrollIntoView({ block: "start", behavior: "instant" }); heading?.focus({ preventScroll: true }); return; }
		const module = target.closest<HTMLElement>("[data-module-key]"); if (module?.dataset.moduleKey) { navigate(`#${module.dataset.moduleKey}`); return; }
		const tab = target.closest<HTMLButtonElement>("[data-actor-tab]"); if (tab && !tab.disabled) { navigate(actorIndexHash(tab.dataset.actorTab ?? "")); return; }
		const open = target.closest<HTMLAnchorElement>("[data-actor-open]"); if (open && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.button === 0) returnFocus = open;
		const popup = query<HTMLDetailsElement>("[data-actor-filter-popup]"); if (popup?.open && !target.closest("[data-actor-filter-popup]")) popup.open = false;
	}, { signal: lifecycle.signal });
	root.addEventListener("keydown", (event) => {
		const target = event.target;
		if (event.key === " " && target instanceof HTMLAnchorElement && target.hasAttribute("data-actor-open")) { event.preventDefault(); returnFocus = target; navigate(target.hash); }
		if (target instanceof HTMLButtonElement && target.hasAttribute("data-actor-tab") && ["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
			event.preventDefault(); const enabled = tabs.filter((tab) => !tab.disabled); const current = enabled.indexOf(target);
			const next = event.key === "Home" ? enabled[0] : event.key === "End" ? enabled.at(-1) : enabled[(current + (event.key === "ArrowRight" ? 1 : -1) + enabled.length) % enabled.length];
			if (next) { navigate(actorIndexHash(next.dataset.actorTab ?? "")); next.focus({ preventScroll: true }); }
		}
		if (event.key === "Escape") { const popup = query<HTMLDetailsElement>("[data-actor-filter-popup]"); if (popup?.open) { popup.open = false; popup.querySelector<HTMLElement>("summary")?.focus(); } }
	}, { signal: lifecycle.signal });
	window.addEventListener("hashchange", () => applyRoute(true), { signal: lifecycle.signal });
	form?.addEventListener("submit", (event) => event.preventDefault(), { signal: lifecycle.signal });
	form?.addEventListener("input", () => renderFilters(true), { signal: lifecycle.signal });
	form?.addEventListener("change", () => renderFilters(true), { signal: lifecycle.signal });
	form?.addEventListener("reset", () => later(() => renderFilters(true), 0), { signal: lifecycle.signal });
	query<HTMLButtonElement>("[data-actor-empty-reset]")?.addEventListener("click", () => form?.reset(), { signal: lifecycle.signal });
	root.addEventListener("observatory-ready", calibrateIndex, { signal: lifecycle.signal });
	window.addEventListener("pagehide", (event) => { timers.forEach((id) => window.clearTimeout(id)); timers.clear(); if (!event.persisted) lifecycle.abort(); });
	renderFilters(); applyRoute(false);
	return {
		getActiveModule: () => activeModule,
		focusSearch: () => activeModule === "actors" ? searchActors() : query<HTMLInputElement>("[data-search-input]")?.focus(),
		runCommand: (command: string): boolean => {
			if (command === "actors" || command === "actor-index") { navigate("#actors"); return true; }
			if (command === "vulnerabilities") { navigate("#vulnerabilities"); return true; }
			if (command === "actor-search") { searchActors(); return true; }
			if (command.startsWith("actor:")) { const id = command.slice(6); if (knownIds.includes(id)) { returnFocus = query<HTMLElement>(`[data-actor-open='${id}']`); navigate(actorHash(id)); } return true; }
			if (command === "module-methodology") { navigate(activeModule === "actors" ? "#actors-methodology" : "#methodology"); return true; }
			if (command === "source-log") { navigate(activeId ? actorHash(activeId, "sources") : "#actors-sources"); return true; }
			return false;
		},
	};
}
