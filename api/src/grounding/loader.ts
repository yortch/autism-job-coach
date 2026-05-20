/**
 * Grounding loader — reads scenario seed data from data/{scenarioId}/ at
 * the repository root and caches it in module scope for the lifetime of the
 * warm function instance.
 *
 * Files expected per scenario directory:
 *   scenario.json      — ScenarioMeta
 *   steps.json         — StepTemplate[]
 *   manager_phrases.json — ManagerPhrase[]
 *
 * I/O:
 *   loadScenario(scenarioId: string): Promise<ScenarioData>
 *   listScenarios(): Promise<ScenarioMeta[]>
 */

import * as fs from 'fs';
import * as path from 'path';
import type { ScenarioData, ScenarioMeta, StepTemplate, ManagerPhrase } from '../types';

// Compiled output lives at api/dist/grounding/loader.js.
// Three levels up reaches the repo root: dist/grounding → dist → api → repo root.
const DATA_ROOT = path.join(__dirname, '..', '..', '..', 'data');

const cache = new Map<string, ScenarioData>();

/**
 * Returns the absolute path to a scenario's data directory.
 */
function scenarioDir(scenarioId: string): string {
  return path.join(DATA_ROOT, scenarioId);
}

/**
 * Reads and parses a JSON file, throwing a descriptive error on failure.
 */
function readJson<T>(filePath: string): T {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Grounding file not found: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
}

/**
 * Loads all seed data for a scenario.  Results are cached after first load.
 */
export async function loadScenario(scenarioId: string): Promise<ScenarioData> {
  if (cache.has(scenarioId)) {
    return cache.get(scenarioId)!;
  }

  const dir = scenarioDir(scenarioId);
  if (!fs.existsSync(dir)) {
    throw new Error(`Unknown scenario: "${scenarioId}". No directory at ${dir}`);
  }

  const meta = readJson<ScenarioMeta>(path.join(dir, 'scenario.json'));
  // Ensure the id field matches the directory name (authoritative source)
  meta.id = scenarioId;

  const steps = readJson<StepTemplate[]>(path.join(dir, 'steps.json'));
  const managerPhrases = readJson<ManagerPhrase[]>(path.join(dir, 'manager_phrases.json'));

  const data: ScenarioData = { meta, steps, managerPhrases };
  cache.set(scenarioId, data);
  return data;
}

/**
 * Returns lightweight metadata for every scenario directory that contains a
 * scenario.json file.  Used by GET /api/scenarios.
 */
export async function listScenarios(): Promise<ScenarioMeta[]> {
  if (!fs.existsSync(DATA_ROOT)) {
    return [];
  }

  const entries = fs.readdirSync(DATA_ROOT, { withFileTypes: true });
  const metas: ScenarioMeta[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const metaPath = path.join(DATA_ROOT, entry.name, 'scenario.json');
    if (!fs.existsSync(metaPath)) continue;

    try {
      const meta = readJson<ScenarioMeta>(metaPath);
      meta.id = entry.name; // directory name is authoritative id
      metas.push(meta);
    } catch {
      // Skip malformed scenario directories silently
    }
  }

  return metas;
}
