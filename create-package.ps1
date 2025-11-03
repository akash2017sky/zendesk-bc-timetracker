# Create Zendesk app package with proper structure

Write-Host "Creating Zendesk app package..." -ForegroundColor Green

$packageName = "zendesk-bc-timetracker.zip"

# Remove old package
if (Test-Path $packageName) {
    Remove-Item $packageName -Force
    Write-Host "Removed old package" -ForegroundColor Yellow
}

# Files to include
$files = @(
    @{Source="manifest.json"; Dest="manifest.json"},
    @{Source="assets\app.js"; Dest="assets\app.js"},
    @{Source="assets\iframe.html"; Dest="assets\iframe.html"},
    @{Source="translations\en.json"; Dest="translations\en.json"}
)

# Load compression assembly
Add-Type -Assembly System.IO.Compression.FileSystem

# Create zip file
$zipPath = Join-Path (Get-Location) $packageName
$zip = [System.IO.Compression.ZipFile]::Open($zipPath, 'Create')

try {
    foreach ($file in $files) {
        $sourcePath = Resolve-Path $file.Source -ErrorAction Stop
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
            $zip,
            $sourcePath,
            $file.Dest,
            'Optimal'
        ) | Out-Null
        Write-Host "  Added: $($file.Dest)" -ForegroundColor Gray
    }
}
finally {
    $zip.Dispose()
}

# Verify package
if (Test-Path $packageName) {
    $size = (Get-Item $packageName).Length
    Write-Host "`nPackage created successfully!" -ForegroundColor Green
    Write-Host "File: $packageName"
    Write-Host "Size: $($size / 1KB) KB"

    Write-Host "`nContents:" -ForegroundColor Cyan
    Add-Type -Assembly System.IO.Compression.FileSystem
    $zipFile = [System.IO.Compression.ZipFile]::OpenRead($packageName)
    foreach ($entry in $zipFile.Entries) {
        Write-Host "  $($entry.FullName.PadRight(30)) $($entry.Length) bytes"
    }
    $zipFile.Dispose()
}
else {
    Write-Host "Failed to create package" -ForegroundColor Red
    exit 1
}
