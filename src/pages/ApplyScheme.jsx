import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { runOCR, verifyDocument, checkDuplicateAadhaar } from '../lib/aiHelpers'
import toast from 'react-hot-toast'
import { Upload, CheckCircle, XCircle, AlertTriangle, Send, FileText, ArrowLeft, Leaf, LayoutGrid } from 'lucide-react'

const SCHEMES = [
  { id: '1', name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)', desc: 'Financial benefit of ₹6,000 per year to eligible farmer families.', icon: '💸' },
  { id: '2', name: 'PMFBY (Pradhan Mantri Fasal Bima Yojana)', desc: 'Insurance coverage and financial support to farmers in the event of crop failure.', icon: '🛡️' },
  { id: '3', name: 'Kisan Credit Card (KCC)', desc: 'Timely and adequate credit to farmers for their cultivation needs.', icon: '💳' },
  { id: '4', name: 'Paramparagat Krishi Vikas Yojana (PKVY)', desc: 'Promotes organic farming through cluster approach and PGS certification.', icon: '🌿' },
  { id: '5', name: 'Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)', desc: 'Enhancing physical access of water on farm and expanding cultivable area under assured irrigation.', icon: '💧' },
  { id: '6', name: 'e-NAM (National Agriculture Market)', desc: 'Pan-India electronic trading portal networking existing APMC mandis.', icon: '📱' },
  { id: '7', name: 'Soil Health Card Scheme (SHC)', desc: 'Provides soil nutrient status and recommendations to improve productivity.', icon: '🧪' },
  { id: '8', name: 'Rashtriya Krishi Vikas Yojana (RKVY)', desc: 'Incentivize states to draw up comprehensive agriculture development plans.', icon: '📈' },
  { id: '9', name: 'National Mission for Sustainable Agriculture (NMSA)', desc: 'Enhancing agricultural productivity focusing on integrated farming, water use efficiency, and soil health.', icon: '🌱' },
  { id: '10', name: 'Mission for Integrated Development of Horticulture (MIDH)', desc: 'Holistic growth of the horticulture sector including bamboo and coconut.', icon: '🍎' }
]

const CROPS = ['Wheat', 'Rice', 'Cotton', 'Sugarcane', 'Maize', 'Pulses', 'Oilseeds', 'Vegetables', 'Fruits', 'Other']

export default function ApplyScheme() {
  const navigate = useNavigate()
  const [selectedScheme, setSelectedScheme] = useState(null)
  
  const [form, setForm] = useState({ name: '', aadhaar: '', land_details: '', crop_type: '' })
  const [file, setFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [verifyResult, setVerifyResult] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const fileRef = useRef()

  const handleFileChange = (f) => {
    if (!f) return
    setFile(f)
    if (f.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = e => setFilePreview(e.target.result)
      reader.readAsDataURL(f)
    } else {
      setFilePreview(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) { toast.error('Please upload a document'); return }
    setSubmitting(true)
    setVerifyResult(null)

    try {
      toast.loading('Running OCR verification...', { id: 'ocr' })
      const ocrText = await runOCR(file)
      toast.dismiss('ocr')

      toast.loading('AI verification running...', { id: 'verify' })
      
      const formPayload = { ...form, scheme_type: selectedScheme.name }
      const isDuplicate = await checkDuplicateAadhaar(form.aadhaar, supabase)
      const { aiFlag, riskScore, flags } = verifyDocument(ocrText, formPayload)
      const finalRisk = isDuplicate ? Math.min(riskScore + 30, 100) : riskScore
      const finalFlag = isDuplicate ? 'Suspicious' : aiFlag
      toast.dismiss('verify')

      if (isDuplicate) flags.push('Duplicate Aadhaar detected (+30 risk score)')

      const payload = {
        name: form.name, aadhaar: form.aadhaar,
        land_details: form.land_details, crop_type: form.crop_type,
        scheme_type: formPayload.scheme_type, status: 'Pending',
        ai_flag: finalFlag, risk_score: finalRisk,
      }

      try {
        await supabase.from('applications').insert([payload])
      } catch { /* offline mode fallback */ }

      setVerifyResult({ aiFlag: finalFlag, riskScore: finalRisk, flags, ocrText })
      setSubmitted(true)
      
      if (finalFlag === 'Valid') {
        toast.success('Application submitted and verified successfully!')
      } else {
        toast.success('Application submitted (flagged for officer review)')
      }
    } catch (err) {
      toast.error('Error submitting application')
      console.error(err)
    }
    setSubmitting(false)
  }

  const resetSelection = () => {
    setSelectedScheme(null)
    setForm({ name: '', aadhaar: '', land_details: '', crop_type: '' })
    setFile(null)
    setFilePreview(null)
    setVerifyResult(null)
    setSubmitted(false)
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
          <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg, var(--green-400), var(--green-700))', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🌾</div>
          <span style={{ color: 'white', fontWeight: 800, fontSize: '1.2rem', fontFamily: 'Outfit, sans-serif' }}>AgriSmart</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/login')}>Officer Login</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px' }}>
        
        {!selectedScheme ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: 40, animation: 'fadeInDown 0.5s ease' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, background: 'rgba(16,185,129,.1)', borderRadius: '50%', marginBottom: 16 }}>
                <LayoutGrid size={32} color="var(--green-400)" />
              </div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'Outfit, sans-serif', marginBottom: 16 }}>
                Government Agriculture Schemes
              </h1>
              <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '1.1rem', maxWidth: 600, margin: '0 auto' }}>
                Select a scheme below to apply online instantly. Our AI verification system ensures fast and transparent processing.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
              {SCHEMES.map((scheme, i) => (
                <div 
                  key={scheme.id}
                  onClick={() => setSelectedScheme(scheme)}
                  style={{
                    background: 'rgba(255,255,255,.03)',
                    border: '1px solid rgba(255,255,255,.08)',
                    borderRadius: 16,
                    padding: 24,
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    animation: `fadeInUp 0.5s ease ${i * 0.05}s both`
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
                  <div style={{ fontSize: '2rem', marginBottom: 16 }}>{scheme.icon}</div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8, color: 'var(--green-400)', lineHeight: 1.4 }}>
                    {scheme.name}
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    {scheme.desc}
                  </p>
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
              <ArrowLeft size={18} /> Back to Schemes
            </button>

            <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 24, padding: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,.08)' }}>
                <div style={{ fontSize: '3rem' }}>{selectedScheme.icon}</div>
                <div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: 'white', marginBottom: 8 }}>
                    {selectedScheme.name}
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,.6)' }}>{selectedScheme.desc}</p>
                </div>
              </div>

              {submitted ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 80, height: 80, background: 'rgba(16,185,129,.15)', border: '2px solid rgba(16,185,129,.3)', borderRadius: '50%', marginBottom: 24 }}>
                    <CheckCircle size={40} color="var(--green-500)" />
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 12 }}>Application Submitted!</h3>
                  <p style={{ color: 'rgba(255,255,255,.6)', maxWidth: 500, margin: '0 auto 32px' }}>
                    Your application for <strong>{selectedScheme.name}</strong> has been successfully received. You will be notified via SMS regarding your status.
                  </p>
                  
                  {verifyResult && (
                    <div style={{ textAlign: 'left', maxWidth: 600, margin: '0 auto 32px', padding: '20px', background: 'rgba(0,0,0,.3)', border: `1px solid ${verifyResult.aiFlag === 'Valid' ? 'rgba(16,185,129,.3)' : 'rgba(239,68,68,.3)'}`, borderRadius: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        {verifyResult.aiFlag === 'Valid' ? <CheckCircle size={22} color="var(--green-500)" /> : <XCircle size={22} color="#ef4444" />}
                        <div>
                          <div style={{ fontWeight: 700, color: verifyResult.aiFlag === 'Valid' ? 'var(--green-500)' : '#ef4444' }}>
                            AI Verification: {verifyResult.aiFlag}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,.5)' }}>Risk Score: {verifyResult.riskScore}/100</div>
                        </div>
                      </div>
                      {verifyResult.flags.length > 0 && (
                        <div style={{ marginTop: 12 }}>
                          {verifyResult.flags.map((f, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: '0.85rem', color: '#fca5a5', marginBottom: 6 }}>
                              <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 2 }} /> {f}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <button className="btn btn-primary" onClick={resetSelection}>Apply for Another Scheme</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
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
                      <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'rgba(255,255,255,.7)' }}>Aadhaar Number *</label>
                      <input 
                        className="form-input" 
                        style={{ background: 'rgba(0,0,0,.3)', borderColor: 'rgba(255,255,255,.1)', color: 'white' }}
                        placeholder="XXXX XXXX XXXX" 
                        value={form.aadhaar}
                        onChange={e => setForm({ ...form, aadhaar: e.target.value.replace(/\D/g, '').slice(0, 12) })}
                        required minLength={12} maxLength={12} 
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'rgba(255,255,255,.7)' }}>Land Details *</label>
                      <input 
                        className="form-input" 
                        style={{ background: 'rgba(0,0,0,.3)', borderColor: 'rgba(255,255,255,.1)', color: 'white' }}
                        placeholder="e.g., 2.5 acres, Survey No. 101" 
                        value={form.land_details} onChange={e => setForm({ ...form, land_details: e.target.value })} required 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: 'rgba(255,255,255,.7)' }}>Crop Type *</label>
                      <select 
                        className="form-select" 
                        style={{ background: 'rgba(0,0,0,.3)', borderColor: 'rgba(255,255,255,.1)', color: 'white' }}
                        value={form.crop_type} onChange={e => setForm({ ...form, crop_type: e.target.value })} required
                      >
                        <option value="" style={{ color: 'black' }}>Select crop type</option>
                        {CROPS.map(c => <option key={c} value={c} style={{ color: 'black' }}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* File Upload */}
                  <div style={{ marginBottom: 32 }}>
                    <label style={{ display: 'block', marginBottom: 12, fontSize: '0.85rem', color: 'rgba(255,255,255,.7)' }}>Upload Document (Aadhaar / Land Record / Passbook) *</label>
                    <div
                      style={{
                        border: `2px dashed ${isDragOver ? 'var(--green-400)' : 'rgba(255,255,255,.2)'}`,
                        background: isDragOver ? 'rgba(16,185,129,.05)' : 'rgba(0,0,0,.2)',
                        borderRadius: 16, padding: '40px 20px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s'
                      }}
                      onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={e => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files[0]) }}
                      onClick={() => fileRef.current?.click()}
                    >
                      <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => handleFileChange(e.target.files[0])} />
                      
                      {!file ? (
                        <div>
                          <Upload size={36} color="var(--green-500)" style={{ margin: '0 auto 16px' }} />
                          <p style={{ color: 'white', fontWeight: 600, fontSize: '1.05rem', marginBottom: 4 }}>Click to upload or drag & drop</p>
                          <p style={{ color: 'rgba(255,255,255,.4)', fontSize: '0.85rem' }}>PNG, JPG, PDF up to 10MB</p>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                          {filePreview ? <img src={filePreview} alt="preview" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(255,255,255,.1)' }} /> : <FileText size={48} color="var(--green-400)" />}
                          <div style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: 600, color: 'white', marginBottom: 4 }}>{file.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,.5)' }}>{(file.size / 1024).toFixed(1)} KB</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                              <CheckCircle size={14} color="var(--green-500)" />
                              <span style={{ fontSize: '0.8rem', color: 'var(--green-400)', fontWeight: 600 }}>Ready for AI Validation</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
                    <button type="button" className="btn btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,.2)' }} onClick={resetSelection}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={submitting} style={{ minWidth: 200, justifyContent: 'center' }}>
                      {submitting ? (
                        <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Processing...</>
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
