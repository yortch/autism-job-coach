param name string
param location string
param tags object = {}

resource staticWebApp 'Microsoft.Web/staticSites@2023-01-01' = {
  name: name
  location: location
  // azd uses the 'azd-service-name' tag to locate this resource for the 'web' service
  tags: union(tags, { 'azd-service-name': 'web' })
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    stagingEnvironmentPolicy: 'Enabled'
    allowConfigFileUpdates: true
    provider: 'None'
    enterpriseGradeCdnStatus: 'Disabled'
  }
}

output swaHostname string = staticWebApp.properties.defaultHostname
output swaId string = staticWebApp.id
output swaName string = staticWebApp.name
