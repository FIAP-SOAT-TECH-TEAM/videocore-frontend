# Common
  output "resource_group_name_from_remote" {
    value       = data.terraform_remote_state.infra.outputs.resource_group_name
    description = "Grupo de recursos para implantação de recursos no Azure"
  }

# APIM
  output "api_public_url_from_remote" {
    value       = data.terraform_remote_state.infra.outputs.apim_gateway_url
    description = "URL do gateway HTTP do API Management"
  }

  output "api_ws_public_url_from_remote" {
    value       = data.terraform_remote_state.infra.outputs.apim_ws_gateway_url
    description = "URL do gateway WebSocket do API Management"
  }

  output "api_subscription_key_from_remote" {
    value       = data.terraform_remote_state.infra.outputs.apim_videocore_start_subscription_key
    description = "Chave de subscrição do API Management"
  }


# Cognito
  output "cognito_user_pool_id_from_remote" {
    value       = data.terraform_remote_state.infra.outputs.cognito_user_pool_id
    description = "ID do Cognito User Pool"
  }

  output "cognito_user_pool_client_id_from_remote" {
    value       = data.terraform_remote_state.infra.outputs.cognito_user_pool_client_id
    description = "ID do Cognito User Pool Client"
  }

  output "cognito_region_from_remote" {
    value       = data.terraform_remote_state.infra.outputs.aws_location
    description = "Reigião em que o Cognito foi implantado"
  }

# Blob Storage
  output "storage_account_name_from_remote" {
    value       = data.terraform_remote_state.infra.outputs.storage_account_name
    description = "Nome da conta de armazenamento para publicação dos arquivos estáticos da aplicação"
  }

# Front Door
  output "frontdoor_profile_name_from_remote" {
    value       =  data.terraform_remote_state.infra.outputs.frontdoor_profile_name
    description = "Nome do Profile utilizado no Front Door"
  }

  output "frontdoor_endpoint_name_from_remote" {
    value       =  data.terraform_remote_state.infra.outputs.frontdoor_endpoint_name
    description = "Nome do Endpoint utilizado no Front Door"
  }

  output "frontdoor_endpoint_hostname_from_remote" {
    value       =  data.terraform_remote_state.infra.outputs.frontdoor_endpoint_hostname
    description = "Hostname do Endpoint utilizado no Front Door"
  }
