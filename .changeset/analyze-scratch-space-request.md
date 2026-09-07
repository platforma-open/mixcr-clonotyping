---
"@platforma-open/milaboratories.mixcr-clonotyping-2.workflow": minor
---

Analyze asks the backend for disposable disk space sized from the sample's reads, so
its temporary files no longer land in the working directory on shared storage.

The size is `11 x millionsOfReads x (averageReadLength / 1000) ^ 2` GiB, rounded up.
Neither number is in the column metadata, so one read end is measured with `seqkit
stats` and read back through `csvtk` before the run starts; read ends are symmetrical,
so one of them describes the whole sample. The measurement and the size formula live
in the new `read-stats` library, and the run itself moved to the `mixcr-run` template,
because a template cannot read the result of a command it started itself.

The request is an optimisation and never a precondition. A deployment that cannot
serve the size shrinks or grows it, one with no scratch storage ignores it, and a
sample with no read end to measure asks for nothing — analyze runs either way, on
whatever temporary storage its runner provides. `--use-local-temp` is dropped, since
`TMPDIR` now points at that storage.

Requires workflow-tengo 6.9.0.
