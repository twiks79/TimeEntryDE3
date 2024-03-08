#!/bin/bash

# Constants
PREFIX="timeentrydenext"

LOG_FILE="log.txt"

# Redirect stdout and stderr to both terminal and log file
exec > >(tee -a $LOG_FILE) 2>&1

# Generate a unique resource group name
RANDOM_NUMBER=$(shuf -i 2000-65000 -n 1) # Generate a random number
RESOURCE_GROUP="${PREFIX}${RANDOM_NUMBER}"
LOCATION="westeurope"
APP_SERVICE_PLAN="${PREFIX}AppService-${RANDOM_NUMBER}"
WEB_APP="${PREFIX}WebApp-${RANDOM_NUMBER}"
ACR_NAME="${PREFIX}acr${RANDOM_NUMBER}"  # ACR name
PROJECT_DIR="timeentrydenjs2"
DOCKER_IMAGE="${PREFIX}dockerimage-${RANDOM_NUMBER}"  # Docker image name
IMAGE_TAG="latest"

# Check if az is logged in, exit if not
if [ -z "$(az account show 2> /dev/null)" ]; then
    echo "Please login to Azure first."
    exit 1
fi

# Search and delete existing resource groups with the same prefix
echo "Searching for existing resource groups starting with $PREFIX..."
EXISTING_GROUPS=$(az group list --query "[?starts_with(name, '${PREFIX}')].name" --output tsv)

for rg in $EXISTING_GROUPS; do
    echo "Deleting resource group $rg..."
    az group delete --name $rg --yes --no-wait
done