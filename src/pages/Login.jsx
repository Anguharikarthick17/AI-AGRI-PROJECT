import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Sprout, ArrowRight, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const DEMO_CREDS = [
  { role: 'Farmer', email: 'farmer@agri.gov.in', password: 'farmer123', color: 'var(--green-600)', icon: '👨‍🌾', desc: 'Apply for schemes & check status' },
  { role: 'Officer', email: 'officer@agri.gov.in', password: 'officer123', color: '#3b82f6', icon: '👨‍💼', desc: 'Review & approve applications' },
  { role: 'Admin', email: 'admin@agri.gov.in', password: 'admin123', color: '#8b5cf6', icon: '⚙️', desc: 'Analytics & system management' },
]

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    const result = login(form.email, form.password)
    setLoading(false)
    if (result.success) {
      toast.success(`Welcome back, ${result.user.name}!`)
      const routes = { farmer: '/farmer', officer: '/officer', admin: '/admin' }
      navigate(routes[result.user.role] || '/')
    } else {
      toast.error('Invalid email or password')
    }
  }

  const quickLogin = (cred) => {
    setForm({ email: cred.email, password: cred.password })
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'linear-gradient(135deg, var(--green-900) 0%, var(--green-800) 40%, #1e3a2f 100%)',
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Back button */}
      <button 
        onClick={() => navigate('/')}
        style={{
          position: 'absolute', top: 32, left: 32, zIndex: 50,
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,0.1)', color: 'white',
          border: '1px solid rgba(255,255,255,0.2)', padding: '10px 18px',
          borderRadius: 99, cursor: 'pointer', transition: 'all 0.2s',
          backdropFilter: 'blur(10px)', fontSize: '0.9rem', fontWeight: 600
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
      >
        <ArrowLeft size={18} /> Back to Home
      </button>

      {/* Background decoration */}
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute', borderRadius: '50%',
          background: 'rgba(16,185,129,.06)',
          width: `${200 + i * 120}px`, height: `${200 + i * 120}px`,
          top: `${-50 + i * 60}px`, right: `${-80 + i * 40}px`,
          pointerEvents: 'none',
        }} />
      ))}

      {/* Left panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px', color: 'white'
      }} className="left-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 48 }}>
          <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg, var(--green-400), var(--green-600))', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>🌾</div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>AgriSmart</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--green-300)' }}>AI-Powered Agricultural Administration</div>
          </div>
        </div>

        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1.2, marginBottom: 16, fontFamily: 'Outfit, sans-serif' }}>
          Smart Farming<br />Starts Here
        </h1>
        <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,.65)', maxWidth: 380, lineHeight: 1.7, marginBottom: 48 }}>
          AI-powered administration system for faster, transparent, and efficient farmer services across India.
        </p>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { value: '2.4M+', label: 'Farmers Served' },
            { value: '₹480Cr', label: 'Subsidies Processed' },
            { value: '98%', label: 'Verification Rate' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,.07)', borderRadius: 12, padding: '16px', border: '1px solid rgba(255,255,255,.1)' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: 'var(--green-300)' }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,.5)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - Login form */}
      <div style={{ width: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 48px' }}>
        <div style={{ width: '100%', background: 'rgba(255,255,255,.96)', borderRadius: 24, padding: '40px', boxShadow: '0 30px 80px rgba(0,0,0,.3)' }}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--slate-900)', fontFamily: 'Outfit, sans-serif' }}>Sign In</h2>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem', marginTop: 4 }}>Access your AgriSmart dashboard</p>
          </div>

          {/* Quick credentials */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Quick Login (Demo)</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {DEMO_CREDS.map(c => (
                <button
                  key={c.role}
                  onClick={() => quickLogin(c)}
                  style={{
                    flex: 1, padding: '10px 6px', borderRadius: 10,
                    border: `2px solid ${form.email === c.email ? c.color : 'var(--slate-200)'}`,
                    background: form.email === c.email ? `${c.color}15` : 'white',
                    cursor: 'pointer', transition: 'all .2s', textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '1.2rem' }}>{c.icon}</div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: c.color, marginTop: 2 }}>{c.role}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  style={{ width: '100%', paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--slate-400)', cursor: 'pointer' }}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
            >
              {loading ? (
                <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div style={{ marginTop: 20, padding: '12px 14px', background: 'var(--green-50)', borderRadius: 10, border: '1px solid var(--green-100)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600, marginBottom: 4 }}>Demo Credentials:</div>
            {DEMO_CREDS.map(c => (
              <div key={c.role} style={{ fontSize: '0.72rem', color: 'var(--slate-600)', lineHeight: 1.8 }}>
                <strong style={{ color: 'var(--slate-800)' }}>{c.role}:</strong> {c.email} / {c.password}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .left-panel { display: none; }
        }
      `}</style>
    </div>
  )
}
