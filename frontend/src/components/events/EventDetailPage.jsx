import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getEvent } from '../../api/events.js'
import { imageUrl } from '../../api/client.js'
import { errorMessage } from '../../api/errors.js'
import { EVENT_CATEGORIES, ORG_TYPES, formatEventWhen, labelOf } from '../../constants.js'
import PageHeader from './PageHeader.jsx'
import VerifiedBadge from './VerifiedBadge.jsx'

function Lightbox({ src, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div role="dialog" aria-modal="true" aria-label="Enlarged notice image" onClick={onClose}
         className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
      <button type="button" onClick={onClose} aria-label="Close"
              className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-black">
        <span className="material-symbols-outlined" aria-hidden="true">close</span>
      </button>
      <img src={src} alt="" className="max-h-full max-w-full object-contain" onClick={(e) => e.stopPropagation()} />
    </div>
  )
}

function InfoRow({ icon, title, children }) {
  return (
    <div className="flex gap-3">
      <span className="material-symbols-outlined mt-0.5 text-primary" aria-hidden="true">{icon}</span>
      <div>
        <p className="font-label text-label-md text-on-surface-variant">{title}</p>
        <div className="font-body text-body-md text-on-surface">{children}</div>
      </div>
    </div>
  )
}

export default function EventDetailPage() {
  const { id } = useParams()
  const [state, setState] = useState({ id: '', event: null, error: '' })
  const [active, setActive] = useState(0)
  const [zoom, setZoom] = useState(false)

  useEffect(() => {
    let live = true
    getEvent(id)
      .then((d) => live && setState({ id, event: d.event, error: '' }))
      .catch((e) => live && setState({ id, event: null, error: errorMessage(e) }))
    return () => { live = false }
  }, [id])

  const loading = state.id !== id
  const event = state.event
  const images = event?.images || []
  const org = event?.organization

  return (
    <main className="min-h-screen bg-surface">
      <PageHeader />
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <Link to="/events" className="font-label text-label-md text-primary hover:underline">← All events</Link>

        {loading && <p className="mt-8 font-body text-body-md text-on-surface-variant">Loading...</p>}
        {!loading && state.error && (
          <p role="alert" className="mt-8 rounded-lg bg-red-50 px-4 py-3 font-body text-body-md text-error">{state.error}</p>
        )}

        {!loading && event && (
          <div className="mt-6 grid gap-8 lg:grid-cols-5">
            {/* Notice / poster images */}
            <section className="lg:col-span-2" aria-label="Event poster">
              {images.length > 0 ? (
                <>
                  <button type="button" onClick={() => setZoom(true)} aria-label="Enlarge image"
                          className="flex max-h-[640px] min-h-[280px] w-full cursor-zoom-in items-center justify-center overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low">
                    <img src={imageUrl(images[active])} alt={`Notice for ${event.title}`} className="max-h-[640px] w-full object-contain" />
                  </button>
                  <p className="mt-2 text-center font-body text-sm text-on-surface-variant">Tap the image to enlarge</p>
                  {images.length > 1 && (
                    <div className="mt-3 flex gap-2 overflow-x-auto">
                      {images.map((src, i) => (
                        <button key={src} type="button" onClick={() => setActive(i)} aria-label={`Show image ${i + 1}`}
                                className={`h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-surface-container-low ${i === active ? 'border-primary' : 'border-transparent'}`}>
                          <img src={imageUrl(src)} alt="" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex h-64 items-center justify-center rounded-xl border border-outline-variant bg-surface-container-low">
                  <span className="material-symbols-outlined text-headline-lg text-on-surface-variant" aria-hidden="true">event</span>
                </div>
              )}
            </section>

            {/* Details */}
            <section className="flex flex-col gap-6 lg:col-span-3">
              <div className="flex flex-col gap-3">
                <span className="self-start rounded-full bg-secondary-container px-3 py-1 font-label text-label-md text-on-secondary-container">
                  {labelOf(EVENT_CATEGORIES, event.category)}
                </span>
                <h1 className="font-display text-headline-lg-mobile text-on-surface sm:text-display-lg">{event.title}</h1>
                <p className="flex flex-wrap items-center gap-2 font-body text-body-lg text-on-surface-variant">
                  By {event.organizer?.name}
                  {org?.verificationStatus === 'verified' && <VerifiedBadge />}
                </p>
              </div>

              <div className="flex flex-col gap-5 rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
                <InfoRow icon="calendar_month" title="Date & time">{formatEventWhen(event.startDate, event.endDate)}</InfoRow>
                {event.isOnline ? (
                  <InfoRow icon="videocam" title="Online event">
                    {event.onlineLink ? (
                      <a href={event.onlineLink} target="_blank" rel="noopener noreferrer" className="break-all text-primary underline">{event.onlineLink}</a>
                    ) : 'Link will be shared by the organizer'}
                  </InfoRow>
                ) : (
                  <InfoRow icon="location_on" title="Location">{event.location}</InfoRow>
                )}
              </div>

              {event.description && (
                <div>
                  <h2 className="font-headline text-title-lg text-on-surface">About this event</h2>
                  <p className="mt-2 whitespace-pre-line font-body text-body-lg text-on-surface-variant">{event.description}</p>
                </div>
              )}

              {(event.registrationInstructions || event.registrationUrl) && (
                <div className="flex flex-col gap-4 rounded-lg bg-primary-container p-5 text-on-primary-container">
                  <h2 className="font-headline text-title-lg">How to register</h2>
                  {event.registrationInstructions && (
                    <p className="whitespace-pre-line font-body text-body-md">{event.registrationInstructions}</p>
                  )}
                  {event.registrationUrl && (
                    <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer"
                       className="inline-flex min-h-[52px] items-center justify-center gap-2 self-start rounded-lg bg-primary px-6 font-label text-label-lg text-on-primary hover:opacity-95">
                      Register / More Information
                      <span className="material-symbols-outlined" aria-hidden="true">open_in_new</span>
                    </a>
                  )}
                </div>
              )}

              <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
                <h2 className="font-headline text-title-lg text-on-surface">Organizer</h2>
                <p className="mt-2 flex flex-wrap items-center gap-2 font-headline text-title-md text-primary">
                  {event.organizer?.name}
                  {org?.verificationStatus === 'verified' && <VerifiedBadge />}
                </p>
                <p className="font-body text-body-md text-on-surface-variant">
                  {labelOf(ORG_TYPES, org?.type)}{event.organizer?.location && <> · {event.organizer.location}</>}
                </p>
                {event.organizer?.description && (
                  <p className="mt-2 font-body text-body-md text-on-surface-variant">{event.organizer.description}</p>
                )}
                <p className="mt-3 flex flex-wrap gap-x-6 gap-y-1 font-body text-body-md text-on-surface">
                  {event.organizer?.contact && <span>Phone: {event.organizer.contact}</span>}
                  {org?.website && (
                    <a href={org.website} target="_blank" rel="noopener noreferrer" className="text-primary underline">Website</a>
                  )}
                </p>
              </div>
            </section>
          </div>
        )}
      </div>
      {zoom && images[active] && <Lightbox src={imageUrl(images[active])} onClose={() => setZoom(false)} />}
    </main>
  )
}