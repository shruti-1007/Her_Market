import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { errorMessage } from '../../api/errors.js'
import { updateMySellerProfile } from '../../api/sellers.js'
import { inputClass } from '../../constants.js'

export default function SellerProfileForm({ profile, onSaved, onCancel }) {
  const { t } = useTranslation()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')

    const formData = new FormData(event.currentTarget)
    if (!formData.get('image')?.size) formData.delete('image')

    try {
      const data = await updateMySellerProfile(formData)
      onSaved(data.profile)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex min-w-0 flex-col gap-2">
          <span className="font-label text-label-md text-on-surface">{t('Your name')}</span>
          <input name="name" required defaultValue={profile.name} className={inputClass} />
        </label>
        <label className="flex min-w-0 flex-col gap-2">
          <span className="font-label text-label-md text-on-surface">{t('Business name')}</span>
          <input name="businessName" defaultValue={profile.businessName} className={inputClass} />
        </label>
      </div>
      <label className="flex flex-col gap-2">
        <span className="font-label text-label-md text-on-surface">{t('Location')}</span>
        <input name="location" defaultValue={profile.location} className={inputClass} />
      </label>
      <label className="flex flex-col gap-2">
        <span className="font-label text-label-md text-on-surface">{t('Bio')}</span>
        <textarea name="description" rows={4} maxLength={1000} defaultValue={profile.description} className={inputClass} />
      </label>
      <label className="flex min-w-0 flex-col gap-2">
        <span className="font-label text-label-md text-on-surface">{t('Profile picture')}</span>
        <input name="image" type="file" accept="image/jpeg,image/png,image/webp" className={inputClass} />
      </label>

      {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 font-body text-body-md text-error">{error}</p>}

      <div className="flex flex-wrap justify-end gap-3 border-t border-outline-variant pt-5">
        <button type="button" onClick={onCancel} className="min-h-11 rounded-lg border border-outline-variant px-5 font-label text-label-md text-primary transition-colors hover:bg-surface-container-low">
          {t('Cancel')}
        </button>
        <button type="submit" disabled={saving} className="min-h-11 rounded-lg bg-primary px-5 font-label text-label-md text-on-primary shadow-sm transition-colors hover:opacity-90 disabled:opacity-70">
          {saving ? t('Saving...') : t('Save profile')}
        </button>
      </div>
    </form>
  )
}
