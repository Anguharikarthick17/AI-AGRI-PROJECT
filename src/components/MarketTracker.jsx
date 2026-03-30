import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, ShoppingBag, MapPin, RefreshCw } from 'lucide-react';

const MOCK_MANDI_DATA = [
  { id: 1, crop: 'Wheat (Gehun)', price: 2125, change: 15, unit: 'Quintal', market: 'Khanna, Punjab' },
  { id: 2, crop: 'Paddy (Dhan)', price: 2040, change: -5, unit: 'Quintal', market: 'Karnal, Haryana' },
  { id: 3, crop: 'Cotton (Kapas)', price: 8500, change: 120, unit: 'Quintal', market: 'Rajkot, Gujarat' },
  { id: 4, crop: 'Soybean', price: 5400, change: -20, unit: 'Quintal', market: 'Indore, MP' },
  { id: 5, crop: 'Onion (Pyaz)', price: 1800, change: 45, unit: 'Quintal', market: 'Lasalgaon, Maharashtra' },
  { id: 6, crop: 'Tomato', price: 2200, change: -100, unit: 'Quintal', market: 'Kolar, Karnataka' },
];

export default function MarketTracker() {
  const [data, setData] = useState(MOCK_MANDI_DATA);
  const [loading, setLoading] = useState(false);

  const refreshPrices = () => {
    setLoading(true);
    // Simulate API fetch delay
    setTimeout(() => {
      const newData = data.map(item => ({
        ...item,
        price: item.price + Math.floor(Math.random() * 21 - 10), // Small random variation
        change: Math.floor(Math.random() * 41 - 20)
      }));
      setData(newData);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ShoppingBag size={20} color="var(--green-600)" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Live Mandi Prices</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: 12, border: '1px solid rgba(16,185,129,0.2)' }}>
              <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green-500)' }} />
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--green-600)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Live</span>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--slate-400)', fontWeight: 500, marginBottom: 2 }}>Last updated: Just now</div>
          <button 
            onClick={refreshPrices} 
            disabled={loading}
            style={{ 
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--green-600)',
              display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', fontWeight: 600,
              padding: 0, marginLeft: 'auto'
            }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            {loading ? 'Updating...' : 'Sync Data'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {data.map((item) => (
          <div 
            key={item.id} 
            style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 16px', background: 'var(--slate-50)', borderRadius: 12,
              border: '1px solid var(--slate-100)', transition: 'all 0.3s'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{item.crop}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={12} /> {item.market}
              </span>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800, color: 'var(--slate-900)' }}>
                ₹{item.price.toLocaleString()} <span style={{ fontSize: '0.7rem', color: 'var(--slate-400)', fontWeight: 500 }}>/{item.unit}</span>
              </div>
              <div style={{ 
                fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4,
                color: item.change >= 0 ? 'var(--green-600)' : '#ef4444' 
              }}>
                {item.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {item.change >= 0 ? '+' : ''}{item.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, fontSize: '0.75rem', color: 'var(--slate-400)', fontStyle: 'italic', textAlign: 'center' }}>
        * Prices updated simulated from AGMARKNET live feed
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        .pulse-dot { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </div>
  );
}
