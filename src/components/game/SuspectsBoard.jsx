import React, { useState } from 'react';
import { User, ShieldAlert, CheckCircle, HelpCircle, MessageSquare, Search, FileText } from 'lucide-react';
import { audioService } from '../../services/audioService';

export default function SuspectsBoard({ suspects = [], suspectStates = {}, onUpdateStatus, onInterrogate, onSelectSuspect }) {
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const statusOptions = [
    { value: 'UNDER_INVESTIGATION', label: 'قيد التحري', color: '#f59e0b' },
    { value: 'PRIME_SUSPECT', label: 'مشتبه رئيسي', color: '#ef4444' },
    { value: 'EXONERATED', label: 'استبعاد رسمي', color: '#10b981' },
    { value: 'NEUTRAL', label: 'شاهد / غير مصنف', color: '#6b7280' },
  ];

  const filteredSuspects = suspects.filter(s => {
    const state = suspectStates[s.name] || {};
    const status = state.status || (s.type === 'WITNESS' ? 'NEUTRAL' : 'UNDER_INVESTIGATION');
    
    if (filter === 'PRIME' && status !== 'PRIME_SUSPECT') return false;
    if (filter === 'EXONERATED' && status !== 'EXONERATED') return false;
    if (filter === 'SUSPECTS' && s.type === 'WITNESS') return false;
    if (filter === 'WITNESSES' && s.type !== 'WITNESS') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchRole = (s.role || '').toLowerCase().includes(q);
      const matchMotive = (s.motive || '').toLowerCase().includes(q);
      if (!matchName && !matchRole && !matchMotive) return false;
    }

    return true;
  });

  return (
    <div className="suspects-board">
      <div className="board-header flex-between mb-24">
        <div>
          <h2 className="title-gold" style={{ fontSize: '1.6rem', marginBottom: '6px' }}>
            ملفات المشتبه بهم والشهود
          </h2>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>
            سجل التحريات الجنائية، تفريغ الدوافع، وتتبع الحجج الغيابية وتصنيف درجات الاشتباه
          </p>
        </div>

        {/* Filters & Search */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', minWidth: '220px' }}>
            <Search size={16} style={{ position: 'absolute', right: '12px', top: '12px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="retro-input"
              style={{ width: '100%', paddingRight: '36px', height: '40px' }}
              placeholder="بحث في الأسماء أو الدوافع..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-card)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            {[
              { id: 'ALL', label: 'الكل' },
              { id: 'SUSPECTS', label: 'المشتبه بهم (Suspects)' },
              { id: 'WITNESSES', label: 'الشهود والمراقبون (Watchers)' },
              { id: 'PRIME', label: 'المشتبه الرئيسي' },
              { id: 'EXONERATED', label: 'المستبعدون' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  audioService.playClick();
                  setFilter(tab.id);
                }}
                className={`tab-btn ${filter === tab.id ? 'active' : ''}`}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: filter === tab.id ? 'var(--gold-primary)' : 'transparent',
                  color: filter === tab.id ? '#0d1117' : 'var(--text-secondary)',
                  border: 'none',
                  transition: 'all 0.2s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Suspects Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
        gap: '20px'
      }}>
        {filteredSuspects.map((suspect, idx) => {
          const state = suspectStates[suspect.name] || {};
          const currentStatus = state.status || (suspect.type === 'WITNESS' ? 'NEUTRAL' : 'UNDER_INVESTIGATION');
          const currentOption = statusOptions.find(o => o.value === currentStatus) || statusOptions[0];

          return (
            <div 
              key={idx} 
              className="double-bezel"
              style={{
                background: 'var(--bg-card)',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderLeft: `4px solid ${currentOption.color}`,
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
            >
              <div>
                {/* Header row */}
                <div className="flex-between mb-12">
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--gold-primary)'
                    }}>
                      <User size={22} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                        {suspect.name}
                      </h3>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {suspect.role || (suspect.type === 'WITNESS' ? 'شاهد إثبات' : 'طرف مشتبه')}
                      </span>
                    </div>
                  </div>

                  <span 
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '12px',
                      background: `${currentOption.color}22`,
                      color: currentOption.color,
                      border: `1px solid ${currentOption.color}55`
                    }}
                  >
                    {currentOption.label}
                  </span>
                </div>

                {/* Details Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px', fontSize: '0.88rem' }}>
                  {suspect.relationship && (
                    <div style={{ background: 'var(--bg-main)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                      <span style={{ color: 'var(--gold-dim)', fontWeight: 600 }}>العلاقة بالمجني عليه: </span>
                      <span style={{ color: 'var(--text-secondary)' }}>{suspect.relationship}</span>
                    </div>
                  )}

                  {suspect.motive && (
                    <div style={{ background: 'var(--bg-main)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                      <span style={{ color: '#ef4444', fontWeight: 600 }}>الدافع المحتمل: </span>
                      <span style={{ color: 'var(--text-secondary)' }}>{suspect.motive}</span>
                    </div>
                  )}

                  {suspect.alibi && (
                    <div style={{ background: 'var(--bg-main)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                      <span style={{ color: '#10b981', fontWeight: 600 }}>الحجة الغيابية (Alibi): </span>
                      <span style={{ color: 'var(--text-secondary)' }}>{suspect.alibi}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                <div className="flex-between" style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>تعديل الحالة الجنائية:</label>
                  <select
                    className="retro-select"
                    style={{ fontSize: '0.8rem', padding: '4px 8px', borderRadius: '6px' }}
                    value={currentStatus}
                    onChange={(e) => {
                      audioService.playClick();
                      onUpdateStatus(suspect.name, e.target.value);
                    }}
                  >
                    {statusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <button
                  className="wax-seal-btn"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '10px',
                    fontSize: '0.88rem',
                    borderRadius: '8px',
                    gap: '8px'
                  }}
                  onClick={() => {
                    audioService.playClick();
                    if (onInterrogate) onInterrogate(suspect);
                  }}
                >
                  <MessageSquare size={16} />
                  بدء الاستجواب والتحقيق المباشر
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSuspects.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'var(--bg-card)',
          borderRadius: '12px',
          border: '1px dashed var(--border-subtle)',
          color: 'var(--text-muted)'
        }}>
          <ShieldAlert size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <h3>لم يتم العثور على أطراف مطابقة للبحث</h3>
          <p style={{ fontSize: '0.9rem' }}>جرب تغيير معايير التصفية أو إفراغ خانة البحث</p>
        </div>
      )}
    </div>
  );
}
