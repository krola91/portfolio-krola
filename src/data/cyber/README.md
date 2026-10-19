# CISA KEV data contract

The observatory uses only the official CISA Known Exploited Vulnerabilities JSON feed:
`https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json`.

## Observed transport schema (2026-09-14)

The catalog exposes `title`, `catalogVersion`, `dateReleased`, `count`, and
`vulnerabilities`. Entries currently expose `cveID`, `vendorProject`, `product`,
`vulnerabilityName`, `dateAdded`, `shortDescription`, `requiredAction`, `dueDate`,
`knownRansomwareCampaignUse`, `notes`, `cwes`, and `forensicTriage`.

`forensicTriage` is preserved only in the source feed and is deliberately not mapped in
phase 2 because the current observatory has no defensible presentation contract for it.
The UI imports only the normalized domain model from `src/types/cyber.ts` and never the
transport type.

## Mapping

| CISA field | Observatory field |
| --- | --- |
| `cveID` | `cveId`, `id` |
| `vendorProject` | `vendor` |
| `product` | `product` |
| `vulnerabilityName` | `name` |
| `shortDescription` | `description` |
| `dateAdded` | `dateAdded` |
| `dueDate` | `remediationDueDate` |
| `requiredAction` | `requiredAction` |
| `knownRansomwareCampaignUse` | `knownRansomwareUse` (`known` or `unknown`) |
| `cwes` | `cwes` (always an array) |
| `notes` | `notes` (nullable) |

Source identity and URL live once in dataset metadata rather than being repeated on every
record; this keeps the browser asset smaller without weakening attribution.

The generated snapshot is updated explicitly with `npm run data:update:cisa` and checked
offline with `npm run data:check:cisa`. Builds never fetch CISA. The updater validates the
full payload, discards invalid individual records, deduplicates by CVE, sorts deterministically
by `dateAdded` (newest first), and retains only the latest 250 records. It then hashes that
retained window and replaces the previous file atomically only after success. Existing snapshots
can be migrated to the same retention contract with `npm run data:compact:cisa`.

This is a rolling snapshot, not an append-only archive. On every successful sync:

- a CVE already in the window is represented once and receives the latest fields published by CISA;
- newly published CVEs enter according to `dateAdded`;
- records displaced beyond position 250 are removed from the local snapshot; and
- an identical feed remains at 250 records without creating duplicates.

The previous valid file is used only to calculate the window delta and is preserved if fetching,
validation, normalization, or the atomic write fails. It is never concatenated with the new feed.
