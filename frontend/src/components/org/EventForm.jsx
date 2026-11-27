import { useEffect, useState } from 'react'
import { createEvent, updateEvent } from '../../api/events.js'
import { imageUrl } from '../../api/client.js'
import { errorMessage } from '../../api/errors.js'
import { EVENT_CATEGORIES, inputClass, toInputValue } from '../../constants.js'

function Label({ text, children, className = '' }) {
  return (
    <label className={`flex flex-col gap-2 ${className}`}>
      <span className="font-label text-label-md text-on-surface">{text}</span>
      {children}
    </label>
  )
}

export default function EventForm({ event, onSaved, onCancel }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [online, setOnline] = useState(Boolean(event?.isOnline))
  const [previews, setPreviews] = useState([])

  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews])

  function handleFiles(e) {
    setPreviews(Array.from(e.target.files).slice(0, 4).map((f) => URL.createObjectURL(f)))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const fd = new FormData(e.currentTarget)
    const files = fd.getAll('images').filter((f) => f.size > 0)
    fd.delete('images')
    files.forEach((f) => fd.append('images', f))
    fd.set('startDate', new Date(fd.get('startDate')).toISOString())
    const end = fd.get('endDate')
    fd.set('endDate', end ? new Date(end).toISOString() : '')
    fd.set('isOnline', String(online))

    try {
      const data = event ? await updateEvent(event._id, fd) : await createEvent(fd)
      onSaved(data.event)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-lg border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
      <h2 className="font-headline text-title-lg text-on-surface">{event ? 'Edit event' : 'Publish a new event'}</h2>

      <Label text="Event title">
        <input name="title" required minLength={3} maxLength={150} defaultValue={event?.title} className={inputClass} />
      </Label>

      <Label text="Category">
        <select name="category" required defaultValue={event?.category || ''} className={inputClass}>
          <option value="" disabled>Choose a category</option>
          {EVENT_CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </Label>

      <div className="grid gap-5 sm:grid-cols-2">
        <Label text="Starts">
          <input name="startDate" type="datetime-local" required defaultValue={toInputValue(event?.startDate)} className={inputClass} />
        </Label>
        <Label text="Ends (optional)">
          <input name="endDate" type="datetime-local" defaultValue={toInputValue(event?.endDate)} className={inputClass} />
        </Label>
      </div>

      <label className="flex items-center gap-3 font-label text-label-md text-on-surface">
        <input type="checkbox" checked={online} onChange={(e) => setOnline(e.target.checked)} className="h-5 w-5" />
        This is an online event
      </label>

      {online ? (
        <Label text="Online event link">
          <input name="onlineLink" type="url" placeholder="https://meet.example.com/..." defaultValue={event?.onlineLink} className={inputClass} />
        </Label>
      ) : (
        <Label text="Location">
          <input name="location" required placeholder="Venue, ward / municipality" defaultValue={event?.location} className={inputClass} />
        </Label>
      )}

      <Label text="Description (optional if you upload a notice image)">
        <textarea name="description" rows={5} maxLength={3000} defaultValue={event?.description} className={inputClass} />
      </Label>

      <Label text="Registration instructions (optional)">
        <textarea name="registrationInstructions" rows={3} maxLength={1000} defaultValue={event?.registrationInstructions} className={inputClass} />
      </Label>

      <Label text="Registration link (optional)">
        <input name="registrationUrl" type="url" placeholder="https://forms.example.com/..." defaultValue={event?.registrationUrl} className={inputClass} />
      </Label>

      <Label text="Poster / notice images (up to 4, JPG, PNG or WEBP, max 5 MB each)">
        <input name="images" type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={handleFiles} className={inputClass} />
      </Label>

      {(previews.length > 0 || event?.images?.length > 0) && (
        <div>
          <p className="mb-2 font-body text-sm text-on-surface-variant">
            {previews.length > 0 ? 'New images (these will replace the current ones):' : 'Current images (choose new files to replace them):'}
          </p>
          <div className="flex flex-wrap gap-3">
            {(previews.length > 0 ? previews : event.images.map(imageUrl)).map((src) => (
              <img key={src} src={src} alt="" className="h-28 w-28 rounded-lg border border-outline-variant bg-surface-container-low object-contain" />
            ))}
          </div>
        </div>
      )}

      {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 font-body text-body-md text-error">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="min-h-[48px] rounded-lg bg-primary px-6 font-label text-label-lg text-on-primary disabled:opacity-70">
          {saving ? 'Saving...' : event ? 'Save changes' : 'Publish event'}
        </button>
        <button type="button" onClick={onCancel} className="min-h-[48px] rounded-lg border border-outline-variant px-6 font-label text-label-lg text-primary">
          Cancel
        </button>
      </div>
    </form>
  )
}