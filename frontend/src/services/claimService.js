import api from './api'

export const authService = {
  async register(data) {
    const res = await api.post('/auth/register', data)
    return res.data
  },

  async login(email, password) {
    const res = await api.post('/auth/login', { email, password })
    return res.data
  },

  async getMe() {
    const res = await api.get('/auth/me')
    return res.data
  },
}

export const claimService = {
  async createClaim(formData) {
    const res = await api.post('/claims', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },

  async listClaims(params = {}) {
    const res = await api.get('/claims', { params })
    return res.data
  },

  async getClaim(id) {
    const res = await api.get(`/claims/${id}`)
    return res.data
  },
}

export const adminService = {
  async getStats() {
    const res = await api.get('/admin/stats')
    return res.data
  },

  async listClaims(params = {}) {
    const res = await api.get('/admin/claims', { params })
    return res.data
  },

  async getClaim(id) {
    const res = await api.get(`/admin/claims/${id}`)
    return res.data
  },

  async updateClaim(id, data) {
    const res = await api.patch(`/admin/claims/${id}`, data)
    return res.data
  },

  async listUsers(params = {}) {
    const res = await api.get('/admin/users', { params })
    return res.data
  },
}
