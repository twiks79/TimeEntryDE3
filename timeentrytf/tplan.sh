#!/bin/bash

# check if SPTimeEntry service principal is already there


az ad sp create-for-rbac --name "SPTimeEntry" --role="Contributor" --scopes="/subscriptions/"$AZURE_SUBSCRIPTION_ID

# get the client id
export AZURE_CLIENT_ID=$(az ad sp list --display-name SPTimeEntry --query "[].appId" -o tsv)

# get the client secret
export AZURE_CLIENT_SECRET=$(az ad sp credential reset --name $AZURE_CLIENT_ID --query "password" -o tsv)

# az login --service-principal -u $AZURE_CLIENT_ID -p $AZURE_CLIENT_SECRET --tenant $AZURE_TENANT_ID
export ARM_TENANT_ID=$AZURE_TENANT_ID
export ARM_SUBSCRIPTION_ID=$AZURE_SUBSCRIPTION_ID
export ARM_CLIENT_ID=$AZURE_CLIENT_ID
export ARM_CLIENT_SECRET=$AZURE_CLIENT_SECRET

ACR_USERNAME=$(az acr credential show --name "timeentrydenextacr3333" --query username --output tsv)
ACR_PASSWORD=$(az acr credential show --name "timeentrydenextacr3333" --query "passwords[0].value" --output tsv)

export TF_VAR_acr_username="$ACR_USERNAME"
export TF_VAR_acr_password="$ACR_PASSWORD"

# print all environement variables
env | grep ARM
env | grep TF_VAR

terraform plan -var="acr_username=${TF_VAR_acr_username}" -var="acr_password=${TF_VAR_acr_password}"
