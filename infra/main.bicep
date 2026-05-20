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
// Role assignments — Functions system-assigned MI → Storage
// ──────────────────────────────────────────────────────────────
// These are done here (not inside modules) to avoid circular deps:
// functions depends on storage for the account name;
// storage role assignment depends on functions for the principalId.

var storageBlobDataOwnerRoleId = 'b7e6dc6d-f1e8-4753-8033-0f276bb0955b'
var storageQueueDataContributorRoleId = '974c5e8b-45b9-4653-ba55-5f855dd0fb88'
var storageTableDataContributorRoleId = '0a9a7e1f-b9d0-4cc4-a60d-0319b160aaa3'

// existing reference required to use as roleAssignment.scope
resource storageAccountRef 'Microsoft.Storage/storageAccounts@2023-01-01' existing = {
  name: storage.outputs.storageAccountName
}

resource storageBlobOwner 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(storageAccountRef.id, functions.outputs.functionPrincipalId, storageBlobDataOwnerRoleId)
  scope: storageAccountRef
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', storageBlobDataOwnerRoleId)
    principalId: functions.outputs.functionPrincipalId
    principalType: 'ServicePrincipal'
  }
}

resource storageQueueContributor 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(storageAccountRef.id, functions.outputs.functionPrincipalId, storageQueueDataContributorRoleId)
  scope: storageAccountRef
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', storageQueueDataContributorRoleId)
    principalId: functions.outputs.functionPrincipalId
    principalType: 'ServicePrincipal'
  }
}

resource storageTableContributor 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(storageAccountRef.id, functions.outputs.functionPrincipalId, storageTableDataContributorRoleId)
  scope: storageAccountRef
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', storageTableDataContributorRoleId)
    principalId: functions.outputs.functionPrincipalId
    principalType: 'ServicePrincipal'
  }
}

// ──────────────────────────────────────────────────────────────
// Role assignments — Functions MI → Azure OpenAI
// ──────────────────────────────────────────────────────────────

var cognitiveServicesOpenAiUserRoleId = '5e0bd9bd-7b93-4f28-af87-19fc36ad61bd'

resource openAiAccountRef 'Microsoft.CognitiveServices/accounts@2023-05-01' existing = {
  name: openAi.outputs.openAiName
}

resource functionOpenAiUser 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(openAiAccountRef.id, functions.outputs.functionPrincipalId, cognitiveServicesOpenAiUserRoleId)
  scope: openAiAccountRef
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', cognitiveServicesOpenAiUserRoleId)
    principalId: functions.outputs.functionPrincipalId
    principalType: 'ServicePrincipal'
  }
}

// ──────────────────────────────────────────────────────────────
// Role assignments — Functions MI → Azure Speech
// ──────────────────────────────────────────────────────────────

var cognitiveServicesUserRoleId = 'a97b65f3-24c7-4388-baec-2e87135dc908'

resource speechAccountRef 'Microsoft.CognitiveServices/accounts@2023-05-01' existing = {
  name: speech.outputs.speechName
}

resource functionSpeechUser 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(speechAccountRef.id, functions.outputs.functionPrincipalId, cognitiveServicesUserRoleId)
  scope: speechAccountRef
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', cognitiveServicesUserRoleId)
    principalId: functions.outputs.functionPrincipalId
    principalType: 'ServicePrincipal'
  }
}

// ──────────────────────────────────────────────────────────────
// Role assignments — Functions MI → Key Vault
// ──────────────────────────────────────────────────────────────

var keyVaultSecretsUserRoleId = '4633458b-17de-408a-b874-0445c86b69e0'

resource keyVaultRef 'Microsoft.KeyVault/vaults@2023-07-01' existing = {
  name: keyVault.outputs.keyVaultName
}

resource functionKeyVaultSecretsUser 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(keyVaultRef.id, functions.outputs.functionPrincipalId, keyVaultSecretsUserRoleId)
  scope: keyVaultRef
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', keyVaultSecretsUserRoleId)
    principalId: functions.outputs.functionPrincipalId
    principalType: 'ServicePrincipal'
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
