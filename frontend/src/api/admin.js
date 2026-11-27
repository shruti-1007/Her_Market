import api from './client.js'

export const getOrganizations = (status) =>
  api.get('/api/admin/organizations', { params: status ? { status } : {} }).then((r) => r.data)
export const reviewOrganization = (id, body) =>
  api.patch(`/api/admin/organizations/${id}/verification`, body).then((r) => r.data)