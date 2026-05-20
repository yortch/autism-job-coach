/**
 * Drafter agent — writes a suggested reply to the manager's instruction.
 *
 * I/O:
 *   Input:  DrafterInput  { decoded, userStyle? }
 *   Output: DrafterOutput { reply: string, why: string }
 *
 * Status: STUB — wired in a later sprint (Story #5).
 *
 * Wire-up plan:
 *   1. Accept decoded intent and optional user communication style preference.
 *   2. Call GPT-4o with a prompt that asks for a short, direct reply the user
 *      can send back to their manager, matching the specified style.
 *   3. Include a "why I wrote it this way" explanation for the "Why?" button in the UI.
 */

import type { DrafterInput, DrafterOutput } from '../types';

/**
 * Drafts a suggested reply to the manager's instruction.
 *
 * @param input - Decoded intent + optional user style preference
 * @returns Suggested reply text and explanation
 */
export async function draft(input: DrafterInput): Promise<DrafterOutput> {
  // TODO: Implement GPT-4o reply drafting (see wire-up plan above).
  void input;
  throw new Error('Drafter agent not yet implemented — wired in a later sprint');
}
