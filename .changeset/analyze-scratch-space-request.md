---
"@platforma-open/milaboratories.mixcr-clonotyping-2": minor
"@platforma-open/milaboratories.mixcr-clonotyping-2.workflow": minor
---

Analyze asks the backend for disposable disk space sized from the sample's reads, so
its temporary files no longer land in the working directory on shared storage.

This reduces single sample computation bill by ~25-40% on large samples, where
EFS I/O cost starts to be comparable or larger than cost of compute itself.

To have an effect, you need backend version 4.4.1 or above.
On older backends this optimisation is just ignored and computations run as usual.
