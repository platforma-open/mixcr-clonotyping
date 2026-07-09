---
"@platforma-open/milaboratories.mixcr-clonotyping-2.workflow": patch
---

Migrate the analyze exec's RAM sizing to the fluent `exec.formula` API (workflow-tengo 6.7.0): `.memFormula(f.clamp(...))` → `.resources({ onCPU: { cpu, ram } })`. Behavior-preserving — RAM stays `clamp(baseMemGiB + 4·size("reads"), baseMemGiB, 256 GiB)` with the same `baseMemGiB` fallback.
