param name string
param location string
param tags object = {}

resource speechAccount 'Microsoft.CognitiveServices/accounts@2023-05-01' = {
  name: name
  location: location
  tags: tags
  kind: 'SpeechServices'
  sku: {
    name: 'S0'
  }
  properties: {
    customSubDomainName: toLower(name)
    publicNetworkAccess: 'Enabled'
    disableLocalAuth: false
  }
}

output speechEndpoint string = speechAccount.properties.endpoint
output speechRegion string = location
output speechId string = speechAccount.id
output speechName string = speechAccount.name
