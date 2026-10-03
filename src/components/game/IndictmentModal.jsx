import React, { useState } from 'react';
import { 
  Gavel, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, 
  X, Award, BookOpen, User, Flame, FileCheck, ArrowRight 
} from 'lucide-react';
import { audioService } from '../../services/audioService';
import confetti from 'canvas-confetti';

export default function IndictmentModal({
  isOpen,
  onClose,
  caseData,
  solutionData,
  onSolvedCase
}) {
  const [selectedKiller, setSelectedKiller] = useState('');
  const [selectedMotive, setSelectedMotive] = useState('');
  const [selectedEvidence, setSelectedEvidence] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeSolutionTab, setActiveSolutionTab] = useState('CONFESSION'); // CONFESSION, MATRIX, HOW_IT_HAPPENED

  if (!isOpen) return null;

  const suspects = caseData?.suspects || [];
  const actualCulprit = caseData?.metadata?.killer || (solutionData && solutionData.culprit) || '';
  const isCorrect = selectedKiller && actualCulprit && selectedKiller.trim().toLowerCase().includes(actualCulprit.trim().toLowerCase()) || actualCulprit.trim().toLowerCase().includes(selectedKiller.trim().toLowerCase());

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedKiller) return;

    setIsSubmitted(true);

    if (isCorrect) {
      audioService.playSuccess();
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#d4af37', '#10b981', '#3b82f6', '#f59e0b']
      });
      if (onSolvedCase) onSolvedCase();
    } else {
      audioService.playContradiction();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.88)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div 
        className="double-bezel modal-body"
        style={{
          background: 'var(--bg-card)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '860px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          border: '2px solid var(--border-gold)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.85)',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div 
          className="flex-between p-20"
          style={{
            background: 'linear-gradient(135deg, #1c140d, #2d1808)',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'rgba(212, 175, 55, 0.15)',
              border: '1px solid var(--gold-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--gold-primary)'
            }}>
              <Gavel size={22} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.35rem', color: 'var(--gold-primary)' }}>
                {isSubmitted ? 'الظرف الرابع: كشف الحقيقة والحل الكامل' : 'لائحة الاتهام الرسمية أمام النيابة العامة'}
              </h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {caseData?.metadata?.title || 'ملف القضية الجنائية'}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              audioService.playClick();
              onClose();
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px'
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {!isSubmitted ? (
            /* Submission Form */
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{
                background: 'rgba(212, 175, 55, 0.06)',
                border: '1px solid var(--gold-dim)',
                padding: '14px 18px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6
              }}>
                أيها المحقق، بناءً على الأحراز التي فحصتها، وتناقضات الاستجواب، والخط الزمني، قدم لائحة اتهامك المسببة تمهيداً لفض الظرف الختامي.
              </div>

              {/* Suspect Picker */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  1. تحديد الجاني / القاتل الرئيسي:
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: '10px'
                }}>
                  {suspects.filter(s => s.type !== 'WITNESS').map((suspect, idx) => {
                    const isSelected = selectedKiller === suspect.name;
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          audioService.playClick();
                          setSelectedKiller(suspect.name);
                        }}
                        style={{
                          padding: '12px',
                          borderRadius: '8px',
                          background: isSelected ? 'rgba(212, 175, 55, 0.15)' : 'var(--bg-main)',
                          border: `1.5px solid ${isSelected ? 'var(--gold-primary)' : 'var(--border-subtle)'}`,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          transition: 'all 0.2s'
                        }}
                      >
                        <User size={18} color={isSelected ? 'var(--gold-primary)' : 'var(--text-muted)'} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.92rem', color: isSelected ? 'var(--gold-primary)' : 'var(--text-primary)' }}>
                            {suspect.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {suspect.role}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Motive Details */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  2. الدافع الحقيقي للجريمة (المالي، الانتقامي، التغطية على فساد):
                </label>
                <input
                  type="text"
                  required
                  className="retro-input"
                  style={{ width: '100%' }}
                  placeholder="حدد الدافع الجنائي بدقة..."
                  value={selectedMotive}
                  onChange={(e) => setSelectedMotive(e.target.value)}
                />
              </div>

              {/* Conclusive Proof */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  3. الدليل القاطع أو الثغرة التي أسقطت حجته الغيابية:
                </label>
                <textarea
                  required
                  rows={3}
                  className="retro-input"
                  style={{ width: '100%' }}
                  placeholder="ما هو الدليل الذي يثبت وجوده أو تنفيذه للجريمة بما لا يدع مجالاً للشك؟"
                  value={selectedEvidence}
                  onChange={(e) => setSelectedEvidence(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="wax-seal-btn"
                disabled={!selectedKiller}
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '14px',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  marginTop: '10px'
                }}
              >
                إصدار قرار الاتهام وفض الظرف الرابع
              </button>
            </form>
          ) : (
            /* Solution Dossier (Envelope 4 Reveal) */
            <div>
              {/* Verdict Header */}
              <div 
                style={{
                  padding: '20px',
                  borderRadius: '12px',
                  background: isCorrect ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                  border: `2px solid ${isCorrect ? '#10b981' : '#ef4444'}`,
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}
              >
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: isCorrect ? '#10b981' : '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  flexShrink: 0
                }}>
                  {isCorrect ? <CheckCircle2 size={32} /> : <AlertTriangle size={32} />}
                </div>

                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '1.3rem', color: isCorrect ? '#10b981' : '#ef4444' }}>
                    {isCorrect ? 'استنتاج جنائي بارع! تم كشف الجاني الحقيقي!' : 'اتهام غير دقيق، ولكن الحقيقة تكشفت الآن!'}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    الجاني الحقيقي: <strong style={{ color: 'var(--gold-primary)' }}>{actualCulprit || 'راجع ملف الاعترافات أدناه'}</strong>
                  </p>
                </div>
              </div>

              {/* Solution Navigation Tabs */}
              <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px', marginBottom: '20px' }}>
                {[
                  { id: 'CONFESSION', label: 'اعتراف الجاني وتفاصيل الجريمة' },
                  { id: 'MATRIX', label: 'مصفوفة الاستبعاد الجنائي' },
                  { id: 'RECONSTRUCTION', label: 'إعادة بناء مسرح الجريمة' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      audioService.playClick();
                      setActiveSolutionTab(tab.id);
                    }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: activeSolutionTab === tab.id ? 'var(--gold-primary)' : 'var(--bg-elevated)',
                      color: activeSolutionTab === tab.id ? '#0d1117' : 'var(--text-secondary)',
                      border: 'none'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Contents */}
              {activeSolutionTab === 'CONFESSION' && (
                <div style={{
                  background: 'var(--bg-main)',
                  padding: '20px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                  lineHeight: 1.8,
                  fontSize: '0.94rem',
                  whiteSpace: 'pre-wrap'
                }}>
                  {solutionData?.confession || 
                   caseData?.envelopes?.find(e => e.number === 4)?.rawContent || 
                   'تفريغ اعتراف الجاني الكامل: "نعم... لم يكن هناك مفر، لقد كان يهددني بكشف التلاعب المالي، وكان لا بد من التخلص منه قبل توقيع عقد الاندماج..."'}
                </div>
              )}

              {activeSolutionTab === 'MATRIX' && (
                <div>
                  <h4 style={{ margin: '0 0 12px', color: 'var(--gold-primary)' }}>
                    مصفوفة تفنيد ادعاءات جميع المشتبه بهم:
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {(caseData?.deductionMatrix || []).map((row, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: 'var(--bg-main)',
                          padding: '14px',
                          borderRadius: '8px',
                          borderRight: `4px solid ${row.status === 'GUILTY' ? '#ef4444' : '#10b981'}`
                        }}
                      >
                        <div className="flex-between mb-4">
                          <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                            {row.suspect}
                          </strong>
                          <span style={{
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: row.status === 'GUILTY' ? '#ef444422' : '#10b98122',
                            color: row.status === 'GUILTY' ? '#ef4444' : '#10b981'
                          }}>
                            {row.status === 'GUILTY' ? 'المدان الحقيقي' : 'مستبعد رسمياً'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          <strong>سبب الاستبعاد / الإدانة:</strong> {row.reason || row.alibiFalsification || 'تم التحقق من أدلته الجنائية.'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSolutionTab === 'RECONSTRUCTION' && (
                <div style={{
                  background: 'var(--bg-main)',
                  padding: '20px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                  lineHeight: 1.8,
                  fontSize: '0.94rem'
                }}>
                  <p>
                    <strong>التوقيت الدقيق:</strong> تم ارتكاب الجريمة في الفترة الزمنية الحرجة بعد تعطيل الكاميرات أو استغلال الثغرة الزمنية في الدخول.
                  </p>
                  <p>
                    <strong>الأداة الجنائية:</strong> تم إخفاء السلاح / المادة السامة بطريقة محكمة لتضليل الطب الشرعي وإلصاق التهمة بالطرف الأضعف.
                  </p>
                  <p>
                    <strong>الخلاصة القضائية:</strong> تم إغلاق القضية رسمياً وإحالة الجاني إلى محكمة الجنايات مع كامل الأحراز الثبوتية.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div 
          className="flex-between p-16"
          style={{
            background: 'var(--bg-elevated)',
            borderTop: '1px solid var(--border-subtle)'
          }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            محكمة الجنايات - ملف القضية مقيد برقم رسمي
          </span>
          <button
            className="action-btn"
            onClick={() => {
              audioService.playClick();
              onClose();
            }}
            style={{
              padding: '8px 20px',
              borderRadius: '6px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
