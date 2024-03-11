

# Configure the Azure provider
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }

  # Generate a random number for resource naming
  random_integer = "random_integer"
}

provider "azurerm" {
  features {}
    tenant_id       = env("AZURE_TENANT_ID")
  subscription_id = env("AZURE_SUBSCRIPTION_ID")
  client_id       = env("AZURE_CLIENT_ID")
  client_secret   = env("AZURE_CLIENT_SECRET")
}

# Generate a random number for resource naming
resource "random_integer" "random_number" {
  min = 2000
  max = 65000
}

# Resource Group
resource "azurerm_resource_group" "rg" {
  name     = "timeentrydenext${random_integer.random_number.result}"
  location = "West Europe"
}

# Container Registry
resource "azurerm_container_registry" "acr" {
  name                = "timeentrydenextacr${random_integer.random_number.result}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku                 = "Basic"
  admin_enabled       = true
}

# App Service Plan
resource "azurerm_service_plan" "app_service_plan" {
  name                = "timeentrydenextAppService-${random_integer.random_number.result}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  os_type             = "Linux"
  sku_name            = "B1"
}

# Web App
resource "azurerm_linux_web_app" "web_app" {
  name                = "timeentrydenextWebApp-${random_integer.random_number.result}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  service_plan_id     = azurerm_service_plan.app_service_plan.id

  site_config {
    application_stack {
      node_version = "16.14.2"
    }
  }
}