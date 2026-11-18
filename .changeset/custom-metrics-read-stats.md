---
"@platforma-open/milaboratories.mixcr-clonotyping-2.workflow": minor
---

Size MiXCR's scratch space with custom metrics (exec.formula.customMetric): :read-stats-metric runs seqkit stats
and jq over a sample's reads before the first step, and every step's scratch request is a formula over the
reads, bases per end and longest read it writes; the four metrics share one run per sample. Replaces the
measurement :mixcr-analyze ran and :run-mixcr read back. Needs a workflow-tengo with exec.formula.customMetric
(MILAB-6912).
