import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { formatPrice } from '../constants.js'
import ListingImage from './ListingImage.jsx'

function Icon({ children }) {
  return (
    <span className="material-symbols-outlined" aria-hidden="true">
      {children}
    </span>
  )
}

export function ProductCard({ listing }) {
  const { t } = useTranslation()
  return (
    <article className="flex h-full flex-col justify-between gap-4 rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
      <div className="flex flex-col gap-3">
        <ListingImage src={listing.image} alt={listing.title} className="h-48 w-full rounded-md" />
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-headline text-title-md text-on-surface">{listing.title}</h3>
          <span className="shrink-0 font-headline text-title-md tabular-nums text-primary">
            {formatPrice(listing.price)}
          </span>
        </div>
        <p className="font-body text-body-md text-on-surface-variant">
          {t('By {{name}}', { name: listing.seller?.name })} · {listing.location || listing.seller?.location}
        </p>
      </div>
      <Link
        to={`/listings/${listing._id}`}
        className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 font-label text-label-lg text-on-primary transition-colors duration-state-change hover:opacity-95"
      >
        <Icon>visibility</Icon>
        {t('View Product')}
      </Link>
    </article>
  )
}
