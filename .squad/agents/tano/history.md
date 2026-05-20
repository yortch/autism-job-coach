# Project Context

- **Owner:** Jorge Balderas
- **Project:** Autism Coach — voice-first Job Coach PWA. Decodes manager instructions, drafts replies with "why" reasoning, and walks neurodivergent users through workplace tasks. Scenarios: library inventory (primary demo) and coffee shop.
- **Stack:** React + Vite PWA, Azure Functions (Node/TS v4), Microsoft Agent Framework, Azure OpenAI GPT-4o, Azure AI Speech, Bicep + azd.
- **Created:** 2026-05-20

## Learnings

<!-- Append new learnings below. Each entry is something lasting about the project. -->

- Plan of record is `plan.md` at repo root. 19 todos seeded in the SQL `todos` table with dependencies in `todo_deps`.

### 2026-05-20T13:18:49-04:00 — Scaffold Sprint Coordination

**Develop branch created** and pushed to origin. Scoped scaffold sprint with stories #1, #2, #7, #9 moved to "In Progress" on project board. Per-agent work documented in `.squad/decisions/tano-scaffold-sprint.md`:
  - **Wren (Story #9):** Bicep + azure.yaml → `azd up` success. Resources: SWA, Flex Functions, OpenAI GPT-4o (quota risk!), Azure Speech.
  - **Andor (Stories #2 + #7):** api/ folder with GET /api/scenarios, POST /api/decode (stubbed). Seed data: 3 examples each in scenario/steps/manager_phrases JSON.
  - **Bridger (Story #1):** Scenario picker (React + Vite) + decode view showing JSON. Plain styling, no CSS framework.
  - **All three:** Parallel work on develop. No PRs (hackathon speed); commits include Co-authored-by trailer. Integration test: `azd up` on clean subscription.
  - **Known risks:** OpenAI quota region, CORS, bicep syntax. Covered in sprint decision doc.
- Primary demo: library inventory. Coffee shop ships as seed data only if time runs short.
- Four-agent MAF pipeline: Decoder → Planner → Drafter → Coach. Decoder + Drafter answer "what did the manager actually mean?"; Planner + Coach handle "walk me through it."
- Hackathon dates: 2026-05-20 / 2026-05-21.

### 2026-05-20 — User Stories & Project Board Setup

**Story numbering:** Issues #1–#11 are user stories; #12 is the "📋 Hackathon Backlog" tracking issue. Story numbers are permanent GitHub issue numbers — use `#N` shorthand in PRs and comments.

**Label conventions:**
- Every user story carries: `user-story` + `hackathon` + `squad:{primary-owner}` + applicable `scenario:*` labels.
- Primary owner label (squad:{member}) is the routing mechanism — no assignees set on issues.
- The `squad` label (no suffix) is a triage inbox for unrouted items.
- Coffee shop-only stories carry `scenario:coffee-shop`; library-only carry `scenario:library-inventory`; cross-scenario carry both.

**Scope decisions made during authoring:**
- Consolidated scaffold-repo, web-scaffold, api-scaffold into #1 (scenario selection) as task checklist items — these are setup prerequisites, not user value.
- Split `seed-scenarios` todo into #7 (library, primary) and #8 (coffee shop, fallback) so they can be prioritized and potentially dropped independently.
- `web-ui` todo spans #2–#6 (it covers all UI views); noted in each story's Implementation Notes.
- Photo grounding (#6) scoped to `scenario:library-inventory` only — no coffee shop image path for v1.
- Text decode (#3) is a Bridger-owned UI-only story; shares agent-decoder + api-decode-endpoint with voice decode (#2, Andor-owned).
- Backlog tracking issue (#12) uses `squad:tano` + `hackathon` labels only (no `user-story`).

### 2026-05-20 — README.md Authored

**Repo onboarding:** Created initial README.md with all 10 required sections: title + tagline, what it is, demo scenarios, 4-agent pipeline, tech stack, repo layout, getting started (azd up), project status with links, team roster, license placeholder. Kept to ~150 lines; hackathon energy, scannable structure. README anchors first-time visitor on the 4-agent pipeline (Decoder → Planner → Drafter → Coach) and links to plan.md for depth.

### 2026-05-20T13:13:48-04:00 — Initial Scaffolding Commit

**Commit 8e44e61 pushed to origin/main:** All repo scaffolding committed and pushed to remote. Includes README.md, plan.md, .squad/ team structure (Tano, Bridger, Andor, Wren, Versio, Scribe, Ralph with charters), casting registry (Star Wars universe), .github/ workflows, .copilot/ skills, .gitattributes, and .gitignore. Repository is now ready for Squad operations.

## Recent Updates

## Recent Updates

**2026-05-20** — Issues #1–#12 created (11 stories + 1 backlog tracker); GitHub Projects v2 board live at https://github.com/users/yortch/projects/4.

**2026-05-20 — Scaffold Sprint Coordination Complete**
- **Orchestrated parallel fan-out:** Wren (Infra #9), Andor (API #2+#7), Bridger (Web #1). No PRs; all commits direct to develop for hackathon speed.
- **Outcomes:** All three agents completed in parallel. Bicep validated (az bicep build exit 0). API endpoints scaffolded + stubbed. Web shell + proxy config ready. Seed data committed.
- **Contract alignment:** Tano's sprint spec called for `{ summary, steps[], tone }`; Andor revised to `{ literal, subtext, urgency, tone, why }` (Decoder only; Planner adds steps[] later). Bridger updated DecodeResponse type to match.
- **Blockers surfaced:** GPT-4o quota region-gated — must verify before `azd up`. SWA Free tier has no `/api` linking — web calls Functions URL directly.
- **Next sprint:** Real GPT-4o Decoder, MAF multi-agent orchestration (Planner, Drafter, Coach), voice capture, Coach SSE, image grounding.
- **All commits to origin/develop tagged for sprint; decision docs merged into .squad/decisions.md.**
