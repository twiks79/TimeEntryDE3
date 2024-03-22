terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
  backend "local" {
    path = "terraform.tfstate"
  }
}

provider "azurerm" {
  features {}
  skip_provider_registration = true
}

variable "core_name" {
  description = "The core name used as the base for naming resources"
  default     = "timeentrydenext"
}

variable "unique_number" {
  description = "A unique number to append to resources for uniqueness"
  default     = "3333"
}

variable "location" {
  description = "The Azure location where resources will be created"
  default     = "westeurope"
}

variable "acr_username" {
  description = "The username for the Azure Container Registry"
}

variable "acr_password" {
  description = "The password for the Azure Container Registry"
}

locals {
  resource_group_name   = "${var.core_name}${var.unique_number}"
  acr_name              = "${var.core_name}acr${var.unique_number}"
  app_service_plan_name = "${var.core_name}AppService-${var.unique_number}"
  linux_web_app_name    = "${var.core_name}WebApp-${var.unique_number}"
  dns_zone_name         = "timeentry-minijob.com"
  common_tags           = {}
}

resource "azurerm_resource_group" "rg" {
  name     = local.resource_group_name
  location = var.location

  tags = local.common_tags

  lifecycle {
    create_before_destroy = true
  }
}

resource "azurerm_container_registry" "acr" {
  name                = local.acr_name
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku                 = "Basic"

  admin_enabled = true
}

resource "azurerm_service_plan" "asp" {
  name                = local.app_service_plan_name
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  sku_name            = "B1"
  os_type             = "Linux"
}

resource "azurerm_linux_web_app" "webapp" {
  name                = local.linux_web_app_name
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  service_plan_id     = azurerm_service_plan.asp.id

  site_config {
    application_stack {
      # docker_image_name        = "${azurerm_container_registry.acr.login_server}/${local.acr_name}:latest"
      docker_image_name        = "/${local.acr_name}:latest"
      docker_registry_url      = "https://${azurerm_container_registry.acr.login_server}"
      docker_registry_username = var.acr_username
      docker_registry_password = var.acr_password
    }
    always_on = false
  }

  app_settings = {
    "WEBSITES_ENABLE_APP_SERVICE_STORAGE" = "false"
    "DOCKER_REGISTRY_SERVER_URL"          = "https://${azurerm_container_registry.acr.login_server}"
    "DOCKER_REGISTRY_SERVER_USERNAME"     = var.acr_username
    "DOCKER_REGISTRY_SERVER_PASSWORD"     = var.acr_password
  }
}

resource "azurerm_log_analytics_workspace" "example" {
  name                = "${local.resource_group_name}-logs"
  location            = var.location
  resource_group_name = azurerm_resource_group.rg.name
  sku                 = "PerGB2018"
}

resource "azurerm_monitor_diagnostic_setting" "webapp_logs" {
  name                       = "${local.linux_web_app_name}-logs"
  target_resource_id         = azurerm_linux_web_app.webapp.id
  log_analytics_workspace_id = azurerm_log_analytics_workspace.example.id

  log {
    category = "AppServiceConsoleLogs"
    enabled  = true

    retention_policy {
      days    = 90
      enabled = false
    }
  }

  log {
    category = "AppServiceHTTPLogs"
    enabled  = true

    retention_policy {
      days    = 90
      enabled = false
    }
  }

  metric {
    category = "AllMetrics"

    retention_policy {
      days    = 90
      enabled = false
    }
  }
}


resource "azurerm_dns_zone" "dns" {
  name                = local.dns_zone_name
  resource_group_name = azurerm_resource_group.rg.name
}

resource "azurerm_app_service_custom_hostname_binding" "custom_hostname" {
  hostname            = local.dns_zone_name
  app_service_name    = azurerm_linux_web_app.webapp.name
  resource_group_name = azurerm_resource_group.rg.name
}

resource "azurerm_app_service_custom_hostname_binding" "custom_hostname_www" {
  hostname            = "www.${local.dns_zone_name}"
  app_service_name    = azurerm_linux_web_app.webapp.name
  resource_group_name = azurerm_resource_group.rg.name
}

output "acr_login_server" {
  value = azurerm_container_registry.acr.login_server
}

output "acr_name" {
  value = azurerm_container_registry.acr.name
}

output "resource_group_name" {
  value = azurerm_resource_group.rg.name
}

output "web_app_name" {
  value = azurerm_linux_web_app.webapp.name
}
