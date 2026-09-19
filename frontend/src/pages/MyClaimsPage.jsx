import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, FileText, PlusCircle, Eye } from 'lucide-react'
import AppLayout from '../layouts/AppLayout'
import { claimService } from '../services/claimService'
import { formatCurrency, formatDate, truncateId } from '../utils/formatters'
import StatusBadge from '../components/StatusBadge'
import SEO from '../components/SEO'

const STATUSES = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'PROCESSED']
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'highest', label: 'Highest Amount' },
  { value: 'lowest', label: 'Lowest Amount' },
]

export default function MyClaimsPage() {
  const [claims, setClaims] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('ALL')
  const [sort, setSort] = useState('newest')

  const fetchClaims = (params = {}) => {
    setLoading(true)
    const query = {
      page,
      per_page: 10,
      sort,
      search: search || undefined,
      status: status !== 'ALL' ? status : undefined,
      ...params,
    }
    claimService.listClaims(query)
      .then(res => {
        setClaims(res.claims || [])
        setTotal(res.total || 0)
        setPages(res.pages || 1)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchClaims() }, [page, status, sort])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchClaims({ page: 1 })
  }

  const handleStatusChange = (s) => {
    setStatus(s)
    setPage(1)
  }

  return (
    <AppLayout title="My Claims">
      <SEO title="My Claims" noIndex />
      <div>
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 className="page-title">My Claims</h2>
              <p className="page-subtitle">{total} total expense claim{total !== 1 ? 's' : ''}</p>
            </div>
            <Link to="/claims/new" className="btn btn-primary">
              <PlusCircle size={18} /> New Claim
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, flex: 1, minWidth: 200 }}>
            <div className="search-input-wrap" style={{ flex: 1 }}>
              <Search size={16} className="search-icon" aria-hidden="true" />
              <input
                type="search"
                className="search-input"
                placeholder="Search by merchant..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search claims"
              />
            </div>
            <button type="submit" className="btn btn-secondary btn-sm">Search</button>
          </form>

          <select
            className="sort-select"
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1) }}
            aria-label="Sort claims"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Status filter tabs */}
        <div style={{ marginBottom: 20 }}>
          <div className="filter-tabs" role="tablist" aria-label="Filter by status">
            {STATUSES.map(s => (
              <button
                key={s}
                role="tab"
                aria-selected={status === s}
                className={`filter-tab${status === s ? ' active' : ''}`}
                onClick={() => handleStatusChange(s)}
              >
                {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="card">
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 'var(--radius-lg)' }}>
            <table className="table" aria-label="My expense claims">
              <thead>
                <tr>
                  <th scope="col">Claim ID</th>
                  <th scope="col">Merchant</th>
                  <th scope="col">Category</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Expense Date</th>
                  <th scope="col">Submitted</th>
                  <th scope="col">Status</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? [1,2,3,4,5].map(i => (
                    <tr key={i}>
                      {[1,2,3,4,5,6,7,8].map(j => (
                        <td key={j}><div className="skeleton" style={{ height: 14, borderRadius: 4 }} /></td>
                      ))}
                    </tr>
                  ))
                  : claims.length === 0
                    ? (
                      <tr>
                        <td colSpan={8}>
                          <div className="empty-state">
                            <div className="empty-state-icon"><FileText size={32} /></div>
                            <h3>No claims found</h3>
                            <p>
                              {search || status !== 'ALL'
                                ? 'No claims match your current filters.'
                                : 'Submit your first expense claim to get started.'}
                            </p>
                            {!search && status === 'ALL' && (
                              <Link to="/claims/new" className="btn btn-primary btn-sm">
                                <PlusCircle size={16} /> New Claim
                              </Link>
                            )}
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
                        <td style={{ fontWeight: 500, color: 'var(--text)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {claim.receipt.merchant_name}
                        </td>
                        <td>{claim.receipt.category}</td>
                        <td style={{ fontWeight: 700, color: 'var(--text)' }}>{formatCurrency(claim.total_amount)}</td>
                        <td>{formatDate(claim.receipt.expense_date)}</td>
                        <td>{formatDate(claim.submission_date)}</td>
                        <td><StatusBadge status={claim.status} /></td>
                        <td>
                          <Link to={`/claims/${claim.id}`} className="btn btn-ghost btn-sm" style={{ gap: 6 }}>
                            <Eye size={14} /> View
                          </Link>
                        </td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="card-footer">
              <div className="pagination" aria-label="Pagination">
                <button
                  className="page-btn"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  aria-label="Previous page"
                >‹</button>
                {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    className={`page-btn${p === page ? ' active' : ''}`}
                    onClick={() => setPage(p)}
                    aria-label={`Page ${p}`}
                    aria-current={p === page ? 'page' : undefined}
                  >{p}</button>
                ))}
                <button
                  className="page-btn"
                  onClick={() => setPage(p => Math.min(pages, p + 1))}
                  disabled={page === pages}
                  aria-label="Next page"
                >›</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
