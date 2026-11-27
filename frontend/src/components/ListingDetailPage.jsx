import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'
import { trackProductView } from '../api/analytics.js'
import { getListing } from '../api/listings.js'
import { sendInquiry } from '../api/inquiries.js'
import { errorMessage } from '../api/errors.js'
import { formatPrice, inputClass } from '../constants.js'
import ListingImage from './ListingImage.jsx'

export default function ListingDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const { user, status } = useAuth()
  const trackedListing = useRef(null)
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const [quantity, setQuantity] = useState('1')

  useEffect(() => {
    let active = true
    getListing(id)
      .then((d) => {
        if (!active) return
        setListing(d.listing)
        if (trackedListing.current !== id) {
          trackedListing.current = id
          trackProductView(id).catch((err) => console.error('Could not record product view', err))
        }
      })
      .catch((e) => active && setError(errorMessage(e)))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [id])

  async function handleSubmit(event) {
    event.preventDefault()
    setFeedback(null)
    setSending(true)
    try {
      await sendInquiry({
        listingId: id,
        message,
        quantity: Number(quantity),
      })
      setMessage('')
      setQuantity('1')
      setFeedback({ type: 'success', message: 'Your inquiry was sent successfully. The seller will respond soon.' })
    } catch (e) {
      setFeedback({ type: 'error', message: errorMessage(e) })
    } finally {
      setSending(false)
    }
  }

  const packCount = Number(quantity)
  const estimatedTotal = listing && Number.isSafeInteger(packCount) && packCount > 0 && packCount <= 100000
    ? listing.price * packCount
    : null
  const showEstimatedTotal = estimatedTotal !== null &&
    Number.isFinite(estimatedTotal) &&
    estimatedTotal <= Number.MAX_SAFE_INTEGER

  return (
    <main className="min-h-screen bg-surface px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <Link to="/" className="font-label text-label-md text-primary hover:underline">← Back to marketplace</Link>

        {loading && <p className="mt-8 font-body text-body-md text-on-surface-variant">Loading...</p>}
        {error && <p role="alert" className="mt-8 rounded-lg bg-red-50 px-4 py-3 font-body text-body-md text-error">{error}</p>}

        {listing && (
          <div className="mt-6 grid gap-8 md:grid-cols-2">
            <ListingImage src={listing.image} alt={listing.title} className="h-80 w-full rounded-xl border border-outline-variant" />

            <div className="flex flex-col gap-4">
              <p className="font-label text-label-md capitalize text-primary">{listing.category}</p>
              <h1 className="font-display text-headline-lg-mobile text-on-surface">{listing.title}</h1>
              <p className="font-headline text-headline-md text-primary">
                {formatPrice(listing.price)}
                <span className="ml-2 font-body text-body-md text-on-surface-variant">
                  per {listing.packSize || 'item'}
                </span>
              </p>
              {listing.description && (
                <p className="font-body text-body-lg text-on-surface-variant">{listing.description}</p>
              )}
              <p className="font-body text-body-md text-on-surface-variant">
                Sold by{' '}
                {listing.seller?._id ? (
                  <Link to={`/sellers/${listing.seller._id}`} className="font-label text-primary underline">
                    {listing.seller.name}
                  </Link>
                ) : (
                  <strong>{listing.seller?.name}</strong>
                )}
                {listing.location && <> · {listing.location}</>}
              </p>

              {status === 'authenticated' && user.role === 'customer' && (
                <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-4 rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
                  <h2 className="font-headline text-title-lg text-on-surface">Ask the seller</h2>
                  <textarea name="message" required minLength={3} maxLength={500} rows={3} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Is this still available?" className={inputClass} />
                  <label className="flex flex-col gap-2">
                    <span className="font-label text-label-md text-on-surface">
                      {listing.packSize ? 'How many packs would you like?' : 'How many items would you like?'}
                    </span>
                    {listing.packSize && (
                      <span className="font-body text-sm text-on-surface-variant">Each pack: {listing.packSize}</span>
                    )}
                    <input
                      name="quantity"
                      type="number"
                      min="1"
                      max="100000"
                      step="1"
                      inputMode="numeric"
                      value={quantity}
                      onChange={(event) => setQuantity(event.target.value)}
                      required
                      className={inputClass}
                    />
                  </label>
                  <div className="rounded-lg bg-primary-container p-3 text-on-primary-container" aria-live="polite">
                    {showEstimatedTotal ? (
                      <>
                        <p className="font-label text-label-md">Estimated total: {formatPrice(estimatedTotal)}</p>
                        <p className="mt-1 font-body text-sm">
                          The seller will confirm the amount. No payment is taken here.
                        </p>
                      </>
                    ) : (
                      <p className="font-body text-sm">
                        Enter a whole number of {listing.packSize ? 'packs' : 'items'} to see the estimated total.
                      </p>
                    )}
                  </div>
                  {feedback && (
                    <p role={feedback.type === 'error' ? 'alert' : 'status'}
                       className={`rounded-lg px-4 py-3 font-body text-body-md ${feedback.type === 'error' ? 'bg-red-50 text-error' : 'bg-tertiary-container text-on-tertiary-container'}`}>
                      {feedback.message}
                    </p>
                  )}
                  <button type="submit" disabled={sending} className="min-h-[48px] rounded-lg bg-primary px-6 font-label text-label-lg text-on-primary disabled:opacity-70">
                    {sending ? 'Sending...' : 'Send inquiry'}
                  </button>
                </form>
              )}

              {status === 'anonymous' && (
                <Link to="/login" state={{ from: location }} className="inline-flex min-h-[48px] items-center justify-center rounded-lg bg-primary px-6 font-label text-label-lg text-on-primary">
                  Log in to contact the seller
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}