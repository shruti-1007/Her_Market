import api from './client.js'

export const getPricingConfig = () =>
  api.get('/api/listings/pricing/config').then((r) => r.data)

export const detectMaterials = (image) => {
  const formData = new FormData()
  formData.append('image', image)
  return api.post('/api/listings/pricing/materials', formData).then((r) => r.data)
}

export const calculatePricing = (pricing) =>
  api.post('/api/listings/pricing/calculate', pricing).then((r) => r.data)

export const estimateMaterialCost = (material) =>
  api.post('/api/listings/pricing/material-estimate', material).then((r) => r.data)
