import { useState } from 'react'
import { createListing, updateListing } from '../../api/listings.js'
import { errorMessage } from '../../api/errors.js'
import { CATEGORIES, inputClass } from '../../constants.js'

function Label({ text, children }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-label text-label-md text-on-surface">{text}</span>
      {children}
    </label>
  )
}

export default function ListingForm({ listing, onSaved, onCancel }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSaving(true)

    const formData = new FormData(event.currentTarget)
    if (!formData.get('image')?.size) formData.delete('image') // no new image chosen

    try {
      const data = listing
        ? await updateListing(listing._id, formData)
        : await createListing(formData)
      onSaved(data.listing)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm sm:p-7"
    >
      <div className="border-b border-outline-variant pb-4">
        <p className="font-label text-label-md uppercase tracking-wide text-primary">Your products</p>
        <h2 className="mt-1 font-headline text-title-lg text-on-surface">
          {listing ? 'Edit listing' : 'Add a listing'}
        </h2>
      </div>

      <Label text="Title">
        <input name="title" required minLength={3} maxLength={100} defaultValue={listing?.title} className={inputClass} />
      </Label>

      <div className="grid gap-5 sm:grid-cols-2">
        <Label text="Category">
          <select name="category" required defaultValue={listing?.category || ''} className={inputClass}>
            <option value="" disabled>Choose a category</option>
            {CATEGORIES.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </Label>
        <Label text="Price (Rs)">
          <input name="price" type="number" min="0" step="any" required defaultValue={listing?.price} className={inputClass} />
        </Label>
      </div>

      <Label text="Description">
        <textarea name="description" rows={4} maxLength={1000} defaultValue={listing?.description} className={inputClass} />
      </Label>

      <div className="grid gap-5 sm:grid-cols-2">
        <Label text="Location (leave empty to use your profile location)">
          <input name="location" defaultValue={listing?.location} className={inputClass} />
        </Label>
        <Label text={listing ? 'Replace image (optional)' : 'Image (JPG, PNG or WEBP, max 5 MB)'}>
          <input name="image" type="file" accept="image/jpeg,image/png,image/webp" className={inputClass} />
        </Label>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 font-body text-body-md text-error">{error}</p>
      )}

      <div className="flex flex-wrap gap-3 border-t border-outline-variant pt-5">
        <button
          type="submit"
          disabled={saving}
          className="min-h-11 rounded-lg bg-primary px-5 font-label text-label-md text-on-primary shadow-sm transition-colors hover:opacity-90 disabled:opacity-70"
        >
          {saving ? 'Saving...' : listing ? 'Save changes' : 'Publish listing'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="min-h-11 rounded-lg border border-outline-variant px-5 font-label text-label-md text-primary transition-colors hover:bg-surface-container-low"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}