---
'@platforma-open/milaboratories.mixcr-clonotyping-2': patch
---

Run the MiXCR steps of a dataset with more than 256 samples in waves of 256: a wave starts when the previous one has its clones. A burst of more than about 700 job submissions made the backend fail finished jobs with "job appear timeout" (1,718 Sanger wells lost 155 to 1,029 aligns per run).
