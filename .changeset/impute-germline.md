---
'@platforma-open/milaboratories.mixcr-clonotyping-2.workflow': minor
'@platforma-open/milaboratories.mixcr-clonotyping-2.model': minor
'@platforma-open/milaboratories.mixcr-clonotyping-2.ui': minor
'@platforma-open/milaboratories.mixcr-clonotyping-2': minor
---

Add "Impute non-covered parts from germline" option for generic amplicon presets. When enabled, the block exports additional germline-imputed sequence columns for the gene-feature regions outside the assembling feature span (plus the full VDJRegion), reconstructing non-covered parts from the assigned V/J germline. Imputed sequences are not used for clonotype assembly. The option is shown only for presets that expose "Assemble clones by".