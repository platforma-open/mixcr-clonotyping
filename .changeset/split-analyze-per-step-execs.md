---
'@platforma-open/milaboratories.mixcr-clonotyping-2.workflow': minor
'@platforma-open/milaboratories.mixcr-clonotyping-2.ui': minor
'@platforma-open/milaboratories.mixcr-clonotyping-2': minor
---

Run MiXCR as one exec per step (MiTool steps, align, the assemble chain and qc), each with its own memory grant; bulk assemble is sized from the align report's clonotype estimate. A pipeline with a step the split does not know keeps the single analyze command. The MiTool grants are placeholders until profiled.
