# Autism Job Coach 🎯

**A voice-first PWA that decodes workplace instructions and walks neurodivergent employees through complex tasks.**

## What It Is

The Job Coach is an AI-powered web app built for the FSI Autism Hackathon (May 20–21, 2026). When a manager gives vague or implicit instructions—"can you tidy the 800s?" or "jump on bar"—the Job Coach translates them into plain language, drafts a clear response, and walks the user step-by-step through the task itself. Built with voice-first UX for accessibility (Web Speech + Azure Speech), grounded in real workplace scenario knowledge (library inventory, coffee shop operations).

## Demo Scenarios

- **Library Inventory (primary):** Shelving order, Dewey Decimal system basics, shelf-reading SOP, common manager asks. Demonstrates the full pipeline with a realistic librarian task.
- **Coffee Shop (fallback):** Open/close checklist, drink-building for staples, POS workflows. Provides a second scenario for testing the 4-agent logic.

## How It Works

The Job Coach runs a four-agent AI pipeline, powered by Microsoft Agent Framework:

1. **Decoder** — Translates raw manager instruction into literal meaning, subtext, urgency, and emotional tone.
2. **Planner** — Breaks down the intent into ordered, concrete steps using scenario vocabulary (library or shop).
3. **Drafter** — Writes a suggested response tailored to the user's communication style.
4. **Coach** — Streams steps one at a time, asks "did that work?", re-plans if stuck.

Each response is readable *and* speakable (TTS toggle), with a "Why?" button to surface AI reasoning.

## Tech Stack

- **Frontend:** React + Vite PWA (Web Speech API, camera input, offline IndexedDB)
- **Backend:** Azure Functions (Node.js v20, TypeScript v4 programming model)
- **AI:** Microsoft Agent Framework, Azure OpenAI (GPT-4o + vision)
- **Speech:** Azure AI Speech (STT + TTS)
- **Infra:** Bicep + Azure Developer CLI (azd), Static Web Apps, Flex Consumption Functions
- **Data:** Static seed JSON/Markdown per scenario (swappable for Cosmos/AI Search later)

## Repo Layout

```
autism-coach/
  web/                  # React + Vite PWA
    src/
      scenarios/        # UI per scenario
      components/       # Mic, Coach, Decoder, Planner views
      lib/              # speech, api client, storage helpers
    public/manifest.webmanifest
    vite.config.ts
  api/                  # Azure Functions (Node/TS v4)
    src/
      functions/        # decode, draft, coach, scenarios, speechToken endpoints
      agents/           # Decoder, Planner, Drafter, Coach (MAF orchestration)
      grounding/        # scenario loader, retrieval helpers
    host.json
  data/                 # Static scenario seed
    library_inventory/
      sop.md
      vocabulary.json
      sample_asks.json
    coffee_shop/
      sop.md
      vocabulary.json
      sample_asks.json
  infra/                # Bicep infrastructure
    main.bicep
    modules/
  azure.yaml            # Azure Developer CLI manifest
  plan.md               # Full architecture + design decisions
  README.md
  .squad/               # Team coordination, decisions, history
```

## Getting Started

### Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | 20+ | https://nodejs.org |
| Azure CLI | latest | https://learn.microsoft.com/cli/azure/install-azure-cli |
| Azure Developer CLI (`azd`) | latest | https://learn.microsoft.com/azure/developer/azure-developer-cli/install-azd |
| Azure Functions Core Tools | v4 | https://learn.microsoft.com/azure/azure-functions/functions-run-local |

### ⚠️ Before You Deploy — Verify GPT-4o Quota

Azure OpenAI GPT-4o capacity is region-gated. **Check before running `azd up`:**

```bash
az login
az cognitiveservices usage list \
  --location eastus2 \
  --query "[?name.value=='OpenAI.Standard.gpt-4o']" \
  -o table
```

If `currentValue` is at or near `limit`, choose a fallback region: `swedencentral`, `uksouth`, or `eastus`.  
Request a quota increase at https://aka.ms/oai/quotaincrease if needed.

### Deploy

```bash
# 1. Authenticate
azd auth login

# 2. Initialize environment (one-time; pick eastus2 or a region with GPT-4o quota)
azd env new autism-coach-dev
azd env set AZURE_LOCATION eastus2

# 3. Deploy everything (infra + api + web)
azd up
```

`azd up` provisions all Azure resources via Bicep, then builds and deploys the Functions API and Static Web App. End-to-end takes ~8–12 minutes on first run.

### Deployed Resources

| Resource | Description |
|---|---|
| Resource Group | `rg-autism-coach-dev` (auto-created by azd) |
| Log Analytics + App Insights | Observability; connection string wired to Functions automatically |
| Storage Account | Flex Consumption deployment packages + future image uploads |
| Azure Functions (Flex Consumption, Node 20) | API host: `/api/decode`, `/api/draft`, `/api/coach`, `/api/scenarios` |
| Static Web App (Free) | React + Vite PWA frontend |
| Azure OpenAI (GPT-4o) | `gpt-4o` deployment, Standard SKU, 10k TPM default |
| Azure AI Speech | STT + TTS; same region as all resources |
| Key Vault | Secrets store; Functions identity has Secrets User access |

### Environment Variables (post-deploy)

After `azd up` completes, dump the wired env vars with:

```bash
azd env get-values
```

Key outputs:

| Variable | Description |
|---|---|
| `AZURE_OPENAI_ENDPOINT` | OpenAI account endpoint (used by Functions) |
| `AZURE_OPENAI_DEPLOYMENT` | Deployment name (`gpt-4o`) |
| `AZURE_OPENAI_API_VERSION` | REST API version (`2024-10-21`) |
| `AZURE_SPEECH_ENDPOINT` | Speech service endpoint |
| `AZURE_SPEECH_REGION` | Region for Speech SDK initialisation |
| `FUNCTION_ENDPOINT` | Functions base URL (`https://func-*.azurewebsites.net`) |
| `SWA_HOSTNAME` | Static Web App hostname |

All secrets use **system-assigned managed identity** — no API keys or connection strings are stored in environment variables or committed to git.

### Local Development

```bash
# API (Azure Functions)
cd api && npm install && npm run start
# → Functions runs at http://localhost:7071

# Web (React + Vite)
cd web && npm install && npm run dev
# → Vite proxies /api/* → http://localhost:7071
```

**Note:** Scaffolding (dependencies, test harnesses, CI/CD) is in progress. See GitHub Issues [#1–#11](https://github.com/yortch/autism-job-coach/issues) for tracked work.

## Project Status

🚀 **Hackathon Kickoff — May 20, 2026**

- [Project Board](https://github.com/users/yortch/projects/4) — real-time work tracking
- [Hackathon Backlog](https://github.com/yortch/autism-job-coach/issues/12) — all 19 user stories mapped, prioritized, assigned

## Team

Built by an AI-coordinated squad: **Tano** (Lead/Architect), **Bridger** (Frontend), **Andor** (Backend), **Wren** (Infra), **Versio** (QA), **Scribe** (Logging), **Ralph** (Work Monitor).

See [`.squad/team.md`](.squad/team.md) for full roster and charter.

## License

TBD — hackathon project.
