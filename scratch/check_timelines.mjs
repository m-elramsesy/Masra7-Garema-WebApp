import { PRELOADED_CASES } from '../src/data/preloadedCases.js';

PRELOADED_CASES.forEach((c, idx) => {
  const text = c.content;
  const match = text.match(/#+\s*(?:[^\n]*?)(?:الجدول الزمني|الخط الزمني)[^\n]*\n([\s\S]*?)(?=\n#+|$)/i);
  console.log(`Case ${idx + 1} (${c.id}) Timeline match:`, !!match);
  if (match) {
    const raw = match[1];
    const bulletMatches = [...raw.matchAll(/\*\s*\*\*([^*]+)\*\*:\s*([^\n]+)/g)];
    const tableLines = raw.split('\n').filter(l => l.includes('|') && !l.includes('---'));
    console.log(`  Bullets: ${bulletMatches.length}, Table rows: ${tableLines.length}`);
  }
});
