# Decision: Web Scaffold (Story #1)

**Author:** Bridger (Frontend Dev)  
**Date:** 2026-05-20  
**Branch:** develop  

---

## Stack — Pinned Versions

| Package | Version |
|---------|---------|
| vite | ^5.4.11 |
| @vitejs/plugin-react | ^4.3.4 |
| react / react-dom | ^18.3.1 |
| typescript | ^5.6.3 |
| vite-plugin-pwa | ^0.21.1 (dependency declared, not configured yet) |

`vite-plugin-pwa` is listed as a devDependency so the next sprint can wire it without a dep bump. It is intentionally unused this sprint.

---

## Dev Proxy Config

`vite.config.ts` proxies all `/api/*` requests to `http://localhost:7071` (Azure Functions default local port). `changeOrigin: true` ensures the `Host` header matches the target and avoids CORS rejection from Functions Core Tools.

---

## Type Contract Assumed for /api/decode

```ts
type DecodeResponse = {
  literal: string;
  subtext: string;
  urgency: string;
  tone:    string;
  why:     string;
};
```

This matches the spec in the task prompt (Bridger charter). The sprint scaffold doc (`tano-scaffold-sprint.md`) shows a different shape `{ summary, steps[], tone }` from an earlier iteration. **The canonical contract is the one above** — Andor's stub should align to it. If Andor ships `{ summary, steps[], tone }`, the `<pre>` block will still render it raw, so the page won't break; it will just look different until contracts sync.

---

## Files Created

```
web/
  index.html
  package.json
  tsconfig.json
  vite.config.ts
  public/
    manifest.webmanifest       ← placeholder, no icons yet
  src/
    main.tsx
    App.tsx                    ← scenario picker + decode form + raw result
    lib/
      api.ts                   ← typed fetch client (getScenarios, postDecode)
.gitignore                     ← added web/node_modules/, web/dist/
```

---

## Deferred Work (Future Sprints)

- **PWA service worker** — `vite-plugin-pwa` dep is present; configure `VitePWA()` plugin with workbox strategy when offline support is needed.
- **Voice capture** — Web Speech API tap-to-talk; Azure Speech token fallback via `/api/speechToken`.
- **TTS playback** — `SpeechSynthesis` API per AI response; "speak it" toggle.
- **Image capture** — `<input type="file" accept="image/*" capture>` for shelf/menu grounding.
- **Coach SSE view** — EventSource stream from `/api/coach`, step-by-step walkthrough.
- **Three-view router** — React Router or lightweight state machine (scenario picker → decode → coach).
- **Low-stim palette & theming** — muted grays, no animations (already `prefers-reduced-motion` safe because zero animations exist).
- **IndexedDB persistence** — save chosen scenario and session transcript.
- **"Why?" button** — surfaces `DecodeResponse.why` text separately with accessible disclosure.
- **"Speak it" button** — calls `window.speechSynthesis.speak()` on any AI text field.
