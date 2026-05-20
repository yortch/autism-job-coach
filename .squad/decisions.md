# Squad Decisions

## Active Decisions

### Initial User Stories — Hackathon Backlog

**Author:** Tano  
**Date:** 2026-05-20  
**Status:** Active

Created 11 user stories (GitHub issues #1–#11) and 1 backlog tracking issue (#12) on yortch/autism-job-coach. All 19 plan.md todos are mapped to at least one story. Stories are labeled with `user-story`, `hackathon`, a `squad:{member}` primary-owner label, and applicable `scenario:*` labels.

**Scope decisions made during authoring:**
- Consolidated scaffold-repo, web-scaffold, api-scaffold into #1 (scenario selection) as task checklist items — these are setup prerequisites, not user value.
- Split `seed-scenarios` todo into #7 (library, primary) and #8 (coffee shop, fallback) so they can be prioritized and potentially dropped independently.
- `web-ui` todo spans #2–#6 (it covers all UI views); noted in each story's Implementation Notes.
- Photo grounding (#6) scoped to `scenario:library-inventory` only — no coffee shop image path for v1.
- Text decode (#3) is a Bridger-owned UI-only story; shares agent-decoder + api-decode-endpoint with voice decode (#2, Andor-owned).
- Backlog tracking issue (#12) uses `squad:tano` + `hackathon` labels only (no `user-story`).

---

### README.md Authored

**Repo onboarding:** Created initial README.md with all 10 required sections: title + tagline, what it is, demo scenarios, 4-agent pipeline, tech stack, repo layout, getting started (azd up), project status with links, team roster, license placeholder. Kept to ~150 lines; hackathon energy, scannable structure. README anchors first-time visitor on the 4-agent pipeline (Decoder → Planner → Drafter → Coach) and links to plan.md for depth.

---

---

## Scaffold Sprint — develop branch (2026-05-20)

**Authors:** Wren (Infra), Andor (Backend), Bridger (Frontend), Tano (Coordination)  
**Date:** 2026-05-20  
**Branch:** develop  
**Status:** Complete — All stories merged; azd up ready pending GPT-4o quota verification.  
**Commits:** 2272617 (Wren), ac97c07 (Andor), 22d9f8c (Bridger)

### Sprint Goal

Backend deployed end-to-end with minimal UI. One `azd up` succeeds; API endpoints wired; UI plumbing in place. All three implementers worked in parallel on develop without PR approvals (hackathon speed).

### Stories Completed

#### #1 (Bridger) — Scenario Picker
✅ **Deliverable:** React + Vite minimal shell; scenario picker + decode form + raw JSON output.
- **Stack:** Vite ^5.4.11, React 18.3.1, TypeScript 5.6.3.
- **Dev proxy:** `/api/*` → `http://localhost:7071` (Azure Functions default).
- **Type contract:** `DecodeResponse = { literal, subtext, urgency, tone, why }` — matches Andor's API spec.
- **Deferred:** PWA manifest, voice capture (Web Speech API), TTS playback, image grounding, Coach SSE view, router, theming, IndexedDB persistence.
- **Files:** `web/index.html`, `web/package.json`, `web/tsconfig.json`, `web/vite.config.ts`, `web/src/main.tsx`, `web/src/App.tsx`, `web/src/lib/api.ts`.

#### #2 (Andor) — API Scaffold + POST /api/decode
✅ **Deliverable:** Azure Functions Node v4 project; two working endpoints.
- **GET /api/scenarios** — Returns list of available scenarios.
- **POST /api/decode** — Accepts `{ text, scenarioId }`, returns `{ literal, subtext, urgency, tone, why }` (stubbed Decoder agent).
- **Error handling:** 400 for missing text/scenarioId; 500 for agent failures.
- **Env vars:** AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_DEPLOYMENT, AZURE_SPEECH_KEY, AZURE_SPEECH_REGION (set by Bicep; decoder stubbed this sprint).
- **Managed identity:** Functions MI uses DefaultAzureCredential; no API keys stored in app settings.
- **Next sprint:** Replace stub with real GPT-4o call; add MAF multi-agent orchestration.

#### #7 (Andor) — Library Inventory Seed Data
✅ **Deliverable:** Three JSON files in `data/library_inventory/`.
- **scenario.json** — ScenarioMeta (id, name, description, vocabulary[], commonAsks[]).
- **steps.json** — StepTemplate[] array (3+ examples of common shelving/inventory tasks).
- **manager_phrases.json** — ManagerPhrase[] array (3+ real phrases like "Can you tidy the 800s?"; each has decoded output).
- **Convention:** Directory name is authoritative scenario ID; overrides JSON `id` field at load time.
- **GET /api/scenarios dynamic load** — No code change needed to add new scenario; just create new `data/{scenarioId}/` directory.

#### #9 (Wren) — Azure Infra + azd Manifest
✅ **Deliverable:** Bicep modules + `azure.yaml`; `az bicep build` exits 0; no secrets in git.
- **Resources provisioned:** Log Analytics + App Insights, Storage Account (Standard_LRS), Key Vault (RBAC), Azure Functions (Flex Consumption FC1, Node 20 v4), Static Web App (Free tier), Azure OpenAI (GPT-4o Standard, 10 capacity units), Azure AI Speech (S0), managed identity end-to-end.
- **Region strategy:** Primary `eastus2` (East US 2); fallbacks: `swedencentral`, `uksouth`, `eastus`.
- **⚠️ BLOCKER — GPT-4o quota verification required before `azd up`:**
  ```bash
  az cognitiveservices usage list --location eastus2 \
    --query "[?name.value=='OpenAI.Standard.gpt-4o']" -o table
  ```
  If insufficient, request quota increase or use fallback region.
- **Known limitations:**
  - SWA Free tier does NOT support `/api` backend linking; React frontend calls Functions URL directly.
  - Speech `disableLocalAuth: false` — set to `true` in production.
  - Storage soft-delete = 7 days (hackathon cleanup speed; increase in production).
  - openAiDeploymentCapacity default = 10 (minimum; can increase for higher concurrent load).
- **Files:** `infra/main.bicep`, `infra/main.parameters.json`, `infra/modules/` (7 modules: loganalytics, storage, keyvault, openai, speech, functions, swa, roleAssignments), `azure.yaml`.

### Key Decisions

#### Endpoint Contract Alignment
**Tano's sprint doc** specified `{ summary, steps[], tone }` for `/api/decode`.  
**Andor's revision:** Decoder output is `{ literal, subtext, urgency, tone, why }` — steps[] belong to the **Planner** agent, not Decoder.  
**Decision:** Implement Andor's spec as canonical. UI (Bridger) renders all five fields. Planner agent will add steps[] in next sprint.  
**Contract convergence:** ✅ Bridger's `DecodeResponse` type matches exactly.

#### Microsoft Agent Framework Integration
MAF setup was deferred due to SDK stability risk noted in tano-scaffold-sprint.md.  
**Next sprint plan:**
1. Replace decoder stub with direct Azure OpenAI call (openai v4 SDK already in package.json).
2. Add MAF multi-agent orchestration (Decoder → Planner → Drafter → Coach).
3. Implement Coach SSE streaming endpoint.

#### Branch Strategy & No-PR Policy
All work committed directly to `develop` (no pull requests). Commit messages include:
- `feat(infra): Wren — Bicep + azd manifest + GPT-4o`
- `feat(api): Andor — Functions Node v4 scaffold`
- `feat(web): Bridger — Vite+React+TS minimal shell`
- Co-authored-by trailer for all commits.

#### SWA Free Tier Limitation
Static Web App Free tier lacks `/api` backend linking. Web calls Functions URL directly (or via env var injected at SWA build time). Upgrade to Standard ($9/month) post-hackathon if full SPA integration needed.

### Parallel Work & Integration
- **Wren:** Pushed bicep + azure.yaml EOD 2026-05-20. Andor/Bridger picked up for local testing.
- **Andor:** Pushed api/ folder + seed data. Bridger picked up for proxy config testing.
- **Bridger:** Pushed web/ folder. Andor + Wren verified dev proxy routing locally.
- **Local integration:** Andor ran `npm run dev` in api/, Bridger in web/; tested proxy together.
- **Cloud integration:** Wren ran `azd up` on clean subscription (quota check pending).

### Risks Mitigated

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Azure OpenAI quota unavailable in chosen region | Story #9 blocked | Documented quota verification command + fallback regions. Operator to confirm before `azd up`. |
| MAF SDK setup time | All stories blocked | Deferred full MAF; implement Decoder via direct OpenAI call first; adds MAF orchestration in next sprint. |
| Functions + React CORS issues | Story #1/2 integration fails | Pre-configured CORS in Functions host.json; dev proxy tested locally. |
| Wren bicep errors during deploy | Entire sprint blocked | Validated with `az bicep build` before push; no errors, only upgrade advisory. |
| Andor seed data too sparse | Poor UX demo | Required 3+ entries per file; reviewed before merge; library scenario ready for demo. |

### Follow-ups & Blockers

- ⚠️ **MUST VERIFY:** GPT-4o quota in target region before running `azd up`. See command above.
- 📋 **Decoder real GPT-4o wiring** — next sprint (Stories #2 follow-up, #3, #4).
- 📋 **Planner agent implementation** — next sprint (output steps[]).
- 📋 **Voice capture (Web Speech API)** — Story #2 continuation (currently text-only).
- 📋 **Coach SSE endpoint** — Story #5 continuation.
- 📋 **Image grounding** — Story #6 (library scenario only, v1).

---

## Governance

- All meaningful changes require team consensus
- Document architectural decisions here
- Keep history focused on work, decisions focused on direction
