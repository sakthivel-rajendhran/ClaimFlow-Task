import { useState, useEffect } from 'react'
import { Search, Users as UsersIcon, Mail, Building2 } from 'lucide-react'
import AppLayout from '../layouts/AppLayout'
import { adminService } from '../services/claimService'
import { formatDate, getInitials } from '../utils/formatters'
import SEO from '../components/SEO'

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchEmployees = (params = {}) => {
    setLoading(true)
    adminService.listUsers({ page, per_page: 20, search: search || undefined, ...params })
      .then(res => {
        setEmployees(res.employees || [])
        setTotal(res.total || 0)
        setPages(res.pages || 1)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchEmployees() }, [page])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchEmployees({ page: 1 })
  }

  return (
    <AppLayout title="Employees">
      <SEO title="Employees" noIndex />
      <div>
        <div className="page-header">
          <h2 className="page-title">Employees</h2>
          <p className="page-subtitle">{total} registered employee{total !== 1 ? 's' : ''}</p>
        </div>

        {/* Search */}
        <div className="filters-bar" style={{ marginBottom: 20 }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, flex: 1 }}>
            <div className="search-input-wrap" style={{ flex: 1 }}>
              <Search size={16} className="search-icon" aria-hidden="true" />
              <input
                type="search"
                className="search-input"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search employees"
              />
            </div>
            <button type="submit" className="btn btn-secondary btn-sm">Search</button>
          </form>
        </div>

        {/* Employee cards / table */}
        <div className="card">
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 'var(--radius-lg)' }}>
            <table className="table" aria-label="Employee list">
              <thead>
                <tr>
                  <th scope="col">Employee</th>
                  <th scope="col">Email</th>
                  <th scope="col">Department</th>
                  <th scope="col">Role</th>
                  <th scope="col">Joined</th>
                  <th scope="col">Claims</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? [1,2,3,4,5].map(i => (
                    <tr key={i}>
                      {[1,2,3,4,5,6].map(j => (
                        <td key={j}><div className="skeleton" style={{ height: 14, borderRadius: 4 }} /></td>
                      ))}
                    </tr>
                  ))
                  : employees.length === 0
                    ? (
                      <tr>
                        <td colSpan={6}>
                          <div className="empty-state">
                            <div className="empty-state-icon"><UsersIcon size={32} /></div>
                            <h3>No employees found</h3>
                            <p>{search ? 'No employees match your search.' : 'No employees have registered yet.'}</p>
                          </div>
                        </td>
                      </tr>
                    )
                    : employees.map(emp => (
                      <tr key={emp.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="user-avatar" style={{ width: 32, height: 32, fontSize: '0.75rem', flexShrink: 0 }}>
                              {getInitials(emp.name)}
                            </div>
                            <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.875rem' }}>{emp.name}</div>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--muted)', fontSize: '0.85rem' }}>
                            <Mail size={13} aria-hidden="true" />
                            {emp.email}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem' }}>
                            <Building2 size={13} aria-hidden="true" color="var(--muted)" />
                            {emp.department || '—'}
                          </div>
                        </td>
                        <td>
                          <span style={{
                            padding: '3px 10px',
                            borderRadius: 'var(--radius-full)',
                            background: emp.role === 'ADMIN' ? 'var(--primary-light)' : 'var(--surface-3)',
                            color: emp.role === 'ADMIN' ? 'var(--primary)' : 'var(--muted)',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}>
                            {emp.role}
                          </span>
                        </td>
                        <td style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{formatDate(emp.created_at)}</td>
                        <td>
                          <span style={{
                            fontWeight: 700,
                            color: emp.claim_count > 0 ? 'var(--text)' : 'var(--muted)',
                          }}>
                            {emp.claim_count}
                          </span>
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
                  <button key={p} className={`page-btn${p===page?' active':''}`} onClick={() => setPage(p)} aria-label={`Page ${p}`}>{p}</button>
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
