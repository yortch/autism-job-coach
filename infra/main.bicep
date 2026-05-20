targetScope = 'resourceGroup'

// ──────────────────────────────────────────────────────────────
// Parameters
// ──────────────────────────────────────────────────────────────

@minLength(1)
@maxLength(64)
@description('Name of the azd environment (e.g. "autism-coach-dev"). Used as naming suffix.')
param environmentName string

@minLength(1)
@description('Primary Azure region for all resources. Must have GPT-4o quota — recommended: eastus2.')
param location string

@description('Name for the GPT-4o deployment inside the OpenAI account.')
param openAiDeploymentName string = 'gpt-4o'

@description('Azure OpenAI REST API version used by the Functions app.')
param openAiApiVersion string = '2024-10-21'

@description('''
GPT-4o deployment capacity in units (1 unit = 1 000 TPM).
Default 10 is the safe minimum. Increase only after confirming quota with:
  az cognitiveservices usage list --location <region>
''')
@minValue(1)
@maxValue(300)
param openAiDeploymentCapacity int = 10

// ──────────────────────────────────────────────────────────────
// Variables — naming & tagging
// ──────────────────────────────────────────────────────────────

// Unique 8-char suffix derived from subscription + env + region (stable across re-deploys)
var resourceToken = take(toLower(uniqueString(subscription().id, environmentName, location)), 8)

var tags = {
  'azd-env-name': environmentName
  project: 'autism-job-coach'
  hackathon: '2026-FSI'
}

// Storage names: lowercase, no hyphens, 3–24 chars
var storageAccountName = take('st${toLower(replace(environmentName, '-', ''))}${resourceToken}', 24)

// Key Vault names: 3–24 chars, alphanumeric + hyphens, start with letter
var keyVaultName = take('kv-${environmentName}-${resourceToken}', 24)

// ──────────────────────────────────────────────────────────────
// Monitoring
// ──────────────────────────────────────────────────────────────

module logAnalytics 'modules/loganalytics.bicep' = {
  name: 'logAnalytics'
  params: {
    logAnalyticsName: 'log-${environmentName}-${resourceToken}'
    appInsightsName: 'appi-${environmentName}-${resourceToken}'
    location: location
    tags: tags
  }
}

// ──────────────────────────────────────────────────────────────
// Storage
// ──────────────────────────────────────────────────────────────

module storage 'modules/storage.bicep' = {
  name: 'storage'
  params: {
    name: storageAccountName
    location: location
    tags: tags
  }
}

// ──────────────────────────────────────────────────────────────
// Key Vault
// ──────────────────────────────────────────────────────────────

module keyVault 'modules/keyvault.bicep' = {
  name: 'keyVault'
  params: {
    name: keyVaultName
    location: location
    tags: tags
  }
}

// ──────────────────────────────────────────────────────────────
// Azure OpenAI  (GPT-4o)
// ──────────────────────────────────────────────────────────────

module openAi 'modules/openai.bicep' = {
  name: 'openAi'
  params: {
    name: 'oai-${environmentName}-${resourceToken}'
    location: location
    tags: tags
    deploymentName: openAiDeploymentName
    deploymentCapacity: openAiDeploymentCapacity
  }
}

// ──────────────────────────────────────────────────────────────
// Azure AI Speech
// ──────────────────────────────────────────────────────────────

module speech 'modules/speech.bicep' = {
  name: 'speech'
  params: {
    name: 'spch-${environmentName}-${resourceToken}'
    location: location
    tags: tags
  }
}

// ──────────────────────────────────────────────────────────────
// Azure Functions  (Flex Consumption, Node 20)
// ──────────────────────────────────────────────────────────────

module functions 'modules/functions.bicep' = {
  name: 'functions'
  params: {
    name: 'func-${environmentName}-${resourceToken}'
    planName: 'asp-${environmentName}-${resourceToken}'
    location: location
    tags: tags
    storageAccountName: storage.outputs.storageAccountName
    appInsightsConnectionString: logAnalytics.outputs.appInsightsConnectionString
    openAiEndpoint: openAi.outputs.openAiEndpoint
    openAiDeployment: openAiDeploymentName
    openAiApiVersion: openAiApiVersion
    speechEndpoint: speech.outputs.speechEndpoint
    speechRegion: location
  }
}

// ──────────────────────────────────────────────────────────────
// Static Web App  (placeholder — Bridger deploys React PWA here)
// ──────────────────────────────────────────────────────────────

module swa 'modules/swa.bicep' = {
  name: 'swa'
  params: {
    name: 'swa-${environmentName}-${resourceToken}'
    location: location
    tags: tags
  }
}

// ──────────────────────────────────────────────────────────────
// Role assignments — Functions system-assigned MI
// ──────────────────────────────────────────────────────────────
// Delegated to a dedicated module so that BCP120 is satisfied:
// module params are resolved after their dependency modules finish,
// allowing role assignment names/scopes to use runtime values.

module roleAssignments 'modules/roleAssignments.bicep' = {
  name: 'roleAssignments'
  params: {
    storageAccountName: storage.outputs.storageAccountName
    openAiAccountName: openAi.outputs.openAiName
    speechAccountName: speech.outputs.speechName
    keyVaultName: keyVault.outputs.keyVaultName
    functionPrincipalId: functions.outputs.functionPrincipalId
  }
}

// ──────────────────────────────────────────────────────────────
// Outputs  (surfaced by azd after deploy)
// ──────────────────────────────────────────────────────────────

output AZURE_LOCATION string = location
output AZURE_TENANT_ID string = subscription().tenantId

output FUNCTION_ENDPOINT string = functions.outputs.functionEndpoint
output SWA_HOSTNAME string = swa.outputs.swaHostname

output AZURE_OPENAI_ENDPOINT string = openAi.outputs.openAiEndpoint
output AZURE_OPENAI_DEPLOYMENT string = openAiDeploymentName
output AZURE_OPENAI_API_VERSION string = openAiApiVersion

output AZURE_SPEECH_ENDPOINT string = speech.outputs.speechEndpoint
output AZURE_SPEECH_REGION string = location

output APPLICATIONINSIGHTS_CONNECTION_STRING string = logAnalytics.outputs.appInsightsConnectionString
output KEY_VAULT_URI string = keyVault.outputs.keyVaultUri
