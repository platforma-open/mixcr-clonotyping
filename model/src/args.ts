import { ImportFileHandle, Ref, ValueType } from '@milaboratory/sdk-ui';
import { ZodAnyDef, ZodSchema, z } from 'zod';
import { PlId } from './helpers';

export const BlockArgsValid = z
  .object({
    input: Ref,
    preset: z.string()
  })
  .strict();
export type BlockArgsValid = z.infer<typeof BlockArgsValid>;

export const BlockArgs = BlockArgsValid.partial({ input: true, preset: true });
export type BlockArgs = z.infer<typeof BlockArgs>;
