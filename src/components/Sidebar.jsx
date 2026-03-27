import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, FileText, BarChart3,
  Sprout, AlertCircle, Settings, ChevronRight
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = {
  farmer: [
    { label: 'Apply for Scheme', icon: FileText, path: '/farmer', section: 'Portal' },
    { label: 'My Applications', icon: Users, path: '/farmer#status', section: 'Portal' },
    { label: 'Grievances', icon: AlertCircle, path: '/farmer#grievance', section: 'Portal' },
  ],
  officer: [
    { label: 'Applications', icon: FileText, path: '/officer', section: 'Management' },
    { label: 'Grievances', icon: AlertCircle, path: '/officer#grievances', section: 'Management' },
  ],
  admin: [
    { label: 'Analytics', icon: BarChart3, path: '/admin', section: 'Dashboard' },
    { label: 'Applications', icon: FileText, path: '/officer', section: 'Management' },
    { label: 'Grievances', icon: AlertCircle, path: '/officer#grievances', section: 'Management' },
  ],
}

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const items = NAV_ITEMS[user?.role] || []
  const sections = [...new Set(items.map(i => i.section))]

  const go = (path) => {
    navigate(path.split('#')[0])
    if (onClose) onClose()
    if (path.includes('#')) {
      setTimeout(() => {
        const el = document.getElementById(path.split('#')[1])
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }

  return (
    <>
      <div
        className={`sidebar-overlay ${open ? 'visible' : ''}`}
        onClick={onClose}
      />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div className="sidebar-logo-icon">🌾</div>
          <div>
            <div className="sidebar-logo-text">AgriSmart</div>
            <div className="sidebar-logo-sub">Admin Portal</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {/* Home */}
          <div
            className={`sidebar-link ${location.pathname === '/' ? 'active' : ''}`}
            onClick={() => go('/')}
          >
            <Sprout size={18} />
            <span>Home</span>
          </div>

          {sections.map(section => (
            <React.Fragment key={section}>
              <div className="sidebar-section-label">{section}</div>
              {items.filter(i => i.section === section).map(item => (
                <div
                  key={item.path}
                  className={`sidebar-link ${location.pathname === item.path.split('#')[0] ? 'active' : ''}`}
                  onClick={() => go(item.path)}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                  {location.pathname === item.path.split('#')[0] && (
                    <ChevronRight size={16} style={{ marginLeft: 'auto', opacity: .6 }} />
                  )}
                </div>
              ))}
            </React.Fragment>
          ))}
        </nav>

        {/* User footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">{user?.role}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
