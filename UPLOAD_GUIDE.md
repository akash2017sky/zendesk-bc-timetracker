# Quick Upload Guide

## 📦 Package Ready for Upload

**File**: `zendesk-bc-timetracker.zip` (56 KB)
**Location**: Root directory

## 🚀 Upload Steps

### 1. Go to Zendesk Admin Center

Navigate to:
```
Admin Center → Apps and integrations → Apps → Zendesk Support apps
```

### 2. Upload the App

1. Click **"Upload private app"** button
2. Select: `zendesk-bc-timetracker.zip`
3. Click **"Upload"**
4. Wait for validation (should be instant)

### 3. Configure App Settings

You'll be prompted for these settings:

| Setting | Example Value | Where to Find |
|---------|---------------|---------------|
| **BC Tenant ID** | `12345678-1234-1234-1234-123456789012` | Azure Portal → Azure Active Directory → Properties |
| **BC Environment** | `production` | Usually "production" or "sandbox" |
| **BC Company ID** | `87654321-4321-4321-4321-210987654321` | BC Web Client URL or API |
| **BC API Endpoint** | `https://api.businesscentral.dynamics.com/v2.0` | Leave default |
| **BC Username** | `serviceaccount@yourdomain.com` | BC service account username |
| **BC Password** | `[Web Service Access Key]` | Generate in BC → User Settings |

### 4. Install the App

1. Review settings
2. Click **"Install"**
3. Wait for installation (few seconds)

### 5. Test the App

1. Open any support ticket
2. Look for **"Business Central Time Tracker"** in the right sidebar
3. You should see:
   - Loading spinner → Form appears
   - Client dropdown (select a client)
   - Project dropdown (select a project)
   - Time input field
   - Description textarea
   - "Save Time Entry" button

### 6. Create Test Entry

1. Select a **client** from dropdown
2. Select a **project** from dropdown
3. Enter **time**: `1.5` (for 1 hour 30 minutes)
4. Enter **description**: `Test entry from Zendesk`
5. Click **"Save Time Entry"**
6. Wait for success message
7. Verify in Business Central:
   - Go to Time Registration Entries
   - Find entry for your employee
   - Check description includes Zendesk ticket URL

## ✅ Success Checklist

- [ ] App uploaded successfully
- [ ] BC credentials configured
- [ ] App installed
- [ ] App appears in ticket sidebar
- [ ] Client dropdown loads
- [ ] Project dropdown loads
- [ ] Test entry saved
- [ ] Entry visible in Business Central
- [ ] Ticket URL in description

## ⚠️ Troubleshooting

### Upload Fails
- Check file size is ~56 KB
- Ensure you're uploading the `.zip` file, not a folder
- Try re-downloading the package

### App Won't Install
- Verify all BC credentials are correct
- Test BC API access separately
- Check tenant ID and company ID are GUIDs

### "No employee found" Error
- Verify your Zendesk email matches BC employee email
- Check BC employee has email populated
- Ensure BC API user can read employees

### API Connection Error
- Verify BC credentials are correct
- Check API endpoint URL
- Test with Postman:
  ```
  GET https://api.businesscentral.dynamics.com/v2.0/{tenant}/production/api/v2.0/companies
  Authorization: Basic [base64(username:password)]
  ```

## 📞 Need Help?

- **Documentation**: See README.md
- **Issues**: https://github.com/knowall-ai/zendesk-bc-timetracker/issues
- **Email**: support@knowall.ai

## 🔄 Rebuild Package

If you make changes and need to rebuild:

```bash
npm run build           # Build the app
npm run package:clean   # Create clean package
```

This recreates `zendesk-bc-timetracker.zip` with latest changes.

---

**You're ready to upload! 🚀**
