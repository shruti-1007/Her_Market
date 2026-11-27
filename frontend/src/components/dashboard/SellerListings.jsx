import { useEffect, useState } from 'react'
import { getMyListings, updateListing, deleteListing } from '../../api/listings.js'
import { errorMessage } from '../../api/errors.js'
import { formatPrice } from '../../constants.js'
import ListingImage from '../ListingImage.jsx'
import StatusBadge from './StatusBadge.jsx'
import ListingForm from './ListingForm.jsx'

const smallBtn =
  'min-h-10 rounded-lg border border-outline-variant px-3 font-label text-label-md text-primary transition-colors hover:bg-primary-container'

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
    <section className="flex flex-col gap-5">
      {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 font-body text-body-md text-error">{error}</p>}
      {loading && <p className="font-body text-body-md text-on-surface-variant">Loading your listings...</p>}

      <div className="flex flex-col gap-3 rounded-xl border border-outline-variant bg-surface-container-low px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <p className="font-label text-label-md text-on-surface">
            {listings.length} {listings.length === 1 ? 'product' : 'products'}
          </p>
          <p className="mt-1 font-body text-sm text-on-surface-variant">Your published and unpublished listings</p>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing('new')}
            className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-lg bg-cta px-5 font-label text-label-md text-on-cta shadow-sm transition-colors hover:opacity-90 sm:self-auto"
          >
            <span className="material-symbols-outlined text-title-md" aria-hidden="true">add</span>
            Add product
          </button>
        )}
      </div>

      {editing && (
        <ListingForm
          listing={editing === 'new' ? null : editing}
          onCancel={() => setEditing(null)}
          onSaved={(saved) => { upsert(saved); setEditing(null) }}
        />
      )}

      {!loading && listings.length === 0 && (
        <div className="rounded-2xl border border-dashed border-outline-variant bg-surface-container-lowest px-6 py-12 text-center">
          <span className="material-symbols-outlined text-3xl text-primary" aria-hidden="true">inventory_2</span>
          <h3 className="mt-3 font-headline text-title-lg text-on-surface">Your shop is ready for its first product</h3>
          <p className="mx-auto mt-2 max-w-md font-body text-body-md text-on-surface-variant">
            Add a listing to start showing your work to customers.
          </p>
        </div>
      )}

      <ul className="flex flex-col gap-4">
        {listings.map((l) => (
          <li
            key={l._id}
            className="grid gap-4 rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm transition-shadow hover:shadow-md sm:grid-cols-[9rem_minmax(0,1fr)] sm:items-center sm:p-5 xl:grid-cols-[10rem_minmax(0,1fr)_auto]"
          >
            <ListingImage src={l.image} alt={l.title} className="h-48 w-full rounded-xl bg-surface-container-low object-cover sm:h-32 xl:h-36" />
            <div className="flex flex-1 flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-headline text-title-md text-on-surface">{l.title}</h3>
                <StatusBadge value={l.availability} />
              </div>
              <p className="font-body text-body-md capitalize text-on-surface-variant">
                {l.category} · {l.location || 'No location'}
              </p>
              <p className="font-headline text-title-md text-primary">
                {formatPrice(l.price)}
                {l.packSize && (
                  <span className="ml-2 font-body text-body-md text-on-surface-variant">
                    per {l.packSize}
                  </span>
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 sm:col-span-2 xl:col-span-1 xl:justify-end">
              <button type="button" className={smallBtn} onClick={() => setEditing(l)}>Edit</button>
              <button type="button" className={smallBtn} onClick={() => toggleAvailability(l)}>
                {l.availability === 'available' ? 'Mark unavailable' : 'Mark available'}
              </button>
              <button type="button" className={`${smallBtn} border-red-200 text-error hover:bg-red-50`} onClick={() => remove(l)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}