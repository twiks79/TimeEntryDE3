terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

variable "azure_tenant_id" {}
variable "azure_subscription_id" {}
variable "azure_client_id" {}
variable "azure_client_secret" {}

provider "azurerm" {
  features {}

  tenant_id       = var.azure_tenant_id
  subscription_id = var.azure_subscription_id
  client_id       = var.azure_client_id
  client_secret   = var.azure_client_secret
}

resource "random_integer" "random_number" {
  min = 1000
  max = 9999
}

resource "azurerm_resource_group" "rg" {}