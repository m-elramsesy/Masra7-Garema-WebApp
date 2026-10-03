import { PRELOADED_CASES } from '../src/data/preloadedCases.js';

const text = PRELOADED_CASES[1].content;
const match = text.match(/#+\s*(?:[^\n]*?)(?:الجدول الزمني|الخط الزمني)[^\n]*\n([\s\S]*?)(?=\n#+|$)/i);
console.log('Case 2 match:');
console.log(match ? match[1] : 'NONE');
