---
"@platforma-open/milaboratories.mixcr-clonotyping-2.workflow": minor
"@platforma-open/milaboratories.mixcr-clonotyping-2": minor
---

Size `assemble` from align's report with output metrics: align saves its report content, and
`assemble`'s memory is a formula over `run.metric()` reads of the clone estimate and aligned reads, falling
back to the input sizing when the report has no estimate. The steps of a sample run in one template;
:run-steps-after-align and its split log are gone. Needs a workflow-tengo with `exec.formula.outputMetric`
and `exec.builder().metricInputs()` (MILAB-6912).
