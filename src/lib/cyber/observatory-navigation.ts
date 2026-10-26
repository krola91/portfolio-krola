import { parseActorRoute } from "./threat-actors/actor-navigation.ts";
import { parseGeoRoute, geoHash } from "./geopolitical-risk/geo-navigation.ts";
import type { ObservatoryModuleKey } from "../../types/cyber.ts";
import type { initThreatActorTracking } from "../../scripts/threat-actor-tracking";
import type { initGeopoliticalRisk } from "../../scripts/geopolitical-risk";
import { MALWARE_IDS } from "../../types/malware-analysis.ts";
import { malwareHash, parseMalwareRoute } from "./malware-analysis/malware-navigation.ts";
import type { initMalwareAnalysis } from "../../scripts/malware-analysis";

export function parseObservatoryRoute(hash: string, actorIds: readonly string[], countryCodes: readonly string[]) {
  if (/^#?malware(?:\/|$)/.test(hash)) return { module: "malware" as const, ...parseMalwareRoute(hash) };
  return /^#?geopolitics(?:\/|$)/.test(hash) ? { module: "geopolitics" as const, ...parseGeoRoute(hash, countryCodes) } : parseActorRoute(hash, actorIds);
}
export function initObservatoryNavigation(root: HTMLElement, actors: ReturnType<typeof initThreatActorTracking>, geo: ReturnType<typeof initGeopoliticalRisk>, malware: ReturnType<typeof initMalwareAnalysis>) {
  const lifecycle = new AbortController(); const options = { signal: lifecycle.signal }; let activeModule: ObservatoryModuleKey | null = null;
  const rail = root.querySelector<HTMLElement>(".module-nav__rail");
  const centerActiveModule = () => { const button = root.querySelector<HTMLElement>(`[data-module-key='${activeModule}']`); if (rail && button && rail.scrollWidth > rail.clientWidth) { const left = button.getBoundingClientRect().left - rail.getBoundingClientRect().left + rail.scrollLeft; rail.scrollLeft = left - (rail.clientWidth - button.clientWidth) / 2; } };
  const railObserver = new ResizeObserver(centerActiveModule); if (rail) railObserver.observe(rail);
  const subtitles: Record<ObservatoryModuleKey, string> = { actors: "LAB/EXP-002 · Curated actor evidence interface", vulnerabilities: "LAB/EXP-001 · CISA KEV evidence interface", geopolitics: "LAB/EXP-003 · Documented country exposure", malware: "LAB/EXP-004 · Curated malware case archive" };
  const apply = (focus = true) => {
    const route = parseObservatoryRoute(window.location.hash, actors.knownIds, geo.countryCodes); const changed = activeModule !== route.module; activeModule = route.module;
    if (changed) root.dispatchEvent(new CustomEvent("observatory-module-change", { detail: { module: activeModule } }));
    root.querySelectorAll<HTMLElement>("[data-module-view]").forEach((view) => { view.hidden = view.dataset.moduleView !== activeModule; });
    root.querySelectorAll<HTMLElement>("[data-module-key]").forEach((button) => { const selected = button.dataset.moduleKey === activeModule; button.classList.toggle("is-active", selected); if (selected) button.setAttribute("aria-current", "page"); else button.removeAttribute("aria-current"); });
    if (changed) centerActiveModule();
    root.querySelectorAll<HTMLElement>("[data-source-module]").forEach((element) => { element.hidden = element.dataset.sourceModule !== activeModule; });
    const subtitle = root.querySelector<HTMLElement>("[data-header-subtitle]"); if (subtitle) subtitle.textContent = subtitles[activeModule];
    const skip = root.querySelector<HTMLAnchorElement>(".skip-link");
    if (skip) skip.href = route.module === "malware" ? route.caseId ? `#malware-${route.caseId}-title` : "#malware-archive-title" : route.module === "geopolitics" ? "#geopolitics-title" : route.module === "actors" ? route.actorId ? `#dossier-${route.actorId}` : "#actor-index-title" : "#vulnerability-title";
    geo.setActive(activeModule === "geopolitics");
    malware.setActive(activeModule === "malware");
    if (route.module === "malware") {
      actors.deactivate(); malware.applyRoute(window.location.hash, focus);
      if (changed) window.scrollTo({ top: 0, behavior: "instant" });
    } else if (route.module === "geopolitics") {
      actors.deactivate(); geo.applyRoute(window.location.hash, focus);
      if (changed) { window.scrollTo({ top: 0, behavior: "instant" }); if (focus && !route.countryCode) root.querySelector<HTMLElement>("#geopolitics-title")?.focus({ preventScroll: true }); }
    } else actors.applyRoute(window.location.hash, focus);
  };
  const navigate = (hash: string) => { if (window.location.hash === hash) apply(true); else window.location.hash = hash; };
  root.addEventListener("click", (event) => {
    const target = event.target; if (!(target instanceof Element)) return;
    const module = target.closest<HTMLElement>("[data-module-key]"); if (module?.dataset.moduleKey) { navigate(`#${module.dataset.moduleKey}`); return; }
    const skip = target.closest<HTMLAnchorElement>(".skip-link"); if (skip) { event.preventDefault(); const heading = root.querySelector<HTMLElement>(skip.hash); heading?.scrollIntoView({ block: "start", behavior: "instant" }); heading?.focus({ preventScroll: true }); }
  }, options);
  window.addEventListener("hashchange", () => apply(true), options);
  window.addEventListener("pagehide", (event) => { if (!event.persisted) { lifecycle.abort(); railObserver.disconnect(); } }, options);
  apply(false);
  return {
    getActiveModule: () => activeModule,
    focusSearch: () => { if (activeModule === "geopolitics" || activeModule === "malware") return false; actors.focusSearch(); return true; },
    runCommand: (command: string) => {
      if (command === "malware") { navigate(malwareHash()); return true; }
      if (command.startsWith("malware:")) { const id = MALWARE_IDS.find((item) => item === command.slice(8)); if (id) navigate(malwareHash(id)); return true; }
      if (command === "geopolitics" || command === "vulnerabilities") { navigate(`#${command}`); return true; }
      if (command.startsWith("geo:")) { const code = command.slice(4).toUpperCase(); if (geo.countryCodes.includes(code)) navigate(geoHash(code)); return true; }
      if (command === "module-methodology" || command === "methodology") { if (activeModule === "malware") malware.openAbout(); else if (activeModule === "geopolitics") geo.openAbout(); else navigate(activeModule === "actors" ? "#actors-methodology" : "#methodology"); return true; }
      if (command === "source-log" && activeModule === "malware") { malware.openSources(); return true; }
      if (command === "source-log" && activeModule === "geopolitics") { geo.openAbout(); return true; }
      return actors.runCommand(command);
    },
  };
}
