---
'@platforma-open/milaboratories.mixcr-clonotyping-2.workflow': patch
---

Bound the per-step job bursts on large datasets. A burst of more than about 700 job submissions makes the backend fail finished jobs with "job appear timeout" (1,718 Sanger wells lost up to 1,029 aligns per run). MiXCR now runs in waves of 256 samples when the dataset is larger, a wave starting when the previous one has its clones; and the per-sample filter exports of the QC report run as each sample's clones are ready instead of all at once after the analysis.
