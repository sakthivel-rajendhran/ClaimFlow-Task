import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, FileText, CheckCircle, XCircle, ExternalLink, AlertCircle, User
} from 'lucide-react'
import AppLayout from '../layouts/AppLayout'
import { adminService } from '../services/claimService'
import { useToast } from '../context/ToastContext'
import { formatCurrency, formatDate, formatDateTime, truncateId, getErrorMessage } from '../utils/formatters'
import StatusBadge from '../components/StatusBadge'
import SEO from '../components/SEO'

export default function AdminClaimReviewPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { success, error: showError } = useToast()
  const [claim, setClaim] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [imgZoomed, setImgZoomed] = useState(false)

  // Modals
  const [showApproveConfirm, setShowApproveConfirm] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectError, setRejectError] = useState('')

  // Status modal
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState('')

  useEffect(() => {
    adminService.getClaim(id)
      .then(setClaim)
      .catch(() => navigate('/admin/claims'))
      .finally(() => setLoading(false))
  }, [id])

  const handleApprove = async () => {
    setActionLoading(true)
    try {
      const updated = await adminService.updateClaim(id, { status: 'APPROVED', admin_notes: 'Verified and approved' })
      setClaim(updated)
      setShowApproveConfirm(false)
      success('Claim approved', 'The expense claim has been approved successfully.')
    } catch (err) {
      showError('Action failed', getErrorMessage(err))
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setRejectError('Rejection reason is required.')
      return
    }
    setActionLoading(true)
    try {
      const updated = await adminService.updateClaim(id, { status: 'REJECTED', admin_notes: rejectReason.trim() })
      setClaim(updated)
      setShowRejectModal(false)
      setRejectReason('')
      showError('Claim rejected', 'The expense claim has been rejected.')
    } catch (err) {
      showError('Action failed', getErrorMessage(err))
    } finally {
      setActionLoading(false)
    }
  }

  const handleMarkProcessed = async () => {
    setActionLoading(true)
    try {
      const updated = await adminService.updateClaim(id, { status: 'PROCESSED', admin_notes: claim.admin_notes || 'Processed' })
      setClaim(updated)
      success('Claim marked as processed', 'Payment has been processed.')
    } catch (err) {
      showError('Action failed', getErrorMessage(err))
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <AppLayout title="Review Claim">
        <div className="page-loader">
          <div className="spinner spinner-lg" aria-label="Loading claim" />
          <span>Loading claim...</span>
        </div>
      </AppLayout>
    )
  }

  if (!claim) return null

  const isImage = claim.receipt?.mime_type?.startsWith('image/')
  const isPdf = claim.receipt?.mime_type === 'application/pdf'
  const receiptUrl = claim.receipt?.image_url
  const isPending = claim.status === 'PENDING'
  const isApproved = claim.status === 'APPROVED'

  return (
    <AppLayout title="Review Claim">
      <SEO title={`Review Claim ${truncateId(id)}`} noIndex />
      <div>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button className="btn btn-ghost btn-icon" onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowLeft size={18} />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h2 className="page-title" style={{ fontSize: '1.4rem' }}>
                Claim {truncateId(claim.id)}
              </h2>
              <StatusBadge status={claim.status} />
            </div>
            <p className="page-subtitle">Submitted by {claim.employee_name} • {formatDateTime(claim.submission_date)}</p>
          </div>
          {isPending && (
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn btn-success"
                onClick={() => setShowApproveConfirm(true)}
                disabled={actionLoading}
                aria-label="Approve this claim"
              >
                <CheckCircle size={16} /> Approve
              </button>
              <button
                className="btn btn-danger"
                onClick={() => setShowRejectModal(true)}
                disabled={actionLoading}
                aria-label="Reject this claim"
              >
                <XCircle size={16} /> Reject
              </button>
            </div>
          )}
          {isApproved && (
            <button
              className="btn btn-secondary"
              onClick={handleMarkProcessed}
              disabled={actionLoading}
            >
              <CheckCircle size={16} /> Mark as Processed
            </button>
          )}
        </div>

        {/* Review Layout */}
        <div className="review-layout">
          {/* LEFT: Receipt */}
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
                  <ExternalLink size={14} /> Open original
                </a>
              )}
            </div>
            <div className="card-body" style={{ padding: 0, minHeight: 400 }}>
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
                    aria-label={imgZoomed ? 'Zoom out' : 'Zoom in'}
                  >
                    {imgZoomed ? '🔍−' : '🔍+'}
                  </button>
                </div>
              ) : isPdf && receiptUrl ? (
                <div className="receipt-pdf-placeholder">
                  <div style={{ fontSize: 64 }}>📄</div>
                  <h4>PDF Receipt</h4>
                  <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{claim.receipt.original_filename}</p>
                  <a
                    href={receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    <ExternalLink size={16} /> Open PDF
                  </a>
                </div>
              ) : (
                <div className="receipt-pdf-placeholder">
                  <div className="empty-state-icon"><FileText size={28} /></div>
                  <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Receipt file unavailable</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Claim info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Employee info */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title"><User size={16} style={{ marginRight: 8 }} aria-hidden="true" />Employee</h3>
              </div>
              <div className="card-body">
                <dl style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    ['Name', claim.employee_name],
                    ['Email', claim.employee_email],
                    ['Department', claim.employee_department],
                  ].map(([l, v]) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <dt style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>{l}</dt>
                      <dd style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text)' }}>{v || '—'}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            {/* Claim details */}
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
                  ].map(([l, v]) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <dt style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>{l}</dt>
                      <dd style={{ fontSize: '0.9rem', fontWeight: l === 'Amount' ? 800 : 500, color: l === 'Amount' ? 'var(--text)' : 'var(--text-secondary)', textAlign: 'right' }}>{v}</dd>
                    </div>
                  ))}
                </dl>

                {/* Admin note / rejection reason */}
                {claim.admin_notes && (
                  <div style={{
                    marginTop: 16,
                    padding: 14,
                    borderRadius: 'var(--radius-md)',
                    background: claim.status === 'REJECTED' ? 'var(--danger-light)' : 'var(--success-light)',
                    border: `1px solid ${claim.status === 'REJECTED' ? 'var(--danger)' : 'var(--success)'}`,
                  }}>
                    <div style={{
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      marginBottom: 4,
                      color: claim.status === 'REJECTED' ? 'var(--danger)' : 'var(--success)',
                    }}>
                      {claim.status === 'REJECTED' ? 'Rejection Reason' : 'Admin Note'}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{claim.admin_notes}</div>
                  </div>
                )}

                {/* Action buttons in card for pending */}
                {isPending && (
                  <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
                    <button
                      className="btn btn-success w-full"
                      onClick={() => setShowApproveConfirm(true)}
                      disabled={actionLoading}
                    >
                      <CheckCircle size={16} /> Approve Claim
                    </button>
                    <button
                      className="btn btn-danger w-full"
                      onClick={() => setShowRejectModal(true)}
                      disabled={actionLoading}
                    >
                      <XCircle size={16} /> Reject Claim
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Approve Confirmation Modal */}
      {showApproveConfirm && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="approve-title">
          <div className="modal slide-up">
            <div className="modal-header">
              <h3 className="modal-title" id="approve-title">Confirm Approval</h3>
              <button className="btn btn-ghost btn-icon-sm" onClick={() => setShowApproveConfirm(false)} aria-label="Close">
                <XCircle size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CheckCircle size={22} color="var(--success)" />
                </div>
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
                    Approve claim from {claim.employee_name}?
                  </p>
                  <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
                    Amount: <strong style={{ color: 'var(--text)' }}>{formatCurrency(claim.total_amount)}</strong> at {claim.receipt.merchant_name}
                  </p>
                  <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: 6 }}>
                    This will approve the expense claim and notify the employee.
                  </p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowApproveConfirm(false)}>Cancel</button>
              <button
                className={`btn btn-success${actionLoading ? ' btn-loading' : ''}`}
                onClick={handleApprove}
                disabled={actionLoading}
              >
                <span className="btn-text">Approve Claim</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="reject-title">
          <div className="modal slide-up">
            <div className="modal-header">
              <h3 className="modal-title" id="reject-title">Reject Claim</h3>
              <button className="btn btn-ghost btn-icon-sm" onClick={() => { setShowRejectModal(false); setRejectReason(''); setRejectError('') }} aria-label="Close">
                <XCircle size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 20 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--danger-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <XCircle size={22} color="var(--danger)" />
                </div>
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
                    Reject claim from {claim.employee_name}?
                  </p>
                  <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
                    {formatCurrency(claim.total_amount)} at {claim.receipt.merchant_name}
                  </p>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reject-reason">
                  Reason for rejection <span className="required" aria-hidden="true">*</span>
                </label>
                <textarea
                  id="reject-reason"
                  className={`form-control${rejectError ? ' error' : ''}`}
                  placeholder="Please provide a clear reason for rejecting this expense claim..."
                  value={rejectReason}
                  onChange={(e) => { setRejectReason(e.target.value); setRejectError('') }}
                  rows={4}
                  style={{ resize: 'vertical' }}
                  aria-required="true"
                  aria-invalid={!!rejectError}
                  aria-describedby={rejectError ? 'reject-error' : undefined}
                />
                {rejectError && (
                  <span id="reject-error" className="form-error" role="alert">
                    <AlertCircle size={13} /> {rejectError}
                  </span>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => { setShowRejectModal(false); setRejectReason(''); setRejectError('') }}
              >
                Cancel
              </button>
              <button
                className={`btn btn-danger${actionLoading ? ' btn-loading' : ''}`}
                onClick={handleReject}
                disabled={actionLoading}
              >
                <span className="btn-text"><XCircle size={16} /> Reject Claim</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
