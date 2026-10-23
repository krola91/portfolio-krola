import type { GeoClaim, GeoCountryProfile, GeoDefenseMeasure, GeoPosition } from "../../../types/geopolitical-risk.ts";
import { GEO_REVIEWED_AT } from "./sources.ts";
export const GEO_POSITIONS: readonly GeoPosition[] = [
  { code: "US", name: "United States", latitude: 38, longitude: -98 },
  { code: "FR", name: "France", latitude: 46.5, longitude: 2.5 },
  { code: "DE", name: "Germany", latitude: 51, longitude: 10.5 },
  { code: "RU", name: "Russia", latitude: 61, longitude: 100 },
  { code: "GB", name: "United Kingdom", latitude: 55, longitude: -3 },
  { code: "ES", name: "Spain", latitude: 40, longitude: -3.5 },
  { code: "CA", name: "Canada", latitude: 57, longitude: -106 },
  { code: "IT", name: "Italy", latitude: 42.5, longitude: 12.5 },
];
const claim = (text: string, sourceId: string, locator?: string): GeoClaim => ({ text, references: [{ sourceId, ...(locator ? { locator } : {}) }] });
const measure = (text: string, sourceId: string, scope: string, kind: GeoDefenseMeasure["kind"] = "documented-program"): GeoDefenseMeasure => ({ ...claim(text, sourceId), scope, kind });
const attackTypes = (code: string): GeoCountryProfile["attackTypes"] => [
  ["ransomware", "Ransomware", "Recorded cases involve malware used to deny access to systems or data and demand payment. Data theft can accompany the disruption."],
  ["disruption", "Service disruption", "Recorded incidents interrupt access to digital services. This category covers availability impacts; it does not identify every case as DDoS."],
  ["data-theft", "Data theft", "Recorded intrusions take information from affected systems. Theft can expose sensitive records even when services remain available."],
  ["hijacking-with-misuse", "System compromise", "The source records unauthorized control followed by misuse. This describes an observed incident category, not a claim about the attacker's nationality."],
].map(([id, label, text]) => ({ id, label, explanation: claim(text, "eurepoc-1.3.2", `2024 receiver country ${code}; incident_type; categories can overlap`) }));
const profile = (countryCode: string, name: string, officialUrl: string, description: string, sourceId: string, defenses: GeoDefenseMeasure[], response: GeoDefenseMeasure[], frequencyContext?: GeoClaim): GeoCountryProfile => ({ countryCode, reviewedAt: GEO_REVIEWED_AT, attackTypes: attackTypes(countryCode), leadAgency: { name, officialUrl, ...claim(description, sourceId) }, defenses, response, ...(frequencyContext ? { frequencyContext } : {}) });
export const GEO_COUNTRY_PROFILES: readonly GeoCountryProfile[] = [
  profile("US", "CISA", "https://www.cisa.gov/", "CISA offers cyber-risk reduction and incident-response guidance for U.S. organizations, coordinating with federal partners and critical-infrastructure stakeholders.", "us-ransomware", [
    measure("Cyber Hygiene vulnerability scanning identifies exposed weaknesses so participating organizations can prioritize remediation.", "us-scanning", "Enrolled organizations; internet-accessible systems."),
    measure("The #StopRansomware Guide recommends patching exposed services, strong authentication and protected backups.", "us-ransomware", "Organizations applying the guide.", "official-guidance"),
  ], [measure("Identify and isolate impacted systems, preserve evidence, and restore services according to the incident-response plan.", "us-ransomware", "Organizations responding to ransomware.", "official-guidance")]),
  profile("FR", "ANSSI / CERT-FR", "https://cert.cyber.gouv.fr/", "CERT-FR is the national and governmental CSIRT. It prevents and handles technical incident impacts, supporting public bodies and essential or vital operators.", "fr-cert", [
    measure("Government security monitoring detects attacks against state information systems.", "fr-cert", "State services benefiting from the monitoring service."),
    measure("Vulnerability watch, technical alerts and information exchange support incident prevention.", "fr-cert", "CERT-FR's defined constituency and partner CSIRTs."),
  ], [measure("CERT-FR analyses incident reports and effects, correlates evidence and helps define recovery solutions with relevant partners.", "fr-cert", "Public bodies and essential/vital operators; individuals and SMEs use Cybermalveillance.gouv.fr.")], claim("ANSSI's 2024 overview separately documents extortion, espionage and destabilization, including DDoS. Its observations have different coverage from this ranking.", "fr-panorama", "Introduction; sections III A–C")),
  profile("DE", "BSI / CERT-Bund", "https://www.bsi.bund.de/", "CERT-Bund and BSI's situation centre assess reported security incidents and provide technical assistance within their respective constituencies.", "de-response", [
    measure("The WID warning service publishes vulnerability, patch and workaround advisories.", "de-wid", "Administrators and recipients of CERT-Bund warnings."),
    measure("Automated CERT-Bund reports notify registered network abuse contacts about exposed or vulnerable services.", "de-reports", "Network operators and hosting providers receiving those reports."),
  ], [measure("An initial assessment guides support; malware analysis, digital forensics and log analysis can support federal and critical-infrastructure cases.", "de-response", "Federal administration and critical infrastructure; assistance depends on remit and case.")]),
  profile("RU", "NKTsKI", "https://cert.gov.ru/", "Russia's National Coordination Center for Computer Incidents coordinates domestic and international incident response involving Russian information resources.", "ru-cert", [
    measure("GosSOPKA information exchange distributes incident indicators, vulnerability information and warnings about emerging threats.", "ru-coordination", "Participating information-resource owners and GosSOPKA subjects."),
    measure("Public bulletins describe software vulnerabilities and recommended mitigations.", "ru-alerts", "Operators of the products identified in each bulletin.", "official-guidance"),
  ], [measure("Resource owners exchange incident information with NKTsKI and can request response assistance through the documented coordination process.", "ru-coordination", "Information resources covered by the coordination framework.")]),
  profile("GB", "NCSC", "https://www.ncsc.gov.uk/", "The NCSC's Active Cyber Defence programme provides prevention and detection services with eligibility defined for each service.", "gb-acd", [
    measure("Protective DNS blocks resolution of known malicious domains and supplies operational logs.", "gb-pdns", "Eligible organizations; public-sector coverage and current eligibility rules apply."),
    measure("Early Warning alerts organizations to malicious activity associated with their registered assets.", "gb-acd", "UK organizations with a static IP address or domain name."),
  ], [measure("Maintain protected backups, limit lateral movement and prepare recovery procedures before a ransomware incident.", "gb-response", "Organizations following NCSC guidance.", "official-guidance")]),
  profile("ES", "INCIBE-CERT / national CSIRT network", "https://www.incibe.es/incibe-cert", "INCIBE-CERT supports citizens and private-sector organizations. Spain's national guide assigns other constituencies to CCN-CERT and the defence CSIRT.", "es-national", [
    measure("INCIBE-CERT combines its detection mechanisms and partner reports to notify affected organizations of threats.", "es-response", "Citizens, SMEs, private entities, digital providers and RedIRIS institutions."),
    measure("RedIRIS incident services include early warning and preventive/reactive response for the academic network.", "es-national", "Spanish research and academic-network institutions."),
  ], [measure("Notify the designated CSIRT; initial analysis opens a case and informs coordinated handling through its response procedure.", "es-response", "INCIBE-CERT's constituency; route public-administration cases to CCN-CERT.")]),
  profile("CA", "Canadian Centre for Cyber Security", "https://www.cyber.gc.ca/", "The Cyber Centre publishes threat assessments, technical guidance and incident-reporting channels to support Canadian cyber resilience.", "ca-playbook", [
    measure("The ransomware playbook recommends MFA, patching, network segmentation and tested backups.", "ca-playbook", "Organizations implementing the playbook.", "official-guidance"),
    measure("Protective DNS is a recommended control; CIRA Canadian Shield is cited as a free option for Canadians.", "ca-playbook", "Users choosing a suitable DNS service; not universal national deployment.", "official-guidance"),
  ], [measure("Isolate affected environments, report incidents to the appropriate authorities and validate systems before restoring clean backups.", "ca-playbook", "Organizations responding to ransomware.", "official-guidance")], claim("The National Cyber Threat Assessment 2025–2026 identifies ransomware, espionage and disruptive activity affecting Canada. It is context, not the ranking's population.", "ca-assessment", "Executive summary; ransomware and hacktivism")),
  profile("IT", "ACN / CSIRT Italia", "https://www.acn.gov.it/", "CSIRT Italia operates within Italy's national cybersecurity agency. Its functions include incident monitoring, warnings, response and cooperation with other CSIRTs.", "it-csirt", [
    measure("National monitoring and early warnings share information on risks and incidents with relevant stakeholders.", "it-csirt", "Stakeholders within CSIRT Italia's national remit."),
    measure("Participation in the CSIRTs Network supports cross-border incident information exchange and cooperation.", "it-csirt", "Designated national CSIRTs and their counterparts."),
  ], [measure("CSIRT Italia provides incident intervention and risk analysis, working with affected stakeholders and private-sector partners.", "it-csirt", "National incident-response constituency; assistance depends on the relevant reporting and coordination framework.")]),
];
