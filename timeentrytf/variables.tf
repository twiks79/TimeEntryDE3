variable "resource_group_name" {
  type        = string
  description = "Name of the resource group"
  default = "test"
}

variable "location" {
  type        = string
  description = "Location of the resources"
  default     = "eastus"
}

variable "app_service_plan_name" {
  type        = string
  description = "Name of the App Service Plan"
  default = "test"
}

variable "app_name" {
  type        = string
  description = "Name of the Web App"
  default = "test"
}

variable "prefix" {
  type        = string
  description = "Prefix for resource naming"
  default     = "timeentrydenext"
}