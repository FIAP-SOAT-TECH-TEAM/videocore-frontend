# Commn
  variable "subscription_id" {
    type        = string
    description = "Azure Subscription ID"
  }

# remote states
  variable "videocore-backend-resource-group" {
    type        = string
    description = "Nome do resource group onde o backend está armazenado"
  }

  variable "videocore-backend-storage-account" {
    type        = string
    description = "Nome da conta de armazenamento onde o backend está armazenado"
  }

  variable "videocore-backend-container" {
    type        = string
    description = "Nome do contêiner onde o backend está armazenado"
  }

  variable "videocore-backend-infra-key" {
    type        = string
    description = "Chave do arquivo tfstate do videocore-infra"
  }