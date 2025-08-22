# Azure Static Web Apps Deployment Script
# Run this script from the sudoku-app directory

Write-Host "Deploying Sudoku Game to Azure Static Web Apps..." -ForegroundColor Green

# Check if Azure CLI is installed
try {
    az --version | Out-Null
    Write-Host "Azure CLI is installed" -ForegroundColor Green
} catch {
    Write-Host "Azure CLI is not installed. Please install it first:" -ForegroundColor Red
    Write-Host "   https://docs.microsoft.com/en-us/cli/azure/install-azure-cli" -ForegroundColor Yellow
    exit 1
}

# Check if logged in to Azure
try {
    $account = az account show --query "user.name" -o tsv 2>$null
    if ($account) {
        Write-Host "Logged in as: $account" -ForegroundColor Green
    } else {
        Write-Host "Not logged in to Azure. Please run: az login" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Not logged in to Azure. Please run: az login" -ForegroundColor Red
    exit 1
}

# Build the React app
Write-Host "Building React app..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Build completed successfully" -ForegroundColor Green

# Create resource group (if it doesn't exist)
$resourceGroupName = "sudoku-game-rg"
$location = "East US"

Write-Host "Creating resource group: $resourceGroupName" -ForegroundColor Yellow
az group create --name $resourceGroupName --location $location

# Create Static Web App
$appName = "sudoku-game-$(Get-Random -Minimum 1000 -Maximum 9999)"
Write-Host "Creating Static Web App: $appName" -ForegroundColor Yellow

az staticwebapp create `
    --name $appName `
    --resource-group $resourceGroupName `
    --source . `
    --location $location `
    --branch main `
    --app-location "/" `
    --output-location "build" `
    --login-with-github

Write-Host "Deployment completed!" -ForegroundColor Green
Write-Host "Your app is available at: https://$appName.azurestaticapps.net" -ForegroundColor Cyan
Write-Host "Monitor your app in the Azure Portal" -ForegroundColor Cyan
