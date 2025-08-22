# Deploying Sudoku Game to Azure Static Web Apps

This guide will help you deploy your Sudoku game to Azure Static Web Apps.

## Prerequisites

1. **Azure Account**: You need an active Azure subscription
2. **Azure CLI**: Install the Azure CLI from [Microsoft's official site](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
3. **GitHub Account**: For automated deployments (optional but recommended)

## Option 1: Quick Deployment with PowerShell Script

1. **Navigate to the sudoku-app directory**:
   ```powershell
   cd sudoku-app
   ```

2. **Run the deployment script**:
   ```powershell
   .\deploy-to-azure.ps1
   ```

3. **Follow the prompts** to log in to Azure and GitHub if needed

## Option 2: Manual Deployment

### Step 1: Build the App
```powershell
cd sudoku-app
npm run build
```

### Step 2: Login to Azure
```powershell
az login
```

### Step 3: Create Resource Group
```powershell
az group create --name sudoku-game-rg --location "East US"
```

### Step 4: Create Static Web App
```powershell
az staticwebapp create `
    --name "sudoku-game-$(Get-Random -Minimum 1000 -Maximum 9999)" `
    --resource-group sudoku-game-rg `
    --source . `
    --location "East US" `
    --branch main `
    --app-location "/" `
    --output-location "build" `
    --login-with-github
```

## Option 3: GitHub Actions (Recommended for Continuous Deployment)

1. **Push your code to GitHub** (if not already done)

2. **Set up Azure Static Web App**:
   - Go to [Azure Portal](https://portal.azure.com)
   - Create a new "Static Web App" resource
   - Connect it to your GitHub repository
   - Configure build settings:
     - App location: `/`
     - Output location: `build`
     - API location: (leave empty)

3. **Copy the deployment token** from Azure and add it to your GitHub repository secrets as `AZURE_STATIC_WEB_APPS_API_TOKEN`

4. **Push to main branch** - the GitHub Action will automatically deploy your app

## Configuration Files

- **`.github/workflows/azure-static-web-apps.yml`**: GitHub Actions workflow for CI/CD
- **`staticwebapp.config.json`**: Azure Static Web App configuration for routing

## After Deployment

- Your app will be available at: `https://[app-name].azurestaticapps.net`
- Monitor your app in the [Azure Portal](https://portal.azure.com)
- Set up custom domains if needed

## Troubleshooting

### Common Issues:

1. **Build fails**: Check that all dependencies are installed (`npm install`)
2. **Deployment fails**: Verify Azure CLI is installed and you're logged in
3. **App not accessible**: Check the static web app configuration and routing rules

### Useful Commands:

```powershell
# Check Azure CLI version
az --version

# List your Azure subscriptions
az account list

# Check current subscription
az account show

# List static web apps
az staticwebapp list --resource-group sudoku-game-rg

# Get deployment details
az staticwebapp show --name [app-name] --resource-group sudoku-game-rg
```

## Cost Considerations

- Azure Static Web Apps have a generous free tier
- Free tier includes: 2GB storage, 100GB bandwidth per month
- Additional usage is charged per GB
- No charges for stopped apps

## Next Steps

After successful deployment:
1. Test your app thoroughly
2. Set up monitoring and analytics
3. Configure custom domains if needed
4. Set up staging environments for testing
