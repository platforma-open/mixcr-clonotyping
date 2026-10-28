# @platforma-open/milaboratories.mixcr-clonotyping-2.kind

## 1.2.0

### Minor Changes

- 358d9ee: Add an optional "Assemble clones by" setting for the RNA-Seq and Exome-Seq presets. Left empty, clones are assembled into the longest contigs as before. A selected feature span replaces that assembly; CDR3 skips contig assembly.

## 1.1.0

### Minor Changes

- d8c1472: Add the mandatory block kind and migrate the model to the new column access API

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
