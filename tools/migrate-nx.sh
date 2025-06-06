#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting Nx migration process..."

# Backup package.json
echo "📦 Backing up package.json..."
cp package.json package.json.backup

# Update Nx and related packages
echo "📦 Updating Nx and related packages..."
pnpm add -D nx@latest @nx/js@latest @nx/react@latest @nx/vite@latest @nx/workspace@latest

# Add testing packages
echo "🧪 Adding testing packages..."
pnpm add -D @nx/jest@latest @nx/vitest@latest @nx/playwright@latest @nx/cypress@latest

# Add linting packages
echo "🔍 Adding linting packages..."
pnpm add -D @nx/lint@latest @nx/eslint@latest

# Add build packages
echo "🔨 Adding build packages..."
pnpm add -D @nx-tools/esbuild@latest

# Run Nx migration
echo "🔄 Running Nx migration..."
pnpm nx migrate latest

# Apply migrations
echo "📝 Applying migrations..."
pnpm nx migrate --run-migrations

# Clean install
echo "🧹 Cleaning and reinstalling dependencies..."
rm -rf node_modules
pnpm install

# Validate build
echo "✅ Validating build..."
pnpm nx run-many --target=build --all

# Validate tests
echo "🧪 Validating tests..."
pnpm nx run-many --target=test --all

# Validate linting
echo "🔍 Validating linting..."
pnpm nx run-many --target=lint --all

echo "🎉 Migration completed successfully!"
echo "📝 Please review the changes and update your documentation accordingly."
echo "🔍 Check docs/development/NX_MIGRATION.md for detailed information." 