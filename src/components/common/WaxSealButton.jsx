import React, { useState } from 'react';
import { sound } from '../../services/audioService';
import { ShieldAlert, Lock, Unlock } from 'lucide-react';

export function WaxSealButton({ 
  envelopeNumber, 
  isUnlocked, 
  isUnlockable, 
  disabled,
  sealed = true,
  onUnseal, 
  onClick,
  sealColor = '#8a1c1c',
  label = 'فض الختم الشمعي' 
}) {
  const [isBreaking, setIsBreaking] = useState(false);

  const canUnlock = typeof isUnlockable === 'boolean' ? isUnlockable : !disabled;
  const isCurrentlyUnlocked = isUnlocked || !sealed;

  const handleClick = () => {
    if (isCurrentlyUnlocked || !canUnlock || isBreaking) return;
    setIsBreaking(true);
    sound.playWaxSeal();
    setTimeout(() => {
      sound.playSuccess();
      setIsBreaking(false);
      if (onUnseal) onUnseal();
      if (onClick) onClick();
    }, 600);
  };

  if (isCurrentlyUnlocked) {
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        background: 'rgba(16, 185, 129, 0.15)',
        border: '1px solid rgba(16, 185, 129, 0.35)',
        borderRadius: '9999px',
        color: '#10b981',
        fontWeight: 'bold',
        fontSize: '0.86rem'
      }}>
        <Unlock size={16} />
        <span>مفتوح ومتاح للتحقيق</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
      <button
        onClick={handleClick}
        disabled={!canUnlock}
        title={canUnlock ? 'انقر لكسر الختم الشمعي وفض المظروف' : 'أكمل أهداف المرحلة أولاً لفتح الختم'}
        className={`wax-seal ${canUnlock ? 'pulse-seal' : ''}`}
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: `radial-gradient(circle at 35% 35%, #b91c1c, ${sealColor})`,
          border: '3px solid #fecaca',
          boxShadow: canUnlock ? '0 0 20px rgba(185, 28, 28, 0.6), inset 0 2px 4px rgba(255,255,255,0.4)' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: canUnlock ? 'pointer' : 'not-allowed',
          opacity: canUnlock ? 1 : 0.45,
          filter: canUnlock ? 'none' : 'grayscale(1)',
          transform: isBreaking ? 'scale(0.85) rotate(15deg)' : 'none',
          transition: 'all 0.3s cubic-bezier(0.32, 0.72, 0, 1)'
        }}
      >
        {canUnlock ? (
          <ShieldAlert size={28} color="#fef3c7" />
        ) : (
          <Lock size={22} color="#9ca3af" />
        )}
      </button>

      <div style={{ textAlign: 'center' }}>
        <p style={{
          margin: 0,
          fontSize: '0.85rem',
          fontWeight: 700,
          color: canUnlock ? '#f87171' : 'var(--text-muted)'
        }}>
          {canUnlock ? label : 'المظروف مغلق ومختوم بالشمع'}
        </p>
        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
          {canUnlock ? 'انقر لكسر الختم الشمعي وفض المظروف' : 'أكمل متطلبات التحقيق أولاً'}
        </span>
      </div>
    </div>
  );
}

export default WaxSealButton;
