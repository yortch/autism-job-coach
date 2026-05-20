# Project Context

- **Owner:** Jorge Balderas
- **Project:** Autism Coach Job Coach — Azure Functions API + Microsoft Agent Framework multi-agent backend.
- **Stack:** Node.js + TypeScript, Azure Functions v4 model, Microsoft Agent Framework, Azure OpenAI GPT-4o (incl. vision), Azure AI Speech.
- **Created:** 2026-05-20

## Learnings

<!-- Append new learnings below. Each entry is something lasting about the project. -->

- API lives under `api/`. Agents under `api/src/agents/`. Scenario seed under `data/`.
- Four agents: Decoder, Planner, Drafter, Coach. Coach streams via SSE.
- Endpoints: `/api/scenarios`, `/api/decode`, `/api/coach` (SSE), `/api/speechToken`.
- Scenario knowledge is static seed (JSON/markdown) for hackathon — not in prompts.

## Recent Updates

**2026-05-20** — Issues #1–#12 created (11 stories + 1 backlog tracker); GitHub Projects v2 board live at https://github.com/users/yortch/projects/4.
