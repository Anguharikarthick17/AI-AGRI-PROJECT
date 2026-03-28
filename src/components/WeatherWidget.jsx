import React, { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, Thermometer, Wind, AlertCircle, RefreshCw } from 'lucide-react';

const MOCK_WEATHER = [
  { id: 1, day: 'Today', temp: 32, condition: 'Sunny', rain: 5, icon: <Sun size={24} color="#f59e0b" />, advisory: 'Good for pesticide spray' },
  { id: 2, day: 'Mon', temp: 28, condition: 'Partly Cloudy', rain: 20, icon: <Cloud size={24} color="#60a5fa" />, advisory: 'Normal harvesting' },
  { id: 3, day: 'Tue', temp: 26, condition: 'Showers', rain: 75, icon: <CloudRain size={24} color="#3b82f6" />, advisory: 'Avoid fertilization' },
  { id: 4, day: 'Wed', temp: 24, condition: 'Rain', rain: 90, icon: <CloudRain size={24} color="#2563eb" />, advisory: 'Heavy precipitation' },
  { id: 5, day: 'Thu', temp: 30, condition: 'Sunny', rain: 10, icon: <Sun size={24} color="#f59e0b" />, advisory: 'Irrigation recommended' },
];

export default function WeatherWidget() {
  const [data, setData] = useState(MOCK_WEATHER);
  const [loading, setLoading] = useState(false);

  const refreshWeather = () => {
    setLoading(true);
    // Simulate API fetch delay
    setTimeout(() => {
      const newData = data.map(item => ({
        ...item,
        temp: item.temp + Math.floor(Math.random() * 5 - 2),
      }));
      setData(newData);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="card" style={{ padding: '24px', background: 'linear-gradient(135deg, white, var(--green-50))' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <CloudRain size={20} color="var(--blue-600)" />
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Weather & Crop Alerts</h3>
        </div>
        <button 
          onClick={refreshWeather} 
          disabled={loading}
          style={{ 
            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)',
            display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem'
          }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          {loading ? 'Fetching...' : 'Refresh'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 24 }}>
        {data.map((day) => (
          <div 
            key={day.id} 
            style={{ 
              textAlign: 'center', padding: '12px 4px', background: day.id === 1 ? 'rgba(59, 130, 246, 0.1)' : 'white',
              borderRadius: 12, border: day.id === 1 ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid var(--slate-100)'
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', marginBottom: 4 }}>{day.day}</div>
            <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center' }}>{day.icon}</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--slate-900)' }}>{day.temp}°</div>
            <div style={{ fontSize: '0.7rem', color: day.rain > 50 ? '#ef4444' : 'var(--slate-400)' }}>{day.rain}% Rain</div>
          </div>
        ))}
      </div>

      <div style={{ 
        background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)',
        padding: '16px', borderRadius: 16, display: 'flex', gap: 16, alignItems: 'flex-start'
      }}>
        <div style={{ background: 'white', padding: 8, borderRadius: '50%', color: '#f59e0b', flexShrink: 0 }}>
          <AlertCircle size={20} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#92400e', marginBottom: 2 }}>Farmer Advisory (Today)</div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#b45309', lineHeight: 1.4 }}>
            {data[0].advisory}. No heavy winds or rain expected in the next 24 hours. Optimal time for fertilizer application.
          </p>
        </div>
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
