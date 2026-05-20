# Decision: API Scaffold — Endpoint Contracts, MAF Plan, Env Vars

**Author:** Andor (Backend Dev)  
**Date:** 2026-05-20  
**Branch:** develop  
**Stories:** #2 (partial), #7  
**Status:** Active

---

## Summary

Scaffolded the `api/` Azure Functions project (Node v4 programming model) and
`data/library_inventory/` seed data.  This file captures the decisions made
during that work so Bridger, Wren, and Versio can integrate without waiting.

---

## 1. Endpoint Contracts

### GET /api/scenarios

**Purpose:** Returns the list of available scenarios so the UI can populate the
scenario picker.

**Request:** No body, no query params.

**Response (200 OK):**
```json
[
  {
    "id": "library-inventory",
    "name": "Library Inventory",
    "description": "Shelving and inventory management for a public library"
  }
]
```

**Notes:**
- Populated dynamically by reading `data/` subdirectories that contain a
  `scenario.json` file.  Adding a new scenario folder automatically surfaces it
  here — no code change required.
- Only `id`, `name`, `description` are returned; vocabulary and commonAsks are
  omitted (bulk reduction for initial load).
- Returns `[]` if the `data/` directory does not exist (safe for cold deploys).

---

### POST /api/decode

**Purpose:** Accepts a manager instruction and a scenario identifier; returns a
structured plain-language decode.

**Request body:**
```json
{
  "text":       "Can you tidy the 800s?",
  "scenarioId": "library-inventory"
}
```

**Response (200 OK):**
```json
{
  "literal":  "Perform a shelf-read in the 800s (Literature) section …",
  "subtext":  "The 800s section has likely been browsed heavily …",
  "urgency":  "low",
  "tone":     "casual",
  "why":      "In library vocabulary, 'tidy' means shelf-read …"
}
```

**Urgency enum:** `"low" | "medium" | "high"`  
**Tone enum:** `"neutral" | "casual" | "direct" | "polite" | "apologetic" | "urgent"`

**Error responses:**
| Status | Condition |
|--------|-----------|
| 400    | Missing or empty `text` |
| 400    | Missing or empty `scenarioId` |
| 400    | `scenarioId` refers to a directory that does not exist in `data/` |
| 500    | Decoder agent threw unexpectedly |

**Current state:** Decoder agent returns a hardcoded stub (realistic for
`library-inventory`).  Stub is in `api/src/agents/decoder.ts` — swap
the function body for real GPT-4o call when `AZURE_OPENAI_ENDPOINT` is
provisioned (Wren's Story #9 output).

#### Schema discrepancy note

The `tano-scaffold-sprint.md` sprint doc specifies `{ summary, steps[], tone }`
for `/api/decode`.  My Andor charter and `plan.md` Agent Design section specify
Decoder output as `{ literal, subtext, urgency, tone, why }` — the `steps[]`
field belongs to the **Planner** agent, not the Decoder.

**Decision:** Implementing `{ literal, subtext, urgency, tone, why }` as per
charter.  The UI (Bridger) should render all five fields.  The `steps[]` output
will be added in a future sprint when the Planner agent is wired.  Bridger:
please update your decode view to expect this shape rather than `{ summary, steps[], tone }`.

---

## 2. Microsoft Agent Framework (MAF) Integration Plan

MAF is **not pulled in this sprint** — the SDK setup time risk noted in
`tano-scaffold-sprint.md` is real.  Integration plan for the next sprint:

1. **Install:** `npm install @azure/ai-agents` (or MAF package once stable GA
   name is confirmed — watch `@azure/ai-projects` as the current candidate).
2. **Decoder first:** Replace the stub in `api/src/agents/decoder.ts` with a
   direct Azure OpenAI call using the `openai` v4 SDK (already in `package.json`).
   This is faster than standing up the full MAF orchestration and unblocks demo.
3. **Planner + Drafter:** Once Decoder is proven, add MAF multi-agent
   orchestration.  Each agent is one file under `api/src/agents/`; the
   endpoint handler calls them in sequence.
4. **Coach (SSE):** Last.  Implement `api/src/functions/coach.ts` with SSE
   streaming.  The `coach.ts` agent already exports an `AsyncGenerator<CoachChunk>`.

---

## 3. Environment Variable Expectations

The following env vars are required for future sprints.  **This sprint** only
the Functions runtime vars are needed (the decoder is stubbed).

| Variable | Purpose | Set by |
|----------|---------|--------|
| `FUNCTIONS_WORKER_RUNTIME` | `"node"` — Functions runtime | Wren (Bicep) |
| `AzureWebJobsStorage` | Storage connection for Functions host | Wren (Bicep) |
| `AZURE_OPENAI_ENDPOINT` | `https://<resource>.openai.azure.com` | Wren (Bicep output) |
| `AZURE_OPENAI_DEPLOYMENT` | `gpt-4o` (deployment name) | Wren (Bicep parameter) |
| `AZURE_OPENAI_API_KEY` | API key (omit to use managed identity) | Wren (Key Vault ref) |
| `AZURE_SPEECH_KEY` | Azure AI Speech key | Wren (Key Vault ref) |
| `AZURE_SPEECH_REGION` | e.g. `eastus` | Wren (Bicep output) |

**Managed identity preference:** When `AZURE_OPENAI_API_KEY` is absent, the
Decoder will use `DefaultAzureCredential` from `@azure/identity`.  Wren:
please assign `Cognitive Services OpenAI User` to the Functions managed
identity — this is sufficient for chat completions.

**Local dev:** Copy `api/local.settings.json.template` to
`api/local.settings.json` (gitignored) and fill in real values.

---

## 4. Data File Conventions

Seed data lives in `data/{scenarioId}/`.  Three files per scenario:

| File | Shape |
|------|-------|
| `scenario.json` | `ScenarioMeta` — id, name, description, vocabulary[], commonAsks[] |
| `steps.json` | `StepTemplate[]` — id, name, description, steps[] |
| `manager_phrases.json` | `ManagerPhrase[]` — phrase, decoded: DecoderOutput |

The `id` field in `scenario.json` is overwritten at load time by the directory
name — the directory name is the authoritative scenario ID.

---

## 5. Assumptions Made (Coordination)

- **Bridger:** Will update decode view to use `{ literal, subtext, urgency, tone, why }`
  shape (see §1 schema discrepancy note above).
- **Wren:** Functions app will be deployed with `Node 20`, `v4 programming model`.
  `main` in `api/package.json` points to `dist/index.js` — ensure the Functions
  app is configured to run `npm run build` as a build step, or deploy pre-compiled.
- **Wren:** Managed identity → OpenAI role assignment needed before GPT-4o
  integration sprint.
- **Versio:** Test `GET /api/scenarios` returns at least one item after deploy.
  Test `POST /api/decode` with `{ text: "Can you tidy the 800s?", scenarioId: "library-inventory" }`
  returns 200 with all five fields populated.
