const fs = require('fs');
const path = require('path');

const contentDir = path.join(__dirname, '../content');
const corpusPath = path.join(__dirname, '../src/lib/corpus.ts');

const files = [
  'brand-system.html',
  'doctrine.html',
  'operational-philosophy.html'
];

let corpusContent = `// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Run 'npm run sync-corpus' to update this file from the content/ directory.

export const CORPUS = \`
`;

for (const file of files) {
  const filePath = path.join(contentDir, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    // Basic HTML stripping for the AI corpus
    const textContent = content
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    corpusContent += `\n--- ${file.toUpperCase()} ---\n\n${JSON.stringify(textContent)}\n`;
  }
}

corpusContent += `\`;\n`;

fs.writeFileSync(corpusPath, corpusContent);
console.log('Corpus synchronized successfully!');
