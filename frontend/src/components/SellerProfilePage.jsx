import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { errorMessage } from '../api/errors.js'
import { trackProfileView } from '../api/analytics.js'
import { imageUrl } from '../api/client.js'
import { getSellerProfile } from '../api/sellers.js'
import { formatPrice } from '../constants.js'
import ListingImage from './ListingImage.jsx'

export default function SellerProfilePage() {
  const { sellerId } = useParams()
  const trackedSeller = useRef(null)
  const [state, setState] = useState({ sellerId: null, error: '', seller: null, listings: [] })

  useEffect(() => {
    let active = true
    getSellerProfile(sellerId)
      .then((data) => {
        if (!active) return
        setState({ sellerId, error: '', seller: data.seller, listings: data.listings })
        if (trackedSeller.current !== sellerId) {
          trackedSeller.current = sellerId
          trackProfileView(sellerId).catch((err) => console.error('Could not record seller profile view', err))
        }
      })
      .catch((err) => active && setState({ sellerId, error: errorMessage(err), seller: null, listings: [] }))
    return () => { active = false }
  }, [sellerId])

  const currentProfileLoaded = state.sellerId === sellerId
  const loading = !currentProfileLoaded
  const error = currentProfileLoaded ? state.error : ''
  const seller = currentProfileLoaded ? state.seller : null
  const listings = currentProfileLoaded ? state.listings : []
  const displayName = seller?.businessName || seller?.name

  return (
    <main className="min-h-screen bg-surface px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <Link to="/" className="font-label text-label-md text-primary hover:underline">← Back to marketplace</Link>

        {loading && <p className="mt-8 font-body text-body-md text-on-surface-variant">Loading seller profile...</p>}
        {error && <p role="alert" className="mt-8 rounded-lg bg-red-50 px-4 py-3 font-body text-body-md text-error">{error}</p>}

        {seller && (
          <>
            <section className="mt-6 flex flex-col gap-5 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm sm:flex-row sm:items-center">
              {seller.profileImage ? (
                <img src={imageUrl(seller.profileImage)} alt="" className="h-24 w-24 rounded-full object-cover" />
              ) : (
                <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-primary-container font-headline text-display-lg text-primary">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              )}
              <div>
                <p className="font-label text-label-md text-primary">Seller profile</p>
                <h1 className="mt-1 font-headline text-headline-lg-mobile text-on-surface">{displayName}</h1>
                {seller.businessName && <p className="mt-1 font-body text-body-md text-on-surface-variant">{seller.name}</p>}
                {seller.location && <p className="mt-2 font-body text-body-md text-on-surface-variant">{seller.location}</p>}
                {seller.description && <p className="mt-3 whitespace-pre-line font-body text-body-md text-on-surface-variant">{seller.description}</p>}
              </div>
            </section>

            <section className="mt-8">
              <h2 className="font-headline text-headline-lg-mobile text-on-surface">Available products</h2>
              {listings.length === 0 ? (
                <p className="mt-4 font-body text-body-md text-on-surface-variant">This seller has no available products right now.</p>
              ) : (
                <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {listings.map((listing) => (
                    <li key={listing._id} className="flex flex-col gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
                      <ListingImage src={listing.image} alt={listing.title} className="h-48 w-full rounded-md" />
                      <h3 className="font-headline text-title-md text-on-surface">{listing.title}</h3>
                      <p className="font-headline text-title-md text-primary">{formatPrice(listing.price)}</p>
                      <Link to={`/listings/${listing._id}`} className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-4 font-label text-label-md text-on-primary">
                        View product
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  )
}
