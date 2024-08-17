import { ImportFileHandle, ValueType } from '@milaboratory/sdk-ui';
import { ZodAnyDef, ZodSchema, z } from 'zod';
import { PlId } from './helpers';

export const BlockArgs = z
  .object({
    preset: z.string().optional()
  })
  .strict();
export type BlockArgs = z.infer<typeof BlockArgs>;
