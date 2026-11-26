import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'
import { getListing } from '../api/listings.js'
import { sendInquiry } from '../api/inquiries.js'
import { errorMessage } from '../api/errors.js'
import { formatPrice, inputClass } from '../constants.js'
import ListingImage from './ListingImage.jsx'

export default function ListingDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const { user, status } = useAuth()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    let active = true
    getListing(id)
      .then((d) => active && setListing(d.listing))
      .catch((e) => active && setError(errorMessage(e)))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [id])

  async function handleSubmit(event) {
    event.preventDefault()
    setFeedback(null)
    setSending(true)
    const form = new FormData(event.currentTarget)
    try {
      await sendInquiry({
        listingId: id,
        message: form.get('message'),
        quantity: Number(form.get('quantity')),
      })
      setFeedback({ type: 'success', message: 'Inquiry sent. The seller will respond soon.' })
      event.currentTarget.reset()
    } catch (e) {
      setFeedback({ type: 'error', message: errorMessage(e) })
    } finally {
      setSending(false)
    }
  }

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
              <p className="font-headline text-headline-md text-primary">{formatPrice(listing.price)}</p>
              {listing.description && (
                <p className="font-body text-body-lg text-on-surface-variant">{listing.description}</p>
              )}
              <p className="font-body text-body-md text-on-surface-variant">
                Sold by <strong>{listing.seller?.name}</strong>
                {listing.location && <> · {listing.location}</>}
              </p>

              {status === 'authenticated' && user.role === 'customer' && (
                <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-4 rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
                  <h2 className="font-headline text-title-lg text-on-surface">Contact the seller</h2>
                  <textarea name="message" required minLength={3} maxLength={500} rows={3} placeholder="Is this still available?" className={inputClass} />
                  <label className="flex flex-col gap-2">
                    <span className="font-label text-label-md text-on-surface">Quantity</span>
                    <input name="quantity" type="number" min="1" step="1" defaultValue={1} required className={inputClass} />
                  </label>
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