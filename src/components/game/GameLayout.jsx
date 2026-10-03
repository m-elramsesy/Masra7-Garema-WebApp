import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, Volume2, VolumeX, Folder, MessageSquare, Users, 
  Pin, Clock, BookOpen, Gavel, FileText, CheckCircle, Lock 
} from 'lucide-react';
import EnvelopeStage from './EnvelopeStage';
import InterrogationRoom from './InterrogationRoom';
import SuspectsBoard from './SuspectsBoard';
import EvidenceBoard from './EvidenceBoard';
import TimelineView from './TimelineView';
import Notebook from './Notebook';
import DocumentViewer from './DocumentViewer';
import IndictmentModal from './IndictmentModal';
import { audioService } from '../../services/audioService';
import { storageService } from '../../services/storageService';

export default function GameLayout({ caseData, onBackToDashboard }) {
  const caseId = caseData?.metadata?.id || 'active-case';

  // Load existing state or defaults
  const [gameState, setGameState] = useState(() => storageService.getCaseState(caseId));
  const [activeEnvelopeNum, setActiveEnvelopeNum] = useState(1);
  const [currentView, setCurrentView] = useState('ENVELOPE'); // ENVELOPE, INTERROGATION, SUSPECTS, CORKBOARD, TIMELINE, NOTEBOOK
  const [selectedInterrogationTarget, setSelectedInterrogationTarget] = useState(null);
  const [activeDocument, setActiveDocument] = useState(null);
  const [showIndictmentModal, setShowIndictmentModal] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Sync state changes to storage
  const updateGameState = (updater) => {
    setGameState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      storageService.saveCaseState(caseId, next);
      return next;
    });
  };

  const unlockedEnvelopes = gameState?.unlockedEnvelopes || [1];

  // Auto-generate envelope goals if none exist yet
  useEffect(() => {
    if (!gameState.envelopeGoals || Object.keys(gameState.envelopeGoals).length === 0) {
      const initialGoals = {
        1: [
          { id: 'env1-g1', text: 'فحص التقرير المبدئي للطب الشرعي وتحديد سبب الوفاة التقريبي', completed: false },
          { id: 'env1-g2', text: 'استجواب الطرف الأول الذي أبلغ عن الجثة ومطابقة روايته', completed: false },
          { id: 'env1-g3', text: 'تحديد المشتبه بهم الأساسيين وبناء أول فرضية جنائية', completed: false },
        ],
        2: [
          { id: 'env2-g1', text: 'فحص التقرير التكميلي للمختبر الجنائي والتحاليل الدقيقة', completed: false },
          { id: 'env2-g2', text: 'اكتشاف تناقض جوهري في أقوال أحد المشتبه بهم أو شهود الإثبات', completed: false },
          { id: 'env2-g3', text: 'تضييق دائرة الاتهام واستبعاد من ثبتت حجته الغيابية بالأدلة الرقمية', completed: false },
        ],
        3: [
          { id: 'env3-g1', text: 'كشف السلاح/الأداة القاتلة أو كيفية إدخالها لمسرح الجريمة', completed: false },
          { id: 'env3-g2', text: 'مطابقة الخط الزمني بدقة وتحديد النافذة الزمنية القاطعة للجاني', completed: false },
          { id: 'env3-g3', text: 'إثبات الدافع الحقيقي (المالي، الشخصي، أو التستري)', completed: false },
        ],
        4: [
          { id: 'env4-g1', text: 'تقديم قرار الاتهام النهائي وإدانة الجاني بالدليل القاطع', completed: false },
        ]
      };
      updateGameState({ envelopeGoals: initialGoals });
    }
  }, [caseId]);

  // Handle Envelope Switch
  const handleSelectEnvelope = (num) => {
    if (!unlockedEnvelopes.includes(num)) {
      audioService.playContradiction();
      return;
    }
    audioService.playClick();
    setActiveEnvelopeNum(num);
    setCurrentView('ENVELOPE');
  };

  // Handle Unlocking Next Envelope
  const handleUnlockNextEnvelope = (num) => {
    updateGameState(prev => ({
      ...prev,
      unlockedEnvelopes: [...new Set([...(prev.unlockedEnvelopes || [1]), num])]
    }));
    setActiveEnvelopeNum(num);
  };

  // Handle Goal Toggle
  const handleToggleGoal = (envelopeNum, goalId) => {
    updateGameState(prev => {
      const current = prev.envelopeGoals || {};
      const goals = current[envelopeNum] || [];
      const updated = goals.map(g => g.id === goalId ? { ...g, completed: !g.completed } : g);
      return {
        ...prev,
        envelopeGoals: {
          ...current,
          [envelopeNum]: updated
        }
      };
    });
  };

  // Handle Suspect Status Update
  const handleUpdateSuspectStatus = (name, status) => {
    updateGameState(prev => ({
      ...prev,
      suspects: {
        ...(prev.suspects || {}),
        [name]: {
          ...(prev.suspects?.[name] || {}),
          status
        }
      }
    }));
  };

  // Handle Corkboard Update
  const handleSaveCorkboard = (corkboardData) => {
    updateGameState({ corkboard: corkboardData });
  };

  // Handle Hypotheses Update
  const handleSaveHypotheses = (hypotheses) => {
    updateGameState({ hypotheses });
  };

  // Handle Notepad Update
  const handleSaveNotes = (notes) => {
    updateGameState({ notes });
  };

  // Direct switch to interrogation from suspect card
  const handleStartInterrogationFromSuspect = (suspect) => {
    setSelectedInterrogationTarget(suspect);
    setCurrentView('INTERROGATION');
  };

  const activeEnvelope = (caseData.envelopes || []).find(e => e.number === activeEnvelopeNum) || caseData.envelopes?.[0];

  return (
    <div className="game-layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Detective Command Header */}
      <header 
        style={{
          background: 'rgba(18, 14, 12, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '12px 24px',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        <div className="flex-between">
          {/* Back button & Case Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => {
                audioService.playClick();
                onBackToDashboard();
              }}
              className="action-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '8px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                fontSize: '0.85rem'
              }}
            >
              <ArrowRight size={16} />
              العودة للمقر العام
            </button>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="manila-stamp" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                  {caseData.metadata?.code || 'ملف سري للغاية'}
                </span>
                <h2 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--gold-primary)', fontWeight: 700 }}>
                  {caseData.metadata?.title || 'تحقيق جنائي قيد المعاينة'}
                </h2>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                الضحية: {caseData.metadata?.victim || 'غير محدد'} | الموقع: {caseData.metadata?.location || 'غير محدد'}
              </span>
            </div>
          </div>

          {/* Right Header: Sound toggle & Indictment shortcut */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              title={isMuted ? 'تشغيل المؤثرات الصوتية' : 'كتم المؤثرات الصوتية'}
              onClick={() => {
                const muted = audioService.toggleMute();
                setIsMuted(muted);
              }}
              style={{
                padding: '8px',
                borderRadius: '8px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                color: isMuted ? 'var(--text-muted)' : 'var(--gold-primary)',
                cursor: 'pointer'
              }}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>

            <button
              className="wax-seal-btn"
              onClick={() => {
                audioService.playClick();
                setShowIndictmentModal(true);
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.84rem',
                gap: '8px',
                background: 'linear-gradient(135deg, #8a1c1c, #4a0d0d)',
                border: '1px solid #ef4444'
              }}
            >
              <Gavel size={16} />
              لائحة الاتهام
            </button>
          </div>
        </div>

        {/* Envelope Tabs Row */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '14px', overflowX: 'auto', paddingBottom: '4px' }}>
          {[1, 2, 3, 4].map(num => {
            const isUnlocked = unlockedEnvelopes.includes(num);
            const isActive = activeEnvelopeNum === num && currentView === 'ENVELOPE';

            return (
              <button
                key={num}
                onClick={() => handleSelectEnvelope(num)}
                disabled={!isUnlocked}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 18px',
                  borderRadius: '8px',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  cursor: isUnlocked ? 'pointer' : 'not-allowed',
                  opacity: isUnlocked ? 1 : 0.45,
                  background: isActive 
                    ? 'var(--gold-primary)' 
                    : (isUnlocked ? 'var(--bg-card)' : 'var(--bg-elevated)'),
                  color: isActive ? '#0d1117' : (isUnlocked ? 'var(--text-primary)' : 'var(--text-muted)'),
                  border: `1px solid ${isActive ? 'var(--gold-primary)' : 'var(--border-subtle)'}`,
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
              >
                {isUnlocked ? <Folder size={16} /> : <Lock size={16} />}
                <span>الظرف {num}: {num === 1 ? 'المعاينة الأولية' : num === 2 ? 'المختبر الجنائي' : num === 3 ? 'إسقاط الحجج' : 'الحل الكامل'}</span>
                {isUnlocked && <CheckCircle size={14} color={isActive ? '#0d1117' : '#10b981'} />}
              </button>
            );
          })}
        </div>
      </header>

      {/* Floating Island Sub-View Switcher */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '16px 20px 0'
      }}>
        <div 
          className="double-bezel"
          style={{
            display: 'flex',
            gap: '6px',
            background: 'rgba(26, 21, 18, 0.9)',
            backdropFilter: 'blur(12px)',
            padding: '6px',
            borderRadius: '30px',
            border: '1px solid var(--border-subtle)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
            overflowX: 'auto',
            maxWidth: '100%'
          }}
        >
          {[
            { id: 'ENVELOPE', label: 'الظرف الحالي', icon: Folder },
            { id: 'INTERROGATION', label: 'غرفة الاستجواب', icon: MessageSquare },
            { id: 'SUSPECTS', label: 'المشتبه بهم', icon: Users },
            { id: 'CORKBOARD', label: 'لوحة الأدلة', icon: Pin },
            { id: 'TIMELINE', label: 'الخط الزمني', icon: Clock },
            { id: 'NOTEBOOK', label: 'المفكرة والفرضيات', icon: BookOpen },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = currentView === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  audioService.playClick();
                  setCurrentView(tab.id);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 18px',
                  borderRadius: '24px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  background: isActive ? 'var(--gold-primary)' : 'transparent',
                  color: isActive ? '#0d1117' : 'var(--text-secondary)',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Viewport Content */}
      <main style={{ flex: 1, padding: '24px 32px 60px', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
        {currentView === 'ENVELOPE' && (
          <EnvelopeStage
            envelope={activeEnvelope}
            unlockedEnvelopes={unlockedEnvelopes}
            onUnlockNextEnvelope={handleUnlockNextEnvelope}
            onOpenDocument={(doc) => setActiveDocument(doc)}
            envelopeGoals={gameState.envelopeGoals || {}}
            onToggleGoal={handleToggleGoal}
            onOpenIndictment={() => setShowIndictmentModal(true)}
          />
        )}

        {currentView === 'INTERROGATION' && (
          <InterrogationRoom
            suspects={caseData.suspects || []}
            witnesses={caseData.witnesses || []}
            initialTarget={selectedInterrogationTarget}
            interrogationData={caseData.interrogations || []}
            askedQuestions={gameState.askedQuestions || []}
            onAskQuestion={(qId) => {
              updateGameState(prev => ({
                ...prev,
                askedQuestions: [...new Set([...(prev.askedQuestions || []), qId])]
              }));
            }}
            onFlagContradiction={(qId) => {
              updateGameState(prev => ({
                ...prev,
                flaggedContradictions: [...new Set([...(prev.flaggedContradictions || []), qId])]
              }));
            }}
          />
        )}

        {currentView === 'SUSPECTS' && (
          <SuspectsBoard
            suspects={caseData.suspects || []}
            suspectStates={gameState.suspects || {}}
            onUpdateStatus={handleUpdateSuspectStatus}
            onInterrogate={handleStartInterrogationFromSuspect}
          />
        )}

        {currentView === 'CORKBOARD' && (
          <EvidenceBoard
            caseData={caseData}
            corkboardState={gameState.corkboard || {}}
            onSaveCorkboard={handleSaveCorkboard}
          />
        )}

        {currentView === 'TIMELINE' && (
          <TimelineView
            timeline={caseData.timeline || []}
            suspects={caseData.suspects || []}
          />
        )}

        {currentView === 'NOTEBOOK' && (
          <Notebook
            notes={gameState.notes || ''}
            onSaveNotes={handleSaveNotes}
            hypotheses={gameState.hypotheses || []}
            onSaveHypotheses={handleSaveHypotheses}
            suspects={caseData.suspects || []}
          />
        )}
      </main>

      {/* Full-Screen Document Viewer Modal */}
      <DocumentViewer
        document={activeDocument}
        onClose={() => setActiveDocument(null)}
      />

      {/* Indictment & Solution Modal */}
      <IndictmentModal
        isOpen={showIndictmentModal}
        onClose={() => setShowIndictmentModal(false)}
        caseData={caseData}
        solutionData={caseData.solution}
        onSolvedCase={() => {
          updateGameState({ solved: true });
        }}
      />
    </div>
  );
}
