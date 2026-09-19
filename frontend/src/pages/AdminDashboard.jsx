import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Clock, CheckCircle, XCircle, RefreshCw, TrendingUp, Users, FileText,
  ArrowRight, BarChart2, IndianRupee
} from 'lucide-react'
import AppLayout from '../layouts/AppLayout'
import { adminService } from '../services/claimService'
import { formatCurrency, getMonthName, truncateId, formatDate } from '../utils/formatters'
import StatusBadge from '../components/StatusBadge'
import SEO from '../components/SEO'

function StatCard({ icon, label, value, color, sub }) {
  return (
    <div className="stat-card card-hover">
      <div className="stat-icon" style={{ background: `${color}20`, color }}>
        {icon}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-change up" style={{ marginTop: 6, fontSize: '0.8rem', color: 'var(--muted)' }}>{sub}</div>}
    </div>
  )
}

// Simple bar chart
function CategoryChart({ data }) {
  if (!data?.length) return null
  const max = Math.max(...data.map(d => d.total), 1)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.slice(0, 6).map(d => (
        <div key={d.category} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: '0.8rem', width: 110, flexShrink: 0, color: 'var(--muted)', fontWeight: 500 }}>
            {d.category}
          </div>
          <div style={{ flex: 1, height: 8, background: 'var(--surface-3)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${(d.total / max) * 100}%`,
              background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
              borderRadius: 4,
              transition: 'width 0.6s ease',
            }} />
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', width: 80, textAlign: 'right', flexShrink: 0 }}>
            {formatCurrency(d.total)}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [pendingClaims, setPendingClaims] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminService.getStats(),
      adminService.listClaims({ status: 'PENDING', per_page: 5, sort: 'newest' }),
    ])
      .then(([s, p]) => {
        setStats(s)
        setPendingClaims(p.claims || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const statCards = [
    { icon: <Clock size={22} />, label: 'Pending', value: stats?.pending ?? '—', color: 'var(--warning)' },
    { icon: <CheckCircle size={22} />, label: 'Approved', value: stats?.approved ?? '—', color: 'var(--success)' },
    { icon: <XCircle size={22} />, label: 'Rejected', value: stats?.rejected ?? '—', color: 'var(--danger)' },
    { icon: <RefreshCw size={22} />, label: 'Processed', value: stats?.processed ?? '—', color: 'var(--processed)' },
    { icon: <IndianRupee size={22} />, label: 'Total Claimed', value: stats ? formatCurrency(stats.total_amount) : '—', color: 'var(--accent)' },
    { icon: <TrendingUp size={22} />, label: 'Approved Amount', value: stats ? formatCurrency(stats.approved_amount) : '—', color: 'var(--primary)' },
    { icon: <Users size={22} />, label: 'Employees', value: stats?.total_employees ?? '—', color: 'var(--secondary)' },
    { icon: <FileText size={22} />, label: 'Total Claims', value: stats?.total_claims ?? '—', color: 'var(--info)' },
  ]

  return (
    <AppLayout title="Admin Dashboard">
      <SEO title="Admin Dashboard" noIndex />
      <div>
        <div className="page-header">
          <h2 className="page-title">Admin Dashboard</h2>
          <p className="page-subtitle">Real-time overview of all expense claims</p>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {statCards.map(s => <StatCard key={s.label} {...s} />)}
        </div>

        <div className="dashboard-charts-grid">
          {/* Category breakdown */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <BarChart2 size={18} style={{ marginRight: 8 }} aria-hidden="true" />
                Spend by Category
              </h3>
            </div>
            <div className="card-body">
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 8 }} />)}
                </div>
              ) : (
                <CategoryChart data={stats?.category_breakdown || []} />
              )}
            </div>
          </div>

          {/* Status distribution */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Status Distribution</h3>
            </div>
            <div className="card-body">
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 8 }} />)}
                </div>
              ) : stats ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { label: 'Pending', count: stats.pending, color: 'var(--warning)' },
                    { label: 'Approved', count: stats.approved, color: 'var(--success)' },
                    { label: 'Rejected', count: stats.rejected, color: 'var(--danger)' },
                    { label: 'Processed', count: stats.processed, color: 'var(--processed)' },
                  ].map(item => {
                    const pct = stats.total_claims ? (item.count / stats.total_claims) * 100 : 0
                    return (
                      <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ fontSize: '0.8rem', width: 80, flexShrink: 0, color: item.color, fontWeight: 600 }}>
                          {item.label}
                        </div>
                        <div style={{ flex: 1, height: 8, background: 'var(--surface-3)', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: item.color, borderRadius: 4 }} />
                        </div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', width: 36, textAlign: 'right', flexShrink: 0 }}>
                          {item.count}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Pending queue */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Clock size={18} style={{ marginRight: 8, color: 'var(--warning)' }} aria-hidden="true" />
              Pending Approval
              {stats?.pending > 0 && (
                <span className="nav-badge" style={{ marginLeft: 8, background: 'var(--warning)' }}>
                  {stats.pending}
                </span>
              )}
            </h3>
            <Link to="/admin/claims/pending" className="btn btn-ghost btn-sm" style={{ gap: 6 }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="table-wrapper" style={{ border: 'none', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)' }}>
            <table className="table" aria-label="Pending claims requiring review">
              <thead>
                <tr>
                  <th scope="col">Claim ID</th>
                  <th scope="col">Employee</th>
                  <th scope="col">Merchant</th>
                  <th scope="col">Category</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Submitted</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? [1,2,3].map(i => (
                    <tr key={i}>
                      {[1,2,3,4,5,6,7].map(j => (
                        <td key={j}><div className="skeleton" style={{ height: 14, borderRadius: 4 }} /></td>
                      ))}
                    </tr>
                  ))
                  : pendingClaims.length === 0
                    ? (
                      <tr>
                        <td colSpan={7}>
                          <div className="empty-state" style={{ padding: '32px 24px' }}>
                            <div className="empty-state-icon"><CheckCircle size={28} /></div>
                            <h3>All caught up!</h3>
                            <p>No pending claims require your review.</p>
                          </div>
                        </td>
                      </tr>
                    )
                    : pendingClaims.map(claim => (
                      <tr key={claim.id}>
                        <td>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>
                            {truncateId(claim.id)}
                          </span>
                        </td>
                        <td style={{ fontWeight: 500, color: 'var(--text)' }}>
                          {claim.employee_name || '—'}
                        </td>
                        <td>{claim.receipt.merchant_name}</td>
                        <td>{claim.receipt.category}</td>
                        <td style={{ fontWeight: 700, color: 'var(--text)' }}>{formatCurrency(claim.total_amount)}</td>
                        <td>{formatDate(claim.submission_date)}</td>
                        <td>
                          <Link to={`/admin/claims/${claim.id}`} className="btn btn-primary btn-sm">
                            Review
                          </Link>
                        </td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
