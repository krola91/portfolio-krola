import { geoHash, parseGeoRoute } from "../lib/cyber/geopolitical-risk/geo-navigation";
type GlobeController = Awaited<ReturnType<typeof import("./geopolitical-globe").initGeopoliticalGlobe>>;
export function initGeopoliticalRisk(root: HTMLElement) {
  const dashboard = root.querySelector<HTMLElement>("[data-geo-dashboard]")!;
  const dialog = dashboard.querySelector<HTMLDialogElement>("[data-geo-dialog]")!;
  const body = dashboard.querySelector<HTMLElement>("[data-geo-drawer-content]")!;
  const library = dashboard.querySelector<HTMLElement>("[data-geo-profile-library]")!;
  const summaries = JSON.parse(dashboard.dataset.geoSummary ?? "[]") as { countryCode: string; rank: number; reportedIncidents: number }[];
  const countryCodes = summaries.map((item) => item.countryCode);
  const lifecycle = new AbortController(); const options = { signal: lifecycle.signal };
  const announce = (text: string) => { const live = dashboard.querySelector<HTMLElement>("[data-geo-announcement]"); if (live) live.textContent = text; };
  let active = false; let selected: string | null = null; let selectedTab: "attacks" | "defense" = "attacks";
  let returnFocus: HTMLElement | null = null; let selectedContent: HTMLElement | null = null;
  let globe: GlobeController | null = null; let loading: Promise<void> | null = null; let disposed = false; let previousOverflow = "";
  const navigate = (hash: string) => { if (window.location.hash !== hash) window.location.hash = hash; else applyRoute(hash, true); };
  const restoreContent = () => { if (selectedContent && selected) dashboard.querySelector(`[data-geo-profile='${selected}']`)?.append(selectedContent); selectedContent = null; };
  const closeDialog = (restoreFocus: boolean) => {
    if (dialog.open) { dialog.close(); document.body.style.overflow = previousOverflow; }
    restoreContent();
    if (restoreFocus) { const target = returnFocus?.isConnected && !returnFocus.closest("[hidden]") ? returnFocus : dashboard.querySelector<HTMLElement>(`[data-geo-country='${selected}']`); target?.focus({ preventScroll: true }); }
    selected = null;
  };
  const loadGlobe = () => {
    if (loading) return;
    loading = import("./geopolitical-globe").then(async ({ initGeopoliticalGlobe }) => {
      const controller = await initGeopoliticalGlobe(dashboard.querySelector<HTMLElement>("[data-geo-globe]")!, root);
      if (disposed) { controller.dispose(); return; } globe = controller; globe.setActive(active); globe.select(selected, false);
    }).catch(() => { const state = dashboard.querySelector<HTMLElement>("[data-geo-globe-state]"); if (state) state.textContent = "STATIC MAP · SELECT COUNTRIES FROM THE INDEX"; });
  };
  const updateSelection = (code: string | null) => {
    dashboard.querySelectorAll<HTMLElement>(".geo-country-list [data-geo-country]").forEach((row) => { const chosen = row.dataset.geoCountry === code; if (chosen) row.setAttribute("aria-current", "true"); else row.removeAttribute("aria-current"); const label = row.querySelector<HTMLElement>("[data-geo-selection-label]"); if (label) label.textContent = chosen ? "SELECTED" : "EXPLORE"; });
  };
  const applyRoute = (hash: string, focus = true) => {
    if (!active) return;
    const route = parseGeoRoute(hash, countryCodes); const previous = selected;
    const notice = dashboard.querySelector<HTMLElement>("[data-geo-route-notice]"); if (notice) { notice.hidden = !route.invalidCountry; notice.textContent = route.invalidCountry ? "Country unavailable in this edition. Choose one of the eight listed countries." : ""; }
    if (!route.countryCode) { closeDialog(focus); updateSelection(null); globe?.select(null); announce(route.invalidCountry ? "Country unavailable in this edition. Choose one of the eight listed countries." : "Select a country to explore attacks and cyber defense."); return; }
    const summary = summaries.find((item) => item.countryCode === route.countryCode)!;
    if (previous !== route.countryCode || !selectedContent) {
      restoreContent(); selected = route.countryCode; selectedContent = library.querySelector<HTMLElement>(`[data-geo-country-content='${selected}']`)!;
      body.replaceChildren(selectedContent); body.scrollTop = 0;
      const row = dashboard.querySelector<HTMLElement>(`.geo-country-list [data-geo-country='${selected}']`)!;
      const name = row.querySelector("strong")?.textContent ?? selected;
      dashboard.querySelector<HTMLElement>("[data-geo-country-title]")!.textContent = name;
      dashboard.querySelector<HTMLElement>("[data-geo-rank]")!.textContent = String(summary.rank).padStart(2, "0");
      dashboard.querySelector<HTMLElement>("[data-geo-country-total]")!.textContent = `${summary.reportedIncidents} reported incidents / ${dashboard.dataset.geoYear} / EuRepoC`;
      if (!returnFocus || returnFocus.dataset.geoCountry !== selected) returnFocus = row;
      globe?.select(selected, focus); updateSelection(selected);
    }
    selectedTab = route.tab;
    body.querySelectorAll<HTMLButtonElement>("[data-geo-tab]").forEach((tab) => { const chosen = tab.dataset.geoTab === selectedTab; tab.setAttribute("aria-selected", String(chosen)); tab.tabIndex = chosen ? 0 : -1; });
    body.querySelectorAll<HTMLElement>("[data-geo-tabpanel]").forEach((panel) => { panel.hidden = panel.dataset.geoTabpanel !== selectedTab; });
    if (!dialog.open) { previousOverflow = document.body.style.overflow; document.body.style.overflow = "hidden"; dialog.showModal(); dashboard.querySelector<HTMLElement>("[data-geo-close]")?.focus(); }
    else if (focus && previous !== selected) dashboard.querySelector<HTMLElement>("[data-geo-close]")?.focus();
    announce(`${dashboard.querySelector("[data-geo-country-title]")?.textContent}: ${selectedTab === "defense" ? "cyber defense" : "attacks and frequency"}.`);
  };
  root.addEventListener("click", (event) => {
    const target = event.target; if (!(target instanceof Element)) return;
    const select = target.closest<HTMLElement>("[data-geo-country]");
    if (select && active) { event.preventDefault(); returnFocus = select; navigate(geoHash(select.dataset.geoCountry)); return; }
    if (target.closest("[data-geo-close]")) { navigate(geoHash()); return; }
    const tab = target.closest<HTMLButtonElement>("[data-geo-tab]"); if (tab && selected) { navigate(geoHash(selected, tab.dataset.geoTab === "defense" ? "defense" : "attacks")); return; }
    if (target.closest("[data-geo-about-link]")) { event.preventDefault(); openAbout(); }
  }, options);
  const openAbout = () => { const about = dashboard.querySelector<HTMLDetailsElement>("[data-geo-about]")!; about.open = true; about.scrollIntoView({ behavior: "instant", block: "start" }); about.querySelector<HTMLElement>("summary")?.focus(); };
  dialog.addEventListener("cancel", (event) => { event.preventDefault(); navigate(geoHash()); }, options);
  dialog.addEventListener("keydown", (event) => {
    const target = event.target;
    if (target instanceof HTMLButtonElement && target.hasAttribute("data-geo-tab") && ["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) { event.preventDefault(); const tab = event.key === "Home" ? "attacks" : event.key === "End" ? "defense" : selectedTab === "attacks" ? "defense" : "attacks"; navigate(geoHash(selected, tab)); body.querySelector<HTMLButtonElement>(`[data-geo-tab='${tab}']`)?.focus(); }
  }, options);
  const setActive = (value: boolean) => { active = value; if (active) { loadGlobe(); globe?.setActive(true); } else { closeDialog(false); updateSelection(null); globe?.setActive(false); } };
  dashboard.classList.add("geo-enhanced"); library.hidden = true;
  window.addEventListener("pagehide", (event) => { globe?.setActive(false); if (!event.persisted) { disposed = true; lifecycle.abort(); globe?.dispose(); } }, options);
  window.addEventListener("pageshow", () => { if (active) globe?.setActive(true); }, options);
  return { setActive, applyRoute, openAbout, countryCodes };
}
