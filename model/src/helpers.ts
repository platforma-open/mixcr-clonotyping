//
// (!!!) TO be moved to a common SDK helper library library
//

import { z } from 'zod';
import { base32Encode } from './base32-encode';
import { PValueInt, TreeNodeAccessor } from '@platforma-sdk/model';

/** Number of raw bytes in the PlId. */
export const PlIdBytes = 15;
/** Characters in string representation */
export const PlIdLength = 24; // = 15 bytes * 8 bits / 5 bits per char in base32

export const PlId = z
  .string()
  .length(PlIdLength)
  .regex(/[ABCDEFGHIJKLMNOPQRSTUVWXYZ234567]/) // RFC4648
  .brand('PlId');
export type PlId = z.infer<typeof PlId>;

export function uniquePlId(): PlId {
  const data = new Uint8Array(PlIdBytes);
  crypto.getRandomValues(data);
  return PlId.parse(base32Encode(data, 'RFC4648'));
}

export function plId(bytes: Uint8Array): PlId {
  if (bytes.length !== PlIdBytes) throw new Error(`Wrong number of bytes: ${bytes.length}`);
  return PlId.parse(base32Encode(bytes, 'RFC4648'));
}

export async function digestPlId(data: string): Promise<PlId> {
  const encoder = new TextEncoder();
  const bytes = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  return plId(new Uint8Array(bytes.slice(0, 15)));
}

export const ResourceMapResourceTypeName = 'PColumnData/ResourceMap';
export const ResourceMapResourcePartitionedTypeName = 'PColumnData/Partitioned/ResourceMap';

export type PColumnKey = (string | number)[];

export type PColumnResourceMapEntry<T> = {
  key: PColumnKey;
  value: T;
};

export type PColumnResourceMapData<T> = {
  isComplete: boolean;
  data: PColumnResourceMapEntry<T>[];
};

function populateResourceMapData<T>(
  acc: TreeNodeAccessor | undefined,
  resourceParser: (acc: TreeNodeAccessor) => T | undefined,
  data: PColumnResourceMapEntry<T>[],
  keyPrefix: PColumnKey = []
): boolean {
  if (acc === undefined) return false;
  switch (acc.resourceType.name) {
    case ResourceMapResourceTypeName: {
      let isComplete = acc.getInputsLocked();
      for (const keyStr of acc.listInputFields()) {
        const value = acc.resolve({ field: keyStr, assertFieldType: 'Input' });
        if (value === undefined) isComplete = false;
        else {
          const key = [...keyPrefix, ...JSON.parse(keyStr)] as PColumnKey;
          const converted = resourceParser(value);
          if (converted === undefined) isComplete = false;
          else data.push({ key, value: converted });
        }
      }
      return isComplete;
    }
    case ResourceMapResourcePartitionedTypeName: {
      let isComplete = acc.getInputsLocked();
      for (const keyStr of acc.listInputFields()) {
        const value = acc.resolve({ field: keyStr, assertFieldType: 'Input' });
        if (value === undefined) isComplete = false;
        else {
          const key = [...keyPrefix, ...JSON.parse(keyStr)] as PColumnKey;
          isComplete = isComplete && populateResourceMapData(value, resourceParser, data, key);
        }
      }
      return isComplete;
    }
    default:
      throw new Error(`Unknown resource type: ${acc.resourceType.name}`);
  }
}

export function parseResourceMap<T>(
  acc: TreeNodeAccessor | undefined,
  resourceParser: (acc: TreeNodeAccessor) => T | undefined
): PColumnResourceMapData<NonNullable<T>> {
  const data: PColumnResourceMapEntry<NonNullable<T>>[] = [];
  const isComplete = populateResourceMapData(acc, resourceParser, data, []);
  return { isComplete, data };
}
