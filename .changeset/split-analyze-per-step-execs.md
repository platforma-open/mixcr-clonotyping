---
'@platforma-open/milaboratories.mixcr-clonotyping-2.workflow': minor
'@platforma-open/milaboratories.mixcr-clonotyping-2.ui': minor
'@platforma-open/milaboratories.mixcr-clonotyping-2.model': minor
'@platforma-open/milaboratories.mixcr-clonotyping-2': minor
---

Run MiXCR as one exec per step, the steps `mixcr analyze --dry-run-json` plans for the preset, each with CPU and memory from one per-step table. Each step has its own log, carried in the log column in place of the single log; samples analysed before the update do not run again and keep their single log. The "Advanced Settings" memory override raises each step's floor instead of replacing its grant. Presets that split the reads by a sample tag, and presets without qc checks, are rejected. Needs a MiXCR build with `--dry-run-json` (milaboratory/mixcr#2156). The MiTool, refine, qc and planning grants are placeholders until profiled.
