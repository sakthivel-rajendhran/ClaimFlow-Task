import { useDropzone } from 'react-dropzone'
import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Upload, X, FileText, Image, AlertCircle, CheckCircle, ArrowLeft, Send, User
} from 'lucide-react'
import AppLayout from '../layouts/AppLayout'
import { claimService } from '../services/claimService'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { formatFileSize, getErrorMessage } from '../utils/formatters'
import SEO from '../components/SEO'

const CATEGORIES = ['Travel', 'Meals', 'Supplies', 'Accommodation', 'Transportation', 'Other']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export default function CreateClaimPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { success, error } = useToast()
  const [form, setForm] = useState({
    merchant_name: '',
    amount: '',
    category: '',
    expense_date: '',
  })
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: '' }))
  }

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length > 0) {
      const err = rejected[0].errors[0]
      if (err.code === 'file-too-large') {
        setErrors((e) => ({ ...e, receipt: 'File is too large. Max 10MB allowed.' }))
      } else if (err.code === 'file-invalid-type') {
        setErrors((e) => ({ ...e, receipt: 'Unsupported file type. Please use JPG, PNG or PDF.' }))
      }
      return
    }
    if (accepted.length > 0) {
      const f = accepted[0]
      setFile(f)
      setErrors((e) => ({ ...e, receipt: '' }))
      if (f.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (ev) => setPreview(ev.target.result)
        reader.readAsDataURL(f)
      } else {
        setPreview(null)
      }
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'application/pdf': ['.pdf'] },
    maxSize: MAX_SIZE,
    maxFiles: 1,
  })

  const removeFile = () => {
    setFile(null)
    setPreview(null)
  }

  const validate = () => {
    const e = {}
    if (!form.merchant_name.trim()) e.merchant_name = 'Merchant name is required'
    if (!form.amount) e.amount = 'Amount is required'
    else if (isNaN(form.amount) || Number(form.amount) <= 0) e.amount = 'Enter a valid positive amount'
    if (!form.category) e.category = 'Please select a category'
    if (!form.expense_date) e.expense_date = 'Expense date is required'
    else if (new Date(form.expense_date) > new Date()) e.expense_date = 'Date cannot be in the future'
    if (!file) e.receipt = 'Receipt is required. Please upload a file.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('merchant_name', form.merchant_name.trim())
      fd.append('amount', form.amount)
      fd.append('category', form.category)
      fd.append('expense_date', form.expense_date)
      fd.append('receipt', file)
      await claimService.createClaim(fd)
      success('Claim submitted!', 'Your expense claim has been submitted for review.')
      navigate('/claims')
    } catch (err) {
      error('Submission failed', getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <AppLayout title="New Claim">
      <SEO title="New Expense Claim" noIndex />
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <button className="btn btn-ghost btn-icon" onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowLeft size={18} />
          </button>
          <div className="page-header" style={{ margin: 0 }}>
            <h2 className="page-title" style={{ fontSize: '1.4rem' }}>Submit Expense Claim</h2>
            <p className="page-subtitle">Fill in the details and upload your receipt</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Claim Details Card */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Claim Details</h3>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {/* Claimant / Employee Information */}
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label" htmlFor="employee_name" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <User size={15} style={{ color: 'var(--primary)' }} /> Employee / Claimant
                    </label>
                    <input
                      id="employee_name"
                      type="text"
                      className="form-control"
                      value={user ? `${user.name} (${user.department ? user.department + ' • ' : ''}${user.email})` : 'Logged-in Employee'}
                      disabled
                      readOnly
                      style={{ background: 'var(--surface-2)', color: 'var(--text)', cursor: 'default' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 4, display: 'block' }}>
                      Automatically submitted under your authenticated employee account.
                    </span>
                  </div>

                  {/* Merchant / Vendor Information */}
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label" htmlFor="merchant_name">
                      Merchant / Vendor Name <span className="required" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="merchant_name" type="text"
                      className={`form-control${errors.merchant_name ? ' error' : ''}`}
                      placeholder="e.g. ABC Restaurant, IndiGo Airlines, Amazon, Staples"
                      value={form.merchant_name}
                      onChange={(e) => set('merchant_name', e.target.value)}
                      aria-invalid={!!errors.merchant_name}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 4, display: 'block' }}>
                      The vendor or business where the expense was incurred (distinct from employee).
                    </span>
                    {errors.merchant_name && <span className="form-error" role="alert">{errors.merchant_name}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="amount">
                      Amount (₹) <span className="required" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="amount" type="number"
                      className={`form-control${errors.amount ? ' error' : ''}`}
                      placeholder="0.00"
                      value={form.amount}
                      onChange={(e) => set('amount', e.target.value)}
                      min="0.01"
                      step="0.01"
                      aria-invalid={!!errors.amount}
                    />
                    {errors.amount && <span className="form-error" role="alert">{errors.amount}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="expense_date">
                      Expense Date <span className="required" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="expense_date" type="date"
                      className={`form-control${errors.expense_date ? ' error' : ''}`}
                      value={form.expense_date}
                      onChange={(e) => set('expense_date', e.target.value)}
                      max={today}
                      aria-invalid={!!errors.expense_date}
                    />
                    {errors.expense_date && <span className="form-error" role="alert">{errors.expense_date}</span>}
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label" htmlFor="category">
                      Category <span className="required" aria-hidden="true">*</span>
                    </label>
                    <select
                      id="category"
                      className={`form-control${errors.category ? ' error' : ''}`}
                      value={form.category}
                      onChange={(e) => set('category', e.target.value)}
                      aria-invalid={!!errors.category}
                    >
                      <option value="">Select expense category</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {errors.category && <span className="form-error" role="alert">{errors.category}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Receipt Upload Card */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Receipt</h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>JPG, PNG, PDF • Max 10MB</span>
              </div>
              <div className="card-body">
                {!file ? (
                  <>
                    <div
                      {...getRootProps()}
                      className={`upload-zone${isDragActive ? ' drag-active' : ''}`}
                      role="button"
                      tabIndex={0}
                      aria-label="Upload receipt file"
                      style={errors.receipt ? { borderColor: 'var(--danger)' } : {}}
                    >
                      <input {...getInputProps()} aria-label="Receipt file input" />
                      <div className="upload-zone-icon" aria-hidden="true">
                        <Upload size={26} />
                      </div>
                      <h4>
                        {isDragActive ? 'Drop your receipt here' : 'Upload Receipt'}
                      </h4>
                      <p style={{ marginBottom: 14 }}>
                        Drag &amp; drop your file, or <span style={{ color: 'var(--primary)', fontWeight: 600 }}>browse</span>
                      </p>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                        {['JPG', 'PNG', 'PDF'].map(t => (
                          <span key={t} style={{
                            padding: '3px 10px', borderRadius: 'var(--radius-full)',
                            background: 'var(--surface-3)', border: '1px solid var(--border)',
                            fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)',
                          }}>{t}</span>
                        ))}
                      </div>
                    </div>
                    {errors.receipt && (
                      <div className="form-error" role="alert" style={{ marginTop: 8 }}>
                        <AlertCircle size={13} /> {errors.receipt}
                      </div>
                    )}
                  </>
                ) : (
                  <div>
                    <div className="file-preview">
                      {preview ? (
                        <img src={preview} alt="Receipt preview" className="file-preview-thumb" />
                      ) : (
                        <div style={{
                          width: 48, height: 48, borderRadius: 'var(--radius-sm)',
                          background: 'var(--danger-light)', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', color: 'var(--danger)',
                          flexShrink: 0
                        }}>
                          <FileText size={24} />
                        </div>
                      )}
                      <div className="file-preview-info">
                        <div className="file-preview-name">{file.name}</div>
                        <div className="file-preview-size">{formatFileSize(file.size)}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, color: 'var(--success)', fontSize: '0.75rem', fontWeight: 600 }}>
                          <CheckCircle size={13} /> Ready to upload
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-ghost btn-icon-sm"
                        onClick={removeFile}
                        aria-label="Remove file"
                        title="Remove file"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {/* Image preview */}
                    {preview && (
                      <div style={{ marginTop: 12, borderRadius: 'var(--radius-md)', overflow: 'hidden', maxHeight: 200 }}>
                        <img src={preview} alt="Receipt image preview" style={{ width: '100%', objectFit: 'contain', maxHeight: 200 }} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
                Cancel
              </button>
              <button
                type="submit"
                className={`btn btn-primary${loading ? ' btn-loading' : ''}`}
                disabled={loading}
                style={{ minWidth: 160 }}
              >
                <span className="btn-text" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Send size={16} /> Submit Claim
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
