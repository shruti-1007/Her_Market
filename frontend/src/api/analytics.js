import api from './client.js'

const VISITOR_KEY = 'hermarket_visitor_id'

function getVisitorId() {
  let visitorId = window.localStorage.getItem(VISITOR_KEY)
  if (!visitorId) {
    visitorId = window.crypto.randomUUID()
    window.localStorage.setItem(VISITOR_KEY, visitorId)
  }
  return visitorId
}

export const trackProfileView = (sellerId) =>
  api.post('/api/seller-analytics/profile-view', {
    sellerId,
    visitorId: getVisitorId(),
    eventId: window.crypto.randomUUID(),
  }).then((r) => r.data)

export const trackProductView = (listingId) =>
  api.post('/api/seller-analytics/product-view', {
    listingId,
    visitorId: getVisitorId(),
    eventId: window.crypto.randomUUID(),
  }).then((r) => r.data)

export const getMySellerAnalytics = () =>
  api.get('/api/seller-analytics/me').then((r) => r.data)
