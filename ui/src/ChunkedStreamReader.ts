import type { RemoteBlobHandle } from '@platforma-sdk/model';
import { getRawPlatformaInstance } from '@platforma-sdk/model';
import { simpleRetry } from './simpleRetry';

/**
 * ChunkedStreamReader creates a ReadableStream that reads data from a blob driver
 * in fixed-size chunks. This is useful for streaming large files without loading
 * them entirely into memory.
 */
export class ChunkedStreamReader {
  private readonly handle: RemoteBlobHandle;
  private readonly totalSize: number;
  private readonly chunkSize: number;
  private currentPosition: number = 0;

  /**
   * Creates a new ChunkedStreamReader instance.
   *
   * @param handle - The blob handle identifier
   * @param totalSize - Total size of the blob in bytes
   * @param chunkSize - Size of each chunk to read in bytes (default: 10)
   */
  constructor(handle: RemoteBlobHandle, totalSize: number, chunkSize: number = 10) {
    if (totalSize < 0) {
      throw new Error('Total size must be non-negative');
    }
    if (chunkSize <= 0) {
      throw new Error('Chunk size must be positive');
    }

    this.handle = handle;
    this.totalSize = totalSize;
    this.chunkSize = chunkSize;
  }

  /**
   * Creates and returns a ReadableStream that reads data in chunks.
   * The stream will automatically close when all data has been read.
   *
   * @returns ReadableStream that can be consumed by zip.add or other stream consumers
   */
  createStream(): ReadableStream<Uint8Array> {
    return new ReadableStream({
      start: () => {
      },

      pull: async (controller) => {
        try {
          // Check if we've read all data
          if (this.currentPosition >= this.totalSize) {
            controller.close();
            return;
          }

          // Calculate the end position for this chunk
          // Ensure we don't read beyond the total size
          const endPosition = Math.min(this.currentPosition + this.chunkSize, this.totalSize);

          // Fetch the chunk from the blob driver
          const data = await simpleRetry(async () => getRawPlatformaInstance().blobDriver.getContent(
            this.handle,
            { from: this.currentPosition, to: endPosition },
          ), {
            maxAttempts: 3,
            delay: 1000,
          });

          // Enqueue the data into the stream
          controller.enqueue(data);

          // Update the current position for the next chunk
          this.currentPosition = endPosition;
        } catch (error) {
          // If any error occurs during chunk reading, error the stream
          controller.error(error);
        }
      },

      cancel: (reason) => {
        // Handle stream cancellation
        // Reset position in case the stream needs to be recreated
        this.currentPosition = 0;
        console.debug('ChunkedStreamReader cancelled:', reason);
      },
    });
  }

  /**
   * Gets the current reading position in bytes.
   *
   * @returns Current position as number of bytes read
   */
  getCurrentPosition(): number {
    return this.currentPosition;
  }

  /**
   * Gets the remaining bytes to be read.
   *
   * @returns Number of bytes remaining
   */
  getRemainingBytes(): number {
    return Math.max(0, this.totalSize - this.currentPosition);
  }

  /**
   * Checks if the entire blob has been read.
   *
   * @returns True if all data has been read
   */
  isComplete(): boolean {
    return this.currentPosition >= this.totalSize;
  }

  /**
   * Resets the reader to start from the beginning.
   * This allows reusing the same reader instance for multiple streams.
   */
  reset(): void {
    this.currentPosition = 0;
  }
}
