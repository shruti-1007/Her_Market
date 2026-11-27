import { useEffect, useState } from 'react'
import { getEvents } from '../../api/events.js'
import { errorMessage } from '../../api/errors.js'
import { EVENT_CATEGORIES, inputClass } from '../../constants.js'
import PageHeader from './PageHeader.jsx'
import EventCard from './EventCard.jsx'

const emptyFilters = { search: '', category: '', location: '', date: '' }

export default function EventsPage() {
  const [filters, setFilters] = useState(emptyFilters)
  const [applied, setApplied] = useState(emptyFilters)
  const [page, setPage] = useState(1)
  const [result, setResult] = useState({ key: '', events: [], pages: 1, total: 0, error: '' })

  // Wait for the user to stop typing before searching
  useEffect(() => {
    const t = setTimeout(() => { setApplied(filters); setPage(1) }, 400)
    return () => clearTimeout(t)
  }, [filters])

  const key = JSON.stringify([applied, page])
  const loading = result.key !== key

  useEffect(() => {
    let active = true
    const params = { page, limit: 9 }
    if (applied.search) params.search = applied.search
    if (applied.category) params.category = applied.category
    if (applied.location) params.location = applied.location
    if (applied.date) {
      params.from = new Date(`${applied.date}T00:00:00`).toISOString()
      params.to = new Date(`${applied.date}T23:59:59.999`).toISOString()
    }
    getEvents(params)
      .then((d) => active && setResult({ key, events: d.events, pages: d.pages, total: d.total, error: '' }))
      .catch((e) => active && setResult({ key, events: [], pages: 1, total: 0, error: errorMessage(e) }))
    return () => { active = false }
  }, [applied, page, key])

  const set = (name) => (e) => setFilters((f) => ({ ...f, [name]: e.target.value }))
  const hasFilters = Object.values(filters).some(Boolean)

  return (
    <main className="min-h-screen bg-surface">
      <PageHeader />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <p className="font-label text-label-md text-primary">COMMUNITY</p>
        <h1 className="mt-1 font-display text-headline-lg-mobile text-on-surface sm:text-display-lg">
          Events & Opportunities
        </h1>
        <p className="mt-2 max-w-2xl font-body text-body-lg text-on-surface-variant">
          Workshops, trainings and programs from ward offices, municipalities and NGOs near you.
        </p>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="mt-6 grid gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest p-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <input type="search" value={filters.search} onChange={set('search')} placeholder="Search events..." aria-label="Search events" className={inputClass} />
          <select value={filters.category} onChange={set('category')} aria-label="Category" className={inputClass}>
            <option value="">All categories</option>
            {EVENT_CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <input type="search" value={filters.location} onChange={set('location')} placeholder="Location (e.g. Patan)" aria-label="Location" className={inputClass} />
          <input type="date" value={filters.date} onChange={set('date')} aria-label="Date" className={inputClass} />
        </form>

        <div className="mt-8">
          {loading && <p className="font-body text-body-md text-on-surface-variant">Loading events...</p>}
          {!loading && result.error && (
            <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 font-body text-body-md text-error">{result.error}</p>
          )}

          {!loading && !result.error && result.events.length === 0 && (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest px-6 py-14 text-center">
              <span className="material-symbols-outlined text-headline-lg text-on-surface-variant" aria-hidden="true">event_busy</span>
              <h2 className="font-headline text-title-lg text-on-surface">No events found</h2>
              <p className="max-w-md font-body text-body-md text-on-surface-variant">
                {hasFilters ? 'Nothing matches your search. Try different keywords or clear the filters.' : 'No upcoming events have been published yet. Please check back soon.'}
              </p>
              {hasFilters && (
                <button type="button" onClick={() => setFilters(emptyFilters)} className="min-h-[44px] rounded-lg border border-outline-variant px-5 font-label text-label-md text-primary hover:bg-primary-container">
                  Clear filters
                </button>
              )}
            </div>
          )}

          {!loading && result.events.length > 0 && (
            <>
              <p className="mb-4 font-body text-body-md text-on-surface-variant">
                {result.total} event{result.total === 1 ? '' : 's'}
              </p>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {result.events.map((ev) => <EventCard key={ev._id} event={ev} />)}
              </div>
              {result.pages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-4">
                  <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="min-h-[44px] rounded-lg border border-outline-variant px-5 font-label text-label-md text-primary disabled:opacity-40">Previous</button>
                  <span className="font-body text-body-md text-on-surface-variant">Page {page} of {result.pages}</span>
                  <button type="button" disabled={page >= result.pages} onClick={() => setPage((p) => p + 1)} className="min-h-[44px] rounded-lg border border-outline-variant px-5 font-label text-label-md text-primary disabled:opacity-40">Next</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}