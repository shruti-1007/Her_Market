import api from './client.js'

export const getEvents = (params) => api.get('/api/events', { params }).then((r) => r.data)
export const getEvent = (id) => api.get(`/api/events/${id}`).then((r) => r.data)
export const getMyEvents = () => api.get('/api/events/mine').then((r) => r.data)
export const createEvent = (formData) => api.post('/api/events', formData).then((r) => r.data)
export const updateEvent = (id, formData) => api.put(`/api/events/${id}`, formData).then((r) => r.data)
export const deleteEvent = (id) => api.delete(`/api/events/${id}`).then((r) => r.data)