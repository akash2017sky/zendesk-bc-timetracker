# Why Basic Authentication (Not OAuth)?

## ⚠️ The CORS Problem

I tried to implement OAuth 2.0 with Client Credentials flow, but it **doesn't work** for browser-based Zendesk apps due to **CORS restrictions**.

### The Error You Saw

```
Access to fetch at 'https://login.microsoftonline.com/.../oauth2/v2.0/token'
from origin 'https://1181811.apps.zdusercontent.com'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```

### Why This Happens

1. **Zendesk apps run entirely in the browser** (client-side JavaScript)
2. **OAuth Client Credentials requires calling Azure AD** to get a token
3. **Azure AD blocks browser requests** due to CORS security policy
4. **Client secrets shouldn't be exposed** in browser code (security risk)

### Technical Explanation

```
┌──────────┐                  ┌──────────┐                ┌──────────────┐
│ Browser  │                  │ Azure AD │                │   Business   │
│ (Zendesk)│                  │  OAuth   │                │   Central    │
└────┬─────┘                  └────┬─────┘                └──────┬───────┘
     │                             │                              │
     │ 1. Request Token            │                              │
     │ (client_id, client_secret)  │                              │
     ├────────────────────────────>│                              │
     │                             │                              │
     │ ❌ BLOCKED BY CORS          │                              │
     │<────────────────────────────┤                              │
     │                             │                              │
```

**OAuth Client Credentials is designed for server-side applications**, not browser apps!

---

## ✅ The Solution: Basic Authentication with Web Service Keys

For **client-side Zendesk apps**, Microsoft recommends using **Basic Authentication** with **Web Service Access Keys**.

### Why This Works

```
┌──────────┐                                        ┌──────────────┐
│ Browser  │                                        │   Business   │
│ (Zendesk)│                                        │   Central    │
└────┬─────┘                                        └──────┬───────┘
     │                                                     │
     │ 1. API Request with Basic Auth                     │
     │ (Authorization: Basic base64(username:key))        │
     ├────────────────────────────────────────────────────>│
     │                                                     │
     │ 2. BC validates credentials                        │
     │                                                     │
     │ 3. Return data                                     │
     │<─────────────────────────────────────────────────────┤
     │                                                     │
```

✅ **No CORS issues** - Direct API call to BC
✅ **No Azure AD dependency** - BC handles authentication
✅ **Secure** - Web Service Keys are designed for this
✅ **Simple** - One-step authentication

---

## How to Get Web Service Access Key

### Step 1: Create User in Business Central

1. Open **Business Central**
2. Go to **Users** (search in top bar)
3. Create new user or use existing

### Step 2: Generate Web Service Access Key

1. Open the user
2. Go to **Web Service Access Key** section
3. Click **"Generate Key"** or **"Set Expiration Date"**
4. **Copy the key** immediately (you won't see it again!)
5. Optionally set expiration date

### Step 3: Assign Permissions

The user needs:
- `D365 BASIC` or `D365 TEAM MEMBER` license
- `TIME SHEET USER` permission set (or custom)

Permissions needed:
- ✅ Read: Customers
- ✅ Read: Jobs (Projects)
- ✅ Read: Employees
- ✅ Write: Time Registration Entries

---

## Configuration in Zendesk

When installing the app, provide:

| Field | Value | Example |
|-------|-------|---------|
| **BC Tenant ID** | Azure AD tenant GUID | `12345678-1234-...` |
| **BC Environment** | Environment name | `production` |
| **BC Company ID** | Company GUID | `87654321-4321-...` |
| **BC API Endpoint** | BC API URL | `https://api.businesscentral.dynamics.com/v2.0` |
| **BC Username** | BC user name | `ZENDESK_SERVICE` |
| **BC Web Service Key** | Generated key | `abc123...xyz` (secure) |

---

## Security Comparison

| Aspect | Basic Auth (Web Service Key) | OAuth Client Credentials |
|--------|------------------------------|--------------------------|
| **Works in Browser** | ✅ Yes | ❌ No (CORS blocked) |
| **Secure for Zendesk Apps** | ✅ Yes | ❌ Exposes client secret |
| **Microsoft Recommended** | ✅ For browser apps | ✅ For server apps only |
| **Token Management** | ❌ No token (direct auth) | ✅ Refreshing tokens |
| **Complexity** | ✅ Simple | ❌ Complex |
| **Suitable For** | ✅ Client-side apps | ✅ Server-side apps |

---

## When to Use OAuth

OAuth Client Credentials is great for:
- **Server-side applications** (Node.js, .NET, Java, etc.)
- **Backend services** that call BC API
- **Integrations** running on your servers
- **Scheduled jobs** and background workers

But **NOT for**:
- ❌ Browser-based apps (Zendesk, Chrome extensions, SPAs)
- ❌ Mobile apps (use OAuth Authorization Code flow instead)
- ❌ Any client-side JavaScript

---

## Alternative: Zendesk Backend App (Future Enhancement)

If you want OAuth, you'd need to:

1. **Create a Zendesk backend app** (requires server)
2. **Backend calls Azure AD** to get OAuth token
3. **Backend calls BC API** with token
4. **Frontend calls your backend** via secure API
5. **No CORS issues** because backend handles OAuth

This is much more complex and requires:
- Server infrastructure
- Backend API development
- Additional maintenance

For most use cases, **Basic Auth with Web Service Keys is the right choice** for Zendesk apps.

---

## Security Best Practices

Even with Basic Auth, follow these practices:

✅ **Use Web Service Keys** (not user passwords)
✅ **Set Key Expiration** (rotate every 6-12 months)
✅ **Create Dedicated Service Account** (not personal user)
✅ **Least Privilege** (only required permissions)
✅ **Monitor Access** (review BC access logs)
✅ **Secure Storage** (Zendesk stores credentials securely)

---

## Summary

| ❌ OAuth Client Credentials | ✅ Basic Auth with Web Service Key |
|-----------------------------|-------------------------------------|
| CORS blocks browser requests | Works perfectly in browser |
| Exposes client secret | Secure Web Service Key |
| Complex token management | Simple direct authentication |
| Designed for servers | Designed for API access |
| **Doesn't work in Zendesk apps** | **Perfect for Zendesk apps** |

---

## Conclusion

**Basic Authentication with Web Service Access Keys is:**
- ✅ The **correct** approach for Zendesk apps
- ✅ **Recommended** by Microsoft for browser-based BC integrations
- ✅ **Secure** when following best practices
- ✅ **Simple** to implement and maintain
- ✅ **Reliable** - no CORS issues

**OAuth Client Credentials is NOT suitable** for browser-based Zendesk apps due to CORS restrictions and security concerns.

---

**Next Steps**:
1. Generate Web Service Access Key in Business Central
2. Upload `zendesk-bc-timetracker.zip` to Zendesk
3. Configure with username and Web Service Key
4. Test - should work without CORS errors!
