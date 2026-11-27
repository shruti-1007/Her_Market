import api from './client.js'

export const getMyOrganization = () => api.get('/api/organizations/me').then((r) => r.data)