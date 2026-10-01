---
'@platforma-open/milaboratories.mixcr-clonotyping-2.workflow': minor
'@platforma-open/milaboratories.mixcr-clonotyping-2.ui': minor
'@platforma-open/milaboratories.mixcr-clonotyping-2': minor
---

Run MiXCR as one exec per step (MiTool steps, align, the assemble chain and qc), in MiXCR's own step order, each with CPU and memory from one per-step table. A pipeline with a step the split does not know keeps the single analyze command. The MiTool, refine and qc grants are placeholders until profiled.
