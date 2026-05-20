# Autism Coach — "Job Coach" Implementation Plan

## Problem
Neurodivergent employees often struggle to decode implicit workplace instructions
(e.g., a manager's vague request) and to execute multi-step routine tasks. The
**Job Coach** app translates manager instructions into plain language, drafts a
suggested response, and walks the user through the underlying task — grounded in
the specific context of their workplace (library inventory or coffee shop).

## Approach
A voice-first PWA backed by an Azure Functions API that orchestrates a small
set of Microsoft Agent Framework agents (Decoder → Planner → Drafter → Coach).
Scenario knowledge (SOPs, vocabulary, common asks, step templates) is loaded
from static seed JSON/markdown per scenario, keeping the hackathon path simple
but swappable for Cosmos/AI Search later.

## Scope (Hackathon v1)
- **Scenarios shipped:** Library inventory management (primary demo), Coffee shop
- **Inputs:** Voice (Web Speech + Azure Speech), Text paste, Image (photo of shelf/menu/receipt for grounding)
- **Outputs:** Plain-language decode, suggested response, step-by-step task walkthrough with TTS
- **Auth:** None (demo); scenario chosen on first launch
- **Deploy:** `azd up` (Bicep) to Azure

## Architecture
```
[React + Vite PWA]  ──HTTPS──▶  [Azure Functions API (Node/TS)]
   • Web Speech                     • /api/decode
   • MediaRecorder                  • /api/draft
   • Camera capture                 • /api/coach (SSE stream)
   • IndexedDB (offline)            • /api/scenarios
                                          │
                                          ▼
                              [Microsoft Agent Framework]
                              Decoder → Planner → Drafter → Coach
                                          │
                          ┌───────────────┼───────────────┐
                          ▼               ▼               ▼
                   Azure OpenAI    Azure AI Speech   Scenario seed
                     (GPT-4o)      (STT + TTS)       (JSON/MD in repo)
```

## Repo Layout (planned)
```
autism-coach/
  web/                 # React + Vite PWA
    src/
      scenarios/       # UI per scenario
      components/      # Mic, Coach, Decoder views
      lib/             # speech, api client, storage
    public/manifest.webmanifest
    vite.config.ts
  api/                 # Azure Functions (Node/TS, v4 programming model)
    src/
      functions/       # decode, draft, coach, scenarios, speechToken
      agents/          # decoder, planner, drafter, coach (MAF)
      grounding/       # scenario loader, retrieval helpers
    host.json
  data/                # static seed
    library_inventory/
      sop.md
      vocabulary.json
      sample_asks.json
    coffee_shop/
      sop.md
      vocabulary.json
      sample_asks.json
  infra/               # Bicep
    main.bicep
    modules/ (swa, functions, openai, speech, storage)
  azure.yaml           # azd manifest
  README.md
```

## Agent Design (Microsoft Agent Framework)
- **Decoder** — Input: raw manager message + scenario context. Output: literal meaning, implicit subtext, urgency, emotional tone.
- **Planner** — Input: decoded intent + scenario SOP. Output: ordered concrete steps using scenario vocabulary.
- **Drafter** — Input: decoded intent + user's comms style. Output: short suggested reply, plus "why I wrote it this way" note.
- **Coach** — Streams one step at a time, asks "did that work?", re-plans on "stuck".

## Key UX Decisions
- One big mic button; tap-to-talk, not always-listening (reduces anxiety).
- Every AI response readable AND speakable (TTS toggle, persisted preference).
- "Why?" button on every draft and step — surfaces Decoder reasoning.
- Visual progress bar for multi-step tasks; large hit targets; low-stim palette.
- Image input: user snaps a shelf/menu; sent as vision input to ground the step.

## Scenario Seed Content (must-write)
- **Library inventory:** shelving order, Dewey basics, "shelf-read" SOP, common manager phrases ("can you tidy the 800s?"), vocabulary (shelf-read, weeding, hold, withdrawn).
- **Coffee shop:** open/close checklist, drink build SOP for 3 staples, common manager phrases ("we're slammed, jump on bar"), vocabulary (bar, POS, pull, steam, dial-in).

## Infrastructure (Bicep via azd)
- Resource group, Log Analytics, App Insights
- Storage account (Functions + image uploads)
- Azure Functions (Flex Consumption, Node 20)
- Static Web Apps (linked to Functions backend)
- Azure OpenAI (GPT-4o deployment) — region with capacity
- Azure AI Speech (STT + TTS)
- Managed identity wiring; secrets via Key Vault references; no keys in code

## Todos
Tracked in SQL `todos` table. See `todos` for live status.

## Open Items / Risks
- Azure OpenAI quota in target region (need to verify before `azd up`).
- Web Speech API browser support varies — fallback to Azure Speech STT via short token endpoint.
- Image input cost/latency — gate behind explicit "Add a photo" action.
- Hackathon scope creep: keep coffee shop scenario data-only (no separate UI) if time short.

## Out of Scope (v1)
- Real user auth (Entra ID)
- Persistent per-user memory (Cosmos)
- Manager-side dashboard
- Mobile native app
- Localization beyond en-US
