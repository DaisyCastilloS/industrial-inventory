import { promises as fs } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OLD_TO_NEW_PATHS = {
  '00-constants': 'shared/constants',
  '01-domain': 'core/domain',
  '02-application': 'core/application',
  '03-infrastructure': 'infrastructure',
  '04-presentation': 'presentation',
  '__tests__': 'tests'
};

async function* getFiles(dir) {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const res = join(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* getFiles(res);
    } else if (dirent.name.endsWith('.ts')) {
      yield res;
    }
  }
}

async function updateImports() {
  try {
    const srcPath = join(dirname(__dirname), 'src');
    for await (const filePath of getFiles(srcPath)) {
      let content = await fs.readFile(filePath, 'utf8');
      let modified = false;

      // Update imports
      for (const [oldPath, newPath] of Object.entries(OLD_TO_NEW_PATHS)) {
        const regex = new RegExp(`from ['"]\\.\\.?/.*?${oldPath}/`, 'g');
        const newContent = content.replace(regex, (match) => {
          modified = true;
          return match.replace(oldPath, newPath);
        });
        content = newContent;
      }

      // Remove "Optimized" prefix from imports and file names
      const optimizedRegex = /from ['"].*?Optimized([^'"]+)['"]/g;
      const newContent = content.replace(optimizedRegex, (match, name) => {
        modified = true;
        return match.replace(`Optimized${name}`, name);
      });
      content = newContent;

      if (modified) {
        await fs.writeFile(filePath, content, 'utf8');
        console.log(`Updated imports in ${filePath}`);
      }

      // Rename files with "Optimized" prefix
      if (filePath.includes('Optimized')) {
        const newPath = filePath.replace('Optimized', '');
        await fs.rename(filePath, newPath);
        console.log(`Renamed ${filePath} to ${newPath}`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

updateImports(); 