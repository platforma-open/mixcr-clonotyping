import { ensureError, isAbortError } from '@platforma-sdk/model';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// TODO: Make universal retry function in model (we have one in ts-helpers, but it's not universal)
export async function simpleRetry<T>(
  cb: () => Promise<T>,
  ops: {
    maxAttempts: number;
    delay: number;
  },
): Promise<T> {
  while (true) {
    try {
      return await cb();
    } catch (e: unknown) {
      const error = ensureError(e);

      ops.maxAttempts--;

      if (isAbortError(error) || ops.maxAttempts === 0) {
        throw error;
      }

      await delay(ops.delay);
    }
  }
}
