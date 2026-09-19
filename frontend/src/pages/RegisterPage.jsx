import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FileText, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getErrorMessage } from '../utils/formatters'
import SEO from '../components/SEO'

const DEPARTMENTS = [
  'Engineering', 'Finance', 'Marketing', 'Sales', 'HR',
  'Operations', 'Product', 'Design', 'Legal', 'Support', 'Other'
]

function Field({ id, label, required, error: errMsg, children }) {
  return (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>
        {label} {required && <span className="required" aria-hidden="true">*</span>}
      </label>
      {children}
      {errMsg && <span className="form-error" role="alert">{errMsg}</span>}
    </div>
  )
}

export default function RegisterPage() {
  const { register } = useAuth()
  const { success, error } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', email: '', password: '', department: ''
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) {
      setErrors((e) => ({ ...e, [field]: '' }))
    }
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Full name is required'
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters'
    if (!form.department) e.department = 'Department is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const user = await register({
        name: form.name,
        email: form.email,
        password: form.password,
        department: form.department,
      })
      success('Account created!', `Welcome to ClaimFlow, ${user.name}`)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      error('Registration failed', getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SEO
        title="Create Account"
        description="Create your ClaimFlow account to start managing employee expense claims."
        canonical="/register"
      />
      <div className="auth-page">
        <div className="auth-glow" style={{ top: '10%', right: '20%' }} aria-hidden="true" />

        <div className="auth-card slide-up" style={{ maxWidth: 480 }}>
          <Link to="/" className="auth-logo" aria-label="ClaimFlow home">
            <div className="auth-logo-icon"><FileText size={22} /></div>
            <span className="auth-logo-text">ClaimFlow</span>
          </Link>

          <h1 className="auth-heading">Create account</h1>
          <p className="auth-subheading">Start managing your expense claims today</p>

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field id="name" label="Full name" required error={errors.name}>
                <input
                  id="name" type="text"
                  className={`form-control${errors.name ? ' error' : ''}`}
                  placeholder="Sakthivel Kumar"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  autoComplete="name"
                  aria-invalid={!!errors.name}
                />
              </Field>

              <Field id="reg-email" label="Work email" required error={errors.email}>
                <input
                  id="reg-email" type="email"
                  className={`form-control${errors.email ? ' error' : ''}`}
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                />
              </Field>

              <Field id="department" label="Department" required error={errors.department}>
                <select
                  id="department"
                  className={`form-control${errors.department ? ' error' : ''}`}
                  value={form.department}
                  onChange={(e) => set('department', e.target.value)}
                  aria-invalid={!!errors.department}
                >
                  <option value="">Select department</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>

              <Field id="reg-password" label="Password" required error={errors.password}>
                <div style={{ position: 'relative' }}>
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    className={`form-control${errors.password ? ' error' : ''}`}
                    placeholder="Min 8 characters"
                    value={form.password}
                    onChange={(e) => set('password', e.target.value)}
                    autoComplete="new-password"
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
              </Field>

              <button
                type="submit"
                className={`btn btn-primary btn-lg w-full${loading ? ' btn-loading' : ''}`}
                disabled={loading}
                style={{ marginTop: 4 }}
              >
                <span className="btn-text" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  Create Account <ArrowRight size={18} />
                </span>
              </button>
            </div>
          </form>

          <p className="auth-footer">
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </>
  )
}
