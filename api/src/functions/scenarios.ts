/**
 * GET /api/scenarios
 *
 * Returns metadata for every scenario that has a scenario.json file under
 * the data/ directory at the repository root.
 *
 * Response shape:
 * [
 *   { "id": "library-inventory", "name": "Library Inventory", "description": "..." },
 *   ...
 * ]
 *
 * No request body or query parameters required.
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { listScenarios } from '../grounding/loader';

async function scenariosHandler(
  _req: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  context.log('GET /api/scenarios');

  try {
    const scenarios = await listScenarios();

    // Return only the fields the UI needs; omit vocabulary/commonAsks bulk
    const response = scenarios.map(s => ({
      id: s.id,
      name: s.name,
      description: s.description,
    }));

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response),
    };
  } catch (err) {
    context.error('Error listing scenarios', err);
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to list scenarios' }),
    };
  }
}

app.http('scenarios', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'scenarios',
  handler: scenariosHandler,
});
