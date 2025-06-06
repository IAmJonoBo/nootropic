# AppleDouble File Prevention

This document outlines the measures implemented to prevent AppleDouble files (._*) and other macOS-specific files from polluting the codebase.

## What are AppleDouble Files?

AppleDouble files (._*) are metadata files created by macOS to store extended attributes and resource forks. They are not needed for the project and can cause issues with version control and build processes.

## Prevention Measures

### 1. Git Configuration
- `.gitignore` patterns to ignore AppleDouble files
- `.gitattributes` to prevent creation of AppleDouble files
- Pre-commit hook to prevent committing AppleDouble files
- Pre-push hook to catch any AppleDouble files that slipped through

### 2. Development Environment
- VS Code settings to hide AppleDouble files
- ESLint configuration to ignore AppleDouble files
- Nx configuration to exclude AppleDouble files from builds

### 3. Cleanup Tools
- `npm run clean:apple-double` script to remove existing AppleDouble files
- Automated cleanup in CI/CD pipelines

### 4. CI/CD Checks
- GitHub Actions workflow to check for AppleDouble files
- Automated checks on pull requests and pushes

## How to Use

### Cleaning Up AppleDouble Files
```bash
npm run clean:apple-double
```

### VS Code Integration
The VS Code settings automatically hide AppleDouble files from your workspace. No additional configuration is needed.

### Git Integration
The Git hooks and attributes are automatically applied when you clone the repository. No additional configuration is needed.

## Troubleshooting

If you encounter AppleDouble files:

1. Run the cleanup script:
   ```bash
   npm run clean:apple-double
   ```

2. If the files persist, check:
   - Your Git configuration
   - VS Code settings
   - File system permissions

3. For persistent issues, contact the development team.

## Contributing

When contributing to the project:

1. Ensure you don't commit AppleDouble files
2. Run the cleanup script before committing
3. Follow the pre-commit and pre-push hooks
4. Check CI/CD results for any AppleDouble file warnings 