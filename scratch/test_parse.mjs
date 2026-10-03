import { PRELOADED_CASES } from '../src/data/preloadedCases.js';
import { parseCaseMarkdown } from '../src/parser/caseParser.js';

PRELOADED_CASES.forEach((c, idx) => {
  const text = c.content || c.rawMarkdown;
  console.log(`\n=== CASE ${idx + 1}: ${c.title} (Length: ${text?.length || 0}) ===`);
  try {
    const res = parseCaseMarkdown(text, c.filename);
    console.log(`Parsed Title: ${res.title}`);
    console.log(`Suspects count: ${res.suspects?.length}`);
    console.log(`Envelopes count: ${res.envelopes?.length}`);
    res.envelopes?.forEach(e => {
      console.log(`  Envelope ${e.id || e.number}: docs=${e.documents?.length || e.sections?.length || 0}`);
    });
    console.log(`Timeline count: ${res.masterTimeline?.length || res.timeline?.length || 0}`);
    console.log(`Deduction matrix count: ${res.deductionMatrix?.length || 0}`);
  } catch (err) {
    console.error(`ERROR parsing case ${c.id}:`, err.message);
  }
});
