import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

export function ProtectedRoute({ children, adminOnly = false, allowAll = false }) {
  const { user, initialized } = useAuth()
  const location = useLocation()

  if (!initialized) {
    return (
      <div className="page-loader" style={{ minHeight: '100vh' }}>
        <div className="spinner spinner-lg" aria-label="Loading" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (adminOnly && user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />
  }

  // Only redirect admins away from employee routes when not adminOnly and not allowAll
  if (!adminOnly && !allowAll && user.role === 'ADMIN') {
    return <Navigate to="/admin" replace />
  }

  return children
}

export function PublicOnlyRoute({ children }) {
  const { user, initialized } = useAuth()

  if (!initialized) {
    return (
      <div className="page-loader" style={{ minHeight: '100vh' }}>
        <div className="spinner spinner-lg" aria-label="Loading" />
      </div>
    )
  }

  if (user) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />
  }

  return children
}
