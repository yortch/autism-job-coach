# Scaffold Sprint — develop branch (2026-05-20)

**Author:** Tano (Lead / Architect)  
**Date:** 2026-05-20  
**Branch:** develop  
**Goal:** Backend deployed end-to-end with minimal UI. One `azd up` succeeds; API endpoints wired; UI plumbing in place.

## Sprint Scope

### Stories In Progress
- **#1 (Bridger):** Scenario picker — single React page listing library + coffee shop, persists choice to IndexedDB.
- **#2 (Andor):** Voice decode endpoint — POST /api/decode with stubbed Decoder agent response {summary, steps[], tone}.
- **#7 (Andor):** Library inventory seed data — 3 examples each in scenario.json, steps.json, manager_phrases.json.
- **#9 (Wren):** Azure infrastructure — Bicep + azure.yaml, one `azd up` deploys everything.

### Stories Deferred (Todo)
#3, #4, #5, #6, #8, #10, #11 — will advance in later sprints once scaffold is solid.

---

## Per-Agent Work

### Wren (Infra / DevOps) — Story #9
**Deliverable:** `azd up` end-to-end working.

**Resources to provision:**
- Static Web App (linked to /api endpoints, serves placeholder index.html initially)
- Azure Functions Flex Consumption (Node 20 v4 programming model)
- Azure OpenAI (GPT-4o deployment) — **RISK: Verify quota in chosen region (e.g., East US, UK South)**
- Azure AI Speech (provision STT + TTS endpoints, no SDK integration in this sprint)
- Log Analytics + App Insights (wiring)
- Managed identity for Functions → OpenAI + Speech

**Scope cutoff:**
- Do NOT implement bicep module parameterization beyond essentials.
- No secret rotation.
- No RBAC polish (basic managed identity only).

**Testing:**
- Run `azd up` on clean subscription.
- Verify all resources created.
- Verify Static Web App + Functions backend routing works (`curl https://<swa-url>/api/scenarios` returns 200).

---

### Andor (Backend Dev) — Stories #2, #7

#### Story #7: Seed Data
**Deliverable:** Three data files in data/library_inventory/ committed to develop.

**File 1: data/library_inventory/scenario.json**
```json
{
  "name": "Library Inventory",
  "description": "Shelving and inventory management",
  "vocabulary": {
    "shelf-read": "Scanning all books on a shelf to find misplaced items",
    "weeding": "Removing old or damaged books from circulation",
    "hold": "A book reserved for a patron",
    "withdrawn": "A book removed permanently from the collection"
  },
  "commonContexts": [
    "800s section (Literature)",
    "Nonfiction section (000-999 Dewey)",
    "Children's corner"
  ]
}
```

**File 2: data/library_inventory/steps.json** (array of 3+ common task templates)  
**File 3: data/library_inventory/manager_phrases.json** (array of 3+ real phrases like "Can you tidy the 800s?")

#### Story #2: API Scaffold + /api/decode Endpoint
**Deliverable:** Azure Functions Node v4 project with two working endpoints.

**GET /api/scenarios** — Returns list of available scenarios with basic metadata:
```json
[
  { "id": "library-inventory", "name": "Library Inventory", "description": "..." },
  { "id": "coffee-shop", "name": "Coffee Shop (Demo)", "description": "..." }
]
```

**POST /api/decode** — Accepts {text, scenario}, returns stubbed response:
```json
{
  "summary": "Your manager is asking you to...",
  "steps": [
    "Step 1: ...",
    "Step 2: ..."
  ],
  "tone": "neutral"
}
```

**Implementation:**
- Wire Microsoft Agent Framework `Decoder` agent class but do not call actual GPT-4o yet.
- Return hardcoded JSON response matching the schema.
- No Speech token endpoint in this sprint (story #2 is text-based decode only; Speech tokens come later).
- Configure dev proxy: `/api/*` routes to `http://localhost:7071` (Functions local).

---

### Bridger (Frontend Dev) — Story #1
**Deliverable:** Single-page React + Vite app that selects a scenario, then shows decode output as JSON.

**Page 1 (Scenario Picker):**
- List two buttons: "Library Inventory" and "Coffee Shop".
- On click, persist choice to IndexedDB; advance to Page 2.

**Page 2 (Decode View):**
- Input field for user to paste or type a manager's message.
- Button "Decode".
- Calls POST /api/decode with the text and chosen scenario.
- Displays raw JSON response (no styling, plain pre-tag).

**Styling:**
- No CSS framework; plain HTML/CSS.
- Large hit targets (48px minimum).
- Minimal colors (grays + blue CTA button).
- No animations or transitions.

**Dev Setup:**
- Vite + React + TypeScript.
- Configure dev server proxy to `/api/*` → `http://localhost:7071` (Functions local port).

---

## Parallel Work & Branch Strategy

All three agents work in **parallel** on develop branch.

### Commit Strategy
- Each agent commits as they complete work (no PR approval needed for hackathon speed).
- Commit messages include: `Sprint: scaffold-on-develop. Story: #X. [Brief summary].`
- Include `Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>` trailer.

### Integration Points
- Wren: Pushes bicep + azure.yaml by EOD. Andor/Bridger pick it up for local testing.
- Andor: Pushes api/ folder structure + seed data. Bridger picks up for proxy config.
- Bridger: Pushes web/ folder. Andor + Wren verify dev proxy routing.

### Testing
- Local: Andor runs `npm run dev` in api/, Bridger runs `npm run dev` in web/; test proxy together.
- Cloud: Wren runs `azd up` on develop and verifies all three layers deploy.

---

## Known Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Azure OpenAI quota unavailable in chosen region | Story #9 blocked | Verify quota in advance; fallback region: UK South |
| Microsoft Agent Framework SDK setup takes time | All stories blocked | Document setup steps; test locally first |
| Functions + React CORS issues | Story #1/2 integration fails | Pre-configure CORS in Functions host.json |
| Wren bicep errors during `azd up` | Entire sprint blocked | Test bicep syntax locally with `az bicep build` before push |
| Andor seed data too sparse for meaningful responses | Poor UX demo | Require minimum 3 entries per file; review before merge |

---

## Branch & Timeline

- **Branch:** `develop` (created 2026-05-20)
- **Target:** All three stories merged to develop by EOD 2026-05-20 (hackathon timeline).
- **Validation:** Run `azd up` on clean subscription to confirm end-to-end success.
- **Next Sprint:** Polish UX, wire real GPT-4o, add Speech STT/TTS SDKs, implement remaining Stories #3–#6.

---

## References

- Plan: [plan.md](../../plan.md)
- Team roster: [.squad/agents](../)
- Project board: [GitHub Projects v2](https://github.com/users/yortch/projects/4)
