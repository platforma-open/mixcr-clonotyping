---
"@platforma-open/milaboratories.mixcr-clonotyping-2.model": patch
"@platforma-open/milaboratories.mixcr-clonotyping-2.ui": patch
"@platforma-open/milaboratories.mixcr-clonotyping-2.workflow": patch
---

Migrate the block onto the structurer (`block-tools structure`): adopt the canonical project skeleton (tsconfig, oxlint/oxfmt configs, turbo `check`/`fmt` task graph, block index, workflow format/vitest scaffolding), unify per-module scripts under `check` (type-check + lint + fmt-check) and `fmt`, move `typescript`/`@types/node` to peer dependencies, and drop the retired eslint config tooling (`@platforma-sdk/eslint-config` + its catalog entry, per-package `eslint.config.mjs`, `lint` scripts). Source files reformatted with oxfmt. No user-facing behavior change.
