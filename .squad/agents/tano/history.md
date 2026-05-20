# Project Context

- **Owner:** Jorge Balderas
- **Project:** Autism Coach — voice-first Job Coach PWA. Decodes manager instructions, drafts replies with "why" reasoning, and walks neurodivergent users through workplace tasks. Scenarios: library inventory (primary demo) and coffee shop.
- **Stack:** React + Vite PWA, Azure Functions (Node/TS v4), Microsoft Agent Framework, Azure OpenAI GPT-4o, Azure AI Speech, Bicep + azd.
- **Created:** 2026-05-20

## Learnings

<!-- Append new learnings below. Each entry is something lasting about the project. -->

- Plan of record is `plan.md` at repo root. 19 todos seeded in the SQL `todos` table with dependencies in `todo_deps`.
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

## Recent Updates

**2026-05-20** — Issues #1–#12 created (11 stories + 1 backlog tracker); GitHub Projects v2 board live at https://github.com/users/yortch/projects/4.
