#!/usr/bin/env python3
"""
Create Zendesk app package with proper structure and permissions
"""

import os
import zipfile
import shutil
from pathlib import Path

def create_package():
    print("Creating Zendesk app package...")

    # Configuration
    package_name = "zendesk-bc-timetracker.zip"

    # Files to include
    files_to_package = [
        ("manifest.json", "manifest.json"),
        ("assets/app.js", "assets/app.js"),
        ("assets/iframe.html", "assets/iframe.html"),
        ("translations/en.json", "translations/en.json"),
    ]

    # Remove old package
    if os.path.exists(package_name):
        os.remove(package_name)
        print(f"Removed old {package_name}")

    # Create zip file
    with zipfile.ZipFile(package_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for source, dest in files_to_package:
            if os.path.exists(source):
                zipf.write(source, dest)
                print(f"  ✓ Added {dest}")
            else:
                print(f"  ✗ Missing {source}")
                return False

    # Verify package
    if os.path.exists(package_name):
        size = os.path.getsize(package_name)
        print(f"\n✅ Package created successfully!")
        print(f"File: {package_name}")
        print(f"Size: {size:,} bytes ({size/1024:.1f} KB)")

        print("\nContents:")
        with zipfile.ZipFile(package_name, 'r') as zipf:
            for info in zipf.infolist():
                print(f"  {info.filename:30s} {info.file_size:10,} bytes")

        return True
    else:
        print("❌ Failed to create package")
        return False

if __name__ == "__main__":
    success = create_package()
    exit(0 if success else 1)
