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

## Governance

- All meaningful changes require team consensus
- Document architectural decisions here
- Keep history focused on work, decisions focused on direction
