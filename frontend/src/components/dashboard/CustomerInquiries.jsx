import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCustomerInquiries } from '../../api/inquiries.js'
import { errorMessage } from '../../api/errors.js'
import StatusBadge from './StatusBadge.jsx'

export default function CustomerInquiries() {
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getCustomerInquiries()
      .then((d) => active && setInquiries(d.inquiries))
      .catch((e) => active && setError(errorMessage(e)))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  return (
    <section className="flex flex-col gap-4">
      {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 font-body text-body-md text-error">{error}</p>}
      {loading && <p className="font-body text-body-md text-on-surface-variant">Loading...</p>}
      {!loading && inquiries.length === 0 && (
        <p className="font-body text-body-md text-on-surface-variant">
          You haven't sent any inquiries yet.{' '}
          <Link to="/" className="text-primary underline">Browse the marketplace</Link>
        </p>
      )}

      {inquiries.map((i) => (
        <article key={i._id} className="flex flex-col gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {i.listing ? (
              <Link to={`/listings/${i.listing._id}`} className="font-headline text-title-md text-primary hover:underline">
                {i.listing.title}
              </Link>
            ) : (
              <span className="font-headline text-title-md text-on-surface">Listing removed</span>
            )}
            <StatusBadge value={i.status} />
          </div>
          <p className="font-body text-body-md text-on-surface">“{i.message}”</p>
          <p className="font-body text-body-md text-on-surface-variant">
            Quantity: {i.quantity} · Seller: {i.seller?.name}
            {i.status === 'accepted' && i.seller?.contact && <> · Call {i.seller.contact}</>}
          </p>
        </article>
      ))}
    </section>
  )
}