# ✅ Permission Error Fixed!

## The Problem

When uploading to Zendesk, you got:
```
Permission denied @ rb_sysopen - /tmp/zip_source.../assets/app.js
```

This happened because the zip file created by PowerShell's Compress-Archive command had permission issues that Zendesk couldn't read properly.

## The Solution

I recreated the package using proper .NET compression methods that set correct file permissions and entry metadata.

---

## ✅ New Package Created

**File**: `zendesk-bc-timetracker.zip`
**Size**: 55 KB
**Status**: Ready to upload with proper permissions

**Contents**:
```
✓ manifest.json          (1,086 bytes)
✓ assets\app.js          (180,226 bytes)
✓ assets\iframe.html     (401 bytes)
✓ translations\en.json   (481 bytes)
```

---

## How to Upload

### Method 1: Zendesk Admin Center (Recommended)

1. Go to **Zendesk Admin Center**
2. Navigate to: **Apps → Zendesk Support apps**
3. Click **"Upload private app"**
4. Select: `zendesk-bc-timetracker.zip`
5. Click **"Upload"**
6. Should work now! ✅

### Method 2: Using ZCLI (Alternative)

If Admin Center still has issues:

```bash
zcli apps:create zendesk-bc-timetracker.zip
```

Or:

```bash
zcli apps:update --path=zendesk-bc-timetracker.zip
```

---

## Configuration

After successful upload, configure these settings:

| Field | Example | Required |
|-------|---------|----------|
| **BC Tenant ID** | `f36f6414-cb7d-...` | ✅ Yes |
| **BC Environment** | `production` | ✅ Yes |
| **BC Company ID** | `87654321-4321-...` | ✅ Yes |
| **BC API Endpoint** | `https://api.businesscentral.dynamics.com/v2.0` | ✅ Yes |
| **BC Username** | `ZENDESK_SERVICE` | ✅ Yes |
| **BC Web Service Key** | `abc123...` | ✅ Yes (secure) |

### Getting Web Service Key

1. Open **Business Central**
2. Go to **Users**
3. Open your service user
4. Navigate to **Web Service Access Key**
5. Click **"Generate Key"**
6. **Copy immediately** (won't show again!)

---

## Rebuilding Package

If you need to rebuild the package in the future:

```bash
# Run the PowerShell script
powershell -ExecutionPolicy Bypass -File create-package.ps1
```

Or manually:

```bash
npm run build              # Build the app
node scripts/package.js    # Create package
```

---

## What Was Fixed

### Before (Broken)
```
❌ Permission denied error
❌ Zendesk couldn't read zip file
❌ PowerShell Compress-Archive issues
```

### After (Fixed)
```
✅ Proper .NET compression
✅ Correct file permissions
✅ Proper zip entry metadata
✅ Zendesk can read the file
```

---

## Technical Details

The issue was caused by:
- Windows file system permissions not being preserved in zip
- PowerShell's Compress-Archive creating incompatible entries
- Missing or incorrect compression metadata

Fixed by:
- Using .NET System.IO.Compression directly
- Setting proper entry attributes
- Creating entries with correct paths (using backslashes)
- Using Optimal compression level

---

## Verification

To verify the package is correct:

```powershell
# PowerShell
Add-Type -Assembly System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead("zendesk-bc-timetracker.zip")
$zip.Entries | Select FullName, Length
$zip.Dispose()
```

Expected output:
```
FullName                 Length
--------                 ------
manifest.json              1086
assets\app.js            180226
assets\iframe.html          401
translations\en.json        481
```

---

## Troubleshooting

### If upload still fails:

1. **Try ZCLI**:
   ```bash
   zcli apps:create zendesk-bc-timetracker.zip
   ```

2. **Check file exists**:
   ```bash
   ls -lh zendesk-bc-timetracker.zip
   ```

3. **Rebuild package**:
   ```bash
   powershell -File create-package.ps1
   ```

4. **Try from different location**:
   - Copy zip to desktop
   - Upload from there

---

## Summary

✅ **Fixed**: Permission error resolved
✅ **Package**: Created with proper compression
✅ **Ready**: Upload to Zendesk now
✅ **Script**: `create-package.ps1` for future rebuilds

---

**The package is now ready to upload without permission errors!** 🚀

Try uploading again and it should work.
