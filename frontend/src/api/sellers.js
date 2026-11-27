import api from './client.js'

export const getMySellerProfile = () =>
  api.get('/api/sellers/me').then((r) => r.data)
export const updateMySellerProfile = (formData) =>
  api.put('/api/sellers/me', formData).then((r) => r.data)
export const getSellerProfile = (sellerId) =>
  api.get(`/api/sellers/${sellerId}`).then((r) => r.data)
