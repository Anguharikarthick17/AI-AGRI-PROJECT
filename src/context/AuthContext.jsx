import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const DEMO_USERS = {
  'farmer@agri.gov.in': { password: 'farmer123', role: 'farmer', name: 'Rajesh Kumar', id: 'farmer-001' },
  'officer@agri.gov.in': { password: 'officer123', role: 'officer', name: 'Priya Sharma', id: 'officer-001' },
  'admin@agri.gov.in': { password: 'admin123', role: 'admin', name: 'Anand Verma', id: 'admin-001' },
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem('agrismart_user')
    if (saved) setUser(JSON.parse(saved))
  }, [])

  const login = (email, password) => {
    const found = DEMO_USERS[email]
    if (found && found.password === password) {
      const userData = { email, role: found.role, name: found.name, id: found.id }
      setUser(userData)
      localStorage.setItem('agrismart_user', JSON.stringify(userData))
      return { success: true, user: userData }
    }
    return { success: false, error: 'Invalid credentials' }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('agrismart_user')
  }

  const addNotification = (msg, type = 'info') => {
    const n = { id: Date.now(), msg, type, time: new Date() }
    setNotifications(prev => [n, ...prev.slice(0, 9)])
  }

  const clearNotifications = () => setNotifications([])

  return (
    <AuthContext.Provider value={{ user, login, logout, notifications, addNotification, clearNotifications }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
