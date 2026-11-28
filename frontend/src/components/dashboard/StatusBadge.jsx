import { useTranslation } from 'react-i18next'

const styles = {
  pending: 'bg-amber-100 text-amber-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  available: 'bg-green-100 text-green-800',
  unavailable: 'bg-gray-200 text-gray-700',
  verified: 'bg-green-100 text-green-800',
}

export default function StatusBadge({ value }) {
  const { t } = useTranslation()
  const labels = {
    pending: t('Pending'),
    accepted: t('Accepted'),
    rejected: t('Rejected'),
    available: t('Available'),
    unavailable: t('Unavailable'),
    verified: t('Verified'),
  }
  return (
    <span className={`rounded-full px-3 py-1 font-label text-label-md capitalize ${styles[value] || ''}`}>
      {labels[value] || value}
    </span>
  )
}
