---
"@platforma-open/milaboratories.mixcr-clonotyping-2": minor
"@platforma-open/milaboratories.mixcr-clonotyping-2.workflow": minor
"@platforma-open/milaboratories.mixcr-clonotyping-2.model": minor
"@platforma-open/milaboratories.mixcr-clonotyping-2.ui": minor
---

Size bulk and long-read `assemble` memory from align's clone estimate (`estimatedInitialClones`) and aligned read count instead of the .vdjca size. The estimate needs the align report of MiXCR 4.7.0-413-develop or later. UMI and single-cell presets, a global memory override, and a step override that sets more than the memory floor keep the .vdjca sizing. A step memory floor alone replaces the floor of the clone-estimate sizing, and the per-step settings show that floor for the steps it sizes.

`align` memory floor 32 → 16 GiB. The ladder measured align floors of 4 GiB or less on small inputs; the 32 GiB peaks seen on app.hz were heap fill at the old grant.

The single-cell clone export is named `mixcr exportClones cells`, apart from the bulk `mixcr exportClones`.
