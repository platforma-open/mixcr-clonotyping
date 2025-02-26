//
// Workaround before we add access to "retentive mode" behaviour in model SDK
//

import type { Ref } from 'vue';
import { shallowRef, watch } from 'vue';

export function retentive<T>(input: Ref<T | undefined>): Ref<T | undefined> {
  const result = shallowRef(input.value);
  watch(input, (v) => {
    if (v !== undefined) result.value = v;
  });
  return result;
}
