export type TimelineRange = "7D" | "30D" | "90D" | "1Y" | "ALL";
export type KevRansomwareUse = "known" | "unknown";
export type DatasetIntegrity = "verified" | "partial" | "stale" | "unavailable";
export type DueDateFilter = "all" | "upcoming" | "overdue" | "no-due";

export type ExplainerSourceId = "cisa-kev-feed" | "cisa-kev-catalog" | "cisa-bod-22-01" | "mitre-cwe";
export type ExplainerSourceKind = "CISA_FIELD" | "CISA_DEFINITION" | "CISA_DIRECTIVE" | "MITRE_CWE" | "OBSERVATORY_DERIVED";
export type ExplainerTone = "neutral" | "warning" | "critical";

export type VulnerabilityExplainer = {
	id: string;
	conceptNumber: string;
	title: string;
	shortDefinition: string;
	purpose: string;
	howToRead: string;
	limitation: string;
	sourceKind: ExplainerSourceKind;
	sourceIds: readonly ExplainerSourceId[];
	tone?: ExplainerTone;
};

export type ExplainerSource = {
	id: ExplainerSourceId;
	label: string;
	url: `https://${string}`;
};


export type ObservatoryVulnerability = {
	id: string;
	cveId: string;
	vendor: string;
	product: string;
	name: string;
	description: string;
	dateAdded: string;
	remediationDueDate: string | null;
	requiredAction: string;
	knownRansomwareUse: KevRansomwareUse;
	cwes: string[];
	notes: string | null;
};

export type Vulnerability = ObservatoryVulnerability;

export type KevDatasetMetadata = {
	sourceName: string;
	sourceUrl: string;
	catalogVersion: string;
	dateReleased: string;
	syncedAt: string;
	declaredCount: number;
	receivedCount: number;
	sourceValidCount: number;
	retentionLimit: number;
	validCount: number;
	rejectedCount: number;
	duplicateCount: number;
	hash: string;
	integrity: "verified" | "partial";
	newCount: number;
	removedCount: number;
	modifiedCount: number;
	ransomwareStatusChanges: number;
	dueDateChanges: number;
	notesChanges: number;
	requiredActionChanges: number;
	unknownEnumCount: number;
};

export type KevBaseMetrics = {
	total: number;
	ransomwareKnown: number;
	ransomwareUnknown: number;
	added7d: number;
	added30d: number;
	added90d: number;
	added365d: number;
	dueSoon30d: number;
	overdue: number;
};

export type KevDataset = {
	metadata: KevDatasetMetadata;
	baseMetrics: KevBaseMetrics;
	vulnerabilities: ObservatoryVulnerability[];
};

export type VulnerabilityFilters = {
	search: string;
	range: TimelineRange;
	vendor: string;
	product: string;
	ransomware: "all" | KevRansomwareUse;
	cwe: string;
	dueDate: DueDateFilter;
	sort: "date-desc" | "vendor-asc" | "product-asc" | "cve-asc" | "due-asc";
};

export type LandscapeSignal = {
	id: string;
	period: string;
	count: number;
	ransomwareKnown: number;
	dominantVendors: string[];
};

export type ObservatoryModuleKey = "actors" | "vulnerabilities" | "geopolitics" | "malware";
export type ObservatoryModule = {
	key?: ObservatoryModuleKey;
	index: string;
	label: string;
	status: "active" | "online" | "upcoming" | "locked" | "queued";
	statusLabel: string;
};
