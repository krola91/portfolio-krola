import type { ObservatoryModule } from "../../types/cyber";

export const observatoryModules: ObservatoryModule[] = [
	{
		key: "vulnerabilities",
		index: "01",
		label: "VULNERABILITY INTELLIGENCE",
		status: "online",
		statusLabel: "CISA KEV ONLINE",
	},
	{ key: "actors", index: "02", label: "THREAT ACTOR TRACKING", status: "active", statusLabel: "ACTOR INDEX ONLINE" },
	{ key: "geopolitics", index: "03", label: "GEOPOLITICAL RISK", status: "online", statusLabel: "COUNTRY EXPOSURE" },
	{ index: "04", label: "MALWARE ANALYSIS", status: "queued", statusLabel: "QUEUED" },
];
