/**
 * Azure Functions v4 entry point — Node.js programming model.
 *
 * Each import below is a side-effect import that calls app.http() to register
 * the function trigger.  Add new functions by importing their module here.
 *
 * Ref: https://learn.microsoft.com/azure/azure-functions/functions-node-upgrade-v4
 */

// Registered endpoints (this sprint)
import './functions/scenarios'; // GET  /api/scenarios
import './functions/decode';    // POST /api/decode

// Placeholder imports for endpoints coming in later sprints:
// import './functions/coach';        // POST /api/coach  (SSE stream)
// import './functions/speechToken';  // GET  /api/speechToken
