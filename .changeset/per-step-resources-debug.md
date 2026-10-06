---
'@platforma-open/milaboratories.mixcr-clonotyping-2.workflow': minor
'@platforma-open/milaboratories.mixcr-clonotyping-2.ui': minor
'@platforma-open/milaboratories.mixcr-clonotyping-2.model': minor
'@platforma-open/milaboratories.mixcr-clonotyping-2': minor
---

Per-step resources. Every MiXCR step logs the CPU and memory it was granted and the heap the JVM took. "Advanced Settings" gains a Per-step resources section: a sizing override per step (floor, intercept, slope, cap, CPU), which beats the global memory and CPU overrides for that step and does not re-run finished samples, and a "List the steps of this preset" button that plans the steps before any run. With "Debug: Report requested resources" on, a Resources tab per sample shows each step's grant and heap beside what it requested; this is a separate analysis identity, so turning it on runs every sample once more.
