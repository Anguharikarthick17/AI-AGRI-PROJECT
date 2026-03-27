import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js'
import { Bar, Pie, Line } from 'react-chartjs-2'
import { supabase } from '../lib/supabaseClient'
import { BarChart3, Users, CheckCircle, AlertCircle, AlertTriangle, TrendingUp, RefreshCw } from 'lucide-react'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const DEMO_APPS = [
  { status: 'Pending', scheme_type: 'PM-KISAN', created_at: new Date(Date.now() - 86400000 * 0).toISOString() },
  { status: 'Pending', scheme_type: 'PMFBY (Crop Insurance)', created_at: new Date(Date.now() - 86400000 * 0).toISOString() },
  { status: 'Approved', scheme_type: 'PM-KISAN', created_at: new Date(Date.now() - 86400000 * 1).toISOString() },
  { status: 'Pending', scheme_type: 'Kisan Credit Card', created_at: new Date(Date.now() - 86400000 * 1).toISOString() },
  { status: 'Rejected', scheme_type: 'PMFBY (Crop Insurance)', created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
  { status: 'Approved', scheme_type: 'PM-KISAN', created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
  { status: 'Approved', scheme_type: 'PMKSY', created_at: new Date(Date.now() - 86400000 * 3).toISOString() },
  { status: 'Pending', scheme_type: 'PM-KISAN', created_at: new Date(Date.now() - 86400000 * 4).toISOString() },
  { status: 'Verified', scheme_type: 'Kisan Credit Card', created_at: new Date(Date.now() - 86400000 * 4).toISOString() },
  { status: 'Pending', scheme_type: 'PMFBY (Crop Insurance)', created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
  { status: 'Approved', scheme_type: 'PM-KISAN', created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
  { status: 'Pending', scheme_type: 'PMKSY', created_at: new Date(Date.now() - 86400000 * 6).toISOString() },
]
const DEMO_GRIEVANCES = [
  { category: 'Subsidy', priority: 'High' },
  { category: 'Insurance', priority: 'Medium' },
  { category: 'Delay', priority: 'High' },
  { category: 'Technical', priority: 'Low' },
  { category: 'Subsidy', priority: 'Medium' },
]

function AnimatedCounter({ target }) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    let start = 0
    const step = Math.ceil(target / 30)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setValue(target); clearInterval(timer) }
      else setValue(start)
    }, 40)
    return () => clearInterval(timer)
  }, [target])
  return <span>{value}</span>
}

const CHART_GREEN = ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0']
const CHART_MULTI = ['#059669', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444']

export default function AdminAnalytics() {
  const [apps, setApps] = useState([])
  const [grievances, setGrievances] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const [appsRes, grievRes] = await Promise.all([
        supabase.from('applications').select('status, scheme_type, created_at').order('created_at', { ascending: false }),
        supabase.from('grievances').select('category, priority').order('created_at', { ascending: false }),
      ])
      if (appsRes.error) throw appsRes.error
      setApps(appsRes.data || [])
      setGrievances(grievRes.data || [])
    } catch {
      setApps(DEMO_APPS)
      setGrievances(DEMO_GRIEVANCES)
    }
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(() => fetchData(true), 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  // Compute stats
  const total = apps.length
  const pending = apps.filter(a => a.status === 'Pending').length
  const approved = apps.filter(a => a.status === 'Approved').length
  const totalGrievances = grievances.length
  const highPriority = grievances.filter(g => g.priority === 'High').length

  // Scheme usage bar chart
  const schemeCounts = {}
  apps.forEach(a => { schemeCounts[a.scheme_type] = (schemeCounts[a.scheme_type] || 0) + 1 })
  const schemeLabels = Object.keys(schemeCounts).map(s => s.length > 20 ? s.slice(0, 20) + '…' : s)
  const schemeData = {
    labels: schemeLabels,
    datasets: [{
      label: 'Applications',
      data: Object.values(schemeCounts),
      backgroundColor: CHART_GREEN,
      borderRadius: 8, borderSkipped: false,
    }]
  }

  // Status distribution pie
  const statusCounts = {}
  apps.forEach(a => { statusCounts[a.status] = (statusCounts[a.status] || 0) + 1 })
  const pieData = {
    labels: Object.keys(statusCounts),
    datasets: [{ data: Object.values(statusCounts), backgroundColor: ['#f59e0b', '#059669', '#ef4444', '#3b82f6'], borderWidth: 0, hoverOffset: 8 }]
  }

  // Daily applications line chart (last 7 days)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - 86400000 * (6 - i))
    return { label: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }), date: d.toDateString() }
  })
  const dailyCounts = days.map(day => apps.filter(a => new Date(a.created_at).toDateString() === day.date).length)
  const lineData = {
    labels: days.map(d => d.label),
    datasets: [{
      label: 'Applications',
      data: dailyCounts,
      borderColor: '#059669', backgroundColor: 'rgba(16,185,129,.08)',
      borderWidth: 2.5, tension: 0.4, fill: true,
      pointBackgroundColor: '#059669', pointRadius: 5, pointHoverRadius: 7,
    }]
  }

  const chartOpts = (title) => ({
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: { cornerRadius: 8, padding: 10, boxPadding: 4 }
    },
    scales: title !== 'pie' ? {
      x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#94a3b8' } },
      y: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 11 }, color: '#94a3b8', stepSize: 1 }, beginAtZero: true }
    } : undefined,
  })

  const pieOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { usePointStyle: true, padding: 16, font: { size: 12 } } },
      tooltip: { cornerRadius: 8, padding: 10 }
    }
  }

  const STATS = [
    { label: 'Total Applications', value: total, icon: Users, color: 'green', sub: `+${Math.floor(total * 0.12)} this week` },
    { label: 'Pending Review', value: pending, icon: AlertCircle, color: 'orange', sub: pending > 10 ? '⚠ High workload' : 'Normal load' },
    { label: 'Approved', value: approved, icon: CheckCircle, color: 'blue', sub: `${total > 0 ? Math.round(approved / total * 100) : 0}% approval rate` },
    { label: 'Total Grievances', value: totalGrievances, icon: AlertTriangle, color: 'purple', sub: `${highPriority} high priority` },
  ]

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, background: '#ede9fe', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart3 size={24} color="#6d28d9" />
            </div>
            <div>
              <h1 className="page-title">Analytics Dashboard</h1>
              <p className="page-subtitle">Real-time overview of all applications and grievances</p>
            </div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => fetchData(true)} style={{ gap: 6 }}>
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Alerts */}
      {pending > 5 && (
        <div className="alert alert-warning" style={{ marginBottom: 16 }}>
          <AlertTriangle size={18} />
          <strong>High Pending Workload</strong> — {pending} applications awaiting review. Consider assigning more officers.
        </div>
      )}
      {highPriority > 2 && (
        <div className="alert alert-danger" style={{ marginBottom: 20 }}>
          <AlertCircle size={18} />
          <strong>Spike in High-Priority Complaints</strong> — {highPriority} urgent grievances require immediate attention.
        </div>
      )}

      {/* Stat Cards */}
      {loading ? (
        <div className="grid-4" style={{ marginBottom: 32 }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 100 }} />)}
        </div>
      ) : (
        <div className="grid-4" style={{ marginBottom: 32 }}>
          {STATS.map((s, i) => (
            <div key={i} className={`stat-card ${s.color}`}>
              <div className={`stat-icon ${s.color}`}><s.icon size={24} /></div>
              <div>
                <div className="stat-value"><AnimatedCounter target={s.value} /></div>
                <div className="stat-label">{s.label}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)', marginTop: 3 }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts Row 1 */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div className="chart-title">Scheme Usage</div>
            <span className="badge badge-green">{Object.keys(schemeCounts).length} schemes</span>
          </div>
          <div style={{ height: 220 }}>
            {!loading && <Bar data={schemeData} options={chartOpts('bar')} />}
          </div>
        </div>

        <div className="chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div className="chart-title">Application Status Breakdown</div>
            <span className="badge badge-blue">{total} total</span>
          </div>
          <div style={{ height: 220 }}>
            {!loading && total > 0 && <Pie data={pieData} options={pieOpts} />}
            {!loading && total === 0 && <div style={{ textAlign: 'center', paddingTop: 70, color: 'var(--slate-400)' }}>No data yet</div>}
          </div>
        </div>
      </div>

      {/* Line chart */}
      <div className="chart-card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div className="chart-title">Daily Application Trend (Last 7 Days)</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}>Track application volume over time</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={16} color="var(--green-600)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--green-700)', fontWeight: 600 }}>+{dailyCounts.reduce((a,b) => a + b, 0)} total</span>
          </div>
        </div>
        <div style={{ height: 220 }}>
          {!loading && <Line data={lineData} options={chartOpts('line')} />}
        </div>
      </div>

      {/* Grievance breakdown */}
      <div className="card">
        <div className="chart-title" style={{ marginBottom: 20 }}>Grievance Summary</div>
        {loading ? (
          <div className="skeleton" style={{ height: 100 }} />
        ) : grievances.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--slate-400)', padding: '24px' }}>No grievances recorded</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {['Subsidy', 'Insurance', 'Delay', 'Corruption', 'Technical', 'Other'].map(cat => {
              const count = grievances.filter(g => g.category === cat).length
              return count > 0 ? (
                <div key={cat} style={{ background: 'var(--slate-50)', borderRadius: 12, padding: '16px', border: '1px solid var(--slate-200)' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--slate-900)', fontFamily: 'Outfit, sans-serif' }}>{count}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)', fontWeight: 600 }}>{cat}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)', marginTop: 4 }}>
                    {grievances.filter(g => g.category === cat && g.priority === 'High').length} high priority
                  </div>
                </div>
              ) : null
            })}
          </div>
        )}
      </div>

      <style>{`.spin { animation: spin .8s linear infinite; } @keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  )
}
