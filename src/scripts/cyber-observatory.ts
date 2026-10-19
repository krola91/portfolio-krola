import datasetJson from "../data/cyber/generated/cisa-kev.json";
import { EDUCATION_SOURCE_BY_ID, getObservatorySourceLabel, OBSERVATORY_EXPLAINER_BY_ID } from "../data/cyber/observatory-explainers";
import { initThreatActorTracking } from "./threat-actor-tracking";
import { groupByYear, rankByLabel, rankCwes } from "../lib/cyber/aggregate-vulnerabilities";
import { filterVulnerabilities } from "../lib/cyber/filter-vulnerabilities";
import type { KevDataset, ObservatoryVulnerability, TimelineRange, VulnerabilityFilters } from "../types/cyber";

const root = document.querySelector<HTMLElement>("[data-observatory]");
const dataset = datasetJson as KevDataset;

if (root && dataset) {
	const actorNavigation = initThreatActorTracking(root);
	const records = dataset.vulnerabilities;
	const byId = new Map(records.map((record) => [record.id, record]));
	const datasetNow = new Date(dataset.metadata.dateReleased);
	const ranges: TimelineRange[] = ["7D", "30D", "90D", "1Y", "ALL"];
	const PAGE_SIZE = 40;
	let activeRange: TimelineRange = "ALL";
	let currentPage = 1;
	let toastTimer = 0;
	let inspectorReturnFocus: HTMLElement | null = null;

	const query = <T extends Element>(selector: string, scope: ParentNode = root) => scope.querySelector<T>(selector);
	const queryAll = <T extends Element>(selector: string, scope: ParentNode = root) => [...scope.querySelectorAll<T>(selector)];
	const formatDate = (value?: string | null) => value
		? new Intl.DateTimeFormat("en", { month: "short", day: "2-digit", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`))
		: "Not listed";
	const element = <K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string) => {
		const node = document.createElement(tag);
		if (className) node.className = className;
		if (text !== undefined) node.textContent = text;
		return node;
	};

	const explainerPopover = query<HTMLElement>("[data-explainer-popover]");
	const explainerBackdrop = query<HTMLElement>("[data-explainer-backdrop]");
	const explainerTriggerHint = query<HTMLElement>("[data-explainer-trigger-hint]");
	const hoverMedia = window.matchMedia("(hover: hover) and (pointer: fine)");
	const mobileMedia = window.matchMedia("(max-width: 640px), (pointer: coarse)");
	let activeExplainerId: string | null = null;
	let activeExplainerPanel: HTMLElement | null = null;
	let activeExplainerTrigger: HTMLButtonElement | null = null;
	let explainerReturnFocus: HTMLButtonElement | null = null;
	let explainerHideTimer = 0;
	let hintHideTimer = 0;
	let hintShowFrame = 0;

	const setExplainerText = (selector: string, value: string) => {
		const target = explainerPopover?.querySelector<HTMLElement>(selector);
		if (target) target.textContent = value;
	};
	const hideExplainerHint = (immediate = false) => {
		window.clearTimeout(hintHideTimer);
		window.cancelAnimationFrame(hintShowFrame);
		hintShowFrame = 0;
		if (!explainerTriggerHint) return;
		explainerTriggerHint.classList.remove("is-visible");
		if (immediate) explainerTriggerHint.hidden = true;
		else hintHideTimer = window.setTimeout(() => { explainerTriggerHint.hidden = true; }, 140);
	};
	const showExplainerHint = (trigger: HTMLButtonElement) => {
		if (!explainerTriggerHint || activeExplainerId || !hoverMedia.matches) return;
		window.clearTimeout(hintHideTimer);
		explainerTriggerHint.textContent = trigger.dataset.explainerHint ?? "MORE INFO — CLICK TO OPEN";
		explainerTriggerHint.hidden = false;
		const triggerRect = trigger.getBoundingClientRect();
		const hintWidth = explainerTriggerHint.offsetWidth;
		const placeLeft = triggerRect.left >= hintWidth + 18;
		explainerTriggerHint.dataset.placement = placeLeft ? "left" : "right";
		explainerTriggerHint.style.left = `${placeLeft ? triggerRect.left - 9 : triggerRect.right + 9}px`;
		explainerTriggerHint.style.top = `${Math.min(window.innerHeight - 24, Math.max(24, triggerRect.top + triggerRect.height / 2))}px`;
		hintShowFrame = requestAnimationFrame(() => {
			hintShowFrame = 0;
			if (!explainerTriggerHint.hidden) explainerTriggerHint.classList.add("is-visible");
		});
	};
	const positionExplainer = () => {
		if (!explainerPopover || explainerPopover.hidden || !activeExplainerPanel) return;
		const isMobile = mobileMedia.matches;
		explainerPopover.classList.toggle("is-mobile", isMobile);
		if (isMobile) {
			explainerPopover.style.removeProperty("left");
			explainerPopover.style.removeProperty("top");
			explainerPopover.dataset.placement = "bottom";
			return;
		}
		explainerPopover.style.left = "50%";
		explainerPopover.style.top = "50%";
		explainerPopover.dataset.placement = "center";
	};
	const renderExplainerSources = (sourceIds: readonly string[]) => {
		const sourceNav = explainerPopover?.querySelector<HTMLElement>("[data-explainer-sources]");
		if (!sourceNav) return;
		sourceNav.replaceChildren();
		sourceNav.hidden = false;
		for (const sourceId of sourceIds) {
			const source = EDUCATION_SOURCE_BY_ID.get(sourceId);
			if (!source) continue;
			const link = element("a", undefined, `${source.label} ↗`);
			link.href = source.url;
			link.target = "_blank";
			link.rel = "noreferrer";
			sourceNav.append(link);
		}
	};
	const closeExplainer = () => {
		window.clearTimeout(explainerHideTimer);
		const focusTarget = explainerReturnFocus;
		activeExplainerPanel?.classList.remove("is-explained");
		activeExplainerTrigger?.setAttribute("aria-expanded", "false");
		activeExplainerId = null;
		activeExplainerPanel = null;
		activeExplainerTrigger = null;
		explainerReturnFocus = null;
		if (explainerBackdrop) {
			explainerBackdrop.hidden = true;
		}
		if (!explainerPopover) return;
		explainerPopover.classList.remove("is-open", "is-pinned", "is-mobile");
		explainerPopover.setAttribute("aria-hidden", "true");
		explainerHideTimer = window.setTimeout(() => {
			if (!activeExplainerId) explainerPopover.hidden = true;
		}, 180);
		focusTarget?.focus({ preventScroll: true });
		// Returning focus fires focusin on the info trigger; keep that accessible
		// focus without reopening the visual hover hint after the modal closes.
		hideExplainerHint(true);
	};
	const openExplainer = (id: string, panel: HTMLElement, trigger: HTMLButtonElement) => {
		const explainer = OBSERVATORY_EXPLAINER_BY_ID.get(id);
		if (!explainer || !explainerPopover) return;
		window.clearTimeout(explainerHideTimer);
		hideExplainerHint(true);
		activeExplainerPanel?.classList.remove("is-explained");
		activeExplainerTrigger?.setAttribute("aria-expanded", "false");
		activeExplainerId = id;
		activeExplainerPanel = panel;
		activeExplainerTrigger = trigger;
		explainerReturnFocus = trigger;
		activeExplainerPanel.classList.add("is-explained");
		activeExplainerTrigger?.setAttribute("aria-expanded", "true");
		setExplainerText("[data-explainer-index]", `CONCEPT // ${explainer.conceptNumber}`);
		setExplainerText("[data-explainer-title]", explainer.title);
		setExplainerText("[data-explainer-definition]", explainer.shortDefinition);
		setExplainerText("[data-explainer-purpose]", explainer.purpose);
		setExplainerText("[data-explainer-reading]", explainer.howToRead);
		setExplainerText("[data-explainer-limit]", explainer.limitation);
		setExplainerText("[data-explainer-attribution]", getObservatorySourceLabel(explainer));
		renderExplainerSources(explainer.sourceIds);
		explainerPopover.dataset.tone = explainer.tone ?? "neutral";
		explainerPopover.hidden = false;
		explainerPopover.setAttribute("aria-hidden", "false");
		explainerPopover.classList.add("is-pinned");
		if (explainerBackdrop) explainerBackdrop.hidden = false;
		positionExplainer();
		requestAnimationFrame(() => {
			explainerPopover.classList.add("is-open");
			positionExplainer();
			explainerPopover.querySelector<HTMLButtonElement>("[data-explainer-close]")?.focus();
		});
	};
	const explainerResizeObserver = "ResizeObserver" in window ? new ResizeObserver(positionExplainer) : null;
	if (explainerPopover) explainerResizeObserver?.observe(explainerPopover);
	window.addEventListener("resize", positionExplainer, { passive: true });
	const handleExplainerScroll = () => {
		positionExplainer();
		hideExplainerHint(true);
	};
	window.addEventListener("scroll", handleExplainerScroll, { passive: true, capture: true });
	root.addEventListener("pointerover", (event) => {
		const trigger = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-explainer-trigger]");
		if (trigger && !trigger.contains(event.relatedTarget as Node | null)) showExplainerHint(trigger);
	});
	root.addEventListener("pointerout", (event) => {
		const trigger = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-explainer-trigger]");
		if (trigger && !trigger.contains(event.relatedTarget as Node | null)) hideExplainerHint();
	});
	root.addEventListener("focusin", (event) => {
		const trigger = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-explainer-trigger]");
		if (trigger) showExplainerHint(trigger);
	});
	root.addEventListener("focusout", (event) => {
		if ((event.target as HTMLElement).closest("[data-explainer-trigger]")) hideExplainerHint();
	});
	root.addEventListener("click", (event) => {
		const trigger = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-explainer-trigger]");
		if (!trigger) return;
		event.stopPropagation();
		const id = trigger.dataset.explainerTrigger ?? "";
		const panel = trigger.closest<HTMLElement>("[data-explainer-panel]");
		if (!panel) return;
		if (activeExplainerId === id) return;
		openExplainer(id, panel, trigger);
	});
	explainerPopover?.querySelector<HTMLButtonElement>("[data-explainer-close]")?.addEventListener("click", closeExplainer);
	window.addEventListener("pagehide", () => {
		window.clearTimeout(explainerHideTimer);
		window.clearTimeout(hintHideTimer);
		window.cancelAnimationFrame(hintShowFrame);
		explainerResizeObserver?.disconnect();
		window.removeEventListener("resize", positionExplainer);
		window.removeEventListener("scroll", handleExplainerScroll, true);
	}, { once: true });

	const showToast = (message: string) => {
		const toast = query<HTMLElement>("[data-system-toast]");
		if (!toast) return;
		window.clearTimeout(toastTimer);
		toast.textContent = message;
		toast.hidden = false;
		toastTimer = window.setTimeout(() => { toast.hidden = true; }, 3600);
	};

	const boot = query<HTMLElement>("[data-boot-sequence]");
	const completeBoot = () => {
		if (!boot || boot.classList.contains("is-complete")) return;
		boot.classList.add("is-complete");
		root.dispatchEvent(new Event("observatory-ready"));
		try { sessionStorage.setItem("cyber-observatory-booted", "1"); } catch { /* optional storage */ }
	};
	if (boot) {
		let hasBooted = false;
		try { hasBooted = sessionStorage.getItem("cyber-observatory-booted") === "1"; } catch { /* optional storage */ }
		if (hasBooted || window.matchMedia("(prefers-reduced-motion: reduce)").matches) completeBoot();
		else {
			const progress = query<HTMLElement>("[data-boot-progress]", boot);
			const message = query<HTMLElement>("[data-boot-message]", boot);
			const messages = ["VERIFYING LOCAL EVIDENCE REGISTRIES...", "INDEXING ACTOR DOSSIERS AND KEV EVIDENCE...", "CHECKING CLAIM PROVENANCE...", "OBSERVATORY READY"];
			messages.forEach((text, index) => window.setTimeout(() => {
				query<HTMLElement>(`[data-boot-step="${index}"]`, boot)?.classList.add("is-ready");
				if (message) message.textContent = text;
				if (progress) progress.style.width = `${((index + 1) / messages.length) * 100}%`;
				if (index === messages.length - 1) window.setTimeout(completeBoot, 260);
			}, 280 + index * 300));
		}
		query<HTMLButtonElement>("[data-boot-skip]", boot)?.addEventListener("click", completeBoot);
	}

	const clock = query<HTMLElement>("[data-utc-clock]");
	const updateClock = () => { if (clock) clock.textContent = `UTC ${new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone: "UTC" }).format(new Date())}`; };
	updateClock();
	const clockTimer = window.setInterval(updateClock, 1000);
	window.addEventListener("pagehide", () => window.clearInterval(clockTimer), { once: true });

	queryAll<HTMLButtonElement>("[data-module-status]").forEach((button) => button.addEventListener("click", () => {
		if (!button.dataset.moduleKey) showToast(`${button.dataset.moduleLabel ?? "MODULE"} // ${button.dataset.moduleStatus?.toUpperCase()}`);
	}));

	const form = query<HTMLFormElement>("[data-filter-form]");
	const tableBody = query<HTMLTableSectionElement>("[data-records-body]");
	const readFilters = (): VulnerabilityFilters => {
		const values = new FormData(form ?? undefined);
		return {
			search: String(values.get("search") ?? ""),
			range: activeRange,
			vendor: String(values.get("vendor") ?? "all"),
			product: String(values.get("product") ?? "all"),
			ransomware: String(values.get("ransomware") ?? "all") as VulnerabilityFilters["ransomware"],
			cwe: String(values.get("cwe") ?? "all"),
			dueDate: String(values.get("dueDate") ?? "all") as VulnerabilityFilters["dueDate"],
			sort: String(values.get("sort") ?? "date-desc") as VulnerabilityFilters["sort"],
		};
	};
	type FacetName = "vendor" | "product" | "ransomware" | "cwe" | "dueDate";
	const facetPool = (filters: VulnerabilityFilters, facet: FacetName) => {
		const relaxed = { ...filters };
		if (facet === "vendor") relaxed.vendor = "all";
		if (facet === "product") relaxed.product = "all";
		if (facet === "ransomware") relaxed.ransomware = "all";
		if (facet === "cwe") relaxed.cwe = "all";
		if (facet === "dueDate") relaxed.dueDate = "all";
		return filterVulnerabilities(records, relaxed, datasetNow);
	};
	const facetMatch = (record: ObservatoryVulnerability, facet: FacetName, value: string) => {
		if (facet === "vendor") return record.vendor === value;
		if (facet === "product") return record.product === value;
		if (facet === "ransomware") return record.knownRansomwareUse === value;
		if (facet === "cwe") return record.cwes.includes(value);
		const today = Date.UTC(datasetNow.getUTCFullYear(), datasetNow.getUTCMonth(), datasetNow.getUTCDate());
		const due = record.remediationDueDate ? Date.parse(`${record.remediationDueDate}T00:00:00Z`) : null;
		if (value === "upcoming") return due !== null && due >= today;
		if (value === "overdue") return due !== null && due < today;
		return value === "no-due" && due === null;
	};
	const syncFacetOptions = (filters: VulnerabilityFilters) => {
		for (const facet of ["vendor", "product", "ransomware", "cwe", "dueDate"] as const) {
			const select = form?.elements.namedItem(facet);
			if (!(select instanceof HTMLSelectElement)) continue;
			const pool = facetPool(filters, facet);
			for (const option of select.options) {
				const baseLabel = option.dataset.baseLabel ?? option.textContent ?? option.value;
				option.dataset.baseLabel = baseLabel;
				const count = option.value === "all" ? pool.length : pool.filter((record) => facetMatch(record, facet, option.value)).length;
				option.textContent = `${baseLabel} (${count})`;
				option.disabled = option.value !== "all" && count === 0 && option.value !== select.value;
			}
			select.dataset.empty = String(pool.length === 0);
		}
	};
	const setMetric = (name: string, value: number) => { const target = query<HTMLElement>(`[data-metric="${name}"]`); if (target) target.textContent = value.toLocaleString("en"); };

	const renderRanking = (selector: string, items: Array<{ label: string; count: number }>, mode: "list" | "bars") => {
		const target = query<HTMLElement>(selector);
		if (!target) return;
		target.replaceChildren();
		const max = Math.max(items[0]?.count ?? 1, 1);
		if (!items.length) { target.append(element("p", "empty-inline", "No signals in range")); return; }
		for (const item of items) {
			if (mode === "list") {
				const row = element("li"); const label = element("span", undefined, item.label); const bar = element("i"); bar.style.setProperty("--bar", `${(item.count / max) * 100}%`); label.append(bar); row.append(label, element("strong", undefined, String(item.count))); target.append(row);
			} else {
				const row = element("div", "category-bar"); const bar = element("i"); bar.style.setProperty("--bar", `${(item.count / max) * 100}%`); row.append(element("span", undefined, item.label), element("strong", undefined, String(item.count)), bar); target.append(row);
			}
		}
	};

	const renderFeed = (visible: ObservatoryVulnerability[]) => {
		const target = query<HTMLElement>("[data-recent-feed]");
		if (!target) return;
		target.replaceChildren();
		const feed = visible.slice(0, 4);
		if (!feed.length) { const item = element("li"); item.append(element("strong", undefined, "No signals in range"), element("span", undefined, "Adjust the observation window")); target.append(item); return; }
		for (const record of feed) { const item = element("li"); item.append(element("strong", undefined, `${record.cveId} / ${record.vendor}`), element("span", undefined, `${record.product} · ${formatDate(record.dateAdded)}`)); target.append(item); }
	};

	const renderRatio = (visible: ObservatoryVulnerability[]) => {
		const known = visible.filter((record) => record.knownRansomwareUse === "known").length;
		const percent = visible.length ? Math.round((known / visible.length) * 100) : 0;
		query<HTMLElement>("[data-ratio-dial]")?.style.setProperty("--ratio", `${percent * 3.6}deg`);
		const value = query<HTMLElement>("[data-ratio-value]"); const count = query<HTMLElement>("[data-ratio-count]");
		if (value) value.textContent = `${percent}%`; if (count) count.textContent = `${known}/${visible.length}`;
	};

	const renderTimeline = (visible: ObservatoryVulnerability[]) => {
		const oldest = records.at(-1)?.dateAdded ?? dataset.metadata.dateReleased.slice(0, 10);
		const start = activeRange === "ALL" ? new Date(`${oldest}T00:00:00Z`) : new Date(datasetNow.getTime() - ({ "7D": 7, "30D": 30, "90D": 90, "1Y": 365 }[activeRange] ?? 0) * 86_400_000);
		const end = datasetNow;
		const buckets = Array.from({ length: 12 }, () => 0);
		const span = Math.max(end.getTime() - start.getTime(), 1);
		for (const record of visible) {
			const offset = (Date.parse(`${record.dateAdded}T00:00:00Z`) - start.getTime()) / span;
			if (offset >= 0 && offset <= 1) buckets[Math.min(11, Math.floor(offset * 12))] += 1;
		}
		const max = Math.max(...buckets, 1);
		const points = buckets.map((count, index) => ({ x: 32 + (548 / 11) * index, y: 158 - (count / max) * 124 }));
		const pointString = points.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
		query<SVGPolylineElement>("[data-timeline-line]")?.setAttribute("points", pointString);
		query<SVGPathElement>("[data-timeline-area]")?.setAttribute("d", `M32 158 L${pointString.replaceAll(" ", " L")} L580 158 Z`);
		const group = query<SVGGElement>("[data-timeline-points]");
		if (group) { group.replaceChildren(); for (const point of points) { const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle"); circle.setAttribute("class", "timeline-point"); circle.setAttribute("cx", String(point.x)); circle.setAttribute("cy", String(point.y)); circle.setAttribute("r", "3.5"); group.append(circle); } }
		const startLabel = query<HTMLElement>("[data-range-start]"); const endLabel = query<HTMLElement>("[data-range-end]");
		const monthYear = new Intl.DateTimeFormat("en", { month: "short", year: "numeric", timeZone: "UTC" });
		if (startLabel) startLabel.textContent = monthYear.format(start); if (endLabel) endLabel.textContent = monthYear.format(end);
	};

	const addCell = (row: HTMLTableRowElement, label: string, nodes: Array<Node | string>) => { const cell = element("td"); cell.dataset.label = label; cell.append(...nodes); row.append(cell); };
	const renderRows = (visible: ObservatoryVulnerability[]) => {
		if (!tableBody) return;
		tableBody.replaceChildren();
		const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
		currentPage = Math.min(currentPage, totalPages);
		const page = visible.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
		for (const record of page) {
			const row = element("tr"); row.dataset.recordId = record.id;
			const inspect = element("button", "cve-link", record.cveId); inspect.type = "button"; inspect.dataset.inspectId = record.id;
			addCell(row, "CVE", [inspect]); addCell(row, "Vendor", [element("strong", undefined, record.vendor)]); addCell(row, "Product", [element("span", undefined, record.product)]); addCell(row, "Vulnerability", [element("strong", undefined, record.name)]);
			const added = element("time", undefined, formatDate(record.dateAdded)); added.dateTime = record.dateAdded; addCell(row, "Date added", [added]);
			addCell(row, "Ransomware", [element("span", `binary-signal${record.knownRansomwareUse === "known" ? " is-positive" : ""}`, record.knownRansomwareUse === "known" ? "Known use" : "Unknown / not confirmed")]);
			const due = element("time", undefined, formatDate(record.remediationDueDate)); if (record.remediationDueDate) due.dateTime = record.remediationDueDate; addCell(row, "Due date / CWE", [due, element("span", undefined, record.cwes.join(" · ") || "CWE not listed")]);
			tableBody.append(row);
		}
		const pageSummary = query<HTMLElement>("[data-page-summary]"); if (pageSummary) pageSummary.textContent = visible.length ? `Page ${currentPage} / ${totalPages} · ${visible.length.toLocaleString("en")} records` : "0 records · adjust filters";
		const previous = query<HTMLButtonElement>("[data-page-prev]"); const next = query<HTMLButtonElement>("[data-page-next]"); if (previous) previous.disabled = currentPage <= 1; if (next) next.disabled = currentPage >= totalPages;
	};

	let lastVisible = records;
	const render = () => {
		const filters = readFilters();
		const visible = filterVulnerabilities(records, filters, datasetNow);
		lastVisible = visible;
		syncFacetOptions(filters);
		setMetric("visible", visible.length);
		setMetric("added30", visible.filter((item) => datasetNow.getTime() - Date.parse(`${item.dateAdded}T00:00:00Z`) <= 30 * 86_400_000).length);
		setMetric("ransomware", visible.filter((item) => item.knownRansomwareUse === "known").length);
		const today = Date.UTC(datasetNow.getUTCFullYear(), datasetNow.getUTCMonth(), datasetNow.getUTCDate());
		setMetric("dueSoon", visible.filter((item) => { const due = item.remediationDueDate ? Date.parse(`${item.remediationDueDate}T00:00:00Z`) : NaN; return due >= today && due <= today + 30 * 86_400_000; }).length);
		setMetric("overdue", visible.filter((item) => { const due = item.remediationDueDate ? Date.parse(`${item.remediationDueDate}T00:00:00Z`) : NaN; return due < today; }).length);
		const summary = query<HTMLElement>("[data-result-summary]"); if (summary) summary.textContent = `${visible.length.toLocaleString("en")} of ${records.length.toLocaleString("en")} records visible`;
		const empty = query<HTMLElement>("[data-empty-state]"); if (empty) empty.hidden = visible.length > 0;
		renderRows(visible); renderRanking("[data-vendor-ranking]", rankByLabel(visible, "vendor", 5), "list"); renderRanking("[data-product-ranking]", rankByLabel(visible, "product", 5), "list"); renderRanking("[data-category-bars]", rankCwes(visible, 6), "bars"); renderRanking("[data-year-bars]", groupByYear(visible).map(({ period, count }) => ({ label: period, count })), "bars"); renderFeed(visible); renderRatio(visible); renderTimeline(visible);
	};

	form?.addEventListener("input", () => { currentPage = 1; render(); });
	form?.addEventListener("change", () => { currentPage = 1; render(); });
	form?.addEventListener("reset", () => { window.setTimeout(() => { currentPage = 1; render(); }); });
	query<HTMLButtonElement>("[data-page-prev]")?.addEventListener("click", () => { currentPage = Math.max(1, currentPage - 1); renderRows(lastVisible); query<HTMLElement>("#records")?.scrollIntoView({ behavior: "smooth" }); });
	query<HTMLButtonElement>("[data-page-next]")?.addEventListener("click", () => { currentPage += 1; renderRows(lastVisible); query<HTMLElement>("#records")?.scrollIntoView({ behavior: "smooth" }); });
	const setRange = (range: TimelineRange) => { activeRange = range; currentPage = 1; queryAll<HTMLButtonElement>("[data-range]").forEach((button) => button.classList.toggle("is-active", button.dataset.range === range)); const scrubber = query<HTMLInputElement>("[data-time-scrubber]"); if (scrubber) scrubber.value = String(ranges.indexOf(range)); render(); };
	queryAll<HTMLButtonElement>("[data-range]").forEach((button) => button.addEventListener("click", () => setRange(button.dataset.range as TimelineRange)));
	query<HTMLInputElement>("[data-time-scrubber]")?.addEventListener("input", (event) => setRange(ranges[Number((event.currentTarget as HTMLInputElement).value)]));

	const inspector = query<HTMLElement>("[data-inspector]"); const backdrop = query<HTMLElement>("[data-inspector-backdrop]");
	const setInspectorText = (selector: string, value: string) => { const target = query<HTMLElement>(selector); if (target) target.textContent = value; };
	const closeInspector = () => { if (!inspector) return; inspector.classList.remove("is-open"); inspector.setAttribute("aria-hidden", "true"); if (backdrop) backdrop.hidden = true; document.body.style.removeProperty("overflow"); inspectorReturnFocus?.focus(); };
	const openInspector = (id: string, trigger?: HTMLElement) => {
		const record = byId.get(id); if (!record || !inspector) return; inspectorReturnFocus = trigger ?? null;
		setInspectorText("[data-inspector-cve]", record.cveId); setInspectorText("[data-inspector-ransomware]", record.knownRansomwareUse === "known" ? "Ransomware: known use" : "Ransomware: unknown / not confirmed"); setInspectorText("[data-inspector-name]", record.name); setInspectorText("[data-inspector-description]", record.description); setInspectorText("[data-inspector-vendor]", record.vendor); setInspectorText("[data-inspector-product]", record.product); setInspectorText("[data-inspector-added]", formatDate(record.dateAdded)); setInspectorText("[data-inspector-due]", formatDate(record.remediationDueDate)); setInspectorText("[data-inspector-cwes]", record.cwes.join(" · ") || "Not listed by CISA"); setInspectorText("[data-inspector-action]", record.requiredAction); setInspectorText("[data-inspector-notes]", record.notes || "No notes listed by CISA");
		inspector.classList.add("is-open"); inspector.setAttribute("aria-hidden", "false"); if (backdrop) backdrop.hidden = false; document.body.style.overflow = "hidden"; query<HTMLButtonElement>("[data-inspector-close]")?.focus();
	};
	tableBody?.addEventListener("click", (event) => { const trigger = (event.target as HTMLElement).closest<HTMLElement>("[data-inspect-id]"); if (trigger) openInspector(trigger.dataset.inspectId ?? "", trigger); });
	query<HTMLButtonElement>("[data-inspector-close]")?.addEventListener("click", closeInspector); backdrop?.addEventListener("click", closeInspector);

	const dialog = query<HTMLDialogElement>("[data-command-dialog]"); const commandSearch = query<HTMLInputElement>("[data-command-search]"); const openCommands = () => { if (dialog) { dialog.showModal(); commandSearch?.focus(); } }; const closeCommands = () => { if (dialog?.open) dialog.close(); };
	query<HTMLButtonElement>("[data-command-open]")?.addEventListener("click", openCommands);
	const runCommand = (command: string) => {
		closeCommands();
		if (actorNavigation.runCommand(command)) return;
		if (["overview", "records", "methodology"].includes(command)) window.location.hash = `#${command}`;
		if (command === "search") { window.location.hash = "#records"; window.setTimeout(() => query<HTMLInputElement>("[data-search-input]")?.focus(), 80); }
		if (command === "range-30D" || command === "range-ALL") { actorNavigation.runCommand("vulnerabilities"); setRange(command === "range-30D" ? "30D" : "ALL"); }
		if (command === "motion") { root.classList.toggle("motion-off"); showToast(`AMBIENT MOTION // ${root.classList.contains("motion-off") ? "PAUSED" : "ACTIVE"}`); }
	};
	queryAll<HTMLButtonElement>("[data-command]").forEach((button) => button.addEventListener("click", () => runCommand(button.dataset.command ?? "")));
	commandSearch?.addEventListener("input", () => { const term = commandSearch.value.toLocaleLowerCase("en-US"); queryAll<HTMLButtonElement>("[data-command]").forEach((button) => { button.hidden = !`${button.textContent} ${button.dataset.commandAliases ?? ""}`.toLocaleLowerCase("en-US").includes(term); button.setAttribute("aria-selected", "false"); }); });
	dialog?.addEventListener("keydown", (event) => {
		const options = queryAll<HTMLButtonElement>("[data-command]").filter((button) => !button.hidden);
		if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); const current = options.indexOf(document.activeElement as HTMLButtonElement); const index = event.key === "ArrowDown" ? (current + 1) % options.length : (current < 0 ? options.length - 1 : (current - 1 + options.length) % options.length); options.forEach((button, i) => button.setAttribute("aria-selected", String(i === index))); options[index]?.focus(); }
		if (event.key === "Enter" && event.target === commandSearch) { event.preventDefault(); if (options[0]) runCommand(options[0].dataset.command ?? ""); }
	});
	document.addEventListener("keydown", (event) => {
		if (activeExplainerId && explainerPopover) {
			if (event.key === "Tab") {
				const focusable = queryAll<HTMLElement>('button:not([disabled]), a[href]', explainerPopover).filter((item) => !item.hidden);
				const first = focusable[0];
				const last = focusable.at(-1);
				if (first && last && event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
				else if (first && last && !event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
			}
			return;
		}
		if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); dialog?.open ? closeCommands() : openCommands(); }
		if (event.key === "Escape") closeInspector();
		if (event.key === "/" && !dialog?.open && !(event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement)) { event.preventDefault(); actorNavigation.focusSearch(); }
	});

	if (form && tableBody) render();
}
