import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { DEFAULT_ORIENTATION, globePixels } from "../lib/cyber/geopolitical-risk/globe-projection.ts";
import { GEO_POSITIONS } from "../data/cyber/geopolitical-risk/country-profiles.ts";
type Ring = number[][]; type Polygon = Ring[];
type Feature = { geometry: { type: "Polygon" | "MultiPolygon"; coordinates: Polygon | Polygon[] } };
const text = await readFile(".cache/geopolitics/natural-earth.geojson", "utf8");
const collection = JSON.parse(text) as { features: Feature[] };
const width = 720; const height = 360; const data = new Uint8Array(width * height / 8);
const inside = (longitude: number, latitude: number, ring: Ring) => {
  let hit = false;
  for (let i = 0, previous = ring.length - 1; i < ring.length; previous = i++) {
    const [x1, y1] = ring[i]; const [x2, y2] = ring[previous];
    if ((y1 > latitude) !== (y2 > latitude) && longitude < (x2 - x1) * (latitude - y1) / (y2 - y1) + x1) hit = !hit;
  }
  return hit;
};
for (const feature of collection.features) {
  const polygons = feature.geometry.type === "Polygon" ? [feature.geometry.coordinates as Polygon] : feature.geometry.coordinates as Polygon[];
  for (const polygon of polygons) {
    const outer = polygon[0]; const xs = outer.map((point) => point[0]); const ys = outer.map((point) => point[1]);
    const x1 = Math.max(0, Math.floor((Math.min(...xs) + 180) / 360 * width)); const x2 = Math.min(width - 1, Math.ceil((Math.max(...xs) + 180) / 360 * width));
    const y1 = Math.max(0, Math.floor((90 - Math.max(...ys)) / 180 * height)); const y2 = Math.min(height - 1, Math.ceil((90 - Math.min(...ys)) / 180 * height));
    for (let y = y1; y <= y2; y++) for (let x = x1; x <= x2; x++) {
      const longitude = (x + 0.5) / width * 360 - 180; const latitude = 90 - (y + 0.5) / height * 180;
      if (inside(longitude, latitude, outer) && !polygon.slice(1).some((hole) => inside(longitude, latitude, hole))) { const index = y * width + x; data[index >> 3] |= 1 << (index & 7); }
    }
  }
}
const directory = "public/geo/geopolitical-risk"; await mkdir(directory, { recursive: true });
await writeFile(`${directory}/land-mask.json`, JSON.stringify({ width, height, bits: Buffer.from(data).toString("base64") }));
await writeFile(`${directory}/positions.json`, JSON.stringify(GEO_POSITIONS));
const size = 280; const pixels = globePixels(size, { width, height, data }, DEFAULT_ORIENTATION); const runs: string[] = [];
for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
  if (pixels[(y * size + x) * 4] < 80) continue; const start = x;
  while (x + 1 < size && pixels[(y * size + x + 1) * 4] > 80) x++;
  runs.push(`M${start} ${y}h${x - start + 1}v1h-${x - start + 1}z`);
}
await writeFile(`${directory}/globe-fallback.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}"><rect width="280" height="280" fill="#030706"/><circle cx="140" cy="140" r="127.4" fill="none" stroke="#91a49d" stroke-opacity=".35" stroke-width=".4"/><path fill="#c6c9c7" d="${runs.join("")}"/></svg>`);
await writeFile(`${directory}/provenance.json`, JSON.stringify({ source: "Natural Earth Admin 0, 1:110m", version: "v5.1.2 repository tag", url: "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_110m_admin_0_countries.geojson", sha256: createHash("sha256").update(text).digest("hex"), license: "Public domain", features: collection.features.length, treatment: "Union of land polygons with holes at 0.5 degrees. No political borders are drawn. Natural Earth de facto geography is context; representative positions are not incident coordinates." }, null, 2));
console.log(`Prepared ${collection.features.length} geographic features, bit-packed mask and Bayer fallback.`);
