import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Sprout, ArrowRight, ArrowLeft, Briefcase, Settings, Tractor, Coins, Users, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AgriLogo from '../components/AgriLogo'
import toast from 'react-hot-toast'

const DEMO_CREDS = [
  { role: 'Officer', email: 'officer@agri.gov.in', password: 'officer123', color: '#3b82f6', icon: <Briefcase size={28} color="#3b82f6" />, desc: 'Review & approve applications' },
  { role: 'Admin', email: 'admin@agri.gov.in', password: 'admin123', color: '#8b5cf6', icon: <Settings size={28} color="#8b5cf6" />, desc: 'Analytics & system management' },
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
      backgroundImage: `url('file:///Users/ahk/.gemini/antigravity/brain/373d5579-b0af-44d8-9d25-5f507bb6e781/lush_green_farm_drone_shot_1774687942327.png')`,
      backgroundSize: 'cover', backgroundPosition: 'center',
      position: 'relative', overflow: 'hidden',
      animation: 'fadeIn 1s ease'
    }}>
      {/* Overlay for better readability */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(6,78,59,.92) 0%, rgba(0,0,0,.7) 50%, rgba(6,78,59,.4) 100%)',
        zIndex: 1
      }} />
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

      {/* Floating particles simulation */}
      <div className="particles-container" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2 }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute', width: 8, height: 8, borderRadius: '50%',
            background: 'var(--green-400)', opacity: 0.3,
            top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
            animation: `float ${5 + i}s infinite ease-in-out alternate`
          }} />
        ))}
      </div>

      {/* Left panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '0 80px', color: 'white', position: 'relative', zIndex: 10
      }} className="left-panel">
        <div style={{ marginBottom: 48, animation: 'fadeInDown 0.8s ease' }}>
          <AgriLogo size="lg" light={true} />
        </div>

        <h1 style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', fontWeight: 950, lineHeight: 1, marginBottom: 24, fontFamily: 'Outfit, sans-serif', animation: 'fadeInUp 0.8s ease' }}>
          Smart Farming<br />
          <span style={{ color: 'var(--green-400)' }}>Starts Here.</span>
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,.7)', maxWidth: 460, lineHeight: 1.6, marginBottom: 56, animation: 'fadeInUp 0.8s ease', animationDelay: '0.1s' }}>
          Leading India's agricultural transformation with AI-powered administration for faster and transparent services.
        </p>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, maxWidth: 660, animation: 'fadeInUp 1s ease', animationDelay: '0.2s' }}>
          {[
            { value: '2.4M+', label: 'Farmers Served', icon: Users, color: '#10b981' },
            { value: '₹480Cr', label: 'Funds Disbursed', icon: Coins, color: '#f59e0b' },
            { value: '98%', label: 'AI Accuracy', icon: ShieldCheck, color: '#3b82f6' },
          ].map(s => (
            <div key={s.label} className="glass-card" style={{ 
              background: 'rgba(255,255,255,.05)', 
              backdropFilter: 'blur(10px)',
              borderRadius: 20, padding: '24px', 
              border: '1px solid rgba(255,255,255,.1)',
              transition: 'all 0.3s'
            }}>
              <div style={{ width: 40, height: 40, background: `${s.color}20`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, color: s.color }}>
                <s.icon size={22} />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: 'Outfit, sans-serif', color: 'white' }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,.5)', fontWeight: 600, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - Login form */}
      <div style={{ width: 520, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', position: 'relative', zIndex: 10 }}>
        <div style={{ 
          width: '100%', 
          background: 'rgba(255,255,255,.08)', 
          backdropFilter: 'blur(30px) saturate(180%)',
          WebkitBackdropFilter: 'blur(30px) saturate(180%)',
          borderRadius: 32, padding: '48px', 
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,.15)'
        }}>
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'white', fontFamily: 'Outfit, sans-serif' }}>Officer Sign-In</h2>
            <div style={{ height: 4, width: 40, background: 'var(--green-500)', borderRadius: 2, marginTop: 12 }} />
          </div>

          {/* Quick credentials */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,.4)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '1px' }}>Quick Access</div>
            <div style={{ display: 'flex', gap: 12 }}>
              {DEMO_CREDS.map(c => (
                <button
                  key={c.role}
                  onClick={() => quickLogin(c)}
                  style={{
                    flex: 1, padding: '16px 8px', borderRadius: 16,
                    border: `1px solid ${form.email === c.email ? c.color : 'rgba(255,255,255,.1)'}`,
                    background: form.email === c.email ? `${c.color}20` : 'rgba(255,255,255,.03)',
                    cursor: 'pointer', transition: 'all 0.3s', textAlign: 'center'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = form.email === c.email ? `${c.color}20` : 'rgba(255,255,255,.03)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>{c.icon}</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'white' }}>{c.role}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="form-group">
              <label className="form-label" style={{ color: 'rgba(255,255,255,.6)', fontSize: '0.8rem' }}>Email Address</label>
              <input
                className="form-input"
                type="email"
                placeholder="officer@agri.gov.in"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: 'white', padding: '14px 18px', borderRadius: 12 }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: 'rgba(255,255,255,.6)', fontSize: '0.8rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  style={{ width: '100%', padding: '14px 18px', paddingRight: 48, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: 'white', borderRadius: 12 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'rgba(255,255,255,.3)', cursor: 'pointer' }}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: 12, height: 52, borderRadius: 12, fontSize: '1rem', fontWeight: 700 }}
            >
              {loading ? (
                <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
              ) : (
                <>Sign In <ArrowRight size={20} style={{ marginLeft: 8 }} /></>
              )}
            </button>
          </form>

          <div style={{ marginTop: 32, padding: '16px', background: 'rgba(255,255,255,.05)', borderRadius: 16, border: '1px solid rgba(255,255,255,.05)' }}>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,.4)', fontWeight: 600, marginBottom: 8, letterSpacing: '0.5px' }}>CREDENTIALS:</div>
            {DEMO_CREDS.map(c => (
              <div key={c.role} style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,.6)', marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, color: 'var(--green-400)' }}>{c.role}</span>
                <span style={{ opacity: 0.8 }}>{c.password}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { from { transform: translateY(0); } to { transform: translateY(-10px); } }
        @media (max-width: 900px) {
          .left-panel { display: none; }
          .right-panel { width: 100% !important; padding: 20px !important; }
        }
      `}</style>
    </div>
  )
}
