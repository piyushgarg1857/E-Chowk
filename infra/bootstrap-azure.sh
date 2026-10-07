#!/usr/bin/env bash
set -euo pipefail

# Run this ONCE inside Azure Cloud Shell (Bash).
# It creates the low-cost development infrastructure.
# Application secrets are intentionally NOT stored here.

LOCATION="${LOCATION:-centralindia}"
RESOURCE_GROUP="${RESOURCE_GROUP:-e-chowk-dev-rg}"
ACR_NAME="${ACR_NAME:-echowkacrdev}"
POSTGRES_NAME="${POSTGRES_NAME:-e-chowk-db-dev}"
POSTGRES_DB="${POSTGRES_DB:-echowk}"
POSTGRES_ADMIN="${POSTGRES_ADMIN:-echowkadmin}"
CONTAINER_ENV="${CONTAINER_ENV:-e-chowk-dev-env}"
CONTAINER_APP="${CONTAINER_APP:-e-chowk-api-dev}"
STATIC_APP="${STATIC_APP:-e-chowk-web-dev}"

echo "Creating resource group..."
az group create --name "$RESOURCE_GROUP" --location "$LOCATION" >/dev/null

echo "Creating Azure Container Registry..."
az acr create --resource-group "$RESOURCE_GROUP" --name "$ACR_NAME" --sku Basic --admin-enabled false >/dev/null

echo "Creating PostgreSQL Flexible Server..."
read -rsp "PostgreSQL admin password: " POSTGRES_PASSWORD
echo
az postgres flexible-server create   --resource-group "$RESOURCE_GROUP"   --name "$POSTGRES_NAME"   --location "$LOCATION"   --admin-user "$POSTGRES_ADMIN"   --admin-password "$POSTGRES_PASSWORD"   --sku-name Standard_B1ms   --tier Burstable   --storage-size 32   --version 16   --public-access 0.0.0.0 >/dev/null

az postgres flexible-server db create   --resource-group "$RESOURCE_GROUP"   --server-name "$POSTGRES_NAME"   --database-name "$POSTGRES_DB" >/dev/null

echo "Creating Container Apps environment..."
az containerapp env create   --name "$CONTAINER_ENV"   --resource-group "$RESOURCE_GROUP"   --location "$LOCATION" >/dev/null

echo "Creating initial Container App..."
az containerapp create   --name "$CONTAINER_APP"   --resource-group "$RESOURCE_GROUP"   --environment "$CONTAINER_ENV"   --image mcr.microsoft.com/azuredocs/containerapps-helloworld:latest   --target-port 3000   --ingress external   --min-replicas 0   --max-replicas 2 >/dev/null

echo "Creating Static Web App..."
az staticwebapp create   --name "$STATIC_APP"   --resource-group "$RESOURCE_GROUP"   --location "$LOCATION" >/dev/null

API_URL=$(az containerapp show --name "$CONTAINER_APP" --resource-group "$RESOURCE_GROUP" --query properties.configuration.ingress.fqdn -o tsv)

echo
echo "========================================"
echo "E-Chowk Azure development infrastructure"
echo "========================================"
echo "Resource Group : $RESOURCE_GROUP"
echo "PostgreSQL     : $POSTGRES_NAME"
echo "Container App  : $CONTAINER_APP"
echo "Container URL  : https://$API_URL"
echo "ACR            : $ACR_NAME"
echo "Static Web App : $STATIC_APP"
echo
echo "Next: configure GitHub OIDC variables and Azure app secrets."
echo "Do NOT commit DATABASE_URL, AUTH_TOKEN_SECRET, Groq, Twilio or Speech secrets."
