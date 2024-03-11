#!/bin/bash

export ARM_TENANT_ID=$AZURE_TENANT_ID
export ARM_SUBSCRIPTION_ID=$AZURE_SUBSCRIPTION_ID
export ARM_CLIENT_ID=$AZURE_CLIENT_ID
export ARM_CLIENT_SECRET=$AZURE_CLIENT_SECRET
terraform init
#  terraform import azurerm_resource_group.rg /subscriptions/<subid>/resourceGroups/timeentrydenext2543