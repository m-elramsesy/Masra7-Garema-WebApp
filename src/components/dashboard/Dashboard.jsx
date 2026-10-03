import React, { useState, useRef } from 'react';
import { PRELOADED_CASES } from '../../data/preloadedCases';
import { parseCaseMarkdown } from '../../parser/caseParser';
import { storage } from '../../services/storageService';
import { sound } from '../../services/audioService';
import { DoubleBezelCard } from '../common/DoubleBezelCard';
import { 
  FolderLock, 
  UploadCloud, 
  Search, 
  Play, 
  RotateCcw, 
  Trash2, 
  Clock, 
  Users, 
  Layers, 
  ShieldCheck, 
  Award,
  Sparkles,
  FileText
} from 'lucide-react';

export function Dashboard({ onSelectCase }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // all, in_progress, completed
  const [customCases, setCustomCases] = useState(() => storage.getCustomCases());
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Combine preloaded and custom cases
  const allCases = [
    ...PRELOADED_CASES.map(c => {
      const state = storage.getCaseState(c.id);
      return {
        ...c,
        isCustom: false,
        unlockedCount: state.unlockedEnvelopes.length,
        isCompleted: state.isCompleted,
        lastPlayedAt: state.lastPlayedAt,
        hasStarted: state.unlockedEnvelopes.length > 1 || state.readDocs.length > 0 || state.askedQuestions.length > 0
      };
    }),
    ...customCases.map(c => {
      const state = storage.getCaseState(c.id);
      return {
        ...c,
        isCustom: true,
        unlockedCount: state.unlockedEnvelopes.length,
        isCompleted: state.isCompleted,
        lastPlayedAt: state.lastPlayedAt,
        hasStarted: state.unlockedEnvelopes.length > 1 || state.readDocs.length > 0 || state.askedQuestions.length > 0
      };
    })
  ];

  // Filtering
  const filteredCases = allCases.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.category.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterTab === 'in_progress') return c.hasStarted && !c.isCompleted;
    if (filterTab === 'completed') return c.isCompleted;
    return true;
  });

  // Recent in-progress case
  const activeCase = allCases
    .filter(c => c.hasStarted && !c.isCompleted)
    .sort((a, b) => b.lastPlayedAt - a.lastPlayedAt)[0];

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const parsed = parseCaseMarkdown(text, file.name);
        const newCase = {
          id: `custom-${Date.now()}`,
          title: parsed.title,
          filename: file.name,
          category: parsed.category,
          difficulty: parsed.difficulty,
          duration: parsed.duration,
          suspectsCount: `${parsed.suspects.length} مشتبهين`,
          envelopesCount: `${parsed.envelopes.length} أظرف`,
          content: text
        };
        const updated = storage.saveCustomCase(newCase);
        setCustomCases(updated);
        sound.playStamp();
      } catch (err) {
        alert(`فشل تحليل ملف القضية: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteCustomCase = (caseId, e) => {
    e.stopPropagation();
    if (window.confirm('هل أنت متأكد من حذف هذه القضية وملفاتها وسجلاتها؟')) {
      const updated = storage.deleteCustomCase(caseId);
      setCustomCases(updated);
      sound.playPageTurn();
    }
  };

  const handleResetCase = (caseId, e) => {
    e.stopPropagation();
    if (window.confirm('هل تريد إعادة تعيين تقدم هذه القضية والبدء من جديد من المظروف الأول؟')) {
      storage.clearCaseState(caseId);
      sound.playPageTurn();
      // force reload component state
      setCustomCases([...storage.getCustomCases()]);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 20px' }}>
      {/* Top Header */}
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '9999px', background: 'rgba(225, 29, 72, 0.1)', border: '1px solid rgba(225, 29, 72, 0.25)', marginBottom: '12px' }}>
            <ShieldCheck style={{ width: '16px', height: '16px', color: '#e11d48' }} />
            <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.1em', color: '#fda4af' }}>
              المقر الرقمي للبحث الجنائي والتحقيق
            </span>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#f8fafc', lineHeight: '1.2' }}>
            مسرح جريمة — Masra7 Garema
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1rem', marginTop: '6px' }}>
            بيئة التحقيق التفاعلية: استكشف الأحراز، استجوب المشتبهين، وفك طلاسم الأظرف الأربعة
          </p>
        </div>

        {/* Upload Action */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".md,.markdown,.txt"
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-primary"
            style={{ padding: '12px 24px' }}
          >
            <span>استيراد قضية جديدة (.md)</span>
            <div className="btn-icon-wrapper">
              <UploadCloud style={{ width: '16px', height: '16px' }} />
            </div>
          </button>
        </div>
      </header>

      {/* Active In-Progress Investigation (Hero Banner) */}
      {activeCase && (
        <section style={{ marginBottom: '40px' }}>
          <DoubleBezelCard
            className="pulse-seal"
            style={{ background: 'linear-gradient(135deg, rgba(225, 29, 72, 0.08) 0%, rgba(15, 23, 42, 0.8) 100%)', borderColor: 'rgba(225, 29, 72, 0.3)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span className="police-stamp stamp-classified" style={{ fontSize: '10px' }}>
                    تحقيق نشط جارٍ الآن
                  </span>
                  <span style={{ color: '#f43f5e', fontSize: '12px', fontWeight: '700' }}>
                    المظروف الحالي: {activeCase.unlockedCount} من 4
                  </span>
                </div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fff' }}>
                  {activeCase.title}
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>
                  {activeCase.category} • مستوى الصعوبة: {activeCase.difficulty}
                </p>
              </div>

              <button
                onClick={() => {
                  sound.playPageTurn();
                  onSelectCase(activeCase);
                }}
                className="btn-primary"
                style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}
              >
                <span>مواصلة التحقيق من المظروف {activeCase.unlockedCount}</span>
                <div className="btn-icon-wrapper">
                  <Play style={{ width: '16px', height: '16px', fill: 'currentColor' }} />
                </div>
              </button>
            </div>
          </DoubleBezelCard>
        </section>
      )}

      {/* Controls & Filter Bar */}
      <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        {/* Search */}
        <div style={{ position: 'relative', minWidth: '320px', flex: '1', maxWidth: '450px' }}>
          <Search style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#64748b' }} />
          <input
            type="text"
            placeholder="ابحث باسم القضية أو التصنيف الجنائي..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 45px 12px 16px',
              borderRadius: '9999px',
              background: 'rgba(21, 24, 34, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#f8fafc',
              fontFamily: 'var(--font-arabic)',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Filter Pills */}
        <div className="floating-island" style={{ display: 'flex', padding: '4px', gap: '6px' }}>
          {[
            { id: 'all', label: 'كافة القضايا' },
            { id: 'in_progress', label: 'قيد التحقيق' },
            { id: 'completed', label: 'محلولة ومغلقة' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                sound.playTypewriter();
                setFilterTab(tab.id);
              }}
              style={{
                border: 'none',
                background: filterTab === tab.id ? '#e11d48' : 'transparent',
                color: filterTab === tab.id ? '#fff' : '#94a3b8',
                padding: '8px 18px',
                borderRadius: '9999px',
                fontFamily: 'var(--font-arabic)',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* Cases Grid */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
        {filteredCases.map((caseItem) => (
          <DoubleBezelCard
            key={caseItem.id}
            onClick={() => {
              sound.playPageTurn();
              onSelectCase(caseItem);
            }}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <span className={`police-stamp ${caseItem.isCompleted ? 'stamp-verified' : caseItem.hasStarted ? 'stamp-confidential' : 'stamp-classified'}`} style={{ fontSize: '10px' }}>
                {caseItem.isCompleted ? 'قضية مغلقة' : caseItem.hasStarted ? `المظروف ${caseItem.unlockedCount} / 4` : 'ملف سري مغلق'}
              </span>

              <div style={{ display: 'flex', gap: '6px' }}>
                {caseItem.hasStarted && (
                  <button
                    onClick={(e) => handleResetCase(caseItem.id, e)}
                    title="إعادة تعيين وبدء التحقيق من جديد"
                    style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#94a3b8', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    <RotateCcw style={{ width: '14px', height: '14px' }} />
                  </button>
                )}
                {caseItem.isCustom && (
                  <button
                    onClick={(e) => handleDeleteCustomCase(caseItem.id, e)}
                    title="حذف القضية المستوردة"
                    style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    <Trash2 style={{ width: '14px', height: '14px' }} />
                  </button>
                )}
              </div>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f8fafc', marginBottom: '8px', lineHeight: '1.3' }}>
              {caseItem.title}
            </h3>

            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {caseItem.category}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.75rem', color: '#64748b', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px', marginBottom: '18px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Clock style={{ width: '13px', height: '13px', color: '#e11d48' }} />
                {caseItem.duration}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Users style={{ width: '13px', height: '13px', color: '#f59e0b' }} />
                {caseItem.suspectsCount}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Layers style={{ width: '13px', height: '13px', color: '#0284c7' }} />
                {caseItem.envelopesCount}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#e2e8f0' }}>
                {caseItem.isCompleted ? 'محلولة ومغلقة بالكامل' : caseItem.hasStarted ? 'استئناف التحقيق ←' : 'فتح ملف القضية ←'}
              </span>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Play style={{ width: '14px', height: '14px', color: '#e11d48', fill: 'currentColor' }} />
              </div>
            </div>
          </DoubleBezelCard>
        ))}
      </section>
    </div>
  );
}

export default Dashboard;
