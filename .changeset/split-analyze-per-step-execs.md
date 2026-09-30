---
'@platforma-open/milaboratories.mixcr-clonotyping-2.workflow': minor
'@platforma-open/milaboratories.mixcr-clonotyping-2.ui': minor
'@platforma-open/milaboratories.mixcr-clonotyping-2': minor
---

Run MiXCR as separate per-step execs for bulk amplicon presets, each with its own memory grant. Pipeline `align, assemble, exportClones`: align, assemble and qc, with assemble sized from the align report's clonotype estimate when present and from the .vdjca otherwise. Pipeline `align, refineTagsAndSort, assemble, exportClones`: align, refineTagsAndSort, assemble and qc, with refineTagsAndSort and assemble sized from the .vdjca each reads, a larger assemble rule for presets whose tag pattern captures a cell barcode, and a long-read assemble rule sized from the .vdjca for presets on the long-read aligner in either pipeline. Every other pipeline made of known steps, from a built-in preset or a preset file, also runs one exec per step: mitool parse, refine-tags and each consensus round, then align, refineTagsAndSort, assemblePartial, extend, assemble, assembleContigs, assembleCells and qc as the preset lists them. A pipeline with any other step keeps the single analyze command. The MiTool grants are placeholders until profiled.
