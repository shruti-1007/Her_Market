import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { getMyOrganization } from '../../api/organization.js'
import { deleteEvent, getMyEvents } from '../../api/events.js'
import { imageUrl } from '../../api/client.js'
import { errorMessage } from '../../api/errors.js'
import { EVENT_CATEGORIES, ORG_TYPES, formatEventWhen, labelOf } from '../../constants.js'
import DashboardShell from '../dashboard/DashboardShell.jsx'
import StatusBadge from '../dashboard/StatusBadge.jsx'
import EventForm from './EventForm.jsx'

const smallBtn = 'min-h-[40px] rounded-lg border border-outline-variant px-3 font-label text-label-md text-primary hover:bg-primary-container'

export default function OrgDashboard() {
  const { t } = useTranslation()
  const [org, setOrg] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null) // null | 'new' | event

  useEffect(() => {
    let active = true
    Promise.all([getMyOrganization(), getMyEvents()])
      .then(([o, e]) => { if (active) { setOrg(o.organization); setEvents(e.events) } })
      .catch((err) => active && setError(errorMessage(err)))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  const upsert = (saved) =>
    setEvents((cur) => (cur.some((e) => e._id === saved._id) ? cur.map((e) => (e._id === saved._id ? saved : e)) : [saved, ...cur]))

  async function remove(ev) {
    if (!window.confirm(t('Delete "{{title}}"? This cannot be undone.', { title: ev.title }))) return
    setError('')
    try {
      await deleteEvent(ev._id)
      setEvents((cur) => cur.filter((e) => e._id !== ev._id))
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  const status = org?.verificationStatus
  const verified = status === 'verified'

  return (
    <DashboardShell label="Organization account">
      {loading && <p className="font-body text-body-md text-on-surface-variant">{t('Loading...')}</p>}
      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 font-body text-body-md text-error">{error}</p>}

      {org && (
        <>
          <article className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-headline text-title-lg text-on-surface">{t('Organization details')}</h2>
              <StatusBadge value={status} />
            </div>
            <dl className="mt-4 grid gap-4 font-body text-body-md sm:grid-cols-2">
              <div><dt className="text-on-surface-variant">{t('Name')}</dt><dd className="font-label text-on-surface">{org.user.name}</dd></div>
              <div><dt className="text-on-surface-variant">{t('Type')}</dt><dd className="font-label text-on-surface">{t(labelOf(ORG_TYPES, org.type))}</dd></div>
              <div><dt className="text-on-surface-variant">{t('Location')}</dt><dd className="font-label text-on-surface">{org.user.location}</dd></div>
              <div><dt className="text-on-surface-variant">{t('Contact')}</dt><dd className="font-label text-on-surface">{org.user.contact}</dd></div>
              {org.website && <div><dt className="text-on-surface-variant">{t('Website')}</dt><dd className="font-label text-on-surface break-all">{org.website}</dd></div>}
              <div className="sm:col-span-2"><dt className="text-on-surface-variant">{t('About')}</dt><dd className="font-label text-on-surface">{org.user.description}</dd></div>
            </dl>

            {status === 'pending' && (
              <p className="mt-5 rounded-lg bg-amber-50 px-4 py-3 font-body text-body-md text-amber-900">
                {t('Your organization is waiting for review. You can publish events once an admin verifies it.')}
              </p>
            )}
            {status === 'rejected' && (
              <p className="mt-5 rounded-lg bg-red-50 px-4 py-3 font-body text-body-md text-error">
                {t('Your verification was rejected')}{org.rejectionReason && <>: {org.rejectionReason}</>}. {t('Please contact the HerMarket team.')}
              </p>
            )}
          </article>

          <section className="mt-8 flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-headline text-headline-lg-mobile text-on-surface">{t('Your events')}</h2>
              {!editing && (
                <button type="button" disabled={!verified} onClick={() => setEditing('new')}
                        className="min-h-[48px] rounded-lg bg-cta px-6 font-label text-label-lg text-on-cta disabled:cursor-not-allowed disabled:opacity-50">
                  {t('+ New event')}
                </button>
              )}
            </div>
            {!verified && <p className="font-body text-body-md text-on-surface-variant">{t('Only verified organizations can publish events.')}</p>}

            {editing && (
              <EventForm event={editing === 'new' ? null : editing} onCancel={() => setEditing(null)}
                         onSaved={(saved) => { upsert(saved); setEditing(null) }} />
            )}

            {events.length === 0 && !editing && (
              <p className="font-body text-body-md text-on-surface-variant">{t("You haven't published any events yet.")}</p>
            )}

            <ul className="flex flex-col gap-4">
              {events.map((ev) => (
                <li key={ev._id} className="flex flex-col gap-4 rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-sm sm:flex-row sm:items-center">
                  <div className="flex h-24 w-full items-center justify-center rounded-md bg-surface-container-low sm:w-32">
                    {ev.images?.[0]
                      ? <img src={imageUrl(ev.images[0])} alt="" className="h-full w-full object-contain" />
                      : <span className="material-symbols-outlined text-on-surface-variant" aria-hidden="true">event</span>}
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <h3 className="font-headline text-title-md text-on-surface">{ev.title}</h3>
                    <p className="font-body text-body-md text-on-surface-variant">
                      {t(labelOf(EVENT_CATEGORIES, ev.category))} · {formatEventWhen(ev.startDate, ev.endDate)}
                    </p>
                    <p className="font-body text-body-md text-on-surface-variant">{ev.isOnline ? t('Online event') : ev.location}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {verified && <Link to={`/events/${ev._id}`} className={smallBtn}>{t('View')}</Link>}
                    <button type="button" className={smallBtn} onClick={() => setEditing(ev)}>{t('Edit')}</button>
                    <button type="button" className={`${smallBtn} text-error`} onClick={() => remove(ev)}>{t('Delete')}</button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </DashboardShell>
  )
}