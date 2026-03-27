import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { runOCR, verifyDocument, classifyGrievance, checkDuplicateAadhaar } from '../lib/aiHelpers'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Upload, CheckCircle, XCircle, Clock, AlertTriangle, Send, FileText, Leaf } from 'lucide-react'

const SCHEMES = ['PM-KISAN', 'PMFBY (Crop Insurance)', 'Kisan Credit Card', 'Pradhan Mantri Krishi Sichai Yojana', 'Paramparagat Krishi Vikas Yojana', 'National Mission for Sustainable Agriculture']
const CROPS = ['Wheat', 'Rice', 'Cotton', 'Sugarcane', 'Maize', 'Pulses', 'Oilseeds', 'Vegetables', 'Fruits']
const STATUS_STEPS = [
  { key: 'Submitted', label: 'Submitted' },
  { key: 'Pending', label: 'Under Review' },
  { key: 'Verified', label: 'Verified' },
  { key: 'Approved', label: 'Approved' },
]

function RiskBadge({ score }) {
  const level = score < 30 ? 'low' : score < 60 ? 'medium' : 'high'
  const colors = { low: 'var(--green-600)', medium: '#f59e0b', high: '#ef4444' }
  return (
    <div className="risk-bar-wrap">
      <div className="risk-bar">
        <div className="risk-bar-fill" style={{ width: `${score}%`, background: colors[level] }} />
      </div>
      <span className="risk-value" style={{ color: colors[level] }}>{score}</span>
    </div>
  )
}

export default function FarmerPortal() {
  const { user, addNotification } = useAuth()
  const [form, setForm] = useState({ name: '', aadhaar: '', land_details: '', crop_type: '', scheme_type: '' })
  const [file, setFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [verifyResult, setVerifyResult] = useState(null)
  const [applications, setApplications] = useState([])
  const [grievanceText, setGrievanceText] = useState('')
  const [grievanceResult, setGrievanceResult] = useState(null)
  const [grievanceLoading, setGrievanceLoading] = useState(false)
  const [loadingApps, setLoadingApps] = useState(true)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileRef = useRef()

  // Use demo data if Supabase is not connected
  const DEMO_APPS = [
    { id: '1', name: user?.name || 'Rajesh Kumar', scheme_type: 'PM-KISAN', status: 'Approved', ai_flag: 'Valid', risk_score: 12, created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
    { id: '2', name: user?.name || 'Rajesh Kumar', scheme_type: 'PMFBY (Crop Insurance)', status: 'Pending', ai_flag: 'Valid', risk_score: 20, created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
  ]

  useEffect(() => {
    fetchMyApps()
  }, [])

  async function fetchMyApps() {
    setLoadingApps(true)
    try {
      const { data, error } = await supabase
        .from('applications').select('*')
        .order('created_at', { ascending: false }).limit(10)
      if (error) throw error
      setApplications(data || [])
    } catch {
      setApplications(DEMO_APPS)
    }
    setLoadingApps(false)
  }

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
      // OCR
      toast.loading('Running OCR verification...', { id: 'ocr' })
      const ocrText = await runOCR(file)
      toast.dismiss('ocr')

      // Verify
      toast.loading('AI verification running...', { id: 'verify' })
      const isDuplicate = await checkDuplicateAadhaar(form.aadhaar, supabase)
      const { aiFlag, riskScore, flags } = verifyDocument(ocrText, form)
      const finalRisk = isDuplicate ? Math.min(riskScore + 30, 100) : riskScore
      const finalFlag = isDuplicate ? 'Suspicious' : aiFlag
      toast.dismiss('verify')

      if (isDuplicate) flags.push('Duplicate Aadhaar detected (+30 risk score)')

      // Insert to Supabase
      const payload = {
        name: form.name, aadhaar: form.aadhaar,
        land_details: form.land_details, crop_type: form.crop_type,
        scheme_type: form.scheme_type, status: 'Pending',
        ai_flag: finalFlag, risk_score: finalRisk,
      }

      try {
        const { error } = await supabase.from('applications').insert([payload])
        if (error) throw error
      } catch { /* offline mode */ }

      setVerifyResult({ aiFlag: finalFlag, riskScore: finalRisk, flags, ocrText })
      setApplications(prev => [{ id: Date.now().toString(), ...payload, created_at: new Date().toISOString() }, ...prev])

      addNotification(
        finalFlag === 'Valid' ? 'Application submitted and verified successfully!' : 'Application submitted — flagged for officer review',
        finalFlag === 'Valid' ? 'success' : 'warning'
      )
      toast.success(finalFlag === 'Valid' ? 'Application verified as Valid!' : 'Application submitted (flagged)')
      setForm({ name: '', aadhaar: '', land_details: '', crop_type: '', scheme_type: '' })
      setFile(null); setFilePreview(null)
    } catch (err) {
      toast.error('Error submitting application')
      console.error(err)
    }
    setSubmitting(false)
  }

  const handleGrievance = async (e) => {
    e.preventDefault()
    if (!grievanceText.trim()) return
    setGrievanceLoading(true)
    setGrievanceResult(null)
    try {
      toast.loading('AI classifying grievance...', { id: 'griev' })
      const result = await classifyGrievance(grievanceText)
      toast.dismiss('griev')
      setGrievanceResult(result)

      try {
        await supabase.from('grievances').insert([{ user_id: user?.id || 'anon', complaint_text: grievanceText, category: result.category, priority: result.priority }])
      } catch {}

      addNotification(`Grievance classified: ${result.category} (${result.priority} priority)`, result.priority === 'High' ? 'error' : 'info')
      toast.success('Grievance submitted and classified!')
    } catch {
      toast.error('Could not classify grievance')
    }
    setGrievanceLoading(false)
  }

  const getStepStatus = (stepKey, appStatus) => {
    const order = ['Submitted', 'Pending', 'Verified', 'Approved']
    const stepIdx = order.indexOf(stepKey)
    const currentIdx = order.indexOf(appStatus === 'Rejected' ? 'Pending' : appStatus)
    if (stepIdx < currentIdx) return 'done'
    if (stepIdx === currentIdx) return 'current'
    return ''
  }

  const priorityColors = { High: 'badge-red', Medium: 'badge-yellow', Low: 'badge-green' }
  const categoryColors = { Subsidy: 'badge-blue', Insurance: 'badge-purple', Delay: 'badge-yellow', Corruption: 'badge-red', Technical: 'badge-gray', Other: 'badge-gray' }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 48, height: 48, background: 'var(--green-100)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Leaf size={24} color="var(--green-700)" />
          </div>
          <div>
            <h1 className="page-title">Farmer Portal</h1>
            <p className="page-subtitle">Apply for government schemes and track your applications</p>
          </div>
        </div>
      </div>

      {/* Application Form */}
      <div className="card" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <FileText size={20} color="var(--green-700)" />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-900)' }}>New Scheme Application</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid-2" style={{ marginBottom: 20 }}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" placeholder="Enter your full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Aadhaar Number *</label>
              <input className="form-input" placeholder="XXXX XXXX XXXX" value={form.aadhaar}
                onChange={e => setForm({ ...form, aadhaar: e.target.value.replace(/\D/g, '').slice(0, 12) })}
                required minLength={12} maxLength={12} />
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom: 20 }}>
            <div className="form-group">
              <label className="form-label">Land Details *</label>
              <input className="form-input" placeholder="e.g., 2.5 acres, Survey No. 101, Village Rampur" value={form.land_details} onChange={e => setForm({ ...form, land_details: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Crop Type *</label>
              <select className="form-select" value={form.crop_type} onChange={e => setForm({ ...form, crop_type: e.target.value })} required>
                <option value="">Select crop type</option>
                {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">Scheme Type *</label>
            <select className="form-select" value={form.scheme_type} onChange={e => setForm({ ...form, scheme_type: e.target.value })} required>
              <option value="">Select scheme</option>
              {SCHEMES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* File Upload */}
          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label">Upload Document (Aadhaar / Land Record / Passbook) *</label>
            <div
              className={`upload-zone ${isDragOver ? 'drag-over' : ''}`}
              onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={e => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files[0]) }}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => handleFileChange(e.target.files[0])} />
              {!file ? (
                <div>
                  <Upload size={36} color="var(--green-500)" style={{ margin: '0 auto 12px' }} />
                  <p style={{ color: 'var(--green-700)', fontWeight: 600 }}>Click to upload or drag & drop</p>
                  <p style={{ color: 'var(--slate-400)', fontSize: '0.8rem', marginTop: 4 }}>PNG, JPG, PDF up to 10MB</p>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {filePreview ? <img src={filePreview} alt="preview" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8 }} /> : <FileText size={40} color="var(--green-600)" />}
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 600, color: 'var(--slate-800)' }}>{file.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}>{(file.size / 1024).toFixed(1)} KB</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                      <CheckCircle size={14} color="var(--green-500)" />
                      <span style={{ fontSize: '0.78rem', color: 'var(--green-600)', fontWeight: 600 }}>File ready for OCR verification</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Verification Result */}
          {verifyResult && (
            <div style={{ marginBottom: 20, padding: '20px', background: verifyResult.aiFlag === 'Valid' ? 'var(--green-50)' : '#fff7f7', border: `1px solid ${verifyResult.aiFlag === 'Valid' ? 'var(--green-200)' : '#fca5a5'}`, borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                {verifyResult.aiFlag === 'Valid'
                  ? <CheckCircle size={22} color="var(--green-600)" />
                  : <XCircle size={22} color="#ef4444" />
                }
                <div>
                  <div style={{ fontWeight: 700, color: verifyResult.aiFlag === 'Valid' ? 'var(--green-800)' : '#991b1b' }}>
                    AI Verification: {verifyResult.aiFlag}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>Risk Score: {verifyResult.riskScore}/100</div>
                </div>
              </div>
              {verifyResult.flags.length > 0 && (
                <div>
                  {verifyResult.flags.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: '#7f1d1d', marginBottom: 3 }}>
                      <AlertTriangle size={13} /> {f}
                    </div>
                  ))}
                </div>
              )}
              {verifyResult.ocrText && (
                <details style={{ marginTop: 12 }}>
                  <summary style={{ fontSize: '0.78rem', color: 'var(--slate-500)', cursor: 'pointer', fontWeight: 600 }}>View OCR Output</summary>
                  <pre style={{ marginTop: 8, fontSize: '0.72rem', background: 'rgba(0,0,0,.04)', padding: 10, borderRadius: 8, whiteSpace: 'pre-wrap', color: 'var(--slate-700)' }}>
                    {verifyResult.ocrText}
                  </pre>
                </details>
              )}
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%', justifyContent: 'center' }}>
            {submitting ? (
              <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Processing Application...</>
            ) : (
              <><Send size={18} /> Submit Application</>
            )}
          </button>
        </form>
      </div>

      {/* Application Status */}
      <div id="status" className="card" style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: 20 }}>My Applications</h2>

        {loadingApps ? (
          <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 70 }} />)}
          </div>
        ) : applications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--slate-400)' }}>
            <p>No applications yet. Submit your first application above.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {applications.map(app => (
              <div key={app.id} style={{ border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-md)', padding: '18px 20px', background: app.status === 'Rejected' ? '#fff7f7' : 'white', transition: 'all .2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--slate-900)', marginBottom: 4 }}>{app.scheme_type}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}>Applied: {new Date(app.created_at).toLocaleDateString('en-IN')}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className={`badge ${app.ai_flag === 'Valid' ? 'badge-green' : 'badge-red'}`}>{app.ai_flag === 'Valid' ? '✓' : '⚠'} {app.ai_flag}</span>
                    <span className={`badge ${app.status === 'Approved' ? 'badge-green' : app.status === 'Rejected' ? 'badge-red' : app.status === 'Verified' ? 'badge-blue' : 'badge-yellow'}`}>
                      {app.status}
                    </span>
                  </div>
                </div>

                {/* Status steps */}
                <div style={{ marginTop: 16 }}>
                  <div className="status-steps">
                    {STATUS_STEPS.map(step => (
                      <div key={step.key} className={`status-step ${getStepStatus(step.key, app.status)}`}>
                        <div className="step-dot">
                          {getStepStatus(step.key, app.status) === 'done' ? '✓' : STATUS_STEPS.indexOf(step) + 1}
                        </div>
                        <div className="step-label">{step.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginBottom: 4 }}>Risk Score</div>
                  <RiskBadge score={app.risk_score} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grievance Section */}
      <div id="grievance" className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <AlertTriangle size={20} color="#f59e0b" />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-900)' }}>Submit Grievance</h2>
        </div>

        <form onSubmit={handleGrievance}>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Describe your complaint or issue</label>
            <textarea
              className="form-textarea"
              placeholder="e.g., My PM-KISAN payment has been delayed for 3 months despite approval. I urgently need the subsidy for crop cultivation..."
              value={grievanceText}
              onChange={e => setGrievanceText(e.target.value)}
              rows={4}
              required
            />
          </div>

          {grievanceResult && (
            <div style={{ marginBottom: 16, padding: '16px 20px', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)', display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>AI Classification Result</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span className={`badge ${categoryColors[grievanceResult.category] || 'badge-gray'}`}>📂 {grievanceResult.category}</span>
                  <span className={`badge ${priorityColors[grievanceResult.priority] || 'badge-gray'}`}>
                    {grievanceResult.priority === 'High' ? '🔴' : grievanceResult.priority === 'Medium' ? '🟡' : '🟢'} {grievanceResult.priority} Priority
                  </span>
                </div>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                {grievanceResult.priority === 'High' ? '🚨 This will be escalated to senior officers immediately.' : 'Your grievance has been logged and will be addressed.'}
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={grievanceLoading} style={{ justifyContent: 'center' }}>
            {grievanceLoading ? (
              <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Classifying...</>
            ) : (
              <><Send size={18} /> Submit Grievance</>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
