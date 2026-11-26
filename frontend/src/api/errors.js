export function errorMessage(error) {
  const data = error.response?.data
  if (Array.isArray(data?.errors) && data.errors.length) return data.errors.join('. ')
  return data?.message || error.message || 'Something went wrong. Please try again.'
}