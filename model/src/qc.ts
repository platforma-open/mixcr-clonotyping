import { z } from 'zod';

export const QcStatus = z.union([z.literal('OK'), z.literal('WARN'), z.literal('ALERT')]);

export const QcCheck = z.object({
  type: z.string(),
  upper: z.number().optional(),
  middle: z.number().optional(),
  label: z.string()
});
export type QcCheck = z.infer<typeof QcCheck>;

export const QcCheckResult = z.object({
  step: z.string(),
  status: QcStatus,
  check: QcCheck,
  payload: z.object({
    printedValue: z.coerce.string().optional(),
    value: z.coerce.string().optional(),
    labelOverride: z.coerce.string().optional()
  })
});
export type QcCheckResult = z.infer<typeof QcCheckResult>;

export const Qc = z.array(QcCheckResult);
export type Qc = z.infer<typeof Qc>;
