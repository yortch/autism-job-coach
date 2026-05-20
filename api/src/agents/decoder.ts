/**
 * Decoder agent — translates a raw manager instruction into structured plain language.
 *
 * I/O:
 *   Input:  DecoderInput  { text, scenarioId, scenarioContext? }
 *   Output: DecoderOutput { literal, subtext, urgency, tone, why }
 *
 * Wire-up plan:
 *   1. Build a system prompt from scenarioContext vocabulary + manager_phrases examples.
 *   2. Call Azure OpenAI GPT-4o via the `openai` v4 SDK with Azure config.
 *   3. Parse structured JSON from the model response.
 *   4. Validate against DecoderOutput type before returning.
 *
 * Env vars required (set in local.settings.json / App Settings):
 *   AZURE_OPENAI_ENDPOINT    — e.g. https://<resource>.openai.azure.com
 *   AZURE_OPENAI_DEPLOYMENT  — e.g. gpt-4o
 *   AZURE_OPENAI_API_KEY     — omit to use DefaultAzureCredential (managed identity)
 */

import type { DecoderInput, DecoderOutput } from '../types';

// ---------------------------------------------------------------------------
// Stub response — realistic for the library_inventory scenario.
// Replace the body of this function with real GPT-4o wire-up (see plan above).
// ---------------------------------------------------------------------------

/**
 * Decodes a manager instruction into structured plain language.
 *
 * @param input - Raw text + scenario context
 * @returns Structured decode result
 */
export async function decode(input: DecoderInput): Promise<DecoderOutput> {
  // TODO: Replace stub with Azure OpenAI GPT-4o call.
  //
  // Suggested implementation sketch:
  //
  //   import AzureOpenAI from 'openai';
  //   import { DefaultAzureCredential, getBearerTokenProvider } from '@azure/identity';
  //
  //   const credential = new DefaultAzureCredential();
  //   const azureADTokenProvider = getBearerTokenProvider(
  //     credential, 'https://cognitiveservices.azure.com/.default'
  //   );
  //   const client = new AzureOpenAI({
  //     endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
  //     azureADTokenProvider,
  //     apiVersion: '2024-10-01-preview',
  //     deployment: process.env.AZURE_OPENAI_DEPLOYMENT!,
  //   });
  //
  //   const systemPrompt = buildSystemPrompt(input.scenarioContext);
  //   const completion = await client.chat.completions.create({
  //     model: process.env.AZURE_OPENAI_DEPLOYMENT!,
  //     response_format: { type: 'json_object' },
  //     messages: [
  //       { role: 'system', content: systemPrompt },
  //       { role: 'user', content: input.text },
  //     ],
  //   });
  //   return JSON.parse(completion.choices[0].message.content!) as DecoderOutput;

  void input; // suppress unused-param warning until GPT-4o is wired

  return {
    literal:
      'Your manager is asking you to perform a shelf-read in the 800s (Literature) section ' +
      'and return any out-of-order books to their correct Dewey Decimal position.',
    subtext:
      'The 800s section has likely been browsed heavily and books may be out of order. ' +
      'The manager wants it neat and accessible for patrons.',
    urgency: 'low',
    tone: 'casual',
    why:
      "In library vocabulary, 'tidy' means shelf-read — checking books are in Dewey Decimal " +
      "order. The 800s are the Literature section. No deadline was implied, so urgency is low.",
  };
}
