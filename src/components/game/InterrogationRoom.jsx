import React, { useState } from 'react';
import { sound } from '../../services/audioService';
import { DoubleBezelCard } from '../common/DoubleBezelCard';
import { 
  User, 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  ShieldAlert, 
  Sparkles,
  Volume2,
  Clock,
  Briefcase
} from 'lucide-react';

export function InterrogationRoom({ 
  suspects = [], 
  interrogations = [], 
  interrogationData,
  witnesses = [], 
  askedQuestions = [], 
  initialTarget,
  onAskQuestion,
  onFlagContradiction 
}) {
  const effectiveInterrogations = Array.isArray(interrogations) && interrogations.length > 0 
    ? interrogations 
    : (Array.isArray(interrogationData) ? interrogationData : []);

  // Combine suspects with interrogation data
  const combinedRoster = suspects.map((s, sIdx) => {
    const interrogData = effectiveInterrogations.find(i => 
      (i.suspectName && (i.suspectName.includes(s.name) || s.name.includes(i.suspectName))) ||
      (i.name && (i.name.includes(s.name) || s.name.includes(i.name)))
    );

    let questions = [];
    if (interrogData && Array.isArray(interrogData.questions) && interrogData.questions.length > 0) {
      questions = interrogData.questions;
    } else if (Array.isArray(s.initialQA) && s.initialQA.length > 0) {
      questions = s.initialQA.map((qa, idx) => ({
        id: `${s.id || sIdx}-init-${idx}`,
        question: qa.question,
        answer: qa.answer,
        contradiction: qa.contradiction || false
      }));
    } else {
      // Default investigation questions tailored to suspect alibi and role
      questions = [
        {
          id: `${s.id || sIdx}-q1`,
          question: `أين كنت بالتحديد أثناء توقيت وقوع الجريمة المقدر؟`,
          answer: s.alibi 
            ? `كما ذكرت في المحضر، ${s.alibi}` 
            : `كنت في موقعي المعتاد ولم أتواجد بالقرب من مسرح الحادث في تلك اللحظة.`,
          contradiction: false
        },
        {
          id: `${s.id || sIdx}-q2`,
          question: `ما طبيعة علاقتك أو تعاملاتك الأخيرة مع المجني عليه؟`,
          answer: s.motive 
            ? `العلاقة كانت مهنية، ولكن هناك من يحاول تضخيم الخلافات؛ ${s.motive}` 
            : `علاقة اعتيادية ولم تكن هناك أي ضغينة تدعو لما حدث.`,
          contradiction: false
        },
        {
          id: `${s.id || sIdx}-q3`,
          question: `هل رأيت أو لاحظت أي تحركات مريبة أو أشخاص غير مصرح لهم؟`,
          answer: `لاحظت ارتباكاً عاماً قبل الحادث، وهناك من كان يتنقل في الممرات متفادياً الكاميرات.`,
          contradiction: true,
          contradictionReason: 'مخالفة لتقرير تفريغ كاميرات المراقبة وسجلات الأبواب الإلكترونية'
        }
      ];
    }

    return {
      ...s,
      isWitness: s.type === 'WITNESS',
      questions
    };
  });

  // Add witnesses as interrogatable parties
  const witnessRoster = (witnesses || []).map((w, idx) => ({
    id: `witness-${idx + 1}`,
    name: w.name,
    role: 'شاهد إثبات مستقل',
    bio: 'أدلى بأقوال رسمية تحت القسم',
    relation: 'شاهد في محيط الحادث',
    isWitness: true,
    questions: (w.questions || []).map((q, qIdx) => ({
      id: `w-${idx}-${qIdx}`,
      question: q.question,
      answer: q.answer,
      contradiction: q.contradiction || false
    }))
  }));

  const fullRoster = [...combinedRoster, ...witnessRoster];
  
  const getInitialPersonId = () => {
    if (initialTarget) {
      const match = fullRoster.find(p => p.id === initialTarget.id || p.name === initialTarget.name);
      if (match) return match.id;
    }
    return fullRoster[0]?.id || null;
  };

  const [selectedPersonId, setSelectedPersonId] = useState(getInitialPersonId);
  const [currentResponse, setCurrentResponse] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  const selectedPerson = fullRoster.find(p => p.id === selectedPersonId) || fullRoster[0];

  const handleSelectQuestion = (q) => {
    if (isTyping) return;
    setIsTyping(true);
    sound.playTypewriter();
    if (onAskQuestion) onAskQuestion(q.id);

    // Simulate typewriter response
    setCurrentResponse({ ...q, text: '' });
    let charIdx = 0;
    const fullAnswer = q.answer;
    const interval = setInterval(() => {
      charIdx += 3;
      if (charIdx >= fullAnswer.length) {
        clearInterval(interval);
        setCurrentResponse({ ...q, text: fullAnswer });
        setIsTyping(false);

        // Contradiction trigger
        if (q.contradiction) {
          sound.playContradiction();
          if (onFlagContradiction) onFlagContradiction(q.id);
        } else {
          sound.playSuccess();
        }
      } else {
        setCurrentResponse({ ...q, text: fullAnswer.slice(0, charIdx) });
        if (Math.random() > 0.4) sound.playTypewriter();
      }
    }, 25);
  };

  if (!selectedPerson) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
        لا توجد محاضر استجواب مسجلة لهذه المرحلة.
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', minHeight: '650px' }}>
      {/* Left Pane: Suspect & Witness Selector */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#cbd5e1' }}>
            قائمة المستجوبين والشهود
          </span>
          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#f43f5e' }}>
            {fullRoster.length} أطراف
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '580px', paddingRight: '4px' }}>
          {fullRoster.map(person => {
            const isSelected = person.id === selectedPerson.id;
            const askedCount = person.questions.filter(q => askedQuestions.includes(q.id)).length;
            const totalCount = person.questions.length;
            const isComplete = totalCount > 0 && askedCount === totalCount;

            return (
              <button
                key={person.id}
                onClick={() => {
                  sound.playPageTurn();
                  setSelectedPersonId(person.id);
                  setCurrentResponse(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: isSelected ? '1px solid #e11d48' : '1px solid rgba(255,255,255,0.06)',
                  background: isSelected ? 'rgba(225, 29, 72, 0.12)' : 'rgba(21, 24, 34, 0.6)',
                  color: '#f8fafc',
                  textAlign: 'right',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: isSelected ? '0 4px 15px rgba(225, 29, 72, 0.2)' : 'none'
                }}
              >
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: isSelected ? '#e11d48' : person.isWitness ? '#0284c7' : '#334155',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <User style={{ width: '18px', height: '18px', color: '#fff' }} />
                </div>

                <div style={{ flex: '1', minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '800', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {person.name}
                    </h4>
                    {isComplete && <CheckCircle2 style={{ width: '14px', height: '14px', color: '#10b981' }} />}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {person.role}
                  </p>
                </div>

                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', padding: '2px 6px', borderRadius: '4px', background: 'rgba(0,0,0,0.3)', color: isComplete ? '#10b981' : '#94a3b8' }}>
                  {askedCount}/{totalCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Pane: Active Interrogation Desk */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Suspect Header Card */}
        <DoubleBezelCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className={`police-stamp ${selectedPerson.isWitness ? 'stamp-verified' : 'stamp-classified'}`} style={{ fontSize: '10px' }}>
                  {selectedPerson.isWitness ? 'شاهد رسمي تحت القسم' : 'مشتبه به في الجناية'}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: '700' }}>
                  {selectedPerson.relation}
                </span>
              </div>

              <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#f8fafc' }}>
                {selectedPerson.name}
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '2px' }}>
                {selectedPerson.bio}
              </p>
            </div>

            {selectedPerson.alibi && (
              <div style={{ background: 'rgba(0,0,0,0.4)', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', maxWidth: '280px' }}>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '800', display: 'block' }}>
                  حجة الغياب المدعاة:
                </span>
                <p style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '2px' }}>
                  {selectedPerson.alibi}
                </p>
              </div>
            )}
          </div>
        </DoubleBezelCard>

        {/* Question Selector Menu */}
        <div>
          <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#cbd5e1', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <HelpCircle style={{ width: '15px', height: '15px', color: '#e11d48' }} />
            <span>اختر السؤال لتوجيهه إلى {selectedPerson.name}:</span>
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
            {selectedPerson.questions.map((q, idx) => {
              const hasBeenAsked = askedQuestions.includes(q.id);
              const isSelected = currentResponse?.id === q.id;

              return (
                <button
                  key={q.id}
                  disabled={isTyping}
                  onClick={() => handleSelectQuestion(q)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: isSelected ? '1px solid #e11d48' : hasBeenAsked ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255,255,255,0.08)',
                    background: isSelected ? 'rgba(225, 29, 72, 0.15)' : hasBeenAsked ? 'rgba(16, 185, 129, 0.05)' : 'rgba(21, 24, 34, 0.8)',
                    color: '#f8fafc',
                    textAlign: 'right',
                    cursor: isTyping ? 'wait' : 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: hasBeenAsked ? '#10b981' : '#f59e0b', fontWeight: '700' }}>
                    <span>سؤال استجواب ({idx + 1})</span>
                    {hasBeenAsked && <span style={{ fontSize: '10px' }}>تم سؤاله ✓</span>}
                  </div>
                  <p style={{ fontSize: '0.85rem', fontWeight: '700', lineHeight: '1.4' }}>
                    {q.question}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Interrogation Transcript & Response Terminal */}
        <div style={{
          flex: '1',
          background: 'rgba(13, 15, 21, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          minHeight: '220px',
          position: 'relative'
        }}>
          {currentResponse ? (
            <div>
              {/* Question Banner */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                <span style={{ fontWeight: '800', color: '#e11d48' }}>المحقق:</span>
                <span>{currentResponse.question}</span>
              </div>

              {/* Contradiction Alert */}
              {currentResponse.contradiction && !isTyping && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '14px',
                  animation: 'sealPulse 2s infinite'
                }}>
                  <AlertTriangle style={{ width: '18px', height: '18px', color: '#ef4444' }} />
                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#fca5a5' }}>
                      تنبيه جنائي: تم رصد تناقض أو ارتباك في الأقوال!
                    </span>
                    <p style={{ fontSize: '0.75rem', color: '#fecaca' }}>
                      أقوال المستجوب تتعارض مع الأدلة المادية وسجلات المظاريف! تم تسجيل التناقض في ملف القضية.
                    </p>
                  </div>
                </div>
              )}

              {/* Suspect's Spoken Statement */}
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#e11d48',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <User style={{ width: '16px', height: '16px', color: '#fff' }} />
                </div>
                <div style={{ flex: '1' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#fda4af', display: 'block', marginBottom: '4px' }}>
                    {selectedPerson.name}:
                  </span>
                  <p style={{
                    fontSize: '1.05rem',
                    lineHeight: '1.8',
                    color: '#f8fafc',
                    fontFamily: 'var(--font-arabic)',
                    fontStyle: 'italic',
                    whiteSpace: 'pre-wrap'
                  }}>
                    "{currentResponse.text}"
                    {isTyping && <span style={{ display: 'inline-block', width: '6px', height: '16px', background: '#e11d48', marginRight: '4px', verticalAlign: 'middle', animation: 'blink 0.7s infinite' }} />}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#64748b' }}>
              <MessageSquare style={{ width: '36px', height: '36px', margin: '0 auto 10px', opacity: 0.4 }} />
              <p style={{ fontSize: '0.95rem', fontWeight: '700' }}>
                غرفة الاستجواب جاهزة
              </p>
              <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                اختر سؤالاً من القائمة أعلاه لبدء استجواب {selectedPerson.name} وسماع أقواله الحرفية
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InterrogationRoom;
