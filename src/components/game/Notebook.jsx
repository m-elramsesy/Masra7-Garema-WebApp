import React, { useState } from 'react';
import { BookOpen, CheckCircle2, XCircle, AlertTriangle, Lightbulb, Plus, Trash2, Edit3, ShieldAlert } from 'lucide-react';
import { audioService } from '../../services/audioService';

export default function Notebook({ 
  notes = '', 
  onSaveNotes, 
  hypotheses = [], 
  onSaveHypotheses, 
  suspects = [] 
}) {
  const [activeTab, setActiveTab] = useState('HYPOTHESES');
  const [newTitle, setNewTitle] = useState('');
  const [newSuspect, setNewSuspect] = useState('');
  const [newDetails, setNewDetails] = useState('');
  const [showAddHypothesis, setShowAddHypothesis] = useState(false);

  const statusConfigs = {
    INVESTIGATING: { label: 'قيد التمحيص', color: '#f59e0b', icon: Lightbulb },
    SUPPORTED: { label: 'مدعومة بأدلة قوية', color: '#10b981', icon: CheckCircle2 },
    WEAKENED: { label: 'ضعيفة / متناقضة', color: '#ec4899', icon: AlertTriangle },
    REJECTED: { label: 'مفندة ومستبعدة', color: '#ef4444', icon: XCircle },
    CONFIRMED: { label: 'مؤكدة نهائياً', color: 'var(--gold-primary)', icon: CheckCircle2 },
  };

  const handleAddHypothesis = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    audioService.playStamp();
    const newHyp = {
      id: `hyp-${Date.now()}`,
      title: newTitle.trim(),
      suspect: newSuspect.trim(),
      details: newDetails.trim(),
      status: 'INVESTIGATING',
      createdAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };

    onSaveHypotheses([...hypotheses, newHyp]);
    setNewTitle('');
    setNewSuspect('');
    setNewDetails('');
    setShowAddHypothesis(false);
  };

  const handleUpdateStatus = (id, newStatus) => {
    audioService.playClick();
    const updated = hypotheses.map(h => h.id === id ? { ...h, status: newStatus } : h);
    onSaveHypotheses(updated);
  };

  const handleDeleteHypothesis = (id) => {
    audioService.playClick();
    const updated = hypotheses.filter(h => h.id !== id);
    onSaveHypotheses(updated);
  };

  const handleNotesChange = (e) => {
    // Typewriter sound on keypress
    audioService.playTypewriter();
    onSaveNotes(e.target.value);
  };

  return (
    <div className="notebook-container">
      {/* Header and Switcher */}
      <div className="flex-between mb-24">
        <div>
          <h2 className="title-gold" style={{ fontSize: '1.6rem', marginBottom: '6px' }}>
            مذكرة التحريات وبناء الفرضيات
          </h2>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>
            سجل النظريات الجنائية، تتبع خيوط الشبهة، وتدوين الملاحظات الحرة
          </p>
        </div>

        {/* Tab switch */}
        <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-card)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <button
            className={`tab-btn ${activeTab === 'HYPOTHESES' ? 'active' : ''}`}
            onClick={() => {
              audioService.playClick();
              setActiveTab('HYPOTHESES');
            }}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: activeTab === 'HYPOTHESES' ? 'var(--gold-primary)' : 'transparent',
              color: activeTab === 'HYPOTHESES' ? '#0d1117' : 'var(--text-secondary)',
              border: 'none'
            }}
          >
            نظريات وفرضيات القضية ({hypotheses.length})
          </button>

          <button
            className={`tab-btn ${activeTab === 'NOTES' ? 'active' : ''}`}
            onClick={() => {
              audioService.playClick();
              setActiveTab('NOTES');
            }}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: activeTab === 'NOTES' ? 'var(--gold-primary)' : 'transparent',
              color: activeTab === 'NOTES' ? '#0d1117' : 'var(--text-secondary)',
              border: 'none'
            }}
          >
            الملاحظات الحرة (Notepad)
          </button>
        </div>
      </div>

      {activeTab === 'HYPOTHESES' ? (
        <div>
          <div className="flex-between mb-16">
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              صغ فرضياتك حول الدافع والأداة وتواجد المشتبه بهم، واختبر قوتها مع فتح الأظرف
            </span>
            <button
              className="wax-seal-btn"
              style={{ padding: '8px 16px', borderRadius: '8px', gap: '6px' }}
              onClick={() => {
                audioService.playClick();
                setShowAddHypothesis(true);
              }}
            >
              <Plus size={16} />
              بناء فرضية جديدة
            </button>
          </div>

          {/* Hypotheses List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {hypotheses.map(hyp => {
              const config = statusConfigs[hyp.status] || statusConfigs.INVESTIGATING;
              const Icon = config.icon;

              return (
                <div
                  key={hyp.id}
                  className="double-bezel"
                  style={{
                    background: 'var(--bg-card)',
                    borderRadius: '12px',
                    padding: '20px',
                    borderRight: `5px solid ${config.color}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div className="flex-between">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: `${config.color}22`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: config.color
                      }}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                          {hyp.title}
                        </h4>
                        {hyp.suspect && (
                          <span style={{ fontSize: '0.8rem', color: 'var(--gold-dim)', fontWeight: 600 }}>
                            طرف الاتهام: {hyp.suspect}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <select
                        className="retro-select"
                        value={hyp.status}
                        onChange={(e) => handleUpdateStatus(hyp.id, e.target.value)}
                        style={{
                          fontSize: '0.82rem',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          borderColor: `${config.color}88`,
                          color: config.color,
                          fontWeight: 700
                        }}
                      >
                        {Object.entries(statusConfigs).map(([key, val]) => (
                          <option key={key} value={key} style={{ color: 'var(--text-primary)', background: 'var(--bg-elevated)' }}>
                            {val.label}
                          </option>
                        ))}
                      </select>

                      <button
                        title="حذف الفرضية"
                        onClick={() => handleDeleteHypothesis(hyp.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {hyp.details && (
                    <p style={{
                      margin: 0,
                      fontSize: '0.92rem',
                      lineHeight: 1.6,
                      color: 'var(--text-secondary)',
                      background: 'var(--bg-main)',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      {hyp.details}
                    </p>
                  )}
                </div>
              );
            })}

            {hypotheses.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                background: 'var(--bg-card)',
                borderRadius: '12px',
                border: '1px dashed var(--border-subtle)',
                color: 'var(--text-muted)'
              }}>
                <Lightbulb size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
                <h3>لا توجد فرضيات مسجلة حتى الآن</h3>
                <p style={{ fontSize: '0.9rem' }}>ابدأ بصياغة أول نظرية تفسر دوافع الجريمة والأدلة المتوفرة في الظرف 1</p>
              </div>
            )}
          </div>

          {/* Add Hypothesis Modal */}
          {showAddHypothesis && (
            <div style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 999
            }}>
              <form 
                onSubmit={handleAddHypothesis}
                style={{
                  background: 'var(--bg-card)',
                  padding: '24px',
                  borderRadius: '14px',
                  border: '1px solid var(--border-subtle)',
                  width: '90%',
                  maxWidth: '480px'
                }}
              >
                <h3 style={{ margin: '0 0 16px', color: 'var(--gold-primary)' }}>صياغة نظرية جنائية جديدة</h3>
                
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    عنوان الفرضية (مثال: دافع الابتزاز المالي، تعطيل المصعد عمداً):
                  </label>
                  <input
                    type="text"
                    required
                    className="retro-input"
                    style={{ width: '100%' }}
                    placeholder="عنوان النظرية..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    المشتبه به المرتبط (اختياري):
                  </label>
                  <select
                    className="retro-select"
                    style={{ width: '100%' }}
                    value={newSuspect}
                    onChange={(e) => setNewSuspect(e.target.value)}
                  >
                    <option value="">-- اختر مشتبه به أو اترك عاماً --</option>
                    {suspects.map((s, idx) => (
                      <option key={idx} value={s.name}>{s.name} ({s.role || 'مشتبه'})</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    الأدلة المدعمة والشرح الاستنتاجي:
                  </label>
                  <textarea
                    rows={4}
                    className="retro-input"
                    style={{ width: '100%' }}
                    placeholder="ما هي القرائن والوثائق التي تدعم هذه النظرية؟"
                    value={newDetails}
                    onChange={(e) => setNewDetails(e.target.value)}
                  />
                </div>

                <div className="flex-between">
                  <button
                    type="button"
                    className="action-btn"
                    style={{ padding: '8px 18px', background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', borderRadius: '6px' }}
                    onClick={() => setShowAddHypothesis(false)}
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="wax-seal-btn"
                    style={{ padding: '8px 20px', borderRadius: '6px' }}
                  >
                    حفظ الفرضية
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      ) : (
        /* Notepad Tab */
        <div className="double-bezel" style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '24px' }}>
          <div className="flex-between mb-12">
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Edit3 size={16} color="var(--gold-primary)" />
              دفتر التحريات السري (يتم الحفظ تلقائياً في المتصفح)
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {notes.length} حرف
            </span>
          </div>

          <textarea
            className="retro-input"
            rows={18}
            style={{
              width: '100%',
              lineHeight: 1.8,
              fontSize: '0.96rem',
              fontFamily: 'Cairo, monospace',
              background: 'var(--bg-main)',
              borderRadius: '8px',
              padding: '16px',
              border: '1px solid var(--border-subtle)'
            }}
            placeholder="دون هنا استنتاجاتك الشخصية، تناقضات أقوال الشهود، تواريخ الأحداث، وأي ملاحظات تسترعي انتباهك أثناء قراءة الأظرف..."
            value={notes}
            onChange={handleNotesChange}
          />
        </div>
      )}
    </div>
  );
}
