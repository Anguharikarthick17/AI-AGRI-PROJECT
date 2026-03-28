import React, { useState, useRef, useEffect } from 'react'
import { Bell, Menu, LogOut, X, Hand } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Topnav({ onMenuToggle }) {
  const { user, logout, notifications, clearNotifications } = useAuth()
  const [showNotif, setShowNotif] = useState(false)
  const panelRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setShowNotif(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const unread = notifications.length

  return (
    <div className="topnav" style={{ gap: 16, justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="menu-toggle btn btn-sm btn-outline" style={{ padding: '8px', border: 'none', background: 'transparent', color: 'var(--slate-600)' }} onClick={onMenuToggle}>
          <Menu size={22} />
        </button>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-900)' }}>
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
            AgriSmart Admin Portal
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Notification Bell */}
        <div style={{ position: 'relative' }} ref={panelRef}>
          <button
            onClick={() => setShowNotif(!showNotif)}
            style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: 'var(--slate-50)', border: '1px solid var(--slate-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--slate-600)', position: 'relative', cursor: 'pointer', transition: 'var(--transition)' }}
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>
            )}
          </button>
          {showNotif && (
            <div className="notif-panel">
              <div style={{ padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--slate-100)' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Notifications</span>
                {unread > 0 && (
                  <button onClick={clearNotifications} style={{ fontSize: '0.75rem', color: 'var(--slate-500)', background: 'none', cursor: 'pointer' }}>
                    Clear all
                  </button>
                )}
              </div>
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: 'var(--slate-400)', fontSize: '0.875rem' }}>
                    No notifications
                  </div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} style={{ padding: '12px 18px', borderBottom: '1px solid var(--slate-50)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.type === 'success' ? 'var(--green-500)' : n.type === 'error' ? '#ef4444' : '#f59e0b', marginTop: 5, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--slate-800)' }}>{n.msg}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)', marginTop: 2 }}>
                          {new Date(n.time).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User chip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
          <div className="sidebar-avatar" style={{ width: 30, height: 30, fontSize: '0.75rem' }}>
            {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--slate-900)', lineHeight: 1.2 }}>{user?.name}</span>
            <span style={{ fontSize: '0.68rem', color: 'var(--green-700)', textTransform: 'capitalize' }}>{user?.role}</span>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          title="Logout"
          style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: '#fee2e2', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', cursor: 'pointer', transition: 'var(--transition)' }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  )
}
