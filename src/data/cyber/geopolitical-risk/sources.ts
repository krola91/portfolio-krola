import type { GeoSource } from "../../../types/geopolitical-risk.ts";
export const GEO_REVIEWED_AT = "2026-10-23";
const source = (id: string, publisher: string, title: string, url: string, publishedAt: string | null = null, version: string | null = null, licenseId: string | null = null): GeoSource => ({ id, publisher, title, url, publishedAt, version, licenseId, accessedAt: GEO_REVIEWED_AT });
export const GEO_SOURCES: readonly GeoSource[] = [
  source("eurepoc-1.3.2", "EuRepoC / Zettl-Schabath et al.", "Global Dataset of Cyber Incidents", "https://zenodo.org/records/14965395", "2025-03-04", "1.3.2", "CC-BY-NC-4.0"),
  source("eurepoc-method", "EuRepoC", "Methodology and scope", "https://eurepoc.eu/methodology/"),
  source("natural-earth", "Natural Earth / NACIS", "Admin 0 countries, 1:110m", "https://www.naturalearthdata.com/downloads/110m-cultural-vectors/110m-admin-0-countries/", null, "5.1.2 repository tag", "Public domain"),
  source("us-ransomware", "CISA / FBI / NSA / MS-ISAC", "#StopRansomware Guide", "https://www.cisa.gov/stopransomware/ransomware-guide"),
  source("us-scanning", "CISA", "Remediate vulnerabilities in internet-accessible systems", "https://www.cisa.gov/sites/default/files/publications/CISAInsights-Cyber-RemediateVulnerabilitiesforInternetAccessibleSystems_S508C.pdf"),
  source("fr-cert", "ANSSI / CERT-FR", "CERT-FR missions and constituency", "https://cert.cyber.gouv.fr/about-cert-fr/"),
  source("fr-panorama", "ANSSI", "Panorama de la cybermenace 2024", "https://www.cert.ssi.gouv.fr/uploads/CERTFR-2025-CTI-003.pdf", "2025-03-01"),
  source("de-wid", "BSI / CERT-Bund", "Warn- und Informationsdienst", "https://wid.cert-bund.de/portal/wid"),
  source("de-reports", "BSI / CERT-Bund", "CERT-Bund abuse reports FAQ", "https://www.bsi.bund.de/DE/Themen/Unternehmen-und-Organisationen/Cyber-Sicherheitslage/Reaktion/CERT-Bund/FAQ/faq_node.html"),
  source("de-response", "BSI", "Incident support", "https://www.bsi.bund.de/DE/Themen/Unternehmen-und-Organisationen/Cyber-Sicherheitslage/Reaktion/Vorfallunterstuetzung/vorfallsunterstuetzung.html"),
  source("ru-cert", "NKTsKI", "National Coordination Center for Computer Incidents", "https://cert.gov.ru/o-nktski/"),
  source("ru-coordination", "NKTsKI", "Methodological recommendations for information-resource owners", "https://cert.gov.ru/upload/iblock/c91/hqih763y1u7aazkca35phdovst92cdpx/Metodicheskie-rekomendatsii.pdf"),
  source("ru-alerts", "NKTsKI", "Vulnerability and threat bulletins", "https://www.cert.gov.ru/"),
  source("gb-acd", "NCSC", "Active Cyber Defence services and eligibility", "https://www.ncsc.gov.uk/section/active-cyber-defence/services"),
  source("gb-pdns", "NCSC", "Protective Domain Name Service", "https://www.ncsc.gov.uk/information/pdns", "2017-08-17"),
  source("gb-response", "NCSC", "Mitigating malware and ransomware attacks", "https://www.ncsc.gov.uk/guidance/mitigating-malware-and-ransomware-attacks"),
  source("es-response", "INCIBE-CERT", "Cyber-incident management procedures for the private sector", "https://www.incibe.es/sites/default/files/contenidos/guias/doc/incibe-cert_gestion_ciberincidentes_sector_privado.pdf"),
  source("es-national", "Spanish national CSIRTs / INCIBE", "National cyber-incident notification and management guide", "https://www.incibe.es/sites/default/files/contenidos/guias/doc/guia_nacional_notificacion_gestion_ciberincidentes.pdf"),
  source("ca-assessment", "Canadian Centre for Cyber Security", "National Cyber Threat Assessment 2025–2026", "https://www.cyber.gc.ca/en/guidance/national-cyber-threat-assessment-2025-2026", "2024-10-30"),
  source("ca-playbook", "Canadian Centre for Cyber Security", "Ransomware playbook ITSM.00.099", "https://www.cyber.gc.ca/en/guidance/ransomware-playbook-itsm00099"),
  source("it-csirt", "Senato della Repubblica", "ACN and CSIRT Italia: functions and organization", "https://www.senato.it/show-doc?id=1306371&leg=18&part=dossier_dossier1-sezione_sezione14&tipodoc=DOSSIER"),
];
export const GEO_SOURCE_BY_ID = new Map(GEO_SOURCES.map((item) => [item.id, item]));
