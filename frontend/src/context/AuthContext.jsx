import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/claimService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('cf_user')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // Verify token on mount
  useEffect(() => {
    const token = localStorage.getItem('cf_token')
    if (token && !user) {
      authService.getMe()
        .then((u) => {
          setUser(u)
          localStorage.setItem('cf_user', JSON.stringify(u))
        })
        .catch(() => {
          localStorage.removeItem('cf_token')
          localStorage.removeItem('cf_user')
          setUser(null)
        })
        .finally(() => setInitialized(true))
    } else {
      setInitialized(true)
    }
  }, [])

  const login = useCallback(async (email, password) => {
    setLoading(true)
    try {
      const data = await authService.login(email, password)
      localStorage.setItem('cf_token', data.access_token)
      localStorage.setItem('cf_user', JSON.stringify(data.user))
      setUser(data.user)
      return data.user
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (formData) => {
    setLoading(true)
    try {
      const data = await authService.register(formData)
      localStorage.setItem('cf_token', data.access_token)
      localStorage.setItem('cf_user', JSON.stringify(data.user))
      setUser(data.user)
      return data.user
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('cf_token')
    localStorage.removeItem('cf_user')
    setUser(null)
  }, [])

  const isAdmin = user?.role === 'ADMIN'
  const isEmployee = user?.role === 'EMPLOYEE'

  return (
    <AuthContext.Provider value={{ user, loading, initialized, login, register, logout, isAdmin, isEmployee }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
