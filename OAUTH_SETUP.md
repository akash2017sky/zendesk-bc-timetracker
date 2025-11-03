# OAuth 2.0 Setup Guide for Business Central

This app now uses **OAuth 2.0 Client Credentials flow** for secure authentication with Business Central.

## Why OAuth?

✅ **More Secure**: No username/password storage
✅ **Better Control**: Manage permissions via Azure AD
✅ **Token-Based**: Automatic token refresh
✅ **Recommended**: Microsoft's preferred authentication method

---

## Step 1: Register App in Azure AD

### 1.1 Go to Azure Portal

Navigate to: [Azure Portal](https://portal.azure.com) → **Azure Active Directory**

### 1.2 Register New Application

1. Click **"App registrations"** in left menu
2. Click **"New registration"**
3. Fill in:
   - **Name**: `Zendesk BC Time Tracker`
   - **Supported account types**: `Accounts in this organizational directory only`
   - **Redirect URI**: Leave blank (not needed for client credentials)
4. Click **"Register"**

### 1.3 Note Your Client ID

After registration:
- Copy the **Application (client) ID**
- Copy the **Directory (tenant) ID**
- Save these for later

---

## Step 2: Create Client Secret

### 2.1 Generate Secret

1. In your app registration, go to **"Certificates & secrets"**
2. Click **"New client secret"**
3. Add description: `Zendesk Time Tracker Secret`
4. Set expiration: Choose duration (6 months, 12 months, or 24 months)
5. Click **"Add"**

### 2.2 Copy the Secret

**IMPORTANT**: Copy the secret **Value** immediately! You won't see it again.

- **Secret ID**: Don't use this
- **Secret Value**: ✅ Copy this one

---

## Step 3: Configure API Permissions

### 3.1 Add Permissions

1. Go to **"API permissions"**
2. Click **"Add a permission"**
3. Click **"APIs my organization uses"**
4. Search for: `Dynamics 365 Business Central`
5. Select **"Dynamics 365 Business Central"**

### 3.2 Select Permissions

1. Click **"Application permissions"** (NOT Delegated)
2. Check: **`Automation.ReadWrite.All`**
3. Click **"Add permissions"**

### 3.3 Grant Admin Consent

**IMPORTANT**: Must be done by Azure AD admin

1. Click **"Grant admin consent for [Your Organization]"**
2. Click **"Yes"** to confirm
3. Status should show green checkmarks

---

## Step 4: Configure Business Central

### 4.1 Create Azure AD User in BC

1. Open **Business Central**
2. Go to: **Users** (search in top bar)
3. Click **"New"**
4. Fill in:
   - **User Security ID**: Click "Get from Azure AD"
   - Select the app you registered (Zendesk BC Time Tracker)
   - Assign **Permission Sets**:
     - `D365 BASIC` or `D365 TEAM MEMBER`
     - `TIME SHEET USER` (or create custom permission set)

### 4.2 Assign Permissions

The app needs permissions to:
- ✅ Read: Customers
- ✅ Read: Jobs (Projects)
- ✅ Read: Employees
- ✅ Write: Time Registration Entries

Create a custom permission set if needed:
1. Go to **Permission Sets**
2. Create new: `ZENDESK TIME TRACKER`
3. Add permissions for above objects

---

## Step 5: Get Business Central IDs

### 5.1 Get Tenant ID

Already copied in Step 1.3 (Directory tenant ID)

### 5.2 Get Company ID

**Option A: From URL**
1. Open Business Central web client
2. Look at the URL:
   ```
   https://businesscentral.dynamics.com/[tenant]/[environment]?company=[company-id]
   ```
3. The `company` parameter is your Company ID (URL-encoded GUID)
4. Decode it if needed

**Option B: Via API**
```bash
curl -X GET \
  "https://api.businesscentral.dynamics.com/v2.0/[tenant-id]/[environment]/api/v2.0/companies" \
  -H "Authorization: Bearer [your-token]"
```

The response includes company `id` (GUID).

---

## Step 6: Configure Zendesk App

When installing the app in Zendesk, provide:

| Setting | Value | Example |
|---------|-------|---------|
| **BC Tenant ID** | Azure AD Directory (tenant) ID | `12345678-1234-1234-1234-123456789012` |
| **BC Environment** | Environment name | `production` or `sandbox` |
| **BC Company ID** | Business Central company GUID | `87654321-4321-4321-4321-210987654321` |
| **BC API Endpoint** | BC API base URL | `https://api.businesscentral.dynamics.com/v2.0` |
| **BC Client ID** | Application (client) ID from Azure | `abcdef12-3456-7890-abcd-ef1234567890` |
| **BC Client Secret** | Secret value from Step 2 | `abc~123...xyz` (secure) |

---

## Testing OAuth Setup

### Test 1: Get Access Token

```bash
curl -X POST \
  "https://login.microsoftonline.com/[tenant-id]/oauth2/v2.0/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=[client-id]" \
  -d "client_secret=[client-secret]" \
  -d "scope=https://api.businesscentral.dynamics.com/.default" \
  -d "grant_type=client_credentials"
```

Expected response:
```json
{
  "token_type": "Bearer",
  "expires_in": 3599,
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Test 2: Call BC API

```bash
curl -X GET \
  "https://api.businesscentral.dynamics.com/v2.0/[tenant]/[env]/api/v2.0/companies" \
  -H "Authorization: Bearer [access-token]"
```

Expected: List of companies in JSON format

---

## Troubleshooting

### Error: "Invalid client secret"

**Problem**: Client secret is wrong or expired

**Solution**:
- Verify you copied the secret **Value**, not the ID
- Check secret hasn't expired (go to Azure AD → Certificates & secrets)
- Generate new secret if needed

### Error: "Insufficient privileges"

**Problem**: App doesn't have required permissions

**Solution**:
- Verify API permissions include `Automation.ReadWrite.All`
- Ensure admin consent was granted (green checkmarks)
- Check BC user has correct permission sets

### Error: "Company not found"

**Problem**: Company ID is incorrect

**Solution**:
- Verify Company ID is a GUID (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
- Test with API to get list of companies
- Ensure you're using the `id` field, not `name`

### Error: "AADSTS700016: Application not found"

**Problem**: Client ID is incorrect or app not registered in tenant

**Solution**:
- Verify Client ID matches Azure AD app registration
- Ensure you're using the right tenant ID
- Check app registration exists in Azure AD

---

## Security Best Practices

✅ **Rotate Secrets**: Change client secret every 6-12 months
✅ **Least Privilege**: Only grant necessary permissions
✅ **Monitor Access**: Review Azure AD sign-in logs
✅ **Audit Permissions**: Regularly review BC permission sets
✅ **Document Setup**: Keep record of configuration for team

---

## OAuth Flow Diagram

```
┌─────────┐                  ┌─────────────┐                ┌──────────────┐
│ Zendesk │                  │  Azure AD   │                │   Business   │
│   App   │                  │   OAuth     │                │   Central    │
└────┬────┘                  └──────┬──────┘                └──────┬───────┘
     │                              │                              │
     │ 1. Request Token             │                              │
     │ (client_id, client_secret)   │                              │
     ├─────────────────────────────>│                              │
     │                              │                              │
     │ 2. Return Access Token       │                              │
     │<─────────────────────────────┤                              │
     │                              │                              │
     │ 3. API Request               │                              │
     │ (Authorization: Bearer token)                               │
     ├────────────────────────────────────────────────────────────>│
     │                              │                              │
     │ 4. Validate Token            │                              │
     │                              │<─────────────────────────────┤
     │                              │                              │
     │ 5. Return Data               │                              │
     │<─────────────────────────────────────────────────────────────┤
     │                              │                              │
```

---

## Key Differences from Basic Auth

| Aspect | Basic Auth | OAuth 2.0 |
|--------|------------|-----------|
| Credentials | Username + Password | Client ID + Secret |
| Token | None | Bearer token (auto-refresh) |
| Expiration | Never | 1 hour (auto-renewed) |
| Security | Lower | Higher |
| Revocation | Change password | Revoke app in Azure AD |
| Audit Trail | Limited | Full Azure AD logs |

---

## Support

If you encounter issues:

1. **Check Azure AD logs**: Azure Portal → Azure AD → Sign-ins
2. **Review BC API**: Use Postman to test manually
3. **GitHub Issues**: https://github.com/knowall-ai/zendesk-bc-timetracker/issues
4. **Email**: support@knowall.ai

---

**Your app is now more secure with OAuth 2.0!** 🔐
