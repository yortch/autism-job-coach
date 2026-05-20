# Infra Scaffold Decision — Wren

**Author:** Wren (Infra / DevOps)  
**Date:** 2026-05-20  
**Status:** Active  
**Story:** #9 — Azure infrastructure scaffold (azd up end-to-end)

---

## Summary

All Bicep modules and `azure.yaml` have been authored and validated (`az bicep build` exits 0). The infra surface area covers every resource in the hackathon plan. No secrets are committed to git; all service-to-service auth uses system-assigned managed identity with scoped RBAC.

---

## Region Choice

| | Value |
|---|---|
| **Primary** | `eastus2` (East US 2) |
| **Fallback 1** | `swedencentral` (Sweden Central) |
| **Fallback 2** | `uksouth` (UK South) |
| **Fallback 3** | `eastus` (East US) |

**Why East US 2:** Historically highest GPT-4o quota availability; lowest latency from East Coast users; Flex Consumption Functions GA support confirmed.

⚠️ **QUOTA BLOCKER — MUST VERIFY BEFORE `azd up`:**  
GPT-4o Standard quota is region-gated. Before running `azd up`, the operator MUST confirm available TPM capacity in their target region:

```bash
az cognitiveservices usage list \
  --location eastus2 \
  --query "[?name.value=='OpenAI.Standard.gpt-4o']" \
  -o table
```

If quota shows 0 or insufficient:
1. Request quota at https://aka.ms/oai/quotaincrease
2. OR switch `AZURE_LOCATION` to a fallback region above
3. OR reduce `openAiDeploymentCapacity` to minimum (1 unit = 1 000 TPM)

---

## Resource SKUs

| Resource | SKU / Tier | Notes |
|---|---|---|
| Log Analytics Workspace | PerGB2018, 30-day retention | Free tier logging sufficient for hackathon |
| App Insights | workspace-based | Linked to Log Analytics |
| Storage Account | Standard_LRS | Flex Consumption backing + image uploads |
| Azure Functions | **Flex Consumption FC1** | Node 20, Linux, v4 programming model |
| Static Web App | **Free** | Bridger deploys React PWA here; no SWA API linking (see note) |
| Azure OpenAI | S0 | GPT-4o Standard deployment, 10 capacity units default |
| Azure AI Speech | S0 | STT + TTS; same region as all other resources |
| Key Vault | Standard | RBAC authorization enabled; soft-delete 7 days |

---

## GPT-4o Deployment Config

```
model.format:   OpenAI
model.name:     gpt-4o
model.version:  2024-11-20
sku.name:       Standard
sku.capacity:   10  (= 10 000 TPM)
```

Capacity can be increased via `openAiDeploymentCapacity` parameter in `main.parameters.json`. Max available depends on subscription quota. For the demo, 10 k TPM handles ~2 concurrent voice decode sessions.

---

## Env Var Contract (Functions app settings)

| Variable | Value Source | Set By |
|---|---|---|
| `AzureWebJobsStorage__accountName` | Storage account name | Bicep (functions module) |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | App Insights output | Bicep (functions module) |
| `FUNCTIONS_EXTENSION_VERSION` | `~4` | Bicep (functions module) |
| `AZURE_OPENAI_ENDPOINT` | OpenAI account endpoint | Bicep (functions module) |
| `AZURE_OPENAI_DEPLOYMENT` | `gpt-4o` | Bicep parameter default |
| `AZURE_OPENAI_API_VERSION` | `2024-10-21` | Bicep parameter default |
| `AZURE_SPEECH_ENDPOINT` | Speech account endpoint | Bicep (functions module) |
| `AZURE_SPEECH_REGION` | `location` parameter | Bicep (functions module) |

**No API keys, connection strings with secrets, or SAS tokens are stored in app settings.**  
All service access uses the Functions system-assigned managed identity.

---

## Role Assignments

| Principal | Resource | Role | Role ID |
|---|---|---|---|
| Functions MI | Storage Account | Storage Blob Data Owner | b7e6dc6d-... |
| Functions MI | Storage Account | Storage Queue Data Contributor | 974c5e8b-... |
| Functions MI | Storage Account | Storage Table Data Contributor | 0a9a7e1f-... |
| Functions MI | Azure OpenAI account | Cognitive Services OpenAI User | 5e0bd9bd-... |
| Functions MI | Azure Speech account | Cognitive Services User | a97b65f3-... |
| Functions MI | Key Vault | Key Vault Secrets User | 4633458b-... |

All role assignments are in `infra/modules/roleAssignments.bicep` (separate module to satisfy Bicep BCP120 constraint — role assignment `name`/`scope` must be resolvable at module invocation time, not at main.bicep pre-flight).

---

## Files Created

```
infra/
  main.bicep                      # Orchestrator (targetScope = resourceGroup)
  main.parameters.json            # azd parameter stubs (${AZURE_ENV_NAME}, ${AZURE_LOCATION})
  modules/
    loganalytics.bicep             # Log Analytics + App Insights
    storage.bicep                  # Storage Account + deployments container
    keyvault.bicep                 # Key Vault (RBAC-auth)
    openai.bicep                   # Azure OpenAI + gpt-4o deployment
    speech.bicep                   # Azure AI Speech
    functions.bicep                # Flex Consumption plan + Function App (system MI)
    swa.bicep                      # Static Web App (Free tier)
    roleAssignments.bicep          # All MI → resource role assignments
azure.yaml                         # azd manifest: web=SWA, api=Functions
```

---

## Known Limitations / Follow-up Risks

1. **SWA API Linking requires Standard tier** — Free tier SWA does not support the `/api` backend linking feature. The React frontend must call the Functions URL directly (or via an env var injected at SWA build time). Upgrade to Standard (`$9/month`) after hackathon if needed.

2. **GPT-4o quota** — flagged above. Must verify before running `azd up`. Do not merge to `main` / run `azd up` without quota confirmation.

3. **Speech disableLocalAuth: false** — left on for local dev convenience. Set `true` in prod to enforce managed-identity-only access.

4. **Storage soft-delete = 7 days** — chosen for hackathon speed of cleanup. Set higher in prod.

5. **openAiDeploymentCapacity default = 10** — this is the minimum. If demo load spikes (multiple concurrent voice decodes), increase to 30–50 and re-run `azd up` to update capacity.

6. **Bicep upgrade advisory** — `az bicep build` warns about v0.43.8 being available. No functional impact; upgrade when convenient: `az bicep upgrade`.

---

## Validation Result

```
az bicep build --file infra/main.bicep
# exit code: 0
# warnings: 1 (az bicep upgrade advisory — not a defect)
# errors: 0
```

`azd up` NOT yet run — user must verify GPT-4o quota first (see blocker above).
