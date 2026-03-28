import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function LiveTime() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(time);

  const formattedTime = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(time);

  return (
    <div 
      style={{ 
        position: 'fixed', 
        bottom: 32, 
        left: 32, 
        zIndex: 9999,
        display: 'flex', 
        alignItems: 'center', 
        gap: 8,
        background: 'rgba(255, 255, 255, 0.95)',
        color: 'var(--slate-800)',
        border: '1px solid rgba(0,0,0,0.1)',
        padding: '12px 16px',
        borderRadius: 99,
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(10px)',
        fontWeight: 600,
        fontSize: '0.9rem',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => Object.assign(e.currentTarget.style, { transform: 'translateY(-2px)' })}
      onMouseLeave={(e) => Object.assign(e.currentTarget.style, { transform: 'translateY(0)' })}
    >
      <Clock size={18} color="var(--green-600)" />
      <span>{formattedDate} | {formattedTime} (IST)</span>
    </div>
  );
}
