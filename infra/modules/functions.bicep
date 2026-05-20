param name string
param location string
param tags object = {}
param planName string

@description('Storage account name used for Flex Consumption deployment packages and host coordination.')
param storageAccountName string

param appInsightsConnectionString string
param openAiEndpoint string
param openAiDeployment string = 'gpt-4o'
param openAiApiVersion string = '2024-10-21'
param speechEndpoint string
param speechRegion string

// Flex Consumption plan — FC1 SKU, linux kind
resource appServicePlan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: planName
  location: location
  tags: tags
  sku: {
    name: 'FC1'
    tier: 'FlexConsumption'
  }
  kind: 'functionapp'
}

resource functionApp 'Microsoft.Web/sites@2023-12-01' = {
  name: name
  location: location
  // azd uses 'azd-service-name' to locate this resource for the 'api' service
  tags: union(tags, { 'azd-service-name': 'api' })
  kind: 'functionapp,linux'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      appSettings: [
        // Managed identity storage — no connection string committed
        {
          name: 'AzureWebJobsStorage__accountName'
          value: storageAccountName
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: appInsightsConnectionString
        }
        {
          name: 'FUNCTIONS_EXTENSION_VERSION'
          value: '~4'
        }
        // Azure OpenAI — consumed via managed identity (Cognitive Services OpenAI User role)
        {
          name: 'AZURE_OPENAI_ENDPOINT'
          value: openAiEndpoint
        }
        {
          name: 'AZURE_OPENAI_DEPLOYMENT'
          value: openAiDeployment
        }
        {
          name: 'AZURE_OPENAI_API_VERSION'
          value: openAiApiVersion
        }
        // Azure Speech — consumed via managed identity (Cognitive Services User role)
        {
          name: 'AZURE_SPEECH_ENDPOINT'
          value: speechEndpoint
        }
        {
          name: 'AZURE_SPEECH_REGION'
          value: speechRegion
        }
      ]
    }
    functionAppConfig: {
      deployment: {
        storage: {
          // Deployment packages land in this blob container; auth via system MI
          type: 'blobContainer'
          value: 'https://${storageAccountName}.blob.${environment().suffixes.storage}/deployments'
          authentication: {
            type: 'SystemAssignedIdentity'
          }
        }
      }
      scaleAndConcurrency: {
        maximumInstanceCount: 100
        instanceMemoryMB: 2048
      }
      runtime: {
        name: 'node'
        version: '20'
      }
    }
  }
}

output functionAppName string = functionApp.name
output functionAppId string = functionApp.id
output functionPrincipalId string = functionApp.identity.principalId
output functionEndpoint string = 'https://${functionApp.properties.defaultHostName}'
output functionDefaultHostName string = functionApp.properties.defaultHostName
