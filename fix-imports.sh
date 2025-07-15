#!/bin/bash

# Fix imports in all TypeScript files
find src -type f -name "*.ts" -exec sed -i '' 's/\.\.\/\.\.\/\.\.\/core\/domain/\.\.\/\.\.\/\.\.\/domain/g' {} +
find src -type f -name "*.ts" -exec sed -i '' 's/\.\.\/\.\.\/\.\.\/core\/application/\.\.\/\.\.\/\.\.\/application/g' {} +
find src -type f -name "*.ts" -exec sed -i '' 's/\.\.\/\.\.\/\.\.\/core\/shared/\.\.\/\.\.\/\.\.\/\.\.\/shared/g' {} +
find src -type f -name "*.ts" -exec sed -i '' 's/\.\.\/\.\.\/\.\.\/shared/\.\.\/\.\.\/\.\.\/\.\.\/shared/g' {} +

# Fix any absolute paths that might have been created
find src -type f -name "*.ts" -exec sed -i '' 's/\/Users\/daisyta\/Documents\/Industrial-Inventory\/shared/\/Users\/daisyta\/Documents\/Industrial-Inventory\/src\/shared/g' {} + 