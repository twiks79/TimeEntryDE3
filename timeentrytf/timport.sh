#!/bin/bash

# Azure login using Service Principal and Secret from environment variables
echo "Logging in to Azure..."
az login --service-principal -u "$AZURE_CLIENT_ID" -p "$AZURE_CLIENT_SECRET" --tenant "$AZURE_TENANT_ID" --output none

# Variable assignments
RNAME="timeentrydenext3333"
ACR="timeentrydenextacr3333"
APPSERVICE="timeentrydenextAppService-3333"
WEB_APP="timeentrydenextWebApp-3333"
DNS_ZONE="timeentry-minijob.com"
SUBSCRIPTION_ID=$AZURE_SUBSCRIPTION_ID

# Check if SPTimeEntry service principal exists and create if not
SP_EXISTS=$(az ad sp list --display-name "SPTimeEntry" --query "length([].appId)" -o tsv)
if [ "$SP_EXISTS" -eq "0" ]; then
    echo "Creating SPTimeEntry service principal..."
    az ad sp create-for-rbac --name "SPTimeEntry" --role="Contributor" --scopes="/subscriptions/$AZURE_SUBSCRIPTION_ID"
else
    echo "SPTimeEntry service principal already exists."
fi

# Get the client ID and secret of the service principal
echo "Retrieving SPTimeEntry credentials..."
AZURE_CLIENT_ID=$(az ad sp list --display-name "SPTimeEntry" --query "[0].appId" -o tsv)
export AZURE_CLIENT_ID
AZURE_CLIENT_SECRET=$(az ad sp credential reset --name "$AZURE_CLIENT_ID" --query "password" -o tsv)
export AZURE_CLIENT_SECRET

# Setup environment variables for Terraform
export ARM_TENANT_ID="$AZURE_TENANT_ID"
export ARM_SUBSCRIPTION_ID="$AZURE_SUBSCRIPTION_ID"
export ARM_CLIENT_ID
export ARM_CLIENT_SECRET

# Retrieve ACR credentials
echo "Retrieving ACR credentials..."
ACR_USERNAME=$(az acr credential show --name "$ACR" --query "username" --output tsv)
ACR_PASSWORD=$(az acr credential show --name "$ACR" --query "passwords[0].value" --output tsv)

# Export variables for Terraform
export TF_VAR_acr_username="$ACR_USERNAME"
export TF_VAR_acr_password="$ACR_PASSWORD"

# Print all environment variables related to ARM and Terraform
echo "Environment variables:"
env | grep -E 'ARM_|TF_VAR_'

# Terraform import commands
echo "Preparing for Terraform import..."

# Import DNS Zone
echo "Importing azurerm_dns_zone.dns..."
terraform import azurerm_dns_zone.dns "/subscriptions/$AZURE_SUBSCRIPTION_ID/resourceGroups/$RNAME/providers/Microsoft.Network/dnsZones/timeentry-minijob.com" || echo "azurerm_dns_zone.dns needs manual intervention"

# Import Resource Group
echo "Importing azurerm_resource_group.rg..."
terraform import azurerm_resource_group.rg "/subscriptions/$AZURE_SUBSCRIPTION_ID/resourceGroups/$RNAME" || echo "azurerm_resource_group.rg needs manual intervention"

# Import Container Registry
echo "Importing azurerm_container_registry.acr..."
terraform import azurerm_container_registry.acr "/subscriptions/$AZURE_SUBSCRIPTION_ID/resourceGroups/$RNAME/providers/Microsoft.ContainerRegistry/registries/$ACR" || echo "azurerm_container_registry.acr needs manual intervention"

# Import Service Plan
echo "Importing azurerm_service_plan.asp..."
terraform import azurerm_service_plan.asp "/subscriptions/$AZURE_SUBSCRIPTION_ID/resourceGroups/$RNAME/providers/Microsoft.Web/serverFarms/$APPSERVICE" || echo "azurerm_service_plan.asp needs manual intervention"

# Import Linux Web App
echo "Importing azurerm_linux_web_app.webapp..."
terraform import azurerm_linux_web_app.webapp "/subscriptions/$AZURE_SUBSCRIPTION_ID/resourceGroups/$RNAME/providers/Microsoft.Web/sites/$WEB_APP" || echo "azurerm_linux_web_app.webapp needs manual intervention"

# Import Custom Hostname Binding for www
echo "Importing azurerm_app_service_custom_hostname_binding.custom_hostname..."
terraform import azurerm_app_service_custom_hostname_binding.custom_hostname "/subscriptions/$AZURE_SUBSCRIPTION_ID/resourceGroups/$RNAME/providers/Microsoft.Web/sites/$WEB_APP/hostNameBindings/$DNS_ZONE" || echo "azurerm_app_service_custom_hostname_binding.custom_hostname needs manual intervention"

# Import Custom Hostname Binding for www subdomain
echo "Importing azurerm_app_service_custom_hostname_binding.custom_hostname_www..."
terraform import azurerm_app_service_custom_hostname_binding.custom_hostname_www "/subscriptions/$AZURE_SUBSCRIPTION_ID/resourceGroups/$RNAME/providers/Microsoft.Web/sites/$WEB_APP/hostNameBindings/www.$DNS_ZONE" || echo "azurerm_app_service_custom_hostname_binding.custom_hostname_www needs manual intervention"

echo "Import completed."
