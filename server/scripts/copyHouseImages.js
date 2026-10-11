import fs from 'fs';
import path from 'path';

const srcDir = 'C:\\Users\\For you\\.gemini\\antigravity-ide\\brain\\095e6a4b-e87f-49ec-87e7-f6f1d9bfbe05\\.user_uploaded';
const files = [
  { src: 'media_1791717566600.jpg', destName: 'mansion_exterior.jpg' },
  { src: 'media_1791717566565.jpg', destName: 'luxury_living_room.jpg' },
  { src: 'media_1791717566458.jpg', destName: 'home_sauna_spa.jpg' }
];

const targetDirs = [
  path.resolve('../frontend/public/houses'),
  path.resolve('./uploads')
];

for (const dir of targetDirs) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

for (const f of files) {
  const srcPath = path.join(srcDir, f.src);
  if (fs.existsSync(srcPath)) {
    for (const dir of targetDirs) {
      const destPath = path.join(dir, f.destName);
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied ${f.destName} -> ${destPath}`);
    }
  } else {
    console.error(`Not found: ${srcPath}`);
  }
}

console.log('Finished copying images.');
