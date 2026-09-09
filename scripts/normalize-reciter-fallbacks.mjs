import fs from 'node:fs';
const path = 'src/data/quran_reciters.ts';
let source = fs.readFileSync(path, 'utf8');
source = source.replace(/(url:\s*'([^']+)'\s*,\n\s*)fallbackUrl:\s*'[^']+'/g, "$1fallbackUrl: '$2'");
fs.writeFileSync(path, source);
console.log('Fallback URLs normalized to the official primary MP3Quran server for every reciter.');
