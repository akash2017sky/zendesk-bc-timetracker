# Quick Start Guide

Get the Business Central Time Tracker running in 5 minutes!

## Prerequisites Checklist

- [ ] Node.js 16+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Zendesk account with admin access
- [ ] Business Central API credentials ready

## Installation Steps

### 1. Clone and Setup (2 minutes)

```bash
# Clone the repository
git clone https://github.com/knowall-ai/zendesk-bc-timetracker.git
cd zendesk-bc-timetracker

# Install dependencies
npm install

# Build the app
npm run build
```

### 2. Gather Business Central Credentials (1 minute)

You'll need:
- **Tenant ID**: Your Azure AD tenant GUID
- **Environment**: `production` or `sandbox`
- **Company ID**: Your BC company GUID
- **Username**: BC service account username
- **Password**: BC service account password or Web Service Access Key

**Where to find these:**
- Tenant ID: Azure Portal > Azure Active Directory > Properties
- Company ID: BC Web Client URL or via BC API
- Environment: Usually "production" for live systems

### 3. Install in Zendesk (2 minutes)

```bash
# Install ZCLI (if not already installed)
npm install -g @zendesk/zcli

# Package the app
zcli apps:package
```

This creates a `.zip` file in `tmp/` directory.

**Upload to Zendesk:**
1. Go to Zendesk Admin Center
2. Navigate to: **Apps and integrations > Apps > Zendesk Support apps**
3. Click **Upload private app**
4. Select the `.zip` file from `tmp/`
5. Click **Upload**

**Configure the app:**
1. Enter your BC credentials in the app settings:
   - BC Tenant ID
   - BC Environment
   - BC Company ID
   - BC API Endpoint: `https://api.businesscentral.dynamics.com/v2.0`
   - BC Username
   - BC Password
2. Click **Install**

## Testing

### Test in Zendesk

1. Open any support ticket
2. Look for "Business Central Time Tracker" in the right sidebar
3. The app should load and display the time entry form

### Test the Workflow

1. **Select a client** from the dropdown
2. **Select a project** (loads after client selection)
3. **Enter time** (e.g., 1.5 for 1 hour 30 minutes)
4. **Add description** (e.g., "Fixed authentication issue")
5. **Click Save**

**Expected result:**
- Success message appears
- Form clears
- Time entry created in Business Central
- Entry includes ticket URL in description

## Troubleshooting

### Build fails
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### App doesn't appear in sidebar
- Verify app is installed and enabled in Zendesk
- Clear browser cache
- Check browser console for errors

### "No employee found" error
- Verify your Zendesk email matches your BC employee email
- Check BC employee records have email addresses
- Confirm API user can read employee data

### BC API connection fails
- Test credentials with curl or Postman
- Verify API endpoint URL is correct
- Check firewall/network settings

## Next Steps

- Review the full [README.md](README.md) for detailed documentation
- Check [CONTRIBUTING.md](CONTRIBUTING.md) to contribute
- Customize the app for your needs

## Support

- GitHub Issues: https://github.com/knowall-ai/zendesk-bc-timetracker/issues
- Email: support@knowall.ai

## Success Checklist

- [ ] Dependencies installed
- [ ] App builds without errors
- [ ] App packaged successfully
- [ ] Uploaded to Zendesk
- [ ] BC credentials configured
- [ ] App appears in ticket sidebar
- [ ] Can select client and project
- [ ] Can save time entry
- [ ] Entry appears in Business Central
- [ ] Ticket URL in entry description

If all items are checked, you're done!
