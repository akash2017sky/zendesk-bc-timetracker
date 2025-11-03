#!/bin/bash

# Create Zendesk app package with proper permissions

echo "Creating Zendesk app package..."

# Clean up
rm -f zendesk-bc-timetracker.zip

# Create package directory
PACKAGE_DIR="package_temp"
rm -rf "$PACKAGE_DIR"
mkdir -p "$PACKAGE_DIR/assets"
mkdir -p "$PACKAGE_DIR/translations"

# Copy files
cp manifest.json "$PACKAGE_DIR/"
cp assets/app.js "$PACKAGE_DIR/assets/"
cp assets/iframe.html "$PACKAGE_DIR/assets/"
cp translations/en.json "$PACKAGE_DIR/translations/"

# Set proper permissions
chmod 755 "$PACKAGE_DIR"
chmod 755 "$PACKAGE_DIR/assets"
chmod 755 "$PACKAGE_DIR/translations"
chmod 644 "$PACKAGE_DIR/manifest.json"
chmod 644 "$PACKAGE_DIR/assets/app.js"
chmod 644 "$PACKAGE_DIR/assets/iframe.html"
chmod 644 "$PACKAGE_DIR/translations/en.json"

# Create zip from package directory
cd "$PACKAGE_DIR"
zip -r ../zendesk-bc-timetracker.zip . -x ".*" -x "__MACOSX"
cd ..

# Clean up
rm -rf "$PACKAGE_DIR"

# Verify
if [ -f "zendesk-bc-timetracker.zip" ]; then
    echo ""
    echo "✅ Package created successfully!"
    echo "File: zendesk-bc-timetracker.zip"
    ls -lh zendesk-bc-timetracker.zip
    echo ""
    echo "Contents:"
    unzip -l zendesk-bc-timetracker.zip
else
    echo "❌ Failed to create package"
    exit 1
fi
