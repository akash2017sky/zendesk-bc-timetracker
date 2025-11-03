# Azure Functions Backend - Business Central Time Tracker

This is the serverless backend for the Zendesk Business Central Time Tracker app. It handles OAuth 2.0 authentication with Business Central and provides secure API endpoints for the Zendesk frontend app.

## Architecture

```
Zendesk App (Browser) → Azure Functions Backend → Azure AD OAuth → Business Central API
```

## Why This Backend Exists

The frontend Zendesk app runs in the browser and cannot directly authenticate with Business Central using OAuth 2.0 due to CORS (Cross-Origin Resource Sharing) restrictions. This backend solves that problem by:

1. Handling OAuth token acquisition server-side (no CORS issues)
2. Caching tokens to minimize Azure AD API calls
3. Proxying requests to Business Central with proper authentication
4. Providing CORS headers for Zendesk app requests

## Project Structure

```
backend/
├── api/
│   ├── customers/         # GET /bc/customers
│   │   ├── index.js
│   │   └── function.json
│   ├── jobs/              # GET /bc/jobs
│   │   ├── index.js
│   │   └── function.json
│   ├── employees/         # GET /bc/employees
│   │   ├── index.js
│   │   └── function.json
│   ├── timeEntries/       # POST /bc/timeEntries
│   │   ├── index.js
│   │   └── function.json
│   └── health/            # GET /health
│       ├── index.js
│       └── function.json
├── services/
│   ├── oauth.js           # OAuth token management
│   └── bcClient.js        # Business Central API client
├── utils/
│   └── cors.js            # CORS handling utilities
├── host.json              # Azure Functions host configuration
├── local.settings.json    # Local development settings
└── package.json           # Node.js dependencies
```

## API Endpoints

All endpoints are prefixed with `/api` (configured in Azure Functions).

### GET /health

Health check endpoint to verify backend is running.

**Response:**
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

**Response:**
```json
{
  "success": true,
  "data": [{ "id": "guid", "displayName": "Acme Corp", ... }],
  "count": 10
}
```

### GET /bc/jobs?customerId={id}

Get jobs/projects from Business Central, optionally filtered by customer.

**Query Parameters:**
- `customerId` (optional): Filter jobs by customer ID

**Response:**
```json
{
  "success": true,
  "data": [{ "id": "guid", "description": "Project A", ... }],
  "count": 5
}
```

### GET /bc/employees?email={email}

Get employees from Business Central, optionally filtered by email.

**Query Parameters:**
- `email` (optional): Filter employees by email address

**Response:**
```json
{
  "success": true,
  "data": [{ "id": "guid", "displayName": "John Doe", "email": "john@company.com", ... }],
  "count": 1
}
```

### POST /bc/timeEntries

Create a time registration entry in Business Central.

**Request Body:**
```json
{
  "employeeId": "guid",
  "jobId": "guid",
  "jobNumber": "J001",
  "jobTaskNumber": "",
  "date": "2025-01-03",
  "quantity": 2.5,
  "description": "Worked on feature X - Ticket: https://..."
}
```

**Response:**
```json
{
  "success": true,
  "data": { "id": "guid", "number": "TR001", ... }
}
```

## Local Development

### Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [Azure Functions Core Tools](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local)
- Azure AD app registration (see DEPLOYMENT.md)

### Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `local.settings.json.example` to `local.settings.json` (if available) or create it:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "BC_TENANT_ID": "your-tenant-id",
    "BC_CLIENT_ID": "your-client-id",
    "BC_CLIENT_SECRET": "your-client-secret",
    "BC_ENVIRONMENT": "production",
    "BC_COMPANY_ID": "your-company-id",
    "BC_API_ENDPOINT": "https://api.businesscentral.dynamics.com/v2.0",
    "ALLOWED_ORIGINS": "http://localhost:*,https://*.zendesk.com"
  }
}
```

3. Start the local function app:

```bash
func start
```

The backend will be available at `http://localhost:7071/api`

### Testing Locally

**Test health endpoint:**
```bash
curl http://localhost:7071/api/health
```

**Test customers endpoint:**
```bash
curl http://localhost:7071/api/bc/customers
```

**Test time entry creation:**
```bash
curl -X POST http://localhost:7071/api/bc/timeEntries \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "...",
    "jobId": "...",
    "jobNumber": "J001",
    "date": "2025-01-03",
    "quantity": 1.5,
    "description": "Test entry"
  }'
```

## Deployment

See the main [DEPLOYMENT.md](../DEPLOYMENT.md) file for complete deployment instructions.

### Quick Deploy

```bash
# Login to Azure
az login

# Deploy to existing Function App
npm install
func azure functionapp publish func-zendesk-bc
```

## Environment Variables

The following environment variables must be configured in Azure Function App settings:

| Variable | Description | Required |
|----------|-------------|----------|
| `BC_TENANT_ID` | Azure AD Tenant ID | Yes |
| `BC_CLIENT_ID` | Azure AD App Client ID | Yes |
| `BC_CLIENT_SECRET` | Azure AD App Client Secret | Yes |
| `BC_ENVIRONMENT` | BC environment name (e.g., "production") | Yes |
| `BC_COMPANY_ID` | BC Company GUID | Yes |
| `BC_API_ENDPOINT` | BC API base URL | Yes |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins | Yes |

## OAuth Token Management

The backend uses the OAuth 2.0 Client Credentials flow to authenticate with Business Central:

1. On first request, it exchanges client ID + secret for an access token
2. Token is cached in memory with expiration tracking
3. Token is refreshed automatically 5 minutes before expiration
4. All BC API requests use the cached token

**Token Caching Logic** (`services/oauth.js`):
- Tokens are cached in memory (per instance)
- Cache is valid until 5 minutes before token expiry
- Cold starts will fetch a new token
- Multiple concurrent requests share the same token

## CORS Configuration

The backend allows CORS requests from Zendesk domains configured in `ALLOWED_ORIGINS`.

**Wildcard Support:**
- `https://*.zendesk.com` - Allows all Zendesk subdomains
- Origins are validated before adding CORS headers

**Preflight Requests:**
All endpoints handle OPTIONS requests for CORS preflight.

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details (if available)"
}
```

HTTP status codes:
- `200` - Success (GET requests)
- `201` - Created (POST requests)
- `400` - Bad request (missing required fields)
- `401` - Unauthorized (OAuth issues)
- `500` - Internal server error

## Monitoring

### View Logs

**Real-time logs:**
```bash
func azure functionapp logstream func-zendesk-bc
```

**Azure Portal:**
- Go to Function App > Monitor > Log stream
- View individual function invocations under each function

### Metrics

In Azure Portal, check:
- **Execution count**: Number of function invocations
- **Execution time**: Average duration per request
- **Errors**: Failed requests
- **Cost**: Estimated monthly cost

## Security Considerations

1. **Client Secret Storage**
   - Stored as Azure Function App setting (encrypted at rest)
   - Never exposed to client-side code
   - Consider using Azure Key Vault for additional security

2. **CORS Origins**
   - Keep `ALLOWED_ORIGINS` restrictive
   - Only allow Zendesk domains
   - Never use `*` in production

3. **Token Security**
   - OAuth tokens are cached in memory only
   - Tokens are not logged or persisted to disk
   - Tokens expire after 1 hour (BC default)

4. **API Permissions**
   - Grant minimum required permissions in Azure AD
   - Use "Application permissions" not "Delegated permissions"
   - Review permissions periodically

## Troubleshooting

### "401 Unauthorized" from BC API

**Possible causes:**
- Invalid client ID or secret
- Client secret expired
- Missing admin consent in Azure AD
- Wrong tenant ID

**Solutions:**
- Verify all OAuth settings in Function App configuration
- Check Azure AD app registration
- Ensure admin consent was granted
- Try creating a new client secret

### "CORS Error" in Browser

**Possible causes:**
- `ALLOWED_ORIGINS` not configured correctly
- Origin not matching pattern

**Solutions:**
- Verify `ALLOWED_ORIGINS` includes `https://*.zendesk.com`
- Check browser console for actual origin value
- Test with specific subdomain instead of wildcard

### "500 Internal Server Error"

**Possible causes:**
- Error in backend code
- BC API returning error
- Network issues

**Solutions:**
- Check Function App logs for detailed error
- Verify all environment variables are set
- Test BC API access directly with Postman
- Check BC company ID format (should be GUID)

### Functions Not Loading

**Possible causes:**
- Deployment failed
- Function App not started
- Runtime error

**Solutions:**
- Check deployment output for errors
- Restart Function App in Azure Portal
- Verify all 5 functions are listed in Azure Portal
- Check host.json and package.json are correct

## Performance

**Cold Start:**
- First request after idle: 2-5 seconds
- Token acquisition: ~500ms
- Subsequent requests: <100ms

**Optimization Tips:**
- Keep Function App warm with health checks every 5 minutes
- Use Application Insights to identify slow requests
- Consider upgrading to Premium plan for better performance

## Cost

**Consumption Plan Pricing:**
- First 1 million executions: Free
- After that: $0.20 per million executions
- Memory consumption: Minimal (~128MB)

**Typical Usage:**
- ~10-50 function executions per time entry
- For 100 agents making 5 entries/day:
  - 100 agents × 5 entries × 30 days = 15,000 entries/month
  - 15,000 × 30 executions = 450,000 executions/month
  - **Cost: $0** (within free tier)

## Contributing

When adding new endpoints:

1. Create new folder under `api/`
2. Add `index.js` with handler function
3. Add `function.json` with bindings
4. Import required services (`bcClient`, `cors`)
5. Handle OPTIONS for CORS preflight
6. Return consistent response format
7. Update this README

## License

Same as main project.
