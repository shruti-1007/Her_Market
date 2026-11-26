import api from './client.js'

export const getListings = (params) => api.get('/api/listings', { params }).then((r) => r.data)
export const getMyListings = () => api.get('/api/listings/mine').then((r) => r.data)
export const getListing = (id) => api.get(`/api/listings/${id}`).then((r) => r.data)
export const createListing = (formData) => api.post('/api/listings', formData).then((r) => r.data)
export const updateListing = (id, body) => api.put(`/api/listings/${id}`, body).then((r) => r.data)
export const deleteListing = (id) => api.delete(`/api/listings/${id}`).then((r) => r.data)