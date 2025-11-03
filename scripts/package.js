/**
 * Clean Package Script
 * Creates a minimal Zendesk app package with only required files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DIST_DIR = 'dist';
const ASSETS_DIR = 'dist/assets';
const TRANSLATIONS_DIR = 'dist/translations/en';
const PACKAGE_NAME = 'zendesk-bc-timetracker.zip';

console.log('Creating clean Zendesk app package...\n');

// Clean dist folder
if (fs.existsSync(DIST_DIR)) {
  console.log('Cleaning existing dist folder...');
  fs.rmSync(DIST_DIR, { recursive: true });
}

// Create directories
console.log('Creating dist structure...');
fs.mkdirSync(ASSETS_DIR, { recursive: true });
fs.mkdirSync('dist/translations', { recursive: true });

// Copy required files
console.log('Copying files...');

// Copy manifest
fs.copyFileSync('manifest.json', 'dist/manifest.json');
console.log('  ✓ manifest.json');

// Copy assets
fs.copyFileSync('assets/iframe.html', 'dist/assets/iframe.html');
console.log('  ✓ assets/iframe.html');

fs.copyFileSync('assets/app.js', 'dist/assets/app.js');
console.log('  ✓ assets/app.js');

// Create translations file (must be en.json, not en/translations.json)
const translations = {
  app: {
    name: 'Business Central Time Tracker',
    short_description: 'Track time and log entries to Business Central',
    long_description: 'Track time on Zendesk tickets and automatically create time registration entries in Microsoft Dynamics 365 Business Central.',
    installation_instructions: 'Configure your Business Central API credentials to connect this app to your BC instance.'
  }
};

fs.writeFileSync(
  'dist/translations/en.json',
  JSON.stringify(translations, null, 2)
);
console.log('  ✓ translations/en.json');

// Create zip package
console.log('\nCreating zip package...');

try {
  // Remove existing package
  if (fs.existsSync(PACKAGE_NAME)) {
    fs.unlinkSync(PACKAGE_NAME);
  }

  // Create zip using PowerShell (Windows) or zip command (Unix)
  if (process.platform === 'win32') {
    execSync(`powershell -Command "Compress-Archive -Path ${DIST_DIR}/* -DestinationPath ${PACKAGE_NAME} -Force"`, {
      stdio: 'inherit'
    });
  } else {
    execSync(`cd ${DIST_DIR} && zip -r ../${PACKAGE_NAME} . && cd ..`, {
      stdio: 'inherit'
    });
  }

  // Get file sizes
  const stats = fs.statSync(PACKAGE_NAME);
  const fileSizeKB = (stats.size / 1024).toFixed(2);

  console.log(`\n✅ Package created successfully!\n`);
  console.log(`Package: ${PACKAGE_NAME}`);
  console.log(`Size: ${fileSizeKB} KB`);
  console.log(`\nContents:`);

  // List contents
  const listFiles = (dir, prefix = '') => {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        console.log(`  ${prefix}${file}/`);
        listFiles(filePath, prefix + '  ');
      } else {
        const sizeKB = (stat.size / 1024).toFixed(2);
        console.log(`  ${prefix}${file} (${sizeKB} KB)`);
      }
    });
  };

  listFiles(DIST_DIR);

  console.log(`\n📦 Ready to upload to Zendesk!`);
  console.log(`\nUpload Instructions:`);
  console.log(`1. Go to Zendesk Admin Center`);
  console.log(`2. Navigate to: Apps → Zendesk Support apps`);
  console.log(`3. Click "Upload private app"`);
  console.log(`4. Select: ${PACKAGE_NAME}`);
  console.log(`5. Configure BC credentials and install\n`);

} catch (error) {
  console.error('Error creating package:', error.message);
  process.exit(1);
}
