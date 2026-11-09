---
"@platforma-open/milaboratories.mixcr-clonotyping-2.kind": minor
"@platforma-open/milaboratories.mixcr-clonotyping-2.model": patch
"@platforma-open/milaboratories.mixcr-clonotyping-2.ui": patch
---

Compute the block subtitle without opening the block

Opening the block no longer rewrites its arguments, so a block run with Run All is not marked
stale (with everything downstream) the first time someone opens it. The subtitle is computed
from the block's settings: the input dataset label stored when the user picked the input,
followed by the chosen chains. A block that was never opened, including one created from a
template, now shows it too. Existing blocks show stale once after the update. The init-params
contract no longer carries `defaultBlockLabel`; templates that still contain it keep loading.
