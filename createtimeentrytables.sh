#!/bin/bash

# Define variables
# ask for user input for resource group and storage account name
read -p "Enter a resource group name: " resource_group
read -p "Enter a storage account name: " storage_account

# get github repo from the environment
#
github_repo=$GITHUB_REPOSITORY
location="westeurope"
storage_sku="Standard_GRS" # Cheapest SKU
github_repo=$GITHUB_REPOSITORY

# Check if az is logged in, exit if not
if [ -z "$(az account show 2> /dev/null)" ]; then
    echo "Please login to Azure first."
    # get AZURE_TENANT_ID from gh codespace secrets
    AZURE_TENANT_ID=$(gh secret get AZURE_TENANT_ID -r $GITHUB_REPOSITORY --json value -q)
    # login using device and tenant id
    az login --use-device-code --tenant $AZURE_TENANT_ID
fi

# Create Resource Group
az group create --name $resource_group --location $location

# Create Storage Account
az storage account create --name $storage_account --location $location --resource-group $resource_group --sku $storage_sku

# Retrieve the Storage Account Key
storage_key=$(az storage account keys list --account-name $storage_account --resource-group $resource_group --query "[0].value" -o tsv)

# Create Users Table
az storage table create --name Users --account-name $storage_account --account-key $storage_key

# Create Times Table
az storage table create --name Times --account-name $storage_account --account-key $storage_key

# Create Employer Table
az storage table create --name Employer --account-name $storage_account --account-key $storage_key

# Create Session Table
az storage table create --name Session --account-name $storage_account --account-key $storage_key

# Retrieve the Connection String
connection_string=$(az storage account show-connection-string --name $storage_account --resource-group $resource_group --query "connectionString" -o tsv)

# Set GitHub Codespaces Secrets
gh secret set TIMEENTRYTABLES --body "$storage_account" -r $github_repo
echo $TIMEENTRYTABLES

gh secret set TIMEENTRYTABLES_KEY --body "$storage_key" -r $github_repo
echo $TIMEENTRYTABLES_KEY

gh secret set TIMEENTRYTABLES_CONNECTION --body "$connection_string" -r $github_repo
echo $TIMEENTRYTABLES_CONNECTION

echo "GitHub Codespaces Secrets set"


echo "Resource Group, Storage Account, and Tables created successfully"
echo "Credentials set in GitHub Codespaces secrets"
