---
'@platforma-open/milaboratories.mixcr-clonotyping-2.workflow': minor
'@platforma-open/milaboratories.mixcr-clonotyping-2.ui': minor
'@platforma-open/milaboratories.mixcr-clonotyping-2.model': minor
'@platforma-open/milaboratories.mixcr-clonotyping-2': minor
---

Run MiXCR as one exec per step, the steps `mixcr analyze --dry-run-json` plans for the preset, each with CPU and memory from one per-step table. Each step has its own log, carried in the log column in place of the single log; samples analysed before the update do not run again and keep their single log. The "Advanced Settings" memory and CPU overrides replace each step's grant, as before; the planning and qc steps take neither. Presets that split the reads by a sample tag, and presets without qc checks, are rejected, and the settings say so under the preset picker before any run. Needs a MiXCR build with `--dry-run-json` (milaboratory/mixcr#2156). The MiTool steps are sized from the file each stages (parse from the reads, refine-tags and consensus from the `.mic`) in place of the flat 192 GiB `analyze` had; the refine, qc and planning grants are placeholders until profiled. Several steps now get less memory than the 64 GiB floor every `analyze` had (align 24 GiB; MiTool parse from 8 GiB; refine, MiTool refine-tags and consensus, UMI assemble and cell assemble from 16 GiB; long-read assemble from 6 GiB), and a step that runs out of memory fails the sample with no retry: the "Advanced Settings" memory override, global or per step, is the way to raise it.
