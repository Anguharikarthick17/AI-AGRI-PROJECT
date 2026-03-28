import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी (Hindi)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
  { code: 'ml', label: 'മലയാളം (Malayalam)' }
];

export default function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState('en');
  const [isOpen, setIsOpen] = useState(false);

  const changeLanguage = (code) => {
    setCurrentLang(code);
    setIsOpen(false);
    
    // Find the hidden Google Translate dropdown and trigger change
    const select = document.querySelector('.goog-te-combo');
    if (select) {
      select.value = code;
      const event = new Event('change', { bubbles: true });
      select.dispatchEvent(event);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('#lang-selector')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  return (
    <div id="lang-selector" style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 9999 }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(255, 255, 255, 0.95)',
          color: 'var(--slate-800)',
          border: '1px solid rgba(0,0,0,0.1)',
          padding: '12px 16px',
          borderRadius: 99,
          cursor: 'pointer',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)',
          fontWeight: 600,
          transition: 'all 0.2s',
          fontSize: '0.9rem'
        }}
        onMouseEnter={(e) => Object.assign(e.currentTarget.style, { transform: 'translateY(-2px)' })}
        onMouseLeave={(e) => Object.assign(e.currentTarget.style, { transform: 'translateY(0)' })}
      >
        <Globe size={18} color="var(--green-600)" />
        {LANGUAGES.find(l => l.code === currentLang)?.label.split(' ')[0]}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 12px)', right: 0,
          background: 'white', border: '1px solid rgba(0,0,0,0.05)',
          borderRadius: 16, padding: 8, minWidth: 200,
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          animation: 'fadeInUp 0.2s ease',
          transformOrigin: 'bottom right'
        }}>
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '10px 16px', background: currentLang === lang.code ? 'var(--green-50)' : 'transparent',
                color: currentLang === lang.code ? 'var(--green-700)' : 'var(--slate-700)',
                border: 'none', borderRadius: 8, cursor: 'pointer',
                fontWeight: currentLang === lang.code ? 700 : 500,
                transition: 'all 0.2s', fontSize: '0.9rem'
              }}
              onMouseEnter={e => {
                if (currentLang !== lang.code) e.currentTarget.style.background = 'var(--slate-50)';
              }}
              onMouseLeave={e => {
                if (currentLang !== lang.code) e.currentTarget.style.background = 'transparent';
              }}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
