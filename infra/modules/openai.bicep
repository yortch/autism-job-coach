param name string
param location string
param tags object = {}

@description('Name of the GPT-4o deployment inside the OpenAI account.')
param deploymentName string = 'gpt-4o'

@description('Capacity units (1 unit = 1 000 TPM). 10 is the safe minimum; increase if quota allows.')
@minValue(1)
@maxValue(300)
param deploymentCapacity int = 10

resource openAiAccount 'Microsoft.CognitiveServices/accounts@2023-05-01' = {
  name: name
  location: location
  tags: tags
  kind: 'OpenAI'
  sku: {
    name: 'S0'
  }
  properties: {
    customSubDomainName: toLower(name)
    publicNetworkAccess: 'Enabled'
    // disableLocalAuth kept false so the REST key-based path is available for local dev
    // Managed identity path is preferred in production (roles assigned in main.bicep)
    disableLocalAuth: false
  }
}

resource gpt4oDeployment 'Microsoft.CognitiveServices/accounts/deployments@2023-05-01' = {
  parent: openAiAccount
  name: deploymentName
  sku: {
    name: 'Standard'
    capacity: deploymentCapacity
  }
  properties: {
    model: {
      format: 'OpenAI'
      name: 'gpt-4o'
      version: '2024-11-20'
    }
  }
}

output openAiEndpoint string = openAiAccount.properties.endpoint
output openAiId string = openAiAccount.id
output openAiName string = openAiAccount.name
