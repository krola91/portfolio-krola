export const LEGAL_ASSERTIONS = ["DOCUMENTED", "ALLEGED", "CHARGED", "WANTED", "SANCTIONED", "PLEADED_GUILTY", "CONVICTED", "SENTENCED", "RELEASED", "DECEASED", "UNKNOWN"] as const;
export type LegalAssertion = typeof LEGAL_ASSERTIONS[number];
export type ActorSourceKind = "FBI" | "DOJ" | "COURT" | "NCA" | "OFAC" | "STATE_DEPARTMENT";
export type ActorSource = {
	id: string; kind: ActorSourceKind; organization: string; title: string;
	url: `https://${string}`; publishedAt: string | null; accessedAt: string;
	/** Only a currently published authority notice/case page can establish Wanted. */
	currentWantedNotice?: boolean;
	/** Official reporting of a guilty plea, judgment or sentencing. */
	judicialOutcome?: boolean;
};
export type SourcedClaim = {
	id: string; label: string; value: string; assertion: LegalAssertion; sourceIds: readonly string[];
};
export type ActorAssociation = SourcedClaim & {
	kind: "ALIAS" | "GROUP" | "MALWARE" | "CAMPAIGN" | "SECTOR";
	attribution: "OFFICIALLY_ALLEGED" | "CONFIRMED_BY_CONVICTION" | "SECONDARY_ATTRIBUTION" | "DOCUMENTED_BY_SOURCE";
};
export type ActorOperation = SourcedClaim & { date: string; period: string; };
export type ActorLegalAction = SourcedClaim & {
	date: string | null; jurisdiction: string; charges: string | null;
	outcome: string | null; sentence: string | null; reward: string | null;
};
export type ActorPortrait = {
	localPath: string | null; sourceId: string | null; originalUrl: string | null;
	rightsStatus: "VERIFIED" | "USER_PROVIDED" | "RESTRICTED" | "UNKNOWN"; attribution: string | null; alt: string;
};
export type ThreatActor = {
	id: string; index: number; displayName: string; identitySourceIds: readonly string[];
	aliases: readonly SourcedClaim[]; summary: SourcedClaim;
	/** Narrative paragraphs, each qualified and linked to an official source. */
	story: readonly SourcedClaim[];
	legalStatus: readonly LegalAssertion[]; nationality: SourcedClaim | null;
	classification: SourcedClaim; activities: readonly string[];
	capabilities: readonly SourcedClaim[]; associations: readonly ActorAssociation[];
	operations: readonly ActorOperation[]; footprint: readonly SourcedClaim[];
	documentedImpact: SourcedClaim; legalActions: readonly ActorLegalAction[];
	portrait: ActorPortrait; sourceIds: readonly string[]; lastVerifiedAt: string;
};
export type ActorSearchRecord = {
	id: string; displayName: string; aliases: readonly string[]; legalStatus: readonly LegalAssertion[];
	classification: string; associations: readonly string[]; activities: readonly string[];
};
export type ActorFilters = { search: string; legal: string; classification: string; association: string; activity: string; };
export type ActorRoute = { module: "actors"; actorId: string | null; indexActorId?: string | null; section: string | null; invalidActor: boolean; } | { module: "vulnerabilities"; actorId: null; section: string | null; invalidActor: false; };
