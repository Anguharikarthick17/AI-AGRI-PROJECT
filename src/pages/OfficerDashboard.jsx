import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { exportToCSV } from '../lib/aiHelpers'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Search, Download, RefreshCw, CheckCircle, XCircle, Shield, AlertTriangle, Users, MapPin, Play, X, FileText, Mic } from 'lucide-react'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for Leaflet marker icons
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
})
L.Marker.prototype.options.icon = DefaultIcon

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
  const [selectedApp, setSelectedApp] = useState(null)

  const fetchApps = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    
    let remoteApps = []
    let localApps = JSON.parse(localStorage.getItem('mock_applications') || '[]')
    
    try {
      const { data, error } = await supabase.from('applications').select('*').order('created_at', { ascending: false })
      if (!error && data) remoteApps = data
    } catch (err) {
      console.warn('Supabase fetch failed, relying on local storage only')
    }

    // Merge both, keeping remote ones as priority for the same ID
    const merged = [...remoteApps]
    localApps.forEach(local => {
      if (!merged.find(remote => remote.id === local.id)) {
        merged.push(local)
      }
    })

    // Sort by date
    merged.sort((a,b) => new Date(b.created_at) - new Date(a.created_at))
    
    setApps(merged.length > 0 ? merged : DEMO_DATA)
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
    toast.success(`Application ${newStatus}`, { id: 'status-update' })
    
    // Simulate SMS notification
    setTimeout(() => {
      toast.success('SMS Notification sent to farmer!', {
        icon: '📱',
        style: { background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd' }
      });
    }, 1500);
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
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-outline btn-sm" onClick={() => setSelectedApp(app)} style={{ padding: '6px 12px' }}>
                          View
                        </button>
                        {app.status === 'Pending' || app.status === 'Verified' ? (
                          <>
                            <button className="btn btn-primary btn-sm" onClick={() => updateStatus(app.id, 'Approved')} style={{ gap: 4, padding: '6px 12px' }}>
                              <CheckCircle size={13} /> Approve
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => updateStatus(app.id, 'Rejected')} style={{ gap: 4, padding: '6px 12px' }}>
                              <XCircle size={13} /> Reject
                            </button>
                          </>
                        ) : null}
                      </div>
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

      {/* Modal Overlay */}
      {selectedApp && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          padding: '20px'
        }} onClick={() => setSelectedApp(null)}>
          <div style={{
            background: 'white', borderRadius: 24, maxWidth: 800, width: '100%',
            maxHeight: '90vh', overflowY: 'auto', position: 'relative',
            color: 'var(--slate-900)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
          }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ borderBottom: '1px solid var(--slate-100)', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>Application Details</h2>
                <div style={{ fontSize: '0.85rem', color: 'var(--slate-400)', marginTop: 4 }}>ID: {selectedApp.id}</div>
              </div>
              <button 
                onClick={() => setSelectedApp(null)}
                style={{ background: 'var(--slate-100)', border: 'none', padding: 8, borderRadius: '50%', cursor: 'pointer', color: 'var(--slate-600)' }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '32px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 32 }}>
                <div>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: 'var(--slate-400)', letterSpacing: '1px', textTransform: 'uppercase' }}>Farmer Information</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>Full Name</div>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{selectedApp.name}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>Aadhaar Number</div>
                      <div style={{ fontWeight: 600 }}>{selectedApp.aadhaar}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>Application Type</div>
                      <div style={{ fontWeight: 600 }}>{selectedApp.scheme_type}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: 'var(--slate-400)', letterSpacing: '1px', textTransform: 'uppercase' }}>AI Verification</h4>
                  <div style={{ background: selectedApp.ai_flag === 'Valid' ? 'var(--green-50)' : 'var(--red-50)', padding: 16, borderRadius: 16, border: `1px solid ${selectedApp.ai_flag === 'Valid' ? 'var(--green-200)' : 'var(--red-200)'}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      {selectedApp.ai_flag === 'Valid' ? <CheckCircle size={18} color="var(--green-600)" /> : <AlertTriangle size={18} color="#ef4444" />}
                      <span style={{ fontWeight: 700, color: selectedApp.ai_flag === 'Valid' ? 'var(--green-700)' : '#dc2626' }}>{selectedApp.ai_flag}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ flex: 1, height: 8, background: 'rgba(0,0,0,0.1)', borderRadius: 4 }}>
                        <div style={{ height: '100%', width: `${selectedApp.risk_score}%`, background: selectedApp.risk_score < 30 ? 'var(--green-500)' : '#ef4444', borderRadius: 4 }} />
                      </div>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{selectedApp.risk_score}% Risk</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Map */}
              <div style={{ marginBottom: 32 }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: 'var(--slate-400)', letterSpacing: '1px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MapPin size={16} /> Location Information
                </h4>
                {selectedApp.latitude && selectedApp.longitude ? (
                  <div style={{ height: 300, borderRadius: 16, overflow: 'hidden', border: '1px solid var(--slate-100)' }}>
                    <MapContainer center={[selectedApp.latitude, selectedApp.longitude]} zoom={13} style={{ height: '100%', width: '100%' }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker position={[selectedApp.latitude, selectedApp.longitude]} />
                    </MapContainer>
                  </div>
                ) : (
                  <div style={{ padding: '40px', background: 'var(--slate-50)', borderRadius: 16, textAlign: 'center', color: 'var(--slate-400)', fontSize: '0.9rem' }}>
                    No location coordinate sharing enabled for this application.
                  </div>
                )}
              </div>

              {/* Document Submitted */}
              <div style={{ marginBottom: 32 }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: 'var(--slate-400)', letterSpacing: '1px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FileText size={16} /> Document Submitted
                </h4>
                {selectedApp.document_url ? (
                  <div style={{ background: 'var(--slate-50)', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--slate-200)' }}>
                    {selectedApp.document_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) || selectedApp.document_url.startsWith('data:image') ? (
                      <div style={{ textAlign: 'center', padding: 16 }}>
                        <img
                          src={selectedApp.document_url}
                          alt="Submitted document"
                          style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 12, objectFit: 'contain', border: '1px solid var(--slate-200)' }}
                        />
                        {selectedApp.document_name && (
                          <div style={{ marginTop: 10, fontSize: '0.82rem', color: 'var(--slate-500)' }}>{selectedApp.document_name}</div>
                        )}
                      </div>
                    ) : (
                      <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: 16 }}>
                        <FileText size={36} color="var(--green-600)" />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--slate-800)', marginBottom: 4 }}>{selectedApp.document_name || 'Uploaded Document'}</div>
                          <a
                            href={selectedApp.document_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--green-600)', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none' }}
                          >
                            View Document ↗
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ padding: '40px', background: 'var(--slate-50)', borderRadius: 16, textAlign: 'center', color: 'var(--slate-400)', fontSize: '0.9rem' }}>
                    No document uploaded.
                  </div>
                )}
              </div>

              {/* Voice Note */}
              <div style={{ marginBottom: 32 }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: 'var(--slate-400)', letterSpacing: '1px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Mic size={16} /> Farmer Voice Note
                </h4>
                {selectedApp.voice_note_url ? (
                  <div style={{ background: 'var(--slate-900)', padding: '20px 24px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Mic size={20} color="#10b981" style={{ flexShrink: 0 }} />
                    <audio src={selectedApp.voice_note_url} controls style={{ flex: 1, height: 44 }} />
                  </div>
                ) : (
                  <div style={{ padding: '40px', background: 'var(--slate-50)', borderRadius: 16, textAlign: 'center', color: 'var(--slate-400)', fontSize: '0.9rem' }}>
                    No voice note recorded.
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div style={{ borderTop: '1px solid var(--slate-100)', paddingTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
                {selectedApp.status === 'Pending' || selectedApp.status === 'Verified' ? (
                  <>
                    <button 
                      className="btn btn-danger" 
                      onClick={() => { updateStatus(selectedApp.id, 'Rejected'); setSelectedApp(null); }}
                      style={{ padding: '12px 24px' }}
                    >
                      <XCircle size={18} /> Reject Application
                    </button>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => { updateStatus(selectedApp.id, 'Approved'); setSelectedApp(null); }}
                      style={{ padding: '12px 24px' }}
                    >
                      <CheckCircle size={18} /> Approve Application
                    </button>
                  </>
                ) : (
                  <div style={{ color: 'var(--slate-400)', fontStyle: 'italic' }}>
                    Application is already {selectedApp.status.toLowerCase()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`.spin { animation: spin .8s linear infinite; }`}</style>
    </div>
  )
}
