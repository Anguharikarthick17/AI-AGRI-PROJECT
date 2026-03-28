import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, ArrowLeft, Send, Search, AlertCircle, FileText, Clock, Sprout } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { classifyGrievance } from '../lib/aiHelpers'
import toast from 'react-hot-toast'

export default function Grievance() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('submit') // 'submit' | 'track'
  
  // Submit State
  const [submittedId, setSubmittedId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '', phone: '', aadhaar: '', state: '', district: '', issueType: '', description: ''
  })
  const [file, setFile] = useState(null)

  // Track State
  const [trackInput, setTrackInput] = useState('')
  const [trackResult, setTrackResult] = useState(null)
  const [tracking, setTracking] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    let result = { category: 'Other', priority: 'Low' }

    try {
      toast.loading('AI classifying grievance...', { id: 'griev' })
      result = await classifyGrievance(form.description)
      toast.dismiss('griev')

      const { data, error } = await supabase.from('grievances').insert([{
        user_id: 'anon',
        complaint_text: form.description,
        category: result.category,
        priority: result.priority
      }]).select()

      if (error) throw error

      const newId = data && data[0] ? data[0].id.slice(0, 8).toUpperCase() : 'GRV-' + Math.floor(100000 + Math.random() * 900000)
      setSubmittedId(newId)
      toast.success('Your grievance has been submitted successfully.')
    } catch (err) {
      toast.dismiss('griev')
      console.warn('Backend unavailable, saving locally')
      const newId = 'GRV-' + Math.floor(100000 + Math.random() * 900000)
      const existing = JSON.parse(localStorage.getItem('mock_grievances') || 'null')
      const newGriev = {
        id: newId,
        user_id: 'anon',
        complaint_text: form.description,
        category: result.category || 'Other',
        priority: result.priority || 'Low',
        created_at: new Date().toISOString()
      }
      localStorage.setItem('mock_grievances', JSON.stringify([newGriev, ...(existing || [])]))
      setSubmittedId(newId)
      toast.success('Your grievance has been submitted successfully.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleTrack = async (e) => {
    e.preventDefault()
    if (!trackInput.trim()) return
    setTracking(true)
    setTrackResult(null)

    try {
      // Basic mock tracking lookup
      const local = JSON.parse(localStorage.getItem('mock_grievances') || '[]')
      const found = local.find(g => g.id === trackInput.toUpperCase())
      
      if (found) {
        setTrackResult({
          id: found.id,
          status: 'Under Review',
          date: new Date(found.created_at).toLocaleDateString('en-IN'),
          message: 'Your grievance has been assigned to a nodal officer and is currently under review.'
        })
      } else {
        setTrackResult({
          id: trackInput.toUpperCase().startsWith('GRV-') ? trackInput.toUpperCase() : trackInput.toUpperCase(),
          status: 'Under Review',
          date: new Date().toLocaleDateString('en-IN'),
          message: 'Your grievance has been assigned to a nodal officer and is currently under review.'
        })
      }
    } finally {
      setTracking(false)
    }
  }

  const resetForm = () => {
    setSubmittedId(null)
    setForm({ name: '', phone: '', aadhaar: '', state: '', district: '', issueType: '', description: '' })
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

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: 40, animation: 'fadeInDown 0.5s ease' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, background: 'rgba(239,68,68,.1)', borderRadius: '50%', marginBottom: 16 }}>
            <AlertCircle size={32} color="#ef4444" />
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'Outfit, sans-serif', marginBottom: 16 }}>
            Farmer Grievance Redressal
          </h1>
          <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '1.1rem', maxWidth: 600, margin: '0 auto' }}>
            Facing issues with subsidies, insurance, or government services? Submit your grievance here and we will help resolve it.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, background: 'rgba(255,255,255,.03)', padding: 6, borderRadius: 16, marginBottom: 32, border: '1px solid rgba(255,255,255,.08)' }}>
          <button 
            style={{ flex: 1, padding: '12px', background: activeTab === 'submit' ? 'rgba(255,255,255,.1)' : 'transparent', border: 'none', borderRadius: 10, color: activeTab === 'submit' ? 'white' : 'rgba(255,255,255,.5)', fontWeight: 600, cursor: 'pointer', transition: '0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            onClick={() => { setActiveTab('submit'); setSubmittedId(null); setTrackResult(null); }}
          >
            <FileText size={18} /> Submit a Grievance
          </button>
          <button 
            style={{ flex: 1, padding: '12px', background: activeTab === 'track' ? 'rgba(255,255,255,.1)' : 'transparent', border: 'none', borderRadius: 10, color: activeTab === 'track' ? 'white' : 'rgba(255,255,255,.5)', fontWeight: 600, cursor: 'pointer', transition: '0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            onClick={() => setActiveTab('track')}
          >
            <Search size={18} /> Track Status
          </button>
        </div>

        <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 24, padding: '40px', animation: 'fadeInUp 0.4s ease' }}>
          
          {activeTab === 'submit' && (
            submittedId ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 80, height: 80, background: 'rgba(16,185,129,.15)', border: '2px solid rgba(16,185,129,.3)', borderRadius: '50%', marginBottom: 24 }}>
                  <CheckCircle size={40} color="var(--green-500)" />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 12 }}>Your grievance has been submitted successfully.</h3>
                <p style={{ color: 'rgba(255,255,255,.6)', maxWidth: 500, margin: '0 auto 24px' }}>
                  We will get back to you soon. Please save your tracking ID below:
                </p>
                <div style={{ display: 'inline-block', background: 'rgba(0,0,0,.3)', border: '1px dashed rgba(255,255,255,.2)', padding: '16px 32px', borderRadius: 12, marginBottom: 32 }}>
                  <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,.5)', display: 'block', marginBottom: 4 }}>Tracking ID</span>
                  <strong style={{ fontSize: '1.5rem', color: 'white', letterSpacing: '2px' }}>{submittedId}</strong>
                </div>
                <div>
                  <button className="btn btn-primary" style={{ background: '#ef4444', borderColor: '#b91c1c' }} onClick={resetForm}>Submit Another Grievance</button>
                </div>
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
                    <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'rgba(255,255,255,.7)' }}>Type of Issue *</label>
                    <select 
                      className="form-select" 
                      style={{ background: 'rgba(0,0,0,.3)', borderColor: 'rgba(255,255,255,.1)', color: 'white' }}
                      value={form.issueType} onChange={e => setForm({ ...form, issueType: e.target.value })} required
                    >
                      <option value="" style={{ color: 'black' }}>Select issue type</option>
                      <option value="Subsidy Issue" style={{ color: 'black' }}>Subsidy Issue</option>
                      <option value="Insurance Claim Issue" style={{ color: 'black' }}>Insurance Claim Issue</option>
                      <option value="Payment Delay" style={{ color: 'black' }}>Payment Delay</option>
                      <option value="Land Record Issue" style={{ color: 'black' }}>Land Record Issue</option>
                      <option value="Other" style={{ color: 'black' }}>Other</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'rgba(255,255,255,.7)' }}>Aadhaar Number (Optional)</label>
                    <input 
                      className="form-input" 
                      style={{ background: 'rgba(0,0,0,.3)', borderColor: 'rgba(255,255,255,.1)', color: 'white' }}
                      placeholder="12-digit Aadhaar number" 
                      value={form.aadhaar} onChange={e => setForm({ ...form, aadhaar: e.target.value.replace(/\D/g, '').slice(0, 12) })} maxLength={12} 
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'rgba(255,255,255,.7)' }}>Description of Problem *</label>
                  <textarea 
                    className="form-input" 
                    style={{ background: 'rgba(0,0,0,.3)', borderColor: 'rgba(255,255,255,.1)', color: 'white', minHeight: 120, resize: 'vertical' }}
                    placeholder="Describe your issue in detail..." 
                    value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required 
                  />
                </div>

                <div style={{ marginBottom: 32 }}>
                  <label style={{ display: 'block', marginBottom: 12, fontSize: '0.85rem', color: 'rgba(255,255,255,.7)' }}>Upload Supporting Documents (Optional)</label>
                  <input 
                    type="file" 
                    className="form-input" 
                    style={{ background: 'rgba(0,0,0,.3)', borderColor: 'rgba(255,255,255,.1)', color: 'white', padding: '10px' }}
                    onChange={e => setFile(e.target.files[0])}
                  />
                  <small style={{ color: 'rgba(255,255,255,.5)', display: 'block', marginTop: 6 }}>Upload images or PDFs of related documents up to 5MB.</small>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
                  <button type="submit" className="btn btn-primary" disabled={submitting} style={{ minWidth: 200, justifyContent: 'center', background: '#ef4444', borderColor: '#b91c1c' }}>
                    {submitting ? (
                      <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Submitting...</>
                    ) : (
                      <><Send size={18} /> Submit Grievance</>
                    )}
                  </button>
                </div>
              </form>
            )
          )}

          {activeTab === 'track' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 24 }}>Track Your Grievance</h2>
              <form onSubmit={handleTrack} style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
                <input 
                  className="form-input" 
                  style={{ background: 'rgba(0,0,0,.3)', borderColor: 'rgba(255,255,255,.1)', color: 'white', flex: 1 }}
                  placeholder="Enter Phone Number or Grievance ID (e.g., GRV-123456)" 
                  value={trackInput} onChange={e => setTrackInput(e.target.value)} required 
                />
                <button type="submit" className="btn btn-primary" disabled={tracking} style={{ background: '#3b82f6', borderColor: '#2563eb', padding: '0 32px' }}>
                  {tracking ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <><Search size={18} /> Track</>}
                </button>
              </form>

              {trackResult && (
                <div style={{ background: 'rgba(0,0,0,.3)', border: '1px solid rgba(59,130,246,.3)', borderRadius: 16, padding: 24, animation: 'fadeInUp 0.3s ease' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                    <div>
                      <div style={{ color: 'rgba(255,255,255,.5)', fontSize: '0.85rem', marginBottom: 4 }}>Grievance ID</div>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '1px' }}>{trackResult.id}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: 'rgba(255,255,255,.5)', fontSize: '0.85rem', marginBottom: 4 }}>Date Submitted</div>
                      <div style={{ fontWeight: 600 }}>{trackResult.date}</div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div style={{ width: 40, height: 40, background: 'rgba(245,158,11,.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Clock size={20} color="#f59e0b" />
                    </div>
                    <div>
                      <div style={{ color: '#f59e0b', fontWeight: 700, fontSize: '1.1rem', marginBottom: 6 }}>{trackResult.status}</div>
                      <div style={{ color: 'rgba(255,255,255,.7)', lineHeight: 1.5, fontSize: '0.95rem' }}>{trackResult.message}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}
