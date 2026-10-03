import { PRELOADED_CASES } from '../src/data/preloadedCases.js';

for (let i = 0; i < 2; i++) {
  const text = PRELOADED_CASES[i].content;
  const match = text.match(/#+\s*(?:[^\n]*?)(?:الجدول الزمني|الخط الزمني)[^\n]*\n([\s\S]*?)(?=\n#+|$)/i);
  console.log(`=== CASE ${i + 1} TIMELINE RAW SNIPPET ===`);
  console.log(match ? match[1].slice(0, 400) : 'NO MATCH');
}
