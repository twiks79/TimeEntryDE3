#!/bin/bash

# Environment Setup
echo "Setting up the environment variables..."
export AZURE_CLIENT_ID=$AZURE_CLIENT_ID
export AZURE_CLIENT_SECRET=$AZURE_CLIENT_SECRET
export AZURE_TENANT_ID=$AZURE_TENANT_ID
export AZURE_SUBSCRIPTION_ID=$AZURE_SUBSCRIPTION_ID


# Azure Login
echo "Logging in to Azure..."
az login --service-principal -u "$AZURE_CLIENT_ID" -p "$AZURE_CLIENT_SECRET" --tenant "$AZURE_TENANT_ID"

# Verify correct subscription is being used
az account set --subscription "$AZURE_SUBSCRIPTION_ID"


ACR_USERNAME=$(az acr credential show --name "timeentrydenextacr3333" --query username --output tsv)
ACR_PASSWORD=$(az acr credential show --name "timeentrydenextacr3333" --query "passwords[0].value" --output tsv)

export TF_VAR_acr_username="$ACR_USERNAME"
export TF_VAR_acr_password="$ACR_PASSWORD"


# Function to import a resource and handle errors
# -var="acr_username=${TF_VAR_acr_username}" -var="acr_password=${TF_VAR_acr_password}"
import_resource() {
    RESOURCE_TYPE="$1"
    RESOURCE_NAME="$2"
    RESOURCE_ID="$3"

    echo "Importing ${RESOURCE_TYPE} (${RESOURCE_NAME})..."
    terraform state rm "${RESOURCE_TYPE}.${RESOURCE_NAME}"
    if terraform import "${RESOURCE_TYPE}.${RESOURCE_NAME}" "${RESOURCE_ID}"; then
        echo "${RESOURCE_TYPE} (${RESOURCE_NAME}) imported successfully."
    else
        echo "ERROR: Failed to import ${RESOURCE_TYPE} (${RESOURCE_NAME}). Check if the resource exists and your configuration matches."
        exit 1
    fi
}

# Define resource details
RESOURCE_GROUP_NAME="timeentrydenext3333"
ACR_NAME="timeentrydenextacr3333"
APP_SERVICE_PLAN_NAME="timeentrydenextAppService-3333"
LINUX_WEB_APP_NAME="timeentrydenextWebApp-3333"
DNS_ZONE_NAME="timeentry-minijob.com"

# Import Commands
import_resource "azurerm_resource_group" "rg" "/subscriptions/$AZURE_SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP_NAME"
import_resource "azurerm_container_registry" "acr" "/subscriptions/$AZURE_SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP_NAME/providers/Microsoft.ContainerRegistry/registries/$ACR_NAME"
import_resource "azurerm_service_plan" "asp" "/subscriptions/$AZURE_SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP_NAME/providers/Microsoft.Web/serverFarms/$APP_SERVICE_PLAN_NAME"
import_resource "azurerm_linux_web_app" "webapp" "/subscriptions/$AZURE_SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP_NAME/providers/Microsoft.Web/sites/$LINUX_WEB_APP_NAME"
import_resource "azurerm_dns_zone" "dns" "/subscriptions/$AZURE_SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP_NAME/providers/Microsoft.Network/dnsZones/$DNS_ZONE_NAME"

# Import Log Analytics Workspace
LOG_ANALYTICS_WORKSPACE_NAME="${RESOURCE_GROUP_NAME}-logs"
import_resource "azurerm_log_analytics_workspace" "example" "/subscriptions/$AZURE_SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP_NAME/providers/Microsoft.OperationalInsights/workspaces/$LOG_ANALYTICS_WORKSPACE_NAME"

# Import Diagnostic Setting (Example)
# Note: Update the RESOURCE_ID for azurerm_monitor_diagnostic_setting to match your resource.
# DIAGNOSTIC_SETTING_ID="<Update-this-with-correct-resource-ID>"
# import_resource "azurerm_monitor_diagnostic_setting" "webapp_logs" "$DIAGNOSTIC_SETTING_ID"

# Import Custom Hostname Binding
import_resource "azurerm_app_service_custom_hostname_binding" "custom_hostname" "/subscriptions/$AZURE_SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP_NAME/providers/Microsoft.Web/sites/$LINUX_WEB_APP_NAME/hostNameBindings/$DNS_ZONE_NAME"
import_resource "azurerm_app_service_custom_hostname_binding" "custom_hostname_www" "/subscriptions/$AZURE_SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP_NAME/providers/Microsoft.Web/sites/$LINUX_WEB_APP_NAME/hostNameBindings/www.$DNS_ZONE_NAME"

echo "All imports completed."
