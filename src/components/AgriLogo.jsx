import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function AgriLogo({ size = 'md', light = true, onClick }) {
  const navigate = useNavigate()
  
  const handleOnClick = (e) => {
    if (onClick) onClick(e)
    else navigate('/')
  }

  const sizes = {
    sm: { icon: 32, text: '1.1rem', sub: '0.65rem' },
    md: { icon: 42, text: '1.4rem', sub: '0.75rem' },
    lg: { icon: 52, text: '1.8rem', sub: '0.85rem' }
  }

  const s = sizes[size] || sizes.md

  return (
    <div 
      style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'transform 0.2s ease' }} 
      onClick={handleOnClick}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      <div style={{
        width: s.icon, height: s.icon,
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 16px rgba(16,185,129,0.2)',
        flexShrink: 0
      }}>
        <svg width={s.icon * 0.72} height={s.icon * 0.72} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C12 2 12 6 12 8M12 2C12 2 8 6 6 12M12 2C12 2 16 6 18 12M12 8C12 8 10 10 9 13M12 8C12 8 14 10 15 13M9 13C9 13 8 15 8 18M15 13C15 13 16 15 16 18M9 13L12 12L15 13M12 12V22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 18C7 18 8 19 9 19C10 19 11 18 11 18M13 18C13 18 14 19 15 19C16 19 17 18 17 18" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
      <div>
        <div style={{
          color: light ? 'white' : 'var(--slate-900)',
          fontSize: s.text,
          fontWeight: 900,
          fontFamily: 'Outfit, sans-serif',
          lineHeight: 1,
          letterSpacing: '-0.3px'
        }}>
          Agri<span style={{ color: light ? '#34d399' : '#059669', fontWeight: 400 }}>Smart</span>
        </div>
        <div style={{
          color: light ? 'rgba(255,255,255,0.6)' : 'var(--slate-500)',
          fontSize: s.sub,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginTop: 2
        }}>
          Digital Agriculture Mission
        </div>
      </div>
    </div>
  )
}
