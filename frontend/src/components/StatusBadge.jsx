const STATUS_CONFIG = {
  PENDING: { className: 'badge-pending', label: 'Pending' },
  APPROVED: { className: 'badge-approved', label: 'Approved' },
  REJECTED: { className: 'badge-rejected', label: 'Rejected' },
  PROCESSED: { className: 'badge-processed', label: 'Processed' },
}

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { className: '', label: status }
  return (
    <span
      className={`badge ${config.className}`}
      role="status"
      aria-label={`Status: ${config.label}`}
    >
      {config.label}
    </span>
  )
}
