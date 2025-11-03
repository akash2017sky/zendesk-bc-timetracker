# How to Generate Web Service Access Key

## Step-by-Step Guide

### Step 1: Open Business Central

1. Go to your Business Central web client
2. URL format: `https://businesscentral.dynamics.com/[your-tenant]/[environment]`
3. Log in with admin credentials

---

### Step 2: Navigate to Users

**Option A**: Using Search
1. Click the **search icon** 🔍 in the top right
2. Type: `Users`
3. Click on **"Users"** in the results

**Option B**: Using Menu
1. Click the **settings icon** ⚙️ (gear icon)
2. Go to **"User Management"**
3. Select **"Users"**

---

### Step 3: Create or Select User

#### Option A: Create New Service User (Recommended)

1. Click **"+ New"** button
2. Fill in:
   - **User Name**: `ZENDESK_SERVICE` (or your preferred name)
   - **Full Name**: `Zendesk Time Tracker Service`
   - **License Type**: Select appropriate license (`D365 BASIC` or `D365 TEAM MEMBER`)
   - **Contact Email**: Leave blank or use service email
3. Click **"OK"**

#### Option B: Use Existing User

1. Find the user you want to use
2. Click on the user to open their card

---

### Step 4: Generate Web Service Access Key

1. With the user card open, scroll down to find **"Web Services"** section
2. Look for field: **"Web Service Access Key"**
3. Click on the field or the **three dots (...)** next to it
4. You'll see options:
   - **"Set Expiration Date"**
   - **"Generate Key"** or **"New Key"**

5. Click **"Generate Key"** or **"Set Expiration Date"**
   - Choose expiration date (recommended: 6-12 months)
   - System will generate a new key

6. **IMPORTANT**: A dialog will appear showing the key
   ```
   Web Service Access Key: abc123def456ghi789jkl012mno345...
   ```

7. **COPY THIS KEY IMMEDIATELY!**
   - Click the **copy button** 📋
   - Or manually select and copy (Ctrl+C / Cmd+C)
   - **You will NOT see this key again!**

8. **Save the key securely**:
   - Paste into a secure password manager
   - Or keep in a secure note
   - You'll need this for Zendesk configuration

---

### Step 5: Assign Permissions

The user needs proper permissions to work with the API.

#### Required Permission Sets

1. In the user card, go to **"User Permission Sets"** section
2. Click **"+ Add"** or **"Edit List"**
3. Add these permission sets:
   - **`D365 BASIC`** or **`D365 TEAM MEMBER`** (base license)
   - **`TIME SHEET USER`** (for time registration)

#### Alternative: Create Custom Permission Set

If `TIME SHEET USER` doesn't exist or you want more control:

1. Search for **"Permission Sets"**
2. Click **"+ New"**
3. Name it: `ZENDESK TIME TRACKER`
4. Add permissions for these objects:
   - **Customers** (Table ID: 18) - Read
   - **Jobs** (Table ID: 167) - Read
   - **Employees** (Table ID: 5200) - Read
   - **Time Registration Entries** (Table ID: varies) - Read/Write

---

### Step 6: Test the Credentials

Before using in Zendesk, test the credentials:

#### Using PowerShell (Windows)

```powershell
$username = "ZENDESK_SERVICE"  # Your BC username
$key = "your-web-service-key-here"  # The key you just generated
$tenantId = "f36f6414-cb7d-4545-9cf2-7574f7b5c584"  # Your tenant ID
$environment = "production"
$companyId = "your-company-id-here"

# Create Basic Auth header
$credentials = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${username}:${key}"))
$headers = @{
    "Authorization" = "Basic $credentials"
    "Accept" = "application/json"
}

# Test API call
$url = "https://api.businesscentral.dynamics.com/v2.0/$tenantId/$environment/api/v2.0/companies($companyId)/customers"

try {
    $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Get
    Write-Host "✅ Success! Found $($response.value.Count) customers"
    $response.value | Select-Object -First 3 | Format-Table number, displayName
}
catch {
    Write-Host "❌ Error: $($_.Exception.Message)"
}
```

#### Using curl (Mac/Linux)

```bash
USERNAME="ZENDESK_SERVICE"
KEY="your-web-service-key-here"
TENANT_ID="f36f6414-cb7d-4545-9cf2-7574f7b5c584"
ENVIRONMENT="production"
COMPANY_ID="your-company-id-here"

curl -X GET \
  "https://api.businesscentral.dynamics.com/v2.0/$TENANT_ID/$ENVIRONMENT/api/v2.0/companies($COMPANY_ID)/customers" \
  -H "Authorization: Basic $(echo -n $USERNAME:$KEY | base64)" \
  -H "Accept: application/json"
```

Expected response:
```json
{
  "value": [
    {
      "id": "guid-here",
      "number": "C-001",
      "displayName": "Contoso Ltd.",
      ...
    }
  ]
}
```

---

### Step 7: Use in Zendesk

Now that you have the key, configure Zendesk:

1. Go to **Zendesk Admin Center**
2. Navigate to: **Apps → Zendesk Support apps**
3. Find your installed app or upload `zendesk-bc-timetracker.zip`
4. Configure:

| Field | Value |
|-------|-------|
| **bc_tenant_id** | `f36f6414-cb7d-4545-9cf2-7574f7b5c584` |
| **bc_environment** | `production` |
| **bc_company_id** | `CRONUS UK Ltd.` or your company ID |
| **bc_api_endpoint** | `https://api.businesscentral.dynamics.com/v2.0` |
| **bc_username** | `ZENDESK_SERVICE` (the username you created) |
| **bc_web_service_key** | `abc123...` (paste the key you copied) |

5. Click **"Install"**

---

## Important Notes

### Security Best Practices

✅ **Do:**
- Create a dedicated service user for Zendesk
- Set expiration dates on keys (rotate every 6-12 months)
- Use least privilege permissions
- Store keys securely (password manager)
- Monitor usage in BC audit logs

❌ **Don't:**
- Use personal user accounts
- Share keys via email or chat
- Set keys with no expiration
- Give excessive permissions
- Store keys in plain text files

### Key Expiration

- Keys can be set to expire (recommended)
- BC will warn you before expiration
- Generate new key before old one expires
- Update Zendesk configuration with new key

### Revoking Access

To revoke access:
1. Go to the user in BC
2. Delete or expire the Web Service Access Key
3. The Zendesk app will immediately lose access

---

## Troubleshooting

### "Web Service Access Key field not visible"

**Solution**: Make sure you have admin permissions in BC

### "Cannot generate key"

**Possible causes**:
- User doesn't have proper license
- BC permissions insufficient
- BC admin has disabled web service keys

**Solution**: Contact your BC administrator

### "Key doesn't work in API calls"

**Check**:
- Username is correct (case-sensitive)
- Key was copied completely (no spaces)
- User has required permissions
- Company ID is correct

### "401 Unauthorized" error

**Causes**:
- Wrong username or key
- Key has expired
- Permissions insufficient

**Solution**:
- Regenerate key
- Verify permissions
- Test with curl/PowerShell first

---

## Quick Reference

### Information Needed

Collect these before configuring Zendesk:

- [ ] **BC Tenant ID**: `f36f6414-cb7d-4545-9cf2-7574f7b5c584` ✅
- [ ] **BC Environment**: `production` ✅
- [ ] **BC Company ID**: `CRONUS UK Ltd.` (from screenshot)
- [ ] **BC API Endpoint**: `https://api.businesscentral.dynamics.com/v2.0` ✅
- [ ] **BC Username**: `ZENDESK_SERVICE` (to be created)
- [ ] **BC Web Service Key**: (to be generated)

### Next Steps

1. ✅ Follow this guide to generate Web Service Key
2. ✅ Test the credentials with PowerShell/curl
3. ✅ Configure Zendesk app with the credentials
4. ✅ Install and test in a ticket

---

## Need Help?

If you encounter issues:

1. **BC Documentation**: [Web Services Authentication](https://docs.microsoft.com/en-us/dynamics365/business-central/dev-itpro/webservices/web-services-authentication)
2. **API Reference**: [Business Central API v2.0](https://docs.microsoft.com/en-us/dynamics365/business-central/dev-itpro/api-reference/v2.0/)
3. **Contact BC Admin**: If you don't have permissions
4. **Zendesk Support**: For app installation issues

---

**You're ready to generate your Web Service Access Key!** 🚀

Follow the steps above and you'll have everything needed to configure the Zendesk app.
