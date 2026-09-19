export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export const formatDate = (dateStr, opts = {}) => {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  if (isNaN(date)) return '—'
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...opts,
  })
}

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  if (isNaN(date)) return '—'
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let size = bytes
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024
    i++
  }
  return `${size.toFixed(1)} ${units[i]}`
}

export const getInitials = (name) => {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export const getErrorMessage = (error) => {
  if (error?.response?.data?.detail) {
    const detail = error.response.data.detail
    if (Array.isArray(detail)) {
      return detail.map((d) => d.msg).join(', ')
    }
    return detail
  }
  if (error?.message) return error.message
  return 'An unexpected error occurred. Please try again.'
}

export const truncateId = (id) => {
  if (!id) return ''
  return `#${id.slice(-8).toUpperCase()}`
}

export const getMonthName = (month) => {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return months[month - 1] || ''
}
