/**
 * Shared domain types for the Autism Job Coach API.
 *
 * Input/output contracts for all four agents are defined here so every
 * endpoint and agent file imports from one source of truth.
 */

// ---------------------------------------------------------------------------
// Scenario / grounding types
// ---------------------------------------------------------------------------

export interface VocabularyEntry {
  term: string;
  definition: string;
}

export interface ScenarioMeta {
  id: string;
  name: string;
  description: string;
  vocabulary: VocabularyEntry[];
  commonAsks: string[];
}

export interface StepTemplate {
  id: string;
  name: string;
  description: string;
  steps: string[];
}

export interface ManagerPhrase {
  phrase: string;
  decoded: DecoderOutput;
}

export interface ScenarioData {
  meta: ScenarioMeta;
  steps: StepTemplate[];
  managerPhrases: ManagerPhrase[];
}

// ---------------------------------------------------------------------------
// Decoder agent — Input / Output
// ---------------------------------------------------------------------------

export interface DecoderInput {
  /** Raw text from the manager (typed, pasted, or transcribed). */
  text: string;
  /** Scenario identifier (e.g. "library-inventory"). */
  scenarioId: string;
  /** Grounding context resolved from seed data. Injected by the handler. */
  scenarioContext?: ScenarioData;
}

export interface DecoderOutput {
  /** Plain-language restatement of what the manager literally asked for. */
  literal: string;
  /** Implicit meaning, unspoken expectations, or social context. */
  subtext: string;
  /** How time-sensitive the request is. */
  urgency: 'low' | 'medium' | 'high';
  /** Emotional register of the manager's message. */
  tone: 'neutral' | 'casual' | 'direct' | 'polite' | 'apologetic' | 'urgent';
  /** Explanation of the reasoning — surfaced by the "Why?" button in the UI. */
  why: string;
}

// ---------------------------------------------------------------------------
// Planner agent — Input / Output  (stub — wired in a later sprint)
// ---------------------------------------------------------------------------

export interface PlannerInput {
  decoded: DecoderOutput;
  scenarioId: string;
  scenarioContext?: ScenarioData;
}

export interface PlannerOutput {
  steps: string[];
  templateId?: string;
}

// ---------------------------------------------------------------------------
// Drafter agent — Input / Output  (stub — wired in a later sprint)
// ---------------------------------------------------------------------------

export interface DrafterInput {
  decoded: DecoderOutput;
  userStyle?: string;
}

export interface DrafterOutput {
  reply: string;
  why: string;
}

// ---------------------------------------------------------------------------
// Coach agent — Input / Output  (stub — SSE streaming, later sprint)
// ---------------------------------------------------------------------------

export interface CoachInput {
  steps: string[];
  scenarioId: string;
}

export interface CoachChunk {
  stepIndex: number;
  text: string;
  final: boolean;
}
