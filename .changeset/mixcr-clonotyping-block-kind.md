---
'@platforma-open/milaboratories.mixcr-clonotyping-2.kind': minor
'@platforma-open/milaboratories.mixcr-clonotyping-2.model': minor
'@platforma-open/milaboratories.mixcr-clonotyping-2': minor
---

Add the mandatory block kind and migrate the model to the new column access API

The block now declares a `kind/` package carrying its identity and its
init-params contract — the fields a project template supplies to seed a new
instance. The model consumes them in `init` and projects the same set back out
via `templateParams`, so export and apply are inverses. File-valued params are
narrowed to `index://` handles, since an `upload://` handle names an import
local to one machine and would not resolve after a template is applied
elsewhere.

Model column access moves off the removed/deprecated surface: `ColumnLazy` →
`DataColumn`, `resultPool.getSpecByRef` → `Column(ref).getSpec()`, and all three
`getPColumns()` call sites → `ColumnsCollection`, which resolves ids host-side
instead of materialising specs and data in the sandbox.
