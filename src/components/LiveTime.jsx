import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function LiveTime({ light = false }) {
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
      className="live-time-chip"
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: 8,
        background: light ? 'rgba(255, 255, 255, 0.1)' : 'var(--slate-50)',
        color: light ? 'rgba(255, 255, 255, 0.9)' : 'var(--slate-700)',
        border: `1px solid ${light ? 'rgba(255, 255, 255, 0.15)' : 'var(--slate-200)'}`,
        padding: '6px 14px',
        borderRadius: 99,
        fontWeight: 600,
        fontSize: '0.82rem',
        backdropFilter: 'blur(10px)',
        whiteSpace: 'nowrap',
        transition: 'all 0.2s',
      }}
    >
      <Clock size={15} color="#10b981" />
      <span>{formattedDate} | {formattedTime} IST</span>
    </div>
  );
}
