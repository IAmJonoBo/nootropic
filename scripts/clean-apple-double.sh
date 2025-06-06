#!/bin/bash

# Find and remove all AppleDouble files
echo "Cleaning up AppleDouble files..."
find . -type f -name "._*" -not -path "*/node_modules/*" -not -path "*/.git/*" -delete

# Find and remove .DS_Store files
echo "Cleaning up .DS_Store files..."
find . -type f -name ".DS_Store" -not -path "*/node_modules/*" -not -path "*/.git/*" -delete

echo "Cleanup complete!" 