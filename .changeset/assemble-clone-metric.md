---
"@platforma-open/milaboratories.mixcr-clonotyping-2.workflow": minor
"@platforma-open/milaboratories.mixcr-clonotyping-2": minor
---

Size `assemble` from the align report with custom metrics (exec.formula.customMetric): :align-report-metric
reads the clone estimate and aligned reads with jq before the step starts, and the memory is a formula over
them, falling back to the input sizing when the report has no estimate. The steps of a sample run in one
template; :run-steps-after-align and its split log are gone (MILAB-6912).
