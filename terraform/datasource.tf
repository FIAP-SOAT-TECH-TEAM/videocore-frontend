data "terraform_remote_state" "infra" {
  backend = "azurerm"
  config = {
    resource_group_name  = var.videocore-backend-resource-group
    storage_account_name = var.videocore-backend-storage-account
    container_name       = var.videocore-backend-container
    subscription_id      = var.subscription_id
    key                  = var.videocore-backend-infra-key
  }
}