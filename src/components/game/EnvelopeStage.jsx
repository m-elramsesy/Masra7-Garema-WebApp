import React, { useState } from 'react';
import { 
  Folder, CheckSquare, Square, FileText, ChevronRight, 
  Lock, Unlock, Award, ArrowLeft, Eye, AlertOctagon, HelpCircle 
} from 'lucide-react';
import WaxSealButton from '../common/WaxSealButton';
import { audioService } from '../../services/audioService';
import confetti from 'canvas-confetti';

export default function EnvelopeStage({
  envelope,
  unlockedEnvelopes = [1],
  onUnlockNextEnvelope,
  onOpenDocument,
  envelopeGoals = {},
  onToggleGoal,
  onOpenIndictment
}) {
  if (!envelope) return null;

  const currentGoals = envelopeGoals[envelope.number] || [];
  const completedGoalsCount = currentGoals.filter(g => g.completed).length;
  const isAllGoalsCompleted = currentGoals.length > 0 && completedGoalsCount === currentGoals.length;
  const nextEnvelopeNum = envelope.number + 1;
  const isNextUnlocked = unlockedEnvelopes.includes(nextEnvelopeNum);

  const handleUnsealNext = () => {
    audioService.playWaxSeal();
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#d4af37', '#b91c1c', '#ffffff']
    });
    if (onUnlockNextEnvelope) {
      onUnlockNextEnvelope(nextEnvelopeNum);
    }
  };

  return (
    <div className="envelope-stage">
      {/* Top Banner / Envelope Header */}
      <div 
        className="envelope-hero double-bezel mb-24"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 24, 18, 0.95), rgba(15, 12, 10, 0.98))',
          borderRadius: '14px',
          padding: '24px 28px',
          borderRight: `6px solid ${envelope.number === 4 ? '#ef4444' : 'var(--gold-primary)'}`,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div className="flex-between">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="manila-stamp" style={{ fontSize: '0.82rem', padding: '4px 12px' }}>
                الظرف الجنائي رقم {envelope.number}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--gold-dim)', fontWeight: 600 }}>
                {envelope.title}
              </span>
            </div>

            <h1 className="title-gold" style={{ fontSize: '1.8rem', margin: '4px 0 8px' }}>
              {envelope.name || envelope.title}
            </h1>

            <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-secondary)', maxWidth: '720px', lineHeight: 1.5 }}>
              {envelope.description || 'افحص المحتويات الجنائية، استعرض تقارير الخبراء، وحقق أهداف الظرف لتتمكن من فك ختم الظرف التالي'}
            </p>
          </div>

          {/* Quick status badge */}
          <div style={{ textAlign: 'center', minWidth: '140px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--bg-elevated)',
              border: '2px solid var(--gold-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 8px',
              color: 'var(--gold-primary)'
            }}>
              <Folder size={28} />
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {envelope.sections?.length || 0} وثائق وأحراز
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Left/Main is Documents, Right is Goals/Progress HUD */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 340px',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* Documents & Exhibits Column */}
        <div>
          <div className="flex-between mb-16">
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="var(--gold-primary)" />
              الأوراق والمستندات المتاحة في هذا الظرف
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              اضغط على أي وثيقة لقراءتها بملء الشاشة
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {envelope.sections && envelope.sections.length > 0 ? (
              envelope.sections.map((sec, idx) => {
                const titleClean = sec.title.replace(/^[#\s]+/, '');
                const preview = sec.content.slice(0, 180).replace(/[#*`_]/g, '') + '...';

                return (
                  <div
                    key={idx}
                    className="double-bezel"
                    onClick={() => {
                      audioService.playClick();
                      if (onOpenDocument) onOpenDocument(sec);
                    }}
                    style={{
                      background: 'var(--bg-card)',
                      borderRadius: '10px',
                      padding: '18px 20px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div className="flex-between">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          fontFamily: 'monospace',
                          fontSize: '0.78rem',
                          background: 'var(--bg-elevated)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          color: 'var(--gold-primary)',
                          border: '1px solid var(--border-subtle)'
                        }}>
                          حرز #{idx + 1}
                        </span>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                          {titleClean}
                        </h4>
                      </div>

                      <button
                        className="action-btn"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: 'var(--bg-elevated)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.8rem',
                          color: 'var(--gold-primary)'
                        }}
                      >
                        <Eye size={14} />
                        قراءة الحرز
                      </button>
                    </div>

                    <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {preview}
                    </p>
                  </div>
                );
              })
            ) : (
              <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                background: 'var(--bg-card)',
                borderRadius: '10px',
                color: 'var(--text-muted)'
              }}>
                لا توجد وثائق منفصلة، المحتوى مدون في التقرير الشامل.
              </div>
            )}
          </div>
        </div>

        {/* Envelope Objectives / Goals Validation Panel */}
        <div 
          className="double-bezel"
          style={{
            background: 'var(--bg-card)',
            borderRadius: '12px',
            padding: '20px',
            position: 'sticky',
            top: '20px',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <div className="flex-between mb-16 pb-12" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--gold-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} />
              أهداف التحقيق للمرحلة
            </h3>
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '10px',
              background: isAllGoalsCompleted ? '#10b98122' : 'var(--bg-elevated)',
              color: isAllGoalsCompleted ? '#10b981' : 'var(--text-muted)',
              border: `1px solid ${isAllGoalsCompleted ? '#10b981' : 'var(--border-subtle)'}`
            }}>
              {completedGoalsCount} من {currentGoals.length} مكتمل
            </span>
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
            حدد الاستنتاجات التي توصلت إليها بعد فحص الأدلة واستجواب المشتبه بهم لفك الختم التالي:
          </p>

          {/* Goal check items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {currentGoals.map(goal => (
              <div
                key={goal.id}
                onClick={() => {
                  audioService.playClick();
                  if (onToggleGoal) onToggleGoal(envelope.number, goal.id);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: goal.completed ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-main)',
                  border: `1px solid ${goal.completed ? '#10b98155' : 'var(--border-subtle)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ marginTop: '2px', color: goal.completed ? '#10b981' : 'var(--text-muted)' }}>
                  {goal.completed ? <CheckSquare size={18} /> : <Square size={18} />}
                </div>
                <div style={{ fontSize: '0.86rem', color: goal.completed ? 'var(--text-primary)' : 'var(--text-secondary)', lineHeight: 1.4, textDecoration: goal.completed ? 'line-through' : 'none' }}>
                  {goal.text}
                </div>
              </div>
            ))}
          </div>

          {/* Next Envelope Unseal Action */}
          {envelope.number < 4 ? (
            <div>
              {isNextUnlocked ? (
                <div style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: '#10b98115',
                  border: '1px solid #10b98144',
                  textAlign: 'center',
                  fontSize: '0.85rem',
                  color: '#10b981'
                }}>
                  تم فض الظرف {nextEnvelopeNum} بنجاح! يمكنك الانتقال إليه من شريط الأظرف بالأعلى.
                </div>
              ) : (
                <WaxSealButton
                  label={`فض وختم الظرف رقم ${nextEnvelopeNum}`}
                  sealed={true}
                  disabled={!isAllGoalsCompleted}
                  onClick={handleUnsealNext}
                  sealColor="#8a1c1c"
                />
              )}

              {!isAllGoalsCompleted && !isNextUnlocked && (
                <span style={{ display: 'block', textAlign: 'center', fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                  * يلزم استيفاء جميع أهداف الظرف لتتمكن من فض الشمع الأحمر
                </span>
              )}
            </div>
          ) : (
            /* Envelope 4 is Final: Indictment & Solution */
            <div>
              <div style={{
                padding: '14px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid #ef444455',
                marginBottom: '14px',
                textAlign: 'center'
              }}>
                <AlertOctagon size={24} color="#ef4444" style={{ margin: '0 auto 6px' }} />
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ef4444' }}>
                  المرحلة الختامية: لائحة الاتهام
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  الظرف الرابع يحتوي على الحل الكامل واعترافات القاتل ومصفوفة الاستبعاد.
                </div>
              </div>

              <button
                className="wax-seal-btn"
                onClick={() => {
                  audioService.playClick();
                  if (onOpenIndictment) onOpenIndictment();
                }}
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '0.92rem',
                  background: 'linear-gradient(135deg, #8a1c1c, #4a0d0d)',
                  color: '#fff',
                  border: '1px solid #ef4444'
                }}
              >
                تقديم لائحة الاتهام وكشف لغز القضية
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
