# E-Chowk Azure Development Environment

Target staging resources:
- Azure Container App: e-chowk-api-dev
- Azure PostgreSQL Flexible Server: e-chowk-db-dev
- Azure Container Registry: e-chowkacrdev
- Azure Static Web App: e-chowk-web-dev
- Azure Speech

Use Azure for Students allowances first. Do not use VMs or AKS for staging.

GitHub repository variables:
- AZURE_CLIENT_ID
- AZURE_TENANT_ID
- AZURE_SUBSCRIPTION_ID
- AZURE_RESOURCE_GROUP
- AZURE_CONTAINER_APP_NAME
- AZURE_CONTAINER_REGISTRY
- AZURE_API_BASE_URL

GitHub secret:
- AZURE_STATIC_WEB_APPS_API_TOKEN

Application secrets stay in Azure Container App configuration, not source control.

Azure subscription authorization is required before resources can be created.