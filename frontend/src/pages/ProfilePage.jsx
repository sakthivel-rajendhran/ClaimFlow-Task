import { useState } from 'react'
import AppLayout from '../layouts/AppLayout'
import { useAuth } from '../context/AuthContext'
import { formatDate, getInitials } from '../utils/formatters'
import { User, Mail, Building2, Shield, Calendar } from 'lucide-react'
import SEO from '../components/SEO'

export default function ProfilePage() {
  const { user } = useAuth()

  const fields = [
    { icon: <User size={16} />, label: 'Full Name', value: user?.name },
    { icon: <Mail size={16} />, label: 'Email', value: user?.email },
    { icon: <Building2 size={16} />, label: 'Department', value: user?.department },
    { icon: <Shield size={16} />, label: 'Role', value: user?.role },
    { icon: <Calendar size={16} />, label: 'Member Since', value: formatDate(user?.created_at) },
  ]

  return (
    <AppLayout title="Profile">
      <SEO title="Profile" noIndex />
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className="page-header">
          <h2 className="page-title">My Profile</h2>
          <p className="page-subtitle">Your account information</p>
        </div>

        <div className="card">
          <div className="card-body">
            {/* Avatar + name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
              <div style={{
                width: 72, height: 72,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: '1.6rem', fontWeight: 800,
                boxShadow: 'var(--shadow-glow)',
              }}>
                {getInitials(user?.name)}
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 4 }}>{user?.name}</h3>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>{user?.role}</span>
              </div>
            </div>

            {/* Fields */}
            <dl style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {fields.map(f => (
                <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 'var(--radius-md)',
                    background: 'var(--surface-2)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    color: 'var(--primary)', flexShrink: 0
                  }}>
                    {f.icon}
                  </div>
                  <div>
                    <dt style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</dt>
                    <dd style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', marginTop: 2 }}>{f.value || '—'}</dd>
                  </div>
                </div>
              ))}
            </dl>

            <div style={{ marginTop: 24, padding: 14, borderRadius: 'var(--radius-md)', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: 0 }}>
                <strong style={{ color: 'var(--text)' }}>Security note:</strong> To change your email or password, please contact your system administrator.
                Your account role cannot be self-modified for security reasons.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
