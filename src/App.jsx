import React, { useState } from 'react';
import Dashboard from './components/dashboard/Dashboard';
import GameLayout from './components/game/GameLayout';
import { parseCaseMarkdown } from './parser/caseParser';
import { PRELOADED_CASES } from './data/preloadedCases';
import './styles/index.css';

export default function App() {
  const [activeCase, setActiveCase] = useState(null);

  // Pre-parse bundled cases so metadata is immediately ready
  const parsedPreloadedCases = PRELOADED_CASES.map(item => {
    try {
      const raw = item.content || item.rawMarkdown;
      const parsed = parseCaseMarkdown(raw, item.filename);
      return {
        ...parsed,
        id: item.id,
        title: item.title,
        difficulty: item.difficulty,
        victim: parsed.metadata?.victim || item.victim,
        location: parsed.metadata?.location || item.location,
        duration: item.duration,
        category: item.category,
        source: 'PRELOADED',
        content: raw,
        rawMarkdown: raw
      };
    } catch (e) {
      console.error(`Failed to parse preloaded case ${item.id}`, e);
      return item;
    }
  });

  const handleSelectCase = (caseItem) => {
    const raw = caseItem.content || caseItem.rawMarkdown;
    if (raw) {
      try {
        const fullParsed = parseCaseMarkdown(raw, caseItem.filename || `${caseItem.id}.md`);
        setActiveCase({
          ...fullParsed,
          id: caseItem.id,
          title: caseItem.title || fullParsed.metadata?.title,
          victim: fullParsed.metadata?.victim || caseItem.victim,
          location: fullParsed.metadata?.location || caseItem.location,
          difficulty: caseItem.difficulty || fullParsed.difficulty,
          duration: caseItem.duration || fullParsed.duration
        });
        return;
      } catch (e) {
        console.error('Failed to parse selected case markdown', e);
      }
    }
    setActiveCase(caseItem);
  };

  const handleImportCase = (rawMarkdown, fileName) => {
    try {
      const parsed = parseCaseMarkdown(rawMarkdown, fileName);
      const importedCase = {
        ...parsed,
        id: `imported-${Date.now()}`,
        title: parsed.metadata?.title || fileName.replace(/\.md$/, ''),
        source: 'IMPORTED',
        content: rawMarkdown,
        rawMarkdown
      };
      setActiveCase(importedCase);
    } catch (err) {
      alert('حدث خطأ أثناء قراءة ملف القضية: ' + err.message);
    }
  };

  return (
    <div className="app-container" dir="rtl">
      {activeCase ? (
        <GameLayout
          caseData={activeCase}
          onBackToDashboard={() => setActiveCase(null)}
        />
      ) : (
        <Dashboard
          preloadedCases={parsedPreloadedCases}
          onSelectCase={handleSelectCase}
          onImportCase={handleImportCase}
        />
      )}
    </div>
  );
}
