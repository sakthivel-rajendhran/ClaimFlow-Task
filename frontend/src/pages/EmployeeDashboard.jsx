import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FileText, PlusCircle, Clock, CheckCircle, XCircle, DollarSign, ArrowRight, TrendingUp } from 'lucide-react'
import AppLayout from '../layouts/AppLayout'
import { useAuth } from '../context/AuthContext'
import { claimService } from '../services/claimService'
import { formatCurrency, formatDate, truncateId } from '../utils/formatters'
import StatusBadge from '../components/StatusBadge'
import SEO from '../components/SEO'

function StatCard({ icon, label, value, color, accent }) {
  return (
    <div className="stat-card card-hover">
      <div className="stat-card-accent" style={{ background: accent || color }} aria-hidden="true" />
      <div className="stat-icon" style={{ background: `${color}20`, color }}>
        {icon}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

function SkeletonRow() {
  return (
    <tr>
      {[1,2,3,4,5,6].map(i => (
        <td key={i}><div className="skeleton" style={{ height: 16, borderRadius: 4 }} /></td>
      ))}
    </tr>
  )
}

export default function EmployeeDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    claimService.listClaims({ per_page: 5, sort: 'newest' })
      .then((res) => setData(res))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const claims = data?.claims || []
  const total = data?.total || 0

  const stats = {
    total,
    pending: claims.filter(c => c.status === 'PENDING').length,
    approved: claims.filter(c => c.status === 'APPROVED').length,
    rejected: claims.filter(c => c.status === 'REJECTED').length,
    totalAmount: claims.reduce((s, c) => s + c.total_amount, 0),
  }

  // Fetch all for accurate stats
  const [allStats, setAllStats] = useState(null)
  useEffect(() => {
    claimService.listClaims({ per_page: 100, sort: 'newest' })
      .then((res) => {
        const all = res.claims || []
        setAllStats({
          total: res.total,
          pending: all.filter(c => c.status === 'PENDING').length,
          approved: all.filter(c => c.status === 'APPROVED').length,
          rejected: all.filter(c => c.status === 'REJECTED').length,
          processed: all.filter(c => c.status === 'PROCESSED').length,
          totalAmount: all.reduce((s, c) => s + c.total_amount, 0),
        })
      })
      .catch(() => {})
  }, [])

  const s = allStats || {
    total, pending: 0, approved: 0, rejected: 0, processed: 0, totalAmount: 0
  }

  return (
    <AppLayout title="Dashboard">
      <SEO title="Dashboard" noIndex />
      <div>
        {/* Welcome */}
        <div className="page-header">
          <h2 className="page-title">
            Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋
          </h2>
          <p className="page-subtitle">Here's an overview of your expense claims</p>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <StatCard
            icon={<FileText size={22} />}
            label="Total Claims"
            value={loading ? '—' : s.total}
            color="var(--primary)"
          />
          <StatCard
            icon={<Clock size={22} />}
            label="Pending"
            value={loading ? '—' : s.pending}
            color="var(--warning)"
          />
          <StatCard
            icon={<CheckCircle size={22} />}
            label="Approved"
            value={loading ? '—' : s.approved}
            color="var(--success)"
          />
          <StatCard
            icon={<XCircle size={22} />}
            label="Rejected"
            value={loading ? '—' : s.rejected}
            color="var(--danger)"
          />
          <StatCard
            icon={<TrendingUp size={22} />}
            label="Total Claimed"
            value={loading ? '—' : formatCurrency(s.totalAmount)}
            color="var(--accent)"
          />
        </div>

        {/* Quick action */}
        <div style={{ marginBottom: 24 }}>
          <Link to="/claims/new" className="btn btn-primary" style={{ width: 'fit-content' }}>
            <PlusCircle size={18} /> Submit New Claim
          </Link>
        </div>

        {/* Recent claims */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Claims</h3>
            <Link to="/claims" className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="table-wrapper" style={{ borderRadius: '0 0 var(--radius-lg) var(--radius-lg)', border: 'none' }}>
            <table className="table" aria-label="Recent expense claims">
              <thead>
                <tr>
                  <th scope="col">Claim ID</th>
                  <th scope="col">Merchant</th>
                  <th scope="col">Category</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Date</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? [1,2,3].map(i => <SkeletonRow key={i} />)
                  : claims.length === 0
                    ? (
                      <tr>
                        <td colSpan={6}>
                          <div className="empty-state" style={{ padding: '40px 24px' }}>
                            <div className="empty-state-icon"><FileText size={32} /></div>
                            <h3>No claims yet</h3>
                            <p>Submit your first expense claim to get started</p>
                            <Link to="/claims/new" className="btn btn-primary btn-sm">
                              <PlusCircle size={16} /> New Claim
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )
                    : claims.map((claim) => (
                      <tr key={claim.id}>
                        <td>
                          <Link to={`/claims/${claim.id}`} style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.82rem' }}>
                            {truncateId(claim.id)}
                          </Link>
                        </td>
                        <td style={{ fontWeight: 500, color: 'var(--text)' }}>{claim.receipt.merchant_name}</td>
                        <td>{claim.receipt.category}</td>
                        <td style={{ fontWeight: 600, color: 'var(--text)' }}>{formatCurrency(claim.total_amount)}</td>
                        <td>{formatDate(claim.receipt.expense_date)}</td>
                        <td><StatusBadge status={claim.status} /></td>
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

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
