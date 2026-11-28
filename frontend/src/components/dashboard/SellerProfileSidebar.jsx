import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { errorMessage } from '../../api/errors.js'
import { getMySellerProfile } from '../../api/sellers.js'
import { imageUrl } from '../../api/client.js'
import SellerProfileForm from './SellerProfileForm.jsx'

const sections = [
  ['listings', 'My products', 'inventory_2'],
  ['inquiries', 'Inquiries', 'mail'],
  ['analytics', 'Analytics', 'query_stats'],
]

export default function SellerProfileSidebar({ activeTab, onTabChange }) {
  const { t } = useTranslation()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getMySellerProfile()
      .then((data) => active && setProfile(data.profile))
      .catch((err) => active && setError(errorMessage(err)))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!editing) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setEditing(false)
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [editing])

  if (loading) {
    return <p className="font-body text-body-md text-on-surface-variant">{t('Loading your profile...')}</p>
  }

  if (error) {
    return <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 font-body text-body-md text-error">{error}</p>
  }

  if (!profile) return null

  const displayName = profile.businessName || profile.name

  return (
    <>
      <aside className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-sm lg:sticky lg:top-6">
        <div className="bg-primary-container px-4 py-4 sm:px-5 lg:py-6">
          <div className="flex items-center gap-4 lg:flex-col lg:text-center">
            {profile.profileImage ? (
              <img src={imageUrl(profile.profileImage)} alt="" className="h-16 w-16 shrink-0 rounded-full border-4 border-white object-cover shadow-sm lg:h-20 lg:w-20" />
            ) : (
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 border-white bg-surface-container-lowest font-headline text-headline-md text-primary shadow-sm lg:h-20 lg:w-20 lg:text-headline-lg">
                {displayName.charAt(0).toUpperCase()}
              </span>
            )}
            <div className="min-w-0 lg:w-full">
              <h2 className="max-w-full truncate font-headline text-title-md text-on-primary-container lg:mt-3 lg:text-title-lg">{displayName}</h2>
              <p className="mt-1 max-w-full truncate font-body text-sm text-on-primary-container/80">{profile.name}</p>
            {profile.location && (
                <p className="mt-1 flex max-w-full items-center gap-1 truncate font-body text-sm text-on-primary-container/80 lg:mt-2 lg:justify-center">
                <span className="material-symbols-outlined text-base" aria-hidden="true">location_on</span>
                {profile.location}
              </p>
            )}
            </div>
          </div>
        </div>

        <nav aria-label={t('Seller dashboard')} className="grid grid-cols-3 gap-1 p-2 sm:gap-2 sm:p-3 lg:flex lg:flex-col">
          {sections.map(([key, label, icon]) => (
            <button
              key={key}
              type="button"
              aria-current={activeTab === key ? 'page' : undefined}
              onClick={() => onTabChange(key)}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-1 text-center font-label text-xs transition-colors sm:flex-row sm:gap-2 sm:px-2 sm:text-label-md lg:min-h-12 lg:justify-start lg:px-4 lg:text-left ${
                activeTab === key
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-title-md" aria-hidden="true">{icon}</span>
              {t(label)}
            </button>
          ))}
        </nav>

        <div className="grid grid-cols-1 gap-2 border-t border-outline-variant p-3 sm:grid-cols-2 lg:grid-cols-1 lg:p-4">
          <Link to={`/sellers/${profile.id}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-outline-variant px-4 font-label text-label-md text-primary transition-colors hover:bg-primary-container">
            <span className="material-symbols-outlined text-title-md" aria-hidden="true">open_in_new</span>
            {t('View public profile')}
          </Link>
          <button type="button" onClick={() => setEditing(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-cta px-4 font-label text-label-md text-on-cta shadow-sm transition-colors hover:opacity-90">
            <span className="material-symbols-outlined text-title-md" aria-hidden="true">edit</span>
            {t('Edit profile')}
          </button>
        </div>
      </aside>

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setEditing(false)
          }}
        >
          <section role="dialog" aria-modal="true" aria-labelledby="seller-profile-dialog-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-xl sm:p-8">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="font-label text-label-md uppercase tracking-wide text-primary">{t('Your shop')}</p>
                <h2 id="seller-profile-dialog-title" className="mt-1 font-headline text-headline-lg-mobile text-on-surface">{t('Edit seller profile')}</h2>
              </div>
              <button type="button" aria-label={t('Close profile editor')} onClick={() => setEditing(false)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface">
                <span className="material-symbols-outlined" aria-hidden="true">close</span>
              </button>
            </div>
            <SellerProfileForm
              profile={profile}
              onCancel={() => setEditing(false)}
              onSaved={(saved) => { setProfile(saved); setEditing(false) }}
            />
          </section>
        </div>
      )}
    </>
  )
}
