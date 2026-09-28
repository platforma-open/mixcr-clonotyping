---
'@platforma-open/milaboratories.mixcr-clonotyping-2.workflow': minor
'@platforma-open/milaboratories.mixcr-clonotyping-2.ui': minor
'@platforma-open/milaboratories.mixcr-clonotyping-2': minor
---

Run MiXCR as separate per-step execs for bulk amplicon presets, each with its own memory grant. Pipeline `align, assemble, exportClones`: align, assemble and qc, with assemble sized from the align report's clonotype estimate when present and from the .vdjca otherwise. Pipeline `align, refineTagsAndSort, assemble, exportClones`: align, refineTagsAndSort, assemble and qc, with refineTagsAndSort and assemble sized from the .vdjca each reads, and a larger assemble rule for presets whose tag pattern captures a cell barcode
