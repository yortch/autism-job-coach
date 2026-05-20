# Project Context

- **Owner:** Jorge Balderas
- **Project:** Autism Coach Job Coach — Azure deployment.
- **Stack:** Bicep, Azure Developer CLI (azd), Azure OpenAI (GPT-4o), Azure AI Speech, Azure Functions Flex Consumption (Node), Azure Static Web Apps, App Insights, Log Analytics, Key Vault.
- **Created:** 2026-05-20

## Learnings

<!-- Append new learnings below. Each entry is something lasting about the project. -->

- Infra lives under `infra/`. azd manifest at repo root as `azure.yaml`.
- One-command deploy target: `azd up`.
- Risk: verify GPT-4o quota in chosen region before deploy; document fallback region.
- Use managed identity end-to-end; secrets via Key Vault references.

## Recent Updates

**2026-05-20** — Issues #1–#12 created (11 stories + 1 backlog tracker); GitHub Projects v2 board live at https://github.com/users/yortch/projects/4.

**2026-05-20 — Scaffold Sprint Complete**
- Delivered Story #9: Full Bicep + azure.yaml, all 8 modules + managed identity RBAC.
- Resources: Log Analytics, Storage, Key Vault, OpenAI (GPT-4o), Speech, Functions FC1, SWA.
- Region: eastus2 (primary) + 3 fallbacks. **⚠️ QUOTA VERIFICATION REQUIRED** before `azd up`.
- Commit 2272617 to origin/develop. Status: Ready for deployment; awaiting quota check + first `azd up` run.
