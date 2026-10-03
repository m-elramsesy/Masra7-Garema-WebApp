import React from 'react';
import { sound } from '../../services/audioService';
import { X, Bookmark, BookmarkCheck, FileText, Activity, ShieldAlert, Copy } from 'lucide-react';

export function DocumentViewer({ doc, document, onClose, onToggleBookmark, isBookmarked }) {
  const currentDoc = doc || document;
  if (!currentDoc) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(`${currentDoc.title}\n\n${currentDoc.content}`);
    sound.playTypewriter();
    alert('تم نسخ مقتطف الدليل للحافظة!');
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 7, 10, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div 
        className="manila-folder"
        style={{
          width: '100%',
          maxWidth: '800px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.9), 0 0 0 1px rgba(0,0,0,0.3)',
          animation: 'fadeScaleIn 0.3s cubic-bezier(0.32, 0.72, 0, 1)'
        }}
      >
        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid rgba(0,0,0,0.15)', paddingBottom: '14px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="police-stamp stamp-classified" style={{ fontSize: '11px' }}>
              حرز رسمي معتمد
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: '700', color: '#451a03' }}>
              DOC-ID: {doc.id.toUpperCase()}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleCopy}
              title="نسخ نص الدليل"
              style={{ background: 'rgba(0,0,0,0.06)', border: 'none', padding: '6px 12px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700', color: '#1a1612' }}
            >
              <Copy style={{ width: '14px', height: '14px' }} />
              <span>نسخ</span>
            </button>

            <button
              onClick={() => {
                sound.playTypewriter();
                onToggleBookmark(doc.id);
              }}
              title={isBookmarked ? 'إلغاء التمييز' : 'تمييز كدليل محوري'}
              style={{ background: isBookmarked ? '#e11d48' : 'rgba(0,0,0,0.06)', border: 'none', color: isBookmarked ? '#fff' : '#1a1612', padding: '6px 12px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}
            >
              {isBookmarked ? <BookmarkCheck style={{ width: '14px', height: '14px' }} /> : <Bookmark style={{ width: '14px', height: '14px' }} />}
              <span>{isBookmarked ? 'دليل محوري مميز' : 'تمييز كدليل'}</span>
            </button>

            <button
              onClick={() => {
                sound.playPageTurn();
                onClose();
              }}
              style={{ background: 'rgba(0,0,0,0.1)', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer', color: '#1a1612' }}
            >
              <X style={{ width: '18px', height: '18px' }} />
            </button>
          </div>
        </div>

        {/* Title */}
        <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#1a1612', marginBottom: '16px' }}>
          {doc.title}
        </h2>

        {/* Content Sheet */}
        <div style={{
          flex: '1',
          overflowY: 'auto',
          background: 'rgba(255, 255, 255, 0.7)',
          padding: '24px',
          borderRadius: '8px',
          border: '1px solid rgba(0,0,0,0.1)',
          fontFamily: 'var(--font-arabic)',
          fontSize: '0.98rem',
          lineHeight: '1.8',
          color: '#1a1612',
          whiteSpace: 'pre-wrap'
        }}>
          {doc.content}
        </div>
      </div>
    </div>
  );
}

export default DocumentViewer;
