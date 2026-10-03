import { PRELOADED_CASES } from '../src/data/preloadedCases.js';

PRELOADED_CASES.forEach((c, idx) => {
  const text = c.content;
  const match = text.match(/#+\s*(?:[^\n]*?)(?:الجدول الزمني|الخط الزمني)[^\n]*\n([\s\S]*?)(?=\n#+|$)/i);
  if (match) {
    const raw = match[1];
    const items = [];
    const lines = raw.split('\n');
    lines.forEach(line => {
      const l = line.trim();
      if (l.startsWith('*') && l.includes('**')) {
        const m = l.match(/\*\s*\*\*([^*]+)\*\*(?:[:—\-\s]*)(.+)/);
        if (m) {
          items.push({ time: m[1].replace(/[:—\-]$/, '').trim(), event: m[2].trim() });
        }
      } else if (l.includes('|') && !l.includes('---') && !l.includes('الوقت') && !l.includes('التوقيت')) {
        const cols = l.split('|').map(x => x.trim()).filter(Boolean);
        if (cols.length >= 2) {
          items.push({ time: cols[0], event: cols[1], person: cols[2] || '' });
        }
      }
    });
    console.log(`Case ${idx + 1} (${c.id}) -> Total timeline items: ${items.length}`);
  }
});
