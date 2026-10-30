---
"@platforma-open/milaboratories.mixcr-clonotyping-2": minor
"@platforma-open/milaboratories.mixcr-clonotyping-2.workflow": minor
---

Size bulk and long-read `assemble` memory from align's clone estimate (`estimatedInitialClones`) and aligned read count instead of the .vdjca size. The estimate needs the align report of MiXCR 4.7.0-413-develop or later. UMI and single-cell presets, and any run with a memory override, keep the .vdjca sizing.

`align` memory floor 32 → 16 GiB. The ladder measured align floors of 4 GiB or less on small inputs; the 32 GiB peaks seen on app.hz were heap fill at the old grant.
