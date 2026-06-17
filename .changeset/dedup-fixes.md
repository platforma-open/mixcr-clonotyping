---
'@platforma-open/milaboratories.mixcr-clonotyping-2.workflow': minor
'@platforma-open/milaboratories.mixcr-clonotyping-2': minor
---

Fix cross-project deduplication for QC report, add tunable memory for exportClones

- Anonymize QC report inputs and deanonymize output TSV (structural render deduplicates across projects)
- Pass `perProcessMemGB` as metaInput to QC report render (excluded from CID)
- Add `perProcessMemGB` + `memGB()` pattern to export-report for exportClones memory (was hardcoded 16GiB)
- Add `hash_override` to export-report template
- Add `perProcessMemGB` to single-cell processColumn metaExtra
