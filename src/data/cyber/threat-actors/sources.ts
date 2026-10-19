import type { ActorSource } from "../../../types/threat-actors.ts";

export const ACTOR_VERIFIED_AT = "2026-09-17";
const source = (id: string, kind: ActorSource["kind"], title: string, url: ActorSource["url"], publishedAt: string | null, extra: Partial<Pick<ActorSource, "currentWantedNotice" | "judicialOutcome">> = {}): ActorSource => ({
	id, kind, title, url, publishedAt, accessedAt: ACTOR_VERIFIED_AT,
	organization: { FBI: "Federal Bureau of Investigation", DOJ: "U.S. Department of Justice", OFAC: "U.S. Treasury / OFAC", NCA: "UK National Crime Agency", COURT: "U.S. Courts", STATE_DEPARTMENT: "U.S. Department of State" }[kind], ...extra,
});

export const ACTOR_SOURCES: readonly ActorSource[] = [
	source("yakubets-fbi", "FBI", "Maksim Viktorovich Yakubets — Cyber Most Wanted", "https://www.fbi.gov/wanted/cyber/maksim-viktorovich-yakubets", null, { currentWantedNotice: true }),
	source("yakubets-doj", "DOJ", "Russian National Charged with Decade-Long Series of Hacking and Bank Fraud Offenses", "https://www.justice.gov/archives/opa/pr/russian-national-charged-decade-long-series-hacking-and-bank-fraud-offenses-resulting-tens", "2019-12-05"),
	source("bogachev-fbi", "FBI", "Evgeniy Mikhailovich Bogachev — Cyber Most Wanted", "https://www.fbi.gov/wanted/cyber/evgeniy-mikhailovich-bogachev", null, { currentWantedNotice: true }),
	source("bogachev-doj", "DOJ", "U.S. Leads Multi-National Action Against Gameover Zeus and Cryptolocker", "https://www.justice.gov/archives/opa/pr/us-leads-multi-national-action-against-gameover-zeus-botnet-and-cryptolocker-ransomware", "2014-06-02"),
	source("khoroshev-doj", "DOJ", "U.S. Charges Russian National with Developing and Operating LockBit Ransomware", "https://www.justice.gov/archives/opa/pr/us-charges-russian-national-developing-and-operating-lockbit-ransomware", "2024-05-07"),
	source("lockbit-case", "DOJ", "LockBit — official case and defendant custody-status register", "https://www.justice.gov/usao-nj/lockbit", null, { currentWantedNotice: true }),
	source("khoroshev-ofac", "OFAC", "United States Sanctions Senior Leader of the LockBit Ransomware Group", "https://home.treasury.gov/news/press-releases/jy2326", "2024-05-07"),
	source("matveev-fbi", "FBI", "Mikhail Pavlovich Matveev — Cyber Most Wanted", "https://www.fbi.gov/wanted/cyber/mikhail-pavlovich-matveev", null, { currentWantedNotice: true }),
	source("matveev-doj", "DOJ", "Russian National Charged with Ransomware Attacks Against Critical Infrastructure", "https://www.justice.gov/archives/opa/pr/russian-national-charged-ransomware-attacks-against-critical-infrastructure", "2023-05-16"),
	source("park-fbi", "FBI", "Park Jin Hyok — Cyber Most Wanted", "https://www.fbi.gov/wanted/cyber/park-jin-hyok", null, { currentWantedNotice: true }),
	source("park-doj", "DOJ", "Three North Korean Military Hackers Indicted in Wide-Ranging Scheme", "https://www.justice.gov/archives/opa/pr/three-north-korean-military-hackers-indicted-wide-ranging-scheme-commit-cyberattacks-and", "2021-02-17"),
	source("belan-fbi", "FBI", "Alexsey Belan — Cyber Most Wanted", "https://www.fbi.gov/wanted/cyber/alexsey-belan", null, { currentWantedNotice: true }),
	source("belan-doj", "DOJ", "U.S. Charges Russian FSB Officers and Their Criminal Conspirators for Hacking Yahoo", "https://www.justice.gov/archives/opa/pr/us-charges-russian-fsb-officers-and-their-criminal-conspirators-hacking-yahoo-and-millions", "2017-03-15"),
	source("polyanin-fbi", "FBI", "Yevgeniy Igorevich Polyanin — Cyber Most Wanted", "https://www.fbi.gov/wanted/cyber/yevgeniy-igorevich-polyanin", null, { currentWantedNotice: true }),
	source("polyanin-doj", "DOJ", "Ukrainian Arrested and Charged with Ransomware Attack on Kaseya — separate Polyanin indictment and seizure", "https://www.justice.gov/usao-ndtx/pr/ukrainian-arrested-and-charged-ransomware-attack-kaseya", "2021-11-08"),
	source("dunaev-doj", "DOJ", "Russian National Sentenced for Involvement in Development and Deployment of Trickbot Malware", "https://www.justice.gov/archives/opa/pr/russian-national-sentenced-involvement-development-and-deployment-trickbot-malware", "2024-01-25", { judicialOutcome: true }),
];
export const ACTOR_SOURCE_BY_ID = new Map(ACTOR_SOURCES.map((item) => [item.id, item]));
