import { Injectable } from '@nestjs/common';
import Sqids from 'sqids';

/**
 * SqidsService
 *
 * Provides encode/decode helpers that convert internal UUIDs into short,
 * URL-friendly public identifiers (e.g. "kHfge3") without changing the
 * primary key schema in the database.
 *
 * UUIDs are 128-bit values.  JavaScript's number type is a 64-bit float,
 * which only has 53 bits of safe integer precision.  To preserve all 128 bits
 * we split the UUID into four 32-bit unsigned integers before encoding.
 *
 * Encoding:
 *   "550e8400-e29b-41d4-a716-446655440000"
 *   → [0x550e8400, 0xe29b41d4, 0xa7164466, 0x55440000]
 *   → "AbCdEf123"   (example)
 *
 * Decoding:
 *   "AbCdEf123" → [0x550e8400, 0xe29b41d4, 0xa7164466, 0x55440000]
 *   → "550e8400-e29b-41d4-a716-446655440000"
 */
@Injectable()
export class SqidsService {
  private readonly sqids: Sqids;

  constructor() {
    this.sqids = new Sqids({
      // Keep IDs short (≥ 6 chars) while remaining URL-safe.
      minLength: 6,
    });
  }

  /**
   * Encode a UUID string into a short Sqids public ID.
   *
   * @param uuid  A standard UUID v4 string (with or without hyphens).
   * @returns     A short, URL-safe string.
   */
  encode(uuid: string): string {
    const numbers = this.uuidToNumbers(uuid);
    return this.sqids.encode(numbers);
  }

  /**
   * Decode a Sqids public ID back into a UUID string.
   *
   * @param id   A Sqids-encoded public ID.
   * @returns    The original UUID string, or `null` if decoding fails.
   */
  decode(id: string): string | null {
    try {
      const numbers = this.sqids.decode(id);
      if (numbers.length !== 4) return null;
      return this.numbersToUuid(numbers);
    } catch {
      return null;
    }
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  /**
   * Split a UUID into four 32-bit unsigned integers.
   * Strips hyphens and parses hex in 8-character chunks.
   */
  private uuidToNumbers(uuid: string): number[] {
    const hex = uuid.replace(/-/g, '');
    if (hex.length !== 32) {
      throw new Error(`Invalid UUID: "${uuid}"`);
    }
    return [
      parseInt(hex.slice(0, 8), 16),
      parseInt(hex.slice(8, 16), 16),
      parseInt(hex.slice(16, 24), 16),
      parseInt(hex.slice(24, 32), 16),
    ];
  }

  /**
   * Reconstruct a UUID string from four 32-bit unsigned integers.
   */
  private numbersToUuid(numbers: number[]): string {
    const hex = numbers
      .map((n) => n.toString(16).padStart(8, '0'))
      .join('');

    return [
      hex.slice(0, 8),
      hex.slice(8, 12),
      hex.slice(12, 16),
      hex.slice(16, 20),
      hex.slice(20, 32),
    ].join('-');
  }
}
