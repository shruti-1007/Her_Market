import { useEffect, useState } from 'react'
import { getSellerInquiries, updateInquiryStatus } from '../../api/inquiries.js'
import { errorMessage } from '../../api/errors.js'
import { formatPrice } from '../../constants.js'
import StatusBadge from './StatusBadge.jsx'

export default function SellerInquiries() {
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    let active = true
    getSellerInquiries()
      .then((d) => active && setInquiries(d.inquiries))
      .catch((e) => active && setError(errorMessage(e)))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  async function decide(id, status) {
    setError('')
    setBusyId(id)
    try {
      const data = await updateInquiryStatus(id, status)
      setInquiries((cur) => cur.map((i) => (i._id === id ? data.inquiry : i)))
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section className="flex flex-col gap-4">
      {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 font-body text-body-md text-error">{error}</p>}
      {loading && <p className="font-body text-body-md text-on-surface-variant">Loading inquiries...</p>}
      {!loading && inquiries.length === 0 && (
        <p className="font-body text-body-md text-on-surface-variant">No inquiries yet.</p>
      )}

      {inquiries.map((i) => (
        <article key={i._id} className="flex flex-col gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-headline text-title-md text-on-surface">
              {i.listing?.title || 'Listing removed'}
              {i.listing && <span className="ml-2 text-primary">{formatPrice(i.listing.price)}</span>}
            </h3>
            <StatusBadge value={i.status} />
          </div>
          <p className="font-body text-body-md text-on-surface">“{i.message}”</p>
          <p className="font-body text-body-md text-on-surface-variant">
            Quantity: {i.quantity} · From {i.customer?.name}
            {i.status === 'accepted' && i.customer && (
              <> · {i.customer.contact || 'no phone'} · {i.customer.email}</>
            )}
          </p>
          {i.status === 'pending' && (
            <div className="flex gap-3">
              <button
                type="button"
                disabled={busyId === i._id}
                onClick={() => decide(i._id, 'accepted')}
                className="min-h-[44px] rounded-lg bg-primary px-5 font-label text-label-md text-on-primary disabled:opacity-70"
              >
                Accept
              </button>
              <button
                type="button"
                disabled={busyId === i._id}
                onClick={() => decide(i._id, 'rejected')}
                className="min-h-[44px] rounded-lg border border-outline-variant px-5 font-label text-label-md text-error disabled:opacity-70"
              >
                Reject
              </button>
            </div>
          )}
        </article>
      ))}
    </section>
  )
}