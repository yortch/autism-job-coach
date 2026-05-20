# Project Context

- **Owner:** Jorge Balderas
- **Project:** Autism Coach Job Coach PWA — voice-first React app for neurodivergent users.
- **Stack:** React 18 + Vite + TypeScript, vite-plugin-pwa, Web Speech API, Azure Speech fallback, MediaRecorder, IndexedDB.
- **Created:** 2026-05-20

## Learnings

<!-- Append new learnings below. Each entry is something lasting about the project. -->

- Web app lives under `web/`. PWA installable; mobile-first.
- Two primary views: Decode (literal/subtext/draft/why) and Coach (SSE step stream).
- Inputs: voice, text, image (photo of shelf/menu).
- Tap-to-talk only — never always-listening.

## Recent Updates

**2026-05-20** — Issues #1–#12 created (11 stories + 1 backlog tracker); GitHub Projects v2 board live at https://github.com/users/yortch/projects/4.

**2026-05-20 — Scaffold Sprint Complete**
- Delivered Story #1: Vite + React + TypeScript minimal shell under web/.
- UI components: Scenario picker + decode form + raw JSON output view.
- Dev proxy: `/api/*` → `http://localhost:7071` (Azure Functions local port).
- Type contract: `DecodeResponse = { literal, subtext, urgency, tone, why }` — converged with Andor's API spec.
- Deferred: PWA service worker, voice/TTS, image capture, Coach SSE view, router, theming, IndexedDB.
- Commit 22d9f8c to origin/develop. Status: Web shell ready; awaiting real API responses for full integration.
