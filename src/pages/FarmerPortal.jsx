import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { classifyGrievance } from '../lib/aiHelpers'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Upload, CheckCircle, XCircle, Clock, AlertTriangle, Send, FileText, Leaf, Folder, ShieldAlert, Circle, Check, TrendingUp, CloudRain, Stethoscope, FlaskConical } from 'lucide-react'
import MarketTracker from '../components/MarketTracker'
import WeatherWidget from '../components/WeatherWidget'
import { useNavigate } from 'react-router-dom'

// Removed SCHEMES and CROPS constants
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
  const navigate = useNavigate()
  const { user, addNotification } = useAuth()
  const [applications, setApplications] = useState([])
  const [grievanceText, setGrievanceText] = useState('')
  const [grievanceResult, setGrievanceResult] = useState(null)
  const [grievanceLoading, setGrievanceLoading] = useState(false)
  const [loadingApps, setLoadingApps] = useState(true)

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

      {/* Advanced Tools Quick Access */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 32 }}>
        <WeatherWidget />
        <MarketTracker />
      </div>

      {/* Smart Analysis Tools */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <div 
          className="card" 
          onClick={() => navigate('/crop-doctor')}
          style={{ 
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, padding: '20px',
            border: '1px solid var(--green-100)', background: 'white'
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--green-400)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--green-100)'}
        >
          <div style={{ padding: 12, background: 'var(--green-50)', borderRadius: 12, color: 'var(--green-600)' }}>
            <Stethoscope size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 800, color: 'var(--slate-900)' }}>AI Crop Doctor</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Diagnose crop diseases instantly</div>
          </div>
        </div>
        
        <div 
          className="card" 
          onClick={() => navigate('/soil-advisor')}
          style={{ 
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, padding: '20px',
            border: '1px solid var(--blue-100)', background: 'white'
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--blue-400)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--blue-100)'}
        >
          <div style={{ padding: 12, background: 'var(--blue-50)', borderRadius: 12, color: 'var(--blue-600)' }}>
            <FlaskConical size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 800, color: 'var(--slate-900)' }}>Soil Health Advisor</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Get smart NPK fertilizer advice</div>
          </div>
        </div>
      </div>

      {/* Application Form Banner */}
      <div className="card" style={{ marginBottom: 32, background: 'linear-gradient(135deg, var(--green-50), white)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--green-800)', marginBottom: 8 }}>Explore Government Schemes</h2>
            <p style={{ color: 'var(--slate-600)' }}>Apply for new agriculture schemes and subsidies online.</p>
          </div>
          <button className="btn btn-primary" onClick={() => window.location.href = '/schemes'}>
            Browse Schemes
          </button>
        </div>
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
                    <span className={`badge ${app.ai_flag === 'Valid' ? 'badge-green' : 'badge-red'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {app.ai_flag === 'Valid' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />} {app.ai_flag}
                    </span>
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
                          {getStepStatus(step.key, app.status) === 'done' ? <Check size={14} /> : STATUS_STEPS.indexOf(step) + 1}
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
                  <span className={`badge ${categoryColors[grievanceResult.category] || 'badge-gray'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Folder size={14} /> {grievanceResult.category}
                  </span>
                  <span className={`badge ${priorityColors[grievanceResult.priority] || 'badge-gray'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Circle size={12} fill="currentColor" /> {grievanceResult.priority} Priority
                  </span>
                </div>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                {grievanceResult.priority === 'High' ? <><ShieldAlert size={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 4 }} /> This will be escalated to senior officers immediately.</> : 'Your grievance has been logged and will be addressed.'}
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
