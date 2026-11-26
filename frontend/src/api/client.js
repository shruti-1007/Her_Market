import axios from 'axios'

const baseURL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(
  /\/+$/,
  '',
)

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = window.sessionStorage.getItem('hermarket_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
