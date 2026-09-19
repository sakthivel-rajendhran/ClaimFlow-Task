import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FileText, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getErrorMessage } from '../utils/formatters'
import SEO from '../components/SEO'

export default function LoginPage() {
  const { login } = useAuth()
  const { success, error } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      success('Welcome back!', `Logged in as ${user.name}`)
      navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard', { replace: true })
    } catch (err) {
      error('Login failed', getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SEO
        title="Login"
        description="Login to ClaimFlow to manage your expense claims and reimbursements."
        canonical="/login"
        noIndex={false}
      />
      <div className="auth-page">
        <div className="auth-glow" style={{ top: '20%', left: '20%' }} aria-hidden="true" />
        <div className="auth-glow" style={{ bottom: '10%', right: '15%' }} aria-hidden="true" />

        <div className="auth-card slide-up">
          <Link to="/" className="auth-logo" aria-label="ClaimFlow home">
            <div className="auth-logo-icon"><FileText size={22} /></div>
            <span className="auth-logo-text">ClaimFlow</span>
          </Link>

          <h1 className="auth-heading">Welcome back</h1>
          <p className="auth-subheading">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Email address <span className="required" aria-hidden="true">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  className={`form-control${errors.email ? ' error' : ''}`}
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={(e) => {
                    const val = e.target.value
                    setForm((prev) => ({ ...prev, email: val }))
                    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }))
                  }}
                  autoComplete="email"
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  aria-invalid={!!errors.email}
                />
                {errors.email && <span id="email-error" className="form-error" role="alert">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">
                  Password <span className="required" aria-hidden="true">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className={`form-control${errors.password ? ' error' : ''}`}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => {
                      const val = e.target.value
                      setForm((prev) => ({ ...prev, password: val }))
                      if (errors.password) setErrors((prev) => ({ ...prev, password: '' }))
                    }}
                    autoComplete="current-password"
                    aria-describedby={errors.password ? 'password-error' : undefined}
                    aria-invalid={!!errors.password}
                    style={{ paddingRight: 48 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="password-toggle-btn"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <span id="password-error" className="form-error" role="alert">{errors.password}</span>}
              </div>

              <button
                type="submit"
                className={`btn btn-primary btn-lg w-full${loading ? ' btn-loading' : ''}`}
                disabled={loading}
              >
                <span className="btn-text" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  Sign In <ArrowRight size={18} />
                </span>
              </button>
            </div>
          </form>

          <p className="auth-footer">
            Don't have an account?{' '}
            <Link to="/register" style={{ fontWeight: 600 }}>Create account</Link>
          </p>
        </div>
      </div>
    </>
  )
}
