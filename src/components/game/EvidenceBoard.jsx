import React, { useState, useRef, useEffect } from 'react';
import { Pin, Plus, Trash2, RotateCcw, Link2, Sparkles, User, FileText, AlertCircle, ShieldAlert, Folder } from 'lucide-react';
import { audioService } from '../../services/audioService';

export default function EvidenceBoard({ 
  caseData, 
  corkboardState = { nodes: [], connections: [] }, 
  onSaveCorkboard 
}) {
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectingStartId, setConnectingStartId] = useState(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExhibitPicker, setShowExhibitPicker] = useState(false);
  
  const boardRef = useRef(null);

  // Initialize nodes from caseData if corkboardState is empty
  useEffect(() => {
    if (corkboardState && corkboardState.nodes && corkboardState.nodes.length > 0) {
      setNodes(corkboardState.nodes);
      setConnections(corkboardState.connections || []);
    } else if (caseData) {
      const initialNodes = [];

      // 1. Add victim node at the center-top
      if (caseData.metadata?.victim) {
        initialNodes.push({
          id: 'victim-node',
          type: 'VICTIM',
          title: caseData.metadata.victim,
          subtitle: 'المجني عليه / الضحية',
          x: 480,
          y: 40,
          color: '#ef4444'
        });
      }

      // 2. Add primary suspects
      const suspectsOnly = (caseData.suspects || []).filter(s => s.type !== 'WITNESS');
      suspectsOnly.slice(0, 5).forEach((suspect, idx) => {
        initialNodes.push({
          id: `suspect-${idx}`,
          type: 'SUSPECT',
          title: suspect.name,
          subtitle: suspect.role || 'طرف مشتبه',
          x: 60 + (idx % 3) * 320,
          y: 190 + Math.floor(idx / 3) * 160,
          color: '#f59e0b'
        });
      });

      // 3. Add key witnesses / watchers
      const witnessesOnly = (caseData.suspects || []).filter(s => s.type === 'WITNESS');
      witnessesOnly.slice(0, 3).forEach((witness, idx) => {
        initialNodes.push({
          id: `witness-node-${idx}`,
          type: 'WITNESS',
          title: witness.name,
          subtitle: 'شاهد إثبات / مراقب',
          x: 1040,
          y: 100 + idx * 160,
          color: '#0284c7'
        });
      });

      // 4. Add all physical evidence clues from Envelope 1
      const env1 = caseData.envelopes?.find(e => e.number === 1);
      if (env1 && env1.sections) {
        env1.sections.slice(0, 5).forEach((sec, sIdx) => {
          initialNodes.push({
            id: `clue-1-${sIdx}`,
            type: 'CLUE',
            title: sec.title.replace(/^[#\s]+/, '').slice(0, 32),
            subtitle: sec.type === 'autopsy' ? 'تقرير الطب الشرعي' : 'حرز مادي (مسرح الجريمة)',
            x: 60 + sIdx * 250,
            y: 530,
            color: sec.type === 'autopsy' ? '#ef4444' : '#10b981'
          });
        });
      }

      setNodes(initialNodes);
      setConnections([]);
      if (onSaveCorkboard) {
        onSaveCorkboard({ nodes: initialNodes, connections: [] });
      }
    }
  }, [caseData]);

  // Handle Dragging
  const handleMouseDown = (e, nodeId) => {
    e.stopPropagation();
    if (connectingStartId) {
      handleConnectNodes(connectingStartId, nodeId);
      return;
    }
    setDraggingNodeId(nodeId);
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setDragOffset({
        x: e.clientX - node.x,
        y: e.clientY - node.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (!draggingNodeId || !boardRef.current) return;
    const boardRect = boardRef.current.getBoundingClientRect();
    const newX = Math.max(20, Math.min(boardRect.width - 240, e.clientX - dragOffset.x));
    const newY = Math.max(20, Math.min(boardRect.height - 120, e.clientY - dragOffset.y));

    setNodes(prev => prev.map(n => n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n));
  };

  const handleMouseUp = () => {
    if (draggingNodeId) {
      setDraggingNodeId(null);
      if (onSaveCorkboard) {
        onSaveCorkboard({ nodes, connections });
      }
    }
  };

  // Node Connection (Red Yarn)
  const handleConnectNodes = (fromId, toId) => {
    if (fromId === toId) {
      setConnectingStartId(null);
      return;
    }
    const exists = connections.some(
      c => (c.from === fromId && c.to === toId) || (c.from === toId && c.to === fromId)
    );

    let updatedConns;
    if (exists) {
      updatedConns = connections.filter(
        c => !((c.from === fromId && c.to === toId) || (c.from === toId && c.to === fromId))
      );
      audioService.playClick();
    } else {
      updatedConns = [...connections, { from: fromId, to: toId, id: `${fromId}-${toId}` }];
      audioService.playStamp();
    }

    setConnections(updatedConns);
    setConnectingStartId(null);
    if (onSaveCorkboard) {
      onSaveCorkboard({ nodes, connections: updatedConns });
    }
  };

  // Add custom detective note
  const handleAddCustomNote = () => {
    if (!newNoteText.trim()) return;
    audioService.playStamp();
    const newNode = {
      id: `custom-note-${Date.now()}`,
      type: 'NOTE',
      title: newNoteText.trim(),
      subtitle: 'ملاحظة واستنتاج المحقق',
      x: 420 + Math.random() * 80,
      y: 280 + Math.random() * 80,
      color: '#eab308'
    };
    const updated = [...nodes, newNode];
    setNodes(updated);
    setNewNoteText('');
    setShowAddModal(false);
    if (onSaveCorkboard) {
      onSaveCorkboard({ nodes: updated, connections });
    }
  };

  // Add exhibit from case documents to the corkboard
  const handleAddExhibitToBoard = (doc, envNum) => {
    audioService.playStamp();
    const newNode = {
      id: `exhibit-${Date.now()}`,
      type: 'CLUE',
      title: doc.title.replace(/^[#\s]+/, '').slice(0, 32),
      subtitle: `حرز من الظرف ${envNum}`,
      x: 200 + Math.random() * 300,
      y: 250 + Math.random() * 200,
      color: '#10b981'
    };
    const updated = [...nodes, newNode];
    setNodes(updated);
    setShowExhibitPicker(false);
    if (onSaveCorkboard) {
      onSaveCorkboard({ nodes: updated, connections });
    }
  };

  // Delete Node
  const handleDeleteNode = (id, e) => {
    e.stopPropagation();
    audioService.playClick();
    const updatedNodes = nodes.filter(n => n.id !== id);
    const updatedConns = connections.filter(c => c.from !== id && c.to !== id);
    setNodes(updatedNodes);
    setConnections(updatedConns);
    if (onSaveCorkboard) {
      onSaveCorkboard({ nodes: updatedNodes, connections: updatedConns });
    }
  };

  return (
    <div className="corkboard-container" style={{ position: 'relative', width: '100%', minHeight: '840px' }}>
      {/* Top Toolbar */}
      <div 
        className="flex-between mb-16 p-16"
        style={{
          background: 'var(--bg-card)',
          borderRadius: '12px',
          border: '1.5px solid var(--border-subtle)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1.5px solid #ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ef4444'
          }}>
            <Pin size={22} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: 800 }}>
              لوحة خيوط الأدلة الجنائية (Evidence Corkboard)
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              اسحب البطاقات ورتبها بحرية، واضغط على أيقونة الرابط لمد خيط أحمر كاشف للشبهات
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {connectingStartId ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#ef444422',
              color: '#ef4444',
              border: '1.5px dashed #ef4444',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.84rem',
              fontWeight: 700
            }}>
              <span className="pulse-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
              انقر على البطاقة الثانية لإتمام الخيط الأحمر...
              <button 
                onClick={() => setConnectingStartId(null)}
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}
              >
                إلغاء
              </button>
            </div>
          ) : (
            <>
              <button
                className="action-btn"
                onClick={() => {
                  audioService.playClick();
                  setShowExhibitPicker(true);
                }}
              >
                <Folder size={15} color="var(--gold-primary)" />
                تثبيت حرز من أوراق القضية
              </button>

              <button
                className="action-btn"
                onClick={() => {
                  audioService.playClick();
                  setShowAddModal(true);
                }}
              >
                <Plus size={15} color="#10b981" />
                إضافة ملاحظة استنتاج
              </button>
            </>
          )}

          <button
            title="إعادة ضبط خيوط اللوحة"
            onClick={() => {
              if (window.confirm('هل تريد مسح كافة الخيوط الحمراء والروابط؟')) {
                audioService.playClick();
                setConnections([]);
                if (onSaveCorkboard) onSaveCorkboard({ nodes, connections: [] });
              }
            }}
            className="action-btn"
            style={{ padding: '8px 12px' }}
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* The Corkboard Workspace */}
      <div
        ref={boardRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          position: 'relative',
          width: '100%',
          height: '760px',
          background: 'radial-gradient(ellipse at center, #241c15 0%, #15100c 100%)',
          borderRadius: '14px',
          border: '12px solid #3d2a1d',
          boxShadow: 'inset 0 0 80px rgba(0,0,0,0.8), 0 10px 30px rgba(0,0,0,0.6)',
          overflow: 'hidden',
          userSelect: 'none'
        }}
      >
        {/* Cork surface pattern overlay */}
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.12,
            backgroundImage: `radial-gradient(#d4af37 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
            pointerEvents: 'none'
          }} 
        />

        {/* SVG Canvas for Red Yarn Strings */}
        <svg 
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1
          }}
        >
          {connections.map((conn, idx) => {
            const fromNode = nodes.find(n => n.id === conn.from);
            const toNode = nodes.find(n => n.id === conn.to);
            if (!fromNode || !toNode) return null;

            const x1 = fromNode.x + 110;
            const y1 = fromNode.y + 12;
            const x2 = toNode.x + 110;
            const y2 = toNode.y + 12;

            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2 + 15;

            return (
              <g key={idx}>
                {/* Shadow */}
                <path
                  d={`M ${x1} ${y1} Q ${midX} ${midY + 4} ${x2} ${y2}`}
                  stroke="rgba(0, 0, 0, 0.6)"
                  strokeWidth="3.5"
                  fill="none"
                />
                {/* Red Detective Thread */}
                <path
                  d={`M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`}
                  stroke="#ef4444"
                  strokeWidth="2.4"
                  fill="none"
                />
              </g>
            );
          })}
        </svg>

        {/* Nodes / Cards on the Board */}
        {nodes.map(node => {
          const isConnectingFromThis = connectingStartId === node.id;

          return (
            <div
              key={node.id}
              onMouseDown={(e) => handleMouseDown(e, node.id)}
              style={{
                position: 'absolute',
                left: `${node.x}px`,
                top: `${node.y}px`,
                width: '220px',
                padding: '12px 14px',
                background: node.type === 'VICTIM' ? '#451a1a' : (node.type === 'NOTE' ? '#2d2412' : (node.type === 'WITNESS' ? '#112233' : 'var(--bg-elevated)')),
                borderRadius: '8px',
                border: isConnectingFromThis 
                  ? '2px dashed #ef4444' 
                  : (node.type === 'VICTIM' ? '2px solid #ef4444' : '1px solid var(--border-subtle)'),
                boxShadow: isConnectingFromThis 
                  ? '0 0 18px rgba(239, 68, 68, 0.5)' 
                  : '0 8px 24px rgba(0,0,0,0.5)',
                cursor: draggingNodeId === node.id ? 'grabbing' : 'grab',
                zIndex: draggingNodeId === node.id ? 10 : 2,
                transition: draggingNodeId === node.id ? 'none' : 'box-shadow 0.2s',
              }}
            >
              {/* Pushpin at top center */}
              <div 
                style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 35% 35%, #ff6b6b, #b91c1c)',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.6)',
                  border: '1px solid #7f1d1d',
                  zIndex: 3
                }} 
              />

              {/* Card Header */}
              <div className="flex-between mb-8" style={{ marginTop: '4px' }}>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: node.color || 'var(--gold-primary)',
                  letterSpacing: '0.5px'
                }}>
                  {node.subtitle}
                </span>

                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    title="ربط خيط أحمر ببطاقة أخرى"
                    onClick={(e) => {
                      e.stopPropagation();
                      audioService.playClick();
                      setConnectingStartId(node.id);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: isConnectingFromThis ? '#ef4444' : 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '2px'
                    }}
                  >
                    <Link2 size={14} />
                  </button>

                  {(node.type === 'NOTE' || node.type === 'CLUE') && (
                    <button
                      title="إزالة البطاقة من اللوحة"
                      onClick={(e) => handleDeleteNode(node.id, e)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '2px'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Card Title */}
              <div style={{
                fontSize: '0.92rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                lineHeight: 1.3,
                wordBreak: 'break-word'
              }}>
                {node.title}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Note Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999
        }}>
          <div className="double-bezel" style={{
            background: 'var(--bg-card)',
            padding: '24px',
            borderRadius: '12px',
            border: '1.5px solid var(--border-gold)',
            width: '90%',
            maxWidth: '420px'
          }}>
            <h4 style={{ margin: '0 0 12px', color: 'var(--gold-primary)', fontSize: '1.1rem' }}>
              إضافة بطاقة استنتاج للوحة الأدلة
            </h4>
            <textarea
              className="retro-input"
              rows={3}
              style={{ width: '100%', marginBottom: '16px' }}
              placeholder="اكتب ملاحظة، خيط اشتباه، أو ربط بين طرفين..."
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              autoFocus
            />
            <div className="flex-between">
              <button
                className="action-btn"
                onClick={() => setShowAddModal(false)}
              >
                إلغاء
              </button>
              <button
                className="wax-seal-btn"
                onClick={handleAddCustomNote}
              >
                تثبيت على اللوحة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exhibit Picker Modal */}
      {showExhibitPicker && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: '20px'
        }}>
          <div className="double-bezel" style={{
            background: 'var(--bg-card)',
            padding: '24px',
            borderRadius: '14px',
            border: '1.5px solid var(--border-gold)',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div className="flex-between mb-16">
              <h3 style={{ margin: 0, color: 'var(--gold-primary)', fontSize: '1.2rem' }}>
                اختر حرزاً أو وثيقة لتثبيتها على لوحة الأدلة
              </h3>
              <button 
                onClick={() => setShowExhibitPicker(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(caseData.envelopes || []).map(env => (
                <div key={env.number} style={{ marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--gold-dim)', fontWeight: 800, display: 'block', marginBottom: '6px' }}>
                    {env.title || `الظرف رقم ${env.number}`}
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {(env.sections || []).map((sec, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleAddExhibitToBoard(sec, env.number)}
                        className="flex-between"
                        style={{
                          background: 'var(--bg-main)',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-subtle)',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {sec.title}
                        </span>
                        <span className="action-btn" style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
                          + تثبيت
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
