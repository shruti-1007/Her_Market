import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createListing, updateListing } from '../../api/listings.js'
import { errorMessage } from '../../api/errors.js'
import { CATEGORIES, formatNumber, inputClass } from '../../constants.js'
import { imageUrl } from '../../api/client.js'
import PricingAssistant from './PricingAssistant.jsx'

function Label({ text, children }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-label text-label-md text-on-surface">{text}</span>
      {children}
    </label>
  )
}

export default function ListingForm({ listing, onSaved, onCancel }) {
  const { t } = useTranslation()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(listing?.image ? imageUrl(listing.image) : '')
  const [price, setPrice] = useState(listing?.price ?? '')
  const [packSize, setPackSize] = useState(listing?.packSize || '')
  const [priceMethod, setPriceMethod] = useState(listing ? 'manual' : null)
  const [pricingInfo, setPricingInfo] = useState(null)
  const imageInput = useRef(null)

  useEffect(() => {
    if (!imagePreview.startsWith('blob:')) return undefined
    return () => URL.revokeObjectURL(imagePreview)
  }, [imagePreview])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSaving(true)

    const formData = new FormData(event.currentTarget)
    if (!formData.get('image')?.size) formData.delete('image') // no new image chosen
    if (pricingInfo) formData.set('pricing', JSON.stringify(pricingInfo))

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

  function handleImageChange(event) {
    const file = event.target.files?.[0] || null
    setImageFile(file)
    setImagePreview(file ? URL.createObjectURL(file) : (listing?.image ? imageUrl(listing.image) : ''))
    setPricingInfo(null)
    if (!listing) setPriceMethod(file ? null : 'manual')
  }

  function removeSelectedImage() {
    setImageFile(null)
    setImagePreview(listing?.image ? imageUrl(listing.image) : '')
    setPricingInfo(null)
    if (imageInput.current) imageInput.current.value = ''
    if (!listing) setPriceMethod('manual')
  }

  function finishPricing({ price: suggestedPrice, pricing }) {
    setPrice(suggestedPrice)
    setPricingInfo({
      ...pricing,
      suggestedPriceNpr: suggestedPrice,
      totalCostNpr: pricing.totalCostNpr,
    })
    setPriceMethod('manual')
  }

  const showPrice = listing || !imageFile || priceMethod === 'manual'
  const canSubmit = !saving && showPrice && price !== '' && Number.isFinite(Number(price)) && Number(price) >= 0

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm sm:p-7"
    >
      <div className="border-b border-outline-variant pb-4">
        <p className="font-label text-label-md uppercase tracking-wide text-primary">{t('Your products')}</p>
        <h2 className="mt-1 font-headline text-title-lg text-on-surface">
          {listing ? t('Edit listing') : t('Add a listing')}
        </h2>
      </div>

      <Label text={t('Title')}>
        <input name="title" required minLength={3} maxLength={100} defaultValue={listing?.title} className={inputClass} />
      </Label>

      <div className="grid gap-5 sm:grid-cols-2">
        <Label text={t('Category')}>
          <select name="category" required defaultValue={listing?.category || ''} className={inputClass}>
            <option value="" disabled>{t('Choose a category')}</option>
            {CATEGORIES.map(([value, label]) => (
              <option key={value} value={value}>{t(label, { context: value })}</option>
            ))}
          </select>
        </Label>
      </div>

      <Label text={t('Description')}>
        <textarea name="description" rows={4} maxLength={1000} defaultValue={listing?.description} className={inputClass} />
      </Label>

      <div className="grid gap-5 sm:grid-cols-2">
        <Label text={t('Location (leave empty to use your profile location)')}>
          <input name="location" defaultValue={listing?.location} className={inputClass} />
        </Label>
        <Label text={listing ? t('Replace image (optional)') : t('Image (JPG, PNG or WEBP, max 5 MB)')}>
          <input
            name="image"
            ref={imageInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            onChange={handleImageChange}
            className={inputClass}
          />
        </Label>
      </div>

      {imagePreview && (
        <div className="flex flex-col gap-2">
          <p className="font-label text-label-md text-on-surface">{t('Product photo preview')}</p>
          <img
            src={imagePreview}
            alt={t('Preview of your product')}
            className="h-48 w-full rounded-lg border border-outline-variant bg-surface-container-low object-contain sm:w-64"
          />
          {imageFile && (
            <button type="button" onClick={removeSelectedImage} className="min-h-11 self-start rounded-lg border border-outline-variant px-4 font-label text-label-md text-primary">
              {t('Remove photo and set price myself')}
            </button>
          )}
        </div>
      )}

      {!listing && imageFile && !priceMethod && (
        <section className="flex flex-col gap-3 rounded-lg border border-outline-variant bg-primary-container p-5">
          <h3 className="font-headline text-title-lg text-on-primary-container">
            {t('How would you like to decide the price of your product?')}
          </h3>
          <button
            type="button"
            onClick={() => { setPricingInfo(null); setPriceMethod('manual') }}
            className="flex min-h-[64px] items-center gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest p-4 text-left font-label text-label-md text-on-surface hover:bg-surface-container-low"
          >
            <span className="material-symbols-outlined text-title-lg text-primary" aria-hidden="true">edit</span>
            <span className="flex flex-col">
              <span>{t("I'll decide the price myself")}</span>
              <span className="font-body text-sm text-on-surface-variant">{t('Enter any price you choose.')}</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setPriceMethod('ai')}
            className="flex min-h-[64px] items-center gap-3 rounded-lg bg-primary p-4 text-left font-label text-label-md text-on-primary hover:opacity-95"
          >
            <span className="material-symbols-outlined text-title-lg" aria-hidden="true">auto_awesome</span>
            <span className="flex flex-col">
              <span>{t('Help me calculate a fair price')}</span>
              <span className="font-body text-sm text-primary-container">
                {t('Your photo will be sent to AI for material suggestions. It may be wrong.')}
              </span>
            </span>
          </button>
        </section>
      )}

      {priceMethod === 'ai' && imageFile && (
        <PricingAssistant
          image={imageFile}
          onComplete={finishPricing}
          onCancel={() => {
            setPricingInfo(null)
            setPriceMethod('manual')
          }}
        />
      )}

      {showPrice && (
        <div className="flex flex-col gap-2">
          <Label text={t('What amount does this price cover? (optional)')}>
            <input
              name="packSize"
              type="text"
              maxLength={60}
              value={packSize}
              onChange={(event) => setPackSize(event.target.value)}
              placeholder={t('For example: 500 g jar, 250 ml bottle, pack of 3')}
              className={inputClass}
            />
          </Label>
          <p className="font-body text-sm text-on-surface-variant">
            {t('Leave this empty if the price is for one item. Buyers can choose how many packs they want.')}
          </p>
          <Label text={t('Selling price (NPR) per {{packSize}}', { packSize: packSize.trim() || t('item') })}>
            <input
              name="price"
              type="number"
              min="0"
              step="any"
              required
              inputMode="decimal"
              value={price}
              onChange={(event) => {
                setPrice(event.target.value)
                if (pricingInfo) {
                  setPricingInfo((current) => ({ ...current, finalDecision: 'changed' }))
                }
              }}
              className={inputClass}
            />
          </Label>
          {!listing && !imageFile && (
            <p className="font-body text-sm text-on-surface-variant">
              {t('You can add a photo for AI help, or set your price yourself now.')}
            </p>
          )}
          {pricingInfo && (
            <div className="rounded-lg bg-primary-container p-4 font-body text-body-md text-on-primary-container">
              <p>{t('AI suggested {{price}} NPR.', { price: formatNumber(pricingInfo.suggestedPriceNpr) })}</p>
              <p>{t('Estimated cost to make: {{cost}} NPR.', { cost: formatNumber(pricingInfo.totalCostNpr) })}</p>
              <p className="mt-1 text-sm">
                {pricingInfo.finalDecision === 'accepted'
                  ? t('You accepted the suggested price. You can still change it.')
                  : t('You chose to set the final price yourself.')}
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 font-body text-body-md text-error">{error}</p>
      )}

      <div className="flex flex-wrap gap-3 border-t border-outline-variant pt-5">
        <button
          type="submit"
          disabled={!canSubmit}
          className="min-h-11 rounded-lg bg-primary px-5 font-label text-label-md text-on-primary shadow-sm transition-colors hover:opacity-90 disabled:opacity-70"
        >
          {saving ? t('Saving...') : listing ? t('Save changes') : t('Publish listing')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="min-h-11 rounded-lg border border-outline-variant px-5 font-label text-label-md text-primary transition-colors hover:bg-surface-container-low"
        >
          {t('Cancel')}
        </button>
      </div>
    </form>
  )
}