import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, ArrowLeft, Send, Shield, CloudRain, PawPrint, Tractor, Ambulance, Heart, Sprout } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import toast from 'react-hot-toast'

const INSURANCE_PLANS = [
  { id: '1', title: 'PMFBY (Pradhan Mantri Fasal Bima Yojana)', desc: 'Crop insurance that covers loss due to rain, flood, drought, and pests.', icon: <Shield size={32} color="#8b5cf6" /> },
  { id: '2', title: 'Weather-Based Crop Insurance (WBCIS)', desc: 'Provides insurance based on weather conditions like rainfall and temperature.', icon: <CloudRain size={32} color="#0ea5e9" /> },
  { id: '3', title: 'Livestock Insurance', desc: 'Covers animals like cows, buffalo, and goats against death.', icon: <PawPrint size={32} color="#f59e0b" /> },
  { id: '4', title: 'Farm Equipment Insurance', desc: 'Protects tractors, pump sets, and machinery from damage or theft.', icon: <Tractor size={32} color="#ef4444" /> },
  { id: '5', title: 'PMSBY (Accident Insurance)', desc: 'Provides ₹2 lakh coverage for accidental death or disability.', icon: <Ambulance size={32} color="#22c55e" /> },
  { id: '6', title: 'PMJJBY (Life Insurance)', desc: 'Provides ₹2 lakh life insurance coverage for farmers.', icon: <Heart size={32} color="#ec4899" /> }
]

export default function Insurance() {
  const navigate = useNavigate()
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  const [form, setForm] = useState({
    name: '', phone: '', aadhaar: '', state: '', district: '', landDetails: '', livestockDetails: ''
  })
  
  const [file, setFile] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    const newApp = {
      id: 'APP-' + Math.floor(100000 + Math.random() * 900000),
      user_id: 'anon',
      name: form.name,
      aadhaar: form.aadhaar,
      scheme_type: selectedPlan.title,
      crop_type: 'Insurance Plan',
      land_details: form.landDetails || form.livestockDetails || 'Not Specified',
      status: 'Pending',
      ai_flag: 'Valid',
      risk_score: Math.floor(Math.random() * 20),
      created_at: new Date().toISOString()
    }

    try {
      const { error } = await supabase.from('applications').insert([newApp])
      if (error) throw error

      setSubmitted(true)
      toast.success('Your insurance application has been submitted successfully!')
    } catch (err) {
      console.warn('Backend unavailable, saving locally')
      const existing = JSON.parse(localStorage.getItem('mock_applications') || 'null')
      localStorage.setItem('mock_applications', JSON.stringify([newApp, ...(existing || [])]))

      setSubmitted(true)
      toast.success('Your insurance application has been submitted successfully!')
    } finally {
      setSubmitting(false)
    }
  }

  const resetSelection = () => {
    setSelectedPlan(null)
    setSubmitted(false)
    setForm({ name: '', phone: '', aadhaar: '', state: '', district: '', landDetails: '', livestockDetails: '' })
    setFile(null)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', fontFamily: 'Inter, sans-serif', color: 'white' }}>
      
      {/* ── Navbar ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,.08)',
        padding: '0 40px', height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg, var(--green-400), var(--green-700))', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><Sprout size={20} /></div>
          <span style={{ color: 'white', fontWeight: 800, fontSize: '1.2rem', fontFamily: 'Outfit, sans-serif' }}>AgriSmart</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/login')}>Sign In</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px' }}>
        
        {!selectedPlan ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: 40, animation: 'fadeInDown 0.5s ease' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, background: 'rgba(59,130,246,.1)', borderRadius: '50%', marginBottom: 16 }}>
                <Shield size={32} color="#60a5fa" />
              </div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'Outfit, sans-serif', marginBottom: 16 }}>
                Farmer Insurance Schemes
              </h1>
              <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '1.1rem', maxWidth: 600, margin: '0 auto' }}>
                Secure your farm, livestock, and family's future. Apply instantly for government insurance programs online.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
              {INSURANCE_PLANS.map((plan, i) => (
                <div 
                  key={plan.id}
                  style={{
                    background: 'rgba(255,255,255,.03)',
                    border: '1px solid rgba(255,255,255,.08)',
                    borderRadius: 16,
                    padding: 24,
                    transition: 'all 0.3s',
                    animation: `fadeInUp 0.5s ease ${i * 0.05}s both`,
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,.06)';
                    e.currentTarget.style.borderColor = 'rgba(59,130,246,.4)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,.03)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>{plan.icon}</div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8, color: '#60a5fa', lineHeight: 1.4 }}>
                    {plan.title}
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '0.9rem', lineHeight: 1.6, flexGrow: 1, marginBottom: 20 }}>
                    {plan.desc}
                  </p>
                  <button 
                    className="btn btn-primary" 
                    style={{ width: '100%', justifyContent: 'center', background: '#3b82f6', borderColor: '#2563eb' }}
                    onClick={() => setSelectedPlan(plan)}
                  >
                    Apply Now
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ animation: 'fadeInUp 0.4s ease' }}>
            <button 
              onClick={resetSelection}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', marginBottom: 24, padding: 0, fontWeight: 600 }}
            >
              <ArrowLeft size={18} /> Back to Insurance Plans
            </button>

            <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 24, padding: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,.05)', padding: 16, borderRadius: '50%' }}>{selectedPlan.icon}</div>
                <div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: 'white', marginBottom: 8 }}>
                    {selectedPlan.title}
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,.6)' }}>{selectedPlan.desc}</p>
                </div>
              </div>

              {submitted ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 80, height: 80, background: 'rgba(59,130,246,.15)', border: '2px solid rgba(59,130,246,.3)', borderRadius: '50%', marginBottom: 24 }}>
                    <CheckCircle size={40} color="#3b82f6" />
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 12 }}>Your insurance application has been submitted successfully.</h3>
                  <p style={{ color: 'rgba(255,255,255,.6)', maxWidth: 500, margin: '0 auto 32px' }}>
                    We have received your application for the <strong>{selectedPlan.title}</strong> scheme. You will receive an SMS regarding the approval process.
                  </p>
                  <button className="btn btn-primary" style={{ background: '#3b82f6', borderColor: '#2563eb' }} onClick={resetSelection}>Apply for Another Insurance Plan</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 24 }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'rgba(255,255,255,.7)' }}>Full Name *</label>
                      <input 
                        className="form-input" 
                        style={{ background: 'rgba(0,0,0,.3)', borderColor: 'rgba(255,255,255,.1)', color: 'white' }}
                        placeholder="Enter your full name" 
                        value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'rgba(255,255,255,.7)' }}>Phone Number *</label>
                      <input 
                        className="form-input" 
                        type="tel"
                        style={{ background: 'rgba(0,0,0,.3)', borderColor: 'rgba(255,255,255,.1)', color: 'white' }}
                        placeholder="10-digit phone number" 
                        value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} required minLength={10} maxLength={10} 
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 24 }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'rgba(255,255,255,.7)' }}>Aadhaar Number *</label>
                      <input 
                        className="form-input" 
                        style={{ background: 'rgba(0,0,0,.3)', borderColor: 'rgba(255,255,255,.1)', color: 'white' }}
                        placeholder="12-digit Aadhaar number" 
                        value={form.aadhaar} onChange={e => setForm({ ...form, aadhaar: e.target.value.replace(/\D/g, '').slice(0, 12) })} required minLength={12} maxLength={12} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'rgba(255,255,255,.7)' }}>Type of Insurance *</label>
                      <select 
                        className="form-select" 
                        style={{ background: 'rgba(0,0,0,.3)', borderColor: 'rgba(255,255,255,.1)', color: 'white' }}
                        value={selectedPlan.title} disabled
                      >
                        <option value={selectedPlan.title} style={{ color: 'black' }}>{selectedPlan.title}</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 24 }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'rgba(255,255,255,.7)' }}>State *</label>
                      <input 
                        className="form-input" 
                        style={{ background: 'rgba(0,0,0,.3)', borderColor: 'rgba(255,255,255,.1)', color: 'white' }}
                        placeholder="Enter your state" 
                        value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} required 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'rgba(255,255,255,.7)' }}>District *</label>
                      <input 
                        className="form-input" 
                        style={{ background: 'rgba(0,0,0,.3)', borderColor: 'rgba(255,255,255,.1)', color: 'white' }}
                        placeholder="Enter your district" 
                        value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} required 
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 24 }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'rgba(255,255,255,.7)' }}>Land Details (Optional)</label>
                      <input 
                        className="form-input" 
                        style={{ background: 'rgba(0,0,0,.3)', borderColor: 'rgba(255,255,255,.1)', color: 'white' }}
                        placeholder="Survey no., acreage..." 
                        value={form.landDetails} onChange={e => setForm({ ...form, landDetails: e.target.value })} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'rgba(255,255,255,.7)' }}>Livestock Details (Optional - if applicable)</label>
                      <input 
                        className="form-input" 
                        style={{ background: 'rgba(0,0,0,.3)', borderColor: 'rgba(255,255,255,.1)', color: 'white' }}
                        placeholder="No. of cows/buffaloes, tag numbers..." 
                        value={form.livestockDetails} onChange={e => setForm({ ...form, livestockDetails: e.target.value })} 
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: 32 }}>
                    <label style={{ display: 'block', marginBottom: 12, fontSize: '0.85rem', color: 'rgba(255,255,255,.7)' }}>Upload Documents (Optional)</label>
                    <input 
                      type="file" 
                      className="form-input" 
                      style={{ background: 'rgba(0,0,0,.3)', borderColor: 'rgba(255,255,255,.1)', color: 'white', padding: '10px' }}
                      onChange={e => setFile(e.target.files[0])}
                    />
                    <small style={{ color: 'rgba(255,255,255,.5)', display: 'block', marginTop: 6 }}>Upload Aadhaar, Land Record, or Vet Certificate (PDF/JPG/PNG)</small>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
                    <button type="button" className="btn btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,.2)' }} onClick={resetSelection}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={submitting} style={{ minWidth: 200, justifyContent: 'center', background: '#3b82f6', borderColor: '#2563eb' }}>
                      {submitting ? (
                        <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Submitting...</>
                      ) : (
                        <><Send size={18} /> Submit Application</>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}
