import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sprout, ShieldCheck, Shield, Zap, BarChart3, AlertTriangle, ChevronRight, ArrowRight, PlayCircle, Coins, MessageSquareWarning, FileText, Bot, UserCheck, CheckCircle2 } from 'lucide-react'

const FEATURES = [
  { icon: ShieldCheck, title: 'AI Document Verification', desc: 'OCR-powered instant verification of farmer documents with mismatch detection and risk scoring.', color: 'var(--green-600)' },
  { icon: AlertTriangle, title: 'Smart Grievance Management', desc: 'AI classifies every complaint by category and priority for faster resolution.', color: '#f59e0b' },
  { icon: Zap, title: 'Workflow Automation', desc: 'End-to-end digital workflow eliminates manual paperwork and speeds up approvals.', color: '#8b5cf6' },
  { icon: BarChart3, title: 'Real-time Analytics', desc: 'Live dashboards, trend analysis, and alerts for data-driven decisions.', color: '#3b82f6' },
]

const STATS = [
  { value: '2.4M+', label: 'Farmers Registered' },
  { value: '₹480Cr', label: 'Subsidies Processed' },
  { value: '14 States', label: 'Coverage' },
  { value: '98%', label: 'Accuracy Rate' },
]

export default function Landing() {
  const navigate = useNavigate()
  const sectionsRef = useRef([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.1 }
    )
    sectionsRef.current.forEach(el => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const addRef = (el, i) => { sectionsRef.current[i] = el }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', fontFamily: 'Inter, sans-serif' }}>

      {/* ── Navbar ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,.08)',
        padding: '0 40px', height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg, var(--green-400), var(--green-700))', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🌾</div>
          <span style={{ color: 'white', fontWeight: 800, fontSize: '1.2rem', fontFamily: 'Outfit, sans-serif' }}>AgriSmart</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/login')}>Sign In</button>
        </div>
      </nav>

      {/* ── Hero with Video ── */}
      <section style={{ position: 'relative', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {/* Video background */}
        <video
          autoPlay muted loop playsInline
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.1)' }}
          poster="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&q=80"
        >
          <source src="https://upload.wikimedia.org/wikipedia/commons/1/14/Drone_video_of_combine_harvester_and_tractor_on_a_field_in_J%C3%B5gevamaa%2C_Estonia_%28July_2022%29.webm" type="video/webm" />
        </video>

        {/* Overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(6,78,59,.92) 0%, rgba(0,0,0,.75) 60%, rgba(6,78,59,.6) 100%)'
        }} />

        {/* Animated background blobs */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute', borderRadius: '50%',
              background: `radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)`,
              width: `${400 + i * 200}px`, height: `${400 + i * 200}px`,
              top: `${10 + i * 20}%`, left: `${60 + i * 10}%`,
              animation: `float ${6 + i * 2}s ease-in-out infinite alternate`,
            }} />
          ))}
        </div>

        {/* Hero content */}
        <div style={{ position: 'relative', textAlign: 'center', padding: '0 24px', maxWidth: 860 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(16,185,129,.15)', border: '1px solid rgba(16,185,129,.3)',
            borderRadius: 99, padding: '6px 16px', marginBottom: 28,
            animation: 'fadeInDown .7s ease'
          }}>
            <Sprout size={15} color="var(--green-400)" />
            <span style={{ color: 'var(--green-300)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.5px' }}>Government of India – Digital Agriculture Mission</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.4rem, 5.5vw, 4rem)', fontWeight: 900, color: 'white',
            lineHeight: 1.15, fontFamily: 'Outfit, sans-serif',
            animation: 'fadeInUp .8s ease', animationFillMode: 'both', animationDelay: '.1s'
          }}>
            AI-Powered Smart<br />
            <span style={{ background: 'linear-gradient(90deg, var(--green-400), var(--green-300))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Agriculture Administration
            </span>
          </h1>

          <p style={{
            fontSize: '1.1rem', color: 'rgba(255,255,255,.7)', marginTop: 20, marginBottom: 40,
            lineHeight: 1.75, maxWidth: 640, margin: '20px auto 40px',
            animation: 'fadeInUp .8s ease', animationFillMode: 'both', animationDelay: '.2s'
          }}>
            Automating government workflows for faster, transparent and efficient farmer services.
            <br />AI verification, smart grievance management, and real-time analytics in one platform.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeInUp .8s ease', animationFillMode: 'both', animationDelay: '.3s' }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/schemes')}>
              <Sprout size={20} /> Apply for Scheme
            </button>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/subsidies')}>
              <Coins size={20} /> Subsidies
            </button>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/insurance')} style={{ background: '#3b82f6', borderColor: '#2563eb' }}>
              <Shield size={20} /> Insurance
            </button>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/grievance')} style={{ background: '#ef4444', borderColor: '#b91c1c' }}>
              <MessageSquareWarning size={20} /> Grievance
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/login')}>
              <PlayCircle size={20} /> Go to Dashboard
            </button>
          </div>


          {/* Floating badge */}
          <div style={{
            position: 'absolute', top: -60, right: -80,
            background: 'rgba(16,185,129,.12)', border: '1px solid rgba(16,185,129,.2)',
            borderRadius: 16, padding: '12px 16px', backdropFilter: 'blur(10px)',
            animation: 'float 4s ease-in-out infinite alternate',
          }}>
            <div style={{ color: 'var(--green-400)', fontWeight: 700, fontSize: '1.1rem' }}>98%</div>
            <div style={{ color: 'rgba(255,255,255,.5)', fontSize: '0.7rem' }}>Auto-verified</div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', animation: 'bounce 1.5s ease-in-out infinite', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 1, height: 50, background: 'linear-gradient(to bottom, transparent, var(--green-400))', borderRadius: 2 }} />
          <span style={{ color: 'rgba(255,255,255,.5)', fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Scroll</span>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section ref={el => addRef(el, 0)} className="reveal" style={{ background: 'linear-gradient(90deg, var(--green-900), var(--green-800))', padding: '32px 40px' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {STATS.map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--green-300)', fontFamily: 'Outfit, sans-serif' }}>{s.value}</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,.55)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section style={{ padding: '100px 40px', background: '#0f1a13' }}>
        <div className="container">
          <div ref={el => addRef(el, 1)} className="reveal" style={{ textAlign: 'center', marginBottom: 64 }}>
            <span style={{ background: 'rgba(16,185,129,.12)', color: 'var(--green-400)', padding: '5px 14px', borderRadius: 99, fontSize: '0.78rem', fontWeight: 700, border: '1px solid rgba(16,185,129,.2)', display: 'inline-block', marginBottom: 16, letterSpacing: '0.5px' }}>
              CORE CAPABILITIES
            </span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', fontFamily: 'Outfit, sans-serif', lineHeight: 1.2 }}>
              Everything You Need for<br />
              <span style={{ color: 'var(--green-400)' }}>Modern Agri Administration</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,.5)', marginTop: 16, fontSize: '1rem', maxWidth: 500, margin: '16px auto 0' }}>
              Powered by artificial intelligence and built for government efficiency
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {FEATURES.map((f, i) => (
              <div key={i} ref={el => addRef(el, 2 + i)} className="reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
                <div style={{
                  background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)',
                  borderRadius: 20, padding: 32, height: '100%',
                  transition: 'all .3s', cursor: 'pointer',
                  position: 'relative', overflow: 'hidden',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.07)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = `${f.color}40` }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.04)'; e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)' }}
                >
                  <div style={{ position: 'absolute', top: 0, right: 0, width: 120, height: 120, borderRadius: '50%', background: `radial-gradient(circle, ${f.color}15 0%, transparent 70%)` }} />
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: `${f.color}18`, border: `1px solid ${f.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, color: f.color }}>
                    <f.icon size={24} />
                  </div>
                  <h3 style={{ color: 'white', fontWeight: 700, fontSize: '1.05rem', marginBottom: 12, fontFamily: 'Outfit, sans-serif' }}>{f.title}</h3>
                  <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '0.875rem', lineHeight: 1.7 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it Works ── */}
      <section style={{ padding: '100px 40px', background: '#0a0a0a' }}>
        <div className="container">
          <div ref={el => addRef(el, 6)} className="reveal" style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'white', fontFamily: 'Outfit, sans-serif' }}>How It Works</h2>
            <p style={{ color: 'rgba(255,255,255,.5)', marginTop: 12 }}>Four simple steps from application to approval</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
            {[
              { step: '01', title: 'Submit Application', desc: 'Farmer fills the form and uploads documents online', icon: <FileText size={32} color="var(--green-500)" /> },
              { step: '02', title: 'AI Verification', desc: 'OCR extracts data and AI cross-checks for authenticity', icon: <Bot size={32} color="#3b82f6" /> },
              { step: '03', title: 'Officer Review', desc: 'Officer reviews AI-flagged cases and takes action', icon: <UserCheck size={32} color="#f59e0b" /> },
              { step: '04', title: 'Approval & Disbursal', desc: 'Approved benefits directly credited to farmer account', icon: <CheckCircle2 size={32} color="#10b981" /> },
            ].map((step, i) => (
              <div key={i} ref={el => addRef(el, 7 + i)} className="reveal" style={{ transitionDelay: `${i * 0.12}s`, textAlign: 'center', padding: '32px 20px' }}>
                <div style={{ width: 70, height: 70, borderRadius: '50%', background: 'rgba(16,185,129,.08)', border: '2px solid rgba(16,185,129,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  {step.icon}
                </div>
                <div style={{ color: 'var(--green-500)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8 }}>Step {step.step}</div>
                <h3 style={{ color: 'white', fontSize: '1.05rem', fontWeight: 700, marginBottom: 10, fontFamily: 'Outfit, sans-serif' }}>{step.title}</h3>
                <p style={{ color: 'rgba(255,255,255,.45)', fontSize: '0.85rem', lineHeight: 1.65 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section ref={el => addRef(el, 11)} className="reveal" style={{ padding: '80px 40px', background: 'linear-gradient(135deg, var(--green-900) 0%, #1a2e20 100%)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'white', fontFamily: 'Outfit, sans-serif', marginBottom: 16 }}>
            Ready to Transform Agriculture Administration?
          </h2>
          <p style={{ color: 'rgba(255,255,255,.6)', marginBottom: 40, fontSize: '1rem', maxWidth: 520, margin: '0 auto 40px' }}>
            Join thousands of farmers and officers already using AgriSmart for faster, transparent service delivery.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/schemes')}>
              <Sprout size={20} /> Start Your Application
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/login')}>
              Officer Login <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: '#050505', padding: '28px 40px', borderTop: '1px solid rgba(255,255,255,.06)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ color: 'white' }}><Sprout size={20} /></div>
            <span style={{ color: 'rgba(255,255,255,.4)', fontSize: '0.85rem' }}>AgriSmart Admin © 2026 | Government of India</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,.2)' }}>AI-Powered Digital Agriculture Mission</span>
        </div>
      </footer>

      <style>{`
        @keyframes float { 0% { transform: translateY(0); } 100% { transform: translateY(-15px); } }
        @keyframes bounce { 0%, 100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(-8px); } }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 640px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  )
}
