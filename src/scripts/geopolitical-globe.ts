import { DEFAULT_ORIENTATION, globePixels, projectGeo } from "../lib/cyber/geopolitical-risk/globe-projection";
import type { GlobeMask, GlobeOrientation } from "../lib/cyber/geopolitical-risk/globe-projection";
import type { GeoPosition } from "../types/geopolitical-risk";

export async function initGeopoliticalGlobe(host: HTMLElement, root: HTMLElement) {
  const canvas = host.querySelector<HTMLCanvasElement>("[data-geo-canvas]")!;
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) throw new Error("Canvas 2D unavailable");
  const stage = host.querySelector<HTMLElement>("[data-geo-globe-stage]")!;
  const leaders = host.querySelector<SVGSVGElement>("[data-geo-leaders]")!;
  const positions = JSON.parse(host.dataset.geoPositions ?? "[]") as (GeoPosition & { rank: number })[];
  const response = await fetch("/geo/geopolitical-risk/land-mask.json");
  if (!response.ok) throw new Error("Geographic mask unavailable");
  const raw = await response.json() as { width: number; height: number; bits: string };
  if (raw.width !== 720 || raw.height !== 360 || typeof raw.bits !== "string") throw new Error("Invalid geographic mask");
  const mask: GlobeMask = { width: raw.width, height: raw.height, data: Uint8Array.from(atob(raw.bits), (char) => char.charCodeAt(0)) };
  if (mask.data.length !== raw.width * raw.height / 8) throw new Error("Incomplete geographic mask");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let orientation: GlobeOrientation = { ...DEFAULT_ORIENTATION }; let selected: string | null = null;
  let active = false; let disposed = false; let frame = 0; let side = 300; let interaction: AbortController | null = null;
  let pointer: { id: number; x: number; y: number; origin: GlobeOrientation; moved: boolean } | null = null;
  const motionAllowed = () => !reducedMotion.matches && !root.classList.contains("motion-off");
  const labelPositions = () => {
    const visible = positions.map((position) => ({ ...position, projected: projectGeo(position.latitude, position.longitude, orientation) })).filter((position) => position.projected.visible);
    const labels = visible.map((position) => ({ ...position, x: 50 + position.projected.x * 45.5, y: 50 + position.projected.y * 45.5 })).sort((a, b) => Number(b.code === selected) - Number(a.code === selected) || a.rank - b.rank);
    const minimumX = 58 / side * 100; const minimumY = 49 / side * 100;
    const placed: { x: number; y: number }[] = [];
    for (const label of labels) {
      const origin = { x: label.x, y: label.y }; let found = false;
      for (let ring = 0; ring <= 8 && !found; ring++) for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0], [-1, -1], [1, 1], [1, -1], [-1, 1]]) {
        const candidate = { x: Math.min(93, Math.max(7, origin.x + dx * ring * minimumX)), y: Math.min(93, Math.max(7, origin.y + dy * ring * minimumY)) };
        if (placed.every((other) => Math.abs(other.x - candidate.x) >= minimumX || Math.abs(other.y - candidate.y) >= minimumY)) { label.x = candidate.x; label.y = candidate.y; placed.push(candidate); found = true; break; }
      }
    }
    leaders.replaceChildren();
    for (const position of positions) {
      const button = host.querySelector<HTMLButtonElement>(`[data-geo-marker='${position.code}']`)!;
      const label = labels.find((item) => item.code === position.code); button.hidden = !label;
      button.setAttribute("aria-pressed", String(position.code === selected)); if (!label) continue;
      label.x = Math.min(93, Math.max(7, label.x)); label.y = Math.min(93, Math.max(7, label.y));
      button.style.left = `${label.x}%`; button.style.top = `${label.y}%`;
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", String(500 + label.projected.x * 455)); line.setAttribute("y1", String(500 + label.projected.y * 455)); line.setAttribute("x2", String(label.x * 10)); line.setAttribute("y2", String(label.y * 10)); leaders.append(line);
      const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle"); dot.setAttribute("cx", line.getAttribute("x1")!); dot.setAttribute("cy", line.getAttribute("y1")!); dot.setAttribute("r", "3"); leaders.append(dot);
    }
  };
  const draw = () => {
    if (!active || disposed || document.hidden) return;
    const size = Math.max(180, Math.min(340, Math.round(side / 2))); canvas.width = size; canvas.height = size;
    const image = context.createImageData(size, size); image.data.set(globePixels(size, mask, orientation)); context.putImageData(image, 0, 0);
    context.strokeStyle = "rgba(145,164,157,.22)"; context.lineWidth = .45;
    for (const latitude of [-60, -30, 0, 30, 60]) {
      context.beginPath(); let drawing = false;
      for (let longitude = -180; longitude <= 180; longitude += 3) { const point = projectGeo(latitude, longitude, orientation); const x = size * (.5 + point.x * .455); const y = size * (.5 + point.y * .455); if (!point.visible) { drawing = false; continue; } if (!drawing) context.moveTo(x, y); else context.lineTo(x, y); drawing = true; }
      context.stroke();
    }
    for (let longitude = -180; longitude < 180; longitude += 30) {
      context.beginPath(); let drawing = false;
      for (let latitude = -90; latitude <= 90; latitude += 3) { const point = projectGeo(latitude, longitude, orientation); const x = size * (.5 + point.x * .455); const y = size * (.5 + point.y * .455); if (!point.visible) { drawing = false; continue; } if (!drawing) context.moveTo(x, y); else context.lineTo(x, y); drawing = true; }
      context.stroke();
    }
    labelPositions(); host.classList.add("has-globe");
  };
  const scheduleDraw = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(draw); };
  const resize = () => { side = Math.max(180, Math.min(host.clientWidth - 28, host.clientHeight - 101, 700)); stage.style.width = `${side}px`; stage.style.height = `${side}px`; scheduleDraw(); };
  const observer = new ResizeObserver(resize);
  const orient = (target: GlobeOrientation, animate = true) => {
    cancelAnimationFrame(frame);
    if (!active || document.hidden || !motionAllowed() || !animate) { orientation = target; draw(); return; }
    const start = { ...orientation }; let delta = target.longitude - start.longitude; delta = ((delta + 540) % 360) - 180; const began = performance.now();
    const step = (now: number) => { if (!active || disposed || document.hidden) return; const t = Math.min(1, (now - began) / 420); const eased = 1 - (1 - t) ** 3; orientation = { longitude: start.longitude + delta * eased, latitude: start.latitude + (target.latitude - start.latitude) * eased }; draw(); if (t < 1 && motionAllowed()) frame = requestAnimationFrame(step); else { orientation = target; draw(); } };
    frame = requestAnimationFrame(step);
  };
  const setActive = (value: boolean) => {
    if (disposed || active === value) return; active = value; interaction?.abort(); interaction = null; observer.disconnect(); cancelAnimationFrame(frame); pointer = null;
    if (!active) return;
    interaction = new AbortController(); const options = { signal: interaction.signal }; observer.observe(host); resize();
    stage.addEventListener("pointerdown", (event) => { if ((event.target as HTMLElement).closest("button") || event.button !== 0) return; cancelAnimationFrame(frame); pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, origin: { ...orientation }, moved: false }; stage.setPointerCapture(event.pointerId); }, options);
    stage.addEventListener("pointermove", (event) => { if (!pointer || pointer.id !== event.pointerId) return; pointer.moved ||= Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) > 4; orientation = { longitude: pointer.origin.longitude - (event.clientX - pointer.x) * .35, latitude: Math.max(-75, Math.min(75, pointer.origin.latitude + (event.clientY - pointer.y) * .25)) }; scheduleDraw(); }, options);
    const release = () => { pointer = null; }; stage.addEventListener("pointerup", release, options); stage.addEventListener("pointercancel", release, options);
    host.querySelectorAll<HTMLButtonElement>("[data-geo-rotate]").forEach((button) => button.addEventListener("click", () => orient({ ...orientation, longitude: orientation.longitude + Number(button.dataset.geoRotate) * 25 }), options));
    host.querySelector<HTMLButtonElement>("[data-geo-reset]")?.addEventListener("click", () => orient({ ...DEFAULT_ORIENTATION }), options);
    document.addEventListener("visibilitychange", () => { cancelAnimationFrame(frame); if (!document.hidden) draw(); }, options);
    host.querySelector<HTMLElement>("[data-geo-globe-controls]")?.removeAttribute("hidden");
  };
  return {
    setActive,
    select: (code: string | null, animate = true) => { selected = code; const position = positions.find((item) => item.code === code); if (position) orient({ longitude: position.longitude, latitude: Math.max(-60, Math.min(60, position.latitude)) }, animate); else draw(); },
    dispose: () => { setActive(false); disposed = true; },
  };
}
