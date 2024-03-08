#!/bin/bash

# Constants
PRODUCTION_DOMAIN="timeentry-minijob.com"

# Check if az is logged in, exit if not
if [ -z "$(az account show 2> /dev/null)" ]; then
    echo "Please login to Azure first."
    exit 1
fi

# Get Azure subscription ID
AZURE_SUBSCRIPTION_ID=$(az account show --query "id" --output tsv)
echo "Azure Subscription ID: $AZURE_SUBSCRIPTION_ID"

# Ensure Azure subscription is set
az account set --subscription $AZURE_SUBSCRIPTION_ID

# Check if the required arguments are provided
if [ -z "$1" ]; then
    echo "Usage: $0 <web_app_name>"
    exit 1
fi

WEB_APP_NAME="$1"

# Generate the resource group name from the web app name
RESOURCE_GROUP="${WEB_APP_NAME/WebApp-/}"
echo "Resource Group: $RESOURCE_GROUP"

# Map the App Service Domain to the Web App
echo "Mapping App Service Domain $PRODUCTION_DOMAIN to $WEB_APP_NAME..."
az webapp config hostname add --webapp-name $WEB_APP_NAME --resource-group $RESOURCE_GROUP --hostname $PRODUCTION_DOMAIN
echo "App Service Domain $PRODUCTION_DOMAIN is now mapped to $WEB_APP_NAME."