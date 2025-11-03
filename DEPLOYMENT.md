# Deployment Guide

This guide walks you through deploying the Business Central Time Tracker app to your Zendesk instance.

## Build Status

✅ **Build Complete**: Application successfully built and packaged
✅ **Package Size**: ~13MB (includes all dependencies)
✅ **Package Location**: `tmp/app-[timestamp].zip`
✅ **No Vulnerabilities**: All dependencies are secure

## Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] **Business Central API Access**
  - Tenant ID (GUID)
  - Environment name (`production` or `sandbox`)
  - Company ID (GUID)
  - API username (service account recommended)
  - API password or Web Service Access Key

- [ ] **Zendesk Admin Access**
  - Admin permissions in Zendesk
  - Access to Admin Center
  - Permission to upload private apps

- [ ] **Employee Email Matching**
  - Zendesk agent emails match BC employee emails
  - BC employee records have email addresses populated

## Deployment Steps

### Step 1: Prepare Business Central

1. **Create a Service Account** (recommended):
   ```
   BC Admin → Users → New User
   - Type: Service Account
   - License: Not required for API access
   - Web Service Access: Enabled
   ```

2. **Assign Permissions**:
   - Read: Customers, Jobs, Employees
   - Write: Time Registration Entries
   - Suggested Permission Set: `TIME SHEET USER` or custom set

3. **Generate Web Service Access Key**:
   - User Settings → Web Service Access Key
   - Save this key securely (acts as password)

4. **Note Your Credentials**:
   ```
   Tenant ID: [Find in Azure AD]
   Environment: production
   Company ID: [From BC Web Client URL]
   Username: [Service account username]
   Password: [Web Service Access Key]
   ```

### Step 2: Upload to Zendesk

1. **Navigate to Apps**:
   ```
   Zendesk Admin Center
   → Apps and integrations
   → Apps
   → Zendesk Support apps
   ```

2. **Upload the App**:
   - Click **"Upload private app"**
   - Select: `tmp/app-[latest-timestamp].zip`
   - Click **"Upload"**
   - Wait for validation to complete

3. **Configure App Settings**:

   The app will prompt for these parameters:

   | Parameter | Example | Description |
   |-----------|---------|-------------|
   | BC Tenant ID | `12345678-1234-...` | Azure AD tenant GUID |
   | BC Environment | `production` | Environment name |
   | BC Company ID | `87654321-4321-...` | BC company GUID |
   | BC API Endpoint | `https://api.businesscentral.dynamics.com/v2.0` | API base URL |
   | BC Username | `serviceaccount@yourdomain.com` | BC API user |
   | BC Password | `[Web Service Key]` | Password or access key (secure) |

4. **Install the App**:
   - Review settings
   - Click **"Install"**
   - Wait for installation to complete

### Step 3: Verify Installation

1. **Check App Status**:
   - Go to installed apps list
   - Verify "Business Central Time Tracker" shows as **Installed**
   - Check for any error messages

2. **Test in Ticket**:
   - Open any support ticket
   - Look for the app in the right sidebar
   - App should load without errors

### Step 4: Test Functionality

1. **Initial Load Test**:
   - [ ] App loads in sidebar
   - [ ] No console errors
   - [ ] Loading spinner appears then disappears
   - [ ] Form displays correctly

2. **Data Loading Test**:
   - [ ] Client dropdown populates with BC customers
   - [ ] Select a client
   - [ ] Project dropdown populates with jobs
   - [ ] No error messages

3. **Time Entry Test**:
   - [ ] Select client and project
   - [ ] Enter time: `1.5`
   - [ ] Enter description: `Test entry from Zendesk`
   - [ ] Click "Save Time Entry"
   - [ ] Success message appears
   - [ ] Form clears

4. **Business Central Verification**:
   - Go to BC: **Time Sheets** or **Time Registration Entries**
   - Find the entry for current employee
   - Verify:
     - [ ] Correct date (today)
     - [ ] Correct hours (1.5)
     - [ ] Correct job
     - [ ] Description includes Zendesk ticket URL
     - [ ] Employee correctly identified

## Troubleshooting Deployment

### Upload Fails

**Problem**: "Invalid package" or "Upload failed"

**Solutions**:
- Ensure you're uploading the `.zip` file from `tmp/` directory
- Check file size isn't corrupt (should be ~13MB)
- Try re-building: `npm run build && zcli apps:package`
- Verify manifest.json is valid JSON

### Installation Fails

**Problem**: App won't install after upload

**Solutions**:
- Check all required parameters are filled
- Verify BC credentials are correct
- Test BC API access with Postman:
  ```
  GET https://api.businesscentral.dynamics.com/v2.0/{tenant-id}/{environment}/api/v2.0/companies
  Authorization: Basic {base64(username:password)}
  ```

### App Doesn't Load in Sidebar

**Problem**: Widget not visible in ticket sidebar

**Solutions**:
- Refresh the ticket page
- Clear browser cache
- Check browser console for errors
- Verify app is installed and enabled
- Try different browser

### "No employee found" Error

**Problem**: Agent's email doesn't match BC employee

**Solutions**:
- Verify agent's Zendesk email: Settings → Profile
- Check BC employee email: BC → Employees → [Employee]
- Ensure emails match exactly (case-insensitive)
- Check BC API user can read employees

### API Connection Errors

**Problem**: "Failed to load customers" or similar

**Solutions**:
1. **Verify Credentials**:
   - Check tenant ID is correct
   - Verify environment name
   - Test username/password

2. **Check Permissions**:
   - BC user needs read access to:
     - Customers
     - Jobs
     - Employees
   - BC user needs write access to:
     - Time Registration Entries

3. **Network/Firewall**:
   - Ensure Zendesk can reach BC API
   - Check no firewall blocking
   - Verify CORS settings if applicable

4. **Test API Directly**:
   ```bash
   curl -X GET \
     "https://api.businesscentral.dynamics.com/v2.0/{tenant}/production/api/v2.0/companies" \
     -H "Authorization: Basic {credentials}" \
     -H "Accept: application/json"
   ```

## Post-Deployment

### 1. Train Your Team

- Share the **User Guide** section from README.md
- Demonstrate the workflow
- Explain time entry format (decimal hours)
- Show where entries appear in BC

### 2. Monitor Usage

First week:
- Check for error reports from agents
- Review BC time entries for accuracy
- Verify ticket URLs are included
- Confirm employee matching works

### 3. Optimize

Consider:
- Auto-selecting clients based on ticket organization
- Adding custom fields for project mapping
- Implementing caching for better performance
- Adding job task selection dropdown

### 4. Maintain

Regular tasks:
- Update BC credentials when they expire
- Add new employees as they join
- Monitor API usage/rate limits
- Keep app updated with new features

## Rollback Plan

If you need to rollback:

1. **Uninstall the App**:
   - Admin Center → Apps → Installed Apps
   - Find "Business Central Time Tracker"
   - Click "Uninstall"

2. **Remove Time Entries** (if needed):
   - Go to BC Time Registration Entries
   - Filter by date range
   - Review and delete test entries

3. **Reinstall Previous Version** (if applicable):
   - Upload older package
   - Configure with same settings

## Security Notes

- BC password stored securely by Zendesk (encrypted)
- Credentials never exposed to client-side code
- All API calls use HTTPS
- Consider rotating service account credentials periodically
- Review BC user permissions regularly

## Support

If you encounter issues:

1. **Check Documentation**:
   - README.md
   - QUICKSTART.md
   - This file

2. **GitHub Issues**:
   - https://github.com/knowall-ai/zendesk-bc-timetracker/issues

3. **Contact**:
   - support@knowall.ai

## Success Criteria

Deployment is successful when:

- [ ] App appears in all ticket sidebars
- [ ] All agents can load client/project lists
- [ ] Time entries save successfully to BC
- [ ] Ticket URLs appear in BC entries
- [ ] No errors in browser console
- [ ] Agents report successful usage

## Next Steps

After successful deployment:

1. **Announce to Team**: Inform agents app is ready
2. **Provide Training**: Quick demo or guide
3. **Monitor Feedback**: Collect agent input
4. **Iterate**: Consider feature requests
5. **Celebrate**: You've successfully integrated Zendesk with Business Central!

---

**Deployed Version**: 1.0.0
**Build Date**: 2025-11-03
**Package**: `tmp/app-20251103144820261.zip`
