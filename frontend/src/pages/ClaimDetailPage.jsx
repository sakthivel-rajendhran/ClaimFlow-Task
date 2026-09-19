import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, FileText, CheckCircle, Clock, XCircle, RefreshCw, ExternalLink } from 'lucide-react'
import AppLayout from '../layouts/AppLayout'
import { claimService } from '../services/claimService'
import { formatCurrency, formatDate, formatDateTime, truncateId } from '../utils/formatters'
import StatusBadge from '../components/StatusBadge'
import SEO from '../components/SEO'

const TIMELINE_STEPS = [
  { key: 'submitted', label: 'Submitted', icon: <FileText size={14} /> },
  { key: 'review', label: 'Under Review', icon: <Clock size={14} /> },
  { key: 'resolved', label: 'Decision Made', icon: <CheckCircle size={14} /> },
  { key: 'processed', label: 'Processed', icon: <RefreshCw size={14} /> },
]

function getTimelineStatus(status) {
  if (status === 'PENDING') return 1
  if (status === 'APPROVED' || status === 'REJECTED') return 2
  if (status === 'PROCESSED') return 3
  return 0
}

export default function ClaimDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [claim, setClaim] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [imgZoomed, setImgZoomed] = useState(false)

  useEffect(() => {
    claimService.getClaim(id)
      .then(setClaim)
      .catch((e) => setError(e.response?.data?.detail || 'Claim not found'))
      .finally(() => setLoading(false))
  }, [id])

  const isImage = claim?.receipt?.mime_type?.startsWith('image/')
  const isPdf = claim?.receipt?.mime_type === 'application/pdf'
  const receiptUrl = claim?.receipt?.image_url

  const timelineStep = claim ? getTimelineStatus(claim.status) : 0

  if (loading) {
    return (
      <AppLayout title="Claim Details">
        <div className="page-loader">
          <div className="spinner spinner-lg" aria-label="Loading claim details" />
          <span>Loading claim details...</span>
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout title="Claim Details">
        <div className="empty-state">
          <div className="empty-state-icon"><XCircle size={32} /></div>
          <h3>Claim not found</h3>
          <p>{error}</p>
          <Link to="/claims" className="btn btn-primary btn-sm">Back to My Claims</Link>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Claim Details">
      <SEO title={`Claim ${truncateId(id)}`} noIndex />
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <button className="btn btn-ghost btn-icon" onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowLeft size={18} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 className="page-title" style={{ fontSize: '1.4rem' }}>
                Claim {truncateId(claim.id)}
              </h2>
              <StatusBadge status={claim.status} />
            </div>
            <p className="page-subtitle">Submitted on {formatDateTime(claim.submission_date)}</p>
          </div>
        </div>

        <div className="review-layout">
          {/* Left: Receipt */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Receipt</h3>
                {receiptUrl && (
                  <a
                    href={receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost btn-sm"
                    style={{ gap: 6 }}
                  >
                    <ExternalLink size={14} /> Open
                  </a>
                )}
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                {isImage && receiptUrl ? (
                  <div className="receipt-viewer">
                    <img
                      src={receiptUrl}
                      alt={`Receipt from ${claim.receipt.merchant_name}`}
                      className={`receipt-image${imgZoomed ? ' zoomed' : ''}`}
                      onClick={() => setImgZoomed(z => !z)}
                      title={imgZoomed ? 'Click to zoom out' : 'Click to zoom in'}
                    />
                    <button
                      className="zoom-btn"
                      onClick={() => setImgZoomed(z => !z)}
                      aria-label={imgZoomed ? 'Zoom out receipt' : 'Zoom in receipt'}
                    >
                      {imgZoomed ? '🔍−' : '🔍+'}
                    </button>
                  </div>
                ) : isPdf && receiptUrl ? (
                  <div className="receipt-pdf-placeholder">
                    <div style={{ fontSize: 56 }}>📄</div>
                    <h4 style={{ fontSize: '1rem' }}>PDF Receipt</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                      {claim.receipt.original_filename}
                    </p>
                    <a
                      href={receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm"
                    >
                      <ExternalLink size={14} /> Open PDF
                    </a>
                  </div>
                ) : (
                  <div className="receipt-pdf-placeholder">
                    <div className="empty-state-icon"><FileText size={28} /></div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Receipt unavailable</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Details + Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Claim info */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Claim Details</h3>
              </div>
              <div className="card-body">
                <dl style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    ['Merchant', claim.receipt.merchant_name],
                    ['Amount', formatCurrency(claim.total_amount)],
                    ['Category', claim.receipt.category],
                    ['Expense Date', formatDate(claim.receipt.expense_date)],
                    ['Submitted', formatDateTime(claim.submission_date)],
                    ['Receipt File', claim.receipt.original_filename],
                  ].map(([label, val]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                      <dt style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600, flexShrink: 0 }}>{label}</dt>
                      <dd style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text)', textAlign: 'right' }}>{val}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            {/* Rejection reason */}
            {claim.status === 'REJECTED' && claim.admin_notes && (
              <div className="card" style={{ borderColor: 'var(--danger)', background: 'var(--danger-light)' }}>
                <div className="card-body">
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <XCircle size={18} color="var(--danger)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--danger)', fontSize: '0.9rem', marginBottom: 4 }}>
                        Rejection Reason
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        {claim.admin_notes}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Approval note */}
            {claim.status === 'APPROVED' && claim.admin_notes && (
              <div className="card" style={{ borderColor: 'var(--success)', background: 'var(--success-light)' }}>
                <div className="card-body">
                  <div style={{ display: 'flex', gap: 10 }}>
                    <CheckCircle size={18} color="var(--success)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--success)', fontSize: '0.9rem', marginBottom: 4 }}>
                        Admin Note
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {claim.admin_notes}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Status Timeline</h3>
              </div>
              <div className="card-body">
                <div className="claim-timeline">
                  {TIMELINE_STEPS.map((step, idx) => {
                    const isDone = idx < timelineStep
                    const isCurrent = idx === timelineStep
                    const isRejectedStep = step.key === 'resolved' && claim.status === 'REJECTED'

                    return (
                      <div
                        key={step.key}
                        className={`timeline-step${isDone ? ' done' : ''}${isCurrent ? ' current' : ''}`}
                      >
                        <div className="timeline-dot" aria-hidden="true" style={isRejectedStep ? { borderColor: 'var(--danger)', background: 'var(--danger)', color: '#fff' } : {}}>
                          {isDone || isCurrent ? step.icon : idx + 1}
                        </div>
                        <div className="timeline-content">
                          <div className="timeline-label">
                            {step.key === 'resolved'
                              ? (claim.status === 'APPROVED' ? 'Approved' : claim.status === 'REJECTED' ? 'Rejected' : 'Decision Made')
                              : step.label}
                          </div>
                          {step.key === 'submitted' && (
                            <div className="timeline-date">{formatDate(claim.submission_date)}</div>
                          )}
                          {step.key === 'resolved' && claim.reviewed_at && (
                            <div className="timeline-date">{formatDate(claim.reviewed_at)}</div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
