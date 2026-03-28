import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { exportToCSV } from '../lib/aiHelpers'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Search, Download, RefreshCw, CheckCircle, XCircle, Shield, AlertTriangle, Users } from 'lucide-react'

const DEMO_DATA = [
  { id: '1', name: 'Rajesh Kumar', aadhaar: '123456789012', scheme_type: 'PM-KISAN', status: 'Pending', ai_flag: 'Valid', risk_score: 12, crop_type: 'Wheat', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: '2', name: 'Sunita Devi', aadhaar: '234567890123', scheme_type: 'PMFBY (Crop Insurance)', status: 'Pending', ai_flag: 'Suspicious', risk_score: 74, crop_type: 'Cotton', created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: '3', name: 'Mohan Patel', aadhaar: '345678901234', scheme_type: 'Kisan Credit Card', status: 'Approved', ai_flag: 'Valid', risk_score: 8, crop_type: 'Rice', created_at: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: '4', name: 'Anita Singh', aadhaar: '456789012345', scheme_type: 'PM-KISAN', status: 'Rejected', ai_flag: 'Suspicious', risk_score: 88, crop_type: 'Sugarcane', created_at: new Date(Date.now() - 86400000 * 4).toISOString() },
  { id: '5', name: 'Ramesh Yadav', aadhaar: '567890123456', scheme_type: 'PMKSY', status: 'Pending', ai_flag: 'Valid', risk_score: 22, crop_type: 'Maize', created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: '6', name: 'Priya Sharma', aadhaar: '678901234567', scheme_type: 'PMFBY (Crop Insurance)', status: 'Verified', ai_flag: 'Valid', risk_score: 15, crop_type: 'Pulses', created_at: new Date(Date.now() - 86400000 * 6).toISOString() },
  { id: '7', name: 'Vikram Meena', aadhaar: '789012345678', scheme_type: 'PM-KISAN', status: 'Pending', ai_flag: 'Suspicious', risk_score: 62, crop_type: 'Cotton', created_at: new Date(Date.now() - 86400000 * 7).toISOString() },
]

function RiskBar({ score }) {
  const level = score < 30 ? 'low' : score < 60 ? 'medium' : 'high'
  const colors = { low: 'var(--green-500)', medium: '#f59e0b', high: '#ef4444' }
  return (
    <div className="risk-bar-wrap">
      <div className="risk-bar" style={{ width: 80 }}>
        <div className="risk-bar-fill" style={{ width: `${score}%`, background: colors[level] }} />
      </div>
      <span className="risk-value" style={{ color: colors[level] }}>{score}</span>
    </div>
  )
}

export default function OfficerDashboard() {
  const { addNotification } = useAuth()
  const [apps, setApps] = useState([])
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchApps = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const { data, error } = await supabase.from('applications').select('*').order('created_at', { ascending: false })
      if (error) throw error
      setApps(data || [])
    } catch {
      const stored = localStorage.getItem('mock_applications')
      if (stored) {
        setApps(JSON.parse(stored))
      } else {
        localStorage.setItem('mock_applications', JSON.stringify(DEMO_DATA))
        setApps(DEMO_DATA)
      }
    }
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => {
    fetchApps()
    const interval = setInterval(() => fetchApps(true), 30000)
    return () => clearInterval(interval)
  }, [fetchApps])

  const updateStatus = async (id, newStatus) => {
    const prev = [...apps]
    const updatedApps = apps.map(a => a.id === id ? { ...a, status: newStatus } : a)
    setApps(updatedApps)
    try {
      const { error } = await supabase.from('applications').update({ status: newStatus }).eq('id', id)
      if (error) throw error
    } catch {
      // demo mode - update local storage
      localStorage.setItem('mock_applications', JSON.stringify(updatedApps))
    }
    addNotification(`Application ${newStatus.toLowerCase()} successfully`, newStatus === 'Approved' ? 'success' : 'error')
    toast.success(`Application ${newStatus}`)
  }

  // Filter
  const filtered = apps.filter(a => {
    const matchFilter = filter === 'All' ? true
      : filter === 'Flagged' ? a.ai_flag === 'Suspicious'
      : a.status === filter
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.scheme_type.toLowerCase().includes(search.toLowerCase()) || a.aadhaar?.includes(search)
    return matchFilter && matchSearch
  })

  // Summary counts
  const counts = {
    All: apps.length,
    Pending: apps.filter(a => a.status === 'Pending').length,
    Approved: apps.filter(a => a.status === 'Approved').length,
    Rejected: apps.filter(a => a.status === 'Rejected').length,
    Flagged: apps.filter(a => a.ai_flag === 'Suspicious').length,
  }

  const FILTERS = ['All', 'Pending', 'Approved', 'Rejected', 'Flagged']

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 48, height: 48, background: '#dbeafe', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={24} color="#1d4ed8" />
          </div>
          <div>
            <h1 className="page-title">Officer Dashboard</h1>
            <p className="page-subtitle">Review and manage all farmer applications</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
        {FILTERS.map(f => (
          <div key={f} className="stat-card"
            style={{ cursor: 'pointer', border: filter === f ? '2px solid var(--green-500)' : '1px solid rgba(0,0,0,.04)', background: filter === f ? 'var(--green-50)' : 'white' }}
            onClick={() => setFilter(f)}
          >
            <div style={{ flexDirection: 'column' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: f === 'Flagged' ? '#ef4444' : f === 'Approved' ? 'var(--green-700)' : f === 'Rejected' ? '#dc2626' : 'var(--slate-900)' }}>
                {counts[f]}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: 2 }}>{f} {f !== 'All' ? 'Apps' : 'Applications'}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Alert Banner */}
      {counts.Flagged > 0 && (
        <div className="alert alert-danger" style={{ marginBottom: 20 }}>
          <AlertTriangle size={18} />
          <div>
            <strong>{counts.Flagged} Suspicious Applications</strong> detected by AI. High-risk rows are highlighted below — review immediately.
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div className="filter-tabs">
            {FILTERS.map(f => (
              <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f} <span style={{ opacity: .6, fontSize: '0.72rem' }}>({counts[f]})</span>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-outline btn-sm" onClick={() => fetchApps(true)} style={{ gap: 6 }}>
              <RefreshCw size={14} className={refreshing ? 'spin' : ''} /> Refresh
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => exportToCSV(filtered)} title="Export to CSV" style={{ gap: 6 }}>
              <Download size={14} /> Export
            </button>
          </div>
        </div>

        <div className="search-box" style={{ marginBottom: 16 }}>
          <Search size={16} color="var(--slate-400)" />
          <input placeholder="Search by name, scheme, or Aadhaar..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 52 }} />)}
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Farmer Name</th>
                  <th>Scheme</th>
                  <th>Crop</th>
                  <th>Status</th>
                  <th>AI Flag</th>
                  <th>Risk Score</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--slate-400)', padding: '40px' }}>No applications found</td></tr>
                ) : filtered.map((app, i) => (
                  <tr key={app.id} className={app.risk_score >= 70 ? 'high-risk' : ''}>
                    <td style={{ color: 'var(--slate-400)', fontSize: '0.8rem' }}>{i + 1}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--slate-900)' }}>{app.name}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--slate-400)' }}>Aadhaar: {app.aadhaar?.slice(0,4)}••••{app.aadhaar?.slice(-4)}</div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{app.scheme_type}</td>
                    <td style={{ fontSize: '0.85rem' }}>{app.crop_type}</td>
                    <td>
                      <span className={`badge ${
                        app.status === 'Approved' ? 'badge-green'
                        : app.status === 'Rejected' ? 'badge-red'
                        : app.status === 'Verified' ? 'badge-blue'
                        : 'badge-yellow'
                      }`}>{app.status}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {app.ai_flag === 'Valid'
                          ? <><CheckCircle size={15} color="var(--green-600)" /><span style={{ color: 'var(--green-700)', fontWeight: 600, fontSize: '0.82rem' }}>Valid</span></>
                          : <><XCircle size={15} color="#ef4444" /><span style={{ color: '#dc2626', fontWeight: 600, fontSize: '0.82rem' }}>Suspicious</span></>
                        }
                      </div>
                    </td>
                    <td><RiskBar score={app.risk_score} /></td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--slate-400)' }}>
                      {new Date(app.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td>
                      {app.status === 'Pending' || app.status === 'Verified' ? (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-primary btn-sm" onClick={() => updateStatus(app.id, 'Approved')} style={{ gap: 4, padding: '6px 12px' }}>
                            <CheckCircle size={13} /> Approve
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => updateStatus(app.id, 'Rejected')} style={{ gap: 4, padding: '6px 12px' }}>
                            <XCircle size={13} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--slate-400)', fontStyle: 'italic' }}>No action</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ marginTop: 12, fontSize: '0.78rem', color: 'var(--slate-400)', textAlign: 'right' }}>
          Showing {filtered.length} of {apps.length} applications • Auto-refreshes every 30s
        </div>
      </div>

      <style>{`.spin { animation: spin .8s linear infinite; }`}</style>
    </div>
  )
}
