import fs from 'fs';
import path from 'path';
import { PRELOADED_CASES } from '../src/data/preloadedCases.js';

const casesDir = path.resolve('../case-generator/cases');
const files = fs.readdirSync(casesDir).filter(f => f.endsWith('.md'));

console.log('--- Files in case-generator/cases ---');
files.forEach(f => {
  const stat = fs.statSync(path.join(casesDir, f));
  console.log(`${f}: ${stat.size} bytes`);
});

console.log('\n--- Cases in PRELOADED_CASES ---');
PRELOADED_CASES.forEach(c => {
  console.log(`${c.id} (${c.filename}): ${c.content?.length || 0} chars`);
});
