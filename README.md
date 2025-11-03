# Business Central Time Tracker for Zendesk

A Zendesk Support sidebar app that enables agents to track time on tickets and automatically log entries to Microsoft Dynamics 365 Business Central.

## Features

- **Seamless Integration**: Appears in the Zendesk ticket sidebar for quick access
- **Business Central Sync**: Automatically creates time registration entries in BC
- **Smart Context**: Auto-detects the current agent and links to the Zendesk ticket
- **Clean UX**: Professional, intuitive interface following Zendesk design patterns
- **Client & Project Selection**: Easy dropdown selection from your BC customers and jobs
- **Time Tracking**: Simple decimal hour input (e.g., 1.5, 2.25)
- **Ticket Linking**: Automatically appends Zendesk ticket URL to time entry description

## Prerequisites

- Node.js 16+ and npm
- Zendesk Support account with admin access
- Microsoft Dynamics 365 Business Central account
- Business Central API credentials (username/password)
- Zendesk Apps CLI (ZCLI)

## Installation

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/knowall-ai/zendesk-bc-timetracker.git
cd zendesk-bc-timetracker
npm install
```

### 2. Install Zendesk CLI

```bash
npm install -g @zendesk/zcli
```

### 3. Build the App

For development:
```bash
npm run build
```

For production:
```bash
npm run build
```

This will create `assets/app.js` and `assets/app.css`.

## Configuration

### Business Central Setup

1. **Create API User** (recommended):
   - Create a service account in Business Central
   - Assign necessary permissions for reading customers, jobs, employees
   - Assign permissions for creating time registration entries

2. **Get API Credentials**:
   - Tenant ID (GUID from Azure AD)
   - Environment name (e.g., "production" or "sandbox")
   - Company ID (GUID from BC)
   - Username and Password (Web Service Access Key recommended)

3. **Verify API Access**:
   - Test the API endpoint: `https://api.businesscentral.dynamics.com/v2.0/{tenant-id}/{environment}/api/v2.0/`

### Zendesk Installation

1. **Package the App**:
   ```bash
   zcli apps:package
   ```
   This creates a `.zip` file in the `tmp/` directory.

2. **Upload to Zendesk**:
   - Go to Admin Center > Apps and integrations > Apps > Zendesk Support apps
   - Click "Upload private app"
   - Select the generated `.zip` file
   - Click "Upload"

3. **Configure App Settings**:
   - **BC Tenant ID**: Your Azure AD tenant ID (GUID)
   - **BC Environment**: Usually "production" or "sandbox"
   - **BC Company ID**: Your Business Central company ID (GUID)
   - **BC API Endpoint**: `https://api.businesscentral.dynamics.com/v2.0`
   - **BC Username**: Business Central username or service account
   - **BC Password**: Password or Web Service Access Key

4. **Install the App**:
   - Click "Install" on the app
   - The app will now appear in the ticket sidebar

## Development

### Local Development

1. **Start Development Server**:
   ```bash
   npm run dev
   ```
   This starts Webpack in watch mode.

2. **Run ZCLI Server**:
   ```bash
   npm run server
   ```
   Or manually:
   ```bash
   zcli apps:server
   ```

3. **Test in Zendesk**:
   - Navigate to any ticket with `?zcli_apps=true` appended to the URL
   - Example: `https://yoursubdomain.zendesk.com/agent/tickets/123?zcli_apps=true`

### Project Structure

```
zendesk-bc-timetracker/
├── src/
│   ├── components/
│   │   ├── ClientSelector.jsx      # Client/customer dropdown
│   │   ├── ProjectSelector.jsx     # Project/job dropdown
│   │   ├── TimeEntry.jsx           # Time input and description
│   │   └── SaveButton.jsx          # Submit button with loading state
│   ├── services/
│   │   ├── businessCentralService.js  # BC API client
│   │   └── zendeskService.js          # Zendesk ZAF API client
│   ├── utils/
│   │   └── helpers.js              # Utility functions
│   ├── App.jsx                     # Main React component
│   ├── index.jsx                   # Entry point
│   └── styles.css                  # App styling
├── assets/
│   ├── iframe.html                 # ZAF SDK container
│   ├── app.js                      # Bundled JavaScript (generated)
│   └── app.css                     # Bundled CSS (generated)
├── manifest.json                   # Zendesk app configuration
├── webpack.config.dev.js           # Development build config
├── webpack.config.prod.js          # Production build config
└── package.json                    # Dependencies and scripts
```

## Usage

### For Agents

1. **Open a Ticket**: Navigate to any support ticket
2. **Locate the Widget**: Find "Business Central Time Tracker" in the right sidebar
3. **Select Client**: Choose the customer from the dropdown
4. **Select Project**: Choose the project/job to log time against
5. **Enter Time**: Input hours in decimal format (e.g., 1.5 for 90 minutes)
6. **Add Description**: Describe the work performed
7. **Save**: Click "Save Time Entry"

The app will:
- Automatically detect your email and match it to your BC employee record
- Create a time registration entry in Business Central
- Append the Zendesk ticket URL to the description
- Show a success confirmation
- Clear the form for the next entry

### Time Entry Format

Time entries in Business Central will include:
- **Employee**: Matched by email
- **Job**: Selected project
- **Date**: Today's date
- **Quantity**: Hours entered
- **Unit of Measure**: HOUR
- **Description**: Your comment + Zendesk ticket URL

Example description:
```
Fixed authentication bug - https://yourcompany.zendesk.com/agent/tickets/12345
```

## API Reference

### Business Central APIs Used

- `GET /api/v2.0/companies({id})/customers` - Fetch customer list
- `GET /api/v2.0/companies({id})/jobs` - Fetch job/project list
- `GET /api/v2.0/companies({id})/employees` - Find employee by email
- `POST /api/v2.0/companies({id})/timeRegistrationEntries` - Create time entry

### Zendesk ZAF Client APIs Used

- `client.get('currentUser')` - Get logged-in agent
- `client.get('ticket')` - Get current ticket context
- `client.metadata()` - Get app settings
- `client.invoke('notify')` - Show notifications
- `client.invoke('resize')` - Resize iframe

## Troubleshooting

### "No employee found in Business Central"

**Problem**: Agent's email doesn't match any BC employee.

**Solution**:
- Verify the agent's Zendesk email matches their BC employee email exactly
- Check BC employee records have email addresses populated
- Ensure the API user has permission to read employee data

### "Failed to load customers from Business Central"

**Problem**: Cannot fetch customer list from BC API.

**Solution**:
- Verify BC credentials are correct in app settings
- Check API endpoint URL is correct
- Ensure API user has read permissions for customers
- Test API access with a tool like Postman

### "Failed to save time entry"

**Problem**: Time entry creation fails.

**Solution**:
- Verify all required fields are filled
- Check the selected job allows time registration
- Ensure API user has write permissions for time registration entries
- Check BC company allows time registration

### App not appearing in sidebar

**Problem**: Widget doesn't show in ticket sidebar.

**Solution**:
- Verify app is installed and enabled
- Check manifest.json location is set to "ticket_sidebar"
- Clear browser cache and reload
- Check browser console for errors

## Testing

### Manual Testing Checklist

- [ ] App loads in ticket sidebar
- [ ] Client dropdown populates with BC customers
- [ ] Project dropdown populates when client selected
- [ ] Time input accepts decimal values
- [ ] Description field has character limit
- [ ] Form validates required fields
- [ ] Save button disables when form invalid
- [ ] Success message appears after save
- [ ] Time entry created in BC with correct data
- [ ] Ticket URL appended to description
- [ ] Form clears after successful save
- [ ] Error messages display for failures
- [ ] Employee auto-detected from email

### Test Data

Example test values:
- **Time**: 1.5, 2.0, 0.25
- **Description**: "Fixed bug", "Customer call", "Code review"

## Architecture

### Technology Stack

- **Frontend**: React 18 (functional components, hooks)
- **Build Tool**: Webpack 5
- **Transpiler**: Babel
- **Framework**: Zendesk Apps Framework v2.0
- **API**: Business Central v2.0 REST API

### Authentication

Uses **Basic Authentication** with BC username and password stored in Zendesk app settings. The credentials are base64-encoded and sent in the Authorization header for each API request.

**Security Note**: Credentials are stored securely by Zendesk (password field marked as `secure: true` in manifest).

### Data Flow

1. Agent opens ticket → ZAF initializes app
2. App fetches agent data from Zendesk
3. App matches agent email to BC employee
4. App loads customers from BC
5. Agent selects client → App loads projects for that client
6. Agent fills form and clicks Save
7. App creates time entry in BC with ticket URL
8. Success confirmation shown, form cleared

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues or questions:
- Open an issue on GitHub
- Contact: support@knowall.ai

## Roadmap

Future enhancements under consideration:
- OAuth 2.0 authentication option
- Auto-select client based on ticket organization
- Job task selection dropdown
- Date picker for backdating entries
- Session caching for better performance
- Multi-day time entry
- Time entry history view
- Export/reporting features

## Credits

Built by [KnowAll AI](https://knowall.ai)

Inspired by the Harvest Zendesk widget UX patterns.

## Related Resources

- [Zendesk Apps Documentation](https://developer.zendesk.com/documentation/apps/)
- [Business Central API Reference](https://docs.microsoft.com/en-us/dynamics365/business-central/dev-itpro/api-reference/v2.0/)
- [Zendesk Apps Framework SDK](https://developer.zendesk.com/api-reference/apps/apps-core-api/client_api/)
