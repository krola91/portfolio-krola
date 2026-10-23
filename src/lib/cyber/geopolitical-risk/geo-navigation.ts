import type { GeoRoute } from "../../../types/geopolitical-risk.ts";
export function parseGeoRoute(hash: string, topCountries: readonly string[]): GeoRoute {
  const [prefix, kind, rawCode, tab, ...extra] = hash.replace(/^#/, "").split("/");
  if (prefix !== "geopolitics" || !kind) return { countryCode: null, tab: "attacks", invalidCountry: !!kind };
  const code = (rawCode ?? "").toUpperCase();
  if (kind !== "country" || !/^[A-Z]{2}$/.test(code) || !topCountries.includes(code) || (tab && tab !== "defense") || extra.length) return { countryCode: null, tab: "attacks", invalidCountry: true };
  return { countryCode: code, tab: tab === "defense" ? "defense" : "attacks", invalidCountry: false };
}
export const geoHash = (code?: string | null, tab: "attacks" | "defense" = "attacks") => code ? `#geopolitics/country/${code.toUpperCase()}${tab === "defense" ? "/defense" : ""}` : "#geopolitics";
