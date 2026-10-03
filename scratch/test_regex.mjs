import fs from 'fs';
import path from 'path';

const text = fs.readFileSync('../case-generator/cases/CASE_FILES_ROYAL_RUBY_HEIST.md', 'utf-8');

// Matrix Regex Test
const matrixMatch = text.match(/#+\s*(?:[^\n]*?)(?:مصفوفة الأدلة|ملخص مسار الاستنتاج)[^\n]*\n([\s\S]*?)(?=\n#+|$)/i);
console.log('Matrix Match found:', !!matrixMatch);
if (matrixMatch) {
  const lines = matrixMatch[1].split('\n').filter(l => l.includes('|') && !l.includes('---'));
  console.log('Matrix rows:', lines.length - 1);
}

// Timeline Regex Test
const timelineMatch = text.match(/#+\s*(?:[^\n]*?)(?:الجدول الزمني|الخط الزمني)[^\n]*\n([\s\S]*?)(?=\n#+|$)/i);
console.log('Timeline Match found:', !!timelineMatch);
if (timelineMatch) {
  const lines = timelineMatch[1].split('\n').filter(l => l.trim().startsWith('*') || l.includes('|'));
  console.log('Timeline entries:', lines.length);
}
