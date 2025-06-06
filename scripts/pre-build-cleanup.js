const { execSync } = require('child_process');
const path = require('path');

// Run the AppleDouble cleanup script before building
console.log('Cleaning up AppleDouble files before build...');
try {
  execSync('npm run clean:apple-double', { stdio: 'inherit' });
  console.log('AppleDouble cleanup completed successfully.');
} catch (error) {
  console.error('Error cleaning up AppleDouble files:', error);
  process.exit(1);
} 