# Retrieve the Container Registry login server
ACR_LOGIN_SERVER=$(terraform output -raw acr_login_server)

# Retrieve ACR Credentials
ACR_CREDENTIALS=$(az acr credential show --name "$(terraform output -raw acr_name)" --resource-group "$(terraform output -raw resource_group_name)")
ACR_USERNAME=$(echo $ACR_CREDENTIALS | jq -r '.username')
ACR_PASSWORD=$(echo $ACR_CREDENTIALS | jq -r '.passwords[0].value')

# Log into the Container Registry
az acr login --name "$(terraform output -raw acr_name)"

# Build and push the Docker image
cd timeentrydenjs2
docker build -t $ACR_LOGIN_SERVER/timeentrydenext:latest .
docker push $ACR_LOGIN_SERVER/timeentrydenext:latest

# Configure the Web App to use the Docker image
az webapp config container set \
  --name "$(terraform output -raw web_app_name)" \
  --resource-group "$(terraform output -raw resource_group_name)" \
  --docker-registry-server-url "https://$ACR_LOGIN_SERVER" \
  --docker-registry-server-user "$ACR_USERNAME" \
  --docker-registry-server-password "$ACR_PASSWORD" \
  --docker-custom-image-name "$ACR_LOGIN_SERVER/timeentrydenext:latest"