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
        <div className="rounded-2xl border border-dashed border-outline-variant bg-surface-container-lowest px-6 py-12 text-center">
          <span className="material-symbols-outlined text-3xl text-primary" aria-hidden="true">forum</span>
          <p className="mt-3 font-headline text-title-lg text-on-surface">No inquiries yet</p>
          <p className="mt-1 font-body text-body-md text-on-surface-variant">Customer messages about your products will appear here.</p>
        </div>
      )}

      {inquiries.map((i) => {
        const packSize = i.packSize || i.listing?.packSize || 'item'
        const unitPrice = i.unitPriceNpr ?? i.listing?.price
        const estimatedTotal = i.estimatedTotalNpr ??
          (unitPrice === undefined ? null : unitPrice * i.quantity)

        return (
          <article key={i._id} className="flex flex-col gap-4 rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-label text-label-md uppercase tracking-wide text-primary">Product inquiry</p>
                <h3 className="mt-1 font-headline text-title-md text-on-surface">
                  {i.listing?.title || 'Listing removed'}
                </h3>
                {unitPrice !== undefined && (
                  <p className="mt-1 font-label text-label-md text-primary">
                    {formatPrice(unitPrice)} per {packSize}
                  </p>
                )}
              </div>
              <StatusBadge value={i.status} />
            </div>
            <blockquote className="rounded-xl bg-surface-container-low px-4 py-3 font-body text-body-md text-on-surface">
              “{i.message}”
            </blockquote>
            <div className="flex flex-wrap gap-x-6 gap-y-2 font-body text-body-md text-on-surface-variant">
              <span>Requested: {i.quantity} × {packSize}</span>
              {Number.isFinite(estimatedTotal) && (
                <span>Estimated total: {formatPrice(estimatedTotal)} (seller confirms)</span>
              )}
              <span>From {i.customer?.name}</span>
              {i.status === 'accepted' && i.customer && (
                <>
                  <span>{i.customer.contact || 'No phone provided'}</span>
                  <span className="break-all">{i.customer.email}</span>
                </>
              )}
            </div>
            {i.status === 'pending' && (
              <div className="flex flex-wrap gap-3 border-t border-outline-variant pt-4">
                <button
                  type="button"
                  disabled={busyId === i._id}
                  onClick={() => decide(i._id, 'accepted')}
                  className="min-h-11 rounded-lg bg-primary px-5 font-label text-label-md text-on-primary shadow-sm transition-colors hover:opacity-90 disabled:opacity-70"
                >
                  Accept
                </button>
                <button
                  type="button"
                  disabled={busyId === i._id}
                  onClick={() => decide(i._id, 'rejected')}
                  className="min-h-11 rounded-lg border border-outline-variant px-5 font-label text-label-md text-error transition-colors hover:bg-red-50 disabled:opacity-70"
                >
                  Reject
                </button>
              </div>
            )}
          </article>
        )
      })}
    </section>
  )
}