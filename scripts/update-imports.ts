import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const OLD_TO_NEW_PATHS = {
  '00-constants': 'shared/constants',
  '01-domain': 'core/domain',
  '02-application': 'core/application',
  '03-infrastructure': 'infrastructure',
  '04-presentation': 'presentation',
  '__tests__': 'tests'
};

async function* getFiles(dir: string): AsyncGenerator<string> {
  const dirents = await readdir(dir, { withFileTypes: true });
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
  for await (const filePath of getFiles('src')) {
    let content = await readFile(filePath, 'utf8');
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

    // Remove "Optimized" prefix from imports
    const optimizedRegex = /from ['"].*?Optimized([^'"]+)['"]/g;
    const newContent = content.replace(optimizedRegex, (match, name) => {
      modified = true;
      return match.replace(`Optimized${name}`, name);
    });
    content = newContent;

    if (modified) {
      await writeFile(filePath, content, 'utf8');
      console.log(`Updated imports in ${filePath}`);
    }
  }
}

updateImports().catch(console.error); 