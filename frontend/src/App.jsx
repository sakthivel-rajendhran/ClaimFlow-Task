import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import { ProtectedRoute, PublicOnlyRoute } from './ProtectedRoute'

// Lazy-loaded pages (code splitting)
const LandingPage = lazy(() => import('./pages/LandingPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const EmployeeDashboard = lazy(() => import('./pages/EmployeeDashboard'))
const CreateClaimPage = lazy(() => import('./pages/CreateClaimPage'))
const MyClaimsPage = lazy(() => import('./pages/MyClaimsPage'))
const ClaimDetailPage = lazy(() => import('./pages/ClaimDetailPage'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const AdminClaimsPage = lazy(() => import('./pages/AdminClaimsPage'))
const AdminClaimReviewPage = lazy(() => import('./pages/AdminClaimReviewPage'))
const AdminEmployeesPage = lazy(() => import('./pages/AdminEmployeesPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

function PageLoader() {
  return (
    <div className="page-loader" style={{ minHeight: '100vh' }}>
      <div className="spinner spinner-lg" aria-label="Loading page" />
    </div>
  )
}

export default function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public */}
                  <Route path="/" element={<LandingPage />} />

                  {/* Auth (redirect if logged in) */}
                  <Route path="/login" element={
                    <PublicOnlyRoute><LoginPage /></PublicOnlyRoute>
                  } />
                  <Route path="/register" element={
                    <PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>
                  } />

                  {/* Employee routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute><EmployeeDashboard /></ProtectedRoute>
                  } />
                  <Route path="/claims" element={
                    <ProtectedRoute><MyClaimsPage /></ProtectedRoute>
                  } />
                  <Route path="/claims/new" element={
                    <ProtectedRoute><CreateClaimPage /></ProtectedRoute>
                  } />
                  <Route path="/claims/:id" element={
                    <ProtectedRoute><ClaimDetailPage /></ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute allowAll><ProfilePage /></ProtectedRoute>
                  } />

                  {/* Admin routes */}
                  <Route path="/admin" element={
                    <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
                  } />
                  <Route path="/admin/claims" element={
                    <ProtectedRoute adminOnly><AdminClaimsPage /></ProtectedRoute>
                  } />
                  <Route path="/admin/claims/pending" element={
                    <ProtectedRoute adminOnly><AdminClaimsPage pendingOnly /></ProtectedRoute>
                  } />
                  <Route path="/admin/claims/:id" element={
                    <ProtectedRoute adminOnly><AdminClaimReviewPage /></ProtectedRoute>
                  } />
                  <Route path="/admin/employees" element={
                    <ProtectedRoute adminOnly><AdminEmployeesPage /></ProtectedRoute>
                  } />

                  {/* 404 */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  )
}
