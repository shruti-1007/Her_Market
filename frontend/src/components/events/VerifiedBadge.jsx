import { useTranslation } from 'react-i18next'

export default function VerifiedBadge({ className = '' }) {
  const { t } = useTranslation()
  return (
    <span className={`inline-flex items-center gap-1 font-label text-label-md text-success ${className}`}>
      <span className="material-symbols-outlined text-title-md" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">
        verified
      </span>
      {t('Verified')}
    </span>
  )
}