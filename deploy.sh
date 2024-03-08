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
    # get AZURE_TENANT_ID from gh codespace secrets
    AZURE_TENANT_ID=$(gh secret get AZURE_TENANT_ID -r $GITHUB_REPOSITORY --json value -q)
    # login using device and tenant id
    az login --use-device-code --tenant $AZURE_TENANT_ID
fi

# Search and delete existing resource groups with the same prefix
echo "Searching for existing resource groups starting with $PREFIX..."
EXISTING_GROUPS=$(az group list --query "[?starts_with(name, '${PREFIX}')].name" --output tsv)

for rg in $EXISTING_GROUPS; do
    echo "Deleting resource group $rg..."
    az group delete --name $rg --yes --no-wait
done

# get github repo from the environment
GITHUB_REPOSITORY=$GITHUB_REPOSITORY
echo "GitHub Repository: $GITHUB_REPOSITORY"

# get AZURE_SUBSCRIPTION_ID from gh codespace secrets
AZURE_SUBSCRIPTION_ID=$(gh secret get AZURE_SUBSCRIPTION_ID -r $GITHUB_REPOSITORY --json value -q) 
echo "Azure Subscription ID: $AZURE_SUBSCRIPTION_ID"

# Ensure Azure subscription is set
az account set --subscription $AZURE_SUBSCRIPTION_ID

# Create a new resource group
echo "Creating resource group $RESOURCE_GROUP..."
az group create --name $RESOURCE_GROUP --location $LOCATION

# Rest of your script follows...


# Create an Azure Container Registry
echo "Creating Azure Container Registry..."
az acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --sku Basic --admin-enabled true

# Get the ACR login server name
ACR_LOGIN_SERVER=$(az acr show --name $ACR_NAME --resource-group $RESOURCE_GROUP --query "loginServer" --output tsv)
echo "ACR Login Server: $ACR_LOGIN_SERVER"

# Retrieve ACR Credentials
echo "Retrieving Azure Container Registry credentials..."
ACR_CREDENTIALS=$(az acr credential show --name $ACR_NAME --resource-group $RESOURCE_GROUP)
ACR_USERNAME=$(echo $ACR_CREDENTIALS | jq -r '.username')
ACR_PASSWORD=$(echo $ACR_CREDENTIALS | jq -r '.passwords[0].value')


# Get the ACR login server name
ACR_LOGIN_SERVER=$(az acr show --name $ACR_NAME --resource-group $RESOURCE_GROUP --query "loginServer" --output tsv)
echo "ACR Login Server: $ACR_LOGIN_SERVER"

# Logging into Azure Container Registry
echo "Logging into Azure Container Registry..."
az acr login --name $ACR_NAME

# Logging into Azure Container Registry before the Docker build process
echo "Logging into Azure Container Registry..."
az acr login --name $ACR_NAME

# Retrieve ACR Credentials for Docker login
echo "Retrieving Azure Container Registry credentials..."
ACR_CREDENTIALS=$(az acr credential show --name $ACR_NAME --resource-group $RESOURCE_GROUP)
ACR_USERNAME=$(echo $ACR_CREDENTIALS | jq -r '.username')
ACR_PASSWORD=$(echo $ACR_CREDENTIALS | jq -r '.passwords[0].value')

echo "Logging into Docker registry..."
docker login $ACR_LOGIN_SERVER -u $ACR_USERNAME -p $ACR_PASSWORD

# Before building and pushing Docker Image
echo "Current Directory: $(pwd)"
cd $PROJECT_DIR
echo "Directory for Docker Build: $(pwd)"
docker buildx build -t $DOCKER_IMAGE:$IMAGE_TAG .
docker tag $DOCKER_IMAGE:$IMAGE_TAG $ACR_LOGIN_SERVER/$DOCKER_IMAGE:$IMAGE_TAG
# ...

# Before pushing Docker image
echo "Local Docker Images:"
docker images

# echo "Logging into Docker registry..."
# docker login $ACR_LOGIN_SERVER -u $ACR_USERNAME -p $ACR_PASSWORD

echo "Pushing Docker Image to ACR..."
docker push $ACR_LOGIN_SERVER/$DOCKER_IMAGE:$IMAGE_TAG
cd ..

# Create an App Service plan
echo "Creating App Service plan..."
az appservice plan create --name $APP_SERVICE_PLAN --resource-group $RESOURCE_GROUP --location $LOCATION --sku B1 --is-linux

# Create a web app with Docker container
echo "Creating Web App..."
az webapp create --resource-group $RESOURCE_GROUP --plan $APP_SERVICE_PLAN --name $WEB_APP --deployment-container-image-name $ACR_LOGIN_SERVER/$DOCKER_IMAGE:$IMAGE_TAG

# After creating the web app
echo "Checking Web App Configuration..."
az webapp config show --name $WEB_APP --resource-group $RESOURCE_GROUP
# ...

echo "Deployment complete. Visit your app at http://${WEB_APP}.azurewebsites.net"
