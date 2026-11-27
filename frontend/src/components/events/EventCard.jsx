import { Link } from 'react-router-dom'
import { imageUrl } from '../../api/client.js'
import { EVENT_CATEGORIES, formatEventWhen, labelOf } from '../../constants.js'
import VerifiedBadge from './VerifiedBadge.jsx'

export default function EventCard({ event }) {
  const poster = event.images?.[0]
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest shadow-sm">
      {/* object-contain keeps the whole notice visible, with no cropping */}
      <Link to={`/events/${event._id}`} className="flex h-56 items-center justify-center bg-surface-container-low">
        {poster ? (
          <img src={imageUrl(poster)} alt={`Poster for ${event.title}`} className="h-full w-full object-contain" />
        ) : (
          <span className="material-symbols-outlined text-headline-lg text-on-surface-variant" aria-hidden="true">event</span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <span className="self-start rounded-full bg-secondary-container px-3 py-1 font-label text-label-md text-on-secondary-container">
          {labelOf(EVENT_CATEGORIES, event.category)}
        </span>
        <h3 className="font-headline text-title-md text-on-surface">{event.title}</h3>

        <p className="flex flex-wrap items-center gap-x-2 font-body text-body-md text-on-surface-variant">
          <span>{event.organizer?.name}</span>
          {event.organization?.verificationStatus === 'verified' && <VerifiedBadge />}
        </p>

        <ul className="flex flex-col gap-1 font-body text-body-md text-on-surface-variant">
          <li className="flex gap-2">
            <span className="material-symbols-outlined text-title-md" aria-hidden="true">calendar_month</span>
            {formatEventWhen(event.startDate, event.endDate)}
          </li>
          <li className="flex gap-2">
            <span className="material-symbols-outlined text-title-md" aria-hidden="true">
              {event.isOnline ? 'videocam' : 'location_on'}
            </span>
            {event.isOnline ? 'Online event' : event.location}
          </li>
        </ul>

        <Link
          to={`/events/${event._id}`}
          className="mt-auto inline-flex min-h-[48px] items-center justify-center rounded-lg bg-primary px-4 font-label text-label-lg text-on-primary hover:opacity-95"
        >
          View Details
        </Link>
      </div>
    </article>
  )
}