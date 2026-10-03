import React, { useState } from 'react';
import { Clock, Filter, AlertCircle, CheckCircle2, User, Search, Calendar } from 'lucide-react';
import { audioService } from '../../services/audioService';

export default function TimelineView({ timeline = [], suspects = [] }) {
  const [filterPerson, setFilterPerson] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTimeline = timeline.filter(item => {
    if (filterPerson !== 'ALL' && item.person && !item.person.includes(filterPerson)) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTime = (item.time || '').toLowerCase().includes(q);
      const matchDesc = (item.event || '').toLowerCase().includes(q);
      const matchPerson = (item.person || '').toLowerCase().includes(q);
      if (!matchTime && !matchDesc && !matchPerson) return false;
    }
    return true;
  });

  return (
    <div className="timeline-view">
      {/* Header */}
      <div className="flex-between mb-24">
        <div>
          <h2 className="title-gold" style={{ fontSize: '1.6rem', marginBottom: '6px' }}>
            الخط الزمني الموحد لوقائع الجريمة
          </h2>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>
            تسلسل تحركات الأطراف والمجني عليه دقيقة بدقيقة، ومطابقة الحجج الغيابية مع كاميرات المراقبة
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', minWidth: '200px' }}>
            <Search size={16} style={{ position: 'absolute', right: '12px', top: '12px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="retro-input"
              style={{ width: '100%', paddingRight: '36px', height: '40px' }}
              placeholder="بحث في الأحداث أو الأوقات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} color="var(--gold-primary)" />
            <select
              className="retro-select"
              value={filterPerson}
              onChange={(e) => {
                audioService.playClick();
                setFilterPerson(e.target.value);
              }}
              style={{ padding: '8px 12px', borderRadius: '8px' }}
            >
              <option value="ALL">جميع الأطراف والتحركات</option>
              {suspects.map((s, idx) => (
                <option key={idx} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Timeline Stream */}
      <div style={{ position: 'relative', paddingRight: '32px', margin: '20px 0' }}>
        {/* Vertical Axis Line */}
        <div 
          style={{
            position: 'absolute',
            right: '12px',
            top: '0',
            bottom: '0',
            width: '3px',
            background: 'linear-gradient(to bottom, var(--gold-primary), var(--border-subtle) 90%, transparent)',
            borderRadius: '2px'
          }} 
        />

        {filteredTimeline.map((item, idx) => {
          const isKeyMoment = item.isKey || item.event?.includes('الوفاة') || item.event?.includes('جريمة') || item.event?.includes('رصاص') || item.event?.includes('سم');

          return (
            <div 
              key={idx}
              style={{
                position: 'relative',
                marginBottom: '24px',
                paddingRight: '28px',
                transition: 'transform 0.2s'
              }}
            >
              {/* Timeline Pin/Dot */}
              <div 
                style={{
                  position: 'absolute',
                  right: '-27px',
                  top: '16px',
                  width: isKeyMoment ? '18px' : '14px',
                  height: isKeyMoment ? '18px' : '14px',
                  borderRadius: '50%',
                  background: isKeyMoment ? '#ef4444' : 'var(--gold-primary)',
                  boxShadow: isKeyMoment ? '0 0 12px #ef4444' : '0 0 8px rgba(212, 175, 55, 0.4)',
                  border: '2px solid var(--bg-main)',
                  zIndex: 2
                }}
              />

              {/* Event Card */}
              <div 
                className="double-bezel"
                style={{
                  background: isKeyMoment ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-card)',
                  borderRadius: '10px',
                  padding: '16px 20px',
                  borderRight: isKeyMoment ? '3px solid #ef4444' : '1px solid var(--border-subtle)',
                }}
              >
                <div className="flex-between mb-8">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={16} color={isKeyMoment ? '#ef4444' : 'var(--gold-primary)'} />
                    <span style={{
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      fontFamily: 'monospace',
                      color: isKeyMoment ? '#ef4444' : 'var(--gold-primary)',
                      direction: 'ltr'
                    }}>
                      {item.time || 'وقت غير محدد'}
                    </span>
                  </div>

                  {item.person && (
                    <span style={{
                      fontSize: '0.8rem',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-secondary)'
                    }}>
                      {item.person}
                    </span>
                  )}
                </div>

                <p style={{
                  margin: 0,
                  fontSize: '0.92rem',
                  lineHeight: 1.6,
                  color: isKeyMoment ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: isKeyMoment ? 600 : 400
                }}>
                  {item.event}
                </p>

                {item.note && (
                  <div style={{
                    marginTop: '8px',
                    fontSize: '0.8rem',
                    color: 'var(--gold-dim)',
                    background: 'var(--bg-main)',
                    padding: '6px 10px',
                    borderRadius: '4px'
                  }}>
                    ملاحظة المحقق: {item.note}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredTimeline.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'var(--bg-card)',
            borderRadius: '12px',
            border: '1px dashed var(--border-subtle)',
            color: 'var(--text-muted)'
          }}>
            <Calendar size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
            <h3>لا توجد أحداث مطابقة في الخط الزمني</h3>
            <p style={{ fontSize: '0.9rem' }}>جرب اختيار طرف آخر أو مسح البحث</p>
          </div>
        )}
      </div>
    </div>
  );
}
