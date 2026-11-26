import { useEffect, useState } from 'react'
import { getMyListings, updateListing, deleteListing } from '../../api/listings.js'
import { errorMessage } from '../../api/errors.js'
import { formatPrice } from '../../constants.js'
import ListingImage from '../ListingImage.jsx'
import StatusBadge from './StatusBadge.jsx'
import ListingForm from './ListingForm.jsx'

const smallBtn =
  'min-h-[40px] rounded-lg border border-outline-variant px-3 font-label text-label-md text-primary hover:bg-primary-container'

export default function SellerListings() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null) // null | 'new' | a listing object

  useEffect(() => {
    let active = true
    getMyListings()
      .then((d) => active && setListings(d.listings))
      .catch((e) => active && setError(errorMessage(e)))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  const upsert = (saved) =>
    setListings((cur) =>
      cur.some((l) => l._id === saved._id)
        ? cur.map((l) => (l._id === saved._id ? saved : l))
        : [saved, ...cur],
    )

  async function toggleAvailability(listing) {
    setError('')
    try {
      const next = listing.availability === 'available' ? 'unavailable' : 'available'
      const data = await updateListing(listing._id, { availability: next })
      upsert(data.listing)
    } catch (e) {
      setError(errorMessage(e))
    }
  }

  async function remove(listing) {
    if (!window.confirm(`Delete "${listing.title}"? This cannot be undone.`)) return
    setError('')
    try {
      await deleteListing(listing._id)
      setListings((cur) => cur.filter((l) => l._id !== listing._id))
    } catch (e) {
      setError(errorMessage(e))
    }
  }

  return (
    <section className="flex flex-col gap-6">
      {editing ? (
        <ListingForm
          listing={editing === 'new' ? null : editing}
          onCancel={() => setEditing(null)}
          onSaved={(saved) => { upsert(saved); setEditing(null) }}
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing('new')}
          className="min-h-[48px] self-start rounded-lg bg-cta px-6 font-label text-label-lg text-on-cta"
        >
          + Add listing
        </button>
      )}

      {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 font-body text-body-md text-error">{error}</p>}
      {loading && <p className="font-body text-body-md text-on-surface-variant">Loading your listings...</p>}
      {!loading && listings.length === 0 && (
        <p className="font-body text-body-md text-on-surface-variant">
          You have no listings yet. Add your first one.
        </p>
      )}

      <ul className="flex flex-col gap-4">
        {listings.map((l) => (
          <li
            key={l._id}
            className="flex flex-col gap-4 rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-sm sm:flex-row sm:items-center"
          >
            <ListingImage src={l.image} alt={l.title} className="h-24 w-full rounded-md sm:w-32" />
            <div className="flex flex-1 flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-headline text-title-md text-on-surface">{l.title}</h3>
                <StatusBadge value={l.availability} />
              </div>
              <p className="font-body text-body-md capitalize text-on-surface-variant">
                {l.category} · {l.location || 'No location'}
              </p>
              <p className="font-headline text-title-md text-primary">{formatPrice(l.price)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={smallBtn} onClick={() => setEditing(l)}>Edit</button>
              <button type="button" className={smallBtn} onClick={() => toggleAvailability(l)}>
                {l.availability === 'available' ? 'Mark unavailable' : 'Mark available'}
              </button>
              <button type="button" className={`${smallBtn} text-error`} onClick={() => remove(l)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}