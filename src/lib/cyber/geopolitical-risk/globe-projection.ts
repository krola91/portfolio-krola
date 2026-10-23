import { bayerPixel } from "./dither.ts";
export type GlobeOrientation = { longitude: number; latitude: number; };
export type GlobeMask = { width: number; height: number; data: Uint8Array; };
const radians = Math.PI / 180;
export const DEFAULT_ORIENTATION: GlobeOrientation = { longitude: -24, latitude: 22 };
export function projectGeo(latitude: number, longitude: number, orientation: GlobeOrientation) {
  const lat = latitude * radians; const lon = (longitude - orientation.longitude) * radians; const tilt = orientation.latitude * radians;
  const x = Math.cos(lat) * Math.sin(lon);
  const y = Math.sin(lat) * Math.cos(tilt) - Math.cos(lat) * Math.cos(lon) * Math.sin(tilt);
  const depth = Math.sin(lat) * Math.sin(tilt) + Math.cos(lat) * Math.cos(lon) * Math.cos(tilt);
  return { x, y: -y, depth, visible: depth > 0.06 };
}
export const markerHit = (point: ReturnType<typeof projectGeo>, x: number, y: number, tolerance = 0.06) => point.visible && Math.hypot(point.x - x, point.y - y) <= tolerance;
export function globePixels(size: number, mask: GlobeMask, orientation: GlobeOrientation): Uint8ClampedArray {
  const pixels = new Uint8ClampedArray(size * size * 4); const radius = size * 0.455; const center = size / 2;
  const tilt = orientation.latitude * radians; const cosTilt = Math.cos(tilt); const sinTilt = Math.sin(tilt);
  for (let py = 0; py < size; py++) for (let px = 0; px < size; px++) {
    const x = (px - center) / radius; const y = (center - py) / radius; const squared = x * x + y * y; const offset = (py * size + px) * 4;
    pixels[offset] = 3; pixels[offset + 1] = 7; pixels[offset + 2] = 6; pixels[offset + 3] = 255;
    if (squared > 1) continue;
    const z = Math.sqrt(1 - squared); const latitude = Math.asin(y * cosTilt + z * sinTilt) / radians;
    const longitude = ((Math.atan2(x, z * cosTilt - y * sinTilt) / radians + orientation.longitude + 540) % 360) - 180;
    const mx = Math.min(mask.width - 1, Math.max(0, Math.floor((longitude + 180) / 360 * mask.width)));
    const my = Math.min(mask.height - 1, Math.max(0, Math.floor((90 - latitude) / 180 * mask.height)));
    const index = my * mask.width + mx; const land = (mask.data[index >> 3] >> (index & 7)) & 1;
    const illumination = Math.max(0, -x * 0.4 + y * 0.34 + z * 0.82);
    const luminance = land ? 0.14 + illumination * 0.69 : 0;
    if (land && bayerPixel(luminance, px, py)) { const shade = 150 + Math.round(75 * illumination); pixels[offset] = shade; pixels[offset + 1] = shade; pixels[offset + 2] = shade; }
  }
  return pixels;
}
