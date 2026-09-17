---
"@platforma-open/milaboratories.mixcr-clonotyping-2.workflow": patch
"@platforma-open/milaboratories.mixcr-clonotyping-2": patch
---

fix: size the exportClones formula from the measured regression

The bulk export rule was `clamp(16 x size(clns), 16 GiB, 128 GiB)`. Five measured samples,
with a `.clns` from 0.13 to 1.31 GiB, show that the rule gives the two largest samples 40%
less memory than they use:

| `.clns` GiB | measured peak | old grant | new grant |
|---:|---:|---:|---:|
| 0.125 | 10.31 | 16.00 | 16.00 |
| 0.152 | 10.57 | 16.00 | 16.00 |
| 0.410 | 15.86 | 16.00 | 20.31 |
| 1.116 | 30.76 | 17.85 (fail) | 41.48 |
| 1.308 | 42.26 | 20.92 (fail) | 47.23 |

The fit is `export peak = 6.4 + 25.0 x clns_GiB`, with R2 0.970. The `memory-from-limits`
entrypoint gives `-Xmx = 0.85 x grant`. The grant must therefore carry the peak divided by
0.85, which is `7.5 + 29.4 x clns_GiB`. Three values change:

- **Intercept, 8 GiB.** JVM overhead and reference-library overhead do not scale with the
  file. The previous rule had no constant term, so it started at zero, and the 16 GiB floor
  did all the work until the file became large enough to fail. The intercept is a fitted
  term and not a second floor, so the formula adds it and does not clamp it.
  It applies to both exports.
- **Bulk coefficient, 16 to 30.** The single-cell coefficient stays at 32. Every measured
  sample is a bulk export, so no measurement supports or contradicts that value. The
  single-cell path does gain the same intercept, because JVM overhead and reference-library
  overhead do not depend on the path.
- **Cap, 128 to 256 GiB.** With the new coefficient the old cap applies at a 4.1 GiB
  `.clns`, which a 60M-read sample can reach. It now applies at 8.5 GiB.

The floors do not change. They are 16 GiB for bulk and 24 GiB for single-cell, and they
still carry the two smallest samples.

The template `hash_override` UUID also changes. This forces a one-time recompute of cached
export results. Without the new UUID the new sizing does not reach a project that has
already run the export.
