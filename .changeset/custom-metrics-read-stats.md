---
"@platforma-open/milaboratories.mixcr-clonotyping-2.workflow": minor
---

Size MiXCR's scratch space with a custom metric collector (exec.formula.collector): seqkit stats and jq measure
reads, bases per end and the longest read before the first step, and every step's scratch request is a formula
over them. Replaces the measurement :mixcr-analyze ran and :run-mixcr read back. Needs a workflow-tengo with
exec.formula.collector (MILAB-6912).
