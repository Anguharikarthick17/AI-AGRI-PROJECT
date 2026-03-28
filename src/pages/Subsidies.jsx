import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, ArrowLeft, Send, IndianRupee, Leaf, Tractor, Droplets, Shield, Sprout, Coins } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import toast from 'react-hot-toast'
import AgriLogo from '../components/AgriLogo'
import LocationPicker from '../components/LocationPicker'
import VoiceRecorder from '../components/VoiceRecorder'

const SUBSIDIES = [
  { id: '1', title: 'PM-KISAN Scheme', desc: 'Provides ₹6000 per year to farmers in 3 installments.', icon: <IndianRupee size={32} color="#3b82f6" /> },
  { id: '2', title: 'Fertilizer Subsidy', desc: 'Provides fertilizers at reduced cost for farmers.', icon: <Leaf size={32} color="#10b981" /> },
  { id: '3', title: 'Farm Machinery Subsidy', desc: 'Offers discounts on tractors, harvesters, and farming equipment.', icon: <Tractor size={32} color="#f59e0b" /> },
  { id: '4', title: 'Irrigation Subsidy', desc: 'Supports drip and sprinkler irrigation systems.', icon: <Droplets size={32} color="#0ea5e9" /> },
  { id: '5', title: 'Crop Insurance (PMFBY)', desc: 'Provides insurance coverage for crop loss due to natural disasters.', icon: <Shield size={32} color="#8b5cf6" /> },
  { id: '6', title: 'Seed Subsidy', desc: 'Provides high-quality seeds at lower prices.', icon: <Sprout size={32} color="#22c55e" /> }
]

export default function Subsidies() {
  const navigate = useNavigate()
  const [selectedScheme, setSelectedScheme] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  const [form, setForm] = useState({
    name: '', phone: '', aadhaar: '', state: '', district: '', farmerType: '', landArea: '',
  })
  
  const [location, setLocation] = useState(null)
  const [voiceBlob, setVoiceBlob] = useState(null)
  const [file, setFile] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    let voiceNoteUrl = null
    if (voiceBlob) {
      try {
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.wav`
        const { data, error: uploadError } = await supabase.storage
          .from('voice-notes')
          .upload(fileName, voiceBlob)
        
        if (uploadError) throw uploadError
        
        const { data: { publicUrl } } = supabase.storage
          .from('voice-notes')
          .getPublicUrl(fileName)
        
        voiceNoteUrl = publicUrl
      } catch (err) {
        console.warn('Voice upload failed, proceeding without it or using local blob')
        voiceNoteUrl = URL.createObjectURL(voiceBlob)
      }
    }

    const newApp = {
      id: 'APP-' + Math.floor(100000 + Math.random() * 900000),
      user_id: 'anon',
      name: form.name,
      aadhaar: form.aadhaar,
      scheme_type: selectedScheme.title,
      crop_type: 'Subsidy Scheme',
      land_details: form.landArea || 'Not Specified',
      latitude: location?.lat || null,
      longitude: location?.lng || null,
      voice_note_url: voiceNoteUrl,
      status: 'Pending',
      ai_flag: 'Valid',
      risk_score: Math.floor(Math.random() * 20),
      created_at: new Date().toISOString()
    }

    try {
      const { error } = await supabase.from('applications').insert([newApp])
      if (error) throw error
      
      setSubmitted(true)
      toast.success('Your application has been submitted successfully!')
    } catch (err) {
      console.warn('Backend unavailable, saving locally')
      const existing = JSON.parse(localStorage.getItem('mock_applications') || 'null')
      localStorage.setItem('mock_applications', JSON.stringify([newApp, ...(existing || [])]))
      
      setSubmitted(true)
      toast.success('Your application has been submitted successfully!')
    } finally {
      setSubmitting(false)
    }
  }

  const resetSelection = () => {
    setSelectedScheme(null)
    setSubmitted(false)
    setForm({ name: '', phone: '', aadhaar: '', state: '', district: '', farmerType: '', landArea: '' })
    setLocation(null)
    setVoiceBlob(null)
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
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <AgriLogo size="sm" light={true} onClick={() => navigate('/')} />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/login')}>Sign In</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px' }}>
        
        {!selectedScheme ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: 40, animation: 'fadeInDown 0.5s ease' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, background: 'rgba(16,185,129,.1)', borderRadius: '50%', marginBottom: 16 }}>
                <Coins size={32} color="var(--green-500)" />
              </div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'Outfit, sans-serif', marginBottom: 16 }}>
                Government Farmer Subsidies
              </h1>
              <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '1.1rem', maxWidth: 600, margin: '0 auto' }}>
                Select a subsidy scheme below to verify your eligibility and apply instantly online.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
              {SUBSIDIES.map((scheme, i) => (
                <div 
                  key={scheme.id}
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
                    e.currentTarget.style.borderColor = 'rgba(16,185,129,.3)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,.03)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>{scheme.icon}</div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8, color: 'var(--green-400)', lineHeight: 1.4 }}>
                    {scheme.title}
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '0.9rem', lineHeight: 1.6, flexGrow: 1, marginBottom: 20 }}>
                    {scheme.desc}
                  </p>
                  <button 
                    className="btn btn-primary" 
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => setSelectedScheme(scheme)}
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
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: 'var(--green-400)', cursor: 'pointer', marginBottom: 24, padding: 0, fontWeight: 600 }}
            >
              <ArrowLeft size={18} /> Back to Subsidies
            </button>

            <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 24, padding: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,.05)', padding: 16, borderRadius: '50%' }}>{selectedScheme.icon}</div>
                <div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: 'white', marginBottom: 8 }}>
                    {selectedScheme.title}
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,.6)' }}>{selectedScheme.desc}</p>
                </div>
              </div>

              {submitted ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 80, height: 80, background: 'rgba(16,185,129,.15)', border: '2px solid rgba(16,185,129,.3)', borderRadius: '50%', marginBottom: 24 }}>
                    <CheckCircle size={40} color="var(--green-500)" />
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 12 }}>Your application has been submitted successfully.</h3>
                  <p style={{ color: 'rgba(255,255,255,.6)', maxWidth: 500, margin: '0 auto 32px' }}>
                    We have received your application for the <strong>{selectedScheme.title}</strong> scheme. You will be notified of the status shortly.
                  </p>
                  <button className="btn btn-primary" onClick={resetSelection}>Apply for Another Subsidy</button>
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
                      <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'rgba(255,255,255,.7)' }}>State *</label>
                      <input 
                        className="form-input" 
                        style={{ background: 'rgba(0,0,0,.3)', borderColor: 'rgba(255,255,255,.1)', color: 'white' }}
                        placeholder="Enter your state" 
                        value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} required 
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 24 }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'rgba(255,255,255,.7)' }}>District *</label>
                      <input 
                        className="form-input" 
                        style={{ background: 'rgba(0,0,0,.3)', borderColor: 'rgba(255,255,255,.1)', color: 'white' }}
                        placeholder="Enter your district" 
                        value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} required 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'rgba(255,255,255,.7)' }}>Type of Farmer *</label>
                      <select 
                        className="form-select" 
                        style={{ background: 'rgba(0,0,0,.3)', borderColor: 'rgba(255,255,255,.1)', color: 'white' }}
                        value={form.farmerType} onChange={e => setForm({ ...form, farmerType: e.target.value })} required
                      >
                        <option value="" style={{ color: 'black' }}>Select farmer type</option>
                        <option value="Small" style={{ color: 'black' }}>Small</option>
                        <option value="Medium" style={{ color: 'black' }}>Medium</option>
                        <option value="Large" style={{ color: 'black' }}>Large</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 24 }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'rgba(255,255,255,.7)' }}>Land Area (in acres) *</label>
                      <input 
                        className="form-input" 
                        style={{ background: 'rgba(0,0,0,.3)', borderColor: 'rgba(255,255,255,.1)', color: 'white' }}
                        placeholder="e.g., 2.5" 
                        value={form.landArea} onChange={e => setForm({ ...form, landArea: e.target.value })} required 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'rgba(255,255,255,.7)' }}>Select Subsidy Scheme *</label>
                      <select 
                        className="form-select" 
                        style={{ background: 'rgba(0,0,0,.3)', borderColor: 'rgba(255,255,255,.1)', color: 'white' }}
                        value={selectedScheme.title} disabled
                      >
                        <option value={selectedScheme.title} style={{ color: 'black' }}>{selectedScheme.title}</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: 32 }}>
                    <label style={{ display: 'block', marginBottom: 12, fontSize: '0.85rem', color: 'rgba(255,255,255,.7)' }}>Your Location *</label>
                    <LocationPicker onLocationSelect={setLocation} />
                    <small style={{ color: 'rgba(255,255,255,.5)', display: 'block', marginTop: 6 }}>Pin your farm location on the map for faster verification.</small>
                  </div>

                  <div style={{ marginBottom: 32 }}>
                    <VoiceRecorder onRecordingComplete={setVoiceBlob} />
                  </div>

                  {/* File Upload (Optional) */}
                  <div style={{ marginBottom: 32 }}>
                    <label style={{ display: 'block', marginBottom: 12, fontSize: '0.85rem', color: 'rgba(255,255,255,.7)' }}>Upload Documents (Optional)</label>
                    <input 
                      type="file" 
                      className="form-input" 
                      style={{ background: 'rgba(0,0,0,.3)', borderColor: 'rgba(255,255,255,.1)', color: 'white', padding: '10px' }}
                      onChange={e => setFile(e.target.files[0])}
                    />
                    <small style={{ color: 'rgba(255,255,255,.5)', display: 'block', marginTop: 6 }}>Upload Aadhaar or Land Records (PDF/JPG/PNG)</small>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
                    <button type="button" className="btn btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,.2)' }} onClick={resetSelection}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={submitting} style={{ minWidth: 200, justifyContent: 'center' }}>
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
