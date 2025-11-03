# Deployment Guide - Business Central Time Tracker

This guide walks through deploying the complete solution: Azure Functions backend and Zendesk app.

## Architecture Overview

```
Zendesk Browser App → Azure Functions Backend → Business Central API
                      (OAuth 2.0 Authentication)
```

The backend solves the OAuth CORS problem by handling authentication server-side.

---

## Part 1: Azure AD App Registration

### Step 1: Register Application in Azure AD

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations** > **New registration**

3. Configure registration:
   - **Name**: `Zendesk-BC-Time-Tracker`
   - **Supported account types**: Accounts in this organizational directory only (Single tenant)
   - **Redirect URI**: Leave blank (not needed for S2S)

4. Click **Register**

### Step 2: Create Client Secret

1. In your app registration, go to **Certificates & secrets**
2. Click **New client secret**
   - **Description**: `Zendesk BC Backend Secret`
   - **Expires**: Choose appropriate duration (6 months, 12 months, or 24 months)
3. Click **Add**
4. **IMPORTANT**: Copy the secret **Value** immediately (you won't be able to see it again)

### Step 3: Note Required Values

Copy these values - you'll need them for Azure Functions configuration:

- **Application (client) ID**: Found on Overview page
- **Directory (tenant) ID**: Found on Overview page
- **Client Secret**: The value you just copied
- **Business Central Company ID**: From your BC environment
- **BC Environment Name**: Usually "production" or "sandbox"

### Step 4: Configure API Permissions

1. Go to **API permissions** > **Add a permission**
2. Select **Dynamics 365 Business Central**
3. Select **Application permissions** (not Delegated)
4. Check **Automation.ReadWrite.All** or **user_impersonation** based on your BC setup
5. Click **Add permissions**
6. Click **Grant admin consent for [Your Organization]**

---

## Part 2: Deploy Azure Functions Backend

### Option A: Deploy via Azure CLI (Recommended)

#### Prerequisites

- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) installed
- [Node.js 18+](https://nodejs.org/) installed
- Azure subscription

#### Steps

1. **Login to Azure**

```bash
az login
```

2. **Create Resource Group** (if needed)

```bash
az group create --name rg-zendesk-bc --location eastus
```

3. **Create Storage Account**

```bash
az storage account create \
  --name stzendeskbc \
  --resource-group rg-zendesk-bc \
  --location eastus \
  --sku Standard_LRS
```

4. **Create Function App**

```bash
az functionapp create \
  --name func-zendesk-bc \
  --resource-group rg-zendesk-bc \
  --storage-account stzendeskbc \
  --consumption-plan-location eastus \
  --runtime node \
  --runtime-version 18 \
  --functions-version 4 \
  --os-type Linux
```

5. **Configure Application Settings**

Replace placeholders with your actual values:

```bash
az functionapp config appsettings set \
  --name func-zendesk-bc \
  --resource-group rg-zendesk-bc \
  --settings \
    "BC_TENANT_ID=<your-tenant-id>" \
    "BC_CLIENT_ID=<your-client-id>" \
    "BC_CLIENT_SECRET=<your-client-secret>" \
    "BC_ENVIRONMENT=production" \
    "BC_COMPANY_ID=<your-company-id>" \
    "BC_API_ENDPOINT=https://api.businesscentral.dynamics.com/v2.0" \
    "ALLOWED_ORIGINS=https://*.zendesk.com"
```

6. **Deploy the Backend Code**

From the `backend` directory:

```bash
cd backend
npm install
func azure functionapp publish func-zendesk-bc
```

7. **Get Function App URL**

```bash
az functionapp show \
  --name func-zendesk-bc \
  --resource-group rg-zendesk-bc \
  --query "defaultHostName" \
  --output tsv
```

The output will be: `func-zendesk-bc.azurewebsites.net`

Your backend URL will be: `https://func-zendesk-bc.azurewebsites.net/api`

### Option B: Deploy via Azure Portal

1. **Create Function App**
   - Go to [Azure Portal](https://portal.azure.com)
   - Click **Create a resource** > **Function App**
   - Configure:
     - **Resource Group**: Create new or use existing
     - **Function App name**: `func-zendesk-bc` (must be globally unique)
     - **Runtime stack**: Node.js
     - **Version**: 18 LTS
     - **Region**: Choose nearest region
     - **Operating System**: Linux
     - **Plan type**: Consumption (Serverless)
   - Click **Review + create** > **Create**

2. **Configure Application Settings**
   - Go to your Function App
   - Navigate to **Configuration** > **Application settings**
   - Add the following settings (click **New application setting** for each):

   ```
   BC_TENANT_ID = <your-tenant-id>
   BC_CLIENT_ID = <your-client-id>
   BC_CLIENT_SECRET = <your-client-secret>
   BC_ENVIRONMENT = production
   BC_COMPANY_ID = <your-company-id>
   BC_API_ENDPOINT = https://api.businesscentral.dynamics.com/v2.0
   ALLOWED_ORIGINS = https://*.zendesk.com
   ```

   - Click **Save**

3. **Deploy Code**
   - Install [Azure Functions Core Tools](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local)
   - From the `backend` directory:

   ```bash
   cd backend
   npm install
   func azure functionapp publish func-zendesk-bc
   ```

4. **Get Function App URL**
   - Go to your Function App in Azure Portal
   - Click **Overview**
   - Copy the **URL** (e.g., `https://func-zendesk-bc.azurewebsites.net`)
   - Your API base URL: `https://func-zendesk-bc.azurewebsites.net/api`

### Verify Backend Deployment

Test the health endpoint:

```bash
curl https://func-zendesk-bc.azurewebsites.net/api/health
```

Expected response:

```json
{
  "success": true,
  "message": "Backend is healthy",
  "timestamp": "2025-01-03T12:34:56.789Z",
  "version": "1.0.0"
}
```

---

## Part 3: Deploy Zendesk App

### Step 1: Package the App

From the project root directory:

```powershell
.\create-package.ps1
```

This creates `zendesk-bc-timetracker.zip` (should be around 56KB).

Verify the package:

```powershell
powershell -Command "Add-Type -Assembly System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::OpenRead('zendesk-bc-timetracker.zip').Entries | Select-Object FullName, Length"
```

### Step 2: Upload to Zendesk

1. Go to your Zendesk Admin Center
2. Navigate to **Apps and integrations** > **Zendesk Support apps** > **Manage**
3. Click **Upload private app** in the top right
4. Choose `zendesk-bc-timetracker.zip`
5. Click **Upload**

### Step 3: Configure the App

After upload, you'll be prompted to configure:

1. **Backend URL**: Enter your Azure Function App URL
   - Example: `https://func-zendesk-bc.azurewebsites.net/api`
   - **IMPORTANT**: Do NOT include trailing slash
   - **IMPORTANT**: Include `/api` at the end

2. Click **Install**

### Step 4: Enable the App

1. After installation, the app should appear in your apps list
2. Make sure it's **enabled**
3. The app will now appear in the ticket sidebar

---

## Part 4: Testing

### Test 1: Health Check

Open browser console in Zendesk and run:

```javascript
fetch('https://func-zendesk-bc.azurewebsites.net/api/health')
  .then(r => r.json())
  .then(console.log)
```

Expected: `{ success: true, message: "Backend is healthy", ... }`

### Test 2: Check Employees

```javascript
fetch('https://func-zendesk-bc.azurewebsites.net/api/bc/employees')
  .then(r => r.json())
  .then(console.log)
```

Expected: `{ success: true, data: [...], count: X }`

### Test 3: Check Customers

```javascript
fetch('https://func-zendesk-bc.azurewebsites.net/api/bc/customers')
  .then(r => r.json())
  .then(console.log)
```

### Test 4: Complete Workflow

1. Open a Zendesk ticket
2. Look for the app in the right sidebar
3. The app should load and show:
   - Customer dropdown (populated)
   - Project dropdown (populated after selecting customer)
   - Time input field
   - Description field
   - Submit button
4. Select a customer, project, enter time, add description
5. Click **Log Time**
6. Check Business Central to verify the entry was created

---

## Troubleshooting

### Backend Issues

#### 1. "401 Unauthorized" from BC API

**Cause**: OAuth credentials are incorrect or expired.

**Solutions**:
- Verify tenant ID, client ID, and client secret in Azure Function app settings
- Check that admin consent was granted in Azure AD
- Verify the client secret hasn't expired
- Check BC API permissions in Azure AD app registration

#### 2. "CORS Error" in Browser Console

**Cause**: CORS not configured correctly in backend.

**Solutions**:
- Verify `ALLOWED_ORIGINS` in Function App settings includes `https://*.zendesk.com`
- Check that the backend `cors.js` utility is being used in all endpoints
- Ensure all endpoints handle OPTIONS preflight requests

#### 3. Backend Functions Not Responding

**Cause**: Function app not started or deployment failed.

**Solutions**:
- Go to Azure Portal > Your Function App > **Functions**
- Verify all 5 functions are listed: health, customers, jobs, employees, timeEntries
- Check **Monitor** > **Logs** for any errors
- Restart the Function App: **Overview** > **Restart**

#### 4. Backend Returns "500 Internal Server Error"

**Cause**: Error in backend code or BC API call.

**Solutions**:
- Check Function App logs: **Monitor** > **Logs** (or use Log Stream)
- Verify all environment variables are set correctly
- Check BC API endpoint is correct
- Ensure company ID format is correct (should be a GUID)

### Zendesk App Issues

#### 1. App Not Loading in Sidebar

**Cause**: App not installed or not enabled.

**Solutions**:
- Verify app is installed: Admin Center > Apps > Zendesk Support apps > Manage
- Check app is **enabled** (toggle should be on)
- Try reloading the ticket page
- Check browser console for errors

#### 2. "Failed to Initialize" Error

**Cause**: Backend URL not configured correctly.

**Solutions**:
- Go to Admin Center > Apps > Manage > Your App > Settings
- Verify Backend URL is correct:
  - Should include `/api` at the end
  - Should NOT have trailing slash
  - Should use HTTPS
- Example correct URL: `https://func-zendesk-bc.azurewebsites.net/api`

#### 3. Dropdowns Not Populating

**Cause**: Backend not returning data or BC has no data.

**Solutions**:
- Open browser console (F12)
- Check for error messages
- Test backend endpoints directly (see Testing section)
- Verify BC has customers and jobs/projects
- Check that the employee's email in Zendesk matches an employee in BC

#### 4. "Failed to Log Time" Error

**Cause**: Time entry creation failed in BC.

**Solutions**:
- Check browser console for detailed error message
- Verify employee exists in BC with matching email
- Check job/project is not closed or blocked
- Verify time entry entity exists in BC (may need custom API if using custom entities)
- Check backend logs in Azure Portal

### Getting Logs

**Backend Logs**:
```bash
# Real-time logs
func azure functionapp logstream func-zendesk-bc

# Or via Azure Portal
# Go to Function App > Monitor > Log stream
```

**Zendesk App Logs**:
- Open browser Developer Tools (F12)
- Go to **Console** tab
- Look for messages prefixed with app name or errors

---

## Security Best Practices

1. **Client Secret Management**
   - Store client secret securely in Azure Key Vault (optional but recommended)
   - Set appropriate expiration (6-12 months)
   - Document secret renewal process

2. **CORS Configuration**
   - Keep `ALLOWED_ORIGINS` restrictive (only Zendesk domains)
   - Never use `*` for production

3. **API Permissions**
   - Grant minimum required permissions in Azure AD
   - Review permissions periodically

4. **Monitoring**
   - Enable Application Insights for Azure Functions
   - Set up alerts for failures
   - Monitor token refresh rate

---

## Cost Estimation

**Azure Functions (Consumption Plan)**:
- First 1 million executions: Free
- After that: $0.20 per million executions
- Typical usage: ~10-50 executions per time entry
- **Estimated monthly cost**: $0-5 for small teams (<100 agents)

**Azure Storage** (required for Functions):
- ~$1-2 per month for minimal usage

**Total estimated monthly cost**: $1-7 for small deployments

---

## Maintenance

### Renewing Client Secret

When the client secret expires (you'll get 401 errors):

1. Go to Azure AD > App registrations > Your app
2. Navigate to **Certificates & secrets**
3. Create a new client secret
4. Update Function App settings:
   ```bash
   az functionapp config appsettings set \
     --name func-zendesk-bc \
     --resource-group rg-zendesk-bc \
     --settings "BC_CLIENT_SECRET=<new-secret>"
   ```
5. Restart Function App

### Updating Backend Code

```bash
cd backend
git pull  # or make your changes
npm install
func azure functionapp publish func-zendesk-bc
```

### Updating Zendesk App

1. Make changes to frontend code
2. Run `npm run build`
3. Run `.\create-package.ps1`
4. Upload new zip file to Zendesk (will update existing app)

---

## Support

For issues or questions:
- Check Azure Function logs
- Check Zendesk app console logs
- Verify all configuration values are correct
- Test each component independently (backend health, BC API access, etc.)

---

## Environment Variables Reference

### Azure Functions Required Settings

| Variable | Description | Example |
|----------|-------------|---------|
| `BC_TENANT_ID` | Azure AD Tenant ID | `12345678-1234-1234-1234-123456789abc` |
| `BC_CLIENT_ID` | Azure AD App Client ID | `87654321-4321-4321-4321-abcdef123456` |
| `BC_CLIENT_SECRET` | Azure AD App Client Secret | `abc123...` (keep secret!) |
| `BC_ENVIRONMENT` | BC environment name | `production` or `sandbox` |
| `BC_COMPANY_ID` | BC Company GUID | `98765432-8765-8765-8765-fedcba987654` |
| `BC_API_ENDPOINT` | BC API base URL | `https://api.businesscentral.dynamics.com/v2.0` |
| `ALLOWED_ORIGINS` | Allowed CORS origins | `https://*.zendesk.com` |

### Zendesk App Settings

| Setting | Description | Example |
|---------|-------------|---------|
| `backend_url` | Azure Functions base URL | `https://func-zendesk-bc.azurewebsites.net/api` |

---

## API Endpoints Reference

All endpoints use base URL: `https://<your-function-app>.azurewebsites.net/api`

### GET /health
Health check endpoint.

**Response**:
```json
{
  "success": true,
  "message": "Backend is healthy",
  "timestamp": "2025-01-03T12:34:56.789Z",
  "version": "1.0.0"
}
```

### GET /bc/customers
Get all customers from Business Central.

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "guid",
      "number": "C001",
      "displayName": "Acme Corp"
    }
  ],
  "count": 1
}
```

### GET /bc/jobs?customerId={id}
Get jobs/projects, optionally filtered by customer.

**Query Parameters**:
- `customerId` (optional): Filter by customer ID

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "guid",
      "number": "J001",
      "description": "Website Redesign"
    }
  ],
  "count": 1
}
```

### GET /bc/employees?email={email}
Get employees, optionally filtered by email.

**Query Parameters**:
- `email` (optional): Filter by employee email

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "guid",
      "number": "E001",
      "displayName": "John Doe",
      "email": "john@company.com"
    }
  ],
  "count": 1
}
```

### POST /bc/timeEntries
Create a time registration entry.

**Request Body**:
```json
{
  "employeeId": "guid",
  "jobId": "guid",
  "jobNumber": "J001",
  "jobTaskNumber": "",
  "date": "2025-01-03",
  "quantity": 2.5,
  "description": "Worked on feature X - Zendesk Ticket: https://..."
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "guid",
    "number": "TR001",
    ...
  }
}
```

---

## Next Steps

After successful deployment:

1. **Train Users**: Show Zendesk agents how to use the time tracker
2. **Monitor Usage**: Check Azure Function metrics and costs
3. **Gather Feedback**: Get input from users for improvements
4. **Iterate**: Add features like:
   - Time entry history view
   - Edit/delete existing entries
   - Bulk time entry
   - Reports and dashboards
