/**
 * Planner agent — breaks a decoded instruction into ordered, concrete steps.
 *
 * I/O:
 *   Input:  PlannerInput  { decoded, scenarioId, scenarioContext? }
 *   Output: PlannerOutput { steps: string[], templateId? }
 *
 * Status: STUB — wired in a later sprint (Story #4 / #5).
 *
 * Wire-up plan:
 *   1. Match decoded intent against scenario step templates (from scenarioContext.steps).
 *   2. If a template matches, adapt its steps with the specific Dewey section or item.
 *   3. If no template matches, call GPT-4o with scenario vocabulary injected as context.
 *   4. Return ordered array of plain-language steps.
 */

import type { PlannerInput, PlannerOutput } from '../types';

/**
 * Plans concrete steps from a decoded instruction.
 *
 * @param input - Decoded intent + scenario context
 * @returns Ordered step list with optional template reference
 */
export async function plan(input: PlannerInput): Promise<PlannerOutput> {
  // TODO: Implement template-matching and GPT-4o fallback (see wire-up plan above).
  void input;
  throw new Error('Planner agent not yet implemented — wired in a later sprint');
}
