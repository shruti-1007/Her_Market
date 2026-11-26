import axios from 'axios'

export const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:3000'
).replace(/\/+$/, '')

// Turns "/uploads/abc.jpg" from the backend into a full image URL
export const imageUrl = (path) =>
  !path ? '' : /^https?:/.test(path) ? path : `${API_URL}${path}`

// No default Content-Type: axios sets JSON for objects and multipart for FormData
const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use((config) => {
  const token = window.sessionStorage.getItem('hermarket_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api