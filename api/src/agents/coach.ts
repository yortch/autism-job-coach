/**
 * Coach agent — streams task steps one at a time via SSE.
 *
 * I/O:
 *   Input:  CoachInput  { steps: string[], scenarioId }
 *   Output: CoachChunk  { stepIndex, text, final }  — emitted as SSE events
 *
 * Status: STUB — wired in a later sprint (Story #4, SSE endpoint).
 *
 * Wire-up plan:
 *   1. Receive the ordered steps array from the Planner.
 *   2. Stream each step as an SSE event: data: { stepIndex, text, final: false }
 *   3. After each step, wait for a "did that work?" acknowledgement from the client.
 *   4. On "stuck" signal, call GPT-4o to re-plan and stream the revised steps.
 *   5. Emit final: true on the last step.
 *
 * Env vars required:
 *   AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_DEPLOYMENT  (same as Decoder)
 */

import type { CoachInput, CoachChunk } from '../types';

/**
 * Returns an async generator that yields CoachChunks for each step.
 * The caller (POST /api/coach handler) writes each chunk as an SSE event.
 *
 * @param input - Ordered steps + scenario id
 */
// eslint-disable-next-line @typescript-eslint/require-await
export async function* coach(_input: CoachInput): AsyncGenerator<CoachChunk> {
  // TODO: Implement step streaming + re-plan on stuck (see wire-up plan above).
  throw new Error('Coach agent not yet implemented — wired in a later sprint');
}
