/**
 * POST /api/decode
 *
 * Accepts a manager instruction and a scenario identifier, runs it through
 * the Decoder agent, and returns a structured plain-language interpretation.
 *
 * Request body:
 * {
 *   "text":       string  — raw manager instruction (typed, pasted, or transcribed)
 *   "scenarioId": string  — e.g. "library-inventory"
 * }
 *
 * Response body (200):
 * {
 *   "literal":  string                                      — plain restatement
 *   "subtext":  string                                      — implicit meaning
 *   "urgency":  "low" | "medium" | "high"
 *   "tone":     "neutral" | "casual" | "direct" | "polite" | "apologetic" | "urgent"
 *   "why":      string                                      — "Why?" button text
 * }
 *
 * Error responses:
 *   400 — missing or invalid request fields
 *   500 — internal error
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { decode } from '../agents/decoder';
import { loadScenario } from '../grounding/loader';

interface DecodeRequestBody {
  text?: unknown;
  scenarioId?: unknown;
}

async function decodeHandler(
  req: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  context.log('POST /api/decode');

  // --- Parse and validate body ---
  let body: DecodeRequestBody;
  try {
    body = (await req.json()) as DecodeRequestBody;
  } catch {
    return {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Request body must be valid JSON' }),
    };
  }

  if (typeof body.text !== 'string' || body.text.trim() === '') {
    return {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: '"text" is required and must be a non-empty string' }),
    };
  }

  if (typeof body.scenarioId !== 'string' || body.scenarioId.trim() === '') {
    return {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: '"scenarioId" is required and must be a non-empty string' }),
    };
  }

  const text = body.text.trim();
  const scenarioId = body.scenarioId.trim();

  // --- Load scenario grounding context ---
  let scenarioContext;
  try {
    scenarioContext = await loadScenario(scenarioId);
  } catch (err) {
    context.warn(`Scenario not found: ${scenarioId}`, err);
    return {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: `Unknown scenarioId: "${scenarioId}"` }),
    };
  }

  // --- Run Decoder agent ---
  try {
    const result = await decode({ text, scenarioId, scenarioContext });
    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    };
  } catch (err) {
    context.error('Decoder agent error', err);
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Decoder agent failed' }),
    };
  }
}

app.http('decode', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'decode',
  handler: decodeHandler,
});
