import React, { useState } from 'react';
import { ArrowLeft, Thermometer, FlaskConical, AlertCircle, CheckCircle, Info, RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function SoilAdvisor() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nitrogen: '', phosphorus: '', potassium: '', ph: '', crop: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculateAdvice = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate complex calculation
    setTimeout(() => {
      const n = parseFloat(form.nitrogen);
      const p = parseFloat(form.phosphorus);
      const k = parseFloat(form.potassium);
      
      let advice = [];
      let status = 'Good';

      if (n < 40) advice.push('Increase Nitrogen intake using Urea (46% N) or composted manure.');
      if (p < 20) advice.push('Phosphate levels are low. Apply Single Super Phosphate (SSP) before sowing.');
      if (k < 50) advice.push('Potassium is deficient. Add Muriate of Potash (MOP) to improve grain quality.');
      
      if (advice.length === 0) {
        advice = ['Your soil nutrient levels are optimal for the current crop cycle. Maintain with organic mulch.'];
        status = 'Excellent';
      } else if (advice.length > 2) {
        status = 'Critical';
      }

      setResult({ advice, status, score: Math.floor(Math.random() * 21 + 75) });
      setLoading(false);
      toast.success('Soil analysis complete!');
    }, 1200);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '20px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <button 
            onClick={() => navigate('/farmer')}
            style={{ 
              background: 'white', border: '1px solid var(--slate-200)', 
              padding: 10, borderRadius: '50%', cursor: 'pointer', color: 'var(--slate-600)' 
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>AI Soil Health Advisor</h1>
            <p style={{ margin: 0, color: 'var(--slate-500)', fontSize: '0.9rem' }}>Smart fertilizer recommendations based on soil testing</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          
          {/* Input Form */}
          <div className="card" style={{ padding: '24px', height: 'fit-content' }}>
            <h3 style={{ marginTop: 0, marginBottom: 20, fontSize: '1rem', fontWeight: 800 }}>Soil Test Results (NPK)</h3>
            <form onSubmit={calculateAdvice} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Nitrogen (N) - kg/ha</label>
                <input 
                  type="number" placeholder="e.g. 45" required
                  className="form-input" value={form.nitrogen}
                  onChange={e => setForm({ ...form, nitrogen: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Phosphorus (P) - kg/ha</label>
                <input 
                  type="number" placeholder="e.g. 22" required
                  className="form-input" value={form.phosphorus}
                  onChange={e => setForm({ ...form, phosphorus: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Potassium (K) - kg/ha</label>
                <input 
                  type="number" placeholder="e.g. 110" required
                  className="form-input" value={form.potassium}
                  onChange={e => setForm({ ...form, potassium: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Target Crop</label>
                <select 
                  className="form-select" required
                  value={form.crop} onChange={e => setForm({ ...form, crop: e.target.value })}
                >
                  <option value="">Select crop</option>
                  <option value="Wheat">Wheat</option>
                  <option value="Rice">Rice</option>
                  <option value="Cotton">Cotton</option>
                  <option value="Sugarcane">Sugarcane</option>
                </select>
              </div>
              <button disabled={loading} type="submit" className="btn btn-primary" style={{ marginTop: 8, justifyContent: 'center' }}>
                {loading ? <RefreshCcw size={18} className="spin" /> : 'Get Recommendations'}
              </button>
            </form>
          </div>

          {/* Advice Output */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {!result ? (
              <div className="card" style={{ padding: '40px', textAlign: 'center', opacity: 0.6, border: '2px dashed var(--slate-200)', background: 'transparent' }}>
                <FlaskConical size={32} style={{ margin: '0 auto 16px', color: 'var(--slate-400)' }} />
                <p style={{ margin: 0, color: 'var(--slate-500)', fontSize: '0.9rem' }}>Enter your soil test values to receive AI-powered dosage advice.</p>
              </div>
            ) : (
              <div className="card" style={{ padding: '0', overflow: 'hidden', animation: 'fadeInUp 0.4s ease' }}>
                <div style={{ 
                  background: result.status === 'Critical' ? '#fee2e2' : result.status === 'Excellent' ? 'var(--green-100)' : '#fef3c7',
                  padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.7, marginBottom: 2 }}>Analysis Status</div>
                    <div style={{ fontWeight: 800, fontSize: '1.2rem', color: result.status === 'Critical' ? '#991b1b' : result.status === 'Excellent' ? 'var(--green-800)' : '#92400e' }}>
                      {result.status}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--slate-900)' }}>{result.score}%</div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 600 }}>Health Score</div>
                  </div>
                </div>
                
                <div style={{ padding: '24px' }}>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Info size={16} color="var(--blue-600)" /> Smart Recommendations
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {result.advice.map((line, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: '#f8fafc', padding: 12, borderRadius: 12, border: '1px solid var(--slate-100)' }}>
                        <CheckCircle size={14} color="var(--green-600)" style={{ marginTop: 2, flexShrink: 0 }} />
                        <span style={{ fontSize: '0.85rem', color: 'var(--slate-700)', lineHeight: 1.4 }}>{line}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div style={{ marginTop: 20, padding: 12, background: '#fffbeb', borderRadius: 12, border: '1px solid #fef3c7', display: 'flex', gap: 10 }}>
                    <AlertCircle size={16} color="#fbbf24" style={{ flexShrink: 0 }} />
                    <div style={{ fontSize: '0.75rem', color: '#92400e', lineHeight: 1.4 }}>
                      <strong>Disclaimer:</strong> Recommendations are based on standard models. Consult with a local agricultural officer for site-specific advice.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Tips */}
            <div className="card" style={{ padding: '20px', background: 'var(--slate-900)', color: 'white' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: 'var(--green-400)' }}>Pro Tip</h4>
              <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8, lineHeight: 1.5 }}>
                Testing your soil before every sowing season can save up to ₹5,000 per acre in fertilizer costs by avoiding over-application.
              </p>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
