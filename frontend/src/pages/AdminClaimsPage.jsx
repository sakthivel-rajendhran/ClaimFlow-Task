import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Eye } from 'lucide-react'
import AppLayout from '../layouts/AppLayout'
import { adminService } from '../services/claimService'
import { formatCurrency, formatDate, truncateId } from '../utils/formatters'
import StatusBadge from '../components/StatusBadge'
import SEO from '../components/SEO'

const STATUSES = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'PROCESSED']
const CATEGORIES = ['ALL', 'Travel', 'Meals', 'Supplies', 'Accommodation', 'Transportation', 'Other']
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'highest', label: 'Highest Amount' },
  { value: 'lowest', label: 'Lowest Amount' },
]

export default function AdminClaimsPage({ pendingOnly = false }) {
  const [searchParams] = useSearchParams()
  const [claims, setClaims] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState(pendingOnly ? 'PENDING' : 'ALL')
  const [category, setCategory] = useState('ALL')
  const [sort, setSort] = useState('newest')

  const fetchClaims = (params = {}) => {
    setLoading(true)
    const query = {
      page,
      per_page: 15,
      sort,
      search: search || undefined,
      status: status !== 'ALL' ? status : undefined,
      category: category !== 'ALL' ? category : undefined,
      ...params,
    }
    adminService.listClaims(query)
      .then(res => {
        setClaims(res.claims || [])
        setTotal(res.total || 0)
        setPages(res.pages || 1)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchClaims() }, [page, status, category, sort])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchClaims({ page: 1 })
  }

  const title = pendingOnly ? 'Pending Claims' : 'All Claims'

  return (
    <AppLayout title={title}>
      <SEO title={title} noIndex />
      <div>
        <div className="page-header">
          <h2 className="page-title">{title}</h2>
          <p className="page-subtitle">{total} claim{total !== 1 ? 's' : ''} found</p>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, flex: 1, minWidth: 200 }}>
            <div className="search-input-wrap" style={{ flex: 1 }}>
              <Search size={16} className="search-icon" aria-hidden="true" />
              <input
                type="search"
                className="search-input"
                placeholder="Search merchant, employee..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search claims"
              />
            </div>
            <button type="submit" className="btn btn-secondary btn-sm">Search</button>
          </form>

          {!pendingOnly && (
            <select
              className="sort-select"
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1) }}
              aria-label="Filter by status"
            >
              {STATUSES.map(s => <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s}</option>)}
            </select>
          )}

          <select
            className="sort-select"
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1) }}
            aria-label="Filter by category"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c === 'ALL' ? 'All Categories' : c}</option>)}
          </select>

          <select
            className="sort-select"
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1) }}
            aria-label="Sort claims"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="card">
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 'var(--radius-lg)' }}>
            <table className="table" aria-label={`${title} table`}>
              <thead>
                <tr>
                  <th scope="col">Claim ID</th>
                  <th scope="col">Employee</th>
                  <th scope="col">Merchant</th>
                  <th scope="col">Category</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Exp. Date</th>
                  <th scope="col">Submitted</th>
                  <th scope="col">Status</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? [1,2,3,4,5].map(i => (
                    <tr key={i}>
                      {Array(9).fill(0).map((_, j) => (
                        <td key={j}><div className="skeleton" style={{ height: 14, borderRadius: 4 }} /></td>
                      ))}
                    </tr>
                  ))
                  : claims.length === 0
                    ? (
                      <tr>
                        <td colSpan={9}>
                          <div className="empty-state">
                            <div className="empty-state-icon">📋</div>
                            <h3>{pendingOnly ? 'No pending claims' : 'No claims found'}</h3>
                            <p>
                              {pendingOnly
                                ? 'All claims have been reviewed. Great job!'
                                : 'No claims match your current filters.'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )
                    : claims.map(claim => (
                      <tr key={claim.id}>
                        <td>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>
                            {truncateId(claim.id)}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500, color: 'var(--text)', fontSize: '0.875rem' }}>
                            {claim.employee_name || '—'}
                          </div>
                          <div style={{ fontSize: '0.73rem', color: 'var(--muted)' }}>
                            {claim.employee_department}
                          </div>
                        </td>
                        <td style={{ fontWeight: 500, color: 'var(--text)' }}>{claim.receipt.merchant_name}</td>
                        <td>{claim.receipt.category}</td>
                        <td style={{ fontWeight: 700, color: 'var(--text)' }}>{formatCurrency(claim.total_amount)}</td>
                        <td>{formatDate(claim.receipt.expense_date)}</td>
                        <td>{formatDate(claim.submission_date)}</td>
                        <td><StatusBadge status={claim.status} /></td>
                        <td>
                          <Link
                            to={`/admin/claims/${claim.id}`}
                            className={`btn btn-sm${claim.status === 'PENDING' ? ' btn-primary' : ' btn-ghost'}`}
                            style={{ gap: 6 }}
                          >
                            <Eye size={14} /> {claim.status === 'PENDING' ? 'Review' : 'View'}
                          </Link>
                        </td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="card-footer">
              <div className="pagination" aria-label="Pagination">
                <button className="page-btn" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} aria-label="Previous page">‹</button>
                {Array.from({ length: Math.min(pages, 7) }, (_, i) => i+1).map(p => (
                  <button key={p} className={`page-btn${p===page?' active':''}`} onClick={() => setPage(p)} aria-label={`Page ${p}`} aria-current={p===page?'page':undefined}>{p}</button>
                ))}
                <button className="page-btn" onClick={() => setPage(p => Math.min(pages, p+1))} disabled={page===pages} aria-label="Next page">›</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
