import api from './client.js'

export const sendInquiry = (body) => api.post('/api/inquiries', body).then((r) => r.data)
export const getSellerInquiries = (status) =>
  api.get('/api/inquiries/seller', { params: status ? { status } : {} }).then((r) => r.data)
export const getCustomerInquiries = () => api.get('/api/inquiries/customer').then((r) => r.data)
export const updateInquiryStatus = (id, status) =>
  api.patch(`/api/inquiries/${id}/status`, { status }).then((r) => r.data)